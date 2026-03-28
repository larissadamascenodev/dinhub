import { memo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  receitas: number;
  despesas: number;
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ReceitasDespesasCards = memo(({ receitas, despesas }: Props) => (
  <div className="grid grid-cols-2 gap-3">
    <div className="fp-card p-4 border-fp-green/20">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest fp-text-green mb-2">
        <TrendingUp className="h-3.5 w-3.5" />
        Receitas
      </div>
      <p className="text-xl font-extrabold fp-text-green">{fmt(receitas)}</p>
    </div>
    <div className="fp-card p-4 border-fp-red/20">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest fp-text-red mb-2">
        <TrendingDown className="h-3.5 w-3.5" />
        Despesas
      </div>
      <p className="text-xl font-extrabold fp-text-red">{fmt(despesas)}</p>
    </div>
  </div>
));

ReceitasDespesasCards.displayName = "ReceitasDespesasCards";
export default ReceitasDespesasCards;
