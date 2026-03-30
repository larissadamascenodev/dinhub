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
 * Pick a random item from an array using a seed for determinism within a session.
 */
function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

/**
 * Generate humanized AI insight based on projections.
 * Uses varied, conversational tone with light irony.
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
  const isGrowing = endBalance > data.saldoAtual * 1.1;
  const isStable = Math.abs(endBalance - data.saldoAtual) < data.saldoAtual * 0.1;
  const firstNegIdx = projections.findIndex((p, i) => i > 0 && p.balance < 0);
  const hasFutureDip = projections.some((p, i) => i > 0 && p.balance < projections[i - 1].balance * 0.7);

  // Use day of month as seed for variety without randomness per render
  const seed = new Date().getDate();

  // ── TENDÊNCIA DE CRESCIMENTO ──
  if (isConsistent && isGrowing) {
    const texts = [
      "Se continuar assim, você vai entrar numa fase bem tranquila 👀",
      "O ritmo tá ótimo — seu saldo tá subindo com consistência 📈",
      "Pode comemorar (com moderação): a tendência é de crescimento 🎉",
      "Tá mandando bem, viu? Seu dinheiro tá se multiplicando quietinho 💪",
    ];
    const tips = [
      "Se esse ritmo continuar, dá até pra começar uma reserva já.",
      "Aproveita o momento bom pra separar algo pra investir.",
      "Que tal direcionar parte desse crescimento pra uma meta específica?",
    ];
    return { text: pick(texts, seed), tip: pick(tips, seed + 1), tone: "positive" };
  }

  // ── ESTABILIDADE ──
  if (isStable && positiveMonths >= 3) {
    const texts = [
      "Tá estável, e isso já é uma vitória — muita gente queria estar assim 😌",
      "Sem grandes surpresas por aqui. Tá no controle 🎯",
      "Seu saldo tá firme. Não tá crescendo rápido, mas também não tá caindo.",
      "Tudo equilibrado. Um empurrãozinho a mais e vira crescimento 💡",
    ];
    const tips = [
      "Economizar um pouco a mais todo mês tem um efeito forte no longo prazo.",
      "Estabilidade é base. Agora pensa no que te leva pro próximo nível.",
      "Tente reduzir um gasto variável pra transformar estabilidade em crescimento.",
    ];
    return { text: pick(texts, seed), tip: pick(tips, seed + 1), tone: "neutral" };
  }

  // ── INSTABILIDADE / OSCILAÇÃO ──
  if (isUnstable) {
    const texts = [
      "Tá indo bem… mas tem um ponto ali na frente que merece atenção 👀",
      "Tem meses bons e meses ruins — tá oscilando demais pra ficar tranquilo",
      "A montanha-russa financeira tá ativa. Bora estabilizar isso? 🎢",
      "Alguns meses salvam, outros complicam. Consistência é o jogo aqui.",
    ];
    const tips = [
      "Tente manter suas despesas mais previsíveis nos próximos meses.",
      "Identifique os meses ruins e veja se tem gasto que dá pra antecipar ou cortar.",
      "Use a simulação pra testar: o que acontece se você economizar um pouco mais?",
    ];
    return { text: pick(texts, seed), tip: pick(tips, seed + 1), tone: "neutral" };
  }

  // ── RISCO COM PONTO ESPECÍFICO ──
  if (hasFutureDip && avgDelta < 0) {
    const dipMonth = projections.findIndex((p, i) => i > 0 && p.balance < projections[i - 1].balance * 0.7);
    const monthName = dipMonth >= 0 ? ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][projections[dipMonth].month] : "";
    const texts = [
      `Olha, lá por ${monthName} a coisa pode apertar um pouco 😬`,
      `Tem uma queda chegando por volta de ${monthName}. Melhor se preparar.`,
      `Se continuar nesse ritmo, ${monthName} vai ser apertado 💸`,
    ];
    const tips = [
      "Use a simulação abaixo pra ver como pequenas mudanças fazem diferença.",
      "Revise seus gastos recorrentes — tem algo que dá pra pausar ou reduzir?",
      "Antecipar uma economia agora pode amortecer o impacto lá na frente.",
    ];
    return { text: pick(texts, seed), tip: pick(tips, seed + 1), tone: "negative" };
  }

  // ── RISCO GERAL ──
  if (avgDelta < 0) {
    const texts = [
      "Se continuar assim, você pode apertar nos próximos meses 💸",
      "A tendência não tá boa — os gastos tão vencendo as receitas",
      "Alerta ligado: a projeção mostra que o saldo vai encolher 📉",
      "Bora reagir? O caminho atual leva pra um aperto financeiro.",
    ];
    const tips = [
      "Revise suas despesas recorrentes e veja onde pode cortar.",
      "Mesmo R$100 a menos por mês faz diferença em 6 meses.",
      "Use a simulação pra encontrar o ponto de equilíbrio.",
    ];
    return { text: pick(texts, seed), tip: pick(tips, seed + 1), tone: "negative" };
  }

  // ── SALDO NEGATIVO IMINENTE ──
  if (firstNegIdx >= 0) {
    const monthName = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][projections[firstNegIdx].month];
    return {
      text: `Atenção: a projeção indica saldo negativo em ${monthName} 😬`,
      tip: "Hora de agir. Revise gastos e considere formas de aumentar a renda.",
      tone: "negative",
    };
  }

  // ── POSITIVO GENÉRICO ──
  if (endBalance > 0) {
    const texts = [
      "Seu saldo se mantém positivo. Pequenos ajustes podem trazer uma folga legal 💡",
      "Tá tudo certo por aqui. Nada urgente, mas sempre dá pra melhorar.",
      "Cenário tranquilo. Que tal aproveitar pra planejar algo a mais?",
    ];
    const tips = [
      "Economizar um pouco a mais todo mês tem um efeito forte no longo prazo.",
      "Já pensou em criar uma reserva de emergência? Agora seria um bom momento.",
    ];
    return { text: pick(texts, seed), tip: pick(tips, seed + 1), tone: "neutral" };
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
