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
    <div className="flex gap-[3px] mt-2.5 w-full">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-[5px] rounded-[2px] flex-1",
            i < current ? "bg-foreground/80" : "bg-muted/30"
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
      className="space-y-3"
    >
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-primary" />
          <h2 className="text-sm font-bold text-foreground">Lançamentos</h2>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          {installmentCount > 0 && (
            <div className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span className="font-semibold">{installmentCount}</span>
            </div>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="glass-card p-6 text-center">
          <Receipt className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma compra nessa fatura</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, idx) => {
            const isInstallment = item.total_installments > 1;
            const totalValue = isInstallment
              ? Number(item.amount) * item.total_installments
              : null;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="glass-card p-4 border-l-2 border-l-primary/50"
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
                    <Layers className="w-4.5 h-4.5 text-muted-foreground" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-foreground truncate">
                        {item.transaction_name}
                      </p>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground tabular-nums">
                          {formatCurrency(Number(item.amount))}
                        </p>
                        {totalValue && (
                          <p className="text-[10px] text-muted-foreground tabular-nums">
                            Total: {formatCurrency(totalValue)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Installment segmented bar */}
                    <InstallmentBar
                      current={item.installment_number}
                      total={item.total_installments}
                    />

                    {/* Bottom row: category/date left, installment info right */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-muted-foreground">
                        {item.transaction_category}
                      </span>
                      {isInstallment && (
                        <span className="text-[11px] font-bold text-primary tabular-nums">
                          {item.installment_number} de {item.total_installments} parcelas
                        </span>
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
