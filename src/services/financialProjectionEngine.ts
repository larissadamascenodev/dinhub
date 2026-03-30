/**
 * Financial Projection Engine
 * 
 * Centralized service for projections, daily limits, simulation, and health score.
 * All functions are pure (no React state) and cacheable.
 */

import type { DashboardData } from "@/types/finance";

// ─── Types ───

export interface MonthProjection {
  month: number;
  year: number;
  balance: number;
  delta: number;
  income: number;
  expense: number;
  risk: "positivo" | "atencao" | "risco";
}

export interface DailyLimitResult {
  safeToSpend: number;
  daysLeft: number;
  spendRatio: number;
  tone: "positive" | "neutral" | "negative";
  message: string;
}

export interface SimulationResult {
  projections: MonthProjection[];
  impact3m: number;
  impact6m: number;
  saldoFinal: number;
  saldoFinalBase: number;
  hasSimulation: boolean;
}

export interface HealthFactor {
  label: string;
  value: number;
  max: number;
}

export interface HealthScoreResult {
  score: number;
  label: string;
  factors: HealthFactor[];
}

export interface SimulationParams {
  savingsBoost: number;
  incomeBoost: number;
}

// ─── Projection Engine ───

const projectionCache = new Map<string, MonthProjection[]>();

function buildCacheKey(
  month: number, year: number,
  savingsBoost: number, incomeBoost: number,
  saldoPrevisto: number, avgIncome: number, avgExpense: number,
  receitas: number, despesas: number, balanco: number
): string {
  return `${month}-${year}-${savingsBoost}-${incomeBoost}-${saldoPrevisto}-${avgIncome}-${avgExpense}-${receitas}-${despesas}-${balanco}`;
}

/**
 * Generate 6-month forward projections based on current data + simulation params.
 */
