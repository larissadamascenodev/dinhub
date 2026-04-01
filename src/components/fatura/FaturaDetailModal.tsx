import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarClock, CalendarCheck, CreditCard, ChevronRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getInvoices, getInvoiceItems } from "@/services/invoiceService";
import { cn } from "@/lib/utils";

interface FaturaCardInfo {
  cardId: string;
  cardName: string;
  closingDay: number;
  dueDay: number;
  color: string | null;
  lastFourDigits: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  card: FaturaCardInfo | null;
  month: number; // 0-indexed
  year: number;
  totalAmount: number;
  isPaid: boolean;
}

interface RecentItem {
  id: string;
  name: string;
  amount: number;
  category: string;
  installment?: string;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function FaturaDetailModal({ open, onClose, card, month, year, totalAmount, isPaid }: Props) {
  const navigate = useNavigate();
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    if (!open || !card) return;
    setLoadingItems(true);
    (async () => {
      try {
        const invoices = await getInvoices(card.cardId, month + 1, year);
        if (invoices.length > 0) {
          const items = await getInvoiceItems(invoices[0].id);
          setRecentItems(
            items.slice(0, 5).map((item: any) => ({
              id: item.id,
              name: item.transaction_name || "Transação",
              amount: Number(item.amount),
              category: item.transaction_category || "Outros",
              installment: item.total_installments > 1
                ? `${item.installment_number}/${item.total_installments}`
                : undefined,
            }))
          );
        } else {
          setRecentItems([]);
        }
      } catch {
        setRecentItems([]);
      } finally {
        setLoadingItems(false);
      }
    })();
  }, [open, card, month, year]);

  if (!open || !card) return null;

  const cardColor = card.color || "hsl(260 60% 55%)";

  const dueDate = new Date(year, month, card.dueDay);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let dueText = "";
  let dueUrgent = false;
  if (isPaid) {
    dueText = "Fatura paga ✅";
  } else if (diffDays < 0) {
    dueText = `Venceu há ${Math.abs(diffDays)} dias`;
    dueUrgent = true;
  } else if (diffDays === 0) {
    dueText = "Vence hoje!";
    dueUrgent = true;
  } else {
    dueText = `Vence em ${diffDays} dias`;
  }

  const handleViewFull = () => {
    onClose();
    navigate(`/fatura/${card.cardId}?month=${month + 1}&year=${year}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md mx-4 mb-20 sm:mb-0 rounded-2xl bg-card border border-border/20 shadow-2xl overflow-hidden"
        >
          {/* Header with card color accent */}
          <div className="relative p-5 pb-4">
            <div
              className="absolute inset-0 opacity-[0.08] pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 30% -20%, ${cardColor} 0%, transparent 60%)`,
              }}
            />
            <div className="relative z-10">
              {/* Close button */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-6 rounded-md shadow-lg" style={{ backgroundColor: cardColor }} />
                    <div className="absolute inset-0 rounded-md bg-gradient-to-br from-white/20 to-transparent" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">{card.cardName}</h2>
                    {card.lastFourDigits && (
                      <span className="text-[10px] text-muted-foreground tracking-wider">•••• {card.lastFourDigits}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Fatura value */}
              <div className="text-center space-y-1 pb-1">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Fatura de {MONTH_NAMES[month]}
                </p>
                <p className="text-2xl font-extrabold text-foreground tracking-tight">
                  {fmt(totalAmount)}
                </p>
                <span className={cn(
                  "text-[10px] font-semibold",
                  dueUrgent ? "text-destructive" : isPaid ? "text-primary" : "text-muted-foreground"
                )}>
                  {dueText}
                </span>
              </div>
            </div>
          </div>

          {/* Dates row */}
          <div className="px-5 pb-4 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/20 px-3 py-2 rounded-lg flex-1 justify-center">
              <CalendarClock className="w-3.5 h-3.5 text-primary/60" />
              <span>Fecha dia <span className="font-semibold text-foreground">{card.closingDay}</span></span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/20 px-3 py-2 rounded-lg flex-1 justify-center">
              <CalendarCheck className="w-3.5 h-3.5 text-primary/60" />
              <span>Vence dia <span className="font-semibold text-foreground">{card.dueDay}</span></span>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="px-5 pb-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Lançamentos recentes
            </p>
            {loadingItems ? (
              <div className="py-4 text-center">
                <span className="text-xs text-muted-foreground animate-pulse">Carregando...</span>
              </div>
            ) : recentItems.length === 0 ? (
              <div className="py-4 text-center">
                <span className="text-xs text-muted-foreground">Nenhum lançamento neste mês</span>
              </div>
            ) : (
              <div className="space-y-1">
                {recentItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2.5 py-2">
                    <div className="w-7 h-7 rounded-full bg-muted/20 flex items-center justify-center">
                      <CreditCard className="w-3.5 h-3.5 text-muted-foreground/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.category}
                        {item.installment && (
                          <span className="ml-1 text-primary font-bold">{item.installment}</span>
                        )}
                      </p>
                    </div>
                    <span className="text-[12px] font-bold text-destructive shrink-0">
                      −{fmt(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="px-5 pb-5 pt-2">
            <Button
              onClick={handleViewFull}
              className="w-full h-11 rounded-xl text-xs font-bold gap-1.5"
            >
              Ver fatura completa
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
