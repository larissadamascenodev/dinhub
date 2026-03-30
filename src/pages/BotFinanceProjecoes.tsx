import { useState, useMemo, useCallback } from "react";
import type { MonthProjection } from "@/services/projection";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Brain,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Target,
  Scissors,
  Settings2,
  ShieldCheck,
  Banknote,
  CalendarDays,
  Plus,
  Equal,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useFinancialProjection } from "@/hooks/useFinancialProjection";
import { useFormattedCounter } from "@/hooks/useAnimatedCounter";

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const fmtCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtCompact = (v: number) => {
  if (Math.abs(v) >= 1000) return `R$ ${(v / 1000).toFixed(1)}k`;
  return fmtCurrency(v);
};

// ─── Shared UI ───

const GlassSection = ({
  children,
  delay = 0,
  className = "",
  ...rest
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  [key: string]: unknown;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35, ease: "easeOut" }}
    className={`glass-card p-4 space-y-3 ${className}`}
    {...rest}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-2">
    {icon}
    <h2 className="text-sm font-semibold font-display">{title}</h2>
  </div>
);

const TrendIcon = ({ delta }: { delta: number }) => {
  if (delta > 500) return <ArrowUpRight className="w-3.5 h-3.5 text-accent-foreground" />;
  if (delta > 0) return <TrendingUp className="w-3.5 h-3.5 text-accent-foreground" />;
  if (delta === 0) return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  if (delta > -500) return <TrendingDown className="w-3.5 h-3.5 text-destructive" />;
  return <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />;
};

const riskStyle = (risk: string) => {
  if (risk === "positivo") return { dot: "bg-accent", text: "text-foreground", glow: "group-hover:shadow-[0_0_8px_hsl(var(--accent)/0.4)]" };
  if (risk === "atencao") return { dot: "bg-warning", text: "text-warning", glow: "group-hover:shadow-[0_0_8px_hsl(var(--warning)/0.4)]" };
  return { dot: "bg-destructive", text: "text-destructive", glow: "group-hover:shadow-[0_0_8px_hsl(var(--destructive)/0.4)]" };
};

const getMonthMicroCopy = (p: { delta: number; balance: number; variation: number; risk: string; month: number }, i: number, saldoAtual: number): string | null => {
  if (i === 0) return null;
  const seed = p.month;
  if (p.balance < 0) return ["🚨 Aqui complica de vez", "🚨 Saldo negativo — hora de reagir"][seed % 2];
  if (p.variation < -500) return ["Aqui começou a pesar um pouco 😬", "Essa queda merece atenção 👀", "Opa, caiu bastante aqui"][seed % 3];
  if (p.delta < 0 && p.balance < saldoAtual * 0.5) return ["⚠️ Aqui começa a apertar um pouco", "Cuidado, tá afinando 👀"][seed % 2];
  if (p.delta > 0 && p.risk === "positivo" && p.variation > 200) return ["Tá indo bem demais 🔥", "Mês forte esse 💪", "Segue o jogo, campeão 😎"][seed % 3];
  if (p.delta > 0) return ["No caminho certo ✨", "Firme e forte"][seed % 2];
  return null;
};

const deltaColor = (d: number) => (d >= 0 ? "text-foreground" : "text-destructive");

// ─── Custom Chart Tooltip ───

