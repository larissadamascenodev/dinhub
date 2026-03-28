import { memo, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Bell, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transaction } from "@/types/finance";

interface Props {
  transactions: Transaction[];
  onVerTodas?: () => void;
}

const TYPE_CONFIG = {
  receita: {
    Icon: ArrowUpRight,
    accent: "150 100% 45%",
    textClass: "text-primary",
    label: "Receita",
    prefix: "+",
  },
  despesa: {
    Icon: ArrowDownRight,
    accent: "0 60% 50%",
    textClass: "text-destructive",
    label: "Despesa",
    prefix: "-",
  },
};

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = () => {
  const now = new Date();
  const day = now.getDate();
  const months = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
  return `${day} de ${months[now.getMonth()]}`;
};

const NotificationCard = ({ tx, isTop = false }: { tx: Transaction; isTop?: boolean }) => {
  const cfg = TYPE_CONFIG[tx.type];
  const Icon = cfg.Icon;
  const a = cfg.accent;

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl transition-all ${isTop ? "px-4 py-3.5" : "px-4 py-3"}`}
      style={{
        background: `linear-gradient(145deg, hsl(220 16% 13%) 0%, hsl(220 18% 9%) 100%)`,
        border: `1px solid hsl(220 14% 18%)`,
        boxShadow: isTop
          ? "0 6px 24px -6px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.06)"
          : "0 2px 8px -3px rgba(0,0,0,0.4), inset 0 1px 0 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Colored accent dot on left edge */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
        style={{ background: `hsl(${a})`, boxShadow: `0 0 8px hsl(${a} / 0.3)` }}
      />

      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: `hsl(${a} / 0.1)`,
          border: `1px solid hsl(${a} / 0.15)`,
        }}
      >
        <Icon className={`w-4 h-4 ${cfg.textClass}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground/90 leading-tight truncate">
          {tx.name}
        </p>
        <p className="text-[10px] text-muted-foreground/40 mt-0.5">
          {tx.category} · {formatDate()}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className={`text-[13px] font-bold tabular-nums ${cfg.textClass}`}>
          {cfg.prefix}{fmt(tx.amount)}
        </p>
        <span className="text-[9px] font-medium text-muted-foreground/30 uppercase tracking-wider">
          {cfg.label}
        </span>
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
            <Bell className="w-4 h-4 text-muted-foreground/60" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
          <h3 className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
            Transações Recentes
          </h3>
        </div>
        <span className="text-[10px] font-bold text-foreground/50 bg-secondary/60 px-2.5 py-0.5 rounded-full border border-border/30">
          {transactions.length}
        </span>
      </div>

      {/* Stack area */}
      <div
        className="relative cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        style={{
          paddingBottom: !expanded && restTx.length > 0 ? `${Math.min(restTx.length, 3) * 6 + 16}px` : 0,
        }}
      >
        {/* Stacked ghost cards behind */}
        <AnimatePresence>
          {!expanded && restTx.length > 0 && (
            <>
              {restTx.slice(0, 3).map((tx, i) => {
                const stackCfg = TYPE_CONFIG[tx.type];
                return (
                  <motion.div
                    key={`stack-${i}`}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: i * 0.03 }}
                    className="absolute left-0 right-0 rounded-2xl"
                    style={{
                      top: `${(i + 1) * 6}px`,
                      transform: `scale(${1 - (i + 1) * 0.025})`,
                      zIndex: 3 - i,
                      height: "60px",
                      background: `linear-gradient(145deg, hsl(220 16% ${12 - i * 2}%) 0%, hsl(220 18% ${8 - i}%) 100%)`,
                      border: "1px solid hsl(220 14% 16%)",
                      opacity: 1 - (i + 1) * 0.15,
                    }}
                  />
                );
              })}
            </>
          )}
        </AnimatePresence>

        {/* Top card */}
        <motion.div layout className="relative z-10">
          <NotificationCard tx={topTx} isTop />
        </motion.div>

        {/* Expand/collapse pill */}
        {restTx.length > 0 && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20">
            <motion.div
              animate={{ y: expanded ? 0 : [0, 2, 0] }}
              transition={{ repeat: expanded ? 0 : Infinity, duration: 2 }}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-medium text-muted-foreground/50"
              style={{
                background: "hsl(220 16% 12%)",
                border: "1px solid hsl(220 14% 18%)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              }}
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-2.5 h-2.5" />
                  Recolher
                </>
              ) : (
                <>
                  <ChevronDown className="w-2.5 h-2.5" />
                  +{restTx.length} transações
                </>
              )}
            </motion.div>
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
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="overflow-hidden mt-2"
          >
            <div className="space-y-1.5">
              {restTx.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: index * 0.04 }}
                  className="relative"
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
