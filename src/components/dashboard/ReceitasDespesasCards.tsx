import { memo } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Props {
  receitas: number;
  despesas: number;
  mobile?: boolean;
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

const ReceitasDespesasCards = memo(({ receitas, despesas, mobile }: Props) => (
  <div className={mobile ? "grid grid-cols-2 gap-3" : "grid grid-rows-2 gap-3"}>
    <button
      className={`rounded-xl border border-border/20 hover:border-primary/20 transition-all text-left shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.03)] ${mobile ? "p-3" : "p-4"}`}
      style={{ background: "linear-gradient(145deg, hsl(220 18% 9% / 0.9) 0%, hsl(220 20% 5% / 0.95) 100%)" }}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <ArrowUpRight className={`${mobile ? "w-3 h-3" : "w-3.5 h-3.5"} text-primary`} />
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Receitas</span>
      </div>
      <p className={`font-display ${mobile ? "text-lg" : "text-xl"} font-bold text-primary tabular-nums leading-none`}>
        {fmt(receitas)}
      </p>
    </button>

    <button
      className={`rounded-xl border border-border/20 hover:border-destructive/20 transition-all text-left shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.03)] ${mobile ? "p-3" : "p-4"}`}
      style={{ background: "linear-gradient(145deg, hsl(220 18% 9% / 0.9) 0%, hsl(220 20% 5% / 0.95) 100%)" }}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <ArrowDownRight className={`${mobile ? "w-3 h-3" : "w-3.5 h-3.5"} text-destructive`} />
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Despesas</span>
      </div>
      <p className={`font-display ${mobile ? "text-lg" : "text-xl"} font-bold text-destructive tabular-nums leading-none`}>
        {fmt(despesas)}
      </p>
    </button>
  </div>
));

ReceitasDespesasCards.displayName = "ReceitasDespesasCards";
export default ReceitasDespesasCards;
