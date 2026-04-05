import { supabase } from "@/integrations/supabase/client";

export interface Invoice {
  id: string;
  user_id: string;
  credit_card_id: string;
  month: number;
  year: number;
  total_amount: number;
  paid_amount: number;
  is_paid: boolean;
  paid_at: string | null;
  paid_from_account_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  transaction_id: string;
  amount: number;
  installment_number: number;
  total_installments: number;
  created_at: string;
}

export async function getInvoices(cardId: string, month?: number, year?: number) {
  let query = supabase
    .from("invoices" as any)
    .select("*")
    .eq("credit_card_id", cardId)
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  if (month !== undefined) query = query.eq("month", month);
  if (year !== undefined) query = query.eq("year", year);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Invoice[];
}

export async function getInvoiceItems(invoiceId: string) {
  // Get items
  const { data: items, error } = await supabase
    .from("invoice_items" as any)
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("installment_number", { ascending: true });

  if (error) throw error;
  const typedItems = (items ?? []) as unknown as InvoiceItem[];

  // Get related transaction names
  const txIds = [...new Set(typedItems.map((i) => i.transaction_id))];
  if (txIds.length === 0) return [];

  const { data: txs } = await supabase
    .from("transactions")
    .select("id, name, category, date, status")
    .in("id", txIds);

  const txMap = new Map((txs ?? []).map((t: any) => [t.id, t]));

  return typedItems.map((item) => ({
    ...item,
    transaction_name: (txMap.get(item.transaction_id) as any)?.name ?? "Transação",
    transaction_category: (txMap.get(item.transaction_id) as any)?.category ?? "",
    transaction_date: (txMap.get(item.transaction_id) as any)?.date ?? "",
    transaction_status: (txMap.get(item.transaction_id) as any)?.status ?? "pendente",
  }));
}

export async function payInvoice(
  invoiceId: string,
  accountId: string,
  options?: { mode?: string; amount_paid?: number; installments?: number; entry_amount?: number }
) {
  const { data, error } = await supabase.functions.invoke("pay-invoice", {
    body: {
      invoice_id: invoiceId,
      account_id: accountId,
      mode: options?.mode ?? "total",
      amount_paid: options?.amount_paid,
      installments: options?.installments,
      entry_amount: options?.entry_amount,
    },
  });

  if (error) throw error;
  return data;
}

export async function undoInvoicePayment(invoiceId: string) {
  const { data, error } = await supabase.functions.invoke("undo-invoice-payment", {
    body: { invoice_id: invoiceId },
  });

  if (error) throw error;
  return data;
}
