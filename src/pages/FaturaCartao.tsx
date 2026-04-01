import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Plus, MoreVertical,
  CalendarClock, CalendarCheck, Wallet, Shield,
} from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getInvoices, getInvoiceItems, payInvoice, type Invoice } from "@/services/invoiceService";
import { getAccounts, getCreditCards, createTransaction, updateTransaction, deleteTransaction } from "@/services/transactionService";
import { cn } from "@/lib/utils";
import InvoiceCategoryBreakdown from "@/components/fatura/InvoiceCategoryBreakdown";
import InvoiceTransactionList from "@/components/fatura/InvoiceTransactionList";
import InvoicePayModal from "@/components/fatura/InvoicePayModal";
import InvoiceHistoryChart from "@/components/fatura/InvoiceHistoryChart";
import InvoiceAddChooserModal from "@/components/fatura/InvoiceAddChooserModal";
import InvoiceUploadReviewModal, { type ExtractedItem } from "@/components/fatura/InvoiceUploadReviewModal";
import NovaTransacaoModal from "@/components/dashboard/NovaTransacaoModal";
import MonthSelector from "@/components/dashboard/MonthSelector";

export interface EnrichedItem {
  id: string;
  invoice_id: string;
  transaction_id: string;
  amount: number;
  installment_number: number;
  total_installments: number;
  transaction_name: string;
  transaction_category: string;
  transaction_date: string;
  transaction_status: string;
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
  const [showAddChooser, setShowAddChooser] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [payAccountId, setPayAccountId] = useState("");
  const [uploadProcessing, setUploadProcessing] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [extractedMessage, setExtractedMessage] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [confirmingImport, setConfirmingImport] = useState(false);

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

  const refreshItems = async () => {
    if (!currentInvoice) return;
    const [updatedItems, updatedInvoices] = await Promise.all([
      getInvoiceItems(currentInvoice.id),
      getInvoices(cardId!),
    ]);
    setItems(updatedItems as EnrichedItem[]);
    setInvoices(updatedInvoices);
  };

  const handleEditItem = async (transactionId: string, updates: { name?: string; amount?: number; category?: string }) => {
    const cleanUpdates: any = {};
    if (updates.name) cleanUpdates.name = updates.name;
    if (updates.amount) cleanUpdates.amount = updates.amount;
    if (updates.category) cleanUpdates.category = updates.category;
    if (Object.keys(cleanUpdates).length === 0) return;
    await updateTransaction(transactionId, cleanUpdates);
    toast.success("Lançamento atualizado ✅");
    await refreshItems();
  };

  const handleDeleteItem = async (transactionId: string) => {
    await deleteTransaction(transactionId);
    toast.success("Lançamento excluído ✅");
    await refreshItems();
  };

  const total = currentInvoice ? Number(currentInvoice.total_amount) : 0;
  const limitTotal = card ? Number(card.limit) : 0;
  const usedLimit = card ? Number(card.used_limit) : 0;
  const availableLimit = limitTotal - usedLimit;
  const usedPct = limitTotal > 0 ? Math.min((usedLimit / limitTotal) * 100, 100) : 0;

  // Handle file upload (image, PDF, CSV)
  const handleFileUpload = async (file: File) => {
    setUploadProcessing(true);
    toast.loading("Processando fatura com IA...", { id: "upload-processing" });
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data, error } = await supabase.functions.invoke("process-invoice", {
        body: formData,
      });

      if (error) throw new Error(error.message || "Erro ao processar fatura");
      if (data?.error) throw new Error(data.error);

      const items: ExtractedItem[] = (data.items || []).map((item: any) => ({
        ...item,
        selected: true,
      }));

