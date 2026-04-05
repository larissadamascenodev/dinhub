import { supabase } from "@/integrations/supabase/client";
import { getRecurringForMonth } from "@/services/recurringService";

export interface FinancialSummary {
  income: number;
  expense: number;
  paidIncome: number;
  paidExpense: number;
  balance: number;
  predictedBalance: number;
  previousMonthEndingBalance: number;
  accountBalance: number;
  isFutureMonth: boolean;
  isPastMonth: boolean;
  dailyAverageExpense: number;
  dailyAverageIncome: number;
  status: "safe" | "warning" | "danger";
  todayExpenses: number;
  projection: {
    nextMonthBalance: number;
    avgIncome3m: number;
    avgExpense3m: number;
  };
}

export interface RawTransaction {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  type: string;
  status: string;
  account_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  payment_method?: string;
  credit_card_id?: string | null;
  recurrence_type?: string;
}

export interface RawEvent {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

function getMonthRange(month: number, year: number) {
  const start = new Date(year, month, 1).toISOString().split("T")[0];
  const end = new Date(year, month + 1, 0).toISOString().split("T")[0];
  return { start, end };
}

async function fetchMonthTransactions(month: number, year: number, opts?: { skipMaterialize?: boolean }) {
  const { start, end } = getMonthRange(month, year);
  const dbMonth = month + 1; // DB stores 1-based months

  // Materialize recurring CC subscription items into invoices for this month
  // Skip for historical months to avoid unnecessary work
  if (!opts?.skipMaterialize) {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user?.id) {
      await supabase.rpc("materialize_recurring_invoice_items", {
        p_user_id: userData.user.id,
        p_month: dbMonth,
        p_year: year,
      });
    }
  }

  const [{ data, error }, recurringTxs, { data: invoicesData }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    getRecurringForMonth(month, year),
    // Fetch invoices for this month to filter out CC transactions with no invoice items
    supabase
      .from("invoices")
      .select("credit_card_id, total_amount")
      .eq("month", dbMonth)
      .eq("year", year),
  ]);

  if (error) throw error;

  let baseTxs = (data ?? []) as RawTransaction[];

  // Filter out credit card transactions for months where no invoice items exist
  const cardsWithInvoice = new Set(
    (invoicesData ?? [])
      .filter((inv: any) => Number(inv.total_amount) > 0)
      .map((inv: any) => inv.credit_card_id)
  );
  baseTxs = baseTxs.filter((t) => {
    if (t.payment_method === "cartao" && t.credit_card_id) {
      return cardsWithInvoice.has(t.credit_card_id);
    }
    return true;
  });

  // Filter out fixa transactions that have been excluded for this month
  const fixaIds = baseTxs.filter((t) => t.recurrence_type === "fixa").map((t) => t.id);
  if (fixaIds.length > 0) {
    const { data: exclusions } = await supabase
      .from("recurring_exclusions")
      .select("transaction_id")
      .eq("month", month)
      .eq("year", year)
      .in("transaction_id", fixaIds);
    if (exclusions && exclusions.length > 0) {
      const excludedIds = new Set(exclusions.map((e: any) => e.transaction_id));
      baseTxs = baseTxs.filter((t) => !excludedIds.has(t.id));
    }
  }

  // Materialize recurring transactions with adjusted date for this month
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const materializedRecurring = recurringTxs.map((t: any) => ({
    ...t,
    date: `${year}-${String(month + 1).padStart(2, "0")}-${String(new Date(t.date).getDate()).padStart(2, "0")}`,
    status: "pendente",
    _isRecurringMaterialized: true,
  })) as RawTransaction[];

  return [...baseTxs, ...materializedRecurring];
}

async function fetchMonthEvents(month: number, year: number) {
  const { start, end } = getMonthRange(month, year);
  const { data, error } = await supabase
    .from("finance_events")
    .select("*")
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as RawEvent[];
}

async function fetchTotalAccountBalance(): Promise<number> {
  // Use current_balance directly — it's the source of truth, maintained by
  // the update_account_balance trigger (for transactions) and the pay-invoice
  // edge function (for credit card invoice payments).
  const { data: accounts } = await supabase
    .from("accounts")
    .select("current_balance, type")
    .neq("type", "investment");

  return (accounts ?? []).reduce(
    (sum, acc) => sum + Number(acc.current_balance), 0
  );
}

/**
 * Aggregate ALL transactions for income/expense totals,
 * but only PAID transactions for balance.
 * Credit card transactions are EXCLUDED — their impact is handled via invoices.
 */
