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
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as RawTransaction[];
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

async function fetchDefaultAccountBalance(): Promise<number> {
  const { data } = await supabase
    .from("accounts")
    .select("current_balance")
    .eq("is_default", true)
    .limit(1);

  return Number(data?.[0]?.current_balance ?? 0);
}

/**
 * Only count PAID transactions in balance
 */
function aggregate(transactions: RawTransaction[]) {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.status !== "pago") continue; // Skip pending/scheduled
    const amt = Number(t.amount);
    if (t.type === "receita") {
      income += amt;
    } else {
      expense += amt;
    }
  }
  return { income, expense, balance: income - expense };
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
    fetchDefaultAccountBalance(),
    fetchHistoricalAverages(month, year, 3),
  ]);

  // Only paid transactions count toward balance
  const { income, expense, balance } = aggregate(transactions);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const isCurrentMonth =
    today.getMonth() === month && today.getFullYear() === year;

  // Today's paid expenses only
  const todayExpenses = transactions
    .filter((t) => t.type === "despesa" && t.status === "pago" && t.date === todayStr)
    .reduce((s, t) => s + Number(t.amount), 0);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const elapsedDays = isCurrentMonth
    ? Math.max(today.getDate(), 1)
    : daysInMonth;
  const dailyAverageExpense = elapsedDays > 0 ? expense / elapsedDays : 0;
  const dailyAverageIncome = elapsedDays > 0 ? income / elapsedDays : 0;

  // Predicted balance includes pending transactions + pending events
  let predictedBalance = balance;
  if (isCurrentMonth) {
    // Pending transactions (scheduled but not paid)
    const pendingTxs = transactions.filter((t) => t.status === "pendente");
    for (const t of pendingTxs) {
      const amt = Number(t.amount);
      if (t.type === "receita") {
        predictedBalance += amt;
      } else {
        predictedBalance -= amt;
      }
    }

    // Pending finance_events
    const futureEvents = events.filter(
      (e) => e.date > todayStr && e.status === "pendente"
    );
    for (const e of futureEvents) {
      predictedBalance -= Number(e.amount);
    }
  }

  const nextMonthBalance = historical.avgIncome - historical.avgExpense;
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
  const { income, expense, balance } = aggregate(transactions);
  return { income, expense, balance, month, year };
}
