import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CategoryExpense } from "@/types/finance";

interface Props {
  categories: CategoryExpense[];
  onVerAnalise?: () => void;
}

const fmtShort = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });

const GastosPorCategoria = memo(({ categories, onVerAnalise }: Props) => {
  const [activeTab, setActiveTab] = useState<"categories" | "analysis">("categories");
  const top = [...categories].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const maxValue = top[0]?.amount || 1;
  const totalExpenses = top.reduce((sum, c) => sum + c.amount, 0);

  return (
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

      {/* Tab switcher */}
      <div className="relative flex rounded-full p-1 border border-border/30 bg-card/60">
        <motion.div
          className="absolute top-1 bottom-1 rounded-full bg-primary/10 border border-primary/20"
          style={{ width: "calc(50% - 4px)" }}
          initial={false}
          animate={{ left: activeTab === "categories" ? "4px" : "calc(50%)" }}
          transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.35 }}
        />
        <button
          onClick={() => setActiveTab("categories")}
          className={`relative z-10 flex-1 text-xs font-semibold py-2.5 rounded-full text-center transition-colors duration-300 ${
            activeTab === "categories" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          Categorias
        </button>
        <button
          onClick={() => setActiveTab("analysis")}
          className={`relative z-10 flex-1 text-xs font-semibold py-2.5 rounded-full text-center transition-colors duration-300 ${
            activeTab === "analysis" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          Análise
        </button>
      </div>

      {/* Content */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === "categories" ? (
            <motion.div
              key="categories"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.3 }}
              className="space-y-1.5"
            >
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
            </motion.div>
          ) : (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.3 }}
              className="space-y-4"
            >
              <div
                className="p-4 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, transparent 60%)`,
                  border: `1px solid hsl(var(--primary) / 0.12)`,
                  boxShadow: `0 2px 8px -2px rgba(0,0,0,0.3), inset 0 1px 0 0 rgba(255,255,255,0.04)`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Resumo do Mês</span>
                  <span className="text-[10px] text-muted-foreground/50">{top.length} categorias</span>
                </div>
                <div className="text-2xl font-bold text-foreground mb-3 tabular-nums">
                  {fmtShort(totalExpenses)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Distribuído em {top.length} categorias principais
                </p>
              </div>

              {/* Top spenders horizontal scroll */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {top.map((cat, i) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex-shrink-0 w-[130px] p-3 rounded-xl text-left"
                    style={{
                      background: `linear-gradient(135deg, ${cat.color}14 0%, transparent 60%)`,
                      border: `1px solid ${cat.color}1a`,
                    }}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <p className="text-[11px] font-semibold text-foreground mt-1.5 truncate">{cat.name}</p>
                    <p className="text-sm font-bold tabular-nums text-foreground">{fmtShort(cat.amount)}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

GastosPorCategoria.displayName = "GastosPorCategoria";
export default GastosPorCategoria;
