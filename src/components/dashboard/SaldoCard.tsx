import { memo } from "react";
import { Wallet, Plus } from "lucide-react";

interface SaldoCardProps {
  saldoAtual: number;
  saldoPrevisto: number;
  onNovaTransacao?: () => void;
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const SaldoCard = memo(({ saldoAtual, saldoPrevisto, onNovaTransacao }: SaldoCardProps) => (
  <div className="fp-card p-5">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-widest">
        <Wallet className="h-4 w-4 text-primary" />
        Saldo do mês
      </div>
      <button
        onClick={onNovaTransacao}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/10 transition-all duration-200"
      >
        <Plus className="h-3.5 w-3.5" />
        Nova transação
      </button>
    </div>
    <p className="text-4xl font-extrabold text-foreground tracking-tight leading-none">
      {fmt(saldoAtual)}
    </p>
    <p className="text-sm text-muted-foreground mt-2.5 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full fp-bg-green inline-block" />
      Previsto ao final do mês
      <span className="font-semibold text-foreground">{fmt(saldoPrevisto)}</span>
    </p>
  </div>
));

SaldoCard.displayName = "SaldoCard";
export default SaldoCard;
