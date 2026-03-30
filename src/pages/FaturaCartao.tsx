import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Plus, MoreVertical,
  CalendarClock, CalendarCheck, Wallet, Shield, TrendingDown,
} from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getInvoices, getInvoiceItems, payInvoice, type Invoice } from "@/services/invoiceService";
import { getAccounts, getCreditCards } from "@/services/transactionService";
import { cn } from "@/lib/utils";
import InvoiceTimeline from "@/components/fatura/InvoiceTimeline";
import InvoiceSummaryCard from "@/components/fatura/InvoiceSummaryCard";
import InvoiceCategoryBreakdown from "@/components/fatura/InvoiceCategoryBreakdown";
import InvoiceTransactionList from "@/components/fatura/InvoiceTransactionList";
import InvoicePayModal from "@/components/fatura/InvoicePayModal";
import InvoiceHistoryChart from "@/components/fatura/InvoiceHistoryChart";

export interface EnrichedItem {
  id: string;
  invoice_id: string;
  transaction_id: string;
  amount: number;
  installment_number: number;
  total_installments: number;
  transaction_name: string;
  transaction_category: string;
}

export interface CreditCardInfo {
  id: string;
  name: string;
  limit: number;
  used_limit: number;
  closing_day: number;
  due_day: number;
  color: string | null;
  last_four_digits: string | null;
}

export interface AccountInfo {
  id: string;
  name: string;
  is_default: boolean;
  current_balance: number;
}

