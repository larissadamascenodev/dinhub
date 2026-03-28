import { memo } from "react";
import { ShoppingCart, Car, Heart, Tv, Briefcase, ChevronRight } from "lucide-react";
import type { Transaction } from "@/types/finance";

interface TransacoesRecentesProps {
  transactions: Transaction[];
  onVerTodas?: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Salário: <Briefcase className="h-4 w-4" />,
  Alimentação: <ShoppingCart className="h-4 w-4" />,
  Transporte: <Car className="h-4 w-4" />,
  Saúde: <Heart className="h-4 w-4" />,
  Assinaturas: <Tv className="h-4 w-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  Salário: "bg-finanpro-green/20 text-finanpro-green",
  Alimentação: "bg-finanpro-red/20 text-finanpro-red",
  Transporte: "bg-blue-500/20 text-blue-400",
  Saúde: "bg-pink-500/20 text-pink-400",
  Assinaturas: "bg-orange-500/20 text-orange-400",
};

const TransactionItem = memo(({ tx }: { tx: Transaction }) => {
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const isReceita = tx.type === "receita";
  const colorClass = CATEGORY_COLORS[tx.category] || "bg-muted text-muted-foreground";

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card card-glow card-glow-hover transition-all duration-200 cursor-pointer">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
        {CATEGORY_ICONS[tx.category] || <Briefcase className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{tx.name}</p>
        <p className="text-xs text-muted-foreground">
          {tx.category} {tx.date}
        </p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${isReceita ? "text-finanpro-green" : "text-finanpro-red"}`}>
          {isReceita ? "+" : "-"}{fmt(tx.amount)}
        </p>
        <p className="text-xs text-muted-foreground">{isReceita ? "Receita" : "Despesa"}</p>
      </div>
    </div>
  );
});
TransactionItem.displayName = "TransactionItem";

const TransacoesRecentes = memo(({ transactions, onVerTodas }: TransacoesRecentesProps) => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Transações Recentes
      </h3>
      <button
        onClick={onVerTodas}
        className="text-xs text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors"
      >
        Ver todas <ChevronRight className="h-3 w-3" />
      </button>
    </div>
    <div className="flex flex-col gap-2">
      {transactions.map((tx) => (
        <TransactionItem key={tx.id} tx={tx} />
      ))}
    </div>
  </div>
));

TransacoesRecentes.displayName = "TransacoesRecentes";
export default TransacoesRecentes;
