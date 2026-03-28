import { memo } from "react";
import { Scale, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  balanco: number;
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

const BalancoCard = memo(({ balanco }: Props) => {
  const isPositive = balanco >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative cursor-pointer rounded-2xl overflow-hidden p-3 md:p-4"
      style={{
        background: "linear-gradient(145deg, hsl(225 20% 10%) 0%, hsl(225 22% 6%) 100%)",
        boxShadow: "0 4px 24px -4px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.04)",
        border: "1px solid hsl(225 14% 16% / 0.5)",
      }}
    >
      {/* Glow accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isPositive
            ? "radial-gradient(ellipse at 0% 50%, hsl(152 45% 45% / 0.05) 0%, transparent 40%)"
            : "radial-gradient(ellipse at 0% 50%, hsl(0 55% 48% / 0.05) 0%, transparent 40%)",
        }}
      />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <div className={cn(
            "w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          )}
            style={{
              background: isPositive
                ? "linear-gradient(135deg, hsl(152 50% 48% / 0.15) 0%, hsl(152 50% 48% / 0.05) 100%)"
                : "linear-gradient(135deg, hsl(0 55% 48% / 0.15) 0%, hsl(0 55% 48% / 0.05) 100%)",
            }}
          >
            <Scale className={cn("w-4 h-4 md:w-5 md:h-5", isPositive ? "text-primary" : "text-destructive")} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-[0.12em] md:tracking-[0.15em] font-semibold block whitespace-nowrap">
              Balanço do mês
            </span>
            <span className={cn(
              "font-display text-base md:text-xl font-bold tabular-nums leading-tight truncate block",
              isPositive ? "text-primary" : "text-destructive"
            )}>
              {fmt(balanco)}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
      </div>
    </motion.div>
  );
});

BalancoCard.displayName = "BalancoCard";
export default BalancoCard;
