import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronRight, Sparkles, TrendingUp, TrendingDown,
  AlertTriangle, Target, Brain, PieChart, Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMonth } from "@/contexts/MonthContext";
import { getRecurringForMonth } from "@/services/recurringService";
import { getCustomCategories, type CustomCategory } from "@/services/categoryService";
import { getCategoryIcon, getCategoryColor, getCategoryHexColor } from "@/lib/categoryUtils";
import MonthSelector from "@/components/dashboard/MonthSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
} from "recharts";
import { toast } from "sonner";

// ── Helpers ──────────────────────────────────────────────
const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// ── Types ────────────────────────────────────────────────
interface TxRow {
  id: string; name: string; category: string; date: string;
  amount: number; type: string; status: string;
}

interface CategorySummary {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  hexColor: string;
  icon: React.ComponentType<any>;
  txCount: number;
  avgPerTx: number;
}

interface AIInsights {
  insights: string[];
  alerts: { category: string; message: string; severity: "info" | "warning" | "danger" }[];
  limitSuggestions: { category: string; suggestedLimit: number; message: string }[];
}

// ── Reusable Glass Card ──────────────────────────────────
const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl ${className}`}
    style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.3)" }}
  >
    {children}
  </div>
);

// ── Summary Card ─────────────────────────────────────────
const SummaryCard = ({ totalExpenses, topCategory, monthLabel }: {
  totalExpenses: number; topCategory?: CategorySummary; monthLabel: string;
}) => (
  <GlassCard className="p-4 md:p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">
          Total de Despesas · {monthLabel}
        </p>
        <p className="text-2xl md:text-3xl font-bold text-foreground tabular-nums mt-1">
          {fmt(totalExpenses)}
        </p>
      </div>
      {topCategory && (
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">Maior gasto</p>
          <p className="text-sm font-bold text-foreground mt-1">{topCategory.name}</p>
          <p className="text-xs text-muted-foreground/60">{topCategory.percentage}% do total</p>
        </div>
      )}
    </div>
  </GlassCard>
);

// ── Bar Chart Section ────────────────────────────────────
const CategoryBarChart = ({ categoryData, onSelect, selectedCat }: {
  categoryData: CategorySummary[];
  onSelect: (name: string) => void;
  selectedCat: string | null;
}) => {
  const chartData = categoryData.map((c) => ({
    name: c.name.length > 10 ? c.name.slice(0, 9) + "…" : c.name,
    fullName: c.name,
    value: c.amount,
    fill: c.hexColor,
  }));

  return (
    <GlassCard className="p-4 md:p-5">
      <p className="text-[10px] md:text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-wider mb-3">
        Gastos por Categoria
      </p>
      <div style={{ height: Math.max(categoryData.length * 40, 120) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg bg-popover border border-border/30 px-3 py-2 shadow-xl">
                    <p className="text-xs font-bold text-foreground">{d.fullName}</p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">{fmt(d.value)}</p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="value"
              radius={[0, 6, 6, 0]}
              animationDuration={800}
              cursor="pointer"
              onClick={(data: any) => onSelect(data.fullName)}
            >
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.fill}
                  opacity={selectedCat && selectedCat !== entry.fullName ? 0.25 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

// ── Category List with traffic-light bars ────────────────
const CategoryList = ({ categoryData, onSelect, selectedCat }: {
  categoryData: CategorySummary[];
  onSelect: (name: string) => void;
  selectedCat: string | null;
}) => {
  const getBarColor = (pct: number) => {
    if (pct > 40) return "hsl(var(--destructive))";
    if (pct > 25) return "hsl(var(--warning))";
    return "hsl(var(--success))";
  };

  return (
    <GlassCard className="overflow-hidden">
      <div className="px-4 md:px-5 pt-4 pb-2">
        <p className="text-[10px] md:text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
          Todas as categorias · {categoryData.length}
        </p>
      </div>
      <div className="px-4 md:px-5 pb-3 space-y-1 max-h-[420px] overflow-y-auto">
        {categoryData.map((cat, i) => {
          const CatIcon = cat.icon;
          const isSelected = selectedCat === cat.name;
          const dimmed = selectedCat && !isSelected;
          return (
            <motion.button
              key={cat.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: dimmed ? 0.35 : 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelect(cat.name)}
              className={`w-full flex items-center gap-3 py-2.5 md:py-3 rounded-xl transition-colors px-2 -mx-2 ${
                isSelected ? "bg-muted/30" : "hover:bg-muted/20"
              }`}
            >
              <div
                className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `${cat.hexColor}18` }}
              >
                <CatIcon className="w-4 h-4 md:w-[18px] md:h-[18px]" style={{ color: cat.hexColor }} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <p className="text-xs md:text-sm font-semibold text-foreground truncate">{cat.name}</p>
                  <span className="text-[9px] md:text-[10px] text-muted-foreground/40">{cat.txCount} lançamentos</span>
                </div>
                <div className="w-full h-1.5 bg-border/15 rounded-full mt-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ delay: 0.1 + i * 0.03, duration: 0.5, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: getBarColor(cat.percentage) }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs md:text-sm font-bold text-foreground tabular-nums">{fmt(cat.amount)}</p>
                <p className="text-[9px] md:text-[10px] text-muted-foreground/40">{cat.percentage}%</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30" />
            </motion.button>
          );
        })}
      </div>
    </GlassCard>
  );
};

// ── AI Insights Section ──────────────────────────────────
const AIInsightsSection = ({ insights, loading }: { insights: AIInsights | null; loading: boolean }) => {
  if (loading) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <p className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
            Analisando seus gastos...
          </p>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-muted/30 rounded animate-pulse" style={{ width: `${80 - i * 15}%` }} />
          ))}
        </div>
      </GlassCard>
    );
  }

  if (!insights || insights.insights.length === 0) return null;

  return (
    <GlassCard className="p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-primary" />
        <p className="text-[10px] md:text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
          Insights da IA
        </p>
      </div>
      <div className="space-y-2.5">
        {insights.insights.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-2.5 p-2.5 rounded-xl bg-primary/5 border border-primary/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-foreground/80 leading-relaxed">{msg}</p>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
};

// ── Alerts Section ───────────────────────────────────────
const AlertsSection = ({ alerts }: { alerts: AIInsights["alerts"] }) => {
  if (!alerts || alerts.length === 0) return null;

  const severityConfig = {
    info: { icon: Info, borderColor: "border-blue-500/20", bgColor: "bg-blue-500/5", textColor: "text-blue-400" },
    warning: { icon: AlertTriangle, borderColor: "border-warning/20", bgColor: "bg-warning/5", textColor: "text-warning" },
    danger: { icon: AlertTriangle, borderColor: "border-destructive/20", bgColor: "bg-destructive/5", textColor: "text-destructive" },
  };

  return (
    <GlassCard className="p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-warning" />
        <p className="text-[10px] md:text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
          Alertas de Comportamento
        </p>
      </div>
      <div className="space-y-2">
        {alerts.map((alert, i) => {
          const config = severityConfig[alert.severity];
          const AlertIcon = config.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl ${config.bgColor} border ${config.borderColor}`}
            >
              <AlertIcon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${config.textColor}`} />
              <div>
                <p className="text-[10px] font-semibold text-foreground/70 uppercase">{alert.category}</p>
                <p className="text-xs text-foreground/80 mt-0.5">{alert.message}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
};

// ── Projections Card ─────────────────────────────────────
const ProjectionsCard = ({ totalExpenses }: { totalExpenses: number }) => {
  const annualEstimate = totalExpenses * 12;
  const savingsIfReduce200 = 200 * 12;

  return (
    <GlassCard className="p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-primary" />
        <p className="text-[10px] md:text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
          Projeções Inteligentes
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10">
          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-medium">Gasto anual estimado</p>
          <p className="text-lg font-bold text-destructive tabular-nums mt-1">{fmt(annualEstimate)}</p>
          <p className="text-[9px] text-muted-foreground/40 mt-0.5">Se continuar nesse ritmo</p>
        </div>
        <div className="p-3 rounded-xl bg-success/5 border border-success/10">
          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-medium">Economia possível</p>
          <p className="text-lg font-bold text-success tabular-nums mt-1">{fmt(savingsIfReduce200)}</p>
          <p className="text-[9px] text-muted-foreground/40 mt-0.5">Reduzindo R$ 200/mês</p>
        </div>
      </div>
    </GlassCard>
  );
};

// ── Limit Suggestions ────────────────────────────────────
const LimitSuggestions = ({ suggestions }: { suggestions: AIInsights["limitSuggestions"] }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <GlassCard className="p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-primary" />
        <p className="text-[10px] md:text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
          Sugestões de Limite
        </p>
      </div>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">{s.category}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{s.message}</p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-sm font-bold text-primary tabular-nums">{fmt(s.suggestedLimit)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
};

// ── Category Detail View ─────────────────────────────────
const CategoryDetail = ({
  category, transactions, onBack, monthLabel, isMobile, totalExpenses,
}: {
  category: CategorySummary;
  transactions: TxRow[];
  onBack: () => void;
  monthLabel: string;
  isMobile: boolean;
  totalExpenses: number;
}) => {
  const catTxs = transactions
    .filter((t) => t.category === category.name && t.type === "despesa")
    .sort((a, b) => b.date.localeCompare(a.date));

  const CatIcon = category.icon;
  const annualEstimate = category.amount * 12;
  const savingsIf10PerDay = 10 * 30;

  const dailyMap = new Map<string, number>();
  catTxs.forEach((t) => {
    dailyMap.set(t.date, (dailyMap.get(t.date) ?? 0) + t.amount);
  });
  const dailyEntries = Array.from(dailyMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  const maxDaily = Math.max(...dailyEntries.map(([, v]) => v), 1);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: `${category.hexColor}20` }}
        >
          <CatIcon className="w-5 h-5" style={{ color: category.hexColor }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{category.name}</h2>
          <p className="text-xs text-muted-foreground/60">{monthLabel}</p>
        </div>
      </div>

      {/* Stats */}
      <div className={isMobile ? "space-y-4" : "grid grid-cols-2 gap-4"}>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Total gasto", value: fmt(category.amount) },
            { label: "Transações", value: String(category.txCount) },
            { label: "Média/transação", value: fmt(category.avgPerTx) },
          ].map((s) => (
            <GlassCard key={s.label} className="p-3 text-center">
              <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-medium">{s.label}</p>
              <p className="text-sm font-bold text-foreground mt-1 tabular-nums">{s.value}</p>
            </GlassCard>
          ))}
        </div>

        {dailyEntries.length > 1 && (
          <GlassCard className="p-4">
            <p className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider mb-3">
              Padrão de gastos diários
            </p>
            <div className="flex items-end gap-1 h-20">
              {dailyEntries.map(([date, amount]) => (
                <div
                  key={date}
                  className="flex-1 rounded-t-sm min-w-[4px]"
                  style={{
                    height: `${Math.max((amount / maxDaily) * 100, 8)}%`,
                    backgroundColor: category.hexColor,
                    opacity: 0.7 + (amount / maxDaily) * 0.3,
                  }}
                  title={`${date}: ${fmt(amount)}`}
                />
              ))}
            </div>
          </GlassCard>
        )}
      </div>

      {/* Projections for this category */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-3">
          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-medium">Projeção anual</p>
          <p className="text-base font-bold text-foreground tabular-nums mt-1">{fmt(annualEstimate)}</p>
        </GlassCard>
        <GlassCard className="p-3">
          <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-medium">Economia potencial</p>
          <p className="text-base font-bold text-success tabular-nums mt-1">{fmt(savingsIf10PerDay)}</p>
          <p className="text-[8px] text-muted-foreground/40 mt-0.5">Reduzindo R$ 10/dia</p>
        </GlassCard>
      </div>

      {/* Transaction list */}
      <GlassCard className="overflow-hidden">
        <div className="px-4 pt-3 pb-2">
          <p className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
            Lançamentos · {catTxs.length}
          </p>
        </div>
        <div className={`divide-y divide-border/10 ${!isMobile ? "max-h-[400px] overflow-y-auto" : ""}`}>
          {catTxs.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 px-4 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{tx.name}</p>
                <p className="text-[9px] text-muted-foreground/40 mt-0.5">
                  {new Date(tx.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                </p>
              </div>
              <p className="text-xs font-bold tabular-nums text-destructive">−{fmt(tx.amount)}</p>
            </div>
          ))}
          {catTxs.length === 0 && (
            <p className="text-xs text-muted-foreground/40 text-center py-6">Nenhum lançamento</p>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

// ── Main Page ────────────────────────────────────────────
const AnalyticsCategorias = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { selectedMonth, selectedYear, setMonth } = useMonth();
  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [prevMonthTxs, setPrevMonthTxs] = useState<TxRow[]>([]);
  const [customCats, setCustomCats] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch transactions for current and previous month
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const start = new Date(selectedYear, selectedMonth, 1).toISOString().split("T")[0];
      const end = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split("T")[0];

      // Previous month
      const prevM = selectedMonth === 0 ? 11 : selectedMonth - 1;
      const prevY = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
      const prevStart = new Date(prevY, prevM, 1).toISOString().split("T")[0];
      const prevEnd = new Date(prevY, prevM + 1, 0).toISOString().split("T")[0];

      const [txRes, prevTxRes, recurringTxs, prevRecurring, cats] = await Promise.all([
        supabase.from("transactions").select("*").eq("user_id", user.id)
          .gte("date", start).lte("date", end).order("date", { ascending: false }),
        supabase.from("transactions").select("*").eq("user_id", user.id)
          .gte("date", prevStart).lte("date", prevEnd),
        getRecurringForMonth(selectedMonth, selectedYear),
        getRecurringForMonth(prevM, prevY),
        getCustomCategories(),
      ]);

      const baseTxs = (txRes.data ?? []) as TxRow[];
      const materializedRecurring = recurringTxs.map((t: any) => ({
        ...t,
        date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(new Date(t.date).getDate()).padStart(2, "0")}`,
      })) as TxRow[];

      const prevBaseTxs = (prevTxRes.data ?? []) as TxRow[];
      const prevMaterialized = prevRecurring.map((t: any) => ({
        ...t,
        date: `${prevY}-${String(prevM + 1).padStart(2, "0")}-${String(new Date(t.date).getDate()).padStart(2, "0")}`,
      })) as TxRow[];

      setTransactions([...baseTxs, ...materializedRecurring]);
      setPrevMonthTxs([...prevBaseTxs, ...prevMaterialized]);
      setCustomCats(cats);
      setLoading(false);
    };
    fetchData();
  }, [user, selectedMonth, selectedYear]);

  // Build category data
  const categoryData: CategorySummary[] = useMemo(() => {
    const map = new Map<string, { amount: number; count: number }>();
    transactions.filter((t) => t.type === "despesa").forEach((t) => {
      const existing = map.get(t.category) || { amount: 0, count: 0 };
      map.set(t.category, { amount: existing.amount + t.amount, count: existing.count + 1 });
    });
    const total = Array.from(map.values()).reduce((s, v) => s + v.amount, 0);
    return Array.from(map.entries())
      .sort((a, b) => b[1].amount - a[1].amount)
      .map(([name, { amount, count }]) => ({
        name,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        color: `hsl(${getCategoryColor(name, customCats)})`,
        hexColor: getCategoryHexColor(name, customCats),
        icon: getCategoryIcon(name, customCats),
        txCount: count,
        avgPerTx: count > 0 ? amount / count : 0,
      }));
  }, [transactions, customCats]);

  const prevCategoryData = useMemo(() => {
    const map = new Map<string, { amount: number; count: number }>();
    prevMonthTxs.filter((t) => t.type === "despesa").forEach((t) => {
      const existing = map.get(t.category) || { amount: 0, count: 0 };
      map.set(t.category, { amount: existing.amount + t.amount, count: existing.count + 1 });
    });
    const total = Array.from(map.values()).reduce((s, v) => s + v.amount, 0);
    return Array.from(map.entries()).map(([name, { amount, count }]) => ({
      name,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      txCount: count,
    }));
  }, [prevMonthTxs]);

  const totalExpenses = useMemo(() => categoryData.reduce((s, c) => s + c.amount, 0), [categoryData]);
  const topCategory = categoryData[0];
  const selectedCatData = categoryData.find((c) => c.name === selectedCategory);
  const monthLabel = MONTH_NAMES[selectedMonth];

  // Fetch AI insights
  const fetchInsights = useCallback(async () => {
    if (categoryData.length === 0 || totalExpenses === 0) {
      setAiInsights(null);
      return;
    }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("category-insights", {
        body: {
          categories: categoryData.map((c) => ({
            name: c.name, amount: c.amount, percentage: c.percentage, txCount: c.txCount,
          })),
          totalExpenses,
          monthLabel,
          previousMonthCategories: prevCategoryData,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAiInsights(data as AIInsights);
    } catch (e: any) {
      console.error("AI insights error:", e);
      if (e?.message?.includes("429") || e?.status === 429) {
        toast.error("Limite de requisições excedido. Tente novamente em breve.");
      }
    } finally {
      setAiLoading(false);
    }
  }, [categoryData, totalExpenses, monthLabel, prevCategoryData]);

  useEffect(() => {
    if (!loading && categoryData.length > 0) {
      fetchInsights();
    }
  }, [loading, categoryData.length > 0, selectedMonth, selectedYear]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-primary text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <div className={`pb-28 ${isMobile ? "max-w-lg mx-auto" : "max-w-5xl mx-auto"}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg md:text-xl font-bold text-foreground">Categorias</h1>
          <p className="text-xs text-muted-foreground/50">Veja para onde seu dinheiro está indo 👀</p>
        </div>
        <MonthSelector
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={(m, y) => { setMonth(m, y); setSelectedCategory(null); setAiInsights(null); }}
        />
      </div>

      <AnimatePresence mode="wait">
        {selectedCategory && selectedCatData ? (
          <CategoryDetail
            key={selectedCategory}
            category={selectedCatData}
            transactions={transactions}
            onBack={() => setSelectedCategory(null)}
            monthLabel={monthLabel}
            isMobile={isMobile}
            totalExpenses={totalExpenses}
          />
        ) : (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {categoryData.length > 0 ? (
              <>
                {/* Summary */}
                <SummaryCard totalExpenses={totalExpenses} topCategory={topCategory} monthLabel={monthLabel} />

                {/* Chart + List */}
                <div className={isMobile ? "space-y-4" : "grid grid-cols-2 gap-4 items-start"}>
                  <CategoryBarChart
                    categoryData={categoryData}
                    onSelect={setSelectedCategory}
                    selectedCat={null}
                  />
                  <CategoryList
                    categoryData={categoryData}
                    onSelect={setSelectedCategory}
                    selectedCat={null}
                  />
                </div>

                {/* AI Insights */}
                <AIInsightsSection insights={aiInsights} loading={aiLoading} />

                {/* Alerts */}
                {aiInsights && <AlertsSection alerts={aiInsights.alerts} />}

                {/* Projections */}
                <ProjectionsCard totalExpenses={totalExpenses} />

                {/* Limit Suggestions */}
                {aiInsights && <LimitSuggestions suggestions={aiInsights.limitSuggestions} />}
              </>
            ) : (
              <GlassCard className="p-8 text-center">
                <PieChart className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground/50">Sem despesas em {monthLabel}</p>
              </GlassCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalyticsCategorias;
