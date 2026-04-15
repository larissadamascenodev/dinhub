import { supabase } from "@/integrations/supabase/client";
import type { HealthScoreV2, HealthFactor } from "@/services/healthScoreService";

export interface PersistedScore {
  id: string;
  user_id: string;
  month: number;
  year: number;
  score: number;
  level: string;
  factors: HealthFactor[];
  created_at: string;
  updated_at: string;
}

/**
 * Save (upsert) the current month's health score.
 */
export async function saveHealthScore(
  userId: string,
  month: number,
  year: number,
  health: HealthScoreV2
): Promise<void> {
  // Try update first, then insert (upsert via ON CONFLICT not available via client)
  const { data: existing } = await supabase
    .from("health_scores" as any)
    .select("id")
    .eq("user_id", userId)
    .eq("month", month)
    .eq("year", year)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("health_scores" as any)
      .update({
        score: health.score,
        level: health.level,
        factors: health.factors as any,
      })
      .eq("id", (existing as any).id);
  } else {
    await supabase.from("health_scores" as any).insert({
      user_id: userId,
      month,
      year,
      score: health.score,
      level: health.level,
      factors: health.factors as any,
    });
  }
}

/**
 * Fetch the previous month's persisted score for comparison.
 */
export async function fetchPreviousScore(
  userId: string,
  currentMonth: number,
  currentYear: number
): Promise<PersistedScore | null> {
  const prevDate = new Date(currentYear, currentMonth - 1, 1);
  const prevMonth = prevDate.getMonth() + 1; // 1-based
  const prevYear = prevDate.getFullYear();

  // Actually we store 0-based month to match the app convention
  const { data } = await supabase
    .from("health_scores" as any)
    .select("*")
    .eq("user_id", userId)
    .eq("month", prevMonth - 1) // 0-based
    .eq("year", prevYear)
    .maybeSingle();

  return (data as PersistedScore | null) ?? null;
}

/**
 * Fetch score history (last N months) for evolution display.
 */
export async function fetchScoreHistory(
  userId: string,
  limit = 6
): Promise<PersistedScore[]> {
  const { data } = await supabase
    .from("health_scores" as any)
    .select("*")
    .eq("user_id", userId)
    .order("year", { ascending: false })
    .order("month", { ascending: false })
    .limit(limit);

  return ((data as PersistedScore[] | null) ?? []).reverse();
}
