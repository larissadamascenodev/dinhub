/**
 * Monthly projection generator with caching.
 */

import type { DashboardData } from "@/types/finance";
import type { MonthProjection, SimulationParams } from "./types";

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
 * Invalidate projection cache (call on transaction changes).
 */
export function invalidateProjectionCache() {
  projectionCache.clear();
}
