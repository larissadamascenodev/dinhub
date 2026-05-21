import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Wallet, ChevronDown, CalendarClock, TrendingDown, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getCategoryIcon, getCategoryColor } from "@/lib/categoryUtils";
import { buildActiveInstallmentItems, type ActiveInstallmentItem, type InstallmentInvoiceRow, type InstallmentTransactionRow } from "@/lib/installmentProgress";
import type { CustomCategory } from "@/services/categoryService";
import { Progress } from "@/components/ui/progress";

const ParcelamentosAtivosCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ActiveInstallmentItem[]>([]);
  const [customCats, setCustomCats] = useState<CustomCategory[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    const [transactionsRes, invoiceItemsRes, categoriesRes, creditCardsRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("id, name, category, amount, installment_current, installments, payment_method, date, credit_card_id, parent_transaction_id, status, type")
        .eq("user_id", user.id)
        .eq("recurrence_type", "parcelado")
        .eq("type", "despesa")
        .not("installments", "is", null),
      supabase
        .from("invoice_items")
        .select("transaction_id, amount, installment_number, total_installments, invoices!inner(is_paid, user_id, month, year), transactions!inner(id, name, category, payment_method, credit_card_id, parent_transaction_id, date, type)")
        .eq("invoices.user_id", user.id),
      supabase
        .from("custom_categories")
        .select("*")
        .eq("user_id", user.id),
      supabase
        .from("credit_cards")
        .select("id, due_day")
        .eq("user_id", user.id),
    ]);

    if (!transactionsRes.error && !invoiceItemsRes.error) {
      const creditCardDueDays = Object.fromEntries((creditCardsRes.data ?? []).map((card) => [card.id, card.due_day]));
      setItems(
        buildActiveInstallmentItems({
          transactions: (transactionsRes.data ?? []) as InstallmentTransactionRow[],
          invoiceItems: (invoiceItemsRes.data ?? []) as InstallmentInvoiceRow[],
          creditCardDueDays,
        })
      );
    }

    if (categoriesRes.data) {
      setCustomCats(categoriesRes.data);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    fetchData();
    const handleFinanceChange = () => {
      void fetchData();
    };

    window.addEventListener("finance-data-changed", handleFinanceChange);
    return () => window.removeEventListener("finance-data-changed", handleFinanceChange);
  }, [user, fetchData]);

  const stats = useMemo(() => {
    if (items.length === 0) return null;

    let totalMensal = 0;
    let totalRestante = 0;
    let lastEndDate = new Date();

    items.forEach((item) => {
      const baseDate = new Date(item.date);
      const currentInstallment = item.installment_current;
      const unpaidInstallments = item.installments - currentInstallment + 1;

      if (unpaidInstallments > 0) {
        totalMensal += item.amount;
        totalRestante += item.amount * unpaidInstallments;
      }

      const endDate = new Date(baseDate);
      endDate.setMonth(endDate.getMonth() + (item.installments - currentInstallment));
      if (endDate > lastEndDate) lastEndDate = endDate;
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthsUntilFree = (lastEndDate.getFullYear() - currentYear) * 12 + (lastEndDate.getMonth() - currentMonth);

    return { totalMensal, totalRestante, monthsUntilFree: Math.max(monthsUntilFree, 0), lastEndDate };
  }, [items]);

  if (loading || items.length === 0) return null;

  const visibleItems = expanded ? items : items.slice(0, 3);

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatMonth = (d: Date) =>
    d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });

  return (
    <div className="glass-card bg-white/[0.03] backdrop-blur-xl border-white/[0.08] p-4 space-y-4 select-none shadow-2xl overflow-hidden relative group">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-primary/5 opacity-50 pointer-events-none" />

      {/* Header */}
      <button onClick={() => navigate("/parcelamentos")} className="flex items-center justify-between w-full relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-inner">
            <CalendarClock className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-foreground/90 tracking-tight">Parcelamentos Ativos</h3>
            <p className="text-[10px] text-muted-foreground font-medium">Controle de fluxo futuro</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-orange-400/90 bg-orange-400/10 border border-orange-400/20 px-2.5 py-1 rounded-lg">
            {items.length} {items.length === 1 ? "ITEM" : "ITENS"}
          </span>
        </div>
      </button>

      {/* Summary Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 relative z-10">
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3.5 space-y-1.5 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.1]">
            <div className="flex items-center gap-1.5 opacity-60">
              <div className="w-1 h-1 rounded-full bg-orange-400" />
              <p className="text-[10px] font-bold text-muted-foreground tracking-wider">MENSAL</p>
            </div>
            <p className="text-sm font-black text-orange-400 leading-none">{formatCurrency(stats.totalMensal)}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3.5 space-y-1.5 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.1]">
            <div className="flex items-center gap-1.5 opacity-60">
              <div className="w-1 h-1 rounded-full bg-primary" />
              <p className="text-[10px] font-bold text-muted-foreground tracking-wider">RESTANTE</p>
            </div>
            <p className="text-sm font-black text-foreground/90 leading-none">{formatCurrency(stats.totalRestante)}</p>
          </div>
        </div>
      )}

      {/* Timeline info */}
      {stats && stats.monthsUntilFree > 0 && (
        <div className="flex items-center justify-between px-1 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingDown className="w-3 h-3 text-primary" />
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">
              Livre em <span className="text-primary font-bold">{stats.monthsUntilFree} {stats.monthsUntilFree === 1 ? "mês" : "meses"}</span>
            </p>
          </div>
          <span className="text-[9px] font-black text-muted-foreground/40 bg-white/[0.02] px-2 py-0.5 rounded-md uppercase tracking-tighter">
            {formatMonth(stats.lastEndDate)}
          </span>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2 relative z-10">
        <AnimatePresence initial={false}>
          {visibleItems.map((item, idx) => {
            const currentInst = item.installment_current;
            const paidCount = currentInst - 1;
            const progress = (paidCount / item.installments) * 100;
            const isCard = item.payment_method === "cartao";
            const IconComp = getCategoryIcon(item.category, customCats);
            const catColor = getCategoryColor(item.category, customCats);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group/item flex items-center gap-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] px-4 py-3.5 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.1] hover:translate-x-1"
                style={item.isOverdue ? { borderColor: "hsl(0 70% 50% / 0.3)", background: "hsl(0 70% 50% / 0.08)" } : undefined}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg transition-transform duration-300 group-hover/item:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, hsl(${catColor} / 0.2), hsl(${catColor} / 0.05))`,
                    border: `1px solid hsl(${catColor} / 0.2)`
                  }}
                >
                  {IconComp && <IconComp className="w-4 h-4" style={{ color: `hsl(${catColor})` }} />}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground/80 truncate uppercase tracking-tight">{item.name}</span>
                    <span className="text-xs font-black text-foreground shadow-sm">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden border border-white/[0.03]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full shadow-[0_0_8px_rgba(0,230,118,0.3)]"
                        style={{ background: `linear-gradient(90deg, hsl(${catColor}), hsl(${catColor} / 0.6))` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 opacity-60">
                        {item.isOverdue ? (
                          <AlertTriangle className="w-3 h-3 text-destructive" />
                        ) : isCard ? (
                          <CreditCard className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <Wallet className="w-3 h-3 text-muted-foreground" />
                        )}
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                          {isCard ? "Crédito" : "Conta"}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black ${item.isOverdue ? "text-destructive shadow-[0_0_10px_rgba(239,68,68,0.3)]" : "text-muted-foreground/80"}`}>
                        {currentInst} <span className="opacity-40 font-medium">DE</span> {item.installments}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Expand toggle */}
      {items.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 py-1 transition-all duration-300 hover:bg-white/[0.05] rounded-xl group/btn relative z-10"
        >
          <span className="text-[9px] font-black text-muted-foreground/60 tracking-widest uppercase group-hover/btn:text-primary transition-colors">
            {expanded ? "Recolher" : `Ver mais ${items.length - 3}`}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-muted-foreground/60 transition-all duration-300 group-hover/btn:text-primary ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
};

export default ParcelamentosAtivosCard;
