import { supabase } from "@/integrations/supabase/client";

export interface CreateTransactionInput {
  name: string;
  type: "receita" | "despesa";
  amount: number;
  category: string;
  date: string;
  status?: "pago" | "pendente";
  account_id?: string | null;
  payment_method?: "conta" | "cartao";
  recurrence_type?: "unica" | "parcelado" | "fixa";
  installments?: number | null;
  installment_current?: number | null;
  observation?: string | null;
  credit_card_id?: string | null;
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
      account_id: input.payment_method === "cartao" ? null : (input.account_id ?? null),
      payment_method: input.payment_method ?? "conta",
      recurrence_type: input.recurrence_type ?? "unica",
      installments: input.installments ?? null,
      installment_current: input.installment_current ?? null,
      observation: input.observation ?? null,
      credit_card_id: input.payment_method === "cartao" ? (input.credit_card_id ?? null) : null,
    } as any)
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

  if (filters.type) query = query.eq("type", filters.type);
  if (filters.category) query = query.eq("category", filters.category);

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

// Account helpers
export async function getAccounts() {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .order("is_default", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createAccount(name: string, userId: string, type: "checking" | "cash" | "savings" = "checking") {
  const { data, error } = await supabase
    .from("accounts")
    .insert({ user_id: userId, name, type, is_default: false } as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Credit card helpers
export interface CreditCardInput {
  name: string;
  limit: number;
  closing_day: number;
  due_day: number;
  color?: string | null;
}

export async function getCreditCards() {
  const { data, error } = await supabase
    .from("credit_cards" as any)
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createCreditCard(input: CreditCardInput, userId: string) {
  const { data, error } = await supabase
    .from("credit_cards" as any)
    .insert({
      user_id: userId,
      name: input.name,
      limit: input.limit,
      closing_day: input.closing_day,
      due_day: input.due_day,
      color: input.color ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// AI category suggestion
export async function suggestCategory(description: string, type: "receita" | "despesa"): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke("suggest-category", {
      body: { description, type },
    });
    if (error) return null;
    return data?.category ?? null;
  } catch {
    return null;
  }
}