export const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const MONTH_SHORT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const FaturaCartao = () => {
  const navigate = useNavigate();
  const { cardId } = useParams<{ cardId: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    parseInt(searchParams.get("month") ?? String(now.getMonth() + 1))
  );
  const [selectedYear, setSelectedYear] = useState(
    parseInt(searchParams.get("year") ?? String(now.getFullYear()))
  );

  const [card, setCard] = useState<CreditCardInfo | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAccountId, setPayAccountId] = useState("");

  const currentInvoice = useMemo(
    () => invoices.find((i) => i.month === selectedMonth && i.year === selectedYear),
    [invoices, selectedMonth, selectedYear]
  );

  useEffect(() => {
    if (!user || !cardId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [cards, accs, allInvoices] = await Promise.all([
          getCreditCards(),
          getAccounts(),
          getInvoices(cardId),
        ]);
        const typedCards = cards as unknown as CreditCardInfo[];
        const foundCard = typedCards.find((c) => c.id === cardId);
        setCard(foundCard ?? null);
        setAccounts(accs as unknown as AccountInfo[]);
        setInvoices(allInvoices);
        const defaultAcc = (accs as unknown as AccountInfo[]).find((a) => a.is_default);
        if (defaultAcc) setPayAccountId(defaultAcc.id);
      } catch {
        toast.error("Erro ao carregar fatura");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, cardId]);

  useEffect(() => {
    if (!currentInvoice) { setItems([]); return; }
    getInvoiceItems(currentInvoice.id).then((data) => setItems(data as EnrichedItem[]));
  }, [currentInvoice]);

  const handlePay = async () => {
    if (!currentInvoice || !payAccountId) return;
    setPaying(true);
    try {
      await payInvoice(currentInvoice.id, payAccountId);
      toast.success("Fatura paga! ✅");
      setShowPayModal(false);
      const updated = await getInvoices(cardId!);
      setInvoices(updated);
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao pagar fatura");
    } finally {
      setPaying(false);
    }
  };

  const handleMonthNav = (dir: number) => {
    let m = selectedMonth + dir;
    let y = selectedYear;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setSelectedMonth(m);
    setSelectedYear(y);
  };

  const total = currentInvoice ? Number(currentInvoice.total_amount) : 0;
  const limitTotal = card ? Number(card.limit) : 0;
  const usedLimit = card ? Number(card.used_limit) : 0;
  const availableLimit = limitTotal - usedLimit;
  const usedPct = limitTotal > 0 ? Math.min((usedLimit / limitTotal) * 100, 100) : 0;

  const dueInfo = useMemo(() => {
    if (!card) return null;
    const dueDate = new Date(selectedYear, selectedMonth - 1, card.due_day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: `Venceu há ${Math.abs(diffDays)} dias`, overdue: true };
    if (diffDays === 0) return { text: "Vence hoje", overdue: true };
    return { text: `Vence em ${diffDays} dias`, overdue: false };
  }, [card, selectedMonth, selectedYear]);

  const invoiceStatus = useMemo(() => {
    if (!currentInvoice) return null;
    if (currentInvoice.is_paid) return "paid";
    if (card) {
      const closingDate = new Date(selectedYear, selectedMonth - 1, card.closing_day);
      const today = new Date();
      if (today > closingDate) return "closed";
    }
    return "open";
  }, [currentInvoice, card, selectedMonth, selectedYear]);

  const categoryBreakdown = useMemo(() => {
    if (items.length === 0) return [];
    const map = new Map<string, { total: number; count: number }>();
    items.forEach((item) => {
      const cat = item.transaction_category || "Outros";
      const existing = map.get(cat) || { total: 0, count: 0 };
      existing.total += Number(item.amount);
      existing.count += 1;
      map.set(cat, existing);
    });
    return Array.from(map.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: total > 0 ? (data.total / total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [items, total]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-primary text-sm">Carregando fatura...</div>
      </div>
    );
  }

  const cardColor = card?.color || "hsl(150 100% 45%)";

  return (
    <div className="pt-2 pb-24 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-semibold gap-1.5"
            onClick={() => navigate(`/transacoes`)}
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar lançamento
          </Button>
          <button className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ===== CARD HERO — Full width ===== */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-lg overflow-hidden relative"
      >
        {/* Glow accent from card color */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 20% 0%, ${cardColor} 0%, transparent 55%)`,
          }}
        />

        <div className="relative z-10">
          {/* Card identity row */}
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3.5">
                {/* Card chip visual */}
                <div className="relative">
                  <div
                    className="w-12 h-8 rounded-lg shadow-lg"
                    style={{ backgroundColor: cardColor }}
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-foreground">{card?.name}</h1>
                  {card?.last_four_digits && (
                    <span className="text-[11px] text-muted-foreground tracking-wider">•••• {card.last_four_digits}</span>
                  )}
                </div>
              </div>
              {invoiceStatus === "paid" ? (
                <div className="flex items-center gap-1.5 border border-primary/30 bg-primary/10 px-3 py-1.5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-bold text-primary">Paga</span>
                </div>
              ) : invoiceStatus === "closed" ? (
                <div className="flex items-center gap-1.5 border border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/10 px-3 py-1.5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--warning))]" />
                  <span className="text-xs font-bold text-[hsl(var(--warning))]">Fechada</span>
                </div>
              ) : invoiceStatus === "open" ? (
                <div className="flex items-center gap-1.5 border border-primary/20 bg-primary/5 px-3 py-1.5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                  <span className="text-xs font-bold text-primary/80">Aberta</span>
                </div>
              ) : null}
            </div>

            {/* Info chips */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-lg">
                <CalendarClock className="w-3.5 h-3.5 text-primary/60" />
                <span>Fecha dia <span className="font-semibold text-foreground">{card?.closing_day}</span></span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-lg">
                <CalendarCheck className="w-3.5 h-3.5 text-primary/60" />
                <span>Vence dia <span className="font-semibold text-foreground">{card?.due_day}</span></span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="px-5 pb-3">
            <InvoiceTimeline
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              invoices={invoices}
              onSelect={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
            />
          </div>

          {/* Invoice value */}
          <div className="px-5 pb-5">
            <InvoiceSummaryCard
              total={total}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              invoiceStatus={invoiceStatus}
              dueInfo={dueInfo}
              onPrev={() => handleMonthNav(-1)}
              onNext={() => handleMonthNav(1)}
            />
          </div>
        </div>
      </motion.div>

      {/* ===== 2-COLUMN DESKTOP / STACKED MOBILE ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* LEFT COLUMN — Main content */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">

          {/* Limit card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-5 space-y-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-primary/70" />
              <h2 className="text-sm font-bold text-foreground">Limite do Cartão</h2>
            </div>

            {/* Limit stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/20 rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">Usado</p>
                <p className="text-sm font-bold text-foreground">{formatCurrency(usedLimit)}</p>
              </div>
              <div className="bg-muted/20 rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">Disponível</p>
                <p className="text-sm font-bold text-primary">{formatCurrency(availableLimit)}</p>
              </div>
              <div className="bg-muted/20 rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-0.5">Total</p>
                <p className="text-sm font-bold text-foreground">{formatCurrency(limitTotal)}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full bg-muted/40 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${usedPct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full transition-colors",
                    usedPct > 80 ? "bg-destructive" : usedPct > 50 ? "bg-[hsl(var(--warning))]" : "bg-primary"
                  )}
                />
              </div>
              <p className="text-[11px] text-muted-foreground text-right">
                <span className={cn(
                  "font-bold",
                  usedPct > 80 ? "text-destructive" : usedPct > 50 ? "text-[hsl(var(--warning))]" : "text-primary"
                )}>
                  {usedPct.toFixed(0)}%
                </span>
                {" "}do limite utilizado
              </p>
            </div>
          </motion.div>

          {/* Invoice History Chart */}
          <InvoiceHistoryChart
            invoices={invoices}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onSelect={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
          />

          {/* Transactions — below chart on mobile, main column on desktop */}
          <InvoiceTransactionList items={items} />
        </div>

        {/* RIGHT COLUMN — Sidebar content */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">

          {/* Category Breakdown */}
          {categoryBreakdown.length > 0 && (
            <InvoiceCategoryBreakdown categories={categoryBreakdown} total={total} />
          )}

          {/* Quick stats cards */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-5 space-y-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-primary/70" />
              <h2 className="text-sm font-bold text-foreground">Resumo da Fatura</h2>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between py-2 border-b border-border/20">
                <span className="text-xs text-muted-foreground">Total de lançamentos</span>
                <span className="text-xs font-bold text-foreground">{items.length}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/20">
                <span className="text-xs text-muted-foreground">Categorias</span>
                <span className="text-xs font-bold text-foreground">{categoryBreakdown.length}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/20">
                <span className="text-xs text-muted-foreground">Parcelamentos ativos</span>
                <span className="text-xs font-bold text-foreground">
                  {items.filter((i) => i.total_installments > 1).length}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-muted-foreground">Valor médio por lançamento</span>
                <span className="text-xs font-bold text-primary">
                  {items.length > 0 ? formatCurrency(total / items.length) : "—"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Pay button on sidebar for desktop */}
          {currentInvoice && !currentInvoice.is_paid && total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block"
            >
              <Button
                onClick={() => setShowPayModal(true)}
                className="w-full h-12 rounded-2xl text-sm font-bold bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 backdrop-blur-md"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Pagar Fatura · {formatCurrency(total)}
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile fixed pay button */}
      {currentInvoice && !currentInvoice.is_paid && total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="fixed bottom-20 left-4 right-4 z-40 max-w-lg mx-auto lg:hidden"
        >
          <Button
            onClick={() => setShowPayModal(true)}
            className="w-full h-12 rounded-2xl text-sm font-bold bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 backdrop-blur-md shadow-lg"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Pagar Fatura · {formatCurrency(total)}
          </Button>
        </motion.div>
      )}

      {/* Pay Modal */}
      <InvoicePayModal
        open={showPayModal}
        onClose={() => setShowPayModal(false)}
        total={total}
        accounts={accounts}
        payAccountId={payAccountId}
        setPayAccountId={setPayAccountId}
        onConfirm={handlePay}
        paying={paying}
      />
    </div>
  );
};

export default FaturaCartao;