function aggregate(transactions: RawTransaction[]) {
  let income = 0;
  let expense = 0;
  let paidIncome = 0;
  let paidExpense = 0;
  for (const t of transactions) {
    const amt = Number(t.amount);
    // Skip transfers and investments — they don't affect income/expense
    if (t.type === "transferencia" || t.type === "investimento") continue;
    // Skip credit card transactions — their cost is represented by invoice totals
    if (t.payment_method === "cartao") continue;
    if (t.type === "receita") {
      income += amt;
      if (t.status === "pago") paidIncome += amt;
    } else {
      expense += amt;
      if (t.status === "pago") paidExpense += amt;
    }
  }
  return { income, expense, paidIncome, paidExpense, balance: paidIncome - paidExpense };
}

/** Fetch invoice totals for a given month and return expense/paidExpense from invoices */
async function fetchInvoiceTotalsForMonth(month: number, year: number) {
  const dbMonth = month + 1;
  const { data } = await supabase
    .from("invoices")
    .select("total_amount, is_paid, paid_amount")
    .eq("month", dbMonth)
    .eq("year", year);

  let invoiceExpense = 0;
  let invoicePaidExpense = 0;
  for (const inv of data ?? []) {
    const total = Number(inv.total_amount);
    if (total <= 0) continue;
    invoiceExpense += total;
    // Partial payments are cash advances only — invoice expense is only
    // considered "paid" when the invoice is fully settled (is_paid = true).
    if (inv.is_paid) {
      invoicePaidExpense += total;
    }
  }
  return { invoiceExpense, invoicePaidExpense };
}

async function fetchHistoricalAverages(
  currentMonth: number,
  currentYear: number,
  months: number = 3
): Promise<{ avgIncome: number; avgExpense: number }> {
  let totalIncome = 0;
  let totalExpense = 0;
  let validMonths = 0;

  for (let i = 1; i <= months; i++) {
    let m = currentMonth - i;
    let y = currentYear;
    while (m < 0) {
      m += 12;
      y -= 1;
    }

    const [txs, inv] = await Promise.all([
      fetchMonthTransactions(m, y),
      fetchInvoiceTotalsForMonth(m, y),
    ]);
    if (txs.length > 0 || inv.invoiceExpense > 0) {
      const agg = aggregate(txs);
      totalIncome += agg.paidIncome;
      totalExpense += agg.paidExpense + inv.invoicePaidExpense;
      validMonths++;
    }
  }

  return {
    avgIncome: validMonths > 0 ? totalIncome / validMonths : 0,
    avgExpense: validMonths > 0 ? totalExpense / validMonths : 0,
  };
}

function computeStatus(
  currentExpense: number,
  avgExpense: number
): "safe" | "warning" | "danger" {
  if (avgExpense === 0) return "safe";
  const ratio = currentExpense / avgExpense;
  if (ratio > 1.3) return "danger";
  if (ratio > 1.1) return "warning";
  return "safe";
}

