import { memo, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import type { CategoryExpense } from "@/types/finance";

interface GastosPorCategoriaProps {
  categories: CategoryExpense[];
  onVerAnalise?: () => void;
}

const CategoryBar = memo(({ cat, maxAmount }: { cat: CategoryExpense; maxAmount: number }) => {
  const pct = maxAmount > 0 ? (cat.amount / maxAmount) * 100 : 0;
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="flex items-center gap-3">
      <span className="text-lg">{cat.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-foreground">{cat.name}</p>
          <p className="text-sm font-semibold text-foreground">{fmt(cat.amount)}</p>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full animate-bar-fill"
            style={{ "--bar-width": `${pct}%`, width: `${pct}%`, backgroundColor: cat.color } as React.CSSProperties}
          />
        </div>
      </div>
    </div>
  );
});
CategoryBar.displayName = "CategoryBar";

const GastosPorCategoria = memo(({ categories, onVerAnalise }: GastosPorCategoriaProps) => {
  const maxAmount = useMemo(
    () => Math.max(...categories.map((c) => c.amount), 1),
    [categories]
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-glow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Gastos por Categoria
        </h3>
        <button
          onClick={onVerAnalise}
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors"
        >
          Ver análise completa <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {categories.map((cat) => (
          <CategoryBar key={cat.name} cat={cat} maxAmount={maxAmount} />
        ))}
      </div>
    </div>
  );
});

GastosPorCategoria.displayName = "GastosPorCategoria";
export default GastosPorCategoria;
