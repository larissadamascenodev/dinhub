import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SubscriptionStatus = 'trialing' | 'active' | 'cancelled' | 'past_due' | 'disputed' | 'refunded' | 'inactive';

export const useSubscription = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>('inactive');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setStatus('inactive');
      setLoading(false);
      return;
    }

    const checkSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        setStatus((data?.status as SubscriptionStatus) || 'inactive');
      } catch (err) {
        console.error("Error checking subscription:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();

    // Subscribe to changes
    const subscription = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setStatus((payload.new as any)?.status || 'inactive');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const isSubscribed = status === 'active' || status === 'trialing';

  return { status, isSubscribed, loading };
};
