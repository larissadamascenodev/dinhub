import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowUpRight, ArrowDownRight, CheckCircle2, Clock,
  ChevronDown, ChevronUp, CreditCard,
} from "lucide-react";
import { useMonth } from "@/contexts/MonthContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { supabase } from "@/integrations/supabase/client";
import { getCategoryIcon, getCategoryColor } from "@/lib/categoryUtils";
import { getCustomCategories, type CustomCategory } from "@/services/categoryService";
import { getTransactionById, getAccounts } from "@/services/transactionService";
import TransactionDetailModal from "@/components/dashboard/TransactionDetailModal";
import {
  LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart,
} from "recharts";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const MONTH_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface TxRow {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  status: string;
  type: string;
  payment_method: string;
  recurrence_type: string;
  created_at: string;
  updated_at: string;
  credit_card_id: string | null;
}

interface InvoiceRow {
  id: string;
  credit_card_id: string;
  total_amount: number;
  is_paid: boolean;
  month: number;
  year: number;
  card_name?: string;
  card_color?: string;
}

const ReceitasDespesasDetalhe = () => {
  const { tipo } = useParams<{ tipo: string }>();
  const isReceita = tipo === "receitas";
  const typeFilter = isReceita ? "receita" : "despesa";
  const navigate = useNavigate();
  const { selectedMonth, selectedYear } = useMonth();
  const { user } = useAuth();
  const { data, refetch } = useFinanceData(selectedMonth, selectedYear, { includeHistorical: false });
  useSwipeBack();

  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [customCats, setCustomCats] = useState<CustomCategory[]>([]);
  const [historyData, setHistoryData] = useState<{ month: string; value: number }[]>([]);
  const [showAll, setShowAll] = useState(false);

  // Detail modal
  const [detailTx, setDetailTx] = useState<any>(null);
  const [detailAccountName, setDetailAccountName] = useState("");
  const [showDetail, setShowDetail] = useState(false);

  // Fetch transactions (excluding credit card ones for despesas) + invoices
  useEffect(() => {
    if (!user) return;
    const start = new Date(selectedYear, selectedMonth, 1).toISOString().split("T")[0];
    const end = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split("T")[0];

    const fetchAll = async () => {
      setLoading(true);

      // Base transaction query
      let txQuery = supabase
        .from("transactions")
        .select("id, name, category, date, amount, status, type, payment_method, recurrence_type, created_at, updated_at, credit_card_id")
        .eq("user_id", user.id)
        .eq("type", typeFilter)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: false })
        .order("created_at", { ascending: true });

      // For despesas, exclude credit card transactions (they'll show as invoices)
      if (!isReceita) {
        txQuery = txQuery.is("credit_card_id", null);
      }

      const [{ data: txs }, cats] = await Promise.all([
        txQuery,
        getCustomCategories(),
      ]);
      setTransactions((txs as TxRow[]) ?? []);
      setCustomCats(cats);

      // For despesas, also fetch invoices for this month
      if (!isReceita) {
        const { data: invData } = await supabase
          .from("invoices")
          .select("id, credit_card_id, total_amount, is_paid, month, year")
          .eq("user_id", user.id)
          .eq("month", selectedMonth + 1)
          .eq("year", selectedYear)
          .gt("total_amount", 0);

        if (invData && invData.length > 0) {
          // Fetch card names
          const cardIds = [...new Set(invData.map((inv) => inv.credit_card_id))];
          const { data: cards } = await supabase
            .from("credit_cards")
            .select("id, name, color")
            .in("id", cardIds);

          const cardMap = new Map((cards ?? []).map((c) => [c.id, c]));
          const enriched: InvoiceRow[] = invData.map((inv) => {
            const card = cardMap.get(inv.credit_card_id);
            return {
              ...inv,
              card_name: card?.name ?? "Cartão",
              card_color: card?.color ?? null,
            };
          });
          setInvoices(enriched);
        } else {
          setInvoices([]);
        }
      }

      setLoading(false);
    };
    fetchAll();
  }, [user, selectedMonth, selectedYear, typeFilter, isReceita]);

  // Fetch 6-month history
  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      const months: { month: string; value: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(selectedYear, selectedMonth - i, 1);
        const m = d.getMonth();
        const y = d.getFullYear();
        const start = new Date(y, m, 1).toISOString().split("T")[0];
        const end = new Date(y, m + 1, 0).toISOString().split("T")[0];

        const { data: txs } = await supabase
          .from("transactions")
          .select("amount")
          .eq("user_id", user.id)
          .eq("type", typeFilter)
          .gte("date", start)
          .lte("date", end);

        const total = (txs ?? []).reduce((s: number, t: any) => s + Number(t.amount), 0);
        months.push({ month: MONTH_SHORT[m], value: total });
      }
      setHistoryData(months);
    };
    fetchHistory();
  }, [user, selectedMonth, selectedYear, typeFilter]);

  // Summary values
  const total = isReceita ? data.receitas : data.despesas;
  const paid = isReceita ? data.receitasRecebidas : data.despesasPagas;
  const pending = isReceita ? data.receitasPendentes : data.despesasPendentes;

  // Unified list item type
  type ListItem = { kind: "tx"; tx: TxRow } | { kind: "invoice"; inv: InvoiceRow };

  // Merge transactions + invoices into pending/paid lists
  const allPending = useMemo<ListItem[]>(() => {
    const items: ListItem[] = transactions.filter((t) => t.status !== "pago").map((tx) => ({ kind: "tx" as const, tx }));
    if (!isReceita) {
      invoices.filter((inv) => !inv.is_paid).forEach((inv) => items.push({ kind: "invoice" as const, inv }));
    }
    return items;
  }, [transactions, invoices, isReceita]);

  const allPaid = useMemo<ListItem[]>(() => {
    const items: ListItem[] = transactions.filter((t) => t.status === "pago").map((tx) => ({ kind: "tx" as const, tx }));
    if (!isReceita) {
      invoices.filter((inv) => inv.is_paid).forEach((inv) => items.push({ kind: "invoice" as const, inv }));
    }
    return items;
  }, [transactions, invoices, isReceita]);

  const handleTxClick = useCallback(async (tx: TxRow) => {
    try {
      const [fullTx, accounts] = await Promise.all([
        getTransactionById(tx.id),
        getAccounts(),
      ]);
      if (fullTx) {
        const acct = (accounts as any[]).find((a: any) => a.id === fullTx.account_id);
        setDetailAccountName(acct?.name || "");
        setDetailTx(fullTx);
        setShowDetail(true);
      }
    } catch {}
  }, []);

  const accent = isReceita ? "primary" : "destructive";
  const accentHsl = isReceita ? "hsl(var(--primary))" : "hsl(var(--destructive))";
  const monthLabel = MONTH_NAMES[selectedMonth];

  const displayPending = showAll ? allPending : allPending.slice(0, 5);
  const displayPaid = showAll ? allPaid : allPaid.slice(0, 5);
  const hasMore = allPending.length > 5 || allPaid.length > 5;

  return (
    <div className="pb-24 md:pb-8 w-full">
      {/* Header */}
      <div className="mb-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-medium">Voltar</span>
        </button>
        <div className="flex items-center gap-2">
          {isReceita ? (
            <ArrowUpRight className="w-5 h-5 text-primary" />
          ) : (
            <ArrowDownRight className="w-5 h-5 text-destructive" />
          )}
          <h1 className="text-lg font-bold font-display">
            {isReceita ? "Receitas" : "Despesas"} · {monthLabel}
          </h1>
        </div>
      </div>

      {/* Summary card — unified */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/20 backdrop-blur-xl overflow-hidden mb-5 relative"
        style={{
          background: `linear-gradient(145deg, ${accentHsl.replace(")", " / 0.08)")}, hsl(220 15% 8% / 0.9))`,
          boxShadow: `0 8px 32px -8px ${accentHsl.replace(")", " / 0.15)")}`,
        }}
      >
        {/* Glow */}
        <div
          className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl pointer-events-none"
          style={{ background: `${accentHsl.replace(")", " / 0.1)")}` }}
        />
        <div className="relative px-5 py-4">
          {/* Total */}
          <div className="text-center mb-3">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-semibold mb-1">
              Total {isReceita ? "Receitas" : "Despesas"}
            </p>
            <p className={`text-2xl md:text-3xl font-bold tabular-nums font-display text-${accent}`}>
              {fmt(total)}
            </p>
          </div>
          {/* Paid + Pending row */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-3.5 h-3.5 text-${accent} opacity-70`} />
              <div>
                <p className="text-[8px] text-muted-foreground/50 uppercase tracking-wider font-semibold">
                  {isReceita ? "Recebido" : "Pago"}
                </p>
                <p className="text-sm font-bold tabular-nums text-foreground">{fmt(paid)}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-border/15" />
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-yellow-400 opacity-70" />
              <div>
                <p className="text-[8px] text-muted-foreground/50 uppercase tracking-wider font-semibold">Pendente</p>
                <p className="text-sm font-bold tabular-nums text-yellow-400">{fmt(pending)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Evolution chart - LINE */}
      {historyData.length > 0 && (
        <div
          className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl p-4 mb-5"
          style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.3)" }}
        >
          <p className="text-[11px] text-muted-foreground/60 font-medium mb-3">Evolução mensal</p>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accentHsl} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={accentHsl} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 10% 20%)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "hsl(220 10% 50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <RechartsTooltip
                contentStyle={{
                  background: "hsl(220 15% 12%)",
                  border: "1px solid hsl(220 10% 20%)",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
                formatter={(value: number) => [fmt(value), isReceita ? "Receitas" : "Despesas"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={accentHsl}
                strokeWidth={2.5}
                fill="url(#areaFill)"
                dot={{ fill: accentHsl, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: accentHsl }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pending */}
      {allPending.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <Clock className="w-3.5 h-3.5 text-yellow-400" />
            <h3 className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
              {isReceita ? "A Receber" : "Pendentes"} ({allPending.length})
            </h3>
          </div>
          <div className="space-y-1.5">
            {displayPending.map((item, i) =>
              item.kind === "tx" ? (
                <TxRowItem
                  key={item.tx.id}
                  tx={item.tx}
                  isReceita={isReceita}
                  customCats={customCats}
                  onClick={() => handleTxClick(item.tx)}
                  idx={i}
                />
              ) : (
                <InvoiceRowItem
                  key={item.inv.id}
                  inv={item.inv}
                  isPending
                  onClick={() => navigate(`/fatura/${item.inv.credit_card_id}`)}
                  idx={i}
                />
              )
            )}
          </div>
        </div>
      )}

      {/* Paid */}
      {allPaid.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <CheckCircle2 className={`w-3.5 h-3.5 text-${accent}`} />
            <h3 className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
              {isReceita ? "Recebidas" : "Pagas"} ({allPaid.length})
            </h3>
          </div>
          <div className="space-y-1.5">
            {displayPaid.map((item, i) =>
              item.kind === "tx" ? (
                <TxRowItem
                  key={item.tx.id}
                  tx={item.tx}
                  isReceita={isReceita}
                  customCats={customCats}
                  onClick={() => handleTxClick(item.tx)}
                  idx={i}
                />
              ) : (
                <InvoiceRowItem
                  key={item.inv.id}
                  inv={item.inv}
                  isPending={false}
                  onClick={() => navigate(`/fatura/${item.inv.credit_card_id}`)}
                  idx={i}
                />
              )
            )}
          </div>
        </div>
      )}

      {/* Show more */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full flex items-center justify-center gap-1 text-[11px] text-primary font-semibold py-2 rounded-lg hover:bg-primary/5 transition-colors"
        >
          {showAll ? (
            <>Recolher <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>Ver todas ({allPending.length + allPaid.length}) <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      )}

      {loading && transactions.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-primary text-sm">Carregando...</div>
        </div>
      )}

      <TransactionDetailModal
        open={showDetail}
        tx={detailTx}
        accountName={detailAccountName}
        onClose={() => { setShowDetail(false); setDetailTx(null); }}
        onRefresh={() => { setShowDetail(false); setDetailTx(null); refetch(); }}
        userId={user?.id}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
    </div>
  );
};

// Transaction row component
const TxRowItem = ({
  tx,
  isReceita,
  customCats,
  onClick,
  idx,
}: {
  tx: TxRow;
  isReceita: boolean;
  customCats: CustomCategory[];
  onClick: () => void;
  idx: number;
}) => {
  const isPending = tx.status !== "pago";
  const color = getCategoryColor(tx.category, customCats);
  const Icon = getCategoryIcon(tx.category, customCats);
  const dateFormatted = new Date(tx.date + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.03 }}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
        isPending
          ? "border border-yellow-500/15 bg-yellow-500/[0.06]"
          : "bg-card/95 hover:bg-card"
      }`}
      onClick={onClick}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `hsl(${color} / 0.12)` }}
      >
        <Icon className="w-4 h-4" style={{ color: `hsl(${color})` }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-foreground truncate">{tx.name}</p>
        <p className="text-[9px] text-muted-foreground/50 mt-0.5">
          {tx.category} · {dateFormatted}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p
          className="text-xs font-bold tabular-nums"
          style={{
            color: isPending
              ? "hsl(40 80% 50%)"
              : isReceita
              ? "hsl(var(--primary))"
              : "hsl(var(--destructive))",
          }}
        >
          {isReceita ? "+" : "−"}{fmt(tx.amount)}
        </p>
        <span className="block mt-0.5 text-[8px] font-bold uppercase tracking-wide text-muted-foreground/40">
          {isPending
            ? isReceita
              ? "A Receber"
              : "Pendente"
            : isReceita
            ? "Recebido"
            : "Pago"}
        </span>
      </div>
    </motion.div>
  );
};

