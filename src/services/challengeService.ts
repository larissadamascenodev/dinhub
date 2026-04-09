import { supabase } from "@/integrations/supabase/client";

export interface Challenge {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  duration_days: number;
  difficulty: string;
  potential_savings: number;
  cover_image: string | null;
  icon: string;
  is_system: boolean;
  created_at: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  status: string;
  progress: number;
  started_at: string;
  completed_at: string | null;
  challenge?: Challenge;
  checkin_count?: number;
  checked_today?: boolean;
}

export async function fetchSuggestions(): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("is_system", true)
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as Challenge[];
}

export async function fetchUserChallenges(): Promise<UserChallenge[]> {
  const { data, error } = await supabase
    .from("user_challenges")
    .select("*, challenge:challenges(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const today = new Date().toISOString().split("T")[0];
  const enriched: UserChallenge[] = [];

  for (const uc of (data ?? []) as any[]) {
    const { count } = await supabase
      .from("challenge_checkins")
      .select("*", { count: "exact", head: true })
      .eq("user_challenge_id", uc.id);

    const { data: todayCheck } = await supabase
      .from("challenge_checkins")
      .select("id")
      .eq("user_challenge_id", uc.id)
      .eq("checkin_date", today)
      .maybeSingle();

    enriched.push({
      ...uc,
      challenge: uc.challenge as Challenge,
      checkin_count: count ?? 0,
      checked_today: !!todayCheck,
    });
  }

  return enriched;
}

export async function acceptChallenge(challengeId: string, userId: string): Promise<void> {
  const { error } = await supabase.from("user_challenges").insert({
    user_id: userId,
    challenge_id: challengeId,
  } as any);
  if (error) throw error;
}

export async function checkinChallenge(userChallengeId: string, userId: string): Promise<void> {
  const { error } = await supabase.from("challenge_checkins").insert({
    user_challenge_id: userChallengeId,
    user_id: userId,
  } as any);
  if (error) throw error;
}

export async function createCustomChallenge(challenge: {
  name: string;
  description?: string;
  duration_days: number;
  difficulty: string;
  potential_savings: number;
  icon?: string;
}, userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("challenges")
    .insert({
      user_id: userId,
      name: challenge.name,
      description: challenge.description ?? null,
      duration_days: challenge.duration_days,
      difficulty: challenge.difficulty,
      potential_savings: challenge.potential_savings,
      icon: challenge.icon ?? "🎯",
      is_system: false,
    } as any)
    .select("id")
    .single();
  if (error) throw error;

  await acceptChallenge((data as any).id, userId);
  return (data as any).id;
}

export async function abandonChallenge(userChallengeId: string): Promise<void> {
  const { error } = await supabase
    .from("user_challenges")
    .update({ status: "abandoned" } as any)
    .eq("id", userChallengeId);
  if (error) throw error;
}
