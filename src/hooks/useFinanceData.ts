import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getFinancialSummary, computeDailyBehavior } from "@/lib/financeEngine";
import type { DashboardData, Transaction, FinanceEvent } from "@/types/finance";

const EMPTY_DATA: DashboardData = {
  saldoAtual: 0,
  saldoPrevisto: 0,
  previousMonthEndingBalance: 0,
  isFutureMonth: false,
  isPastMonth: false,
  receitas: 0,
  despesas: 0,
  balanco: 0,
  gastosHoje: 0,
  mediaGastosDiarios: 0,
  status: "safe",
  dailyBehavior: { today_spent: 0, average: 0, status: "controlled" },
  projection: { nextMonthBalance: 0, avgIncome3m: 0, avgExpense3m: 0 },
  transactions: [],
  categories: [],
  events: [],
  pendingTransactions: [],
};

const CAT_COLORS = [
  "hsl(0 84% 60%)", "hsl(25 95% 53%)", "hsl(340 75% 55%)",
  "hsl(270 60% 55%)", "hsl(210 90% 55%)", "hsl(45 90% 55%)",
];

const CAT_ICONS: Record<string, string> = {
  Alimentação: "🍽️", Transporte: "🚗", Saúde: "❤️",
  Assinaturas: "📦", Lazer: "🎮", Moradia: "🏠",
};

// Module-level cache to persist data across component remounts
const dataCache: Record<string, DashboardData> = {};
const prefetchingSet = new Set<string>();

function offsetMonth(month: number, year: number, offset: number) {
  const d = new Date(year, month + offset, 1);
  return { month: d.getMonth(), year: d.getFullYear() };
}

/** Build DashboardData from the finance engine (pure async, no React state) */
async function buildDashboardData(month: number, year: number): Promise<DashboardData> {
  const { summary, transactions: rawTxs, events: rawEvents } =
    await getFinancialSummary(month, year);

  const paidTxs = rawTxs.filter((t) => t.status === "pago");
  const pendingTxs = rawTxs.filter((t) => t.status === "pendente");

  const transactions: Transaction[] = paidTxs.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    date: new Date(t.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
    amount: Number(t.amount),
    type: t.type as Transaction["type"],
    status: "pago" as const,
  }));

  const pendingAsEvents: FinanceEvent[] = pendingTxs.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    date: new Date(t.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
    rawDate: t.date,
    amount: Number(t.amount),
    status: "pendente" as const,
    type: t.type as "receita" | "despesa",
    isTransaction: true,
  }));

  const events: FinanceEvent[] = rawEvents.map((e) => ({
    id: e.id,
    name: e.name,
    category: e.category,
    date: new Date(e.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
    rawDate: e.date,
    amount: Number(e.amount),
    status: e.status as FinanceEvent["status"],
    isTransaction: false,
  }));

  const allEvents = [...events, ...pendingAsEvents].sort((a, b) => parseInt(a.date) - parseInt(b.date));

  const catMap = new Map<string, number>();
  paidTxs
    .filter((t) => t.type === "despesa")
    .forEach((t) => catMap.set(t.category, (catMap.get(t.category) ?? 0) + Number(t.amount)));

  const categories = Array.from(catMap.entries()).map(([name, amount], i) => ({
    name,
    amount,
    color: CAT_COLORS[i % CAT_COLORS.length],
    icon: CAT_ICONS[name] ?? "📋",
  }));

  const saldoAtual = summary.isFutureMonth ? summary.previousMonthEndingBalance : summary.accountBalance;

  return {
    saldoAtual,
    saldoPrevisto: summary.predictedBalance,
    previousMonthEndingBalance: summary.previousMonthEndingBalance,
    isFutureMonth: summary.isFutureMonth,
    isPastMonth: summary.isPastMonth,
    receitas: summary.income,
    despesas: summary.expense,
    balanco: summary.balance,
    gastosHoje: summary.todayExpenses,
    mediaGastosDiarios: summary.dailyAverageExpense,
    status: summary.status,
    dailyBehavior: computeDailyBehavior(summary.todayExpenses, summary.dailyAverageExpense),
    projection: summary.projection,
    transactions,
    categories,
    events: allEvents,
    pendingTransactions: pendingTxs.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      date: t.date,
      amount: Number(t.amount),
      type: t.type as Transaction["type"],
      status: "pendente" as const,
    })),
  };
}

/** Prefetch a month into cache silently */
function prefetchMonth(userId: string, month: number, year: number) {
  const key = `${userId}-${month}-${year}`;
  if (dataCache[key] || prefetchingSet.has(key)) return;
  prefetchingSet.add(key);
  buildDashboardData(month, year)
    .then((result) => { dataCache[key] = result; })
    .catch(() => { /* silent */ })
    .finally(() => { prefetchingSet.delete(key); });
}

export function useFinanceData(selectedMonth: number, selectedYear: number) {
  const { user } = useAuth();
  const cacheKey = `${user?.id ?? ""}-${selectedMonth}-${selectedYear}`;

  const cached = dataCache[cacheKey];
  const [data, setData] = useState<DashboardData>(cached ?? EMPTY_DATA);
  const [loading, setLoading] = useState(!cached);

  // Sync cache on key change — keep previous data visible while fetching
  useEffect(() => {
    const c = dataCache[cacheKey];
    if (c) {
      setData(c);
      setLoading(false);
    }
  }, [cacheKey]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const newData = await buildDashboardData(selectedMonth, selectedYear);
      dataCache[cacheKey] = newData;
      setData(newData);
    } catch (err) {
      console.error("Finance engine error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedMonth, selectedYear, cacheKey]);

  // Fetch current month + prefetch adjacent months
  useEffect(() => {
    fetchData();

    // Prefetch nearby months (prev 2 + next 3) after a short delay
    if (!user) return;
    const timer = setTimeout(() => {
      for (const offset of [-2, -1, 1, 2, 3]) {
        const m = offsetMonth(selectedMonth, selectedYear, offset);
        prefetchMonth(user.id, m.month, m.year);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData, user, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("finance-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${user.id}` }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "finance_events", filter: `user_id=eq.${user.id}` }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "accounts", filter: `user_id=eq.${user.id}` }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchData]);

  return { data, loading, refetch: fetchData };
}
