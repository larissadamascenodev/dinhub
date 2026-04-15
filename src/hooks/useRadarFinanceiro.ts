import { useMemo } from "react";
import { useMonth } from "@/contexts/MonthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import { generateRadarInsights, getRadarStatus, type RadarInsight, type RadarStatus } from "@/services/radarService";

/**
 * Hook that runs the Radar Financeiro engine with live data.
 * Returns insights, status and loading state.
 * Re-runs automatically on transaction changes (via useFinanceData realtime).
 */
export function useRadarFinanceiro() {
  const { selectedMonth, selectedYear } = useMonth();

  // Current month data
  const { data: currentData, loading: loadingCurrent } = useFinanceData(selectedMonth, selectedYear);

  // Previous month data for comparison
  const prevDate = new Date(selectedYear, selectedMonth - 1, 1);
  const { data: prevData, loading: loadingPrev } = useFinanceData(prevDate.getMonth(), prevDate.getFullYear());

  const loading = loadingCurrent || loadingPrev;

  const insights: RadarInsight[] = useMemo(() => {
    if (loading) return [];
    return generateRadarInsights(currentData, prevData);
  }, [currentData, prevData, loading]);

  const status: RadarStatus = useMemo(() => getRadarStatus(insights), [insights]);

  return { insights, status, loading };
}
