import { supabase } from "@/integrations/supabase/client";

export interface FinancialSummary {
  income: number;
  expense: number;
  balance: number;
  predictedBalance: number;
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

/**
 * Fetch all transactions for a given month/year (RLS handles user filtering)
 */
async function fetchMonthTransactions(month: number, year: number) {
  const { start, end } = getMonthRange(month, year);
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as RawTransaction[];
}

/**
 * Fetch events for a given month/year
 */
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

/**
 * Fetch default account balance
 */
async function fetchDefaultAccountBalance(): Promise<number> {
  const { data } = await supabase
    .from("accounts")
    .select("current_balance")
    .eq("is_default", true)
    .limit(1);

  return Number(data?.[0]?.current_balance ?? 0);
}

/**
 * Calculate income/expense aggregations from raw transactions
 */
function aggregate(transactions: RawTransaction[]) {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    const amt = Number(t.amount);
    if (t.type === "income" || t.type === "receita") {
      income += amt;
    } else {
      expense += amt;
    }
  }
  return { income, expense, balance: income - expense };
}

/**
 * Fetch average income/expense over the last N months for projections
 */
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
      totalIncome += agg.income;
      totalExpense += agg.expense;
      validMonths++;
    }
  }

  return {
    avgIncome: validMonths > 0 ? totalIncome / validMonths : 0,
    avgExpense: validMonths > 0 ? totalExpense / validMonths : 0,
  };
}

/**
 * Determine financial health status based on current vs historical spending
 */
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

/**
 * Central financial summary function
 */
export async function getFinancialSummary(
  month: number,
  year: number
): Promise<{
  summary: FinancialSummary;
  transactions: RawTransaction[];
  events: RawEvent[];
}> {
  // Fetch current month data + historical averages + account balance in parallel
  const [transactions, events, accountBalance, historical] = await Promise.all([
    fetchMonthTransactions(month, year),
    fetchMonthEvents(month, year),
    fetchDefaultAccountBalance(),
    fetchHistoricalAverages(month, year, 3),
  ]);

  const { income, expense, balance } = aggregate(transactions);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const isCurrentMonth =
    today.getMonth() === month && today.getFullYear() === year;

  // Today's expenses
  const todayExpenses = transactions
    .filter(
      (t) =>
        (t.type === "expense" || t.type === "despesa") && t.date === todayStr
    )
    .reduce((s, t) => s + Number(t.amount), 0);

  // Daily average expense (based on elapsed days)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const elapsedDays = isCurrentMonth
    ? Math.max(today.getDate(), 1)
    : daysInMonth;
  const dailyAverageExpense = elapsedDays > 0 ? expense / elapsedDays : 0;
  const dailyAverageIncome = elapsedDays > 0 ? income / elapsedDays : 0;

  // Predicted balance: current balance + future transactions this month
  let predictedBalance = balance;
  if (isCurrentMonth) {
    // Include pending events as predicted future transactions
    const futureEvents = events.filter(
      (e) => e.date > todayStr && e.status === "pendente"
    );
    const futureEventBalance = futureEvents.reduce((s, e) => {
      // Negative for expenses, positive for income (use category heuristic or amount sign)
      return s - Number(e.amount);
    }, 0);
    predictedBalance = balance + futureEventBalance;
  }

  // Projection for next month
  const nextMonthBalance = historical.avgIncome - historical.avgExpense;

  // Status
  const status = computeStatus(expense, historical.avgExpense);

  return {
    summary: {
      income,
      expense,
      balance,
      predictedBalance,
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

/**
 * Daily behavior analysis
 * Returns today's spending, daily average, and a behavioral status
 */
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

  return {
    today_spent: todaySpent,
    average: dailyAverage,
    status,
  };
}

/**
 * Get summary for a past month (simplified)
 */
export async function getMonthHistory(month: number, year: number) {
  const transactions = await fetchMonthTransactions(month, year);
  const { income, expense, balance } = aggregate(transactions);
  return { income, expense, balance, month, year };
}
