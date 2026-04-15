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

  useEffect(() => {
    let mounted = true;

    const applySession = (nextSession: Session | null) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only clear session on explicit sign out, not on token refresh failures
        if (event === "SIGNED_OUT" && !manualSignOutRef.current) {
          // Token refresh may have failed — try to recover silently
          // Don't immediately clear user state
          return;
        }

        applySession(session);

        if (initializedRef.current && mounted) {
          setLoading(false);
        }

        // Reset manual sign out flag after processing
        if (event === "SIGNED_OUT") {
          manualSignOutRef.current = false;
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      initializedRef.current = true;
      applySession(session);

      if (mounted) {
        setLoading(false);
      }
    });

    // Re-validate session when the user returns to the tab/browser
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        supabase.auth.getSession().then(({ data: { session: freshSession } }) => {
          if (!mounted) return;
          if (freshSession) {
            applySession(freshSession);
          }
          // If no session and user was logged in, don't force logout —
          // autoRefreshToken will attempt recovery on next API call
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    clearFinanceQueryCache();
    if (!user) return;

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    void Promise.all([
      prefetchDashboardData(month, year, { userId: user.id, includeHistorical: false }),
      getAccounts(),
      getCreditCards(),
    ]).catch(() => {});
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
