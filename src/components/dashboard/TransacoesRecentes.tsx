import { memo } from "react";
import { Briefcase, ShoppingCart, Car, Heart, Tv, ChevronRight } from "lucide-react";
import type { Transaction } from "@/types/finance";

interface Props {
  transactions: Transaction[];
  onVerTodas?: () => void;
}

const ICONS: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
  Salário: { icon: <Briefcase className="h-4 w-4" />, bg: "bg-fp-green/15", text: "text-fp-green" },
  Alimentação: { icon: <ShoppingCart className="h-4 w-4" />, bg: "bg-fp-red/15", text: "text-fp-red" },
  Transporte: { icon: <Car className="h-4 w-4" />, bg: "bg-fp-blue/15", text: "text-fp-blue" },
  Saúde: { icon: <Heart className="h-4 w-4" />, bg: "bg-fp-pink/15", text: "text-fp-pink" },
  Assinaturas: { icon: <Tv className="h-4 w-4" />, bg: "bg-fp-orange/15", text: "text-fp-orange" },
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const TransactionRow = memo(({ tx }: { tx: Transaction }) => {
  const cfg = ICONS[tx.category] || ICONS.Salário;
  const isReceita = tx.type === "receita";

  return (
    <div className="fp-card fp-card-hover flex items-center gap-3 p-3.5 cursor-pointer group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.text} transition-transform duration-200 group-hover:scale-105`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{tx.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{tx.category} {tx.date}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold ${isReceita ? "fp-text-green" : "fp-text-red"}`}>
          {isReceita ? "+" : "-"}{fmt(tx.amount)}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {isReceita ? "Receita" : "Despesa"}
        </p>
      </div>
    </div>
  );
});
TransactionRow.displayName = "TransactionRow";

const TransacoesRecentes = memo(({ transactions, onVerTodas }: Props) => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Transações Recentes
      </h3>
      <button
        onClick={onVerTodas}
        className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors"
      >
        Ver todas <ChevronRight className="h-3 w-3" />
      </button>
    </div>
    <div className="flex flex-col gap-2.5">
      {transactions.map((tx, i) => (
        <div
          key={tx.id}
          style={{ animation: `fade-up 0.4s ease-out ${i * 0.06}s both` }}
        >
          <TransactionRow tx={tx} />
        </div>
      ))}
    </div>
  </div>
));

TransacoesRecentes.displayName = "TransacoesRecentes";
export default TransacoesRecentes;
