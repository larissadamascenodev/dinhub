import { supabase } from "@/integrations/supabase/client";

export interface CreateTransactionInput {
  name: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  account_id?: string | null;
}

export interface TransactionFilters {
  month?: number;
  year?: number;
  type?: "income" | "expense";
  category?: string;
}

/**
 * Create a new transaction
 */
export async function createTransaction(input: CreateTransactionInput, userId: string) {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      name: input.name,
      type: input.type,
      amount: input.amount,
      category: input.category,
      date: input.date,
      account_id: input.account_id ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get transactions with filters
 */
export async function getTransactions(filters: TransactionFilters = {}) {
  let query = supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  if (filters.month !== undefined && filters.year !== undefined) {
    const start = new Date(filters.year, filters.month, 1).toISOString().split("T")[0];
    const end = new Date(filters.year, filters.month + 1, 0).toISOString().split("T")[0];
    query = query.gte("date", start).lte("date", end);
  }

  if (filters.type) {
    query = query.eq("type", filters.type);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/**
 * Get recent transactions (last 10)
 */
export async function getRecentTransactions(limit = 10) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string) {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
