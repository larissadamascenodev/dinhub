import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { prefetchDashboardData } from "@/services/dashboardData";
import { clearFinanceQueryCache, getAccounts, getCreditCards } from "@/services/transactionService";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);
  const manualSignOutRef = useRef(false);
  const prefetchedUserRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Proactively refresh the session ~2 minutes before expiry to avoid
  // any latency or unexpected logout from an expired access token.
  const scheduleProactiveRefresh = useCallback((nextSession: Session | null) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (!nextSession?.expires_at) return;

    const expiresAtMs = nextSession.expires_at * 1000;
    const refreshLeadMs = 2 * 60 * 1000; // refresh 2 min before expiry
    const delay = Math.max(expiresAtMs - Date.now() - refreshLeadMs, 5_000);

    refreshTimerRef.current = setTimeout(async () => {
      try {
        await supabase.auth.refreshSession();
      } catch {
        // onAuthStateChange will react to any successful refresh
      }
    }, delay);
  }, []);

  // Start prefetching data as soon as we have a user — deduped by userId
  const triggerPrefetch = useCallback((userId: string) => {
    if (prefetchedUserRef.current === userId) return;
    prefetchedUserRef.current = userId;

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    // Fire-and-forget — don't block auth flow
    Promise.all([
      prefetchDashboardData(month, year, { userId, includeHistorical: false }),
      getAccounts(),
      getCreditCards(),
    ]).catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;

    const applySession = (nextSession: Session | null) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      scheduleProactiveRefresh(nextSession);

      // Start prefetching immediately when session is available
      if (nextSession?.user) {
        triggerPrefetch(nextSession.user.id);
      }
    };

    // 1. Set up listener FIRST (catches all subsequent events)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only clear session on explicit sign out
        if (event === "SIGNED_OUT") {
          if (manualSignOutRef.current) {
            applySession(null);
            manualSignOutRef.current = false;
            prefetchedUserRef.current = null;
          }
          // Ignore SIGNED_OUT from token refresh failures — keep current session
          if (initializedRef.current && mounted) setLoading(false);
          return;
        }

        applySession(session);

        if (initializedRef.current && mounted) {
          setLoading(false);
        }
      }
    );

    // 2. Then restore existing session — fall back to refresh if expired
    (async () => {
      let { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Try refresh in case access token expired but refresh token is still valid
        const { data: refreshed } = await supabase.auth.refreshSession();
        session = refreshed.session ?? null;
      }
      initializedRef.current = true;
      applySession(session);
      if (mounted) setLoading(false);
    })();

    // 3. Re-validate session when user returns to the tab/browser
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "visible") return;
      let { data: { session: freshSession } } = await supabase.auth.getSession();
      if (!freshSession) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        freshSession = refreshed.session ?? null;
      }
      if (!mounted) return;
      if (freshSession) applySession(freshSession);
      // Don't force logout if no session — keep current state
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [triggerPrefetch, scheduleProactiveRefresh]);

  // Clear cache when user changes (logout → login as different user)
  useEffect(() => {
    if (!user) {
      clearFinanceQueryCache();
      prefetchedUserRef.current = null;
    }
  }, [user]);

  const signOut = useCallback(async () => {
    manualSignOutRef.current = true;
    await supabase.auth.signOut({ scope: "local" });
  }, []);

  const value = useMemo(
    () => ({ user, session, loading, signOut }),
    [user, session, loading, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
