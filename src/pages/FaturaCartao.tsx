import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CreditCard, Calendar, TrendingDown, TrendingUp, CheckCircle2, Receipt, Sparkles } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getInvoices, getInvoiceItems, payInvoice, type Invoice } from "@/services/invoiceService";
import { getAccounts, getCreditCards } from "@/services/transactionService";
import { cn } from "@/lib/utils";

interface EnrichedItem {
  id: string;
  invoice_id: string;
  transaction_id: string;
  amount: number;
  installment_number: number;
  total_installments: number;
  transaction_name: string;
  transaction_category: string;
}

interface CreditCardInfo {
  id: string;
  name: string;
  limit: number;
  used_limit: number;
  closing_day: number;
  due_day: number;
}

interface AccountInfo {
  id: string;
  name: string;
  is_default: boolean;
  current_balance: number;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatCurrency(value: number) {
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
  const [previousTotal, setPreviousTotal] = useState<number | null>(null);

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

        // Get previous month invoice for insights
        let prevMonth = selectedMonth - 1;
        let prevYear = selectedYear;
        if (prevMonth < 1) { prevMonth = 12; prevYear--; }
        const prevInv = allInvoices.find((i) => i.month === prevMonth && i.year === prevYear);
        setPreviousTotal(prevInv ? Number(prevInv.total_amount) : null);
      } catch {
        toast.error("Erro ao carregar fatura");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, cardId, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!currentInvoice) {
      setItems([]);
      return;
    }
    getInvoiceItems(currentInvoice.id).then((data) => {
      setItems(data as EnrichedItem[]);
    });
  }, [currentInvoice]);

  const handlePay = async () => {
    if (!currentInvoice || !payAccountId) return;
    setPaying(true);
    try {
      await payInvoice(currentInvoice.id, payAccountId);
      toast.success("Fatura paga! ✅");
      setShowPayModal(false);
      // Refresh
      const updated = await getInvoices(cardId!);
      setInvoices(updated);
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao pagar fatura");
    } finally {
      setPaying(false);
    }
  };

  const total = currentInvoice ? Number(currentInvoice.total_amount) : 0;
  const usedPct = card && card.limit > 0 ? Math.min((Number(card.used_limit) / Number(card.limit)) * 100, 100) : 0;
  const dueDate = card ? `${card.due_day}/${String(selectedMonth).padStart(2, "0")}/${selectedYear}` : "";

  // Insights
  const insight = useMemo(() => {
    if (!currentInvoice || total === 0) return null;
    if (previousTotal === null) return null;
    if (previousTotal === 0 && total > 0) return { type: "up" as const, text: "Primeira fatura registrada nesse cartão 📋" };
    const diff = ((total - previousTotal) / previousTotal) * 100;
    if (diff > 15) return { type: "up" as const, text: `Essa fatura veio ${diff.toFixed(0)}% mais alta que o mês passado 👀` };
    if (diff < -10) return { type: "down" as const, text: `Boa! Reduziu ${Math.abs(diff).toFixed(0)}% em relação ao mês passado 👏` };
    return { type: "neutral" as const, text: "Fatura dentro da média dos últimos meses ✅" };
  }, [total, previousTotal, currentInvoice]);

  const handleMonthNav = (dir: number) => {
    let m = selectedMonth + dir;
    let y = selectedYear;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setSelectedMonth(m);
    setSelectedYear(y);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-primary text-sm">Carregando fatura...</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pt-2 pb-8">
      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Fatura {card?.name}</h1>
          <p className="text-xs text-muted-foreground">
            Fecha dia {card?.closing_day} · Vence dia {card?.due_day}
          </p>
        </div>
        <CreditCard className="w-5 h-5 text-violet-400" />
      </div>

        {/* Month Selector */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => handleMonthNav(-1)}
            className="w-8 h-8 rounded-lg bg-card border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            ‹
          </button>
          <span className="text-sm font-bold text-foreground min-w-[140px] text-center">
            {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </span>
          <button
            onClick={() => handleMonthNav(1)}
            className="w-8 h-8 rounded-lg bg-card border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            ›
          </button>
        </div>

        {/* Invoice Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-violet-900/20 border border-violet-500/20 p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-violet-300/70 font-medium mb-1">Total da Fatura</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(total)}</p>
            </div>
            {currentInvoice?.is_paid ? (
              <div className="flex items-center gap-1.5 bg-primary/15 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-primary">Paga</span>
              </div>
            ) : (
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Vencimento</p>
                <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {dueDate}
                </p>
              </div>
            )}
          </div>

          {/* Limit progress */}
          <div className="mb-1">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
              <span>Uso do limite</span>
              <span>{usedPct.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usedPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  usedPct > 80 ? "bg-red-400" : usedPct > 50 ? "bg-amber-400" : "bg-emerald-400"
                )}
              />
            </div>
          </div>
        </motion.div>

        {/* Insight */}
        {insight && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={cn(
              "rounded-xl border p-3 mb-6 flex items-center gap-3",
              insight.type === "up"
                ? "bg-amber-500/10 border-amber-500/20"
                : insight.type === "down"
                ? "bg-primary/10 border-primary/20"
                : "bg-card border-border/30"
            )}
          >
            <Sparkles className={cn(
              "w-5 h-5 shrink-0",
              insight.type === "up" ? "text-amber-400" : insight.type === "down" ? "text-primary" : "text-muted-foreground"
            )} />
            <p className="text-xs text-foreground font-medium">{insight.text}</p>
          </motion.div>
        )}

        {/* Transaction List */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-bold text-foreground">
              Compras ({items.length})
            </h2>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl bg-card border border-border/30 p-6 text-center">
              <Receipt className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma compra nessa fatura</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center gap-3 rounded-xl bg-card/80 backdrop-blur-sm border border-border/20 p-3.5"
                >
                  <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {item.transaction_name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.transaction_category}
                      {item.total_installments > 1 && (
                        <span className="ml-1.5 text-violet-400 font-semibold">
                          {item.installment_number}/{item.total_installments}
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-destructive">
                    -{formatCurrency(Number(item.amount))}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Pay Button */}
        {currentInvoice && !currentInvoice.is_paid && total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={() => setShowPayModal(true)}
              className="w-full h-12 rounded-2xl text-sm font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            >
              Pagar Fatura · {formatCurrency(total)}
            </Button>
          </motion.div>
        )}

        {/* Pay Modal */}
        <AnimatePresence>
          {showPayModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowPayModal(false)}
            >
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg rounded-t-3xl bg-card border-t border-border/30 p-6 space-y-4"
              >
                <div className="w-10 h-1 rounded-full bg-border/40 mx-auto mb-2" />
                <h3 className="text-base font-bold text-foreground text-center">Pagar Fatura</h3>
                <p className="text-center text-2xl font-bold text-primary">{formatCurrency(total)}</p>

                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Debitar da conta:</p>
                  <Select value={payAccountId} onValueChange={setPayAccountId}>
                    <SelectTrigger className="bg-muted/30 border-border/20 h-11 rounded-xl">
                      <SelectValue placeholder="Selecionar conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} ({formatCurrency(Number(acc.current_balance))})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handlePay}
                  disabled={paying || !payAccountId}
                  className="w-full h-12 rounded-2xl text-sm font-bold"
                >
                  {paying ? "Processando..." : "Confirmar Pagamento"}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FaturaCartao;
