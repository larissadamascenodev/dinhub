import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, type AccountInfo } from "@/pages/FaturaCartao";

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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-3xl bg-card border-t border-border/30 p-6 space-y-4"
          >
            <div className="w-10 h-1 rounded-full bg-border/40 mx-auto mb-2" />
            <h3 className="text-base font-bold text-foreground text-center">Pagar Fatura</h3>
            <p className="text-center text-2xl font-bold text-primary">{formatCurrency(total)}</p>

            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">Debitar da conta:</p>
              <Select value={payAccountId} onValueChange={setPayAccountId}>
                <SelectTrigger className="bg-muted/30 border-border/20 h-11 rounded-xl">
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

            <Button
              onClick={onConfirm}
              disabled={paying || !payAccountId}
              className="w-full h-12 rounded-2xl text-sm font-bold bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25"
            >
              {paying ? "Processando..." : "Confirmar Pagamento"}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
