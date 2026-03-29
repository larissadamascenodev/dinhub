import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Wallet, Sparkles, BarChart3, CalendarDays, CircleDot,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMonth } from "@/contexts/MonthContext";
import { getMonthHistory } from "@/lib/financeEngine";
import { getRecurringForMonth } from "@/services/recurringService";

// ── Helpers ────────────────────────────────
const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const WEEKDAYS_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

const CATEGORY_COLORS = [
  "hsl(270 60% 55%)", "hsl(240 60% 60%)", "hsl(300 50% 55%)",
  "hsl(210 70% 55%)", "hsl(330 60% 55%)", "hsl(190 70% 50%)",
];

type AnalyticsTab = "overview" | "categories" | "daily" | "payments";

interface TransactionRow {
  id: string; name: string; category: string; date: string;
  amount: number; type: string; status: string;
  account_id: string | null;
}

// ── Sub-tabs ────────────────────────────────
const SUB_TABS: { key: AnalyticsTab; label: string; icon: typeof BarChart3 }[] = [
  { key: "overview", label: "Visão Geral", icon: BarChart3 },
  { key: "categories", label: "Categorias", icon: CircleDot },
  { key: "daily", label: "Diário", icon: CalendarDays },
  { key: "payments", label: "Pagamentos", icon: Wallet },
];

