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

async function fetchMonthTransactions(month: number, year: number) {
  const { start, end } = getMonthRange(month, year);
  const [{ data, error }, recurringTxs] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: false }),
    getRecurringForMonth(month, year),
  ]);

  if (error) throw error;

  const baseTxs = (data ?? []) as RawTransaction[];

  // Materialize recurring transactions with adjusted date for this month
  // Force status to "pendente" for future months (transactions can't be paid in advance)
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const isFutureMonth = year > currentYear || (year === currentYear && month > currentMonth);

  const materializedRecurring = recurringTxs.map((t: any) => ({
    ...t,
    date: `${year}-${String(month + 1).padStart(2, "0")}-${String(new Date(t.date).getDate()).padStart(2, "0")}`,
    status: isFutureMonth ? "pendente" : t.status,
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
  // Sum initial balances from non-investment accounts only (investments are patrimônio, not saldo disponível)
  const { data: accounts } = await supabase
    .from("accounts")
    .select("initial_balance, type")
    .neq("type", "investment");

  const initialBalance = (accounts ?? []).reduce(
    (sum, acc) => sum + Number(acc.initial_balance), 0
  );

  // Sum all paid transactions ever (not month-specific) to get cumulative balance
  const { data: paidReceitas } = await supabase
    .from("transactions")
    .select("amount")
    .eq("type", "receita")
    .eq("status", "pago");

  const { data: paidDespesas } = await supabase
    .from("transactions")
    .select("amount")
    .eq("type", "despesa")
    .eq("status", "pago");

  const totalReceitas = (paidReceitas ?? []).reduce((s, t) => s + Number(t.amount), 0);
  const totalDespesas = (paidDespesas ?? []).reduce((s, t) => s + Number(t.amount), 0);

  return initialBalance + totalReceitas - totalDespesas;
}

/**
 * Aggregate ALL transactions for income/expense totals,
 * but only PAID transactions for balance.
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

    const txs = await fetchMonthTransactions(m, y);
    if (txs.length > 0) {
      const agg = aggregate(txs);
      totalIncome += agg.paidIncome;
      totalExpense += agg.paidExpense;
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
  const [transactions, events, accountBalance, historical] = await Promise.all([
    fetchMonthTransactions(month, year),
    fetchMonthEvents(month, year),
    fetchTotalAccountBalance(),
    fetchHistoricalAverages(month, year, 3),
  ]);

  // income/expense = ALL transactions, balance = only paid
  const { income, expense, paidIncome, paidExpense, balance } = aggregate(transactions);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const currentCalendarMonth = today.getMonth();
  const currentCalendarYear = today.getFullYear();
  const isCurrentMonth = currentCalendarMonth === month && currentCalendarYear === year;
  const isFutureMonth = year > currentCalendarYear || (year === currentCalendarYear && month > currentCalendarMonth);
  const isPastMonth = year < currentCalendarYear || (year === currentCalendarYear && month < currentCalendarMonth);

  // Today's paid expenses only
  const todayExpenses = transactions
    .filter((t) => t.type === "despesa" && t.status === "pago" && t.date === todayStr)
    .reduce((s, t) => s + Number(t.amount), 0);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const elapsedDays = isCurrentMonth
    ? Math.max(today.getDate(), 1)
    : daysInMonth;
  const dailyAverageExpense = elapsedDays > 0 ? paidExpense / elapsedDays : 0;
  const dailyAverageIncome = elapsedDays > 0 ? paidIncome / elapsedDays : 0;

  // ── Compute previousMonthEndingBalance ──
  // accountBalance = cumulative balance of ALL paid transactions ever (from default account)
  // For current month: previousMonthEnding = accountBalance - currentMonthPaidBalance
  // For future months: chain from accountBalance through intermediate months
  // For past months: we'd need to subtract future paid transactions (approximate with accountBalance)
  let previousMonthEndingBalance = 0;

  if (isCurrentMonth) {
    previousMonthEndingBalance = accountBalance - balance; // balance = paidIncome - paidExpense of this month
  } else if (isFutureMonth) {
    // Start from account balance, add current month's pending, then chain through intermediate months
    let accumulated = accountBalance;
    
    // Add current calendar month's pending transactions
    if (!(currentCalendarMonth === month && currentCalendarYear === year)) {
      const currentMonthTxs = await fetchMonthTransactions(currentCalendarMonth, currentCalendarYear);
      const currentAgg = aggregate(currentMonthTxs);
      // accountBalance already has current month's paid. Add pending to project end of current month.
      const pendingIncome = currentAgg.income - currentAgg.paidIncome;
      const pendingExpense = currentAgg.expense - currentAgg.paidExpense;
      accumulated += pendingIncome - pendingExpense;
    }
    
    // Chain through intermediate months (between current+1 and target-1)
    let chainMonth = currentCalendarMonth + 1;
    let chainYear = currentCalendarYear;
    while (chainMonth > 11) { chainMonth -= 12; chainYear++; }
    
    while (chainYear < year || (chainYear === year && chainMonth < month)) {
      const intermediateTxs = await fetchMonthTransactions(chainMonth, chainYear);
      const intAgg = aggregate(intermediateTxs);
      accumulated += intAgg.income - intAgg.expense; // all income - all expense for projected months
      chainMonth++;
      if (chainMonth > 11) { chainMonth = 0; chainYear++; }
    }
    
    previousMonthEndingBalance = accumulated;
  } else {
    // Past month: approximate using accountBalance minus all paid transactions from months after this one
    previousMonthEndingBalance = accountBalance - balance; // simplified approximation
  }

  // ── Predicted balance = previousMonthEnding + month's total balance (all statuses) ──
  const monthFullBalance = income - expense; // all statuses
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
  const transactions = await fetchMonthTransactions(month, year);
  const agg = aggregate(transactions);
  return { income: agg.income, expense: agg.expense, balance: agg.balance, month, year };
}
