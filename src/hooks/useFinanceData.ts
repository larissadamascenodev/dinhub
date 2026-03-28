import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardData, Transaction, FinanceEvent } from "@/types/finance";

const EMPTY_DATA: DashboardData = {
  saldoAtual: 0,
  saldoPrevisto: 0,
  receitas: 0,
  despesas: 0,
  balanco: 0,
  gastosHoje: 0,
  mediaGastosDiarios: 0,
  transactions: [],
  categories: [],
  events: [],
};

export function useFinanceData(selectedMonth: number, selectedYear: number) {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;

    const startDate = new Date(selectedYear, selectedMonth, 1).toISOString().split("T")[0];
    const endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];

    const [txRes, evRes, accRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false }),
      supabase
        .from("finance_events")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true }),
      supabase
        .from("accounts")
        .select("*")
        .eq("is_default", true)
        .limit(1),
    ]);

    const transactions: Transaction[] = (txRes.data ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      date: new Date(t.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
      amount: Number(t.amount),
      type: t.type as "receita" | "despesa",
    }));

    const events: FinanceEvent[] = (evRes.data ?? []).map((e) => ({
      id: e.id,
      name: e.name,
      category: e.category,
      date: new Date(e.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
      amount: Number(e.amount),
      status: e.status as FinanceEvent["status"],
    }));

    const receitas = (txRes.data ?? [])
      .filter((t) => t.type === "receita")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const despesas = (txRes.data ?? [])
      .filter((t) => t.type === "despesa")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const gastosHoje = (txRes.data ?? [])
      .filter((t) => t.type === "despesa" && t.date === today)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const currentDay = Math.min(new Date().getDate(), daysInMonth);
    const mediaGastosDiarios = currentDay > 0 ? despesas / currentDay : 0;

    const balanco = receitas - despesas;
    const saldoAtual = Number(accRes.data?.[0]?.current_balance ?? 0) + balanco;

    // Group by category
    const catMap = new Map<string, number>();
    (txRes.data ?? [])
      .filter((t) => t.type === "despesa")
      .forEach((t) => {
        catMap.set(t.category, (catMap.get(t.category) ?? 0) + Number(t.amount));
      });

    const catColors = [
      "hsl(0 84% 60%)", "hsl(25 95% 53%)", "hsl(340 75% 55%)",
      "hsl(270 60% 55%)", "hsl(210 90% 55%)", "hsl(45 90% 55%)",
    ];
    const catIcons: Record<string, string> = {
      Alimentação: "🍽️", Transporte: "🚗", Saúde: "❤️",
      Assinaturas: "📦", Lazer: "🎮", Moradia: "🏠",
    };

    const categories = Array.from(catMap.entries()).map(([name, amount], i) => ({
      name,
      amount,
      color: catColors[i % catColors.length],
      icon: catIcons[name] ?? "📋",
    }));

    setData({
      saldoAtual,
      saldoPrevisto: balanco,
      receitas,
      despesas,
      balanco,
      gastosHoje,
      mediaGastosDiarios,
      transactions,
      categories,
      events,
    });
    setLoading(false);
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
