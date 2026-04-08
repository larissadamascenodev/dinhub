import { memo, useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { CategoryExpense } from "@/types/finance";
import { getCategoryIcon, getCategoryColor } from "@/lib/categoryUtils";
import { getCustomCategories, type CustomCategory } from "@/services/categoryService";

interface Props {
  categories: CategoryExpense[];
  selectedMonth?: number;
  onVerAnalise?: () => void;
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const INITIAL_COUNT = 5;

// Fallback colors for categories not in the centralized map
const FALLBACK_COLORS = [
  "330 80% 60%", "250 70% 65%", "35 90% 55%", "200 80% 55%",
  "0 70% 55%", "60 70% 50%", "280 60% 55%", "180 60% 45%", "15 80% 55%",
];

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const getCatColor = (name: string, fallbackIdx: number, customCats?: CustomCategory[]): string => {
  const c = getCategoryColor(name, customCats);
  if (c !== "220 10% 55%") return c;
  return FALLBACK_COLORS[fallbackIdx % FALLBACK_COLORS.length];
};

const GastosPorCategoria = memo(({ categories, selectedMonth, onVerAnalise }: Props) => {
  const [customCats, setCustomCats] = useState<CustomCategory[]>([]);
  useEffect(() => { getCustomCategories().then(setCustomCats).catch(() => {}); }, []);
  const sorted = useMemo(() => [...categories].sort((a, b) => b.amount - a.amount), [categories]);
  const totalExpenses = useMemo(() => sorted.reduce((sum, c) => sum + c.amount, 0), [sorted]);
  const hasMore = sorted.length > INITIAL_COUNT;
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? sorted : sorted.slice(0, INITIAL_COUNT);

  const monthLabel = selectedMonth !== undefined ? MONTH_NAMES[selectedMonth] : MONTH_NAMES[new Date().getMonth()];

  return (
    <div
      className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl overflow-hidden"
      style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.3)" }}
    >
      {/* Header with total + stacked bar */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[11px] text-muted-foreground/60 font-medium">
          Gastos por categoria · {monthLabel}
        </p>
        <p className="text-xl font-bold text-foreground tabular-nums mt-0.5">
          {fmt(totalExpenses)}
        </p>

        {/* Stacked color bar */}
        <div className="flex h-2.5 rounded-full overflow-hidden mt-3 gap-[2px]">
          {sorted.map((cat, idx) => {
            const pct = totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0;
            if (pct < 1) return null;
            const color = getCatColor(cat.name, idx);
            return (
              <motion.div
                key={cat.name}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: idx * 0.05, duration: 0.5, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: `hsl(${color})`, minWidth: "6px" }}
              />
            );
          })}
        </div>
      </div>

      {/* Category list */}
      <div className="px-4 pb-3 space-y-2.5">
        {visible.map((cat, index) => {
          const pct = totalExpenses > 0 ? Math.round((cat.amount / totalExpenses) * 100) : 0;
          const color = getCatColor(cat.name, sorted.indexOf(cat), customCats);
          const IconComponent = getCategoryIcon(cat.name, customCats);

          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-3"
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <IconComponent className="w-4 h-4" style={{ color: `hsl(${color})` }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{cat.name}</p>
                <div className="w-full h-1 bg-border/20 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.1 + index * 0.04, duration: 0.5, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: `hsl(${color})` }}
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
        <div className="px-4 pb-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 pt-2 border-t border-border/10 text-[10px] text-primary/70 hover:text-primary transition-colors font-medium"
          >
            {expanded ? (
              <>Mostrar menos <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>Mais {sorted.length - INITIAL_COUNT} categorias <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
});

GastosPorCategoria.displayName = "GastosPorCategoria";
export default GastosPorCategoria;