export function getMonthlyProjection(
  data: DashboardData,
  selectedMonth: number,
  selectedYear: number,
  params: SimulationParams = { savingsBoost: 0, incomeBoost: 0 }
): MonthProjection[] {
  const avgIncome = data.projection.avgIncome3m || data.receitas;
  const avgExpense = data.projection.avgExpense3m || data.despesas;

  const key = buildCacheKey(
    selectedMonth, selectedYear,
    params.savingsBoost, params.incomeBoost,
    data.saldoPrevisto, avgIncome, avgExpense,
    data.receitas, data.despesas, data.balanco
  );

  const cached = projectionCache.get(key);
  if (cached) return cached;

  const incomeWithBoost = avgIncome + params.incomeBoost;
  const expenseWithBoost = avgExpense - params.savingsBoost;
  const monthlyNet = incomeWithBoost - expenseWithBoost;

  let balance = data.saldoPrevisto;
  const result: MonthProjection[] = [];

  for (let i = 0; i < 6; i++) {
    const d = new Date(selectedYear, selectedMonth + i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const isFirst = i === 0;
    const projected = isFirst ? balance : balance + monthlyNet;
    const delta = isFirst ? data.balanco : monthlyNet;
    const income = isFirst ? data.receitas : incomeWithBoost;
    const expense = isFirst ? data.despesas : expenseWithBoost;

    const risk: MonthProjection["risk"] =
      delta > 0 ? "positivo" : delta > -200 ? "atencao" : "risco";

    result.push({ month: m, year: y, balance: isFirst ? balance : projected, delta, income, expense, risk });

    if (!isFirst) balance = projected;
  }

  // Keep cache bounded
  if (projectionCache.size > 50) projectionCache.clear();
  projectionCache.set(key, result);

  return result;
}

/**
 * Calculate safe daily spending limit.
 */
export function getDailyLimit(
  data: DashboardData,
  selectedMonth: number,
  selectedYear: number,
  savingsBoost: number = 0
): DailyLimitResult {
  const today = new Date();
  const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const currentDay =
    today.getMonth() === selectedMonth && today.getFullYear() === selectedYear
      ? today.getDate()
      : 1;
  const daysLeft = Math.max(lastDay - currentDay, 1);

  const limitRestante = Math.max(data.saldoAtual - data.despesasPendentes + savingsBoost, 0);
  const safeToSpend = limitRestante / daysLeft;

  const gastoHoje = data.gastosHoje;
  const mediaDiaria = data.mediaGastosDiarios;
  const spendRatio = safeToSpend > 0 ? Math.min(gastoHoje / safeToSpend, 1) : 1;

  const tone: DailyLimitResult["tone"] =
    gastoHoje <= mediaDiaria * 0.8 ? "positive"
    : gastoHoje <= safeToSpend ? "neutral"
    : "negative";

  const message =
    tone === "positive"
      ? "Tá suave hoje 😎"
      : tone === "neutral"
        ? "Já acelerou um pouco hoje 👀"
        : "Se continuar assim, vai estourar o mês 💸";

  return { safeToSpend, daysLeft, spendRatio, tone, message };
}

/**
 * Full simulation result combining projections + impact calculations.
 */
export function getSimulation(
  data: DashboardData,
  selectedMonth: number,
  selectedYear: number,
  params: SimulationParams
): SimulationResult {
  const projections = getMonthlyProjection(data, selectedMonth, selectedYear, params);
  const monthlyImpact = params.savingsBoost + params.incomeBoost;

  const saldoInicial = data.previousMonthEndingBalance;
  const balanco = data.balanco;
  const saldoFinalBase = saldoInicial + balanco;
  const saldoFinal = saldoFinalBase + params.savingsBoost + params.incomeBoost;

  return {
    projections,
    impact3m: monthlyImpact * 3,
    impact6m: monthlyImpact * 6,
    saldoFinal,
    saldoFinalBase,
    hasSimulation: params.savingsBoost > 0 || params.incomeBoost > 0,
  };
}

/**
 * Calculate financial health score (0–100) based on multiple factors.
 */
export function getFinancialScore(
  data: DashboardData,
  projections: MonthProjection[]
): HealthScoreResult {
  const balanco = data.balanco;

  // Factor 1: Balance trend (0-30)
  let balanceScore = 15;
  if (balanco > 0) balanceScore += Math.min(balanco / 100, 15);
  else balanceScore += Math.max(balanco / 50, -15);

  // Factor 2: Spending control (0-30)
  let controlScore = 15;
  if (data.mediaGastosDiarios > 0) {
    const ratio = data.gastosHoje / data.mediaGastosDiarios;
    if (ratio <= 0.8) controlScore = 30;
    else if (ratio <= 1.2) controlScore = 20;
    else controlScore = Math.max(5, 15 - (ratio - 1.2) * 10);
  }

  // Factor 3: Consistency (0-25)
  const positiveMonths = projections.filter((p) => p.delta > 0).length;
  const consistencyScore = (positiveMonths / 6) * 25;

  // Factor 4: Pending ratio (0-15)
  const pendingRatio = data.despesas > 0 ? data.despesasPendentes / data.despesas : 0;
  const pendingScore = (1 - pendingRatio) * 15;

  const score = Math.round(
    Math.max(0, Math.min(100, balanceScore + controlScore + consistencyScore + pendingScore))
  );

  const label =
    score >= 75 ? "Excelente" : score >= 50 ? "Estável" : score >= 30 ? "Atenção" : "Crítico";

  return {
    score,
    label,
    factors: [
      { label: "Saldo crescente", value: Math.round(balanceScore), max: 30 },
      { label: "Controle de gastos", value: Math.round(controlScore), max: 30 },
      { label: "Consistência", value: Math.round(consistencyScore), max: 25 },
      { label: "Despesas em dia", value: Math.round(pendingScore), max: 15 },
    ],
  };
}

/**
 * Generate humanized AI insight based on projections.
 */
export function getInsight(
  data: DashboardData,
  projections: MonthProjection[]
): { text: string; tip: string; tone: "positive" | "neutral" | "negative" } {
  const endBalance = projections[projections.length - 1]?.balance ?? 0;
  const positiveMonths = projections.filter((p) => p.delta > 0).length;
  const negativeMonths = projections.filter((p) => p.delta < 0).length;
  const avgDelta = projections.reduce((s, p) => s + p.delta, 0) / projections.length;
  const isConsistent = positiveMonths >= 4;
  const isUnstable = positiveMonths >= 2 && negativeMonths >= 2;

  if (isConsistent && endBalance > data.saldoAtual) {
    return {
      text: "Você tá mandando bem, seu dinheiro tá crescendo com consistência 👏",
      tip: "Continue assim e considere reservar uma parte para investir.",
      tone: "positive",
    };
  }
  if (isUnstable) {
    return {
      text: "Tem algo meio instável aqui… bora ajustar antes que vire problema 👀",
      tip: "Tente manter suas despesas mais previsíveis nos próximos meses.",
      tone: "neutral",
    };
  }
  if (avgDelta < 0) {
    return {
      text: "Se continuar assim, você pode apertar nos próximos meses 💸",
      tip: "Use a simulação abaixo pra ver como pequenas mudanças fazem diferença.",
      tone: "negative",
    };
  }
  if (endBalance > 0) {
    return {
      text: "Seu saldo se mantém estável. Pequenos ajustes podem trazer uma folga legal 💡",
      tip: "Economizar um pouco a mais todo mês tem um efeito forte no longo prazo.",
      tone: "neutral",
    };
  }
  return {
    text: "Atenção: a projeção indica saldo negativo em breve 😬",
    tip: "Revise suas despesas recorrentes e veja onde pode cortar.",
    tone: "negative",
  };
}

/**
 * Invalidate projection cache (call on transaction changes).
 */
export function invalidateProjectionCache() {
  projectionCache.clear();
}
