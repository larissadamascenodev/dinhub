import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch all "fixa" transactions that should appear in a given month.
 * A fixa transaction appears in every month from its creation date onward,
 * unless there's an exclusion record for that specific month.
 */
export async function getRecurringForMonth(month: number, year: number) {
  const targetDate = new Date(year, month + 1, 0); // last day of target month
  const targetDateStr = targetDate.toISOString().split("T")[0];

  // Fetch all fixa transactions created on or before the target month
  const { data: fixaTxs, error: txError } = await supabase
    .from("transactions")
    .select("*")
    .eq("recurrence_type", "fixa")
    .lte("date", targetDateStr)
    .order("date", { ascending: false });

  if (txError) throw txError;
  if (!fixaTxs || fixaTxs.length === 0) return [];

  const buildSignature = (t: any) => [
    t.name,
    t.type,
    t.category,
    Number(t.amount).toFixed(2),
    t.payment_method ?? "",
    t.account_id ?? "",
    t.credit_card_id ?? "",
  ].join("::");

  // Keep only the latest fixed transaction per signature.
  // This prevents duplicated carry-over when the same fixed item exists in multiple months.
  const latestBySignature = new Map<string, any>();
  for (const tx of fixaTxs) {
    const key = buildSignature(tx);
    if (!latestBySignature.has(key)) {
      latestBySignature.set(key, tx);
    }
  }

  const uniqueFixaTxs = Array.from(latestBySignature.values());
  const txIds = uniqueFixaTxs.map((t) => t.id);
  if (txIds.length === 0) return [];

  // Fetch exclusions for this month
  const { data: exclusions, error: exError } = await supabase
    .from("recurring_exclusions" as any)
    .select("transaction_id")
    .eq("month", month)
    .eq("year", year)
    .in("transaction_id", txIds);

  if (exError) throw exError;

  const excludedIds = new Set((exclusions ?? []).map((e: any) => e.transaction_id));

  // Filter out excluded and transactions whose original month IS this month
  // (those are already fetched by the normal query)
  return uniqueFixaTxs.filter((t) => {
    if (excludedIds.has(t.id)) return false;
    const origDate = new Date(t.date);
    if (origDate.getMonth() === month && origDate.getFullYear() === year) return false;
    return true;
  });
}

/**
 * Exclude a fixa transaction from a specific month (soft delete).
 */
export async function excludeRecurringForMonth(
  transactionId: string,
  month: number,
  year: number,
  userId: string
) {
  const { error } = await supabase
    .from("recurring_exclusions" as any)
    .insert({
      transaction_id: transactionId,
      month,
      year,
      user_id: userId,
    });

  if (error) throw error;
}

/**
 * Exclude a fixa transaction from a specific month and ALL future months.
 * We do this by creating exclusions for the next 60 months (5 years)
 * AND updating the original transaction to mark it as ended.
 */
export async function excludeRecurringFromMonthOnward(
  transactionId: string,
  fromMonth: number,
  fromYear: number,
  userId: string
) {
  const exclusions: { transaction_id: string; month: number; year: number; user_id: string }[] = [];

  let m = fromMonth;
  let y = fromYear;
  for (let i = 0; i < 60; i++) {
    exclusions.push({
      transaction_id: transactionId,
      month: m,
      year: y,
      user_id: userId,
    });
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }

  const { error } = await supabase
    .from("recurring_exclusions" as any)
    .upsert(exclusions, { onConflict: "transaction_id,month,year" });

  if (error) throw error;
}
