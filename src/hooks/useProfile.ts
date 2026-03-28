import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Profile {
  id: string;
  display_name: string | null;
  has_completed_profile: boolean;
  has_account: boolean;
  has_transactions: boolean;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) { setProfile(null); setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from("profiles" as any)
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code === "PGRST116") {
        // Profile not found, create it
        const { data: newProfile } = await supabase
          .from("profiles" as any)
          .insert({ id: user.id } as any)
          .select()
          .single();
        setProfile(newProfile as unknown as Profile);
      } else if (data) {
        setProfile(data as unknown as Profile);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateDisplayName = useCallback(async (name: string) => {
    if (!user) return;
    await supabase
      .from("profiles" as any)
      .update({ display_name: name, has_completed_profile: true } as any)
      .eq("id", user.id);
    await fetchProfile();
  }, [user, fetchProfile]);

  const isOnboardingComplete = profile
    ? profile.has_completed_profile && profile.has_account && profile.has_transactions
    : false;

  return { profile, loading, refetch: fetchProfile, updateDisplayName, isOnboardingComplete };
}
