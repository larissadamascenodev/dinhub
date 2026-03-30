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
      {/* Header — Back + 3-dot menu */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <button className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Month selector + Add button row */}
      <div className="flex items-center justify-between">
        <InvoiceTimeline
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          invoices={invoices}
          onSelect={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
        />
        <Button
          variant="outline"
          size="sm"
          className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-semibold gap-1.5 shrink-0 ml-3"
          onClick={() => navigate(`/transacoes`)}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Adicionar lançamento</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      {/* ===== SPLIT CARD: Fatura Info + Limite ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT: Fatura info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card overflow-hidden relative"
        >
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 20% 0%, ${cardColor} 0%, transparent 55%)`,
            }}
          />
          <div className="relative z-10 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-primary/70" />
              <h2 className="text-sm font-bold text-foreground">Fatura de {MONTH_NAMES[selectedMonth - 1]}</h2>
            </div>

            {/* Invoice value */}
            <div className="text-center py-2">
              <p className="text-3xl font-extrabold text-foreground tracking-tight">
                {formatCurrency(total)}
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
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
                  <span className={cn(
                    "text-[10px] font-semibold",
                    dueInfo.overdue ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {dueInfo.text}
                  </span>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-lg flex-1 justify-center">
                <CalendarClock className="w-3.5 h-3.5 text-primary/60" />
                <span>Fecha dia <span className="font-semibold text-foreground">{card?.closing_day}</span></span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-lg flex-1 justify-center">
                <CalendarCheck className="w-3.5 h-3.5 text-primary/60" />
                <span>Vence dia <span className="font-semibold text-foreground">{card?.due_day}</span></span>
              </div>
            </div>

            {/* Pay button inside card */}
            {currentInvoice && !currentInvoice.is_paid && total > 0 && (
              <Button
                onClick={() => setShowPayModal(true)}
                className="w-full h-10 rounded-xl text-xs font-bold bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 backdrop-blur-md"
              >
                <Wallet className="w-3.5 h-3.5 mr-1.5" />
                Pagar Fatura
              </Button>
            )}
          </div>
        </motion.div>

        {/* RIGHT: Limite do cartão */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 space-y-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-primary/70" />
            <h2 className="text-sm font-bold text-foreground">Limite do Cartão</h2>
          </div>

          {/* Limit stats */}
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
      </div>

      {/* ===== HISTORY / PROJECTION CHART ===== */}
      <InvoiceHistoryChart
        invoices={invoices}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onSelect={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
      />

      {/* ===== SUMMARY STATS ===== */}
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
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/20 rounded-xl p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">Total de lançamentos</p>
            <p className="text-sm font-bold text-foreground">{items.length}</p>
          </div>
          <div className="bg-muted/20 rounded-xl p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">Parcelamentos ativos</p>
            <p className="text-sm font-bold text-foreground">
              {items.filter((i) => i.total_installments > 1).length}
            </p>
          </div>
          <div className="bg-muted/20 rounded-xl p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-0.5">Valor médio</p>
            <p className="text-sm font-bold text-primary">
              {items.length > 0 ? formatCurrency(total / items.length) : "—"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ===== 2-COLUMN: Categories + Transactions ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Categories */}
        <div className="lg:col-span-5 xl:col-span-4">
          {categoryBreakdown.length > 0 && (
            <InvoiceCategoryBreakdown categories={categoryBreakdown} total={total} />
          )}
        </div>

        {/* Transactions */}
        <div className="lg:col-span-7 xl:col-span-8">
          <InvoiceTransactionList items={items} />
        </div>
      </div>

      {/* Mobile fixed pay button */}
      {currentInvoice && !currentInvoice.is_paid && total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="fixed bottom-20 left-4 right-4 z-40 max-w-lg mx-auto md:hidden"
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
