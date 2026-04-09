import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Calendar, FileText } from "lucide-react";
import { Target } from "lucide-react";

interface GoalDepositModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; date: string; source?: string }) => void;
  goalName: string;
}

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

const GoalDepositModal = ({ open, onClose, onSubmit, goalName }: GoalDepositModalProps) => {
  const [amount, setAmount] = useState("");
  const [dateMode, setDateMode] = useState<"hoje" | "ontem" | "outros">("hoje");
  const [customDate, setCustomDate] = useState("");
  const [source, setSource] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getDate = () => {
    if (dateMode === "hoje") return new Date().toISOString().split("T")[0];
    if (dateMode === "ontem") {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().split("T")[0];
    }
    return customDate || new Date().toISOString().split("T")[0];
  };

  const handleSubmit = async () => {
    const val = parseFloat(amount.replace(",", "."));
    if (!val || val <= 0) return;
    setSubmitting(true);
    try {
      await onSubmit({
        amount: val,
        date: getDate(),
        source: source.trim() || undefined,
      });
      setAmount("");
      setSource("");
      setDateMode("hoje");
      setCustomDate("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAmountChange = (raw: string) => {
    // Allow only digits and comma/dot
    const cleaned = raw.replace(/[^\d,\.]/g, "");
    setAmount(cleaned);
  };

  const displayAmount = amount || "0,00";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border/20 shadow-2xl p-5 pb-24 sm:pb-5 space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Depositar</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Target className="w-3 h-3 text-primary" />
                    <span className="text-[11px] text-muted-foreground">{goalName}</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/20 transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Amount input */}
            <div>
              <p className="text-[10px] text-muted-foreground mb-2">Valor do aporte</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-muted-foreground">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0,00"
                  className="bg-transparent text-3xl font-bold text-foreground outline-none w-full tabular-nums placeholder:text-muted-foreground/30"
                  autoFocus
                />
              </div>

              {/* Quick amount buttons */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {QUICK_AMOUNTS.map((v) => (
                  <motion.button
                    key={v}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAmount(String(v))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      amount === String(v)
                        ? "bg-primary/15 border-primary/30 text-primary"
                        : "bg-muted/10 border-border/15 text-muted-foreground hover:bg-muted/20"
                    }`}
                  >
                    R$ {v}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Date selector */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
              <div className="flex items-center gap-1.5">
                {(["hoje", "ontem", "outros"] as const).map((mode) => (
                  <motion.button
                    key={mode}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDateMode(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors capitalize ${
                      dateMode === mode
                        ? "bg-primary/15 border-primary/30 text-primary"
                        : "bg-muted/10 border-border/15 text-muted-foreground hover:bg-muted/20"
                    }`}
                  >
                    {mode === "hoje" ? "Hoje" : mode === "ontem" ? "Ontem" : "Outros"}
                  </motion.button>
                ))}
              </div>
            </div>

            {dateMode === "outros" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full bg-muted/10 border border-border/15 rounded-lg px-3 py-2 text-sm text-foreground outline-none"
                />
              </motion.div>
            )}

            {/* Observation */}
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Observação (opcional)"
                className="bg-transparent text-sm text-foreground outline-none w-full placeholder:text-muted-foreground/40"
              />
            </div>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={!amount || submitting}
              onClick={handleSubmit}
              className="w-full py-3.5 rounded-xl text-sm font-bold bg-primary/15 border border-primary/20 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Depositando..." : "Confirmar Aporte"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GoalDepositModal;
