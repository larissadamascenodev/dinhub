import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, ShieldCheck, BarChart3, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useFinancialProjection } from "@/hooks/useFinancialProjection";
import { cn } from "@/lib/utils";

const MONTH_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const ProjectionCard = memo(() => {
  const navigate = useNavigate();
  const { projections, healthScore, loading } = useFinancialProjection();

  const next6 = useMemo(() => projections.slice(1, 7), [projections]);

  // Build sparkline area path
  const { linePath, areaPath } = useMemo(() => {
    if (next6.length === 0) return { linePath: "", areaPath: "" };
    const deltas = next6.map((p) => p.delta);
    const max = Math.max(...deltas.map(Math.abs), 1);
    const h = 32;
    const w = 100;
    const step = w / (deltas.length - 1 || 1);
    const points = deltas.map((d, i) => ({
      x: i * step,
      y: h / 2 - (d / max) * (h / 2 - 3),
    }));
    const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const area = `${line} L${w},${h} L0,${h} Z`;
    return { linePath: line, areaPath: area };
  }, [next6]);

  const posMonths = next6.filter((p) => p.delta >= 0).length;
  const trend = posMonths >= 4 ? "positive" : posMonths >= 2 ? "neutral" : "negative";

  const score = healthScore.score;
  const scoreColor = score >= 75 ? "text-primary" : score >= 50 ? "text-yellow-400" : "text-destructive";
  const trendColor = trend === "positive" ? "hsl(var(--primary))" : trend === "negative" ? "hsl(var(--destructive))" : "hsl(220 10% 50%)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
      className="rounded-2xl overflow-hidden relative"
    >
      {/* Background with subtle gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(145deg, hsl(220 18% 13% / 0.9) 0%, hsl(220 20% 7% / 0.95) 100%)",
        }}
      />
      {/* Subtle glow effect */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none"
        style={{
          background: trend === "positive"
            ? "hsl(var(--primary) / 0.08)"
            : trend === "negative"
            ? "hsl(var(--destructive) / 0.06)"
            : "hsl(220 50% 50% / 0.05)",
        }}
      />
      <div className="absolute inset-0 border border-border/10 rounded-2xl" />

      <div className="relative">
        {/* Projeções Inteligentes */}
        <div
          className="px-4 pt-4 pb-3 cursor-pointer group/proj"
          onClick={() => navigate("/bot-finance/projecoes")}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="text-[11px] font-bold font-display text-foreground leading-tight">
                  Projeções Inteligentes
                </p>
                <p className="text-[8px] text-muted-foreground/50 mt-px">
                  Tendência · próximos 6 meses
                </p>
              </div>
            </div>

            {/* Score badge */}
            {!loading && next6.length > 0 && (
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full",
                score >= 75 ? "bg-primary/10" : score >= 50 ? "bg-yellow-400/10" : "bg-destructive/10"
              )}>
                <ShieldCheck className={cn("w-3 h-3", scoreColor)} />
                <span className={cn("text-[10px] font-bold tabular-nums", scoreColor)}>
                  {Math.round(score)}
                </span>
              </div>
            )}
          </div>

          {!loading && next6.length > 0 ? (
            <>
              {/* Sparkline with area fill */}
              <div className="relative mb-2">
                <svg width="100%" height="32" viewBox="0 0 100 32" preserveAspectRatio="none" className="w-full">
                  <defs>
                    <linearGradient id="area-grad-proj" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={trendColor} stopOpacity="0.2" />
                      <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="line-grad-proj" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={trendColor} stopOpacity="0.4" />
                      <stop offset="100%" stopColor={trendColor} stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill="url(#area-grad-proj)" />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="url(#line-grad-proj)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Trend + month dots */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
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
                <div className="flex items-center gap-1.5">
                  {next6.map((p) => (
                    <div key={`${p.month}-${p.year}`} className="flex flex-col items-center gap-0.5">
                      <div className={cn(
                        "w-[5px] h-[5px] rounded-full transition-colors",
                        p.delta >= 0 ? "bg-primary" : "bg-destructive/70"
                      )} />
                      <span className="text-[7px] text-muted-foreground/40 leading-none">{MONTH_SHORT[p.month]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-10 flex items-center">
              <div className="animate-pulse flex gap-2 w-full">
                <div className="h-1.5 flex-1 bg-muted/20 rounded-full" />
                <div className="h-1.5 w-12 bg-muted/10 rounded-full" />
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-border/10" />

        {/* Balanço Mensal */}
        <div
          className="px-4 py-3 cursor-pointer group/bal flex items-center justify-between"
          onClick={() => navigate("/bot-finance/balanco")}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-400/10 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] font-bold font-display text-foreground leading-tight group-hover/bal:text-blue-400 transition-colors">
                Balanço Mensal
              </p>
              <p className="text-[8px] text-muted-foreground/50 mt-px">
                Receitas vs Despesas por mês
              </p>
            </div>
          </div>

          {/* Mini bar chart icon */}
          <div className="flex items-end gap-[3px] h-5 group-hover/bal:opacity-80 transition-opacity">
            {[0.4, 0.7, 0.5, 1, 0.8].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h * 100}%` }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.4, ease: "easeOut" }}
                className="w-[3px] rounded-full bg-blue-400"
                style={{ opacity: 0.4 + h * 0.6 }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ProjectionCard.displayName = "ProjectionCard";
export default ProjectionCard;
