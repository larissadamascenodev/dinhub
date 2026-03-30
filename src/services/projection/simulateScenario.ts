/**
 * Simulation engine — combines projections with impact calculations.
 */

import type { DashboardData } from "@/types/finance";
import type { SimulationParams, SimulationResult } from "./types";
import { getMonthlyProjection } from "./getProjection";

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
