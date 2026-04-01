import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MONTH_SHORT } from "@/pages/FaturaCartao";
import type { Invoice } from "@/services/invoiceService";

interface Props {
  selectedMonth: number;
  selectedYear: number;
  invoices: Invoice[];
  onSelect: (month: number, year: number) => void;
}

export default function InvoiceTimeline({ selectedMonth, selectedYear, invoices, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate 12 months centered around current selection
  const months = Array.from({ length: 12 }, (_, i) => {
    const offset = i - 5;
    let m = selectedMonth + offset;
    let y = selectedYear;
    while (m > 12) { m -= 12; y++; }
    while (m < 1) { m += 12; y--; }
    return { month: m, year: y };
  });

  useEffect(() => {
    if (scrollRef.current) {
      const active = scrollRef.current.querySelector("[data-active='true']");
      if (active) {
        active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [selectedMonth, selectedYear]);

  return (
    <div ref={scrollRef} className="flex gap-1.5 overflow-x-auto scrollbar-none py-1">
      {months.map(({ month, year }) => {
        const isSelected = month === selectedMonth && year === selectedYear;
        const hasInvoice = invoices.some((i) => i.month === month && i.year === year);
        const invoice = invoices.find((i) => i.month === month && i.year === year);
        const isPaid = invoice?.is_paid;
        const hasAmount = invoice && Number(invoice.total_amount) > 0;

        return (
          <button
            key={`${year}-${month}`}
            data-active={isSelected}
            onClick={() => onSelect(month, year)}
            className={cn(
              "flex flex-col items-center gap-1 min-w-[52px] py-1.5 px-1 rounded-lg transition-all",
              isSelected
                ? "bg-primary/15"
                : "hover:bg-muted/40"
            )}
          >
            {/* Block indicator */}
            <div
              className={cn(
                "w-full h-5 rounded-md transition-all",
                isSelected
                  ? isPaid
                    ? "bg-primary border border-primary/60"
                    : "bg-foreground border border-foreground/50"
                  : isPaid
                  ? "bg-primary/50 border border-primary/30"
                  : hasAmount
                  ? "bg-foreground/40 border border-foreground/20"
                  : "bg-muted/30 border border-border/20"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium",
                isSelected ? "text-primary font-bold" : "text-muted-foreground"
              )}
            >
              {MONTH_SHORT[month - 1]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
