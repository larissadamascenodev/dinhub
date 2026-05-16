import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "cancelled"
  | "past_due"
  | "disputed"
  | "refunded"
  | "inactive";

const POLL_INTERVAL_MS = 3_000;
const MAX_POLL_ATTEMPTS = 10; // ~30 seconds

export const useSubscription = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>("inactive");
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCountRef = useRef(0);

  const fetchStatus = useCallback(async (): Promise<SubscriptionStatus> => {
    if (!user) return "inactive";

    // Primary: dedicated subscriptions table
    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!subError && sub?.status) {
      return sub.status as SubscriptionStatus;
    }

    // Fallback: profiles.subscription_status (kept in sync by DB trigger)
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .maybeSingle();

    const ps = profile?.subscription_status as string | undefined;
    if (ps && ps !== "inactive") {
      return ps as SubscriptionStatus;
    }

    return "inactive";
  }, [user]);

  const checkSubscription = useCallback(async () => {
    try {
      const s = await fetchStatus();
      setStatus(s);
    } catch (err) {
      console.error("Error checking subscription:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  // Poll until subscription is active/trialing (used right after checkout)
  const startPollingUntilActive = useCallback(() => {
    if (!user) return;
    setPolling(true);
    pollCountRef.current = 0;

    const poll = async () => {
      try {
        const s = await fetchStatus();
        setStatus(s);
        pollCountRef.current++;

        const isActive = s === "active" || s === "trialing";
        const exhausted = pollCountRef.current >= MAX_POLL_ATTEMPTS;

        if (isActive || exhausted) {
          setPolling(false);
          return;
        }

        pollRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        setPolling(false);
      }
    };

    poll();
  }, [user, fetchStatus]);

  // Manual refresh (one-shot, no polling)
  const refresh = useCallback(async () => {
    setLoading(true);
    await checkSubscription();
  }, [checkSubscription]);

  useEffect(() => {
    if (!user) {
      setStatus("inactive");
      setLoading(false);
      return;
    }

    checkSubscription();

    const channel = supabase
      .channel(`subscription_changes_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setStatus(((payload.new as any)?.status as SubscriptionStatus) || "inactive");
          setLoading(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [user, checkSubscription]);

  const isSubscribed = status === "active" || status === "trialing";

  return { status, isSubscribed, loading, polling, refresh, startPollingUntilActive };
};
