import { supabase } from "@/integrations/supabase/client";

// Maps challenge names to related transaction categories
const CHALLENGE_CATEGORY_MAP: Record<string, string[]> = {
  "Semana Sem Delivery": ["Delivery", "Fast Food", "Fast-food"],
  "30 Dias Sem Compras por Impulso": ["Compras online", "Eletrônicos", "Vestuário"],
  "Café de Casa por 15 Dias": ["Café", "Bebida"],
  "Transporte Consciente por 15 Dias": ["Transporte", "Uber"],
  "Semana Sem Streaming Extra": ["Assinaturas", "Streaming"],
  "30 Dias de Almoço em Casa": ["Fast Food", "Fast-food", "Delivery"],
};

// Reverse map: category → challenge names it's relevant to
const CATEGORY_TO_CHALLENGES: Record<string, string[]> = {};
for (const [challengeName, cats] of Object.entries(CHALLENGE_CATEGORY_MAP)) {
  for (const cat of cats) {
    if (!CATEGORY_TO_CHALLENGES[cat]) CATEGORY_TO_CHALLENGES[cat] = [];
    if (!CATEGORY_TO_CHALLENGES[cat].includes(challengeName)) {
      CATEGORY_TO_CHALLENGES[cat].push(challengeName);
    }
  }
}

// Personalized messages per challenge
const CHALLENGE_HINTS: Record<string, string> = {
  "Semana Sem Delivery": "Você tem gastado bastante com alimentação e delivery",
  "30 Dias Sem Compras por Impulso": "Suas compras online estão pesando no orçamento",
  "Café de Casa por 15 Dias": "Cafezinhos fora somam mais do que parece",
  "Transporte Consciente por 15 Dias": "Transporte por app tem consumido uma boa fatia",
  "Semana Sem Streaming Extra": "Assinaturas extras estão acumulando",
  "30 Dias de Almoço em Casa": "Almoçar fora tem pesado no bolso",
};

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
  personalHint?: string;       // personalized message
  realPotential?: number;      // real potential based on data
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
  real_savings?: number | null;
  violated?: boolean;
}

interface CategorySpending {
  category: string;
  total: number;
  count: number;
  pct: number;
}

