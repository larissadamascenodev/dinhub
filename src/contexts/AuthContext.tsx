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

    // 2. Then restore existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      initializedRef.current = true;
      applySession(session);

      if (mounted) {
        setLoading(false);
      }
    });

    // 3. Re-validate session when user returns to the tab/browser
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        supabase.auth.getSession().then(({ data: { session: freshSession } }) => {
          if (!mounted) return;
          if (freshSession) {
            applySession(freshSession);
          }
          // Don't force logout if no session — autoRefreshToken will recover
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [triggerPrefetch]);

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
