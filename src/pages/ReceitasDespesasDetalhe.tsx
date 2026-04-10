import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowUpRight, ArrowDownRight, CheckCircle2, Clock,
  ChevronDown, ChevronUp,
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
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid,
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
  const [loading, setLoading] = useState(true);
  const [customCats, setCustomCats] = useState<CustomCategory[]>([]);
  const [historyData, setHistoryData] = useState<{ month: string; value: number }[]>([]);
  const [showAll, setShowAll] = useState(false);

  // Detail modal
  const [detailTx, setDetailTx] = useState<any>(null);
  const [detailAccountName, setDetailAccountName] = useState("");
  const [showDetail, setShowDetail] = useState(false);

  // Fetch transactions for current month
  useEffect(() => {
    if (!user) return;
    const start = new Date(selectedYear, selectedMonth, 1).toISOString().split("T")[0];
    const end = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split("T")[0];

    const fetchAll = async () => {
      setLoading(true);
      const [{ data: txs }, cats] = await Promise.all([
        supabase
          .from("transactions")
          .select("id, name, category, date, amount, status, type, payment_method, recurrence_type, created_at, updated_at, credit_card_id")
          .eq("user_id", user.id)
          .eq("type", typeFilter)
          .gte("date", start)
          .lte("date", end)
          .order("date", { ascending: false })
          .order("created_at", { ascending: true }),
        getCustomCategories(),
      ]);
      setTransactions((txs as TxRow[]) ?? []);
      setCustomCats(cats);
      setLoading(false);
    };
    fetchAll();
  }, [user, selectedMonth, selectedYear, typeFilter]);

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

  // Split transactions by status
  const paidTxs = useMemo(() => transactions.filter((t) => t.status === "pago"), [transactions]);
  const pendingTxs = useMemo(() => transactions.filter((t) => t.status !== "pago"), [transactions]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((t) => {
      map.set(t.category, (map.get(t.category) ?? 0) + Number(t.amount));
    });
    return Array.from(map.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

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

  const displayPaid = showAll ? paidTxs : paidTxs.slice(0, 5);
  const displayPending = showAll ? pendingTxs : pendingTxs.slice(0, 5);
  const hasMore = paidTxs.length > 5 || pendingTxs.length > 5;

  return (
    <div className="pb-24 md:pb-8 max-w-2xl mx-auto">
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

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div
          className="rounded-xl border p-3 text-center"
          style={{
            borderColor: `${accentHsl.replace(")", " / 0.15)")}`,
            background: `${accentHsl.replace(")", " / 0.06)")}`,
          }}
        >
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Total</p>
          <p className={`text-sm font-bold tabular-nums text-${accent}`}>{fmt(total)}</p>
        </div>
        <div className="rounded-xl border border-border/20 bg-card/60 p-3 text-center">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
            {isReceita ? "Recebido" : "Pago"}
          </p>
          <p className="text-sm font-bold tabular-nums text-foreground">{fmt(paid)}</p>
        </div>
        <div className="rounded-xl border border-yellow-500/15 bg-yellow-500/[0.06] p-3 text-center">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Pendente</p>
          <p className="text-sm font-bold tabular-nums text-yellow-400">{fmt(pending)}</p>
        </div>
      </div>

      {/* Evolution chart */}
      {historyData.length > 0 && (
        <div
          className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl p-4 mb-5"
          style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.3)" }}
        >
          <p className="text-[11px] text-muted-foreground/60 font-medium mb-3">Evolução mensal</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={historyData} barSize={20}>
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
              <Bar
                dataKey="value"
                fill={accentHsl}
                radius={[4, 4, 0, 0]}
                opacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <div
          className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl p-4 mb-5"
          style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.3)" }}
        >
          <p className="text-[11px] text-muted-foreground/60 font-medium mb-3">Por categoria</p>
          <div className="space-y-2.5">
            {categoryBreakdown.map((cat) => {
              const pct = total > 0 ? Math.round((cat.amount / total) * 100) : 0;
              const color = getCategoryColor(cat.name, customCats);
              const IconComponent = getCategoryIcon(cat.name, customCats);
              return (
                <div key={cat.name} className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <IconComponent className="w-4 h-4" style={{ color: `hsl(${color})` }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{cat.name}</p>
                    <div className="w-full h-1.5 bg-border/20 rounded-full mt-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: `hsl(${color})` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-foreground tabular-nums">{fmt(cat.amount)}</p>
                    <p className="text-[9px] text-muted-foreground/50">{pct}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending transactions */}
      {pendingTxs.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <Clock className="w-3.5 h-3.5 text-yellow-400" />
            <h3 className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
              {isReceita ? "A Receber" : "Pendentes"} ({pendingTxs.length})
            </h3>
          </div>
          <div className="space-y-1.5">
            {displayPending.map((tx, i) => (
              <TxRow
                key={tx.id}
                tx={tx}
                isReceita={isReceita}
                customCats={customCats}
                onClick={() => handleTxClick(tx)}
                idx={i}
              />
            ))}
          </div>
        </div>
      )}

      {/* Paid transactions */}
      {paidTxs.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <CheckCircle2 className={`w-3.5 h-3.5 text-${accent}`} />
            <h3 className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
              {isReceita ? "Recebidas" : "Pagas"} ({paidTxs.length})
            </h3>
          </div>
          <div className="space-y-1.5">
            {displayPaid.map((tx, i) => (
              <TxRow
                key={tx.id}
                tx={tx}
                isReceita={isReceita}
                customCats={customCats}
                onClick={() => handleTxClick(tx)}
                idx={i}
              />
            ))}
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
            <>Ver todas ({transactions.length}) <ChevronDown className="w-3.5 h-3.5" /></>
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
const TxRow = ({
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

export default ReceitasDespesasDetalhe;
