import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/pages/FaturaCartao";
import { getCategoryIcon, getCategoryColor } from "@/lib/categoryUtils";
import { getCustomCategories, type CustomCategory } from "@/services/categoryService";

interface CategoryData {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

interface Props {
  categories: CategoryData[];
  total: number;
}

export default function InvoiceCategoryBreakdown({ categories, total }: Props) {
  const [customCats, setCustomCats] = useState<CustomCategory[]>([]);
  useEffect(() => { getCustomCategories().then(setCustomCats).catch(() => {}); }, []);
  const top = [...categories].sort((a, b) => b.total - a.total).slice(0, 6);

  return (
    <div
      className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl p-4"
      style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.3)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
          Gastos por Categoria
        </h3>
        <button className="text-[10px] text-primary/70 hover:text-primary transition-colors">
          Ver todas
        </button>
      </div>

      <div className="space-y-2.5">
        {top.map((cat, index) => {
          const color = getCategoryColor(cat.category, customCats);
          const IconComponent = getCategoryIcon(cat.category, customCats);
          return (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-3"
            >
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <IconComponent className="w-4 h-4" style={{ color: `hsl(${color})` }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{cat.category}</p>
                <div className="w-full h-1 bg-border/20 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ delay: 0.1 + index * 0.04, duration: 0.5, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: `hsl(${color})` }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-foreground tabular-nums">{formatCurrency(cat.total)}</p>
                <p className="text-[9px] text-muted-foreground/50">{cat.percentage.toFixed(0)}%</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
