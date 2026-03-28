import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getFinancialSummary } from "@/lib/financeEngine";
import type { DashboardData, Transaction, FinanceEvent } from "@/types/finance";

const EMPTY_DATA: DashboardData = {
  saldoAtual: 0,
  saldoPrevisto: 0,
  receitas: 0,
  despesas: 0,
  balanco: 0,
  gastosHoje: 0,
  mediaGastosDiarios: 0,
  status: "safe",
  projection: { nextMonthBalance: 0, avgIncome3m: 0, avgExpense3m: 0 },
  transactions: [],
  categories: [],
  events: [],
};

const CAT_COLORS = [
  "hsl(0 84% 60%)", "hsl(25 95% 53%)", "hsl(340 75% 55%)",
  "hsl(270 60% 55%)", "hsl(210 90% 55%)", "hsl(45 90% 55%)",
];

const CAT_ICONS: Record<string, string> = {
  Alimentação: "🍽️", Transporte: "🚗", Saúde: "❤️",
  Assinaturas: "📦", Lazer: "🎮", Moradia: "🏠",
};

export function useFinanceData(selectedMonth: number, selectedYear: number) {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      const { summary, transactions: rawTxs, events: rawEvents } =
        await getFinancialSummary(selectedMonth, selectedYear);

      // Map transactions for UI
      const transactions: Transaction[] = rawTxs.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        date: new Date(t.date).toLocaleDateString("pt-BR", {
          day: "numeric",
          month: "short",
        }),
        amount: Number(t.amount),
        type: (t.type === "income" ? "receita" : t.type === "expense" ? "despesa" : t.type) as Transaction["type"],
      }));

      // Map events for UI
      const events: FinanceEvent[] = rawEvents.map((e) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        date: new Date(e.date).toLocaleDateString("pt-BR", {
          day: "numeric",
          month: "short",
        }),
        amount: Number(e.amount),
        status: e.status as FinanceEvent["status"],
      }));

      // Group expenses by category
      const catMap = new Map<string, number>();
      rawTxs
        .filter((t) => t.type === "expense" || t.type === "despesa")
        .forEach((t) => {
          catMap.set(t.category, (catMap.get(t.category) ?? 0) + Number(t.amount));
        });

      const categories = Array.from(catMap.entries()).map(([name, amount], i) => ({
        name,
        amount,
        color: CAT_COLORS[i % CAT_COLORS.length],
        icon: CAT_ICONS[name] ?? "📋",
      }));

      setData({
        saldoAtual: summary.balance,
        saldoPrevisto: summary.predictedBalance,
        receitas: summary.income,
        despesas: summary.expense,
        balanco: summary.balance,
        gastosHoje: summary.todayExpenses,
        mediaGastosDiarios: summary.dailyAverageExpense,
        status: summary.status,
        projection: summary.projection,
        transactions,
        categories,
        events,
      });
    } catch (err) {
      console.error("Finance engine error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("finance-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${user.id}` },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "finance_events", filter: `user_id=eq.${user.id}` },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "accounts", filter: `user_id=eq.${user.id}` },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchData]);

  return { data, loading, refetch: fetchData };
}
