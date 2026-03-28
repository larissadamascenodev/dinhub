import { supabase } from "@/integrations/supabase/client";

export interface CreateTransactionInput {
  name: string;
  type: "receita" | "despesa";
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  status?: "pago" | "pendente";
  account_id?: string | null;
}

export interface TransactionFilters {
  month?: number;
  year?: number;
  type?: "receita" | "despesa";
  category?: string;
}

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
      status: input.status ?? "pago",
      account_id: input.account_id ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTransactionStatus(id: string, status: "pago" | "pendente") {
  const { data, error } = await supabase
    .from("transactions")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTransaction(id: string, updates: {
  name?: string;
  amount?: number;
  category?: string;
  date?: string;
  type?: "receita" | "despesa";
  status?: "pago" | "pendente";
}) {
  const { data, error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

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

export async function getRecentTransactions(limit = 10) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("status", "pago")
    .order("date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
