import { memo, useState } from "react";
import { Phone, Bell, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transaction } from "@/types/finance";

interface Props {
  transactions: Transaction[];
  onVerTodas?: () => void;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function timeAgo(index: number): string {
  const times = ["agora", "agora", "2 min", "15 min", "1h", "3h", "5h"];
  return times[index] || `${index}h`;
}

const NotificationCard = ({
  tx,
  index,
}: {
  tx: Transaction;
  index: number;
}) => {
  const isReceita = tx.type === "receita";

  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{
        background: "linear-gradient(135deg, hsl(142 71% 45% / 0.12) 0%, hsl(var(--card)) 60%)",
        border: "1px solid hsl(var(--border) / 0.15)",
      }}
    >
      {/* Green circle icon */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: "#22c55e",
          boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
        }}
      >
        <Phone className="w-5 h-5 text-white" style={{ transform: "rotate(-30deg)" }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground leading-tight">
          {tx.name}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: isReceita ? "hsl(142 71% 55%)" : "hsl(0 72% 55%)" }}>
          Valor: {fmt(tx.amount)}
        </p>
        <p className="text-[9px] text-muted-foreground/50 mt-0.5 font-medium">
          {isReceita ? "Receita" : "Despesa"}
        </p>
      </div>

      {/* Time */}
      <span className="text-[11px] text-muted-foreground/40 flex-shrink-0 self-start mt-1">
        {timeAgo(index)}
      </span>
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
      <div className="rounded-2xl border border-border/20 bg-card p-6 text-center">
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
            <Bell className="w-4 h-4 text-primary" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Transações Recentes
          </h3>
        </div>
      </div>

      {/* Stacked / Expanded */}
      <div
        className="relative cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Background stack cards (iPhone notification style) */}
        <AnimatePresence>
          {!expanded && restTx.length > 0 && (
            <>
              {restTx.slice(0, 3).map((_, i) => (
                <motion.div
                  key={`stack-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute left-0 right-0 rounded-2xl"
                  style={{
                    top: `${(i + 1) * 8}px`,
                    transform: `scale(${1 - (i + 1) * 0.03})`,
                    zIndex: 3 - i,
                    height: "64px",
                    background: "linear-gradient(135deg, hsl(142 71% 45% / 0.08) 0%, hsl(var(--card)) 60%)",
                    border: "1px solid hsl(var(--border) / 0.1)",
                    filter: `brightness(${1 - (i + 1) * 0.06})`,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Top card */}
        <motion.div layout className="relative z-10">
          <NotificationCard tx={topTx} index={0} />
        </motion.div>

        {/* Expand indicator */}
        {!expanded && restTx.length > 0 && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-0.5 rounded-full bg-card border border-border/30 shadow-lg flex items-center gap-1">
            <ChevronDown className="w-3 h-3 text-muted-foreground/50" />
            <span className="text-[9px] font-semibold text-muted-foreground">
              +{restTx.length}
            </span>
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
                  <NotificationCard tx={tx} index={index + 1} />
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
