import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { updateTransactionStatus, updateTransaction, deleteTransaction } from "@/services/transactionService";
import type { FinanceEvent } from "@/types/finance";

interface Props {
  open: boolean;
  event: FinanceEvent | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  "Alimentação", "Transporte", "Saúde", "Assinaturas",
  "Lazer", "Moradia", "Educação", "Salário", "Freelance", "Investimentos", "Outros",
];

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PagarEditarModal = ({ open, event, onClose, onSuccess }: Props) => {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetEdit = () => {
    if (event) {
      setName(event.name);
      setCategory(event.category);
    }
  };

  const handlePay = async () => {
    if (!event?.isTransaction) return;
    setSubmitting(true);
    try {
      await updateTransactionStatus(event.id, "pago");
      toast.success("Transação marcada como paga ✅");
      onSuccess();
      onClose();
    } catch {
      toast.error("Erro ao marcar como paga");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!event?.isTransaction) return;
    setSubmitting(true);
    try {
      await updateTransaction(event.id, { name, category });
      toast.success("Transação atualizada ✏️");
      onSuccess();
      onClose();
      setMode("view");
    } catch {
      toast.error("Erro ao atualizar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!event?.isTransaction) return;
    setSubmitting(true);
    try {
      await deleteTransaction(event.id);
      toast.success("Transação removida");
      onSuccess();
      onClose();
    } catch {
      toast.error("Erro ao remover");
    } finally {
      setSubmitting(false);
    }
  };

  if (!event) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm mx-4 rounded-2xl border border-border/20 bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-base font-display font-bold text-foreground">
                {mode === "edit" ? "Editar transação" : "Transação agendada"}
              </h2>
              <button onClick={() => { onClose(); setMode("view"); }} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {mode === "view" ? (
              <div className="px-5 pb-5 space-y-4">
                {/* Info */}
                <div
                  className="rounded-xl p-4 border"
                  style={{
                    background: "hsl(40 80% 50% / 0.06)",
                    borderColor: "hsl(40 80% 50% / 0.15)",
                  }}
                >
                  <p className="text-sm font-semibold text-foreground">{event.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{event.category} · {event.date}</p>
                  <p className="text-xl font-bold mt-2 text-amber-500">{fmt(event.amount)}</p>
                  <span className="inline-block text-[9px] font-semibold uppercase mt-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Pendente
                  </span>
                </div>

                {/* Actions */}
                {event.isTransaction && (
                  <div className="space-y-2">
                    <Button
                      onClick={handlePay}
                      disabled={submitting}
                      className="w-full h-11 font-semibold text-sm"
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      Marcar como pago
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => { resetEdit(); setMode("edit"); }}
                        className="flex-1 h-10 text-sm"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1.5" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDelete}
                        disabled={submitting}
                        className="h-10 text-sm text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-5 pb-5 space-y-3.5">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Nome</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-muted border-border"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Categoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    onClick={() => setMode("view")}
                    className="flex-1 h-10 text-sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={submitting}
                    className="flex-1 h-10 text-sm"
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PagarEditarModal;
