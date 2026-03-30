/**
 * Financial Projection Engine — Barrel export
 *
 * Modular architecture:
 *   types.ts             → shared interfaces
 *   getProjection.ts     → 6-month projection with cache
 *   calculateDailyLimit.ts → safe daily spending limit
 *   simulateScenario.ts  → simulation with impact calc
 *   healthScore.ts       → financial health score (0-100)
 *   insight.ts           → humanized AI insights
 */

export type {
  MonthProjection,
  DailyLimitResult,
  SimulationResult,
  HealthFactor,
  HealthScoreResult,
  SimulationParams,
} from "./types";

export { getMonthlyProjection, invalidateProjectionCache } from "./getProjection";
export { getDailyLimit } from "./calculateDailyLimit";
export { getSimulation } from "./simulateScenario";
export { getFinancialScore } from "./healthScore";
export { getInsight } from "./insight";
