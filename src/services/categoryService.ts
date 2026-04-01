import { supabase } from "@/integrations/supabase/client";

export interface CustomCategory {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export async function getCustomCategories(type?: "receita" | "despesa") {
  let query = supabase
    .from("custom_categories" as any)
    .select("*")
    .order("name", { ascending: true });

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as CustomCategory[];
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
