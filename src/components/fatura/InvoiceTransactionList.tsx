import { useState } from "react";
import { motion } from "framer-motion";
import { Receipt, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, type EnrichedItem } from "@/pages/FaturaCartao";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import InvoiceItemDetailModal from "./InvoiceItemDetailModal";
import InvoiceItemEditModal from "./InvoiceItemEditModal";

interface Props {
  items: EnrichedItem[];
  installmentCount?: number;
  cardName?: string;
  onEditItem?: (transactionId: string, updates: { name?: string; amount?: number; category?: string }) => Promise<void>;
  onDeleteItem?: (transactionId: string) => Promise<void>;
}

function InstallmentBar({ current, total }: { current: number; total: number }) {
  if (total <= 1) return null;
  return (
    <div className="flex gap-[4px] w-full">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-[4px] rounded-[1.5px] flex-1",
            i < current ? "bg-white/70" : "bg-white/15"
          )}
        />
      ))}
    </div>
  );
}

export default function InvoiceTransactionList({ items, installmentCount = 0, cardName, onEditItem, onDeleteItem }: Props) {
  const [selectedItem, setSelectedItem] = useState<EnrichedItem | null>(null);
  const [editItem, setEditItem] = useState<EnrichedItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EnrichedItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDeleteItem || !deleteTarget) return;
    setDeleting(true);
    try {
      await onDeleteItem(deleteTarget.transaction_id);
      setSelectedItem(null);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleEditFromDetail = (txId: string) => {
    const target = items.find(i => i.transaction_id === txId);
    if (target) {
      setSelectedItem(null);
      setEditItem(target);
    }
  };

  const handleDeleteFromDetail = (txId: string) => {
    const target = items.find(i => i.transaction_id === txId);
    if (target) {
      setSelectedItem(null);
      setDeleteTarget(target);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-2"
      >
        {/* Section header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-primary" />
            <h2 className="text-sm font-bold text-foreground">Lançamentos</h2>
          </div>
          {installmentCount > 0 && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Layers className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{installmentCount}</span>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-border/15 bg-card/60 backdrop-blur-xl p-8 text-center">
            <Receipt className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma compra nessa fatura</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {items.map((item, idx) => {
              const isInstallment = item.total_installments > 1;
              const totalValue = isInstallment ? Number(item.amount) * item.total_installments : null;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => setSelectedItem(item)}
                  className="rounded-xl border border-border/15 bg-card/60 backdrop-blur-xl border-l-[3px] border-l-primary/40 px-3 py-2.5 cursor-pointer active:scale-[0.98] transition-transform"
                  style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.25)" }}
                >
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted/20 border border-border/10 flex items-center justify-center shrink-0 self-start mt-0.5">
                      <Layers className="w-4 h-4 text-muted-foreground/60" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] font-bold text-foreground leading-tight truncate">
                          {item.transaction_name}
                        </p>
                        <div className="text-right shrink-0">
                          <p className="text-[13px] font-bold text-foreground tabular-nums leading-tight">
                            {formatCurrency(Number(item.amount))}
                          </p>
                          {totalValue && (
                            <p className="text-[10px] text-muted-foreground/60 tabular-nums leading-tight mt-0.5">
                              Total: {formatCurrency(totalValue)}
                            </p>
                          )}
                        </div>
                      </div>
                      {isInstallment && (
                        <InstallmentBar current={item.installment_number} total={item.total_installments} />
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground/50">{item.transaction_category}</span>
                        {isInstallment ? (
                          <span className="text-[11px] tabular-nums">
                            <span className="font-bold text-primary">{item.installment_number}</span>
                            <span className="text-muted-foreground/50"> de {item.total_installments} parcelas</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/40">Pagamento único</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      {selectedItem && (
        <InvoiceItemDetailModal
          item={selectedItem}
          cardName={cardName}
          onClose={() => setSelectedItem(null)}
          onEdit={onEditItem ? handleEditFromDetail : undefined}
          onDelete={onDeleteItem ? handleDeleteFromDetail : undefined}
        />
      )}

      {/* Edit Modal */}
      <InvoiceItemEditModal
        item={editItem}
        open={!!editItem}
        onClose={() => setEditItem(null)}
        onSave={async (txId, updates) => {
          if (onEditItem) await onEditItem(txId, updates);
          setEditItem(null);
        }}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteTarget?.transaction_name}"?
              {deleteTarget && deleteTarget.total_installments > 1 && " Isso removerá todas as parcelas desta compra."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
