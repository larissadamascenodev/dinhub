import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import { formatCurrency } from "@/pages/FaturaCartao";

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

const CATEGORY_COLORS = [
  "bg-primary",
  "bg-[hsl(var(--chart-2))]",
  "bg-[hsl(var(--warning))]",
  "bg-destructive",
  "bg-[hsl(var(--chart-5))]",
];

export default function InvoiceCategoryBreakdown({ categories, total }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-bold text-foreground">Gastos por Categoria</h2>
      </div>

      <div className="space-y-4">
        {categories.map((cat, idx) => (
          <div key={cat.category} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{cat.category}</span>
              </div>
              <span className="text-sm font-bold text-foreground">{formatCurrency(cat.total)}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cat.percentage}%` }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`h-full rounded-full ${CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{cat.count} transações</span>
              <span>{cat.percentage.toFixed(0)}% do total</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
