import { supabase } from "@/integrations/supabase/client";

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoalTransaction {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  date: string;
  source: string | null;
  created_at: string;
}

export async function fetchGoals(): Promise<Goal[]> {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Goal[];
}

export async function fetchGoalById(id: string): Promise<Goal> {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Goal;
}

export async function createGoal(goal: {
  name: string;
  target_amount: number;
  monthly_contribution?: number | null;
  deadline?: string | null;
}, userId: string): Promise<Goal> {
  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: userId,
      name: goal.name,
      target_amount: goal.target_amount,
      monthly_contribution: goal.monthly_contribution ?? null,
      deadline: goal.deadline ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Goal;
}

export async function updateGoal(id: string, updates: Partial<{
  name: string;
  target_amount: number;
  monthly_contribution: number | null;
  deadline: string | null;
}>): Promise<void> {
  const { error } = await supabase.from("goals").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchGoalTransactions(goalId: string): Promise<GoalTransaction[]> {
  const { data, error } = await supabase
    .from("goal_transactions")
    .select("*")
    .eq("goal_id", goalId)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as GoalTransaction[];
}

export async function createGoalDeposit(deposit: {
  goal_id: string;
  amount: number;
  date: string;
  source?: string | null;
}, userId: string): Promise<GoalTransaction> {
  const { data, error } = await supabase
    .from("goal_transactions")
    .insert({
      goal_id: deposit.goal_id,
      user_id: userId,
      amount: deposit.amount,
      date: deposit.date,
      source: deposit.source ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as GoalTransaction;
}

export async function deleteGoalDeposit(id: string): Promise<void> {
  const { error } = await supabase.from("goal_transactions").delete().eq("id", id);
  if (error) throw error;
}

export function computeGoalInsights(
  goal: Goal,
  transactions: GoalTransaction[],
  topExpenseCategory?: string
): string[] {
  const insights: string[] = [];
  const remaining = goal.target_amount - goal.current_amount;

  if (remaining <= 0) {
    insights.push("🎉 Parabéns! Você atingiu sua meta!");
    return insights;
  }

  // Monthly contribution prediction
  if (goal.monthly_contribution && goal.monthly_contribution > 0) {
    const monthsLeft = Math.ceil(remaining / goal.monthly_contribution);
    insights.push(
      `Se continuar depositando R$ ${goal.monthly_contribution.toFixed(0)}/mês, você conclui em ${monthsLeft} ${monthsLeft === 1 ? "mês" : "meses"} 👀`
    );
  }

  // History-based prediction
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const recentDeposits = transactions.filter(
    (t) => new Date(t.date) >= threeMonthsAgo
  );
  if (recentDeposits.length > 0) {
    const totalRecent = recentDeposits.reduce((s, t) => s + Number(t.amount), 0);
    const monthsSpan = Math.max(
      1,
      (now.getTime() - threeMonthsAgo.getTime()) / (30 * 24 * 60 * 60 * 1000)
    );
    const avgMonthly = totalRecent / monthsSpan;
    if (avgMonthly > 0 && !goal.monthly_contribution) {
      const monthsLeft = Math.ceil(remaining / avgMonthly);
      insights.push(
        `Com base nos seus depósitos recentes, previsão de conclusão em ~${monthsLeft} ${monthsLeft === 1 ? "mês" : "meses"}`
      );
    }
  }

  // Category suggestion
  if (topExpenseCategory) {
    insights.push(
      `Se reduzir gastos em "${topExpenseCategory}" em R$ 100/mês, você atinge sua meta mais rápido 😉`
    );
  }

  // Encouragement
  const progress = goal.current_amount / goal.target_amount;
  if (progress > 0.5) {
    insights.push("Tá mais perto do que parece! 💪");
  } else if (progress > 0.2) {
    insights.push("Bom progresso! Continue assim que vai dar certo ✨");
  } else if (remaining > 1000) {
    insights.push(
      "Falta um bom valor ainda — que tal definir um valor mensal fixo pra acelerar isso?"
    );
  }

  return insights;
}
