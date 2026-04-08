import { memo, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface InvestmentAccount {
  id: string;
  name: string;
  current_balance: number;
  annual_rate: number | null;
  investment_type: string | null;
  color: string | null;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const InvestimentosResumoCard = memo(() => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<InvestmentAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      const { data } = await supabase
        .from("accounts")
        .select("id, name, current_balance, annual_rate, investment_type, color")
        .eq("user_id", user.id)
        .eq("type", "investimento")
        .eq("is_active", true);

      setAccounts(data || []);
      setLoading(false);
    };

    fetch();

    const handler = () => fetch();
    window.addEventListener("finance-data-changed", handler);
    return () => window.removeEventListener("finance-data-changed", handler);
  }, [user]);

  const totalInvested = useMemo(() => accounts.reduce((s, a) => s + a.current_balance, 0), [accounts]);
  const activeCount = accounts.length;

  // Group by investment_type
  const groups = useMemo(() => {
    const map = new Map<string, { total: number; count: number; rate: number }>();
    for (const acc of accounts) {
      const type = acc.investment_type || "Outros";
      const existing = map.get(type) || { total: 0, count: 0, rate: 0 };
      existing.total += acc.current_balance;
      existing.count += 1;
      existing.rate = acc.annual_rate || 0;
      map.set(type, existing);
    }
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [accounts]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-28 bg-muted/30 rounded" />
          <div className="h-16 w-full bg-muted/10 rounded-xl" />
        </div>
      </div>
    );
  }

  if (activeCount === 0) return null;

  // Donut chart values
  const donutSegments = groups.map((g, i) => ({
    ...g,
    pct: totalInvested > 0 ? (g.total / totalInvested) * 100 : 0,
    color: GROUP_COLORS[i % GROUP_COLORS.length],
  }));

  // SVG donut
  let cumulativeOffset = 0;
  const donutPaths = donutSegments.map((seg) => {
    const offset = cumulativeOffset;
    cumulativeOffset += seg.pct;
    return { ...seg, offset };
  });

  return (
    <div
      className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl overflow-hidden cursor-pointer hover:border-border/30 transition-colors"
      style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.3)" }}
      onClick={() => navigate("/gestao")}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Investimentos</h2>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
      </div>

      {/* Total with donut */}
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Mini Donut */}
        <div className="relative w-14 h-14 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--border) / 0.15)" strokeWidth="3.5" />
            {donutPaths.map((seg, i) => (
              <circle
                key={i}
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke={seg.color}
                strokeWidth="3.5"
                strokeDasharray={`${(seg.pct / 100) * 87.96} ${87.96}`}
                strokeDashoffset={`${-((seg.offset / 100) * 87.96)}`}
                strokeLinecap="round"
              />
            ))}
          </svg>
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground/50">
            Total investido · {activeCount} {activeCount === 1 ? "ativo" : "ativos"}
          </p>
          <p className="text-lg font-bold text-foreground tabular-nums">{fmt(totalInvested)}</p>
        </div>
      </div>

      {/* Groups */}
      <div className="px-4 pb-3.5 space-y-2.5">
        {donutSegments.map((group, idx) => {
          const pct = totalInvested > 0 ? Math.round((group.total / totalInvested) * 100) : 0;

          return (
            <motion.div
              key={group.name}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: group.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-foreground/90 truncate">{group.name}</p>
                <p className="text-[10px] text-muted-foreground/50">{pct}%</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[12px] font-bold text-foreground tabular-nums">{fmt(group.total)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

const GROUP_COLORS = [
  "hsl(150, 100%, 45%)", // primary green
  "hsl(200, 80%, 55%)",  // blue
  "hsl(35, 90%, 55%)",   // orange
  "hsl(280, 60%, 55%)",  // purple
  "hsl(0, 70%, 55%)",    // red
  "hsl(60, 70%, 50%)",   // yellow
];

InvestimentosResumoCard.displayName = "InvestimentosResumoCard";
export default InvestimentosResumoCard;