// ── Glass Card ────────────────────────────
const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl p-4 ${className}`}
    style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.3)" }}
  >
    {children}
  </div>
);

// ── Custom Tooltip ────────────────────────
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

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
const TransacoesAnalytics = () => {
  const { user } = useAuth();
  const { selectedMonth, selectedYear } = useMonth();
  const [subTab, setSubTab] = useState<AnalyticsTab>("overview");
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [evolutionData, setEvolutionData] = useState<{ month: string; receitas: number; despesas: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch transactions for the selected month
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

  // Fetch 6-month evolution
  useEffect(() => {
    if (!user) return;
    const fetchEvolution = async () => {
      const data: { month: string; receitas: number; despesas: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(selectedYear, selectedMonth - i, 1);
        const m = d.getMonth();
        const y = d.getFullYear();
        try {
          const h = await getMonthHistory(m, y);
          data.push({ month: MONTHS_SHORT[m], receitas: h.income, despesas: h.expense });
        } catch {
          data.push({ month: MONTHS_SHORT[m], receitas: 0, despesas: 0 });
        }
      }
      setEvolutionData(data);
    };
    fetchEvolution();
  }, [user, selectedMonth, selectedYear]);

  // Computed values
  const totals = useMemo(() => {
    const receitas = transactions.filter(t => t.type === "receita").reduce((s, t) => s + t.amount, 0);
    const despesas = transactions.filter(t => t.type === "despesa").reduce((s, t) => s + t.amount, 0);
    const receitasRecebidas = transactions.filter(t => t.type === "receita" && t.status === "pago").reduce((s, t) => s + t.amount, 0);
    const despesasPagas = transactions.filter(t => t.type === "despesa" && t.status === "pago").reduce((s, t) => s + t.amount, 0);
    return {
      receitas, despesas, receitasRecebidas, despesasPagas,
      receitasPendentes: receitas - receitasRecebidas,
      despesasPendentes: despesas - despesasPagas,
      saldoAtual: receitasRecebidas - despesasPagas,
      saldoProjetado: receitas - despesas,
    };
  }, [transactions]);

  const topDespesas = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter(t => t.type === "despesa").forEach(t => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [transactions]);

  const topReceitas = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter(t => t.type === "receita").forEach(t => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
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

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter(t => t.type === "despesa").forEach(t => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
    const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
    return Array.from(map.entries()).map(([name, amount], i) => ({
      name, amount, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      percentage: total > 0 ? ((amount / total) * 100).toFixed(0) : "0",
    }));
  }, [transactions]);

  // Heatmap calendar
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

  const pendingCount = transactions.filter(t => t.status === "pendente").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-pulse text-primary text-sm">Carregando analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {SUB_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = subTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSubTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "text-muted-foreground/50 border border-border/20 hover:border-border/40"
              }`}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {subTab === "overview" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {/* 6-month Evolution */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Evolução 6 Meses</h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolutionData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="receitasGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(150 100% 45%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(150 100% 45%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="despesasGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(0 60% 50%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(0 60% 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 10% 20%)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(220 10% 45%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(220 10% 45%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="receitas" name="Receitas" stroke="hsl(150 100% 45%)" fill="url(#receitasGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="despesas" name="Despesas" stroke="hsl(0 60% 50%)" fill="url(#despesasGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Receitas + Despesas summary */}
          <div className="grid grid-cols-2 gap-3">
            <GlassCard>
              <div className="flex items-center gap-1 mb-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Receitas</span>
              </div>
              <p className="text-lg font-bold text-primary tabular-nums">{fmt(totals.receitas)}</p>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-1 mb-1">
                <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Despesas</span>
              </div>
              <p className="text-lg font-bold text-destructive tabular-nums">{fmt(totals.despesas)}</p>
            </GlassCard>
          </div>

          {/* Saldo Atual + Saldo Projetado */}
          <div className="grid grid-cols-2 gap-3">
            <GlassCard>
              <div className="flex items-center gap-1 mb-1">
                <Wallet className="w-3.5 h-3.5 text-primary" />
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Saldo Atual</span>
              </div>
              <p className="text-lg font-bold text-foreground tabular-nums">{fmt(totals.saldoAtual)}</p>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Saldo Projetado</span>
              </div>
              <p className="text-lg font-bold text-foreground tabular-nums">{fmt(totals.saldoProjetado)}</p>
              <p className="text-[9px] text-muted-foreground/50 mt-0.5">{pendingCount} transações pendentes</p>
            </GlassCard>
          </div>

          {/* Top Despesas + Top Receitas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <GlassCard>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
                  <h3 className="text-sm font-bold text-foreground">Top Despesas</h3>
                </div>
                <span className="text-[10px] text-primary cursor-pointer hover:underline">Ver todas →</span>
              </div>
              {topDespesas.length === 0 ? (
                <p className="text-xs text-muted-foreground/40 text-center py-4">Sem despesas</p>
              ) : (
                <div className="space-y-2.5">
                  {topDespesas.map(([cat, amount], i) => {
                    const total = totals.despesas || 1;
                    const pct = ((amount / total) * 100).toFixed(0);
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: `${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}20` }}>
                          <span style={{ color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}>●</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{cat}</p>
                          <div className="w-full h-1 bg-border/20 rounded-full mt-1 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-foreground tabular-nums">{fmt(amount)}</p>
                          <p className="text-[9px] text-muted-foreground/50">{pct}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
            <GlassCard>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Top Receitas</h3>
                </div>
                <span className="text-[10px] text-primary cursor-pointer hover:underline">Ver todas →</span>
              </div>
              {topReceitas.length === 0 ? (
                <p className="text-xs text-muted-foreground/40 text-center py-4">Sem receitas</p>
              ) : (
                <div className="space-y-2.5">
                  {topReceitas.map(([cat, amount], i) => {
                    const total = totals.receitas || 1;
                    const pct = ((amount / total) * 100).toFixed(0);
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: "hsl(150 100% 45% / 0.12)" }}>
                          <span className="text-primary">●</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{cat}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-primary tabular-nums">{fmt(amount)}</p>
                          <p className="text-[9px] text-muted-foreground/50">{pct}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </div>
        </motion.div>
      )}

      {/* ═══ CATEGORIES ═══ */}
      {subTab === "categories" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <CategoriesView data={categoryData} total={totals.despesas} />
        </motion.div>
      )}

      {/* ═══ DAILY ═══ */}
      {subTab === "daily" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {/* Daily bar chart */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                Gastos Diários — {MONTHS_SHORT[selectedMonth]} {selectedYear}
              </h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 10% 20%)" />
                  <XAxis dataKey="day" tick={{ fill: "hsl(220 10% 45%)", fontSize: 9 }} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={{ fill: "hsl(220 10% 45%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="despesas" name="Despesas" fill="hsl(0 60% 50%)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="receitas" name="Receitas" fill="hsl(150 100% 45%)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Heatmap calendar */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Mapa de Gastos</h3>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS_SHORT.map((d, i) => (
                <div key={i} className="text-center text-[10px] text-muted-foreground/50 font-semibold py-1">{d}</div>
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
                    className={`aspect-square rounded-lg flex items-center justify-center relative text-[11px] font-medium transition-all ${
                      isToday ? "ring-1 ring-primary" : ""
                    }`}
                    style={{
                      background: cell.intensity > 0
                        ? `hsl(340 60% ${55 - cell.intensity * 25}% / ${0.2 + cell.intensity * 0.5})`
                        : "hsl(220 15% 15% / 0.3)",
                      color: cell.intensity > 0.5 ? "hsl(0 0% 90%)" : "hsl(220 10% 55%)",
                    }}
                  >
                    {cell.day}
                    {cell.hasReceipt && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(340 60% 50% / 0.3)" }} />
                <span className="text-[9px] text-muted-foreground/50">Pouco gasto</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ background: "hsl(340 60% 40% / 0.7)" }} />
                <span className="text-[9px] text-muted-foreground/50">Muito gasto</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[9px] text-muted-foreground/50">Receita</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ═══ PAYMENTS ═══ */}
      {subTab === "payments" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <GlassCard>
            <h3 className="text-sm font-bold text-foreground mb-3">Resumo de Pagamentos</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-primary/[0.06] border border-primary/15 p-3">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Recebido</p>
                <p className="text-base font-bold text-primary tabular-nums">{fmt(totals.receitasRecebidas)}</p>
              </div>
              <div className="rounded-xl bg-primary/[0.06] border border-primary/15 p-3">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">A Receber</p>
                <p className="text-base font-bold text-muted-foreground tabular-nums">{fmt(totals.receitasPendentes)}</p>
              </div>
              <div className="rounded-xl bg-destructive/[0.06] border border-destructive/15 p-3">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Pago</p>
                <p className="text-base font-bold text-destructive tabular-nums">{fmt(totals.despesasPagas)}</p>
              </div>
              <div className="rounded-xl bg-destructive/[0.06] border border-destructive/15 p-3">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">A Pagar</p>
                <p className="text-base font-bold text-muted-foreground tabular-nums">{fmt(totals.despesasPendentes)}</p>
              </div>
            </div>
          </GlassCard>

          {/* Pending transactions list */}
          <GlassCard>
            <h3 className="text-sm font-bold text-foreground mb-3">Transações Pendentes</h3>
            {transactions.filter(t => t.status === "pendente").length === 0 ? (
              <p className="text-xs text-muted-foreground/40 text-center py-4">Tudo em dia! 🎉</p>
            ) : (
              <div className="space-y-2">
                {transactions.filter(t => t.status === "pendente").slice(0, 10).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{tx.name}</p>
                      <p className="text-[9px] text-muted-foreground/50">{tx.category} · {new Date(tx.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}</p>
                    </div>
                    <p className={`text-xs font-bold tabular-nums ${tx.type === "receita" ? "text-primary" : "text-destructive"}`}>
                      {fmt(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

// ── Categories Donut View ──────────────────
const CategoriesView = ({ data, total }: { data: { name: string; amount: number; color: string; percentage: string }[]; total: number }) => {
  const [filter, setFilter] = useState<"despesa" | "receita" | "todos">("despesa");

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["despesa", "receita", "todos"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === f
                ? f === "despesa" ? "bg-destructive/15 text-destructive border border-destructive/30"
                  : f === "receita" ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-accent text-foreground border border-border/30"
                : "text-muted-foreground/50 border border-border/20"
            }`}
          >
            {f === "despesa" ? "Despesas" : f === "receita" ? "Receitas" : "Todos"}
          </button>
        ))}
      </div>

      <GlassCard>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-6 items-center">
          {/* Donut */}
          <div className="h-52 flex items-center justify-center">
            {data.length === 0 ? (
              <p className="text-xs text-muted-foreground/40">Sem dados</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius="55%"
                    outerRadius="85%"
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {data.map((cat, i) => (
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
        </div>
      </GlassCard>
    </div>
  );
};

export default TransacoesAnalytics;
