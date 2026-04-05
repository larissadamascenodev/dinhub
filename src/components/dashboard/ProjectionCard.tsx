import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFinancialProjection } from "@/hooks/useFinancialProjection";

const ProjectionCard = memo(() => {
  const navigate = useNavigate();
  const { projections } = useFinancialProjection();

  const points = useMemo(() => {
    const slice = projections.slice(0, 6);
    if (!slice.length) return [];
    const values = slice.map((p) => p.balance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    return values.map((v, i) => ({
      x: (i / Math.max(slice.length - 1, 1)) * 100,
      y: 100 - ((v - min) / range) * 80 - 10, // 10-90 range
    }));
  }, [projections]);

  const trend = projections.length >= 2
    ? projections[projections.length - 1].balance - projections[0].balance
    : 0;
  const isPositive = trend >= 0;

  const pathD = points.length > 1
    ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
    : "";
  const areaD = pathD ? `${pathD} L 100 100 L 0 100 Z` : "";

  const months = useMemo(() => {
    return projections.slice(0, 6).map((p) => {
      const d = new Date(p.year, p.month);
      return d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    });
  }, [projections]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="cursor-pointer rounded-xl border border-border/10 overflow-hidden relative group"
      style={{
        background:
          "linear-gradient(160deg, hsl(220 15% 14% / 0.6) 0%, hsl(220 18% 8% / 0.75) 50%, hsl(220 20% 4% / 0.9) 100%)",
      }}
      onClick={() => navigate("/bot-finance/projecoes")}
    >
      <div className="relative p-3 md:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center",
              isPositive ? "bg-primary/10" : "bg-destructive/10"
            )}>
              {isPositive
                ? <TrendingUp className="w-4 h-4 text-primary" />
                : <TrendingDown className="w-4 h-4 text-destructive" />
              }
            </div>
            <div>
              <h3 className="text-[11px] font-semibold font-display leading-tight">Projeções</h3>
              <p className="text-[9px] text-muted-foreground leading-tight">
                {isPositive ? "Tendência positiva" : "Tendência de queda"}
              </p>
            </div>
          </div>
        </div>

        {/* Mini chart */}
        <div className="h-14 md:h-16 w-full relative">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? "hsl(150 100% 45%)" : "hsl(0 60% 50%)"} stopOpacity="0.25" />
                <stop offset="100%" stopColor={isPositive ? "hsl(150 100% 45%)" : "hsl(0 60% 50%)"} stopOpacity="0" />
              </linearGradient>
            </defs>
            {areaD && <path d={areaD} fill="url(#projGrad)" />}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke={isPositive ? "hsl(150 100% 45%)" : "hsl(0 60% 50%)"}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {/* Dots */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="3"
                fill={i === 0 ? "hsl(220 15% 92%)" : isPositive ? "hsl(150 100% 45%)" : "hsl(0 60% 50%)"}
                stroke="hsl(220 20% 8%)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
          {/* Month labels */}
          {months.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-between translate-y-4">
              {months.map((m, i) => (
                <span key={i} className={cn(
                  "text-[7px] md:text-[8px] uppercase tracking-wider",
                  i === 0 ? "text-foreground/60 font-medium" : "text-muted-foreground/40"
                )}>{m}</span>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-center gap-1.5 mt-6 pt-2 border-t border-border/10">
          <span className="text-[10px] md:text-[11px] text-muted-foreground group-hover:text-primary transition-colors font-medium">
            Ver projeção completa
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </motion.div>
  );
});

ProjectionCard.displayName = "ProjectionCard";
export default ProjectionCard;
