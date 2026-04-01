import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MoreVertical, Layers, CalendarDays, CreditCard, Clock,
  CheckCircle2, Pencil, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, type EnrichedItem, MONTH_NAMES } from "@/pages/FaturaCartao";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  item: EnrichedItem | null;
  cardName?: string;
  onClose: () => void;
  onEdit?: (transactionId: string) => void;
  onDelete?: (transactionId: string) => void;
}

export default function InvoiceItemDetailModal({ item, cardName, onClose, onEdit, onDelete }: Props) {
  const isInstallment = item ? item.total_installments > 1 : false;
  const installmentAmount = item ? Number(item.amount) : 0;
  const totalValue = isInstallment ? installmentAmount * (item?.total_installments ?? 1) : installmentAmount;
  const paidInstallments = item ? item.installment_number - 1 : 0;
  const paidAmount = paidInstallments * installmentAmount;
  const remainingInstallments = item ? item.total_installments - item.installment_number : 0;
  const remainingAmount = (remainingInstallments + 1) * installmentAmount;

  const purchaseDate = item?.transaction_date
    ? new Date(item.transaction_date + "T12:00:00")
    : null;

  const formattedDate = purchaseDate
    ? `${String(purchaseDate.getDate()).padStart(2, "0")} de ${MONTH_NAMES[purchaseDate.getMonth()]?.substring(0, 3)}.`
    : "—";

  const isPending = item?.transaction_status === "pendente";

  // Generate installment timeline
  const installments = useMemo(() => {
    if (!isInstallment || !purchaseDate || !item) return [];
    return Array.from({ length: item.total_installments }, (_, i) => {
      const num = i + 1;
      const date = new Date(purchaseDate);
      date.setMonth(date.getMonth() + i);
      const monthName = MONTH_NAMES[date.getMonth()]?.substring(0, 3) ?? "";
      const year = date.getFullYear();
      const isPast = num < item.installment_number;
      const isCurrent = num === item.installment_number;
      return { num, monthName, year, isPast, isCurrent };
    });
  }, [item, purchaseDate, isInstallment]);

  if (!item) return null;

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
          className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card border border-border/20 shadow-2xl"
        >
          <div className="p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {(onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[140px]">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(item.transaction_id)} className="text-xs gap-2">
                        <Pencil className="w-3.5 h-3.5" /> Editar
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(item.transaction_id)}
                        className="text-xs gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Excluir
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground leading-tight">{item.transaction_name}</h2>
                <span className="text-xs text-primary font-semibold">
                  {isInstallment ? "Parcelado" : "Pagamento único"}
                </span>
              </div>
            </div>

            {/* Amount */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
                {isInstallment ? "Parcela mensal" : "Valor"}
              </p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-extrabold text-foreground tracking-tight">
                  {formatCurrency(installmentAmount)}
                </p>
                {isInstallment && (
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Total</p>
                    <p className="text-sm font-bold text-foreground">{formatCurrency(totalValue)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Details chips */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-2">Detalhes</p>
              <div className="flex gap-2">
                <div className="flex-1 rounded-xl border border-border/15 bg-muted/10 px-3 py-2.5 flex flex-col items-center gap-1">
                  <CalendarDays className="w-4 h-4 text-muted-foreground/60" />
                  <span className="text-[10px] text-muted-foreground">Compra</span>
                  <span className="text-[11px] font-bold text-foreground">{formattedDate}</span>
                </div>
                <div className="flex-1 rounded-xl border border-border/15 bg-muted/10 px-3 py-2.5 flex flex-col items-center gap-1">
                  <CreditCard className="w-4 h-4 text-muted-foreground/60" />
                  <span className="text-[10px] text-muted-foreground">Cartão</span>
                  <span className="text-[11px] font-bold text-foreground truncate max-w-full">{cardName || "—"}</span>
                </div>
                <div className="flex-1 rounded-xl border border-border/15 bg-muted/10 px-3 py-2.5 flex flex-col items-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground/60" />
                  <span className="text-[10px] text-muted-foreground">Status</span>
                  <span className={cn("text-[11px] font-bold", isPending ? "text-[hsl(var(--warning))]" : "text-primary")}>
                    {isPending ? "Pendente" : "Pago"}
                  </span>
                </div>
              </div>
            </div>

            {/* Installment progress */}
            {isInstallment && (
              <div className="space-y-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Progresso</p>

                {/* Progress bar */}
                <div className="w-full h-2.5 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.installment_number / item.total_installments) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>

                {/* Paid / Remaining cards */}
                <div className="flex gap-2">
                  <div className="flex-1 rounded-xl border border-border/15 bg-muted/10 px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Já pagas</p>
                    <p className="text-base font-bold text-primary">{formatCurrency(paidAmount)}</p>
                    <p className="text-[10px] text-muted-foreground">{paidInstallments} de {item.total_installments} parcelas</p>
                  </div>
                  <div className="flex-1 rounded-xl border border-border/15 bg-muted/10 px-3 py-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Faltam</p>
                    <p className="text-base font-bold text-foreground">{formatCurrency(remainingAmount)}</p>
                    <p className="text-[10px] text-muted-foreground">{remainingInstallments + 1} parcelas restantes</p>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-3">Parcelas</p>
                  <div className="space-y-0">
                    {installments.map((inst, idx) => (
                      <div key={inst.num} className="flex items-center gap-3">
                        {/* Timeline dot + line */}
                        <div className="flex flex-col items-center w-5">
                          {idx > 0 && (
                            <div className={cn(
                              "w-px h-3",
                              inst.isPast || inst.isCurrent ? "bg-primary/40" : "bg-muted/30"
                            )} />
                          )}
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                            inst.isPast
                              ? "bg-primary/20"
                              : inst.isCurrent
                                ? "bg-primary/30 ring-2 ring-primary/50"
                                : "bg-muted/20"
                          )}>
                            {inst.isPast ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            ) : inst.isCurrent ? (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                            )}
                          </div>
                          {idx < installments.length - 1 && (
                            <div className={cn(
                              "w-px h-3",
                              inst.isPast ? "bg-primary/40" : "bg-muted/30"
                            )} />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex items-center justify-between py-1">
                          <div>
                            <p className={cn(
                              "text-xs font-bold",
                              inst.isCurrent ? "text-primary" : inst.isPast ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {inst.monthName}. De {inst.year}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Parcela {inst.num}/{item.total_installments}
                            </p>
                          </div>
                          <p className={cn(
                            "text-xs font-bold tabular-nums",
                            inst.isCurrent ? "text-foreground" : inst.isPast ? "text-primary" : "text-muted-foreground"
                          )}>
                            {formatCurrency(installmentAmount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
