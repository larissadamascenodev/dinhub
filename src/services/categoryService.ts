import { supabase } from "@/integrations/supabase/client";

export interface CustomCategory {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  is_hidden_default: boolean;
  created_at: string;
  updated_at: string;
}

// Module-level cache for custom categories
let cachedCategories: CustomCategory[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30_000; // 30s

export function invalidateCustomCategoryCache() {
  cachedCategories = null;
  cacheTimestamp = 0;
}

// Listen for changes to invalidate cache
if (typeof window !== "undefined") {
  window.addEventListener("finance-data-changed", invalidateCustomCategoryCache);
}

export async function getCustomCategories(type?: "receita" | "despesa") {
  // Use cache if fresh and no type filter
  if (!type && cachedCategories && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedCategories;
  }

  let query = supabase
    .from("custom_categories" as any)
    .select("*")
    .order("name", { ascending: true });

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) throw error;
  const result = (data ?? []) as unknown as CustomCategory[];

  if (!type) {
    cachedCategories = result;
    cacheTimestamp = Date.now();
  }

  return result;
}

export async function createCustomCategory(
  userId: string,
  input: { name: string; icon: string; color: string; type: string }
) {
  const { data, error } = await supabase
    .from("custom_categories" as any)
    .insert({
      user_id: userId,
      name: input.name,
      icon: input.icon,
      color: input.color,
      type: input.type,
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as CustomCategory;
}

export async function updateCustomCategory(
  id: string,
  updates: { name?: string; icon?: string; color?: string }
) {
  const { data, error } = await supabase
    .from("custom_categories" as any)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as CustomCategory;
}

export async function deleteCustomCategory(id: string) {
  const { error } = await supabase
    .from("custom_categories" as any)
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function hideDefaultCategory(
  userId: string,
  name: string,
  type: string
) {
  const { error } = await supabase
    .from("custom_categories" as any)
    .insert({
      user_id: userId,
      name,
      icon: "📋",
      color: "#888888",
      type,
      is_hidden_default: true,
    });

  if (error) throw error;
}

export async function unhideDefaultCategory(userId: string, name: string, type: string) {
  const { error } = await supabase
    .from("custom_categories" as any)
    .delete()
    .eq("name", name)
    .eq("type", type)
    .eq("is_hidden_default", true);

  if (error) throw error;
}
