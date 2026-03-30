import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight, ArrowDownRight,
  CalendarDays, ChevronDown,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMonth } from "@/contexts/MonthContext";
import { getMonthHistory } from "@/lib/financeEngine";
import { getRecurringForMonth } from "@/services/recurringService";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const WEEKDAYS_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

const CATEGORY_COLORS = [
  "hsl(270 60% 55%)", "hsl(240 60% 60%)", "hsl(300 50% 55%)",
  "hsl(210 70% 55%)", "hsl(330 60% 55%)", "hsl(190 70% 50%)",
];

interface TransactionRow {
  id: string; name: string; category: string; date: string;
  amount: number; type: string; status: string;
  account_id: string | null;
}

const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl p-4 ${className}`}
    style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.3)" }}
  >
    {children}
  </div>
);

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-card/95 backdrop-blur-xl border border-border/30 px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="tabular-nums">
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

const TransacoesAnalytics = () => {
  const { user } = useAuth();
  const { selectedMonth, selectedYear } = useMonth();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [evolutionData, setEvolutionData] = useState<{ month: string; receitas: number; despesas: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyExpanded, setDailyExpanded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchTxs = async () => {
      setLoading(true);
      const start = new Date(selectedYear, selectedMonth, 1).toISOString().split("T")[0];
      const end = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split("T")[0];

      const [txRes, recurringTxs] = await Promise.all([
        supabase.from("transactions").select("*").eq("user_id", user.id).gte("date", start).lte("date", end).order("date", { ascending: false }),
        getRecurringForMonth(selectedMonth, selectedYear),
      ]);

      const baseTxs = (txRes.data ?? []) as TransactionRow[];
      const materializedRecurring = recurringTxs.map((t: any) => ({
        ...t,
        date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(new Date(t.date).getDate()).padStart(2, "0")}`,
      })) as TransactionRow[];

      setTransactions([...baseTxs, ...materializedRecurring]);
      setLoading(false);
    };
    fetchTxs();
  }, [user, selectedMonth, selectedYear]);


  const totals = useMemo(() => {
    const receitas = transactions.filter(t => t.type === "receita").reduce((s, t) => s + t.amount, 0);
    const despesas = transactions.filter(t => t.type === "despesa").reduce((s, t) => s + t.amount, 0);
    const receitasRecebidas = transactions.filter(t => t.type === "receita" && t.status === "pago").reduce((s, t) => s + t.amount, 0);
    const despesasPagas = transactions.filter(t => t.type === "despesa" && t.status === "pago").reduce((s, t) => s + t.amount, 0);
    return {
      receitas, despesas, receitasRecebidas, despesasPagas,
      receitasPendentes: receitas - receitasRecebidas,
      despesasPendentes: despesas - despesasPagas,
    };
  }, [transactions]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter(t => t.type === "despesa").forEach(t => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount], i) => ({
        name, amount, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        percentage: total > 0 ? ((amount / total) * 100).toFixed(0) : "0",
      }));
  }, [transactions]);

  const dailyData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const result: { day: number; despesas: number; receitas: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayTxs = transactions.filter(t => t.date === dateStr);
      result.push({
        day: d,
        despesas: dayTxs.filter(t => t.type === "despesa").reduce((s, t) => s + t.amount, 0),
        receitas: dayTxs.filter(t => t.type === "receita").reduce((s, t) => s + t.amount, 0),
      });
    }
    return result;
  }, [transactions, selectedMonth, selectedYear]);

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const dayMap = new Map<number, number>();
    const receiptDays = new Set<number>();
    transactions.forEach(t => {
      const d = parseInt(t.date.split("-")[2]);
      if (t.type === "despesa") dayMap.set(d, (dayMap.get(d) ?? 0) + t.amount);
      if (t.type === "receita") receiptDays.add(d);
    });
    const maxExpense = Math.max(...Array.from(dayMap.values()), 1);
    const cells: { day: number; expense: number; intensity: number; hasReceipt: boolean; isEmpty: boolean }[] = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: 0, expense: 0, intensity: 0, hasReceipt: false, isEmpty: true });
    for (let d = 1; d <= daysInMonth; d++) {
      const exp = dayMap.get(d) ?? 0;
      cells.push({ day: d, expense: exp, intensity: exp / maxExpense, hasReceipt: receiptDays.has(d), isEmpty: false });
    }
    return cells;
  }, [transactions, selectedMonth, selectedYear]);

  const currentWeekDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - currentDay);

    const days: { day: number; inMonth: boolean; despesas: number; receitas: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const inMonth = d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      const dayNum = d.getDate();
      const dayData = dailyData.find(dd => dd.day === dayNum);
      days.push({
        day: dayNum,
        inMonth,
        despesas: inMonth && dayData ? dayData.despesas : 0,
        receitas: inMonth && dayData ? dayData.receitas : 0,
      });
    }
    return days;
  }, [dailyData, selectedMonth, selectedYear]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-pulse text-primary text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      {/* Resumo Receitas & Despesas */}
      <div className="grid grid-cols-2 gap-2">
        {/* Receitas */}
        <GlassCard className="!p-3 border-primary/15 bg-primary/[0.04]">
          <div className="flex items-center gap-1.5 mb-2">
            <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Receitas</span>
          </div>
          <p className="text-base font-bold text-primary tabular-nums leading-none mb-2">{fmt(totals.receitas)}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-muted-foreground/60">Recebido</span>
              <span className="text-[10px] font-semibold text-primary/80 tabular-nums">{fmt(totals.receitasRecebidas)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-muted-foreground/60">Pendente</span>
              <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">{fmt(totals.receitasPendentes)}</span>
            </div>
          </div>
        </GlassCard>

        {/* Despesas */}
        <GlassCard className="!p-3 border-destructive/15 bg-destructive/[0.04]">
          <div className="flex items-center gap-1.5 mb-2">
            <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Despesas</span>
          </div>
          <p className="text-base font-bold text-destructive tabular-nums leading-none mb-2">{fmt(totals.despesas)}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-muted-foreground/60">Pago</span>
              <span className="text-[10px] font-semibold text-destructive/80 tabular-nums">{fmt(totals.despesasPagas)}</span>
            </div>
            {totals.despesasPendentes > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-muted-foreground/60">Pendente</span>
                <span className="text-[10px] font-semibold text-muted-foreground tabular-nums">{fmt(totals.despesasPendentes)}</span>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Gastos por Categoria */}
      {categoryData.length > 0 && (
        <GlassCard>
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Gastos por Categoria</h3>
          <div className="space-y-2.5">
            {categoryData.slice(0, 6).map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{cat.name}</p>
                  <div className="w-full h-1 bg-border/20 rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${cat.percentage}%`, background: cat.color }} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-foreground tabular-nums">{fmt(cat.amount)}</p>
                  <p className="text-[9px] text-muted-foreground/50">{cat.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Gastos Diários - Collapsible */}
      <GlassCard className="!p-0 overflow-hidden">
        <button
          onClick={() => setDailyExpanded(!dailyExpanded)}
          className="w-full flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Gastos Diários</h3>
          </div>
          <motion.div
            animate={{ rotate: dailyExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </button>

        {/* Collapsed: current week mini bars */}
        {!dailyExpanded && (
          <div className="px-4 pb-4">
            <div className="flex gap-1.5">
              {currentWeekDays.map((wd, i) => {
                const today = new Date();
                const isToday = wd.day === today.getDate() && wd.inMonth;
                const maxVal = Math.max(...currentWeekDays.map(d => d.despesas + d.receitas), 1);
                const barH = wd.inMonth ? Math.max(((wd.despesas + wd.receitas) / maxVal) * 32, 4) : 4;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="h-8 w-full flex items-end justify-center gap-[2px]">
                      {wd.despesas > 0 && (
                        <div
                          className="w-[45%] rounded-t-sm"
                          style={{
                            height: `${Math.max((wd.despesas / maxVal) * 32, 3)}px`,
                            background: "hsl(0 60% 50% / 0.5)",
                          }}
                        />
                      )}
                      {wd.receitas > 0 && (
                        <div
                          className="w-[45%] rounded-t-sm"
                          style={{
                            height: `${Math.max((wd.receitas / maxVal) * 32, 3)}px`,
                            background: "hsl(150 100% 45% / 0.5)",
                          }}
                        />
                      )}
                      {wd.despesas === 0 && wd.receitas === 0 && (
                        <div
                          className="w-full rounded-t-sm"
                          style={{ height: "4px", background: "hsl(220 10% 25% / 0.3)" }}
                        />
                      )}
                    </div>
                    <span className={`text-[9px] font-medium ${isToday ? "text-primary font-bold" : "text-muted-foreground/50"}`}>
                      {WEEKDAYS_SHORT[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expanded: bar chart + heatmap calendar */}
        <AnimatePresence>
          {dailyExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4">
                {/* Bar chart - receitas & despesas side by side */}
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={1} barSize={6}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 10% 20%)" />
                      <XAxis dataKey="day" tick={{ fill: "hsl(220 10% 45%)", fontSize: 8 }} axisLine={false} tickLine={false} interval={2} />
                      <YAxis tick={{ fill: "hsl(220 10% 45%)", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="despesas" name="Despesas" fill="hsl(0 60% 50%)" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="receitas" name="Receitas" fill="hsl(150 100% 45%)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Mini Calendar Heatmap */}
                <div>
                  <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Mapa de Gastos</h4>
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {WEEKDAYS_SHORT.map((d, i) => (
                      <div key={i} className="text-center text-[9px] text-muted-foreground/50 font-semibold py-0.5">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((cell, i) => {
                      if (cell.isEmpty) return <div key={`e-${i}`} className="aspect-square" />;
                      const today = new Date();
                      const isToday = cell.day === today.getDate() && selectedMonth === today.getMonth() && selectedYear === today.getFullYear();
                      return (
                        <div
                          key={cell.day}
                          className={`aspect-square rounded-md flex items-center justify-center relative text-[10px] font-medium transition-all ${isToday ? "ring-1 ring-primary" : ""}`}
                          style={{
                            background: cell.intensity > 0
                              ? `hsl(340 60% ${55 - cell.intensity * 25}% / ${0.2 + cell.intensity * 0.5})`
                              : "hsl(220 15% 15% / 0.3)",
                            color: cell.intensity > 0.5 ? "hsl(0 0% 90%)" : "hsl(220 10% 55%)",
                          }}
                        >
                          {cell.day}
                          {cell.hasReceipt && (
                            <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-primary" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "hsl(340 60% 50% / 0.3)" }} />
                      <span className="text-[8px] text-muted-foreground/50">Pouco</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "hsl(340 60% 40% / 0.7)" }} />
                      <span className="text-[8px] text-muted-foreground/50">Muito</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-[8px] text-muted-foreground/50">Receita</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Evolução Mensal */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Evolução Mensal</h3>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={evolutionData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={2} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 10% 20%)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(220 10% 45%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(220 10% 45%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="receitas" name="Receitas" fill="hsl(150 100% 45% / 0.7)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="despesas" name="Despesas" fill="hsl(0 60% 50% / 0.7)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default TransacoesAnalytics;