export async function getFinancialSummary(
  month: number,
  year: number
): Promise<{
  summary: FinancialSummary;
  transactions: RawTransaction[];
  events: RawEvent[];
}> {
  const [transactions, events, accountBalance, historical, invoiceTotals] = await Promise.all([
    fetchMonthTransactions(month, year),
    fetchMonthEvents(month, year),
    fetchTotalAccountBalance(),
    fetchHistoricalAverages(month, year, 3),
    fetchInvoiceTotalsForMonth(month, year),
  ]);

  // income/expense from regular (non-CC) transactions
  const agg = aggregate(transactions);
  // Merge invoice totals into the expense figures
  const income = agg.income;
  const expense = agg.expense + invoiceTotals.invoiceExpense;
  const paidIncome = agg.paidIncome;
  const paidExpense = agg.paidExpense + invoiceTotals.invoicePaidExpense;
  const balance = paidIncome - paidExpense;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const currentCalendarMonth = today.getMonth();
  const currentCalendarYear = today.getFullYear();
  const isCurrentMonth = currentCalendarMonth === month && currentCalendarYear === year;
  const isFutureMonth = year > currentCalendarYear || (year === currentCalendarYear && month > currentCalendarMonth);
  const isPastMonth = year < currentCalendarYear || (year === currentCalendarYear && month < currentCalendarMonth);

  // Today's paid expenses only (regular transactions, CC not included)
  const todayExpenses = transactions
    .filter((t) => t.type === "despesa" && t.status === "pago" && t.date === todayStr && t.payment_method !== "cartao")
    .reduce((s, t) => s + Number(t.amount), 0);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const elapsedDays = isCurrentMonth
    ? Math.max(today.getDate(), 1)
    : daysInMonth;
  const dailyAverageExpense = elapsedDays > 0 ? paidExpense / elapsedDays : 0;
  const dailyAverageIncome = elapsedDays > 0 ? paidIncome / elapsedDays : 0;

  // ── Compute previousMonthEndingBalance ──
  // accountBalance = sum of current_balance from all non-investment accounts
  // For current month: previousMonthEnding = accountBalance - currentMonthPaidBalance
  let previousMonthEndingBalance = 0;

  if (isCurrentMonth) {
    previousMonthEndingBalance = accountBalance - balance;
  } else if (isFutureMonth) {
    let accumulated = accountBalance;
    
    // Add current calendar month's pending (regular + unpaid invoices)
    if (!(currentCalendarMonth === month && currentCalendarYear === year)) {
      const currentMonthTxs = await fetchMonthTransactions(currentCalendarMonth, currentCalendarYear);
      const currentAgg = aggregate(currentMonthTxs);
      const currentInv = await fetchInvoiceTotalsForMonth(currentCalendarMonth, currentCalendarYear);
      const pendingIncome = currentAgg.income - currentAgg.paidIncome;
      const pendingExpense = (currentAgg.expense + currentInv.invoiceExpense) - (currentAgg.paidExpense + currentInv.invoicePaidExpense);
      accumulated += pendingIncome - pendingExpense;
    }
    
    // Chain through intermediate months
    let chainMonth = currentCalendarMonth + 1;
    let chainYear = currentCalendarYear;
    while (chainMonth > 11) { chainMonth -= 12; chainYear++; }
    
    while (chainYear < year || (chainYear === year && chainMonth < month)) {
      const intermediateTxs = await fetchMonthTransactions(chainMonth, chainYear);
      const intAgg = aggregate(intermediateTxs);
      const intInv = await fetchInvoiceTotalsForMonth(chainMonth, chainYear);
      accumulated += intAgg.income - (intAgg.expense + intInv.invoiceExpense);
      chainMonth++;
      if (chainMonth > 11) { chainMonth = 0; chainYear++; }
    }
    
    previousMonthEndingBalance = accumulated;
  } else {
    // Past month
    let paidAfter = 0;
    let chainMonth = month + 1;
    let chainYear = year;
    if (chainMonth > 11) { chainMonth = 0; chainYear++; }

    while (chainYear < currentCalendarYear || (chainYear === currentCalendarYear && chainMonth <= currentCalendarMonth)) {
      const futureTxs = await fetchMonthTransactions(chainMonth, chainYear);
      const futAgg = aggregate(futureTxs);
      const futInv = await fetchInvoiceTotalsForMonth(chainMonth, chainYear);
      paidAfter += futAgg.paidIncome - (futAgg.paidExpense + futInv.invoicePaidExpense);
      chainMonth++;
      if (chainMonth > 11) { chainMonth = 0; chainYear++; }
    }

    previousMonthEndingBalance = (accountBalance - paidAfter) - balance;
  }

  // ── Predicted balance = previousMonthEnding + month's total balance (all statuses) ──
  const monthFullBalance = income - expense;
  const predictedBalance = previousMonthEndingBalance + monthFullBalance;

  const nextMonthBalance = historical.avgIncome - historical.avgExpense;
  const status = computeStatus(paidExpense, historical.avgExpense);

  return {
    summary: {
      income,
      expense,
      paidIncome,
      paidExpense,
      balance,
      predictedBalance,
      previousMonthEndingBalance,
      accountBalance,
      isFutureMonth,
      isPastMonth,
      dailyAverageExpense,
      dailyAverageIncome,
      status,
      todayExpenses,
      projection: {
        nextMonthBalance,
        avgIncome3m: historical.avgIncome,
        avgExpense3m: historical.avgExpense,
      },
    },
    transactions,
    events,
  };
}

export interface DailyBehavior {
  today_spent: number;
  average: number;
  status: "controlled" | "normal" | "above_average";
}

export function computeDailyBehavior(
  todaySpent: number,
  dailyAverage: number
): DailyBehavior {
  let status: DailyBehavior["status"];

  if (dailyAverage === 0) {
    status = todaySpent === 0 ? "controlled" : "above_average";
  } else {
    const ratio = todaySpent / dailyAverage;
    if (ratio > 1.15) {
      status = "above_average";
    } else if (ratio >= 0.85) {
      status = "normal";
    } else {
      status = "controlled";
    }
  }

  return { today_spent: todaySpent, average: dailyAverage, status };
}

export async function getMonthHistory(month: number, year: number) {
  const [transactions, inv] = await Promise.all([
    fetchMonthTransactions(month, year),
    fetchInvoiceTotalsForMonth(month, year),
  ]);
  const agg = aggregate(transactions);
  return {
    income: agg.income,
    expense: agg.expense + inv.invoiceExpense,
    balance: agg.balance - inv.invoicePaidExpense,
    month,
    year,
  };
}
