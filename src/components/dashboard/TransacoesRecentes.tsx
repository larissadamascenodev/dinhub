import { memo, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Layers, ChevronUp, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Transaction } from "@/types/finance";
import { deleteTransaction } from "@/services/transactionService";

interface Props {
  transactions: Transaction[];
  onVerTodas?: () => void;
  onDelete?: () => void;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = () => {
  const now = new Date();
  const day = now.getDate();
  const months = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
  return `${day} de ${months[now.getMonth()]}`;
};

const TxCard = ({ tx, onDelete }: { tx: Transaction; onDelete?: (id: string) => void }) => {
  const isReceita = tx.type === "receita";
  const Icon = isReceita ? ArrowUpRight : ArrowDownRight;
  const isPaid = tx.status === "pago";

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteTransaction(tx.id);
      toast.success("Transação removida");
      onDelete?.(tx.id);
    } catch {
      toast.error("Erro ao remover");
    }
  };

  return (
    <div className="group relative flex items-center gap-2.5 px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-[14px] overflow-hidden bg-card/90 backdrop-blur-xl border border-border/30 shadow-2xl shadow-black/40">
      <div
        className="w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: isReceita ? "hsl(150 100% 45% / 0.1)" : "hsl(0 60% 50% / 0.1)" }}
      >
        <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: isReceita ? "hsl(150 100% 45%)" : "hsl(0 60% 50%)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs md:text-[13px] font-semibold text-foreground truncate">{tx.name}</p>
        <p className="text-[9px] md:text-[10px] text-muted-foreground/40 mt-px">{tx.category} · {tx.date}</p>
      </div>
      <div className="text-right shrink-0 flex items-center gap-2">
        <div className="text-right">
          <p className="text-xs md:text-[13px] font-bold tabular-nums" style={{ color: isReceita ? "hsl(150 100% 45%)" : "hsl(0 60% 50%)" }}>
            {isReceita ? "+" : "−"}{fmt(tx.amount)}
          </p>
          <span className={`block mt-0.5 text-[8px] md:text-[9px] font-bold uppercase tracking-wide ${isPaid ? "text-primary" : "text-destructive"}`}>
            {isPaid ? "Pago" : "A pagar"}
          </span>
        </div>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// Stack card spacing & scale
const STACK_OFFSET = 10;
const STACK_SCALE_STEP = 0.03;
const STACK_COUNT = 4;

const TransacoesRecentes = memo(({ transactions, onDelete }: Props) => {
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
          {expanded ? `${transactions.length} itens` : restTx.length > 0 ? `+${restTx.length} transações` : `${transactions.length} itens`}
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
            restTx.slice(0, STACK_COUNT).map((_, i) => (
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
                  height: "44px",
                  transformOrigin: "top center",
                  zIndex: STACK_COUNT - i,
                  background: `linear-gradient(145deg, hsl(220 18% ${8 - i}% / 0.9) 0%, hsl(220 20% ${4 - i * 0.5}% / 0.95) 100%)`,
                  border: "1px solid hsl(220 12% 16% / 0.2)",
                }}
              />
            ))
          }
        </AnimatePresence>

        {/* Top card */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          className="relative z-10"
        >
          <TxCard tx={topTx} onDelete={onDelete} />
        </motion.div>

      </motion.div>

      {/* Expanded list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 pt-1.5">
              {restTx.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 28,
                    delay: i * 0.05,
                  }}
                >
                  <TxCard tx={tx} onDelete={onDelete} />
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
