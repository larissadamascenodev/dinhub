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

const NotificationCard = ({ tx }: { tx: Transaction }) => {
  const isReceita = tx.type === "receita";
  const cfg = CATEGORY_CONFIG[tx.category] || { icon: Wallet, color: "#6b7280" };
  const Icon = cfg.icon;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border/20"
      style={{
        background: "linear-gradient(145deg, hsl(220 18% 9% / 0.85) 0%, hsl(220 20% 5% / 0.9) 100%)",
        boxShadow: "0 2px 8px -2px rgba(0,0,0,0.3), inset 0 1px 0 0 rgba(255,255,255,0.03)",
      }}
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
    </div>
  );
};

const TransacoesRecentes = memo(({ transactions, onVerTodas }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const visible = transactions.slice(0, 7);
  const topTx = visible[0];
  const restTx = visible.slice(1);

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-border/20 bg-card p-6 text-center">
        <Bell className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground/50">Nenhuma transação ainda</p>
      </div>
    );
  }

  return (
    <div className="relative">
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

      {/* Stack area */}
      <div
        className="relative cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        style={{ paddingBottom: !expanded && restTx.length > 0 ? `${Math.min(restTx.length, 3) * 8 + 12}px` : 0 }}
      >
        {/* Stacked background cards */}
        <AnimatePresence>
          {!expanded && restTx.length > 0 && (
            <>
              {restTx.slice(0, 3).map((_, i) => (
                <motion.div
                  key={`stack-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute left-0 right-0 rounded-2xl border border-border/10"
                  style={{
                    top: `${(i + 1) * 8}px`,
                    transform: `scale(${1 - (i + 1) * 0.03})`,
                    zIndex: 3 - i,
                    height: "58px",
                    background: "linear-gradient(145deg, hsl(220 18% 9% / 0.85) 0%, hsl(220 20% 5% / 0.9) 100%)",
                    filter: `brightness(${1 - (i + 1) * 0.06})`,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Top card */}
        <motion.div layout className="relative z-10">
          <NotificationCard tx={topTx} />
        </motion.div>

        {/* Expand indicator */}
        {!expanded && restTx.length > 0 && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20">
            <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Expanded list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="overflow-hidden mt-2"
          >
            <div className="space-y-2">
              {restTx.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <NotificationCard tx={tx} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

TransacoesRecentes.displayName = "TransacoesRecentes";
export default TransacoesRecentes;
