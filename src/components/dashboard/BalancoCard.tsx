import { memo } from "react";
import { Scale, ChevronRight } from "lucide-react";

interface Props {
  balanco: number;
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const BalancoCard = memo(({ balanco }: Props) => {
  const positive = balanco >= 0;
  return (
    <div
      className="fp-card p-5 flex items-center justify-between"
      style={{
        background: `linear-gradient(135deg, hsl(155 25% 7%), hsl(155 30% 10%))`,
      }}
    >
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: "hsl(145 72% 40% / 0.12)" }}>
          <Scale className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
            Balanço do mês
          </p>
          <p className={`text-2xl font-extrabold tracking-tight ${positive ? "fp-text-green" : "fp-text-red"}`}>
            {fmt(balanco)}
          </p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground/60" />
    </div>
  );
});

BalancoCard.displayName = "BalancoCard";
export default BalancoCard;
