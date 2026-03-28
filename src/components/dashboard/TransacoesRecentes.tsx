import { memo, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Layers, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transaction } from "@/types/finance";

interface Props {
  transactions: Transaction[];
  onVerTodas?: () => void;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = () => {
  const now = new Date();
  const day = now.getDate();
  const months = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
  return `${day} de ${months[now.getMonth()]}`;
};

const TxCard = ({ tx }: { tx: Transaction }) => {
  const isReceita = tx.type === "receita";
  const Icon = isReceita ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      className="relative flex items-center gap-3 px-4 py-3 rounded-[14px] overflow-hidden backdrop-blur-sm"
      style={{
        background: isReceita ? "hsl(150 100% 45% / 0.06)" : "hsl(0 60% 50% / 0.06)",
        border: isReceita ? "1px solid hsl(150 100% 45% / 0.2)" : "1px solid hsl(0 60% 50% / 0.2)",
        boxShadow: isReceita
          ? "0 2px 8px -2px rgba(0,0,0,0.4), inset 0 1px 0 0 hsl(150 100% 45% / 0.08)"
          : "0 2px 8px -2px rgba(0,0,0,0.4), inset 0 1px 0 0 hsl(0 60% 50% / 0.08)",
      }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: isReceita ? "hsl(150 100% 45% / 0.1)" : "hsl(0 60% 50% / 0.1)" }}
      >
        <Icon className="w-4 h-4" style={{ color: isReceita ? "hsl(150 100% 45%)" : "hsl(0 60% 50%)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">{tx.name}</p>
        <p className="text-[10px] text-muted-foreground/40 mt-px">{tx.category} · {formatDate()}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[13px] font-bold tabular-nums" style={{ color: isReceita ? "hsl(150 100% 45%)" : "hsl(0 60% 50%)" }}>
          {isReceita ? "+" : "−"}{fmt(tx.amount)}
        </p>
        <p className="text-[9px] text-muted-foreground/30 font-medium">{isReceita ? "Receita" : "Despesa"}</p>
      </div>
    </div>
  );
};

// Stack card spacing & scale
const STACK_OFFSET = 10;
const STACK_SCALE_STEP = 0.03;
const STACK_COUNT = 4;

const TransacoesRecentes = memo(({ transactions }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const visible = transactions.slice(0, 7);
  const topTx = visible[0];
  const restTx = visible.slice(1);

  if (!transactions.length) {
    return (
      <div className="rounded-xl border border-border/15 p-6 text-center" style={{ background: "hsl(220 17% 10%)" }}>
        <Layers className="w-5 h-5 text-muted-foreground/20 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground/40">Nenhuma transação</p>
      </div>
    );
  }

  const stackCount = Math.min(restTx.length, STACK_COUNT);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-muted-foreground/50" />
          <h3 className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
            Transações Recentes
          </h3>
        </div>
        <span className="text-[10px] text-muted-foreground/40 font-medium">
          {transactions.length} itens
        </span>
      </div>

      {/* Stack container */}
      <motion.div
        className="relative cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        animate={{
          paddingBottom: !expanded && restTx.length > 0 ? stackCount * STACK_OFFSET + 16 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Stacked ghost cards */}
        <AnimatePresence>
          {!expanded && restTx.length > 0 &&
            restTx.slice(0, STACK_COUNT).map((tx, i) => {
              const isR = tx.type === "receita";
              return (
                <motion.div
                  key={`stack-${i}`}
                  className="absolute left-0 right-0 rounded-[14px]"
                  initial={{ top: 0, opacity: 0, scale: 1 }}
                  animate={{
                    top: (i + 1) * STACK_OFFSET,
                    opacity: 1 - (i + 1) * 0.2,
                    scale: 1 - (i + 1) * STACK_SCALE_STEP,
                  }}
                  exit={{ top: 0, opacity: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 35, delay: i * 0.03 }}
                  style={{
                    height: "56px",
                    transformOrigin: "top center",
                    zIndex: STACK_COUNT - i,
                    background: isR
                      ? `hsl(150 100% 45% / ${0.04 - i * 0.005})`
                      : `hsl(0 60% 50% / ${0.04 - i * 0.005})`,
                    border: isR
                      ? "1px solid hsl(150 100% 45% / 0.12)"
                      : "1px solid hsl(0 60% 50% / 0.12)",
                  }}
                />
              );
            })
          }
        </AnimatePresence>

        {/* Top card */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          className="relative z-10"
        >
          <TxCard tx={topTx} />
        </motion.div>

        {/* Hint pill */}
        <AnimatePresence>
          {restTx.length > 0 && !expanded && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-1 rounded-full"
              style={{
                background: "hsl(220 16% 12%)",
                border: "1px solid hsl(220 14% 18%)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              <motion.div
                animate={{ y: [0, 2, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="flex items-center gap-1"
              >
                <ChevronDown className="w-3 h-3 text-muted-foreground/50" />
                <span className="text-[9px] text-muted-foreground/50 font-medium">
                  +{restTx.length} transações
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Expanded list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 pt-1.5">
              {restTx.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    delay: i * 0.04,
                  }}
                >
                  <TxCard tx={tx} />
                </motion.div>
              ))}
            </div>

            {/* Collapse */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: restTx.length * 0.04 }}
              onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
              className="w-full mt-2.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors py-1.5 rounded-lg hover:bg-white/[0.02]"
            >
              <ChevronUp className="w-3 h-3" />
              Recolher
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

TransacoesRecentes.displayName = "TransacoesRecentes";
export default TransacoesRecentes;
