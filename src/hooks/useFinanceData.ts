import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { invalidateProjectionCache } from "@/services/projection";
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
  receitasRecebidas: 0,
  receitasPendentes: 0,
  despesas: 0,
  despesasPagas: 0,
  despesasPendentes: 0,
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

type FinanceDataOptions = {
  includeHistorical?: boolean;
};

const dataCache: Record<string, DashboardData> = {};
const prefetchingSet = new Set<string>();

function offsetMonth(month: number, year: number, offset: number) {
  const d = new Date(year, month + offset, 1);
  return { month: d.getMonth(), year: d.getFullYear() };
}

function buildCacheKey(userId: string | undefined, month: number, year: number, includeHistorical: boolean) {
  return `${userId ?? ""}-${month}-${year}-${includeHistorical ? "hist" : "fast"}`;
}

async function buildDashboardData(month: number, year: number, options?: FinanceDataOptions & { userId?: string }): Promise<DashboardData> {
  const includeHistorical = options?.includeHistorical ?? false;

  const { summary, transactions: rawTxs, events: rawEvents, creditCards, invoicesDetail: invoicesForMonth } = await getFinancialSummary(month, year, { includeHistorical, userId: options?.userId });

  const invoiceByCard = new Map(
    (invoicesForMonth as any[]).map((inv: any) => [
      inv.credit_card_id,
      { total: Number(inv.total_amount), isPaid: inv.is_paid, paidAmount: Number(inv.paid_amount ?? 0) },
    ])
  );

  const cardMap = new Map((creditCards as any[]).map((c: any) => [c.id, { name: c.name, due_day: c.due_day }]));

  const cardsWithInvoice = new Set(
    (invoicesForMonth as any[])
      .filter((inv: any) => Number(inv.total_amount) > 0)
      .map((inv: any) => inv.credit_card_id)
  );

  const filteredTxs = rawTxs.filter((t) => {
    if (t.payment_method === "cartao" && t.credit_card_id) {
      return cardsWithInvoice.has(t.credit_card_id);
    }
    return true;
  });

  const paidTxs = filteredTxs.filter((t) => t.status === "pago");
  const pendingTxs = filteredTxs.filter((t) => t.status === "pendente");
  const regularPaid = paidTxs.filter((t) => t.payment_method !== "cartao");
  const regularPending = pendingTxs.filter((t) => t.payment_method !== "cartao");

  function buildFaturaEntries(): { paid: Transaction[]; pending: Transaction[] } {
    const paid: Transaction[] = [];
    const pending: Transaction[] = [];

    for (const [cardId, inv] of invoiceByCard.entries()) {
      if (inv.total <= 0) continue;
      const cardInfo = cardMap.get(cardId);
      const cardName = cardInfo?.name || "Cartão";
      const dueDay = cardInfo?.due_day || 1;
      const itemCount = filteredTxs.filter(
        (t) => t.payment_method === "cartao" && t.credit_card_id === cardId
      ).length;

      const outstanding = Math.max(0, inv.total - inv.paidAmount);
      const entry: Transaction = {
        id: `fatura-${cardId}-${month}-${year}`,
        name: `Fatura ${cardName}`,
        category: "Cartão de Crédito",
        date: new Date(year, month, dueDay).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
        amount: outstanding > 0 ? outstanding : inv.total,
        type: "despesa" as const,
        status: inv.isPaid ? "pago" : "pendente",
        isFatura: true,
        creditCardId: cardId,
        creditCardName: cardName,
        faturaItemCount: itemCount,
      };

      if (inv.isPaid) paid.push(entry);
      else pending.push(entry);
    }

    return { paid, pending };
  }

  const { paid: faturasPaid, pending: faturasPending } = buildFaturaEntries();

  const regularTransactions: Transaction[] = regularPaid.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    date: new Date(t.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
    amount: Number(t.amount),
    type: t.type as Transaction["type"],
    status: "pago" as const,
  }));

  const transactions: Transaction[] = [...regularTransactions, ...faturasPaid];

  const pendingAsEvents: FinanceEvent[] = regularPending.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    date: new Date(t.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
    rawDate: t.date,
    amount: Number(t.amount),
    status: "pendente" as const,
    type: t.type as "receita" | "despesa",
    isTransaction: true,
  }));

  const faturaPendingEvents: FinanceEvent[] = faturasPending.map((f) => {
    const cardInfo = cardMap.get(f.creditCardId!);
    const dueDay = cardInfo?.due_day || 1;
    return {
      id: f.id,
      name: f.name,
      category: f.category,
      date: f.date,
      rawDate: `${year}-${String(month + 1).padStart(2, "0")}-${String(dueDay).padStart(2, "0")}`,
      amount: f.amount,
      status: "pendente" as const,
      type: "despesa" as const,
      isTransaction: true,
    };
  });

  const events: FinanceEvent[] = rawEvents.map((e) => ({
    id: e.id,
    name: e.name,
    category: e.category,
    date: new Date(e.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
    rawDate: e.date,
    amount: Number(e.amount),
    status: e.status as FinanceEvent["status"],
    isTransaction: false,
  }));

  const allEvents = [...events, ...pendingAsEvents, ...faturaPendingEvents].sort((a, b) => parseInt(a.date) - parseInt(b.date));

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

  const saldoAtual = summary.isFutureMonth
    ? summary.previousMonthEndingBalance
    : summary.isPastMonth
      ? summary.predictedBalance
      : summary.previousMonthEndingBalance + summary.balance;

  return {
    saldoAtual,
    saldoPrevisto: summary.predictedBalance,
    previousMonthEndingBalance: summary.previousMonthEndingBalance,
    isFutureMonth: summary.isFutureMonth,
    isPastMonth: summary.isPastMonth,
    receitas: summary.income,
    receitasRecebidas: summary.paidIncome,
    receitasPendentes: summary.income - summary.paidIncome,
    despesas: summary.expense,
    despesasPagas: summary.paidExpense,
    despesasPendentes: summary.expense - summary.paidExpense,
    balanco: summary.balance,
    gastosHoje: summary.todayExpenses,
    mediaGastosDiarios: summary.dailyAverageExpense,
    status: summary.status,
    dailyBehavior: computeDailyBehavior(summary.todayExpenses, summary.dailyAverageExpense),
    projection: summary.projection,
    transactions,
    categories,
    events: allEvents,
    pendingTransactions: [
      ...regularPending.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        date: t.date,
        amount: Number(t.amount),
        type: t.type as Transaction["type"],
        status: "pendente" as const,
      })),
      ...faturasPending,
    ],
  };
}

