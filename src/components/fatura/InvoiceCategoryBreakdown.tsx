import { motion } from "framer-motion";
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

const DOT_COLORS = [
  "bg-primary",
  "bg-[hsl(var(--chart-2))]",
  "bg-[hsl(var(--warning))]",
  "bg-destructive",
  "bg-[hsl(var(--chart-5))]",
];

const BAR_COLORS = [
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
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Gastos por Categoria
        </h2>
        <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
          Ver todas
        </button>
      </div>

      <div className="space-y-5">
        {categories.map((cat, idx) => (
          <div key={cat.category} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${DOT_COLORS[idx % DOT_COLORS.length]}`} />
                <span className="text-sm font-semibold text-foreground">{cat.category}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-foreground">{formatCurrency(cat.total)}</span>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cat.percentage}%` }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`h-full rounded-full ${BAR_COLORS[idx % BAR_COLORS.length]}`}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-right">
              {cat.percentage.toFixed(0)}%
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
