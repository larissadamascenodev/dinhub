import { memo } from "react";
import { Scale, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFormattedCounter } from "@/hooks/useAnimatedCounter";

interface Props {
  balanco: number;
}

const BalancoCard = memo(({ balanco }: Props) => {
  const isPositive = balanco >= 0;
  const animatedBalanco = useFormattedCounter(balanco);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="cursor-pointer rounded-xl border border-border/10 p-3 md:p-4 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.5)] backdrop-blur-sm overflow-hidden relative"
      style={{ background: "linear-gradient(160deg, hsl(220 15% 14% / 0.6) 0%, hsl(220 18% 8% / 0.75) 50%, hsl(220 20% 4% / 0.9) 100%)" }}
    >
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <div className={cn(
            "w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            isPositive ? "bg-primary/10" : "bg-destructive/10"
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
              {animatedBalanco}
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
