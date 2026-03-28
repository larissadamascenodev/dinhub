import { memo, useState } from "react";
import { Wallet, ShoppingCart, Car, Heart, Tv, Bell, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transaction } from "@/types/finance";

interface Props {
  transactions: Transaction[];
  onVerTodas?: () => void;
}

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  Salário: { icon: Wallet, color: "#22c55e" },
  Alimentação: { icon: ShoppingCart, color: "#ef4444" },
  Transporte: { icon: Car, color: "#3b82f6" },
  Saúde: { icon: Heart, color: "#ec4899" },
  Assinaturas: { icon: Tv, color: "#a855f7" },
};

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = () => {
  const now = new Date();
  const day = now.getDate();
  const months = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
  return `${day} de ${months[now.getMonth()]}`;
};

const TransactionRow = ({ tx, index }: { tx: Transaction; index: number }) => {
  const isReceita = tx.type === "receita";
  const cfg = CATEGORY_CONFIG[tx.category] || { icon: Wallet, color: "#6b7280" };
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 px-4 py-3.5 border-b border-border/15 last:border-b-0"
    >
      {/* Category icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${cfg.color}20`, border: `1px solid ${cfg.color}30` }}
      >
        <Icon className="w-5 h-5" style={{ color: cfg.color }} />
      </div>

      {/* Name + category + date */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground leading-tight truncate">
          {tx.name}
        </p>
        <p className="text-[11px] text-muted-foreground/50 mt-0.5">
          {tx.category} {formatDate()}
        </p>
      </div>

      {/* Value + type */}
      <div className="text-right flex-shrink-0">
        <p className={`text-[14px] font-bold tabular-nums tracking-tight ${isReceita ? "text-primary" : "text-destructive"}`}>
          {isReceita ? "+" : "-"}{fmt(tx.amount)}
        </p>
        <p className="text-[9px] font-medium mt-0.5 text-muted-foreground/40">
          {isReceita ? "Receita" : "Despesa"}
        </p>
      </div>
    </motion.div>
  );
};

const TransacoesRecentes = memo(({ transactions, onVerTodas }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const visible = transactions.slice(0, 7);
  const initialCount = 3;
  const showTx = expanded ? visible : visible.slice(0, initialCount);
  const hasMore = visible.length > initialCount;

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-border/20 bg-card p-6 text-center">
        <Bell className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground/50">Nenhuma transação ainda</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Transações Recentes
          </h3>
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
          {transactions.length}
        </span>
      </div>

      {/* List card */}
      <div
        className="rounded-2xl border border-border/20 overflow-hidden"
        style={{
          background: "linear-gradient(145deg, hsl(220 18% 9% / 0.85) 0%, hsl(220 20% 5% / 0.9) 100%)",
          boxShadow: "0 2px 8px -2px rgba(0,0,0,0.3), inset 0 1px 0 0 rgba(255,255,255,0.03)",
        }}
      >
        {showTx.map((tx, index) => (
          <TransactionRow key={tx.id} tx={tx} index={index} />
        ))}
      </div>

      {/* Show more / less */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-2 flex items-center justify-center gap-1 py-2 text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          <span>{expanded ? "Ver menos" : `Ver mais (${visible.length - initialCount})`}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
});

TransacoesRecentes.displayName = "TransacoesRecentes";
export default TransacoesRecentes;
