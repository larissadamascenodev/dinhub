import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GoalDepositModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; date: string; source?: string }) => void;
  goalName: string;
}

const GoalDepositModal = ({ open, onClose, onSubmit, goalName }: GoalDepositModalProps) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [source, setSource] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!amount) return;
    setSubmitting(true);
    try {
      await onSubmit({
        amount: parseFloat(amount),
        date,
        source: source.trim() || undefined,
      });
      setAmount("");
      setSource("");
      setDate(new Date().toISOString().split("T")[0]);
    } finally {
      setSubmitting(false);
    }
  };

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
            className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border/20 shadow-2xl p-5 pb-24 sm:pb-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Depositar</h3>
                  <p className="text-[11px] text-muted-foreground">{goalName}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/20 transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5">Valor (R$) *</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="200"
                  min="0.01"
                  step="0.01"
                  className="bg-muted/10 border-border/15"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5">Data</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-muted/10 border-border/15"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5">Origem (opcional)</Label>
                <Input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Ex: Salário, Bônus..."
                  className="bg-muted/10 border-border/15"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={!amount || submitting}
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Depositando..." : "Confirmar depósito"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GoalDepositModal;
