import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Receipt, Layers, MoreVertical, Pencil, Trash2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, type EnrichedItem } from "@/pages/FaturaCartao";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface Props {
  items: EnrichedItem[];
  installmentCount?: number;
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

function EditableItem({
  item,
  idx,
  onEdit,
  onDelete,
}: {
  item: EnrichedItem;
  idx: number;
  onEdit?: (transactionId: string, updates: { name?: string; amount?: number; category?: string }) => Promise<void>;
  onDelete?: (transactionId: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(item.transaction_name);
  const [editAmount, setEditAmount] = useState(String(Number(item.amount)));
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isInstallment = item.total_installments > 1;
  const totalValue = isInstallment ? Number(item.amount) * item.total_installments : null;

  const handleSave = async () => {
    if (!onEdit) return;
    setSaving(true);
    try {
      const newAmount = parseFloat(editAmount);
      await onEdit(item.transaction_id, {
        name: editName !== item.transaction_name ? editName : undefined,
        amount: !isNaN(newAmount) && newAmount !== Number(item.amount) ? newAmount : undefined,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(item.transaction_id);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const hasActions = !!onEdit || !!onDelete;

  return (
    <>
      <motion.div
        key={item.id}
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: idx * 0.03 }}
        className="rounded-xl border border-border/15 bg-card/60 backdrop-blur-xl border-l-[3px] border-l-primary/40 px-3 py-2.5"
        style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.25)" }}
      >
        <div className="flex gap-3">
          {/* Icon */}
          <div className="w-9 h-9 rounded-lg bg-muted/20 border border-border/10 flex items-center justify-center shrink-0 self-start mt-0.5">
            <Layers className="w-4 h-4 text-muted-foreground/60" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1">
            {editing ? (
              /* Edit mode */
              <div className="space-y-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-8 text-xs bg-muted/30 border-border/20"
                  placeholder="Nome"
                />
                <Input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="h-8 text-xs bg-muted/30 border-border/20"
                  placeholder="Valor"
                  step="0.01"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setEditing(false); setEditName(item.transaction_name); setEditAmount(String(Number(item.amount))); }}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg bg-muted/20"
                  >
                    <X className="w-3 h-3" /> Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1 text-[11px] text-primary font-semibold px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 disabled:opacity-50"
                  >
                    <Check className="w-3 h-3" /> {saving ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </div>
            ) : (
              /* View mode */
              <>
                {/* Row 1: Name + Value + Menu */}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-bold text-foreground leading-tight truncate">
                    {item.transaction_name}
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="text-right">
                      <p className="text-[13px] font-bold text-foreground tabular-nums leading-tight">
                        {formatCurrency(Number(item.amount))}
                      </p>
                      {totalValue && (
                        <p className="text-[10px] text-muted-foreground/60 tabular-nums leading-tight mt-0.5">
                          Total: {formatCurrency(totalValue)}
                        </p>
                      )}
                    </div>
                    {hasActions && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-muted/30 transition-colors -mr-1">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[140px]">
                          {onEdit && (
                            <DropdownMenuItem onClick={() => setEditing(true)} className="text-xs gap-2">
                              <Pencil className="w-3.5 h-3.5" /> Editar
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => setShowDeleteDialog(true)}
                              className="text-xs gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Excluir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {/* Row 2: Installment bar */}
                {isInstallment && (
                  <InstallmentBar current={item.installment_number} total={item.total_installments} />
                )}

                {/* Row 3: Category + installment count */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground/50">
                    {item.transaction_category}
                  </span>
                  {isInstallment ? (
                    <span className="text-[11px] tabular-nums">
                      <span className="font-bold text-primary">{item.installment_number}</span>
                      <span className="text-muted-foreground/50"> de {item.total_installments} parcelas</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/40">Pagamento único</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{item.transaction_name}"?
              {isInstallment && " Isso removerá todas as parcelas desta compra."}
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

export default function InvoiceTransactionList({ items, installmentCount = 0, onEditItem, onDeleteItem }: Props) {
  return (
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
          {items.map((item, idx) => (
            <EditableItem
              key={item.id}
              item={item}
              idx={idx}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