      setExtractedItems(items);
      setExtractedMessage(data.message || "Lançamentos encontrados!");
      setShowReviewModal(true);
      toast.dismiss("upload-processing");
    } catch (err: any) {
      toast.dismiss("upload-processing");
      toast.error(err?.message || "Erro ao processar fatura");
    } finally {
      setUploadProcessing(false);
    }
  };

  // Confirm import of extracted items
  const handleConfirmImport = async (selectedItems: ExtractedItem[]) => {
    if (!user || !cardId || !card) return;
    setConfirmingImport(true);
    try {
      for (const item of selectedItems) {
        const paidInstallments = item.installment_current && item.installment_total
          ? item.installment_current
          : 0;

        await createTransaction(
          {
            name: item.description,
            type: "despesa",
            amount: item.amount,
            category: item.category || "outros",
            date: item.date || new Date().toISOString().split("T")[0],
            status: "pago",
            payment_method: "cartao",
            credit_card_id: cardId,
            recurrence_type: item.installment_total && item.installment_total > 1 ? "parcelado" : "unica",
            installments: item.installment_total || null,
            installment_current: item.installment_current || null,
            observation: paidInstallments > 0 ? `paid_installments:${paidInstallments}` : null,
          },
          user.id
        );
      }

      toast.success(`${selectedItems.length} lançamento${selectedItems.length > 1 ? "s" : ""} importado${selectedItems.length > 1 ? "s" : ""} com sucesso! 🎉`);
      setShowReviewModal(false);
      setExtractedItems([]);
      await refreshItems();
    } catch (err: any) {
      toast.error(err?.message || "Erro ao importar lançamentos");
    } finally {
      setConfirmingImport(false);
    }
  };

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
        <MonthSelector
          selectedMonth={selectedMonth - 1}
          selectedYear={selectedYear}
          onMonthChange={(m, y) => { setSelectedMonth(m + 1); setSelectedYear(y); }}
        />
        <Button
          variant="outline"
          size="sm"
          className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-[10px] sm:text-xs font-semibold gap-1 sm:gap-1.5 shrink-0 ml-2 px-2.5 sm:px-3 h-7 sm:h-8"
          onClick={() => setShowAddChooser(true)}
        >
          <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          Adicionar lançamento
        </Button>
      </div>

      {/* ===== UNIFIED CARD: Fatura + Limite ===== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card overflow-hidden relative"
      >
        {/* Glow */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 30% -10%, ${cardColor} 0%, transparent 60%)`,
          }}
        />

        <div className="relative z-10 p-5 space-y-5">
          {/* Card identity row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-7 rounded-md shadow-lg" style={{ backgroundColor: cardColor }} />
                <div className="absolute inset-0 rounded-md bg-gradient-to-br from-white/20 to-transparent" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-foreground">{card?.name}</h1>
                {card?.last_four_digits && (
                  <span className="text-[10px] text-muted-foreground tracking-wider">•••• {card.last_four_digits}</span>
                )}
              </div>
            </div>
            {invoiceStatus === "paid" ? (
              <div className="flex items-center gap-1.5 border border-primary/30 bg-primary/10 px-2.5 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold text-primary">Paga</span>
              </div>
            ) : invoiceStatus === "closed" ? (
              <div className="flex items-center gap-1.5 border border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/10 px-2.5 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--warning))]" />
                <span className="text-[10px] font-bold text-[hsl(var(--warning))]">Fechada</span>
              </div>
            ) : invoiceStatus === "open" ? (
              <div className="flex items-center gap-1.5 border border-primary/20 bg-primary/5 px-2.5 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                <span className="text-[10px] font-bold text-primary/80">Aberta</span>
              </div>
            ) : null}
          </div>

          {/* Invoice value — centered */}
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Fatura de {MONTH_NAMES[selectedMonth - 1]}
            </p>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">
              {formatCurrency(total)}
            </p>
            {dueInfo && invoiceStatus !== "paid" && (
              <span className={cn(
                "text-[10px] font-semibold",
                dueInfo.overdue ? "text-destructive" : "text-muted-foreground"
              )}>
                {dueInfo.text}
              </span>
            )}
          </div>

          {/* Dates chips */}
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

          {/* Divider */}
          <div className="h-px bg-border/20" />

          {/* Limit section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-primary/60" />
                <span className="text-xs font-bold text-foreground">Limite</span>
              </div>
              <span className={cn(
                "text-xs font-bold",
                usedPct > 80 ? "text-destructive" : usedPct > 50 ? "text-[hsl(var(--warning))]" : "text-primary"
              )}>
                {usedPct.toFixed(0)}% utilizado
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 rounded-full bg-muted/40 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usedPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  usedPct > 80 ? "bg-destructive" : usedPct > 50 ? "bg-[hsl(var(--warning))]" : "bg-primary"
                )}
              />
            </div>

            {/* Limit values row */}
            <div className="flex items-center justify-between text-[11px]">
              <div className="text-center">
                <p className="text-muted-foreground">Usado</p>
                <p className="font-bold text-foreground">{formatCurrency(usedLimit)}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Disponível</p>
                <p className="font-bold text-primary">{formatCurrency(availableLimit)}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Total</p>
                <p className="font-bold text-foreground">{formatCurrency(limitTotal)}</p>
              </div>
            </div>
          </div>

          {/* Pay button */}
          {currentInvoice && !currentInvoice.is_paid && total > 0 && (
            <>
              <div className="h-px bg-border/20" />
              <Button
                onClick={() => setShowPayModal(true)}
                className="w-full h-11 rounded-xl text-xs font-bold bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 backdrop-blur-md"
              >
                <Wallet className="w-3.5 h-3.5 mr-1.5" />
                Pagar Fatura · {formatCurrency(total)}
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* ===== HISTORY / PROJECTION CHART ===== */}
      <InvoiceHistoryChart
        invoices={invoices}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onSelect={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}
      />

      {/* ===== CATEGORIES — right after chart ===== */}
      {categoryBreakdown.length > 0 && (
        <InvoiceCategoryBreakdown categories={categoryBreakdown} total={total} />
      )}

      {/* ===== TRANSACTIONS ===== */}
      <InvoiceTransactionList
        items={items}
        installmentCount={items.filter((i) => i.total_installments > 1).length}
        cardName={card?.name}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
      />


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

      {/* Add Chooser Modal */}
      <InvoiceAddChooserModal
        open={showAddChooser}
        onClose={() => setShowAddChooser(false)}
        onManual={() => setShowManualAdd(true)}
        onImage={(file) => {
          toast.info("Processamento de imagem em breve!");
        }}
        onPdf={(file) => {
          toast.info("Processamento de PDF em breve!");
        }}
        onCsv={(file) => {
          toast.info("Processamento de CSV em breve!");
        }}
      />

      {/* Manual Add Modal — pre-set to credit card */}
      <NovaTransacaoModal
        open={showManualAdd}
        onClose={() => setShowManualAdd(false)}
        onSuccess={async () => {
          setShowManualAdd(false);
          await refreshItems();
        }}
        initialType="despesa"
        initialPaymentMethod="cartao"
        initialCreditCardId={cardId}
      />
    </div>
  );
};

export default FaturaCartao;
