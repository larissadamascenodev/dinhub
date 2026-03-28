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
      className={`relative rounded-2xl overflow-hidden text-left transition-all hover:-translate-y-0.5 ${mobile ? "p-3" : "p-4"}`}
      style={{
        background: "linear-gradient(145deg, hsl(225 20% 10%) 0%, hsl(225 22% 6%) 100%)",
        boxShadow: "0 4px 24px -4px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.04)",
        border: "1px solid hsl(225 14% 16% / 0.5)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 20% 0%, hsl(152 45% 45% / 0.06) 0%, transparent 50%)" }}
      />
      <div className="relative">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(152 50% 48% / 0.15) 0%, hsl(152 50% 48% / 0.05) 100%)" }}>
            <ArrowUpRight className={`${mobile ? "w-3 h-3" : "w-3.5 h-3.5"} text-primary`} />
          </div>
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Receitas</span>
        </div>
        <p className={`font-display ${mobile ? "text-lg" : "text-xl"} font-bold text-primary tabular-nums leading-none`}>
          {fmt(receitas)}
        </p>
      </div>
    </button>

    <button
      className={`relative rounded-2xl overflow-hidden text-left transition-all hover:-translate-y-0.5 ${mobile ? "p-3" : "p-4"}`}
      style={{
        background: "linear-gradient(145deg, hsl(225 20% 10%) 0%, hsl(225 22% 6%) 100%)",
        boxShadow: "0 4px 24px -4px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.04)",
        border: "1px solid hsl(225 14% 16% / 0.5)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 20% 0%, hsl(0 55% 48% / 0.05) 0%, transparent 50%)" }}
      />
      <div className="relative">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(0 55% 48% / 0.15) 0%, hsl(0 55% 48% / 0.05) 100%)" }}>
            <ArrowDownRight className={`${mobile ? "w-3 h-3" : "w-3.5 h-3.5"} text-destructive`} />
          </div>
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Despesas</span>
        </div>
        <p className={`font-display ${mobile ? "text-lg" : "text-xl"} font-bold text-destructive tabular-nums leading-none`}>
          {fmt(despesas)}
        </p>
      </div>
    </button>
  </div>
));

ReceitasDespesasCards.displayName = "ReceitasDespesasCards";
export default ReceitasDespesasCards;
