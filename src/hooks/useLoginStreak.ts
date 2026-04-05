import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Tracks daily login and calculates consecutive-day streak.
 * - Records today's login on first mount (idempotent via UNIQUE constraint)
 * - Fetches recent login_days to compute streak length
 */
export function useLoginStreak() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setStreak(0);
      setLoading(false);
      return;
    }

    const run = async () => {
      // 1. Record today's login (ignore duplicate error)
      const today = new Date().toISOString().split("T")[0];
      await supabase
        .from("login_days" as any)
        .insert({ user_id: user.id, login_date: today } as any)
        .select()
        .maybeSingle(); // ignore unique violation

      // 2. Fetch last 60 login days to compute streak
      const { data } = await supabase
        .from("login_days" as any)
        .select("login_date")
        .eq("user_id", user.id)
        .order("login_date", { ascending: false })
        .limit(60);

      if (!data || data.length === 0) {
        setStreak(0);
        setLoading(false);
        return;
      }

      // 3. Compute consecutive days starting from today
      const dates = new Set((data as any[]).map((d: any) => d.login_date));

      // Start from today and walk backwards
      let count = 0;
      const d = new Date();
      d.setHours(0, 0, 0, 0);

      // If today isn't logged yet (race condition), still check
      while (true) {
        const dateStr = d.toISOString().split("T")[0];
        if (dates.has(dateStr)) {
          count++;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }

      setStreak(count);
      setLoading(false);
    };

    run();
  }, [user]);

  return { streak, loading };
}