const ChartTooltipContent = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-popover border border-border/40 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${val >= 0 ? "text-foreground" : "text-destructive"}`}>
        {fmtCurrency(val)}
      </p>
    </div>
  );
};

// ─── Custom Active Dot ───

const GlowDot = (props: any) => {
  const { cx, cy, value } = props;
  const isNeg = value < 0;
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill={isNeg ? "hsl(0 60% 50%)" : "hsl(150 100% 45%)"} opacity={0.15} />
      <circle cx={cx} cy={cy} r={4} fill={isNeg ? "hsl(0 60% 50%)" : "hsl(150 100% 45%)"} stroke="hsl(220 20% 5%)" strokeWidth={2} />
    </g>
  );
};

// ─── Composition Block ───

const CompositionBlock = ({ prev, income, expense, final: finalVal }: { prev: number; income: number; expense: number; final: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="flex items-center gap-1.5 flex-wrap justify-center py-2"
  >
    <div className="bg-secondary/50 rounded-lg px-2.5 py-1.5 text-center min-w-[70px]">
      <p className="text-[8px] text-muted-foreground">Saldo anterior</p>
      <p className="text-[11px] font-bold tabular-nums text-foreground">{fmtCompact(prev)}</p>
    </div>
    <Plus className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
    <div className="bg-secondary/50 rounded-lg px-2.5 py-1.5 text-center min-w-[70px]">
      <p className="text-[8px] text-muted-foreground">Receitas</p>
      <p className="text-[11px] font-bold tabular-nums text-foreground">{fmtCompact(income)}</p>
    </div>
    <Minus className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
    <div className="bg-secondary/50 rounded-lg px-2.5 py-1.5 text-center min-w-[70px]">
      <p className="text-[8px] text-muted-foreground">Despesas</p>
      <p className="text-[11px] font-bold tabular-nums text-destructive">{fmtCompact(expense)}</p>
    </div>
    <Equal className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
    <div className={`rounded-lg px-2.5 py-1.5 text-center min-w-[70px] ${finalVal >= 0 ? "bg-accent/10" : "bg-destructive/10"}`}>
      <p className="text-[8px] text-muted-foreground">Saldo final</p>
      <p className={`text-[11px] font-bold tabular-nums ${finalVal >= 0 ? "text-foreground" : "text-destructive"}`}>{fmtCompact(finalVal)}</p>
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════

const BotFinanceProjecoes = () => {
  const navigate = useNavigate();
  const {
    projections,
    dailyLimit,
    simulation,
    insight,
    savingsBoost,
    setSavingsBoost,
    incomeBoost,
    setIncomeBoost,
    savingsGoal,
    setSavingsGoal,
    resetSimulation,
    data,
    loading,
  } = useFinancialProjection();

  const [showGoalInput, setShowGoalInput] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const [timelineMode, setTimelineMode] = useState<"mensal" | "acumulado">("acumulado");
  const formattedSafe = useFormattedCounter(dailyLimit.safeToSpend);

  // Enriched projections with variation, micro-copy, prev balance
  const projectionsWithVariation = useMemo(() => {
    return projections.map((p, i) => {
      const prev = i > 0 ? projections[i - 1] : null;
      const variation = prev ? p.balance - prev.balance : 0;
      const variationPct = prev && prev.balance !== 0 ? ((p.balance - prev.balance) / Math.abs(prev.balance)) * 100 : 0;
      const microCopy = getMonthMicroCopy({ ...p, variation }, i, data.saldoAtual);
      const prevBalance = prev ? prev.balance : data.previousMonthEndingBalance;

      let alert: string | null = null;
      if (i > 0 && p.balance < prev!.balance && p.balance < data.saldoAtual * 0.5) {
        alert = "⚠️ Aqui começa a apertar um pouco";
      } else if (p.balance < 0) {
        alert = "🚨 Saldo negativo previsto";
      } else if (i > 0 && variation < -500) {
        alert = "⚠️ Queda significativa de saldo";
      }

      return { ...p, variation, variationPct, alert, microCopy, prevBalance };
    });
  }, [projections, data.saldoAtual, data.previousMonthEndingBalance]);

  // Chart data
  const chartData = useMemo(() => {
    return projectionsWithVariation.map((p) => ({
      name: `${MONTH_NAMES[p.month]} ${p.year}`,
      value: timelineMode === "acumulado" ? p.balance : p.delta,
      balance: p.balance,
      delta: p.delta,
    }));
  }, [projectionsWithVariation, timelineMode]);

  // Determine chart gradient color based on trend
  const chartTrend = useMemo(() => {
    const last = projectionsWithVariation[projectionsWithVariation.length - 1];
    const first = projectionsWithVariation[0];
    if (!last || !first) return "neutral";
    if (last.balance > first.balance * 1.05) return "positive";
    if (last.balance < first.balance * 0.95) return "negative";
    return "neutral";
  }, [projectionsWithVariation]);

  const chartColors = {
    positive: { stroke: "hsl(150, 100%, 45%)", fill: "hsl(150, 100%, 45%)" },
    neutral: { stroke: "hsl(199, 70%, 48%)", fill: "hsl(199, 70%, 48%)" },
    negative: { stroke: "hsl(0, 60%, 50%)", fill: "hsl(0, 60%, 50%)" },
  };
  const cc = chartColors[chartTrend];

  const toneMap = {
    positive: { bar: "bg-accent", text: "text-foreground", badge: "bg-secondary text-foreground" },
    neutral: { bar: "bg-warning", text: "text-warning", badge: "bg-warning/10 text-warning" },
    negative: { bar: "bg-destructive", text: "text-destructive", badge: "bg-destructive/10 text-destructive" },
  };
  const lt = toneMap[dailyLimit.tone];

  const potentialSavings = useMemo(() => {
    const avgExpense = data.projection.avgExpense3m || data.despesas;
    const tenPct = avgExpense * 0.1;
    return { monthly: tenPct, sixMonth: tenPct * 6 };
  }, [data]);

  const hasSimulation = simulation.hasSimulation;

  const handleChartClick = useCallback((state: any) => {
    if (state?.activeTooltipIndex !== undefined) {
      const idx = state.activeTooltipIndex;
      setExpandedMonth(expandedMonth === idx ? null : idx);
    }
  }, [expandedMonth]);

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="space-y-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-secondary animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-5 w-40 bg-secondary rounded animate-pulse" />
            <div className="h-3 w-56 bg-secondary/60 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="glass-card p-4 space-y-3">
            <div className="h-4 w-32 bg-secondary rounded animate-pulse" />
            <div className="h-48 w-full bg-secondary/30 rounded-xl animate-pulse" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-secondary/20 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Empty State ───
  if (!data.transactions.length && !data.events.length) {
    return (
      <div className="space-y-4 pb-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <button onClick={() => navigate("/bot-finance")} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="font-display text-lg font-bold">Projeções Inteligentes</h1>
        </motion.div>
        <GlassSection delay={0.1} className="text-center py-10">
          <CalendarDays className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-foreground font-medium">Você ainda não tem dados suficientes</p>
          <p className="text-xs text-muted-foreground mt-1">Adicione transações para ver suas projeções</p>
          <button
            onClick={() => navigate("/transacoes")}
            className="mt-4 text-xs font-medium px-5 py-2.5 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 active:scale-[0.97] transition-all"
          >
            Adicionar transações
          </button>
        </GlassSection>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button
          onClick={() => navigate("/bot-finance")}
          className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div>
          <h1 className="font-display text-lg font-bold">Projeções Inteligentes</h1>
          <p className="text-[11px] text-muted-foreground">Evolução do saldo nos próximos 6 meses</p>
        </div>
      </motion.div>

      <div className="space-y-4 max-w-3xl mx-auto">

        {/* ══════════════════════════════════════════ */}
        {/* 1. GRÁFICO DE EVOLUÇÃO + TIMELINE         */}
        {/* ══════════════════════════════════════════ */}
        <GlassSection delay={0.05}>
          <div className="flex items-center justify-between">
            <SectionHeader icon={<CalendarDays className="w-4 h-4 text-foreground" />} title="Timeline de Saldo" />
            <div className="flex bg-secondary rounded-lg p-0.5 gap-0.5">
              {(["mensal", "acumulado"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTimelineMode(mode)}
                  className={`text-[10px] px-2.5 py-1 rounded-md font-medium transition-all ${
                    timelineMode === mode
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === "mensal" ? "Mensal" : "Acumulado"}
                </button>
              ))}
            </div>
          </div>

          {/* Line Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="h-44 sm:h-52 w-full -mx-2"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} onClick={handleChartClick} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cc.fill} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={cc.fill} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 12% 16%)" strokeOpacity={0.4} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "hsl(220 8% 50%)", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v.split(" ")[0]}
                />
                <YAxis
                  tick={{ fill: "hsl(220 8% 50%)", fontSize: 9 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => fmtCompact(v)}
                  width={52}
                />
                <RechartsTooltip content={<ChartTooltipContent />} cursor={{ stroke: "hsl(220 8% 50%)", strokeWidth: 1, strokeDasharray: "4 4" }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={cc.stroke}
                  strokeWidth={2.5}
                  fill="url(#chartGradient)"
                  activeDot={<GlowDot />}
                  dot={{ r: 3, fill: cc.stroke, stroke: "hsl(220 20% 5%)", strokeWidth: 2 }}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Timeline list */}
          <div className="relative mt-1">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-border/40 via-border/20 to-transparent" />
            {projectionsWithVariation.map((p, i) => {
              const rs = riskStyle(p.risk);
              const isExpanded = expandedMonth === i;
              const isCurrent = i === 0;
              const displayValue = timelineMode === "acumulado" ? p.balance : p.delta;
              return (
                <div key={`tl-${p.month}-${p.year}`} className="relative">
                  <button
                    onClick={() => setExpandedMonth(isExpanded ? null : i)}
                    className="w-full flex items-center gap-3 py-2.5 border-b border-border/5 last:border-0 group text-left hover:bg-secondary/20 rounded-lg transition-colors px-1 -mx-1"
                  >
                    <div className="relative z-10 flex-shrink-0 w-4 flex justify-center">
                      <div className={`w-2.5 h-2.5 rounded-full ${rs.dot} ${rs.glow} transition-all duration-300 group-hover:scale-125 ${isCurrent ? "ring-2 ring-foreground/20" : ""}`} />
                    </div>
                    <div className="w-14 flex-shrink-0">
                      <span className={`text-xs font-semibold ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                        {MONTH_NAMES[p.month]}
                      </span>
                      <span className="text-[9px] text-muted-foreground/50 ml-1">{p.year}</span>
                    </div>
                    <div className="flex-1 text-right">
                      <p className={`text-sm font-bold tabular-nums ${
                        timelineMode === "acumulado" ? rs.text : deltaColor(displayValue)
                      }`}>
                        {timelineMode === "mensal" && displayValue >= 0 ? "+" : ""}{fmtCurrency(displayValue)}
                      </p>
                    </div>
                    {i > 0 && (
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <span className={`text-[9px] font-medium tabular-nums ${p.variation >= 0 ? "text-muted-foreground" : "text-destructive"}`}>
                          {p.variation >= 0 ? "+" : ""}{p.variationPct.toFixed(0)}%
                        </span>
                        <TrendIcon delta={p.variation} />
                      </div>
                    )}
                    <ChevronDown className={`w-3 h-3 text-muted-foreground/30 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>

                  {/* Drilldown */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-7 mb-3 space-y-2">
                          {/* Composition formula */}
                          <CompositionBlock
                            prev={p.prevBalance}
                            income={p.income}
                            expense={p.expense}
                            final={p.balance}
                          />

                          {/* Detail cards */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-secondary/40 rounded-xl p-2.5 text-center">
                              <p className="text-[9px] text-muted-foreground mb-0.5">Receitas prev.</p>
                              <p className="text-xs font-bold tabular-nums text-foreground">{fmtCurrency(p.income)}</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-secondary/40 rounded-xl p-2.5 text-center">
                              <p className="text-[9px] text-muted-foreground mb-0.5">Despesas prev.</p>
                              <p className="text-xs font-bold tabular-nums text-destructive">{fmtCurrency(p.expense)}</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-secondary/40 rounded-xl p-2.5 text-center">
                              <p className="text-[9px] text-muted-foreground mb-0.5">Balanço</p>
                              <p className={`text-xs font-bold tabular-nums ${p.delta >= 0 ? "text-foreground" : "text-destructive"}`}>
                                {p.delta >= 0 ? "+" : ""}{fmtCurrency(p.delta)}
                              </p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-secondary/40 rounded-xl p-2.5 text-center">
                              <p className="text-[9px] text-muted-foreground mb-0.5">Saldo final</p>
                              <p className={`text-xs font-bold tabular-nums ${p.balance >= 0 ? "text-foreground" : "text-destructive"}`}>
                                {fmtCurrency(p.balance)}
                              </p>
                            </motion.div>
                          </div>

                          {/* Micro-copy */}
                          {p.microCopy && (
                            <motion.p
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.25 }}
                              className={`text-[11px] font-medium ${p.delta >= 0 ? "text-foreground" : "text-warning"}`}
                            >
                              {p.microCopy}
                            </motion.p>
                          )}

                          {/* Alert */}
                          {p.alert && !p.microCopy && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="rounded-lg px-3 py-2 bg-warning/10 border border-warning/20 text-xs text-warning font-medium"
                            >
                              {p.alert}
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </GlassSection>

        {/* ══════════════════════════════════════════ */}
        {/* 2. INSIGHT INTELIGENTE                    */}
        {/* ══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className={`glass-card p-5 border-l-2 overflow-hidden relative ${
            insight.tone === "positive"
              ? "border-l-accent"
              : insight.tone === "neutral"
                ? "border-l-warning"
                : "border-l-destructive"
          }`}
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[hsl(260,50%,50%)]/5 blur-2xl pointer-events-none" />
          <div className="relative flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[hsl(260,50%,50%)]/10 flex items-center justify-center flex-shrink-0">
              <Brain className="w-4.5 h-4.5 text-[hsl(260,50%,65%)]" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(260,50%,65%)]">Insight da IA</p>
              <p className="text-sm text-foreground leading-relaxed font-medium">{insight.text}</p>
              <div className="flex items-start gap-2 pt-1 border-t border-border/10">
                <Sparkles className="w-3 h-3 text-[hsl(260,50%,65%)] mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">{insight.tip}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════ */}
        {/* 3. LIMITE DIÁRIO                          */}
        {/* ══════════════════════════════════════════ */}
        <GlassSection delay={0.18} data-section="limite">
          <SectionHeader icon={<Wallet className="w-4 h-4 text-foreground" />} title="Limite Diário" />

          <div className="text-center py-2">
            <p className={`text-3xl font-bold font-display transition-colors duration-500 ${lt.text}`}>
              {formattedSafe}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              por dia · {dailyLimit.daysLeft} dias restantes no mês
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Gasto hoje</span>
              <span className={`font-semibold tabular-nums ${lt.text}`}>
                {fmtCurrency(data.gastosHoje)} / {formattedSafe}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dailyLimit.spendRatio * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${lt.bar} transition-colors duration-500 ${
                  dailyLimit.tone === "negative" ? "animate-pulse" : ""
                }`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-3.5 h-3.5 flex-shrink-0 ${lt.text}`} />
            <motion.p
              key={dailyLimit.tone + String(savingsGoal)}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-xs font-medium ${lt.text}`}
            >
              {dailyLimit.message}
            </motion.p>
          </div>

          <AnimatePresence>
            {showGoalInput ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-secondary/30 rounded-xl p-3 space-y-3">
                  <p className="text-[11px] text-muted-foreground">Quanto você quer guardar esse mês?</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                      <input
                        type="number"
                        min={0}
                        max={Math.max(data.saldoAtual, 10000)}
                        step={50}
                        value={savingsGoal || ""}
                        placeholder="0"
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(Number(e.target.value), Math.max(data.saldoAtual, 10000)));
                          setSavingsGoal(val);
                        }}
                        className="w-full h-9 pl-9 pr-3 rounded-lg bg-background border border-border/30 text-sm font-semibold tabular-nums text-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                      />
                    </div>
                    <button
                      onClick={() => { setSavingsGoal(0); setShowGoalInput(false); }}
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
                    >
                      Limpar
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    {[100, 200, 500, 1000].map((val) => (
                      <button
                        key={val}
                        onClick={() => setSavingsGoal(val)}
                        className={`flex-1 text-[10px] font-medium py-1.5 rounded-lg transition-all ${
                          savingsGoal === val
                            ? "bg-foreground text-background"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {fmtCurrency(val)}
                      </button>
                    ))}
                  </div>
                  {savingsGoal > 0 && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-muted-foreground">
                      Guardando <span className="font-semibold text-foreground">{fmtCurrency(savingsGoal)}</span>, seu limite diário fica em{" "}
                      <span className="font-semibold text-foreground">{formattedSafe}</span>
                    </motion.p>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowGoalInput(true)}
                className="w-full text-xs font-medium py-2.5 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 active:scale-[0.97] transition-all flex items-center justify-center gap-1.5"
              >
                <Target className="w-3.5 h-3.5" />
                {savingsGoal > 0
                  ? `Meta: guardar ${fmtCurrency(savingsGoal)} · Editar`
                  : "Definir quanto quero guardar"}
              </motion.button>
            )}
          </AnimatePresence>

          <div className="bg-secondary/30 rounded-xl px-3 py-2 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Orçamento restante do mês</span>
            <span className="text-xs font-bold tabular-nums text-foreground">
              {fmtCurrency(Math.max(data.saldoAtual + data.receitasPendentes - data.despesasPendentes - savingsGoal, 0))}
            </span>
          </div>
        </GlassSection>

        {/* ══════════════════════════════════════════ */}
        {/* 4. SIMULAÇÃO                              */}
        {/* ══════════════════════════════════════════ */}
        <GlassSection delay={0.26} className={hasSimulation ? "relative overflow-hidden" : ""}>
          {hasSimulation && (
            <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
          )}
          <div className="relative">
            <SectionHeader icon={<PiggyBank className="w-4 h-4 text-foreground" />} title="Simulação" />

            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={() => setSavingsBoost((p) => Math.min(p + 200, 2000))}
                className="text-xs font-medium py-2.5 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 active:scale-[0.97] transition-all"
              >
                + Economizar
              </button>
              <button
                onClick={() => setIncomeBoost((p) => Math.min(p + 500, 5000))}
                className="text-xs font-medium py-2.5 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 active:scale-[0.97] transition-all"
              >
                + Renda extra
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] text-muted-foreground">Economia mensal</label>
                  <span className="text-xs font-semibold text-foreground tabular-nums">{fmtCurrency(savingsBoost)}</span>
                </div>
                <input
                  type="range" min={0} max={2000} step={50} value={savingsBoost}
                  onChange={(e) => setSavingsBoost(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full bg-secondary appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] text-muted-foreground">Renda extra</label>
                  <span className="text-xs font-semibold text-foreground tabular-nums">{fmtCurrency(incomeBoost)}</span>
                </div>
                <input
                  type="range" min={0} max={5000} step={100} value={incomeBoost}
                  onChange={(e) => setIncomeBoost(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full bg-secondary appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
                />
              </div>
            </div>

            <AnimatePresence>
              {hasSimulation && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 rounded-xl bg-secondary/40 border border-border/20 p-4 space-y-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-secondary/60 rounded-xl p-2.5 text-center">
                      <p className="text-[9px] text-muted-foreground mb-0.5">em 3 meses</p>
                      <p className="text-sm font-bold tabular-nums text-foreground">+{fmtCurrency(simulation.impact3m)}</p>
                    </div>
                    <div className="bg-secondary/60 rounded-xl p-2.5 text-center">
                      <p className="text-[9px] text-muted-foreground mb-0.5">em 6 meses</p>
                      <p className="text-sm font-bold tabular-nums text-foreground">+{fmtCurrency(simulation.impact6m)}</p>
                    </div>
                  </div>
                  <div className="border-t border-border/10 pt-2 space-y-1">
                    {savingsBoost > 0 && (
                      <p className="text-[11px] text-foreground">
                        💰 Economizando <span className="font-semibold">{fmtCurrency(savingsBoost)}</span>/mês
                      </p>
                    )}
                    {incomeBoost > 0 && (
                      <p className="text-[11px] text-foreground">
                        📈 Renda extra de <span className="font-semibold">{fmtCurrency(incomeBoost)}</span>/mês
                      </p>
                    )}
                    <p className="text-xs font-semibold pt-1">
                      Saldo final → <span className="text-foreground">{fmtCurrency(simulation.saldoFinal)}</span>
                      <span className="text-[10px] text-muted-foreground ml-1.5">(antes: {fmtCurrency(simulation.saldoFinalBase)})</span>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {hasSimulation && (
              <button
                onClick={resetSimulation}
                className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Resetar
              </button>
            )}
          </div>
        </GlassSection>

        {/* ══════════════════════════════════════════ */}
        {/* 5. RESERVA INTELIGENTE                    */}
        {/* ══════════════════════════════════════════ */}
        <GlassSection delay={0.32}>
          <SectionHeader icon={<Banknote className="w-4 h-4 text-foreground" />} title="Reserva Inteligente" />
          <div className="bg-secondary/30 rounded-xl p-3 space-y-2">
            <p className="text-xs text-foreground leading-relaxed">
              Se você reservar <span className="font-semibold">{fmtCurrency(potentialSavings.monthly)}</span>/mês
              (10% das suas despesas), em 6 meses terá:
            </p>
            <p className="text-xl font-bold font-display text-foreground tabular-nums">
              {fmtCurrency(potentialSavings.sixMonth)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              acumulados como reserva de emergência 🛡️
            </p>
          </div>
          <button
            onClick={() => setSavingsBoost(Math.round(potentialSavings.monthly / 50) * 50)}
            className="w-full text-xs font-medium py-2.5 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 active:scale-[0.97] transition-all"
          >
            Simular com esse valor
          </button>
        </GlassSection>

        {/* ══════════════════════════════════════════ */}
        {/* 6. AÇÕES RÁPIDAS                          */}
        {/* ══════════════════════════════════════════ */}
        <GlassSection delay={0.38}>
          <SectionHeader icon={<Target className="w-4 h-4 text-foreground" />} title="Ações Rápidas" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              {
                icon: Settings2, label: "Ajustar limite", desc: "Mudar meta de gasto diário",
                action: () => document.querySelector('[data-section="limite"]')?.scrollIntoView({ behavior: "smooth" }),
              },
              {
                icon: Scissors, label: "Cortar gastos", desc: "Revisar transações",
                action: () => navigate("/transacoes"),
              },
              {
                icon: TrendingUp, label: "Saúde financeira", desc: "Ver seu score completo",
                action: () => navigate("/bot-finance/saude"),
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 active:scale-[0.96] transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/80 transition-colors">
                    <Icon className="w-4 h-4 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-foreground transition-colors flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </GlassSection>
      </div>
    </div>
  );
};

export default BotFinanceProjecoes;
