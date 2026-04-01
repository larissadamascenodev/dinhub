import { AnimatePresence, motion } from "framer-motion";
import { X, CreditCard, CheckCircle2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, type AccountInfo } from "@/pages/FaturaCartao";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  total: number;
  accounts: AccountInfo[];
  payAccountId: string;
  setPayAccountId: (id: string) => void;
  onConfirm: () => void;
  paying: boolean;
}

export default function InvoicePayModal({
  open, onClose, total, accounts, payAccountId, setPayAccountId, onConfirm, paying,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-card border border-border/30 shadow-2xl overflow-hidden"
          >
            <div className="p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"
                    style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.3))" }}
                  >
                    <CreditCard className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Pagar Fatura</h3>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Amount */}
              <div className="text-center py-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Valor da fatura</p>
                <p className="text-3xl font-extrabold text-primary tracking-tight">{formatCurrency(total)}</p>
              </div>

              {/* Account selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                  Debitar da conta
                </label>
                <Select value={payAccountId} onValueChange={setPayAccountId}>
                  <SelectTrigger className="bg-muted/20 border-border/20 h-11 rounded-xl text-sm">
                    <SelectValue placeholder="Selecionar conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(Number(acc.current_balance))})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-xl text-xs font-bold border border-border/30 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={paying || !payAccountId}
                  className={cn(
                    "flex-1 h-11 rounded-xl text-xs font-bold transition-all backdrop-blur-md flex items-center justify-center gap-1.5",
                    payAccountId
                      ? "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 shadow-[0_0_12px_-3px_hsl(var(--primary)/0.4)]"
                      : "bg-muted/20 text-muted-foreground border border-border/10 cursor-not-allowed"
                  )}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {paying ? "Processando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
