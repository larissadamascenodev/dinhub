import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MONTH_NAMES, formatCurrency } from "@/pages/FaturaCartao";

interface Props {
  total: number;
  selectedMonth: number;
  selectedYear: number;
  invoiceStatus: string | null;
  dueInfo: { text: string; overdue: boolean } | null;
  onPrev: () => void;
  onNext: () => void;
}

export default function InvoiceSummaryCard({
  total, selectedMonth, selectedYear, invoiceStatus, dueInfo, onPrev, onNext,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onPrev}
        className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="text-center space-y-1">
        <p className="text-xs text-muted-foreground font-medium">
          Fatura de {MONTH_NAMES[selectedMonth - 1]}
        </p>
        <p className="text-3xl font-extrabold text-foreground tracking-tight">
          {formatCurrency(total)}
        </p>
        <div className="flex items-center justify-center gap-2">
          {invoiceStatus === "closed" && (
            <span className="text-[10px] font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
              Fatura fechada
            </span>
          )}
          {invoiceStatus === "open" && (
            <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Fatura aberta
            </span>
          )}
          {dueInfo && invoiceStatus !== "paid" && (
            <span
              className={cn(
                "text-[10px] font-semibold",
                dueInfo.overdue ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {dueInfo.text}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
