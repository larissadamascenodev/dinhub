import { memo, useState } from "react";
import { Briefcase, ShoppingCart, Car, Heart, Tv, Receipt, Bell, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transaction } from "@/types/finance";

interface Props {
  transactions: Transaction[];
  onVerTodas?: () => void;
}

const ICONS: Record<string, { color: string; emoji: string }> = {
  Salário: { color: "#22c55e", emoji: "💰" },
  Alimentação: { color: "#f97316", emoji: "🛒" },
  Transporte: { color: "#3b82f6", emoji: "🚗" },
  Saúde: { color: "#ef4444", emoji: "💊" },
  Assinaturas: { color: "#a855f7", emoji: "📺" },
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function timeAgo(index: number): string {
  const times = ["agora", "2 min atrás", "15 min atrás", "1h atrás", "3h atrás"];
  return times[index] || `${index + 1}h atrás`;
}

const TransacoesRecentes = memo(({ transactions, onVerTodas }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const visible = transactions.slice(0, 5);
  const topTx = visible[0];
  const restTx = visible.slice(1);

  if (transactions.length === 0) {
    return (
      <div
        className="rounded-xl border border-border/20 bg-card shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 text-center"
        style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.03) 0%, transparent 60%)" }}
      >
        <Receipt className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground/50">Nenhuma transação ainda</p>
      </div>
    );
  }

  const topCfg = ICONS[topTx?.category] || ICONS.Salário;
  const topIsReceita = topTx?.type === "receita";
  const topColor = topIsReceita ? "#22c55e" : topCfg.color;

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-4 h-4 text-primary" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Transações Recentes</h3>
        </div>
        <button
          onClick={onVerTodas}
          className="text-[10px] text-primary/70 hover:text-primary transition-colors flex items-center gap-0.5"
        >
          Ver todas
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Stacked cards */}
      <div
        className="relative cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Background stacked cards (visible when collapsed) */}
        <AnimatePresence>
          {!expanded && restTx.length > 0 && (
            <>
              {restTx.slice(0, 3).map((_, i) => (
                <motion.div
                  key={`stack-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute left-0 right-0 rounded-xl border border-border/10 bg-card/60"
                  style={{
                    top: `${(i + 1) * 6}px`,
                    transform: `scale(${1 - (i + 1) * 0.03})`,
                    zIndex: 3 - i,
                    height: "72px",
                    filter: `brightness(${1 - (i + 1) * 0.06})`,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Top card (always visible) */}
        <motion.div
          layout
          className="relative z-10 rounded-xl border border-border/20 bg-card shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${topColor}10 0%, transparent 60%)`,
            borderLeft: `3px solid ${topColor}`,
          }}
        >
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
              style={{
                background: `linear-gradient(135deg, ${topColor}25, ${topColor}08)`,
                boxShadow: `0 0 16px ${topColor}20`,
              }}
            >
              {topCfg.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[13px] font-semibold text-foreground truncate">{topTx.name}</p>
                <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[8px] font-bold uppercase tracking-wider">
                  novo
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                {topTx.category} · {timeAgo(0)}
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <p
                className="text-[15px] font-bold tabular-nums tracking-tight"
                style={{
                  color: topIsReceita ? "hsl(142 71% 55%)" : "hsl(0 72% 51%)",
                  textShadow: `0 0 12px ${topColor}30`,
                }}
              >
                {topIsReceita ? "+" : "-"}{fmt(topTx.amount)}
              </p>
              <p className="text-[9px] text-muted-foreground/40 font-medium">
                {topIsReceita ? "Receita" : "Despesa"}
              </p>
            </div>

            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              className="ml-1"
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
            </motion.div>
          </div>
        </motion.div>

        {/* Count badge when collapsed */}
        {!expanded && restTx.length > 0 && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 px-3 py-0.5 rounded-full bg-card border border-border/30 shadow-lg">
            <span className="text-[9px] font-semibold text-muted-foreground">+{restTx.length} transações</span>
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
            className="overflow-hidden mt-1.5"
          >
            <div className="space-y-1.5">
              {restTx.map((tx, index) => {
                const cfg = ICONS[tx.category] || ICONS.Salário;
                const isReceita = tx.type === "receita";
                const color = isReceita ? "#22c55e" : cfg.color;

                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl border border-border/15 bg-card/80 overflow-hidden"
                    style={{ borderLeft: `3px solid ${color}` }}
                  >
                    <div className="flex items-center gap-3 px-4 py-2.5">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base"
                        style={{ background: `linear-gradient(135deg, ${color}20, ${color}06)` }}
                      >
                        {cfg.emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-foreground truncate">{tx.name}</p>
                        <p className="text-[10px] text-muted-foreground/40">
                          {tx.category} · {timeAgo(index + 1)}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p
                          className="text-[13px] font-bold tabular-nums"
                          style={{ color: isReceita ? "hsl(142 71% 55%)" : "hsl(0 72% 51%)" }}
                        >
                          {isReceita ? "+" : "-"}{fmt(tx.amount)}
                        </p>
                        <p className="text-[9px] text-muted-foreground/40">
                          {isReceita ? "Receita" : "Despesa"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

TransacoesRecentes.displayName = "TransacoesRecentes";
export default TransacoesRecentes;
