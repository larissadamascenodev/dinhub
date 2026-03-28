import { memo } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useFormattedCounter } from "@/hooks/useAnimatedCounter";

interface Props {
  receitas: number;
  despesas: number;
  mobile?: boolean;
}

const ReceitasDespesasCards = memo(({ receitas, despesas, mobile }: Props) => {
  const animatedReceitas = useFormattedCounter(receitas);
  const animatedDespesas = useFormattedCounter(despesas);

  return (
    <div className={`grid ${mobile ? "grid-cols-2 gap-2" : "grid-rows-2 gap-3"} w-full`}>
      <button
        className={`relative rounded-xl border border-primary/15 transition-all text-left overflow-hidden backdrop-blur-sm bg-primary/[0.06] ${mobile ? "px-2.5 py-2" : "px-3 py-3"}`}
        style={{
          boxShadow: "0 2px 8px -2px rgba(0,0,0,0.4), inset 0 1px 0 0 hsl(150 100% 45% / 0.08)",
        }}
      >
        <div className="flex items-center gap-1 mb-0.5">
          <ArrowUpRight className={`${mobile ? "w-3 h-3" : "w-3.5 h-3.5"} text-primary`} />
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Receitas</span>
        </div>
        <p className={`font-display ${mobile ? "text-lg" : "text-xl"} font-bold text-primary tabular-nums leading-none`}>
          {animatedReceitas}
        </p>
      </button>

      <button
        className={`relative rounded-xl border border-destructive/20 transition-all text-left overflow-hidden backdrop-blur-sm ${mobile ? "p-3" : "p-4"}`}
        style={{
          background: "hsl(0 60% 50% / 0.06)",
          boxShadow: "0 2px 8px -2px rgba(0,0,0,0.4), inset 0 1px 0 0 hsl(0 60% 50% / 0.08)",
        }}
      >
        <div className="flex items-center gap-1 mb-0.5">
          <ArrowDownRight className={`${mobile ? "w-3 h-3" : "w-3.5 h-3.5"} text-destructive`} />
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Despesas</span>
        </div>
        <p className={`font-display ${mobile ? "text-lg" : "text-xl"} font-bold text-destructive tabular-nums leading-none`}>
          {animatedDespesas}
        </p>
      </button>
    </div>
  );
});

ReceitasDespesasCards.displayName = "ReceitasDespesasCards";
export default ReceitasDespesasCards;
