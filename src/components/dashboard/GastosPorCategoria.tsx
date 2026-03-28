import { memo, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import type { CategoryExpense } from "@/types/finance";

interface Props {
  categories: CategoryExpense[];
  onVerAnalise?: () => void;
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Bar = memo(({ cat, maxAmount, delay }: { cat: CategoryExpense; maxAmount: number; delay: number }) => {
  const pct = maxAmount > 0 ? (cat.amount / maxAmount) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg w-7 text-center">{cat.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-medium text-foreground">{cat.name}</p>
          <p className="text-sm font-bold text-foreground">{fmt(cat.amount)}</p>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              backgroundColor: cat.color,
              animation: `bar-fill-anim 0.8s ease-out ${delay}s both`,
            }}
          />
        </div>
      </div>
    </div>
  );
});
Bar.displayName = "Bar";

const GastosPorCategoria = memo(({ categories, onVerAnalise }: Props) => {
  const max = useMemo(() => Math.max(...categories.map((c) => c.amount), 1), [categories]);

  return (
    <div className="fp-card p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Gastos por Categoria
        </h3>
        <button
          onClick={onVerAnalise}
          className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors"
        >
          Ver análise completa <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {categories.map((cat, i) => (
          <Bar key={cat.name} cat={cat} maxAmount={max} delay={i * 0.1} />
        ))}
      </div>
    </div>
  );
});

GastosPorCategoria.displayName = "GastosPorCategoria";
export default GastosPorCategoria;
