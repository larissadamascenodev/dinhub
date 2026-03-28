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
      className="cursor-pointer rounded-xl border border-border/20 bg-card p-3 md:p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden relative"
      style={{ background: `linear-gradient(135deg, ${isPositive ? "hsl(var(--primary) / 0.05)" : "hsl(var(--destructive) / 0.05)"} 0%, transparent 60%)` }}
    >
      <div
        className={cn(
          "absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-30",
          isPositive ? "bg-primary" : "bg-destructive"
        )}
      />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <div className={cn(
            "w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            isPositive ? "bg-primary/15" : "bg-destructive/15"
          )}>
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
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
      </div>
    </motion.div>
  );
});

BalancoCard.displayName = "BalancoCard";
export default BalancoCard;
