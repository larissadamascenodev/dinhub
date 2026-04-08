import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { prefetchDashboardData } from "@/services/dashboardData";
import { getAccounts, getCreditCards } from "@/services/transactionService";

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

  useEffect(() => {
    let mounted = true;

    const applySession = (nextSession: Session | null) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        applySession(session);

        if (initializedRef.current && mounted) {
          setLoading(false);
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

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
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
    await supabase.auth.signOut();
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
