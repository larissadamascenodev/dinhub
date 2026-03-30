/**
 * Financial Projection Engine
 * 
 * DEPRECATED: This file re-exports from the modular projection/ directory.
 * Import directly from "@/services/projection" instead.
 */
export {
  type MonthProjection,
  type DailyLimitResult,
  type SimulationResult,
  type HealthFactor,
  type HealthScoreResult,
  type SimulationParams,
  getMonthlyProjection,
  invalidateProjectionCache,
  getDailyLimit,
  getSimulation,
  getFinancialScore,
  getInsight,
} from "./projection";
