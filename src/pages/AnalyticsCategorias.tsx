import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, ChevronRight, PieChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMonth } from "@/contexts/MonthContext";
import { getRecurringForMonth } from "@/services/recurringService";
import { getCustomCategories, type CustomCategory } from "@/services/categoryService";
import { getCategoryIcon, getCategoryColor, getCategoryHexColor } from "@/lib/categoryUtils";
import MonthSelector from "@/components/dashboard/MonthSelector";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

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

// ── Category Detail View ────────────────────────────────
const CategoryDetail = ({
  category,
  transactions,
  onBack,
  customCats,
  monthLabel,
}: {
  category: CategorySummary;
  transactions: TxRow[];
  onBack: () => void;
  customCats: CustomCategory[];
  monthLabel: string;
}) => {
  const catTxs = transactions
    .filter((t) => t.category === category.name && t.type === "despesa")
    .sort((a, b) => b.date.localeCompare(a.date));

  const CatIcon = category.icon;

  // Daily pattern
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
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Total gasto", value: fmt(category.amount) },
          { label: "Transações", value: String(category.txCount) },
          { label: "Média/transação", value: fmt(category.avgPerTx) },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border/20 bg-card/60 backdrop-blur-xl p-3 text-center"
            style={{ boxShadow: "0 2px 12px -2px rgba(0,0,0,0.2)" }}
          >
            <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-medium">{s.label}</p>
            <p className="text-sm font-bold text-foreground mt-1 tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Daily Pattern */}
      {dailyEntries.length > 1 && (
        <div
          className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl p-4"
          style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.3)" }}
        >
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
        </div>
      )}

      {/* Transaction list */}
      <div
        className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl overflow-hidden"
        style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.3)" }}
      >
        <div className="px-4 pt-3 pb-2">
          <p className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
            Lançamentos · {catTxs.length}
          </p>
        </div>
        <div className="divide-y divide-border/10">
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
      </div>
    </motion.div>
  );
};

// ── Main Analytics Page ─────────────────────────────────
const AnalyticsCategorias = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedMonth, selectedYear, setMonth } = useMonth();
  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [customCats, setCustomCats] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      const start = new Date(selectedYear, selectedMonth, 1).toISOString().split("T")[0];
      const end = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split("T")[0];

      const [txRes, recurringTxs, cats] = await Promise.all([
        supabase.from("transactions").select("*").eq("user_id", user.id)
          .gte("date", start).lte("date", end).order("date", { ascending: false }),
        getRecurringForMonth(selectedMonth, selectedYear),
        getCustomCategories(),
      ]);

      const baseTxs = (txRes.data ?? []) as TxRow[];
      const materializedRecurring = recurringTxs.map((t: any) => ({
        ...t,
        date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(new Date(t.date).getDate()).padStart(2, "0")}`,
      })) as TxRow[];

      setTransactions([...baseTxs, ...materializedRecurring]);
      setCustomCats(cats);
      setLoading(false);
    };
    fetch();
  }, [user, selectedMonth, selectedYear]);

  const monthLabel = MONTH_NAMES[selectedMonth];

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

  const totalExpenses = useMemo(() => categoryData.reduce((s, c) => s + c.amount, 0), [categoryData]);

  const topCategory = categoryData[0];
  const selectedCatData = categoryData.find((c) => c.name === selectedCategory);

  // Donut chart data
  const chartData = categoryData.map((c) => ({ name: c.name, value: c.amount, fill: c.color }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-primary text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground flex-1">Gastos por Categoria</h1>
        <MonthSelector
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={(m, y) => { setMonth(m, y); setSelectedCategory(null); }}
        />
      </div>

      <AnimatePresence mode="wait">
        {selectedCategory && selectedCatData ? (
          <CategoryDetail
            key={selectedCategory}
            category={selectedCatData}
            transactions={transactions}
            onBack={() => setSelectedCategory(null)}
            customCats={customCats}
            monthLabel={monthLabel}
          />
        ) : (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Donut Chart Card */}
            {categoryData.length > 0 ? (
              <div
                className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl p-4"
                style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.3)" }}
              >
                <p className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider mb-1">
                  Total de Despesas · {monthLabel}
                </p>

                <div className="relative flex items-center justify-center" style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} style={{ cursor: "pointer" }} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0];
                          return (
                            <div className="rounded-lg bg-popover border border-border/30 px-3 py-2 shadow-xl">
                              <p className="text-xs font-bold text-foreground">{d.name}</p>
                              <p className="text-[11px] text-muted-foreground tabular-nums">{fmt(d.value as number)}</p>
                            </div>
                          );
                        }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>

                  {/* Center label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">Total</p>
                    <p className="text-xl font-bold text-foreground tabular-nums">{fmt(totalExpenses)}</p>
                  </div>
                </div>

                {/* Top category highlight */}
                {topCategory && (
                  <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: topCategory.color }}
                    />
                    <span>
                      <span className="font-semibold text-foreground">{topCategory.name}</span>
                      {" "}é a maior categoria · {topCategory.percentage}%
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl p-8 text-center"
                style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.3)" }}
              >
                <PieChart className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground/50">Sem despesas em {monthLabel}</p>
              </div>
            )}

            {/* Category List */}
            {categoryData.length > 0 && (
              <div
                className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl overflow-hidden"
                style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.3)" }}
              >
                <div className="px-4 pt-4 pb-2">
                  <p className="text-[10px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
                    Todas as categorias · {categoryData.length}
                  </p>
                </div>
                <div className="px-4 pb-3 space-y-1">
                  {categoryData.map((cat, i) => {
                    const CatIcon = cat.icon;
                    return (
                      <motion.button
                        key={cat.name}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => setSelectedCategory(cat.name)}
                        className="w-full flex items-center gap-3 py-2.5 rounded-xl hover:bg-muted/20 transition-colors px-2 -mx-2"
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: `${cat.hexColor}18` }}
                        >
                          <CatIcon className="w-4 h-4" style={{ color: cat.hexColor }} />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-foreground truncate">{cat.name}</p>
                            <span className="text-[9px] text-muted-foreground/40">{cat.txCount} lançamentos</span>
                          </div>
                          <div className="w-full h-1.5 bg-border/15 rounded-full mt-1.5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${cat.percentage}%` }}
                              transition={{ delay: 0.1 + i * 0.04, duration: 0.5, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: cat.hexColor }}
                            />
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-foreground tabular-nums">{fmt(cat.amount)}</p>
                          <p className="text-[9px] text-muted-foreground/40">{cat.percentage}%</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalyticsCategorias;