// Invoice row component
const InvoiceRowItem = ({
  inv,
  isPending,
  onClick,
  idx,
}: {
  inv: InvoiceRow;
  isPending: boolean;
  onClick: () => void;
  idx: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.03 }}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
        isPending
          ? "border border-yellow-500/15 bg-yellow-500/[0.06]"
          : "bg-card/95 hover:bg-card"
      }`}
      onClick={onClick}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: inv.card_color ? `${inv.card_color}20` : "hsl(220 20% 20%)",
        }}
      >
        <CreditCard
          className="w-4 h-4"
          style={{ color: inv.card_color || "hsl(220 10% 60%)" }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-foreground truncate">
          Fatura {inv.card_name}
        </p>
        <p className="text-[9px] text-muted-foreground/50 mt-0.5">
          {MONTH_SHORT[inv.month - 1]}/{inv.year}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p
          className="text-xs font-bold tabular-nums"
          style={{
            color: isPending ? "hsl(40 80% 50%)" : "hsl(var(--destructive))",
          }}
        >
          −{fmt(inv.total_amount)}
        </p>
        <span className="block mt-0.5 text-[8px] font-bold uppercase tracking-wide text-muted-foreground/40">
          {isPending ? "Pendente" : "Paga"}
        </span>
      </div>
    </motion.div>
  );
};

export default ReceitasDespesasDetalhe;
