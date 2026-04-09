import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GoalCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    target_amount: number;
    monthly_contribution?: number | null;
    deadline?: string | null;
  }) => void;
}

const GoalCreateModal = ({ open, onClose, onSubmit }: GoalCreateModalProps) => {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !targetAmount) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        target_amount: parseFloat(targetAmount),
        monthly_contribution: monthlyContribution ? parseFloat(monthlyContribution) : null,
        deadline: deadline || null,
      });
      setName("");
      setTargetAmount("");
      setMonthlyContribution("");
      setDeadline("");
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
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Nova Meta</h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/20 transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5">Nome da meta *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Viagem, Reserva de emergência..."
                  className="bg-muted/10 border-border/15"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5">Valor alvo (R$) *</Label>
                <Input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="10000"
                  min="1"
                  step="0.01"
                  className="bg-muted/10 border-border/15"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5">Aporte mensal (R$)</Label>
                <Input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  placeholder="500"
                  min="0"
                  step="0.01"
                  className="bg-muted/10 border-border/15"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5">Prazo</Label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="bg-muted/10 border-border/15"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={!name.trim() || !targetAmount || submitting}
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl text-sm font-bold bg-primary/15 border border-primary/20 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando imagem e criando...
                </>
              ) : (
                "Criar meta"
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GoalCreateModal;
