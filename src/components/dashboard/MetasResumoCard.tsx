import { memo, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Target, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface GoalRow {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const GOAL_COLORS = [
  "hsl(40, 90%, 55%)",
  "hsl(150, 100%, 45%)",
  "hsl(210, 80%, 55%)",
  "hsl(330, 80%, 55%)",
  "hsl(270, 70%, 60%)",
  "hsl(180, 70%, 50%)",
];

const MetasResumoCard = memo(() => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data } = await supabase
        .from("goals")
        .select("id, name, target_amount, current_amount")
        .eq("user_id", user.id);

      setGoals(data || []);
      setLoading(false);
    };

    load();

    const handler = () => load();
    window.addEventListener("finance-data-changed", handler);
    return () => window.removeEventListener("finance-data-changed", handler);
  }, [user]);

  const totalGuardado = useMemo(() => goals.reduce((s, g) => s + g.current_amount, 0), [goals]);
  const totalObjetivo = useMemo(() => goals.reduce((s, g) => s + g.target_amount, 0), [goals]);
  const avgProgress = useMemo(
    () => goals.length > 0 ? goals.reduce((s, g) => s + Math.min(1, g.current_amount / g.target_amount), 0) / goals.length : 0,
    [goals]
  );

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

  if (goals.length === 0) return null;

  // Donut segments
  const donutSegments = goals.map((g, i) => ({
    ...g,
    pct: totalObjetivo > 0 ? (g.current_amount / totalObjetivo) * 100 : 0,
    progress: Math.min(1, g.current_amount / g.target_amount),
    color: GOAL_COLORS[i % GOAL_COLORS.length],
  }));

  // SVG donut — each segment shows its proportion of total saved
  let cumulativeOffset = 0;
  const donutPaths = donutSegments.map((seg) => {
    const offset = cumulativeOffset;
    // Each arc represents the goal's share of total target, filled by its progress
    const arcPct = totalObjetivo > 0 ? (seg.target_amount / totalObjetivo) * 100 : 0;
    const fillPct = arcPct * seg.progress;
    cumulativeOffset += arcPct;
    return { ...seg, offset, arcPct, fillPct };
  });

  return (
    <div
      className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl overflow-hidden cursor-pointer hover:border-border/30 transition-colors"
      style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.3)" }}
      onClick={() => navigate("/metas")}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-1">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Metas</h2>
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
                strokeDasharray={`${(seg.fillPct / 100) * 87.96} ${87.96}`}
                strokeDashoffset={`${-((seg.offset / 100) * 87.96)}`}
                strokeLinecap="round"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[9px] font-bold text-primary tabular-nums">{Math.round(avgProgress * 100)}%</span>
          </div>
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground/50">
            Total guardado · {goals.length} {goals.length === 1 ? "meta" : "metas"}
          </p>
          <p className="text-lg font-bold text-foreground tabular-nums">{fmt(totalGuardado)}</p>
          <p className="text-[9px] text-muted-foreground/40">de {fmt(totalObjetivo)}</p>
        </div>
      </div>

      {/* Goals list */}
      <div className="px-4 pb-3.5 space-y-2.5">
        {donutSegments.map((goal, idx) => {
          const pct = Math.round(goal.progress * 100);

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: goal.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-foreground/90 truncate">{goal.name}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-[12px] font-bold tabular-nums ${pct >= 100 ? "text-primary" : "text-foreground/70"}`}>
                  {pct}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

MetasResumoCard.displayName = "MetasResumoCard";
export default MetasResumoCard;
