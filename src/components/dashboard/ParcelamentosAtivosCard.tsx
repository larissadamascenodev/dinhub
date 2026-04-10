import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Wallet, ChevronDown, CalendarClock, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getCategoryIcon, getCategoryColor } from "@/lib/categoryUtils";
import type { CustomCategory } from "@/services/categoryService";
import { Progress } from "@/components/ui/progress";

interface Installment {
  id: string;
  name: string;
  category: string;
  amount: number;
  installment_current: number;
  installments: number;
  payment_method: string;
  date: string;
  credit_card_id: string | null;
}

const ParcelamentosAtivosCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Installment[]>([]);
  const [customCats, setCustomCats] = useState<CustomCategory[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      // Get parent installment transactions that still have future installments
      const now = new Date();
      const { data, error } = await supabase
        .from("transactions")
        .select("id, name, category, amount, installment_current, installments, payment_method, date, credit_card_id")
        .eq("user_id", user.id)
        .eq("recurrence_type", "parcelado")
        .is("parent_transaction_id", null)
        .not("installments", "is", null)
        .order("amount", { ascending: false });

      if (!error && data) {
        // Filter: only those with remaining installments
        const active = data.filter((t) => {
          if (!t.installments || !t.installment_current) return false;
          // Check if there are still future installments
          const baseDate = new Date(t.date);
          const lastInstallmentDate = new Date(baseDate);
          lastInstallmentDate.setMonth(lastInstallmentDate.getMonth() + (t.installments - 1));
          return lastInstallmentDate >= new Date(now.getFullYear(), now.getMonth(), 1);
        });
        setItems(active as Installment[]);
      }

      const { data: cats } = await supabase
        .from("custom_categories")
        .select("*")
        .eq("user_id", user.id);
      if (cats) setCustomCats(cats);

      setLoading(false);
    };
    fetch();
  }, [user]);

  const stats = useMemo(() => {
    if (items.length === 0) return null;

    let totalMensal = 0;
    let totalRestante = 0;
    let lastEndDate = new Date();

    items.forEach((item) => {
      const baseDate = new Date(item.date);
      const currentInstallment = item.installment_current || 1;
      const remaining = item.installments - currentInstallment;

      if (remaining >= 0) {
        totalMensal += item.amount;
        totalRestante += item.amount * (remaining + 1);
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
    <div className="glass-card p-4 space-y-3 select-none">
      {/* Header */}
      <button onClick={() => navigate("/parcelamentos")} className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500/15 flex items-center justify-center">
            <CalendarClock className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Parcelamentos Ativos</h3>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
          {items.length} {items.length === 1 ? "item" : "itens"}
        </span>
      </button>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-muted/30 border border-border/30 p-3 space-y-1">
            <p className="text-[10px] text-muted-foreground">Comprometido/mês</p>
            <p className="text-sm font-bold text-orange-400">{formatCurrency(stats.totalMensal)}</p>
          </div>
          <div className="rounded-xl bg-muted/30 border border-border/30 p-3 space-y-1">
            <p className="text-[10px] text-muted-foreground">Total restante</p>
            <p className="text-sm font-bold text-foreground">{formatCurrency(stats.totalRestante)}</p>
          </div>
        </div>
      )}

      {/* Timeline indicator */}
      {stats && stats.monthsUntilFree > 0 && (
        <div className="flex items-center gap-2 px-1">
          <TrendingDown className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <p className="text-[10px] text-muted-foreground">
            Livre em <span className="text-primary font-semibold">{stats.monthsUntilFree} {stats.monthsUntilFree === 1 ? "mês" : "meses"}</span>
            {" "}({formatMonth(stats.lastEndDate)})
          </p>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-1.5">
        <AnimatePresence initial={false}>
          {visibleItems.map((item, idx) => {
            const currentInst = item.installment_current || 1;
            const progress = (currentInst / item.installments) * 100;
            const isCard = item.payment_method === "cartao";
            const IconComp = getCategoryIcon(item.category, customCats);
            const catColor = getCategoryColor(item.category, customCats);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 rounded-xl bg-muted/20 border border-border/20 px-3 py-2.5"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `hsl(${catColor} / 0.15)` }}
                >
                  {IconComp && <IconComp className="w-3.5 h-3.5" style={{ color: `hsl(${catColor})` }} />}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-foreground truncate">{item.name}</span>
                    <span className="text-xs font-bold text-foreground flex-shrink-0">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="h-1 flex-1" />
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isCard ? (
                        <CreditCard className="w-2.5 h-2.5 text-muted-foreground" />
                      ) : (
                        <Wallet className="w-2.5 h-2.5 text-muted-foreground" />
                      )}
                      <span className="text-[9px] text-muted-foreground font-medium">
                        {currentInst}/{item.installments}
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
          className="w-full flex items-center justify-center gap-1 pt-1"
        >
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
};

export default ParcelamentosAtivosCard;
