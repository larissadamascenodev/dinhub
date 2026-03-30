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
    <div className="flex gap-0.5 mt-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full flex-1 max-w-[28px]",
            i < current ? "bg-muted-foreground" : "bg-muted/40"
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
          <div className="flex items-center gap-1">
            <Receipt className="w-3 h-3" />
            <span className="font-semibold">{items.length} total</span>
          </div>
          {installmentCount > 0 && (
            <div className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span className="font-semibold">{installmentCount} parcelados</span>
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
        <div className="space-y-2">
          {items.map((item, idx) => {
            const totalValue = item.total_installments > 1
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
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {item.transaction_name}
                      </p>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground">
                          {formatCurrency(Number(item.amount))}
                        </p>
                        {totalValue && (
                          <p className="text-[10px] text-muted-foreground">
                            Total: {formatCurrency(totalValue)}
                          </p>
                        )}
                      </div>
                    </div>
                    <InstallmentBar
                      current={item.installment_number}
                      total={item.total_installments}
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[11px] text-muted-foreground">
                        {item.transaction_category}
                      </span>
                      {item.total_installments > 1 && (
                        <span className="text-[11px] font-semibold text-primary">
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
