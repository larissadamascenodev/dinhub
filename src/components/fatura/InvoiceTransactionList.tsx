import { motion } from "framer-motion";
import { Receipt, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, type EnrichedItem } from "@/pages/FaturaCartao";

interface Props {
  items: EnrichedItem[];
  installmentCount?: number;
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

export default function InvoiceTransactionList({ items, installmentCount = 0 }: Props) {
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
          {items.map((item, idx) => {
            const isInstallment = item.total_installments > 1;
            const totalValue = isInstallment
              ? Number(item.amount) * item.total_installments
              : null;

            return (
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
                    {/* Row 1: Name + Value */}
                    <div className="flex items-start justify-between gap-3">
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

                    {/* Row 2: Installment bar (full width) */}
                    {isInstallment && (
                      <InstallmentBar
                        current={item.installment_number}
                        total={item.total_installments}
                      />
                    )}

                    {/* Row 3: Date left, installment count right */}
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
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
