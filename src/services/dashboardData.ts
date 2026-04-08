import { getFinancialSummary, computeDailyBehavior, fetchHistoricalAverages } from "@/lib/financeEngine";
import type { DashboardData, FinanceEvent, Transaction } from "@/types/finance";

export type FinanceDataOptions = {
  includeHistorical?: boolean;
  userId?: string;
};

export const EMPTY_DASHBOARD_DATA: DashboardData = {
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

type CacheEntry = {
  data: DashboardData;
  timestamp: number;
};

const CACHE_TTL = 60_000;
const dashboardCache: Record<string, CacheEntry> = {};
const historicalCacheKeys = new Set<string>();
const inflightPrefetches = new Map<string, Promise<DashboardData>>();

export function buildDashboardCacheKey(userId: string | undefined, month: number, year: number) {
  return `${userId ?? ""}-${month}-${year}`;
}

export function getCachedDashboardData(cacheKey: string) {
  return dashboardCache[cacheKey]?.data;
}

export function hasFreshDashboardCache(cacheKey: string) {
  const entry = dashboardCache[cacheKey];
  return !!entry && Date.now() - entry.timestamp < CACHE_TTL;
}

export function hasHistoricalDashboardCache(cacheKey: string) {
  return historicalCacheKeys.has(cacheKey);
}

export function setCachedDashboardData(
  cacheKey: string,
  data: DashboardData,
  options?: { historical?: boolean }
) {
  dashboardCache[cacheKey] = { data, timestamp: Date.now() };

  if (options?.historical) {
    historicalCacheKeys.add(cacheKey);
  }
}

export function clearDashboardCache() {
  Object.keys(dashboardCache).forEach((key) => delete dashboardCache[key]);
  historicalCacheKeys.clear();
  inflightPrefetches.clear();
}

export async function buildDashboardData(
  month: number,
  year: number,
  options?: FinanceDataOptions & { userId?: string }
): Promise<DashboardData> {
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
        creditCardColor: cardInfo?.color || null,
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

function computeStatusFromData(paidExpense: number, avgExpense: number): "safe" | "warning" | "danger" {
  if (avgExpense === 0) return "safe";
  const ratio = paidExpense / avgExpense;
  if (ratio > 1.3) return "danger";
  if (ratio > 1.1) return "warning";
  return "safe";
}

function mergeHistoricalIntoData(
  base: DashboardData,
  historical: { avgIncome: number; avgExpense: number }
): DashboardData {
  return {
    ...base,
    status: computeStatusFromData(base.despesasPagas, historical.avgExpense),
    projection: {
      nextMonthBalance: historical.avgIncome - historical.avgExpense,
      avgIncome3m: historical.avgIncome,
      avgExpense3m: historical.avgExpense,
    },
  };
}

export function prefetchDashboardData(
  month: number,
  year: number,
  options?: FinanceDataOptions & { userId?: string }
) {
  const includeHistorical = options?.includeHistorical ?? false;
  const cacheKey = buildDashboardCacheKey(options?.userId, month, year);

  // Fast path: fresh base cache available
  if (hasFreshDashboardCache(cacheKey)) {
    if (!includeHistorical || hasHistoricalDashboardCache(cacheKey)) {
      return Promise.resolve(getCachedDashboardData(cacheKey)!);
    }

    // Need historical but already have base — only fetch historical averages
    const histKey = `${cacheKey}-hist-merge`;
    const inflight = inflightPrefetches.get(histKey);
    if (inflight) return inflight;

    const baseData = getCachedDashboardData(cacheKey)!;
    const request = fetchHistoricalAverages(month, year, 3)
      .then((historical) => {
        const merged = mergeHistoricalIntoData(baseData, historical);
        setCachedDashboardData(cacheKey, merged, { historical: true });
        return merged;
      })
      .finally(() => inflightPrefetches.delete(histKey));

    inflightPrefetches.set(histKey, request);
    return request;
  }

  // No base cache — full fetch (always without historical for speed)
  const promiseKey = `${cacheKey}-base`;
  const inflight = inflightPrefetches.get(promiseKey);
  if (inflight) {
    // If there's an inflight base fetch and we also need historical, chain it
    if (includeHistorical) {
      const histKey = `${cacheKey}-hist-merge`;
      if (!inflightPrefetches.has(histKey)) {
        const histRequest = inflight.then((baseData) => {
          return fetchHistoricalAverages(month, year, 3).then((historical) => {
            const merged = mergeHistoricalIntoData(baseData, historical);
            setCachedDashboardData(cacheKey, merged, { historical: true });
            return merged;
          });
        }).finally(() => inflightPrefetches.delete(histKey));
        inflightPrefetches.set(histKey, histRequest);
        return histRequest;
      }
      return inflightPrefetches.get(histKey)!;
    }
    return inflight;
  }

  const request = buildDashboardData(month, year, { ...options, includeHistorical: false })
    .then((result) => {
      setCachedDashboardData(cacheKey, result);
      return result;
    })
    .finally(() => inflightPrefetches.delete(promiseKey));

  inflightPrefetches.set(promiseKey, request);

  // If historical needed, chain it after base completes
  if (includeHistorical) {
    const histKey = `${cacheKey}-hist-merge`;
    const histRequest = request.then((baseData) => {
      return fetchHistoricalAverages(month, year, 3).then((historical) => {
        const merged = mergeHistoricalIntoData(baseData, historical);
        setCachedDashboardData(cacheKey, merged, { historical: true });
        return merged;
      });
    }).finally(() => inflightPrefetches.delete(histKey));
    inflightPrefetches.set(histKey, histRequest);
    return histRequest;
  }

  return request;
}