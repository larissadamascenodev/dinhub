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
    <div className="glass-card bg-black/40 backdrop-blur-2xl border-white/[0.08] p-5 space-y-5 select-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative group">
      {/* Premium glow effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <button onClick={() => navigate("/parcelamentos")} className="flex items-center justify-between w-full relative z-10 group/header">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/5 border border-white/10 flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover/header:scale-110">
            <CalendarClock className="w-5 h-5 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-black text-white/90 tracking-tight leading-none mb-1">Parcelamentos Ativos</h3>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase opacity-70">Monitoramento Real-time</p>
            </div>
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-xl backdrop-blur-md">
          <span className="text-[10px] font-black text-primary tracking-tighter">
            {items.length} {items.length === 1 ? "ATIVO" : "ATIVOS"}
          </span>
        </div>
      </button>

      {/* Hero Stats Section */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="relative group/stat overflow-hidden rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.08] p-4 transition-all duration-500 hover:border-orange-500/30">
            <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
            <p className="text-[9px] font-black text-muted-foreground tracking-[0.2em] uppercase mb-1.5 opacity-60">Mensal</p>
            <p className="text-lg font-black text-orange-400 leading-none tracking-tighter drop-shadow-[0_2px_10px_rgba(251,146,60,0.2)]">
              {formatCurrency(stats.totalMensal)}
            </p>
          </div>
          <div className="relative group/stat overflow-hidden rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.08] p-4 transition-all duration-500 hover:border-primary/30">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
            <p className="text-[9px] font-black text-muted-foreground tracking-[0.2em] uppercase mb-1.5 opacity-60">Restante</p>
            <p className="text-lg font-black text-white/90 leading-none tracking-tighter">
              {formatCurrency(stats.totalRestante)}
            </p>
          </div>
        </div>
      )}

      {/* Progress Timeline */}
      {stats && stats.monthsUntilFree > 0 && (
        <div className="flex items-center justify-between px-2 py-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl relative z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,230,118,0.2)]">
              <TrendingDown className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-[11px] text-white/70 font-bold tracking-tight">
              Quitação em <span className="text-primary font-black underline decoration-primary/30 underline-offset-4">{stats.monthsUntilFree} {stats.monthsUntilFree === 1 ? "mês" : "meses"}</span>
            </p>
          </div>
          <div className="text-[10px] font-black text-muted-foreground/50 bg-black/20 px-2.5 py-1 rounded-lg border border-white/5 uppercase tracking-widest relative z-10">
            {formatMonth(stats.lastEndDate)}
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-3 relative z-10">
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.1, ease: [0.23, 1, 0.32, 1] }}
                className="group/item relative overflow-hidden flex items-center gap-4 rounded-[2rem] bg-white/[0.03] border border-white/[0.06] px-5 py-4 transition-all duration-500 hover:bg-white/[0.08] hover:border-white/10 hover:-translate-y-1 shadow-lg hover:shadow-primary/5"
                style={item.isOverdue ? { borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" } : undefined}
              >
                {/* Item Icon */}
                <div
                  className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 shadow-2xl transition-all duration-500 group-hover/item:rotate-[10deg] group-hover/item:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, hsl(${catColor} / 0.25), hsl(${catColor} / 0.05))`,
                    border: `1px solid hsl(${catColor} / 0.15)`,
                    boxShadow: `0 10px 20px -5px hsl(${catColor} / 0.2)`
                  }}
                >
                  {IconComp && <IconComp className="w-5 h-5" style={{ color: `hsl(${catColor})` }} />}
                </div>

                <div className="flex-1 min-w-0 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-white/90 truncate uppercase tracking-tighter group-hover/item:text-primary transition-colors">{item.name}</span>
                    <span className="text-sm font-black text-white tracking-tighter">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="h-full rounded-full relative shadow-[0_0_15px_rgba(0,230,118,0.4)]"
                        style={{ background: `linear-gradient(90deg, hsl(${catColor}), hsl(${catColor} / 0.5))` }}
                      >
                        <div className="absolute inset-0 bg-white/20 blur-[2px] opacity-30" />
                      </motion.div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-white/[0.04] px-2 py-0.5 rounded-lg border border-white/[0.05]">
                        {item.isOverdue ? (
                          <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />
                        ) : isCard ? (
                          <CreditCard className="w-3 h-3 text-primary/70" />
                        ) : (
                          <Wallet className="w-3 h-3 text-primary/70" />
                        )}
                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/80">
                          {isCard ? "Crédito" : "Débito"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-black ${item.isOverdue ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "text-white/80"}`}>
                          {currentInst}
                        </span>
                        <span className="text-[9px] font-black text-muted-foreground/30">/</span>
                        <span className="text-[10px] font-bold text-muted-foreground/60">
                          {item.installments}
                        </span>
                      </div>
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
          className="w-full flex items-center justify-center gap-3 py-3 mt-2 transition-all duration-500 hover:bg-white/[0.05] rounded-2xl group/btn relative z-10 border border-transparent hover:border-white/5"
        >
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <span className="text-[10px] font-black text-muted-foreground/40 tracking-[0.3em] uppercase group-hover/btn:text-primary group-hover/btn:tracking-[0.4em] transition-all duration-500">
            {expanded ? "Recolher" : `Ver +${items.length - 3}`}
          </span>
          <div className="relative">
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground/40 transition-all duration-500 group-hover/btn:text-primary ${expanded ? "rotate-180" : ""}`}
            />
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </button>
      )}
    </div>
  );
};

export default ParcelamentosAtivosCard;
