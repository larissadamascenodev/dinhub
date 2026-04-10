import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, CalendarClock, CreditCard, Wallet, TrendingDown, AlertTriangle,
  BarChart3, PieChart as PieChartIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getCategoryIcon, getCategoryColor } from "@/lib/categoryUtils";
import { buildActiveInstallmentItems, type ActiveInstallmentItem, type InstallmentInvoiceRow, type InstallmentTransactionRow } from "@/lib/installmentProgress";
import type { CustomCategory } from "@/services/categoryService";
import { Progress } from "@/components/ui/progress";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from "recharts";

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatShortCurrency = (v: number) => {
  if (v >= 1000) return `R$${(v / 1000).toFixed(1)}k`;
  return `R$${v.toFixed(0)}`;
};

const ParcelamentosDetalhe = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  useSwipeBack(true);
  const [items, setItems] = useState<ActiveInstallmentItem[]>([]);
  const [customCats, setCustomCats] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [transactionsRes, invoiceItemsRes, categoriesRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("id, name, category, amount, installment_current, installments, payment_method, date, credit_card_id, parent_transaction_id, status, type")
        .eq("user_id", user.id)
        .eq("recurrence_type", "parcelado")
        .eq("type", "despesa")
        .not("installments", "is", null),
      supabase
        .from("invoice_items")
        .select("transaction_id, amount, installment_number, total_installments, invoices!inner(is_paid, user_id), transactions!inner(id, name, category, payment_method, credit_card_id, parent_transaction_id, date, type)")
        .eq("invoices.user_id", user.id),
      supabase
        .from("custom_categories")
        .select("*")
        .eq("user_id", user.id),
    ]);

    if (!transactionsRes.error && !invoiceItemsRes.error) {
      setItems(
        buildActiveInstallmentItems({
          transactions: (transactionsRes.data ?? []) as InstallmentTransactionRow[],
          invoiceItems: (invoiceItemsRes.data ?? []) as InstallmentInvoiceRow[],
        })
      );
    }
    if (categoriesRes.data) setCustomCats(categoriesRes.data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchData();
    const handler = () => { void fetchData(); };
    window.addEventListener("finance-data-changed", handler);
    return () => window.removeEventListener("finance-data-changed", handler);
  }, [user, fetchData]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // ── Computed stats ──
  const stats = useMemo(() => {
    if (items.length === 0) return null;

    let totalMensal = 0;
    let totalRestante = 0;
    let totalJaPago = 0;
    let totalGeral = 0;
    let lastEndDate = new Date();
    let cardCount = 0;
    let accountCount = 0;

    items.forEach((item) => {
      const paidCount = item.installment_current - 1;
      const unpaidCount = item.installments - paidCount;

      totalGeral += item.amount * item.installments;
      totalJaPago += item.amount * paidCount;

      if (unpaidCount > 0) {
        totalMensal += item.amount;
        totalRestante += item.amount * unpaidCount;
      }

      const baseDate = new Date(item.date);
      const endDate = new Date(baseDate);
      endDate.setMonth(baseDate.getMonth() + (item.installments - 1));
      endDate.setFullYear(baseDate.getFullYear());
      if (endDate > lastEndDate) lastEndDate = endDate;

      if (item.payment_method === "cartao") cardCount++;
      else accountCount++;
    });

    const monthsUntilFree = (lastEndDate.getFullYear() - currentYear) * 12 + (lastEndDate.getMonth() - currentMonth);

    return {
      totalMensal, totalRestante, totalJaPago, totalGeral,
      monthsUntilFree: Math.max(monthsUntilFree, 0),
      lastEndDate, cardCount, accountCount,
    };
  }, [items, currentMonth, currentYear]);

  // ── Monthly projection chart data ──
  const projectionData = useMemo(() => {
    if (items.length === 0) return [];

    const months: { month: string; value: number }[] = [];

    for (let offset = 0; offset <= (stats?.monthsUntilFree ?? 12); offset++) {
      let m = currentMonth + offset;
      let y = currentYear;
      while (m > 11) { m -= 12; y++; }

      let monthTotal = 0;
      items.forEach((item) => {
        const baseDate = new Date(item.date);
        const paidCount = item.installment_current - 1;
        const firstUnpaidOffset = paidCount;
        const itemStartMonth = baseDate.getMonth() + firstUnpaidOffset;
        const itemStartYear = baseDate.getFullYear() + Math.floor(itemStartMonth / 12);
        const normalizedStartMonth = itemStartMonth % 12;
        const monthsDiff = (y - itemStartYear) * 12 + (m - normalizedStartMonth);
        const remainingInstallments = item.installments - paidCount;
        if (monthsDiff >= 0 && monthsDiff < remainingInstallments) {
          monthTotal += item.amount;
        }
      });

      const label = new Date(y, m).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
      months.push({ month: label, value: monthTotal });
    }

    return months;
  }, [items, stats, currentMonth, currentYear]);

  // ── Category breakdown ──
  const categoryData = useMemo(() => {
    if (items.length === 0) return [];

    const catMap = new Map<string, number>();
    items.forEach((item) => {
      catMap.set(item.category, (catMap.get(item.category) ?? 0) + item.amount);
    });

    return Array.from(catMap.entries())
      .map(([cat, amount]) => ({ category: cat, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [items]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-primary text-lg">Carregando...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4" >
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-bold">Parcelamentos</h1>
        <div className="glass-card p-8 text-center">
          <CalendarClock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum parcelamento ativo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none" >
      {/* Header */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-xl font-bold">Parcelamentos</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {items.length} {items.length === 1 ? "parcelamento ativo" : "parcelamentos ativos"}
        </p>
      </motion.div>

      {/* Summary Card */}
      {stats && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-4 space-y-4">
          {/* Main value */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Comprometido/mês</p>
              <p className="text-xl font-bold mt-0.5" style={{ color: "hsl(25 85% 55%)" }}>{formatCurrency(stats.totalMensal)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Livre em</p>
              <p className="text-lg font-bold text-foreground mt-0.5">
                {stats.monthsUntilFree} {stats.monthsUntilFree === 1 ? "mês" : "meses"}
              </p>
              <p className="text-[9px] text-muted-foreground">
                {stats.lastEndDate.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Progresso geral</span>
              <span className="text-[10px] font-bold text-foreground">
                {Math.round((stats.totalJaPago / stats.totalGeral) * 100)}%
              </span>
            </div>
            <Progress value={(stats.totalJaPago / stats.totalGeral) * 100} className="h-1.5" />
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between pt-1 border-t border-border/10">
            <div className="space-y-0.5">
              <p className="text-[9px] text-muted-foreground">Já pago</p>
              <p className="text-xs font-bold text-primary">{formatCurrency(stats.totalJaPago)}</p>
            </div>
            <div className="w-px h-6 bg-border/20" />
            <div className="space-y-0.5 text-right">
              <p className="text-[9px] text-muted-foreground">Restante</p>
              <p className="text-xs font-bold text-foreground">{formatCurrency(stats.totalRestante)}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Payment method split */}
      {stats && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="glass-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Meio de pagamento</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 rounded-xl bg-muted/20 border border-border/20 p-3">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-bold text-foreground">{stats.cardCount}</p>
                <p className="text-[9px] text-muted-foreground">Cartão</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-muted/20 border border-border/20 p-3">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-bold text-foreground">{stats.accountCount}</p>
                <p className="text-[9px] text-muted-foreground">Conta</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Projection Chart */}
      {projectionData.length > 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Compromisso mensal</h3>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="compromissoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(25 85% 55%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(25 85% 55%)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: "hsl(220 15% 55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(220 15% 55%)" }} axisLine={false} tickLine={false} tickFormatter={formatShortCurrency} />
                <Tooltip
                  contentStyle={{ background: "hsl(220 18% 12%)", border: "1px solid hsl(220 10% 20%)", borderRadius: 12, fontSize: 11 }}
                  labelStyle={{ color: "hsl(220 15% 75%)" }}
                  formatter={(value: number) => [formatCurrency(value), "Compromisso"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(25 85% 55%)"
                  strokeWidth={2}
                  fill="url(#compromissoGrad)"
                  dot={{ r: 3, fill: "hsl(25 85% 55%)", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "hsl(25 85% 55%)", stroke: "hsl(220 18% 12%)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-2 px-1">
            <TrendingDown className="w-3 h-3 text-primary flex-shrink-0" />
            <p className="text-[10px] text-muted-foreground">
              O compromisso diminui conforme os parcelamentos são concluídos
            </p>
          </div>
        </motion.div>
      )}

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Por categoria</h3>
          </div>
          <div className="space-y-2">
            {categoryData.map((cat) => {
              const IconComp = getCategoryIcon(cat.category, customCats);
              const catColor = getCategoryColor(cat.category, customCats);
              const totalMensal = stats?.totalMensal ?? 1;
              const pct = Math.round((cat.amount / totalMensal) * 100);

              return (
                <div key={cat.category} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `hsl(${catColor} / 0.15)` }}
                  >
                    {IconComp && <IconComp className="w-3.5 h-3.5" style={{ color: `hsl(${catColor})` }} />}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground truncate">{cat.category}</span>
                      <span className="text-xs font-bold text-foreground">{formatCurrency(cat.amount)}/mês</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-muted/40 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `hsl(${catColor})` }} />
                      </div>
                      <span className="text-[9px] text-muted-foreground font-medium">{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* All Installments List */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Todos os parcelamentos</h3>
        <div className="space-y-2">
          {items.map((item) => {
            const paidCount = item.installment_current - 1;
            const remaining = item.installments - item.installment_current + 1;
            const progress = (paidCount / item.installments) * 100;
            const isCard = item.payment_method === "cartao";
            const IconComp = getCategoryIcon(item.category, customCats);
            const catColor = getCategoryColor(item.category, customCats);

            const baseDate = new Date(item.date);
            const endDate = new Date(baseDate);
            endDate.setMonth(endDate.getMonth() + (item.installments - 1));

            return (
              <div
                key={item.id}
                className="rounded-xl p-3 space-y-2"
                style={item.isOverdue
                  ? { background: "hsl(0 70% 50% / 0.05)", border: "1px solid hsl(0 70% 50% / 0.25)" }
                  : { background: "hsl(var(--muted) / 0.2)", border: "1px solid hsl(var(--border) / 0.2)" }
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `hsl(${catColor} / 0.15)` }}
                  >
                    {IconComp && <IconComp className="w-4 h-4" style={{ color: `hsl(${catColor})` }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground truncate">{item.name}</span>
                      <span className="text-xs font-bold text-foreground flex-shrink-0">
                        {formatCurrency(item.amount)}/mês
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.isOverdue ? (
                        <AlertTriangle className="w-2.5 h-2.5 text-destructive" />
                      ) : isCard ? (
                        <CreditCard className="w-2.5 h-2.5 text-muted-foreground" />
                      ) : (
                        <Wallet className="w-2.5 h-2.5 text-muted-foreground" />
                      )}
                      <span className={`text-[9px] ${item.isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                        {item.isOverdue ? "Em atraso · " : ""}{item.category} · Termina em {endDate.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="h-1.5 flex-1" />
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {item.installment_current}/{item.installments}
                  </span>
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>Pago: {formatCurrency(item.amount * paidCount)}</span>
                  <span>Restante: {formatCurrency(item.amount * remaining)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default ParcelamentosDetalhe;
