import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, ShieldCheck, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useFinancialProjection } from "@/hooks/useFinancialProjection";
import { cn } from "@/lib/utils";

const MONTH_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const ProjectionCard = memo(() => {
  const navigate = useNavigate();
  const { projections, healthScore, loading } = useFinancialProjection();

  const next6 = useMemo(() => projections.slice(1, 7), [projections]);

  const sparkline = useMemo(() => {
    if (next6.length === 0) return "";
    const deltas = next6.map((p) => p.delta);
    const max = Math.max(...deltas.map(Math.abs), 1);
    const h = 28;
    const w = 80;
    const step = w / (deltas.length - 1 || 1);
    return deltas
      .map((d, i) => {
        const x = i * step;
        const y = h / 2 - (d / max) * (h / 2 - 2);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [next6]);

  const posMonths = next6.filter((p) => p.delta >= 0).length;
  const trend = posMonths >= 4 ? "positive" : posMonths >= 2 ? "neutral" : "negative";

  const score = healthScore.score;
  const scoreColor = score >= 75 ? "text-primary" : score >= 50 ? "text-yellow-400" : "text-destructive";
  const scoreBg = score >= 75 ? "bg-primary/10" : score >= 50 ? "bg-yellow-400/10" : "bg-destructive/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      onClick={() => navigate("/bot-finance/projecoes")}
      className="cursor-pointer rounded-xl overflow-hidden relative group active:scale-[0.98] transition-transform"
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, hsl(220 15% 14% / 0.6) 0%, hsl(220 18% 8% / 0.75) 50%, hsl(220 20% 4% / 0.9) 100%)",
        }}
      />
      <div className="absolute inset-0 border border-border/10 rounded-xl group-hover:border-primary/20 transition-colors" />

      <div className="relative px-4 py-3.5">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Sparkline */}
            {!loading && next6.length > 0 && (
              <div className="flex-shrink-0">
                <svg width="44" height="28" viewBox="0 0 80 28" className="w-11 h-7">
                  <defs>
                    <linearGradient id="spark-grad-proj" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={trend === "negative" ? "hsl(var(--destructive))" : "hsl(var(--primary))"} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={trend === "negative" ? "hsl(var(--destructive))" : "hsl(var(--primary))"} stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  <path
                    d={sparkline}
                    fill="none"
                    stroke="url(#spark-grad-proj)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}

            <div className="min-w-0">
              <p className="text-[11px] font-semibold font-display text-foreground leading-tight">
                Projeções Inteligentes
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {!loading && next6.length > 0 && (
                  <>
                    <div className="flex items-center gap-0.5">
                      {trend === "positive" ? (
                        <TrendingUp className="w-3 h-3 text-primary" />
                      ) : trend === "negative" ? (
                        <TrendingDown className="w-3 h-3 text-destructive" />
                      ) : (
                        <TrendingUp className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className={cn("text-[9px] font-semibold",
                        trend === "positive" ? "text-primary" : trend === "negative" ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {trend === "positive" ? "Favorável" : trend === "negative" ? "Atenção" : "Estável"}
                      </span>
                    </div>
                    <span className="text-muted-foreground/30 text-[8px]">•</span>
                    <div className={cn("flex items-center gap-0.5 px-1.5 py-0.5 rounded-full", scoreBg)}>
                      <ShieldCheck className={cn("w-2.5 h-2.5", scoreColor)} />
                      <span className={cn("text-[9px] font-bold tabular-nums", scoreColor)}>
                        {Math.round(score)}
                      </span>
                    </div>
                  </>
                )}
                {(loading || next6.length === 0) && (
                  <span className="text-[9px] text-muted-foreground/60">Tendência dos próximos 6 meses</span>
                )}
              </div>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 group-hover:text-primary/60 transition-colors" />
        </div>

        {/* Month dots */}
        {!loading && next6.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2.5 pl-0.5">
            {next6.map((p) => (
              <div key={`${p.month}-${p.year}`} className="flex flex-col items-center gap-0.5">
                <div className={cn("w-1.5 h-1.5 rounded-full", p.delta >= 0 ? "bg-primary/70" : "bg-destructive/70")} />
                <span className="text-[7px] text-muted-foreground/50 leading-none">{MONTH_SHORT[p.month]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
});

ProjectionCard.displayName = "ProjectionCard";
export default ProjectionCard;
