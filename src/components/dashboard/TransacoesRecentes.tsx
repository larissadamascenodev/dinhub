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
      className="relative flex items-center gap-3 px-4 py-3 rounded-[14px] overflow-hidden"
      style={{
        background: "hsl(220 17% 10%)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Icon circle */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: isReceita ? "hsl(150 100% 45% / 0.1)" : "hsl(0 60% 50% / 0.1)",
        }}
      >
        <Icon
          className="w-4 h-4"
          style={{ color: isReceita ? "hsl(150 100% 45%)" : "hsl(0 60% 50%)" }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">{tx.name}</p>
        <p className="text-[10px] text-muted-foreground/40 mt-px">{tx.category} · {formatDate()}</p>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p
          className="text-[13px] font-bold tabular-nums"
          style={{ color: isReceita ? "hsl(150 100% 45%)" : "hsl(0 60% 50%)" }}
        >
          {isReceita ? "+" : "−"}{fmt(tx.amount)}
        </p>
        <p className="text-[9px] text-muted-foreground/30 font-medium">{isReceita ? "Receita" : "Despesa"}</p>
      </div>
    </div>
  );
};

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

      {/* Stack */}
      <div
        className="relative cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        style={{
          paddingBottom: !expanded && restTx.length > 0 ? `${Math.min(restTx.length, 3) * 5 + 8}px` : 0,
        }}
      >
        {/* Ghost cards */}
        {!expanded && restTx.length > 0 &&
          restTx.slice(0, 3).map((_, i) => (
            <div
              key={`g-${i}`}
              className="absolute left-0 right-0 rounded-[14px]"
              style={{
                top: `${(i + 1) * 5}px`,
                height: "56px",
                transform: `scale(${1 - (i + 1) * 0.02})`,
                zIndex: 3 - i,
                background: `hsl(220 17% ${10 - (i + 1) * 1.5}%)`,
                borderBottom: "1px solid hsl(220 14% 14%)",
                opacity: 1 - (i + 1) * 0.2,
              }}
            />
          ))
        }

        {/* Top card */}
        <motion.div layout className="relative z-10">
          <TxCard tx={topTx} />
        </motion.div>

        {/* Pill */}
        {restTx.length > 0 && !expanded && (
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 text-[9px] text-muted-foreground/40 font-medium">
            <ChevronDown className="w-3 h-3" />
            +{restTx.length}
          </div>
        )}
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="overflow-hidden mt-1.5"
          >
            <div className="space-y-1.5">
              {restTx.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <TxCard tx={tx} />
                </motion.div>
              ))}
            </div>

            {/* Collapse button */}
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
              className="w-full mt-2 flex items-center justify-center gap-1 text-[10px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors py-1"
            >
              <ChevronUp className="w-3 h-3" />
              Recolher
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

TransacoesRecentes.displayName = "TransacoesRecentes";
export default TransacoesRecentes;
