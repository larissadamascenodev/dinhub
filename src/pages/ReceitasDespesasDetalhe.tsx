import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowUpRight, ArrowDownRight, CheckCircle2, Clock,
  ChevronDown, ChevronUp, CreditCard, TrendingUp, TrendingDown,
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
  XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart,
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
  const [detailTx, setDetailTx] = useState<any>(null);
  const [detailAccountName, setDetailAccountName] = useState("");
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (!user) return;
    const start = new Date(selectedYear, selectedMonth, 1).toISOString().split("T")[0];
    const end = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split("T")[0];

    const fetchAll = async () => {
      setLoading(true);
      let txQuery = supabase
        .from("transactions")
        .select("id, name, category, date, amount, status, type, payment_method, recurrence_type, created_at, updated_at, credit_card_id")
        .eq("user_id", user.id)
        .eq("type", typeFilter)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: false })
        .order("created_at", { ascending: true });

      if (!isReceita) {
        txQuery = txQuery.is("credit_card_id", null);
      }

      const [{ data: txs }, cats] = await Promise.all([txQuery, getCustomCategories()]);
      setTransactions((txs as TxRow[]) ?? []);
      setCustomCats(cats);

      if (!isReceita) {
        const { data: invData } = await supabase
          .from("invoices")
          .select("id, credit_card_id, total_amount, is_paid, month, year")
          .eq("user_id", user.id)
          .eq("month", selectedMonth + 1)
          .eq("year", selectedYear)
          .gt("total_amount", 0);

        if (invData && invData.length > 0) {
          const cardIds = [...new Set(invData.map((inv) => inv.credit_card_id))];
          const { data: cards } = await supabase
            .from("credit_cards")
            .select("id, name, color")
            .in("id", cardIds);
          const cardMap = new Map((cards ?? []).map((c) => [c.id, c]));
          setInvoices(invData.map((inv) => {
            const card = cardMap.get(inv.credit_card_id);
            return { ...inv, card_name: card?.name ?? "Cartão", card_color: card?.color ?? null };
          }));
        } else {
          setInvoices([]);
        }
      }
      setLoading(false);
    };
    fetchAll();
  }, [user, selectedMonth, selectedYear, typeFilter, isReceita]);

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

  const total = isReceita ? data.receitas : data.despesas;
  const paid = isReceita ? data.receitasRecebidas : data.despesasPagas;
  const pending = isReceita ? data.receitasPendentes : data.despesasPendentes;
  const paidPct = total > 0 ? Math.round((paid / total) * 100) : 0;

  // Trend calculation
  const trend = useMemo(() => {
    if (historyData.length < 2) return 0;
    const prev = historyData[historyData.length - 2]?.value ?? 0;
    const curr = historyData[historyData.length - 1]?.value ?? 0;
    if (prev === 0) return 0;
    return Math.round(((curr - prev) / prev) * 100);
  }, [historyData]);

  type ListItem = { kind: "tx"; tx: TxRow } | { kind: "invoice"; inv: InvoiceRow };

  const allPending = useMemo<ListItem[]>(() => {
    const items: ListItem[] = transactions.filter((t) => t.status !== "pago").map((tx) => ({ kind: "tx" as const, tx }));
    if (!isReceita) invoices.filter((inv) => !inv.is_paid).forEach((inv) => items.push({ kind: "invoice" as const, inv }));
    return items;
  }, [transactions, invoices, isReceita]);

  const allPaid = useMemo<ListItem[]>(() => {
    const items: ListItem[] = transactions.filter((t) => t.status === "pago").map((tx) => ({ kind: "tx" as const, tx }));
    if (!isReceita) invoices.filter((inv) => inv.is_paid).forEach((inv) => items.push({ kind: "invoice" as const, inv }));
    return items;
  }, [transactions, invoices, isReceita]);

  const handleTxClick = useCallback(async (tx: TxRow) => {
    try {
      const [fullTx, accounts] = await Promise.all([getTransactionById(tx.id), getAccounts()]);
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
    <div className="pb-24 md:pb-8 w-full select-none">
      {/* Header */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-medium">Voltar</span>
        </button>
        <h1 className="text-lg font-bold font-display text-foreground">
          {isReceita ? "Receitas" : "Despesas"} · {monthLabel}
        </h1>
      </div>

      {/* Hero summary card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="rounded-2xl overflow-hidden mb-5 relative"
        style={{
          background: `linear-gradient(160deg, hsl(var(--card)) 0%, hsl(220 18% 8%) 100%)`,
          border: `1px solid ${accentHsl.replace(")", " / 0.12)")}`,
          boxShadow: `0 12px 40px -12px ${accentHsl.replace(")", " / 0.2)")}, inset 0 1px 0 0 hsl(220 20% 20% / 0.15)`,
        }}
      >
        {/* Glow orbs */}
        <div
          className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-[80px] pointer-events-none"
          style={{ background: `${accentHsl.replace(")", " / 0.12)")}` }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full blur-[60px] pointer-events-none"
          style={{ background: `${accentHsl.replace(")", " / 0.06)")}` }}
        />

        <div className="relative px-5 pt-5 pb-4">
          {/* Total */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <div className={`w-6 h-6 rounded-lg bg-${accent}/15 flex items-center justify-center`}>
                {isReceita ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
                )}
              </div>
              <p className="text-[10px] text-muted-foreground/70 uppercase tracking-[0.15em] font-semibold">
                Total {isReceita ? "Receitas" : "Despesas"}
              </p>
            </div>
            <p className={`text-3xl md:text-4xl font-bold tabular-nums font-display text-${accent}`}>
              {fmt(total)}
            </p>
            {/* Trend badge */}
            {trend !== 0 && (
              <div className="flex items-center justify-center gap-1 mt-1.5">
                {(isReceita ? trend > 0 : trend < 0) ? (
                  <TrendingUp className="w-3 h-3 text-primary" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-destructive" />
                )}
                <span className={`text-[9px] font-bold ${(isReceita ? trend > 0 : trend < 0) ? "text-primary" : "text-destructive"}`}>
                  {trend > 0 ? "+" : ""}{trend}% vs mês anterior
                </span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="w-full h-1.5 bg-border/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${paidPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className={`h-full rounded-full bg-${accent}`}
                style={{ opacity: 0.8 }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[8px] text-muted-foreground/40">{paidPct}% {isReceita ? "recebido" : "pago"}</span>
              <span className="text-[8px] text-muted-foreground/40">{100 - paidPct}% pendente</span>
            </div>
          </div>

          {/* Paid + Pending */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-xl px-3 py-2.5"
              style={{
                background: `${accentHsl.replace(")", " / 0.06)")}`,
                border: `1px solid ${accentHsl.replace(")", " / 0.1)")}`,
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 className={`w-3 h-3 text-${accent}`} style={{ opacity: 0.7 }} />
                <p className="text-[9px] text-foreground/50 font-semibold uppercase tracking-wider">
                  {isReceita ? "Recebido" : "Pago"}
                </p>
              </div>
              <p className={`text-base font-bold tabular-nums text-${accent}`}>{fmt(paid)}</p>
            </div>
            <div
              className="rounded-xl px-3 py-2.5"
              style={{
                background: "hsl(40 80% 50% / 0.06)",
                border: "1px solid hsl(40 80% 50% / 0.1)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3 h-3 text-yellow-400" style={{ opacity: 0.7 }} />
                <p className="text-[9px] text-foreground/50 font-semibold uppercase tracking-wider">Pendente</p>
              </div>
              <p className="text-base font-bold tabular-nums text-yellow-400">{fmt(pending)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Evolution chart */}
      {historyData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/15 bg-card/80 backdrop-blur-xl overflow-hidden mb-5"
          style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.25)" }}
        >
          <div className="px-4 pt-4 pb-1">
            <p className="text-[11px] text-foreground/60 font-semibold">Evolução mensal</p>
          </div>
          <div className="px-2 pb-3">
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={historyData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accentHsl} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={accentHsl} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fill: "hsl(220 15% 55%)", fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <RechartsTooltip
                  contentStyle={{
                    background: "hsl(220 18% 10%)",
                    border: `1px solid ${accentHsl.replace(")", " / 0.25)")}`,
                    borderRadius: "10px",
                    fontSize: "11px",
                    color: "hsl(220 15% 85%)",
                    boxShadow: `0 4px 16px ${accentHsl.replace(")", " / 0.15)")}`,
                  }}
                  formatter={(value: number) => [fmt(value), isReceita ? "Receitas" : "Despesas"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={accentHsl}
                  strokeWidth={2.5}
                  fill="url(#areaGrad)"
                  dot={{ fill: accentHsl, r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }}
                  activeDot={{ r: 6, fill: accentHsl, stroke: "hsl(var(--card))", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Pending list */}
      {allPending.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-yellow-400/10 flex items-center justify-center">
              <Clock className="w-3 h-3 text-yellow-400" />
            </div>
            <h3 className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest">
              {isReceita ? "A Receber" : "Pendentes"}
            </h3>
            <span className="text-[10px] font-bold text-yellow-400/60 tabular-nums">{allPending.length}</span>
          </div>
          <div className="space-y-1.5">
            <AnimatePresence mode="popLayout">
              {displayPending.map((item, i) =>
                item.kind === "tx" ? (
                  <TxRowItem key={item.tx.id} tx={item.tx} isReceita={isReceita} customCats={customCats} onClick={() => handleTxClick(item.tx)} idx={i} />
                ) : (
                  <InvoiceRowItem key={item.inv.id} inv={item.inv} isPending onClick={() => navigate(`/fatura/${item.inv.credit_card_id}`)} idx={i} />
                )
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Paid list */}
      {allPaid.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-5 h-5 rounded-md bg-${accent}/10 flex items-center justify-center`}>
              <CheckCircle2 className={`w-3 h-3 text-${accent}`} />
            </div>
            <h3 className="text-[11px] font-bold text-foreground/50 uppercase tracking-widest">
              {isReceita ? "Recebidas" : "Pagas"}
            </h3>
            <span className={`text-[10px] font-bold text-${accent}/60 tabular-nums`}>{allPaid.length}</span>
          </div>
          <div className="space-y-1.5">
            <AnimatePresence mode="popLayout">
              {displayPaid.map((item, i) =>
                item.kind === "tx" ? (
                  <TxRowItem key={item.tx.id} tx={item.tx} isReceita={isReceita} customCats={customCats} onClick={() => handleTxClick(item.tx)} idx={i} />
                ) : (
                  <InvoiceRowItem key={item.inv.id} inv={item.inv} isPending={false} onClick={() => navigate(`/fatura/${item.inv.credit_card_id}`)} idx={i} />
                )
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Expand / collapse */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full flex items-center justify-center gap-1.5 text-[11px] text-primary font-semibold py-2.5 rounded-xl hover:bg-primary/5 transition-colors"
        >
          {showAll ? (
            <><ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      )}

      {loading && transactions.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-pulse text-primary text-sm font-medium">Carregando...</div>
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

/* ─── Transaction Row ─── */
const TxRowItem = ({
  tx, isReceita, customCats, onClick, idx,
}: {
  tx: TxRow; isReceita: boolean; customCats: CustomCategory[]; onClick: () => void; idx: number;
}) => {
  const isPending = tx.status !== "pago";
  const color = getCategoryColor(tx.category, customCats);
  const Icon = getCategoryIcon(tx.category, customCats);
  const dateFormatted = new Date(tx.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ delay: idx * 0.025, type: "spring", stiffness: 400, damping: 30 }}
      className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer active:scale-[0.99] transition-transform"
      style={{
        background: isPending ? "hsl(40 80% 50% / 0.05)" : "hsl(var(--card) / 0.8)",
        border: `1px solid ${isPending ? "hsl(40 80% 50% / 0.12)" : "hsl(220 15% 20% / 0.15)"}`,
      }}
      onClick={onClick}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `hsl(${color} / 0.12)` }}
      >
        <Icon className="w-4 h-4" style={{ color: `hsl(${color})` }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground truncate">{tx.name}</p>
        <p className="text-[10px] text-muted-foreground/50 mt-0.5 font-medium">
          {tx.category} · {dateFormatted}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p
          className="text-[13px] font-bold tabular-nums"
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
        <span
          className="block mt-0.5 text-[8px] font-bold uppercase tracking-wider"
          style={{ color: isPending ? "hsl(40 80% 50% / 0.5)" : "hsl(var(--muted-foreground) / 0.35)" }}
        >
          {isPending ? (isReceita ? "A Receber" : "Pendente") : (isReceita ? "Recebido" : "Pago")}
        </span>
      </div>
    </motion.div>
  );
};

/* ─── Invoice Row ─── */
const InvoiceRowItem = ({
  inv, isPending, onClick, idx,
}: {
  inv: InvoiceRow; isPending: boolean; onClick: () => void; idx: number;
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ delay: idx * 0.025, type: "spring", stiffness: 400, damping: 30 }}
      className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer active:scale-[0.99] transition-transform"
      style={{
        background: isPending ? "hsl(40 80% 50% / 0.05)" : "hsl(var(--card) / 0.8)",
        border: `1px solid ${isPending ? "hsl(40 80% 50% / 0.12)" : "hsl(220 15% 20% / 0.15)"}`,
      }}
      onClick={onClick}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: inv.card_color ? `${inv.card_color}15` : "hsl(220 20% 18%)",
        }}
      >
        <CreditCard className="w-4 h-4" style={{ color: inv.card_color || "hsl(220 15% 55%)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground truncate">Fatura {inv.card_name}</p>
        <p className="text-[10px] text-muted-foreground/50 mt-0.5 font-medium">
          {MONTH_SHORT[inv.month - 1]}/{inv.year}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p
          className="text-[13px] font-bold tabular-nums"
          style={{ color: isPending ? "hsl(40 80% 50%)" : "hsl(var(--destructive))" }}
        >
          −{fmt(inv.total_amount)}
        </p>
        <span
          className="block mt-0.5 text-[8px] font-bold uppercase tracking-wider"
          style={{ color: isPending ? "hsl(40 80% 50% / 0.5)" : "hsl(var(--muted-foreground) / 0.35)" }}
        >
          {isPending ? "Pendente" : "Paga"}
        </span>
      </div>
    </motion.div>
  );
};

export default ReceitasDespesasDetalhe;
