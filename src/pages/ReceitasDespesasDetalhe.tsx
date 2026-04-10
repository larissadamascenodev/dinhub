import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowUpRight, ArrowDownRight, CheckCircle2, Clock,
  ChevronDown, ChevronUp, CreditCard, TrendingUp, TrendingDown,
  Wallet, Receipt,
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
  id: string; name: string; category: string; date: string; amount: number;
  status: string; type: string; payment_method: string; recurrence_type: string;
  created_at: string; updated_at: string; credit_card_id: string | null;
}

interface InvoiceRow {
  id: string; credit_card_id: string; total_amount: number; is_paid: boolean;
  month: number; year: number; card_name?: string; card_color?: string;
}

/* ─── Circular Progress Ring ─── */
const ProgressRing = ({ pct, size = 56, stroke = 4, color }: { pct: number; size?: number; stroke?: number; color: string }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(220 15% 15%)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
      />
    </svg>
  );
};

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
        .eq("user_id", user.id).eq("type", typeFilter)
        .gte("date", start).lte("date", end)
        .order("date", { ascending: false }).order("created_at", { ascending: true });
      if (!isReceita) txQuery = txQuery.is("credit_card_id", null);
      const [{ data: txs }, cats] = await Promise.all([txQuery, getCustomCategories()]);
      setTransactions((txs as TxRow[]) ?? []);
      setCustomCats(cats);
      if (!isReceita) {
        const { data: invData } = await supabase.from("invoices")
          .select("id, credit_card_id, total_amount, is_paid, month, year")
          .eq("user_id", user.id).eq("month", selectedMonth + 1).eq("year", selectedYear).gt("total_amount", 0);
        if (invData && invData.length > 0) {
          const cardIds = [...new Set(invData.map((inv) => inv.credit_card_id))];
          const { data: cards } = await supabase.from("credit_cards").select("id, name, color").in("id", cardIds);
          const cardMap = new Map((cards ?? []).map((c) => [c.id, c]));
          setInvoices(invData.map((inv) => {
            const card = cardMap.get(inv.credit_card_id);
            return { ...inv, card_name: card?.name ?? "Cartão", card_color: card?.color ?? null };
          }));
        } else setInvoices([]);
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
        const m = d.getMonth(); const y = d.getFullYear();
        const start = new Date(y, m, 1).toISOString().split("T")[0];
        const end = new Date(y, m + 1, 0).toISOString().split("T")[0];
        const { data: txs } = await supabase.from("transactions").select("amount")
          .eq("user_id", user.id).eq("type", typeFilter).gte("date", start).lte("date", end);
        months.push({ month: MONTH_SHORT[m], value: (txs ?? []).reduce((s: number, t: any) => s + Number(t.amount), 0) });
      }
      setHistoryData(months);
    };
    fetchHistory();
  }, [user, selectedMonth, selectedYear, typeFilter]);

  const total = isReceita ? data.receitas : data.despesas;
  const paid = isReceita ? data.receitasRecebidas : data.despesasPagas;
  const pending = isReceita ? data.receitasPendentes : data.despesasPendentes;
  const paidPct = total > 0 ? Math.round((paid / total) * 100) : 0;

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
  const trendPositive = isReceita ? trend > 0 : trend < 0;
  const HeroIcon = isReceita ? Wallet : Receipt;

  return (
    <div className="pb-24 md:pb-8 w-full select-none">
      {/* Header */}
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-2">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-medium">Voltar</span>
        </button>
        <h1 className="text-lg font-bold font-display text-foreground">
          {isReceita ? "Receitas" : "Despesas"} · {monthLabel}
        </h1>
      </div>

      {/* ═══ Hero Card ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="rounded-2xl overflow-hidden mb-5 relative"
        style={{
          background: "linear-gradient(160deg, hsl(220 18% 12%) 0%, hsl(220 20% 7%) 100%)",
          border: `1px solid ${accentHsl.replace(")", " / 0.15)")}`,
          boxShadow: `0 16px 48px -16px ${accentHsl.replace(")", " / 0.2)")}, inset 0 1px 0 hsl(220 20% 22% / 0.2)`,
        }}
      >
        {/* Glow orbs */}
        <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full blur-[100px] pointer-events-none" style={{ background: `${accentHsl.replace(")", " / 0.1)")}` }} />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-[80px] pointer-events-none" style={{ background: `${accentHsl.replace(")", " / 0.05)")}` }} />

        <div className="relative px-4 pt-4 pb-4">
          {/* Top row: Ring + Total */}
          <div className="flex items-center gap-3 mb-2">
            {/* Progress ring */}
            <div className="relative flex-shrink-0">
              <ProgressRing pct={paidPct} color={accentHsl} size={52} stroke={3.5} />
              <div className="absolute inset-0 flex items-center justify-center">
                <HeroIcon className={`w-4 h-4 text-${accent}`} style={{ opacity: 0.8 }} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.15em] font-semibold mb-0.5">
                Total {isReceita ? "Receitas" : "Despesas"}
              </p>
              <p className={`text-xl md:text-3xl font-bold tabular-nums font-display text-${accent} leading-none`}>
                {fmt(total)}
              </p>
              {/* Trend */}
              {trend !== 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {trendPositive ? <TrendingUp className="w-3 h-3 text-primary" /> : <TrendingDown className="w-3 h-3 text-destructive" />}
                  <span className={`text-[9px] font-bold ${trendPositive ? "text-primary" : "text-destructive"}`}>
                    {trend > 0 ? "+" : ""}{trend}% vs mês anterior
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Paid / Pending inline */}
          <div className="flex items-center gap-3 pl-0.5">
            <div className="flex items-center gap-1">
              <CheckCircle2 className={`w-2.5 h-2.5 text-${accent}`} style={{ opacity: 0.6 }} />
              <span className="text-[8px] text-muted-foreground/50 font-semibold uppercase tracking-wider">{isReceita ? "Recebido" : "Pago"}</span>
              <span className={`text-[11px] font-bold tabular-nums text-${accent} ml-0.5`}>{fmt(paid)}</span>
            </div>
            <div className="w-px h-3 bg-border/15" />
            <div className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-yellow-400" style={{ opacity: 0.6 }} />
              <span className="text-[8px] text-muted-foreground/50 font-semibold uppercase tracking-wider">Pendente</span>
              <span className="text-[11px] font-bold tabular-nums text-yellow-400 ml-0.5">{fmt(pending)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ Evolution Chart ═══ */}
      {historyData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/10 bg-card/70 backdrop-blur-xl overflow-hidden mb-5"
          style={{ boxShadow: "0 4px 20px -4px rgba(0,0,0,0.2)" }}
        >
          <div className="px-4 pt-4 pb-1">
            <p className="text-[11px] text-foreground/55 font-semibold">Evolução mensal</p>
          </div>
          <div className="px-1 pb-2">
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={historyData} margin={{ top: 8, right: 12, left: 12, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradDetail" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accentHsl} stopOpacity={0.3} />
                    <stop offset="80%" stopColor={accentHsl} stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: "hsl(220 15% 50%)", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <RechartsTooltip
                  contentStyle={{
                    background: "hsl(220 20% 9%)",
                    border: `1px solid ${accentHsl.replace(")", " / 0.2)")}`,
                    borderRadius: "10px", fontSize: "11px", color: "hsl(220 15% 80%)",
                    boxShadow: `0 8px 24px ${accentHsl.replace(")", " / 0.12)")}`,
                  }}
                  formatter={(value: number) => [fmt(value), isReceita ? "Receitas" : "Despesas"]}
                />
                <Area
                  type="natural"
                  dataKey="value"
                  stroke={accentHsl}
                  strokeWidth={2}
                  fill="url(#areaGradDetail)"
                  dot={{ fill: accentHsl, r: 3.5, strokeWidth: 2, stroke: "hsl(220 20% 9%)" }}
                  activeDot={{ r: 5.5, fill: accentHsl, stroke: "hsl(220 20% 9%)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* ═══ Pending List ═══ */}
      {allPending.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-md bg-yellow-400/10 flex items-center justify-center">
              <Clock className="w-3 h-3 text-yellow-400" />
            </div>
            <h3 className="text-[11px] font-bold text-foreground/45 uppercase tracking-widest">
              {isReceita ? "A Receber" : "Pendentes"}
            </h3>
            <span className="ml-auto text-[10px] font-bold text-yellow-400/50 tabular-nums">{allPending.length}</span>
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

      {/* ═══ Paid List ═══ */}
      {allPaid.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <div className={`w-5 h-5 rounded-md bg-${accent}/10 flex items-center justify-center`}>
              <CheckCircle2 className={`w-3 h-3 text-${accent}`} />
            </div>
            <h3 className="text-[11px] font-bold text-foreground/45 uppercase tracking-widest">
              {isReceita ? "Recebidas" : "Pagas"}
            </h3>
            <span className={`ml-auto text-[10px] font-bold text-${accent}/50 tabular-nums`}>{allPaid.length}</span>
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

      {hasMore && (
        <button onClick={() => setShowAll(!showAll)} className="w-full flex items-center justify-center gap-1.5 text-[11px] text-primary font-semibold py-2.5 rounded-xl hover:bg-primary/5 transition-colors">
          {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      )}

      {loading && transactions.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-pulse text-primary text-sm font-medium">Carregando...</div>
        </div>
      )}

      <TransactionDetailModal
        open={showDetail} tx={detailTx} accountName={detailAccountName}
        onClose={() => { setShowDetail(false); setDetailTx(null); }}
        onRefresh={() => { setShowDetail(false); setDetailTx(null); refetch(); }}
        userId={user?.id} selectedMonth={selectedMonth} selectedYear={selectedYear}
      />
    </div>
  );
};

/* ─── Transaction Row ─── */
const TxRowItem = ({
  tx, isReceita, customCats, onClick, idx,
}: { tx: TxRow; isReceita: boolean; customCats: CustomCategory[]; onClick: () => void; idx: number }) => {
  const isPending = tx.status !== "pago";
  const color = getCategoryColor(tx.category, customCats);
  const Icon = getCategoryIcon(tx.category, customCats);
  const dateFormatted = new Date(tx.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  const statusColor = isPending ? "hsl(40 80% 50%)" : isReceita ? "hsl(var(--primary))" : "hsl(var(--destructive))";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ delay: idx * 0.02, type: "spring", stiffness: 400, damping: 30 }}
      className="flex items-center gap-3 pl-0 pr-3 py-0 rounded-xl cursor-pointer active:scale-[0.99] transition-transform overflow-hidden"
      style={{
        background: isPending ? "hsl(40 80% 50% / 0.04)" : "hsl(220 18% 12% / 0.6)",
        border: `1px solid ${isPending ? "hsl(40 80% 50% / 0.1)" : "hsl(220 15% 18% / 0.3)"}`,
      }}
      onClick={onClick}
    >
      {/* Left accent bar */}
      <div className="w-[3px] self-stretch rounded-r-full flex-shrink-0" style={{ background: statusColor, opacity: 0.5 }} />
      <div className="flex items-center gap-3 flex-1 min-w-0 py-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `hsl(${color} / 0.1)` }}>
          <Icon className="w-4 h-4" style={{ color: `hsl(${color})` }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-foreground/90 truncate">{tx.name}</p>
          <p className="text-[10px] text-muted-foreground/40 mt-0.5 font-medium">{tx.category} · {dateFormatted}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[13px] font-bold tabular-nums" style={{ color: statusColor }}>
            {isReceita ? "+" : "−"}{fmt(tx.amount)}
          </p>
          <span className="block mt-0.5 text-[8px] font-bold uppercase tracking-wider" style={{ color: `${statusColor}`, opacity: 0.4 }}>
            {isPending ? (isReceita ? "A Receber" : "Pendente") : (isReceita ? "Recebido" : "Pago")}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Invoice Row ─── */
const InvoiceRowItem = ({
  inv, isPending, onClick, idx,
}: { inv: InvoiceRow; isPending: boolean; onClick: () => void; idx: number }) => {
  const statusColor = isPending ? "hsl(40 80% 50%)" : "hsl(var(--destructive))";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ delay: idx * 0.02, type: "spring", stiffness: 400, damping: 30 }}
      className="flex items-center gap-3 pl-0 pr-3 py-0 rounded-xl cursor-pointer active:scale-[0.99] transition-transform overflow-hidden"
      style={{
        background: isPending ? "hsl(40 80% 50% / 0.04)" : "hsl(220 18% 12% / 0.6)",
        border: `1px solid ${isPending ? "hsl(40 80% 50% / 0.1)" : "hsl(220 15% 18% / 0.3)"}`,
      }}
      onClick={onClick}
    >
      <div className="w-[3px] self-stretch rounded-r-full flex-shrink-0" style={{ background: statusColor, opacity: 0.5 }} />
      <div className="flex items-center gap-3 flex-1 min-w-0 py-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: inv.card_color ? `${inv.card_color}12` : "hsl(220 20% 16%)" }}>
          <CreditCard className="w-4 h-4" style={{ color: inv.card_color || "hsl(220 15% 50%)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-foreground/90 truncate">Fatura {inv.card_name}</p>
          <p className="text-[10px] text-muted-foreground/40 mt-0.5 font-medium">{MONTH_SHORT[inv.month - 1]}/{inv.year}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[13px] font-bold tabular-nums" style={{ color: statusColor }}>−{fmt(inv.total_amount)}</p>
          <span className="block mt-0.5 text-[8px] font-bold uppercase tracking-wider" style={{ color: statusColor, opacity: 0.4 }}>
            {isPending ? "Pendente" : "Paga"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ReceitasDespesasDetalhe;
