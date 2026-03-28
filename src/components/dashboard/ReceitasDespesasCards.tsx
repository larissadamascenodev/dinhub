import { memo } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Props {
  receitas: number;
  despesas: number;
  mobile?: boolean;
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

const ReceitasDespesasCards = memo(({ receitas, despesas, mobile }: Props) => (
  <div className="grid grid-rows-2 gap-3">
    {/* Receitas */}
    <button
      className={`relative rounded-xl border-0 transition-all text-left overflow-hidden ${mobile ? "p-3" : "p-4"}`}
      style={{
        background: "linear-gradient(180deg, hsl(150 100% 45% / 0.06) 0%, hsl(220 20% 5% / 0.95) 40%, hsl(220 20% 5% / 0.98) 100%)",
        boxShadow: "0 2px 8px -2px rgba(0,0,0,0.4), inset 0 1px 0 0 hsl(150 100% 45% / 0.08)",
      }}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <ArrowUpRight className={`${mobile ? "w-3 h-3" : "w-3.5 h-3.5"} text-primary`} />
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Receitas</span>
      </div>
      <p className={`font-display ${mobile ? "text-lg" : "text-xl"} font-bold text-primary tabular-nums leading-none`}>
        {fmt(receitas)}
      </p>
      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
    </button>

    {/* Despesas */}
    <button
      className={`relative rounded-xl border border-destructive/15 hover:border-destructive/30 transition-all text-left overflow-hidden ${mobile ? "p-3" : "p-4"}`}
      style={{
        background: "linear-gradient(180deg, hsl(0 60% 50% / 0.06) 0%, hsl(220 20% 5% / 0.95) 40%, hsl(220 20% 5% / 0.98) 100%)",
        boxShadow: "0 2px 8px -2px rgba(0,0,0,0.4), inset 0 1px 0 0 hsl(0 60% 50% / 0.08)",
      }}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <ArrowDownRight className={`${mobile ? "w-3 h-3" : "w-3.5 h-3.5"} text-destructive`} />
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Despesas</span>
      </div>
      <p className={`font-display ${mobile ? "text-lg" : "text-xl"} font-bold text-destructive tabular-nums leading-none`}>
        {fmt(despesas)}
      </p>
      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-destructive to-transparent opacity-60" />
    </button>
  </div>
));

ReceitasDespesasCards.displayName = "ReceitasDespesasCards";
export default ReceitasDespesasCards;
