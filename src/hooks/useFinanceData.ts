import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getFinancialSummary, computeDailyBehavior } from "@/lib/financeEngine";
import { getCreditCards } from "@/services/transactionService";
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

// Module-level cache to persist data across component remounts
const dataCache: Record<string, DashboardData> = {};
const prefetchingSet = new Set<string>();

function offsetMonth(month: number, year: number, offset: number) {
  const d = new Date(year, month + offset, 1);
  return { month: d.getMonth(), year: d.getFullYear() };
}

/** Build DashboardData from the finance engine (pure async, no React state) */
async function buildDashboardData(month: number, year: number): Promise<DashboardData> {
  const [{ summary, transactions: rawTxs, events: rawEvents }, creditCards, invoicesForMonth] =
    await Promise.all([
      getFinancialSummary(month, year),
      getCreditCards(),
      // Fetch invoices for this month with total_amount and item count
      supabase
        .from("invoices")
        .select("credit_card_id, total_amount, is_paid")
        .eq("month", month + 1) // DB stores 1-based months
        .eq("year", year)
        .then(({ data }) => data ?? []),
    ]);

  // Build invoice lookup by card ID for accurate fatura totals
  const invoiceByCard = new Map(
    (invoicesForMonth as any[]).map((inv: any) => [
      inv.credit_card_id,
      { total: Number(inv.total_amount), isPaid: inv.is_paid },
    ])
  );

  const cardMap = new Map((creditCards as any[]).map((c: any) => [c.id, { name: c.name, due_day: c.due_day }]));

  // Build a set of card IDs that have actual invoice items for this month (total > 0)
  const cardsWithInvoice = new Set(
    (invoicesForMonth as any[])
      .filter((inv: any) => Number(inv.total_amount) > 0)
      .map((inv: any) => inv.credit_card_id)
  );

  // Filter out CC transactions for cards with no invoice items this month
  // (these are pre-start-date transactions that should be ignored)
  const filteredTxs = rawTxs.filter((t) => {
    if (t.payment_method === "cartao" && t.credit_card_id) {
      return cardsWithInvoice.has(t.credit_card_id);
    }
    return true;
  });

  const paidTxs = filteredTxs.filter((t) => t.status === "pago");
  const pendingTxs = filteredTxs.filter((t) => t.status === "pendente");

  // Separate credit card vs regular transactions
  const regularPaid = paidTxs.filter((t) => t.payment_method !== "cartao");
  const ccPaid = paidTxs.filter((t) => t.payment_method === "cartao" && t.credit_card_id);
  const regularPending = pendingTxs.filter((t) => t.payment_method !== "cartao");
  const ccPending = pendingTxs.filter((t) => t.payment_method === "cartao" && t.credit_card_id);

  // Build fatura entries using invoice total_amount (respects closing day cycle)
  function buildFaturaEntries(): { paid: Transaction[]; pending: Transaction[] } {
    const paid: Transaction[] = [];
    const pending: Transaction[] = [];

    for (const [cardId, inv] of invoiceByCard.entries()) {
      if (inv.total <= 0) continue;
      const cardInfo = cardMap.get(cardId);
      const cardName = cardInfo?.name || "Cartão";
      const dueDay = cardInfo?.due_day || 1;
      // Count CC transactions for this card to show item count
      const itemCount = filteredTxs.filter(
        (t) => t.payment_method === "cartao" && t.credit_card_id === cardId
      ).length;

      const entry: Transaction = {
        id: `fatura-${cardId}-${month}-${year}`,
        name: `Fatura ${cardName}`,
        category: "Cartão de Crédito",
        date: new Date(year, month, dueDay).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
        amount: inv.total,
        type: "despesa" as const,
        status: inv.isPaid ? "pago" : "pendente",
        isFatura: true,
        creditCardId: cardId,
        creditCardName: cardName,
        faturaItemCount: itemCount,
      };

      if (inv.isPaid) {
        paid.push(entry);
      } else {
        pending.push(entry);
      }
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

  // For pending events, only show regular pending (cc pending are shown as fatura cards)
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

  // Add fatura pending as events too
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

  const saldoAtual = summary.isFutureMonth ? summary.previousMonthEndingBalance : summary.accountBalance;

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
  const activeKeyRef = useRef(cacheKey);
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  // Keep activeKeyRef in sync and handle cache/fetch on key change
  useEffect(() => {
    activeKeyRef.current = cacheKey;
    let cancelled = false;

    // Show cached data immediately if available
    const cached = dataCache[cacheKey];
    if (cached) {
      setData(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    // Always fetch fresh data
    if (user) {
      buildDashboardData(selectedMonth, selectedYear)
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

      // Prefetch nearby months after a short delay
      const timer = setTimeout(() => {
        for (const offset of [-2, -1, 1, 2, 3]) {
          const m = offsetMonth(selectedMonth, selectedYear, offset);
          prefetchMonth(user.id, m.month, m.year);
        }
      }, 300);
      return () => { cancelled = true; clearTimeout(timer); };
    }

    return () => { cancelled = true; };
  }, [cacheKey, user, selectedMonth, selectedYear]);

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    if (!user) return;
    try {
      const newData = await buildDashboardData(selectedMonth, selectedYear);
      const key = `${user.id}-${selectedMonth}-${selectedYear}`;
      dataCache[key] = newData;
      if (activeKeyRef.current === key) {
        setData(newData);
      }
    } catch (err) {
      console.error("Finance engine error:", err);
    }
  }, [user, selectedMonth, selectedYear]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("finance-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${user.id}` }, () => refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "finance_events", filter: `user_id=eq.${user.id}` }, () => refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "accounts", filter: `user_id=eq.${user.id}` }, () => refetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, refetch]);

  return { data, loading, refetch };
}