function prefetchMonth(userId: string, month: number, year: number, options?: FinanceDataOptions) {
  const includeHistorical = options?.includeHistorical ?? false;
  const key = buildCacheKey(userId, month, year, includeHistorical);
  if (dataCache[key] || prefetchingSet.has(key)) return;
  prefetchingSet.add(key);
  buildDashboardData(month, year, { ...options, userId })
    .then((result) => { dataCache[key] = result; })
    .catch(() => {})
    .finally(() => { prefetchingSet.delete(key); });
}

export function useFinanceData(selectedMonth: number, selectedYear: number, options?: FinanceDataOptions) {
  const { user, loading: authLoading } = useAuth();
  const includeHistorical = options?.includeHistorical ?? false;
  const cacheKey = buildCacheKey(user?.id, selectedMonth, selectedYear, includeHistorical);
  const activeKeyRef = useRef(cacheKey);
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [loading, setLoading] = useState(() => authLoading);

  useEffect(() => {
    activeKeyRef.current = cacheKey;
    let cancelled = false;

    if (authLoading) {
      setLoading(true);
      return () => {
        cancelled = true;
      };
    }

    if (!user) {
      setData(EMPTY_DATA);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const cached = dataCache[cacheKey];
    if (cached) {
      setData(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    buildDashboardData(selectedMonth, selectedYear, { includeHistorical, userId: user.id })
      .then((newData) => {
        dataCache[cacheKey] = newData;
        if (!cancelled && activeKeyRef.current === cacheKey) {
          setData(newData);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Finance engine error:", err);
        if (!cancelled && activeKeyRef.current === cacheKey) {
          setLoading(false);
        }
      });

    const timer = setTimeout(() => {
      for (const offset of [-1, 1]) {
        const m = offsetMonth(selectedMonth, selectedYear, offset);
        prefetchMonth(user.id, m.month, m.year, { includeHistorical });
      }
    }, 1200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };

  }, [authLoading, cacheKey, user, selectedMonth, selectedYear, includeHistorical]);

  const refetch = useCallback(async () => {
    if (!user) return;
    try {
      // Clear ALL cached months + projection cache so everything recalculates
      for (const k of Object.keys(dataCache)) delete dataCache[k];
      invalidateProjectionCache();

      const newData = await buildDashboardData(selectedMonth, selectedYear, { includeHistorical, userId: user.id });
      const key = buildCacheKey(user.id, selectedMonth, selectedYear, includeHistorical);
      dataCache[key] = newData;
      if (activeKeyRef.current === key) {
        setData(newData);
      }
    } catch (err) {
      console.error("Finance engine error:", err);
    }
  }, [user, selectedMonth, selectedYear, includeHistorical]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`finance-realtime-${includeHistorical ? "hist" : "fast"}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${user.id}` }, () => refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "finance_events", filter: `user_id=eq.${user.id}` }, () => refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "accounts", filter: `user_id=eq.${user.id}` }, () => refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices", filter: `user_id=eq.${user.id}` }, () => refetch())
      .subscribe();

    const handleFinanceChange = () => refetch();
    window.addEventListener("finance-data-changed", handleFinanceChange);

    return () => {
      window.removeEventListener("finance-data-changed", handleFinanceChange);
      supabase.removeChannel(channel);
    };
  }, [user, refetch, includeHistorical]);

  return { data, loading, refetch };
}
