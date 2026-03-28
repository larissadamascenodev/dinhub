import { memo } from "react";
import { Scale, Plus } from "lucide-react";
import { useFormattedCounter } from "@/hooks/useAnimatedCounter";

interface SaldoCardProps {
  saldoAtual: number;
  saldoPrevisto: number;
  onNovaTransacao?: () => void;
  mobile?: boolean;
}

const SaldoCard = memo(({ saldoAtual, saldoPrevisto, onNovaTransacao, mobile }: SaldoCardProps) => {
  const animatedSaldo = useFormattedCounter(saldoAtual);
  const animatedPrevisto = useFormattedCounter(saldoPrevisto);

  return (
    <div
      className={`rounded-xl border border-border/10 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.5)] backdrop-blur-sm flex flex-col justify-between ${mobile ? "p-4" : "p-5"}`}
      style={{ background: "linear-gradient(160deg, hsl(220 15% 14% / 0.6) 0%, hsl(220 18% 8% / 0.75) 50%, hsl(220 20% 4% / 0.9) 100%)" }}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">Saldo do mês</span>
          </div>
          {!mobile && (
            <button
              onClick={onNovaTransacao}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-primary border border-primary/20 hover:border-primary/40 transition-all bg-primary/5"
            >
              <Plus className="w-3 h-3" />
              Nova transação
            </button>
          )}
        </div>
        <p className={`font-display ${mobile ? "text-2xl" : "text-4xl"} font-bold tracking-tight tabular-nums leading-none ${saldoAtual >= 0 ? "text-foreground" : "text-destructive"}`}>
          {animatedSaldo}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <div className={`w-1 h-1 rounded-full ${saldoPrevisto >= 0 ? "bg-primary" : "bg-destructive"}`} />
          <span className="text-[10px] text-muted-foreground/60">Previsto ao final do mês</span>
          <span className={`text-[13px] font-semibold tabular-nums tracking-tight ${saldoPrevisto >= 0 ? "text-primary/80" : "text-destructive/80"}`}>
            {animatedPrevisto}
          </span>
        </div>
      </div>
    </div>
  );
});

SaldoCard.displayName = "SaldoCard";
export default SaldoCard;
