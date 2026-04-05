import { memo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { CategoryExpense } from "@/types/finance";

interface Props {
  categories: CategoryExpense[];
  onVerAnalise?: () => void;
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const INITIAL_COUNT = 5;

const GastosPorCategoria = memo(({ categories, onVerAnalise }: Props) => {
  const sorted = [...categories].sort((a, b) => b.amount - a.amount);
  const totalExpenses = sorted.reduce((sum, c) => sum + c.amount, 0);
  const hasMore = sorted.length > INITIAL_COUNT;
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? sorted : sorted.slice(0, INITIAL_COUNT);

  return (
    <div
      className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl p-4"
      style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.3)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Gastos por Categoria</h3>
        <button
          onClick={onVerAnalise}
          className="text-[10px] text-primary/70 hover:text-primary transition-colors"
        >
          Ver todas
        </button>
      </div>

      <div className="space-y-2.5">
        {visible.map((cat, index) => {
          const pct = totalExpenses > 0 ? Math.round((cat.amount / totalExpenses) * 100) : 0;

          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-3"
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-primary" style={{ opacity: 1 - index * 0.12 }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{cat.name}</p>
                <div className="w-full h-1 bg-border/20 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.1 + index * 0.04, duration: 0.5, ease: "easeOut" }}
                    className="h-full rounded-full bg-primary"
                    style={{ opacity: 1 - index * 0.12 }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-foreground tabular-nums">{fmt(cat.amount)}</p>
                <p className="text-[9px] text-muted-foreground/50">{pct}%</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 mt-3 pt-2 border-t border-border/10 text-[10px] text-primary/70 hover:text-primary transition-colors font-medium"
        >
          {expanded ? (
            <>Mostrar menos <ChevronUp className="w-3 h-3" /></>
          ) : (
            <>Mais {sorted.length - INITIAL_COUNT} categorias <ChevronDown className="w-3 h-3" /></>
          )}
        </button>
      )}
    </div>
  );
});

GastosPorCategoria.displayName = "GastosPorCategoria";
export default GastosPorCategoria;
