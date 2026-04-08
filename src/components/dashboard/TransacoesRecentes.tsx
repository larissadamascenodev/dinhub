import { memo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layers, ChevronUp, Clock, RefreshCw,
  CreditCard, Wallet, Sparkles, Landmark,
} from "lucide-react";
import { getCustomCategories, type CustomCategory } from "@/services/categoryService";
import { getCategoryIcon, getCategoryColor } from "@/lib/categoryUtils";
import { motion, AnimatePresence } from "framer-motion";
import type { Transaction } from "@/types/finance";
import { getTransactionById, getAccounts } from "@/services/transactionService";
import { useAuth } from "@/contexts/AuthContext";
import { useMonth } from "@/contexts/MonthContext";
import TransactionDetailModal from "@/components/dashboard/TransactionDetailModal";

interface Props {
  transactions: Transaction[];
  onVerTodas?: () => void;
  onDelete?: () => void;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const hexToHslString = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const FaturaCard = ({ tx, onClick }: { tx: Transaction; onClick: () => void }) => {
  const navigate = useNavigate();
  const cardColor = tx.creditCardColor ? hexToHslString(tx.creditCardColor) : "260 70% 60%";
  return (
    <div
      className="group relative flex items-center gap-2.5 px-3 py-2.5 md:gap-3 md:px-4 md:py-3.5 rounded-xl bg-card/95 border border-primary/10 cursor-pointer hover:border-primary/25 transition-colors"
      onClick={() => navigate(`/fatura/${tx.creditCardId}`)}
    >
      <div
        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `hsl(${cardColor} / 0.12)` }}
      >
        <CreditCard className="w-4 h-4 md:w-[18px] md:h-[18px]" style={{ color: `hsl(${cardColor})` }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs md:text-[13px] font-bold text-foreground truncate">{tx.name}</p>
        <p className="text-[9px] md:text-[10px] mt-0.5 text-muted-foreground/50">
          {tx.faturaItemCount} lançamento{tx.faturaItemCount !== 1 ? "s" : ""} · {tx.date}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs md:text-sm font-bold tabular-nums text-destructive">
          −{fmt(tx.amount)}
        </p>
        <span className="block mt-0.5 text-[8px] md:text-[9px] font-bold uppercase tracking-wide text-primary/60">
          Fatura
        </span>
      </div>
    </div>
  );
};

const TxCard = ({ tx, onClick, customCategories }: { tx: Transaction; onClick: () => void; customCategories?: CustomCategory[] }) => {
  if (tx.isFatura) return <FaturaCard tx={tx} onClick={onClick} />;

  const isReceita = tx.type === "receita";
  const isPaid = tx.status === "pago";
  const isPending = tx.status !== "pago";
  const catColor = getCategoryColor(tx.category, customCategories);
  const CatIcon = getCategoryIcon(tx.category, customCategories);

  return (
    <div
      className={`group relative flex items-center gap-2.5 px-3 py-2.5 md:gap-3 md:px-4 md:py-3.5 rounded-xl backdrop-blur-xl cursor-pointer ${
        isPending ? "border border-[hsl(40_80%_50%_/_0.15)]" : "bg-card/95"
      }`}
      style={isPending ? { background: "hsl(40 80% 50% / 0.06)" } : undefined}
      onClick={onClick}
    >
      {/* Category icon */}
      <div
        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `hsl(${catColor} / 0.12)` }}
      >
        <CatIcon className="w-4 h-4 md:w-[18px] md:h-[18px]" style={{ color: `hsl(${catColor})` }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs md:text-[13px] font-bold text-foreground truncate">{tx.name}</p>
        <p className="text-[9px] md:text-[10px] mt-0.5 text-muted-foreground/50">
          {tx.category} · {tx.date}
        </p>
      </div>

      {/* Amount + status */}
      <div className="text-right shrink-0">
        <p
          className="text-xs md:text-sm font-bold tabular-nums"
          style={{ color: isPending ? "hsl(40 80% 50%)" : isReceita ? "hsl(var(--primary))" : "hsl(var(--destructive))" }}
        >
          {isReceita ? "+" : "−"}{fmt(tx.amount)}
        </p>
        <span className="block mt-0.5 text-[8px] md:text-[9px] font-bold uppercase tracking-wide text-muted-foreground/40">
          {isPaid ? (isReceita ? "Recebido" : "Pago") : (isReceita ? "A Receber" : "Pendente")}
        </span>
      </div>
    </div>
  );
};

// Stack card spacing & scale
const STACK_OFFSET = 12;
const STACK_SCALE_STEP = 0.025;
const STACK_COUNT = 3;

const TransacoesRecentes = memo(({ transactions, onDelete }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuth();
  const { selectedMonth, selectedYear } = useMonth();
  const [detailTx, setDetailTx] = useState<any>(null);
  const [detailAccountName, setDetailAccountName] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [customCats, setCustomCats] = useState<CustomCategory[]>([]);

  useEffect(() => {
    getCustomCategories().then(setCustomCats).catch(() => {});
  }, []);

  const visible = transactions.slice(0, 7);
  const topTx = visible[0];
  const restTx = visible.slice(1);

  const handleTxClick = async (tx: Transaction) => {
    if (tx.isFatura) return;
    try {
      const [fullTx, accounts] = await Promise.all([
        getTransactionById(tx.id),
        getAccounts(),
      ]);
      if (fullTx) {
        const acct = (accounts as any[]).find((a: any) => a.id === fullTx.account_id);
        setDetailAccountName(acct?.name || "");
        setDetailTx(fullTx);
        setShowDetail(true);
      }
    } catch {
      // silently fail
    }
  };

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
                  height: "48px",
                  transformOrigin: "top center",
                  zIndex: STACK_COUNT - i,
                  background: `hsl(220 12% ${11 + i * 1.5}% / 0.95)`,
                  border: `1px solid hsl(220 10% ${18 + i * 2}% / 0.4)`,
                  boxShadow: `0 ${2 + i * 2}px ${8 + i * 4}px rgba(0,0,0,0.4)`,
                  borderRadius: "12px",
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
          <TxCard tx={topTx} onClick={() => handleTxClick(topTx)} customCategories={customCats} />
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
                  <TxCard tx={tx} onClick={() => handleTxClick(tx)} customCategories={customCats} />
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

      {/* Transaction detail modal */}
      <TransactionDetailModal
        open={showDetail}
        tx={detailTx}
        accountName={detailAccountName}
        onClose={() => { setShowDetail(false); setDetailTx(null); }}
        onRefresh={() => { setShowDetail(false); setDetailTx(null); onDelete?.(); }}
        userId={user?.id}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
    </div>
  );
});

TransacoesRecentes.displayName = "TransacoesRecentes";
export default TransacoesRecentes;
