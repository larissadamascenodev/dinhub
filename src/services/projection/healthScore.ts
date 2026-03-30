/**
 * Financial health score calculator.
 */

import type { DashboardData } from "@/types/finance";
import type { MonthProjection, HealthScoreResult } from "./types";

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
