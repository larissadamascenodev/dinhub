import { memo } from "react";
import { Scale, ChevronRight } from "lucide-react";

interface BalancoCardProps {
  balanco: number;
}

const BalancoCard = memo(({ balanco }: BalancoCardProps) => {
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const isPositive = balanco >= 0;

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-r from-card to-secondary/30 p-5 card-glow transition-all duration-300 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Scale className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Balanço do mês
          </p>
          <p className={`text-2xl font-bold ${isPositive ? "text-finanpro-green" : "text-finanpro-red"}`}>
            {fmt(balanco)}
          </p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
  );
});

BalancoCard.displayName = "BalancoCard";
export default BalancoCard;
