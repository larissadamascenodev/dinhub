import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createTransaction, deleteTransaction, getTransactionById, updateTransaction, updateTransactionStatus } from "@/services/transactionService";
import { excludeRecurringForMonth } from "@/services/recurringService";
import { useAuth } from "@/contexts/AuthContext";
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

const extractCardIdFromInvoiceEventId = (eventId: string) => {
  const match = eventId.match(/^fatura-(.+)-(\d{1,2})-(\d{4})$/);
  return match?.[1] ?? null;
};

const PagarEditarModal = ({ open, event, onClose, onSuccess }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isInvoiceEvent = !!event && event.id.startsWith("fatura-");

  const resetEdit = () => {
    if (event) {
      setName(event.name);
      setCategory(event.category);
    }
  };

  const handlePay = async () => {
    if (!event?.isTransaction) return;

    if (isInvoiceEvent) {
      const cardId = extractCardIdFromInvoiceEventId(event.id);
      if (!cardId) {
        toast.error("Não foi possível abrir esta fatura");
        return;
      }

      onClose();
      navigate(`/fatura/${cardId}`);
      return;
    }

    setSubmitting(true);
    try {
      const tx = await getTransactionById(event.id);
      const targetDate = event.rawDate || tx.date;
      const isRecurringCurrentOccurrence = tx.recurrence_type === "fixa" && tx.date !== targetDate;

      if (isRecurringCurrentOccurrence) {
        if (!user) throw new Error("Usuário não autenticado");

        const [year, month] = targetDate.split("-").map(Number);

        await excludeRecurringForMonth(tx.id, month - 1, year, user.id);
        await createTransaction(
          {
            name: tx.name,
            type: tx.type as "receita" | "despesa",
            amount: Number(tx.amount),
            category: tx.category,
            date: targetDate,
            status: "pago",
            account_id: tx.payment_method === "cartao" ? null : tx.account_id,
            payment_method: tx.payment_method as "conta" | "cartao",
            recurrence_type: "unica",
            observation: tx.observation,
            credit_card_id: tx.payment_method === "cartao" ? tx.credit_card_id : null,
          },
          user.id
        );
      } else {
        await updateTransactionStatus(event.id, "pago");
      }

      toast.success("Transação marcada como paga ✅");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao marcar como paga");
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
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
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
                {mode === "edit" ? "Editar transação" : isInvoiceEvent ? "Fatura pendente" : "Transação agendada"}
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
                  <Button
                    onClick={handlePay}
                    disabled={submitting}
                    className="w-full h-11 font-semibold text-sm"
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    {isInvoiceEvent ? "Abrir fatura" : "Marcar como pago"}
                  </Button>
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