export async function fetchSmartSuggestions(): Promise<Challenge[]> {
  // 1. Fetch all system challenges
  const { data: allChallenges, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("is_system", true)
    .order("created_at");
  if (error) throw error;
  const challenges = (allChallenges ?? []) as Challenge[];

  // 2. Analyze last 30 days of spending
  const now = new Date();
  const thirtyAgo = new Date(now);
  thirtyAgo.setDate(thirtyAgo.getDate() - 30);

  const { data: txns } = await supabase
    .from("transactions")
    .select("category, amount")
    .eq("type", "despesa")
    .gte("date", thirtyAgo.toISOString().split("T")[0]);

  if (!txns || txns.length === 0) {
    // No data — return all challenges without personalization
    return challenges;
  }

  // 3. Calculate per-category totals
  const catMap = new Map<string, { total: number; count: number }>();
  let totalGeneral = 0;
  for (const t of txns) {
    const amt = Number(t.amount);
    totalGeneral += amt;
    const existing = catMap.get(t.category) ?? { total: 0, count: 0 };
    existing.total += amt;
    existing.count += 1;
    catMap.set(t.category, existing);
  }

  const catSpending: CategorySpending[] = Array.from(catMap.entries())
    .map(([category, { total, count }]) => ({
      category,
      total,
      count,
      pct: (total / totalGeneral) * 100,
    }))
    .sort((a, b) => b.total - a.total);

  // 4. Select relevant categories (>=15% OR top 3), filter out small ones
  const top3 = new Set(catSpending.slice(0, 3).map((c) => c.category));
  const relevantCats = catSpending.filter((c) => {
    if (c.total < 100 || c.count <= 1) return false;
    return c.pct >= 15 || top3.has(c.category);
  });

  // 5. Score each challenge by how much the user spends in related categories
  const scored: { challenge: Challenge; score: number; spending: number }[] = [];
  for (const ch of challenges) {
    const relatedCats = CHALLENGE_CATEGORY_MAP[ch.name];
    if (!relatedCats) {
      scored.push({ challenge: ch, score: 0, spending: 0 });
      continue;
    }
    const matchingCats = relevantCats.filter((rc) => relatedCats.includes(rc.category));
    const totalSpending = matchingCats.reduce((s, c) => s + c.total, 0);
    const score = matchingCats.reduce((s, c) => s + c.pct, 0);
    scored.push({ challenge: ch, score, spending: totalSpending });
  }

  // 6. Sort by score (highest spending relevance first)
  scored.sort((a, b) => b.score - a.score);

  // 7. Enrich with personalized data — prioritized ones get hints
  return scored.map(({ challenge, score, spending }) => ({
    ...challenge,
    personalHint: score > 0 ? CHALLENGE_HINTS[challenge.name] : undefined,
    realPotential: score > 0 ? Math.round(spending) : undefined,
  }));
}

export async function fetchSuggestions(): Promise<Challenge[]> {
  return fetchSmartSuggestions();
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
    const challenge = uc.challenge as Challenge;

    // --- Violation detection ---
    const violated = await checkViolation(challenge, uc.started_at);
    if (violated) {
      // Delete all check-ins and reset the challenge
      await supabase
        .from("challenge_checkins")
        .delete()
        .eq("user_challenge_id", uc.id);

      await supabase
        .from("user_challenges")
        .update({ started_at: new Date().toISOString(), progress: 0 } as any)
        .eq("id", uc.id);

      // Reload this challenge with fresh data
      uc.started_at = new Date().toISOString();
      uc.progress = 0;
    }

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

    const checkinCount = count ?? 0;
    const realSavings = await calculateRealSavings(challenge, uc.started_at, checkinCount);

    enriched.push({
      ...uc,
      challenge,
      checkin_count: checkinCount,
      checked_today: !!todayCheck,
      real_savings: realSavings,
      violated,
    });
  }

  return enriched;
}

/**
 * Checks if a violation occurred: any new expense transaction in the challenge's
 * related categories created AFTER the challenge started_at.
 * Old installments (created_at < started_at) are ignored.
 */
async function checkViolation(challenge: Challenge, startedAt: string): Promise<boolean> {
  const categories = CHALLENGE_CATEGORY_MAP[challenge.name];
  if (!categories || categories.length === 0) return false;

  const startDate = new Date(startedAt).toISOString().split("T")[0];

  // Find any expense in related categories where:
  // - date >= started_at (happened during challenge)
  // - created_at >= started_at (not an old installment)
  const { data: violations } = await supabase
    .from("transactions")
    .select("id, created_at, recurrence_type")
    .eq("type", "despesa")
    .in("category", categories)
    .gte("date", startDate)
    .gte("created_at", startedAt)
    .limit(1);

  return (violations?.length ?? 0) > 0;
}

async function calculateRealSavings(
  challenge: Challenge,
  startedAt: string,
  checkinDays: number
): Promise<number | null> {
  const categories = CHALLENGE_CATEGORY_MAP[challenge.name];
  if (!categories || categories.length === 0) return null;

  // Get 30 days of spending BEFORE challenge started
  const startDate = new Date(startedAt);
  const historyEnd = new Date(startDate);
  historyEnd.setDate(historyEnd.getDate() - 1);
  const historyStart = new Date(historyEnd);
  historyStart.setDate(historyStart.getDate() - 30);

  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount, date")
    .eq("type", "despesa")
    .in("category", categories)
    .gte("date", historyStart.toISOString().split("T")[0])
    .lte("date", historyEnd.toISOString().split("T")[0]);

  if (!transactions || transactions.length === 0) return null;

  // Calculate daily average based on distinct days with spending
  const uniqueDays = new Set(transactions.map((t) => t.date));
  const totalSpent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const avgDaily = totalSpent / Math.max(uniqueDays.size, 1);

  // Savings = average daily spending * days completed in challenge
  return Math.round(avgDaily * checkinDays);
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
