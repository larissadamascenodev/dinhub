import { useState, useMemo, useCallback } from "react";
import { useMonth } from "@/contexts/MonthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import {
  getMonthlyProjection,
  getDailyLimit,
  getSimulation,
  getFinancialScore,
  getInsight,
  invalidateProjectionCache,
  type SimulationParams,
} from "@/services/projection";

/**
 * React hook that wires the financial projection engine to live data.
 * Automatically recalculates on data changes (including real-time updates).
 */
export function useFinancialProjection() {
  const { selectedMonth, selectedYear } = useMonth();
  const { data, loading, refetch } = useFinanceData(selectedMonth, selectedYear, { includeHistorical: true });

  const [savingsBoost, setSavingsBoost] = useState(0);
  const [incomeBoost, setIncomeBoost] = useState(0);
  const [savingsGoal, setSavingsGoal] = useState(0);

  const params: SimulationParams = useMemo(
    () => ({ savingsBoost, incomeBoost }),
    [savingsBoost, incomeBoost]
  );

  // All computed values derive from data + params — auto-update on real-time changes
  const projections = useMemo(
    () => getMonthlyProjection(data, selectedMonth, selectedYear, params),
    [data, selectedMonth, selectedYear, params]
  );

  const dailyLimit = useMemo(
    () => getDailyLimit(data, selectedMonth, selectedYear, savingsGoal),
    [data, selectedMonth, selectedYear, savingsGoal]
  );

  const simulation = useMemo(
    () => getSimulation(data, selectedMonth, selectedYear, params),
    [data, selectedMonth, selectedYear, params]
  );

  const healthScore = useMemo(
    () => getFinancialScore(data, projections),
    [data, projections]
  );

  const insight = useMemo(
    () => getInsight(data, projections),
    [data, projections]
  );

  const resetSimulation = useCallback(() => {
    setSavingsBoost(0);
    setIncomeBoost(0);
  }, []);

  const refreshAll = useCallback(async () => {
    invalidateProjectionCache();
    await refetch();
  }, [refetch]);

  return {
    // Raw data
    data,
    loading,

    // Projections
    projections,
    dailyLimit,
    simulation,
    healthScore,
    insight,

    // Simulation controls
    savingsBoost,
    setSavingsBoost,
    incomeBoost,
    setIncomeBoost,
    savingsGoal,
    setSavingsGoal,
    resetSimulation,

    // Actions
    refreshAll,

    // Month context
    selectedMonth,
    selectedYear,
  };
}
