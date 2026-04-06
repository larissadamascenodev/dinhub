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

async function fetchMonthTransactions(month: number, year: number, opts?: { skipMaterialize?: boolean; userId?: string }) {
  const { start, end } = getMonthRange(month, year);
  const dbMonth = month + 1; // DB stores 1-based months

  // Materialize recurring CC subscription items into invoices for this month
  // We run materialize in parallel with the main queries since the main query
  // fetches non-CC transactions too and materialize only affects invoice_items.
  const materializePromise = (!opts?.skipMaterialize && opts?.userId)
    ? supabase.rpc("materialize_recurring_invoice_items", {
        p_user_id: opts.userId,
        p_month: dbMonth,
        p_year: year,
      }).then(() => {})
    : Promise.resolve();

  const [{ data, error }, recurringTxs, { data: invoicesData }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    getRecurringForMonth(month, year),
    supabase
      .from("invoices")
      .select("credit_card_id, total_amount")
      .eq("month", dbMonth)
      .eq("year", year),
  ]);

  // Wait for materialize to finish (it may have already)
  await materializePromise;

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

async function fetchTotalAccountBalance(month?: number, year?: number): Promise<number> {
  const { data: accounts } = await supabase
    .from("accounts")
    .select("current_balance, initial_balance, type, created_at")
    .neq("type", "investment");

  return (accounts ?? []).reduce((sum, acc) => {
    const currentBalance = Number(acc.current_balance ?? 0);

    if (month === undefined || year === undefined) {
      return sum + currentBalance;
    }

    const createdAt = new Date(acc.created_at);
    const createdMonth = createdAt.getMonth();
    const createdYear = createdAt.getFullYear();
    const isBeforeCreation = year < createdYear || (year === createdYear && month < createdMonth);

    if (isBeforeCreation) {
      return sum + (currentBalance - Number(acc.initial_balance ?? 0));
    }

    return sum + currentBalance;
  }, 0);
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
  // Build month/year pairs
  const periods: { m: number; y: number }[] = [];
  for (let i = 1; i <= months; i++) {
    let m = currentMonth - i;
    let y = currentYear;
    while (m < 0) { m += 12; y -= 1; }
    periods.push({ m, y });
  }

  // Fetch ALL historical months in parallel (skip materialize for historical)
  const results = await Promise.all(
    periods.map(({ m, y }) =>
      Promise.all([
        fetchMonthTransactions(m, y, { skipMaterialize: true }),
        fetchInvoiceTotalsForMonth(m, y),
      ])
    )
  );

  let totalIncome = 0;
  let totalExpense = 0;
  let validMonths = 0;

  for (const [txs, inv] of results) {
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
  year: number,
  options?: { includeHistorical?: boolean; userId?: string }
): Promise<{
  summary: FinancialSummary;
  transactions: RawTransaction[];
  events: RawEvent[];
}> {
  const includeHistorical = options?.includeHistorical ?? true;
  const userId = options?.userId;

  const [transactions, events, accountBalance, invoiceTotals, historical] = await Promise.all([
    fetchMonthTransactions(month, year, { userId }),
    fetchMonthEvents(month, year),
    fetchTotalAccountBalance(),
    fetchInvoiceTotalsForMonth(month, year),
    includeHistorical
      ? fetchHistoricalAverages(month, year, 3)
      : Promise.resolve({ avgIncome: 0, avgExpense: 0 }),
  ]);

  const agg = aggregate(transactions);
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

  const todayExpenses = transactions
    .filter((t) => t.type === "despesa" && t.status === "pago" && t.date === todayStr && t.payment_method !== "cartao")
    .reduce((s, t) => s + Number(t.amount), 0);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const elapsedDays = isCurrentMonth ? Math.max(today.getDate(), 1) : daysInMonth;
  const dailyAverageExpense = elapsedDays > 0 ? paidExpense / elapsedDays : 0;
  const dailyAverageIncome = elapsedDays > 0 ? paidIncome / elapsedDays : 0;

  let previousMonthEndingBalance = 0;

  if (isCurrentMonth) {
    previousMonthEndingBalance = accountBalance - balance;
  } else if (isFutureMonth) {
    let accumulated = accountBalance;
    const chainPeriods: { m: number; y: number }[] = [];

    if (!(currentCalendarMonth === month && currentCalendarYear === year)) {
      chainPeriods.push({ m: currentCalendarMonth, y: currentCalendarYear });
    }

    let cm = currentCalendarMonth + 1;
    let cy = currentCalendarYear;
    while (cm > 11) {
      cm -= 12;
      cy++;
    }
    while (cy < year || (cy === year && cm < month)) {
      chainPeriods.push({ m: cm, y: cy });
      cm++;
      if (cm > 11) {
        cm = 0;
        cy++;
      }
    }

    if (chainPeriods.length > 0) {
      const chainResults = await Promise.all(
        chainPeriods.map(({ m, y }) =>
          Promise.all([
            fetchMonthTransactions(m, y, { skipMaterialize: true }),
            fetchInvoiceTotalsForMonth(m, y),
          ])
        )
      );

      const [currentTxs, currentInv] = chainResults[0];
      if (!(currentCalendarMonth === month && currentCalendarYear === year)) {
        const currentAgg = aggregate(currentTxs);
        const pendingIncome = currentAgg.income - currentAgg.paidIncome;
        const pendingExpense = (currentAgg.expense + currentInv.invoiceExpense) - (currentAgg.paidExpense + currentInv.invoicePaidExpense);
        accumulated += pendingIncome - pendingExpense;
      }

      for (let i = (!(currentCalendarMonth === month && currentCalendarYear === year) ? 1 : 0); i < chainResults.length; i++) {
        const [intTxs, intInv] = chainResults[i];
        const intAgg = aggregate(intTxs);
        accumulated += intAgg.income - (intAgg.expense + intInv.invoiceExpense);
      }
    }

    previousMonthEndingBalance = accumulated;
  } else {
    const pastPeriods: { m: number; y: number }[] = [];
    let cm = month + 1;
    let cy = year;
    if (cm > 11) {
      cm = 0;
      cy++;
    }
    while (cy < currentCalendarYear || (cy === currentCalendarYear && cm <= currentCalendarMonth)) {
      pastPeriods.push({ m: cm, y: cy });
      cm++;
      if (cm > 11) {
        cm = 0;
        cy++;
      }
    }

    let paidAfter = 0;
    if (pastPeriods.length > 0) {
      const pastResults = await Promise.all(
        pastPeriods.map(({ m, y }) =>
          Promise.all([
            fetchMonthTransactions(m, y, { skipMaterialize: true }),
            fetchInvoiceTotalsForMonth(m, y),
          ])
        )
      );
      for (const [futureTxs, futInv] of pastResults) {
        const futAgg = aggregate(futureTxs);
        paidAfter += futAgg.paidIncome - (futAgg.paidExpense + futInv.invoicePaidExpense);
      }
    }

    previousMonthEndingBalance = (accountBalance - paidAfter) - balance;
  }

  const monthFullBalance = income - expense;
  const predictedBalance = previousMonthEndingBalance + monthFullBalance;
  const nextMonthBalance = historical.avgIncome - historical.avgExpense;
  const status = includeHistorical ? computeStatus(paidExpense, historical.avgExpense) : "safe";

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
