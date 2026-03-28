import { memo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ReceitasDespesasProps {
  receitas: number;
  despesas: number;
}

const ReceitasDespesasCards = memo(({ receitas, despesas }: ReceitasDespesasProps) => {
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl border border-border bg-card p-4 card-glow">
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-finanpro-green mb-2">
          <TrendingUp className="h-3.5 w-3.5" />
          Receitas
        </div>
        <p className="text-xl font-bold text-finanpro-green">{fmt(receitas)}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 card-glow">
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-finanpro-red mb-2">
          <TrendingDown className="h-3.5 w-3.5" />
          Despesas
        </div>
        <p className="text-xl font-bold text-finanpro-red">{fmt(despesas)}</p>
      </div>
    </div>
  );
});

ReceitasDespesasCards.displayName = "ReceitasDespesasCards";
export default ReceitasDespesasCards;
