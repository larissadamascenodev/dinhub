import { memo } from "react";
import { motion } from "framer-motion";
import type { CategoryExpense } from "@/types/finance";

interface Props {
  categories: CategoryExpense[];
  onVerAnalise?: () => void;
}

const fmtShort = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });

const GastosPorCategoria = memo(({ categories, onVerAnalise }: Props) => {
  const top = [...categories].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const maxValue = top[0]?.amount || 1;
  const totalExpenses = top.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div
      className="rounded-xl border border-border/20 bg-card shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden p-4"
      style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.03) 0%, transparent 60%)" }}
    >
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Gastos por Categoria</h3>
        <button
          onClick={onVerAnalise}
          className="text-[10px] text-primary/70 hover:text-primary transition-colors"
        >
          Ver todas
        </button>
      </div>

      <div className="space-y-1.5">
        {top.map((cat, index) => {
          const barPct = Math.round((cat.amount / maxValue) * 100);
          const color = cat.color;

          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
              style={{
                background: `linear-gradient(135deg, ${color}14 0%, transparent 60%)`,
                border: `1px solid ${color}1a`,
                boxShadow: `0 1px 4px -1px rgba(0,0,0,0.15), inset 0 1px 0 0 rgba(255,255,255,0.03)`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                style={{
                  background: `linear-gradient(135deg, ${color}35, ${color}15)`,
                  boxShadow: `0 0 12px ${color}20`,
                }}
              >
                {cat.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-foreground truncate">{cat.name}</span>
                  <span className="text-sm font-bold text-foreground tabular-nums ml-2">
                    {fmtShort(cat.amount)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-muted/20 mb-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barPct}%` }}
                    transition={{ delay: 0.1 + index * 0.04, duration: 0.5, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                    {totalExpenses > 0 ? Math.round((cat.amount / totalExpenses) * 100) : 0}% do total
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

GastosPorCategoria.displayName = "GastosPorCategoria";
export default GastosPorCategoria;
