import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, TrendingUp, TrendingDown, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useFinancialProjection } from "@/hooks/useFinancialProjection";

const MONTH_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const ProjectionCard = memo(() => {
  const navigate = useNavigate();
  const { projections, healthScore, loading } = useFinancialProjection();

  // Take next 6 months (skip current)
  const next6 = useMemo(() => projections.slice(1, 7), [projections]);

  // Mini sparkline points
  const sparkline = useMemo(() => {
    if (next6.length === 0) return "";
    const deltas = next6.map((p) => p.delta);
    const max = Math.max(...deltas.map(Math.abs), 1);
    const h = 24;
    const w = 100;
    const step = w / (deltas.length - 1 || 1);
    return deltas
      .map((d, i) => {
        const x = i * step;
        const y = h / 2 - (d / max) * (h / 2 - 2);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [next6]);

  // Overall trend
  const posMonths = next6.filter((p) => p.delta >= 0).length;
  const trend = posMonths >= 4 ? "positive" : posMonths >= 2 ? "neutral" : "negative";

  const score = healthScore.score;
  const scoreColor = score >= 75 ? "text-primary" : score >= 50 ? "text-yellow-400" : "text-destructive";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      onClick={() => navigate("/bot-finance/projecoes")}
      className="cursor-pointer rounded-xl overflow-hidden relative group"
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, hsl(220 15% 14% / 0.6) 0%, hsl(220 18% 8% / 0.75) 50%, hsl(220 20% 4% / 0.9) 100%)",
        }}
      />
      <div className="absolute inset-0 border border-primary/10 rounded-xl group-hover:border-primary/25 transition-colors" />

      <div className="relative px-3.5 py-3.5 space-y-2.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[8px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">
              Projeções Inteligentes
            </p>
            <p className="text-[9px] text-muted-foreground/60 mt-0.5">
              Tendência dos próximos 6 meses
            </p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
          </div>
        </div>

        {!loading && next6.length > 0 && (
          <>
            {/* Sparkline + trend */}
            <div className="flex items-center gap-3">
              <svg width="100" height="24" viewBox="0 0 100 24" className="flex-shrink-0">
                <defs>
                  <linearGradient id="spark-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={trend === "negative" ? "hsl(var(--destructive))" : "hsl(var(--primary))"} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={trend === "negative" ? "hsl(var(--destructive))" : "hsl(var(--primary))"} stopOpacity="1" />
                  </linearGradient>
                </defs>
                <path
                  d={sparkline}
                  fill="none"
                  stroke="url(#spark-grad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex items-center gap-1">
                {trend === "positive" ? (
                  <TrendingUp className="w-3 h-3 text-primary" />
                ) : trend === "negative" ? (
                  <TrendingDown className="w-3 h-3 text-destructive" />
                ) : (
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                )}
                <span className={`text-[9px] font-semibold ${
                  trend === "positive" ? "text-primary" : trend === "negative" ? "text-destructive" : "text-muted-foreground"
                }`}>
                  {trend === "positive" ? "Favorável" : trend === "negative" ? "Atenção" : "Estável"}
                </span>
              </div>
            </div>

            {/* Month indicators + health score */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {next6.map((p) => (
                  <div key={`${p.month}-${p.year}`} className="flex flex-col items-center gap-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${p.delta >= 0 ? "bg-primary/70" : "bg-destructive/70"}`} />
                    <span className="text-[7px] text-muted-foreground/50">{MONTH_SHORT[p.month]}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className={`w-3 h-3 ${scoreColor}`} />
                <span className={`text-[10px] font-bold tabular-nums ${scoreColor}`}>
                  {Math.round(score)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
});

ProjectionCard.displayName = "ProjectionCard";
export default ProjectionCard;
