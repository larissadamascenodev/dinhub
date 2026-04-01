import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, type EnrichedItem } from "@/pages/FaturaCartao";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  item: EnrichedItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (transactionId: string, updates: { name?: string; amount?: number }) => Promise<void>;
}

export default function InvoiceItemEditModal({ item, open, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync state when item changes
  const itemId = item?.transaction_id;
  const [lastItemId, setLastItemId] = useState<string | null>(null);
  if (itemId && itemId !== lastItemId) {
    setName(item?.transaction_name ?? "");
    setAmount(String(Number(item?.amount ?? 0)));
    setLastItemId(itemId);
  }

  if (!open || !item) return null;

  const isInstallment = item.total_installments > 1;

  const handleSave = async () => {
    setSaving(true);
    try {
      const newAmount = parseFloat(amount);
      const updates: { name?: string; amount?: number } = {};
      if (name !== item.transaction_name) updates.name = name;
      if (!isNaN(newAmount) && newAmount !== Number(item.amount)) updates.amount = newAmount;
      if (Object.keys(updates).length > 0) {
        await onSave(item.transaction_id, updates);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
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
          className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border/20 shadow-2xl"
        >
          <div className="p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Editar Lançamento</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Fields */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Nome</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 bg-muted/20 border-border/20 text-sm"
                  placeholder="Nome da transação"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {isInstallment ? "Valor da parcela" : "Valor"}
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-10 bg-muted/20 border-border/20 text-sm"
                  placeholder="0,00"
                  step="0.01"
                />
                {isInstallment && (
                  <p className="text-[10px] text-muted-foreground">
                    Parcela {item.installment_number} de {item.total_installments} · Total: {formatCurrency(Number(amount || 0) * item.total_installments)}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-10 rounded-xl text-xs font-semibold border-border/20"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="flex-1 h-10 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
