import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, ChevronRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFinancialProjection } from "@/hooks/useFinancialProjection";

interface Props {
  saldoAtual: number;
  saldoPrevisto: number;
  balanco: number;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ProjectionCard = memo(({ saldoAtual, saldoPrevisto, balanco }: Props) => {
  const navigate = useNavigate();
  const { projections } = useFinancialProjection();

  // Take first 6 months for mini sparkline
  const points = useMemo(() => {
    const slice = projections.slice(0, 6);
    if (!slice.length) return [];
    const values = slice.map((p) => p.balance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    return values.map((v, i) => ({
      x: (i / Math.max(slice.length - 1, 1)) * 100,
      y: 100 - ((v - min) / range) * 100,
    }));
  }, [projections]);

  const trend = projections.length >= 2
    ? projections[projections.length - 1].balance - projections[0].balance
    : balanco;
  const isPositive = trend >= 0;

  // Build SVG path
  const pathD = points.length > 1
    ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
    : "";

  const areaD = pathD
    ? `${pathD} L 100 100 L 0 100 Z`
    : "";

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
      {/* Mini sparkline background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          {areaD && (
            <path
              d={areaD}
              fill={isPositive ? "hsl(150 100% 45% / 0.3)" : "hsl(0 60% 50% / 0.3)"}
            />
          )}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={isPositive ? "hsl(150 100% 45%)" : "hsl(0 60% 50%)"}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
      </div>

      <div className="relative p-3 md:p-4 space-y-2.5">
        {/* Header */}
        <div className="flex items-center justify-between">
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
              <p className="text-[9px] text-muted-foreground leading-tight">Próximos 6 meses</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
        </div>

        {/* Values row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-secondary/30 rounded-lg px-2.5 py-2">
            <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">Atual</p>
            <p className="text-xs font-bold tabular-nums text-foreground leading-tight">{fmt(saldoAtual)}</p>
          </div>
          <div className="bg-secondary/30 rounded-lg px-2.5 py-2">
            <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">Previsto</p>
            <p className={cn(
              "text-xs font-bold tabular-nums leading-tight",
              saldoPrevisto >= 0 ? "text-primary" : "text-destructive"
            )}>
              {fmt(saldoPrevisto)}
            </p>
          </div>
        </div>

        {/* Trend badge */}
        <div className={cn(
          "flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5",
          isPositive ? "bg-primary/8" : "bg-destructive/8"
        )}>
          {isPositive
            ? <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
            : <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
          }
          <span className={cn(
            "text-[10px] font-semibold",
            isPositive ? "text-primary" : "text-destructive"
          )}>
            {isPositive ? "Tendência positiva" : "Tendência negativa"}
            <span className="ml-1 opacity-70">({fmt(Math.abs(trend))})</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
});

ProjectionCard.displayName = "ProjectionCard";
export default ProjectionCard;
