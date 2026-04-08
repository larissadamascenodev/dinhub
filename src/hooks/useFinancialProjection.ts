import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useMonth } from "@/contexts/MonthContext";
import { useFinanceData, buildDashboardData } from "@/hooks/useFinanceData";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardData } from "@/types/finance";
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
 * Loads real financial data for each future month (recurring/scheduled transactions).
 */
export function useFinancialProjection() {
  const { selectedMonth, selectedYear } = useMonth();
  const { user } = useAuth();
  const { data, loading, refetch } = useFinanceData(selectedMonth, selectedYear, { includeHistorical: true });

  const [savingsBoost, setSavingsBoost] = useState(0);
  const [incomeBoost, setIncomeBoost] = useState(0);
  const [savingsGoal, setSavingsGoal] = useState(0);

  // Per-month data for future months
  const [monthDataMap, setMonthDataMap] = useState<Map<string, DashboardData>>(new Map());
  const [futureLoading, setFutureLoading] = useState(false);
  const loadingRef = useRef(false);

  // Load real data for future months (1..11 months ahead)
  useEffect(() => {
    if (!user || loading) return;
    if (loadingRef.current) return;
    loadingRef.current = true;
    setFutureLoading(true);

    const months: { m: number; y: number }[] = [];
    for (let i = 1; i < 12; i++) {
      const d = new Date(selectedYear, selectedMonth + i, 1);
      months.push({ m: d.getMonth(), y: d.getFullYear() });
    }

    Promise.all(
      months.map(({ m, y }) =>
        buildDashboardData(m, y, { includeHistorical: false, userId: user.id })
          .then((result) => ({ key: `${m}-${y}`, data: result }))
          .catch(() => ({ key: `${m}-${y}`, data: null }))
      )
    ).then((results) => {
      const map = new Map<string, DashboardData>();
      for (const r of results) {
        if (r.data) map.set(r.key, r.data);
      }
      setMonthDataMap(map);
      setFutureLoading(false);
      loadingRef.current = false;
    });
  }, [user, loading, selectedMonth, selectedYear]);

  const params: SimulationParams = useMemo(
    () => ({ savingsBoost, incomeBoost }),
    [savingsBoost, incomeBoost]
  );

  const projections = useMemo(
    () => getMonthlyProjection(data, selectedMonth, selectedYear, params, monthDataMap),
    [data, selectedMonth, selectedYear, params, monthDataMap]
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
    loadingRef.current = false;
    await refetch();
  }, [refetch]);

  return {
    data,
    loading: loading || futureLoading,
    projections,
    dailyLimit,
    simulation,
    healthScore,
    insight,
    savingsBoost,
    setSavingsBoost,
    incomeBoost,
    setIncomeBoost,
    savingsGoal,
    setSavingsGoal,
    resetSimulation,
    refreshAll,
    selectedMonth,
    selectedYear,
  };
}
