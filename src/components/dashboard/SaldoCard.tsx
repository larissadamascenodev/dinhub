import { memo } from "react";
import { Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SaldoCardProps {
  saldoAtual: number;
  saldoPrevisto: number;
  onNovaTransacao?: () => void;
}

const SaldoCard = memo(({ saldoAtual, saldoPrevisto, onNovaTransacao }: SaldoCardProps) => {
  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-glow transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium uppercase tracking-wider">
          <Wallet className="h-4 w-4" />
          Saldo do mês
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
          onClick={onNovaTransacao}
        >
          <Plus className="h-3.5 w-3.5" />
          Nova transação
        </Button>
      </div>
      <p className="text-3xl font-bold text-foreground tracking-tight">
        {formatCurrency(saldoAtual)}
      </p>
      <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
        Previsto ao final do mês{" "}
        <span className="font-medium text-foreground">{formatCurrency(saldoPrevisto)}</span>
      </p>
    </div>
  );
});

SaldoCard.displayName = "SaldoCard";
export default SaldoCard;
