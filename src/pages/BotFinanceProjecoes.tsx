import React, { useState, useMemo, useCallback, memo } from "react";
import type { MonthProjection } from "@/services/projection";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CalendarDays,
  Plus,
  Equal,
  ChevronDown,
  History,
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

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const MONTH_FULL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const fmtCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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
  if (delta > 500) return <ArrowUpRight className="w-3.5 h-3.5 text-primary" />;
  if (delta > 0) return <TrendingUp className="w-3.5 h-3.5 text-primary" />;
  if (delta === 0) return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  if (delta > -500) return <TrendingDown className="w-3.5 h-3.5 text-destructive" />;
  return <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />;
};

const riskStyle = (risk: string) => {
  if (risk === "positivo") return { dot: "bg-primary", text: "text-primary", glow: "group-hover:shadow-[0_0_8px_hsl(var(--primary)/0.4)]" };
  if (risk === "atencao") return { dot: "bg-warning", text: "text-warning", glow: "group-hover:shadow-[0_0_8px_hsl(var(--warning)/0.4)]" };
  return { dot: "bg-destructive", text: "text-destructive", glow: "group-hover:shadow-[0_0_8px_hsl(var(--destructive)/0.4)]" };
};

// ─── Custom Chart Tooltip ───

const ChartTooltipContent = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-popover border border-border/40 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-sm font-bold tabular-nums ${val >= 0 ? "text-primary" : "text-destructive"}`}>
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

// ─── Month Selector (dashboard style) ───

const VISIBLE_MONTHS_MOBILE = 6;
const VISIBLE_MONTHS_DESKTOP = 12;

const ProjectionMonthSelector = memo(({
  projections,
  selectedIdx,
  onSelect
}: {
  projections: { month: number; year: number }[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
}) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Compute visible window — on mobile show 6 months, shifts as selection moves forward
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const maxVisible = isMobile ? VISIBLE_MONTHS_MOBILE : VISIBLE_MONTHS_DESKTOP;
  const total = projections.length;

  // Window starts at 0 but shifts so selectedIdx is always visible
  const windowStart = useMemo(() => {
    if (total <= maxVisible) return 0;
    // Keep selected month within visible range, shifting window forward
    const start = Math.min(
      Math.max(0, selectedIdx - Math.floor(maxVisible / 2)),
      total - maxVisible
    );
    return start;
  }, [selectedIdx, total, maxVisible]);

  const visibleProjections = projections.slice(windowStart, windowStart + maxVisible);

  return (
    <div className="flex items-center bg-card/60 backdrop-blur-xl border border-border/15 rounded-2xl px-1.5 py-0.5 shadow-lg shadow-black/10">
      <div className="flex items-center gap-0.5">
        {visibleProjections.map((p, vi) => {
          const realIdx = windowStart + vi;
          const isActive = realIdx === selectedIdx;
          const isCurrent = p.month === currentMonth && p.year === currentYear;

          return (
            <motion.button
              key={`${p.year}-${p.month}`}
              layout
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: isActive ? 1 : 1.05 }}
              onClick={() => onSelect(realIdx)}
              className={`relative px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                isActive
                  ? "text-primary"
                  : isCurrent
                  ? "text-primary/70"
                  : "text-muted-foreground/50 hover:text-foreground/80"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="proj-month-active-bg"
                  className="absolute inset-0 rounded-xl bg-primary/15 border border-primary/20 shadow-[0_0_10px_-3px_hsl(var(--primary)/0.25)]"
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  style={{ zIndex: 0 }}
                />
              )}
              <span className="relative z-10">
                {MONTH_NAMES[p.month]}
                {p.year !== currentYear && (
                  <span className="text-[8px] ml-0.5 opacity-60">{String(p.year).slice(2)}</span>
                )}
              </span>
              {isCurrent && !isActive && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_4px_hsl(var(--primary)/0.5)]"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
});
ProjectionMonthSelector.displayName = "ProjectionMonthSelector";

// ─── Composition Block ───

const CompositionBlock = ({ prev, income, expense, final: finalVal }: { prev: number; income: number; expense: number; final: number }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-center gap-1.5 w-full py-1.5 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Ver composição</span>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.div>
      </button>

      <motion.div
        initial={false}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        {/* Desktop: single row */}
        <div className="hidden sm:flex items-center gap-3 justify-center py-4">
          <div className="bg-secondary/50 rounded-xl px-5 py-3 text-center min-w-[110px]">
            <p className="text-xs text-muted-foreground">Saldo anterior</p>
            <p className="text-base font-bold tabular-nums text-foreground">{fmtCurrency(prev)}</p>
          </div>
          <Plus className="w-4 h-4 text-primary/50 flex-shrink-0" />
          <div className="bg-secondary/50 rounded-xl px-5 py-3 text-center min-w-[110px]">
            <p className="text-xs text-muted-foreground">Receitas</p>
            <p className="text-base font-bold tabular-nums text-primary">{fmtCurrency(income)}</p>
          </div>
          <Minus className="w-4 h-4 text-destructive/50 flex-shrink-0" />
          <div className="bg-secondary/50 rounded-xl px-5 py-3 text-center min-w-[110px]">
            <p className="text-xs text-muted-foreground">Despesas</p>
            <p className="text-base font-bold tabular-nums text-destructive">{fmtCurrency(expense)}</p>
          </div>
          <Equal className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
          <div className={`rounded-xl px-5 py-3 text-center min-w-[110px] ${finalVal >= 0 ? "bg-primary/10 border border-primary/20" : "bg-destructive/10 border border-destructive/20"}`}>
            <p className="text-xs text-muted-foreground">Saldo final</p>
            <p className={`text-base font-bold tabular-nums ${finalVal >= 0 ? "text-primary" : "text-destructive"}`}>{fmtCurrency(finalVal)}</p>
          </div>
        </div>

        {/* Mobile: 2x2 grid */}
        <div className="sm:hidden py-2 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-secondary/50 rounded-lg px-2 py-2 text-center">
              <p className="text-[9px] text-muted-foreground">Saldo anterior</p>
              <p className="text-xs font-bold tabular-nums text-foreground">{fmtCurrency(prev)}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg px-2 py-2 text-center">
              <p className="text-[9px] text-muted-foreground">Receitas</p>
              <p className="text-xs font-bold tabular-nums text-primary">{fmtCurrency(income)}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg px-2 py-2 text-center">
              <p className="text-[9px] text-muted-foreground">Despesas</p>
              <p className="text-xs font-bold tabular-nums text-destructive">{fmtCurrency(expense)}</p>
            </div>
            <div className={`rounded-lg px-2 py-2 text-center ${finalVal >= 0 ? "bg-primary/10 border border-primary/20" : "bg-destructive/10 border border-destructive/20"}`}>
              <p className="text-[9px] text-muted-foreground">Saldo final</p>
              <p className={`text-xs font-bold tabular-nums ${finalVal >= 0 ? "text-primary" : "text-destructive"}`}>{fmtCurrency(finalVal)}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════

const BotFinanceProjecoes = () => {
  const navigate = useNavigate();
  const {
    projections,
    data,
    loading,
  } = useFinancialProjection();

  const [timelineMode, setTimelineMode] = useState<"mensal" | "acumulado">("acumulado");
  const [selectedProjectionIdx, setSelectedProjectionIdx] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const TIMELINE_VISIBLE = 6;

  const projectionsWithVariation = useMemo(() => {
    return projections.map((p, i) => {
      const prev = i > 0 ? projections[i - 1] : null;
      const variation = prev ? p.balance - prev.balance : 0;
      const variationPct = prev && prev.balance !== 0 ? ((p.balance - prev.balance) / Math.abs(prev.balance)) * 100 : 0;
      const prevBalance = prev ? prev.balance : data.previousMonthEndingBalance;
      return { ...p, variation, variationPct, prevBalance };
    });
  }, [projections, data.previousMonthEndingBalance]);

  // Timeline shows only first 6 months; rest goes to history
  const timelineProjections = useMemo(
    () => projectionsWithVariation.slice(0, TIMELINE_VISIBLE),
    [projectionsWithVariation]
  );
  const historyProjections = useMemo(
    () => projectionsWithVariation.slice(TIMELINE_VISIBLE),
    [projectionsWithVariation]
  );

  const chartData = useMemo(() => {
    return timelineProjections.map((p) => ({
      name: `${MONTH_NAMES[p.month]} ${p.year}`,
      value: timelineMode === "acumulado" ? p.balance : p.delta,
      balance: p.balance,
      delta: p.delta,
    }));
  }, [timelineProjections, timelineMode]);

  const selectedProjection = projectionsWithVariation[selectedProjectionIdx] ?? projectionsWithVariation[0];

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
    neutral: { stroke: "hsl(150, 100%, 45%)", fill: "hsl(150, 100%, 45%)" },
    negative: { stroke: "hsl(0, 60%, 50%)", fill: "hsl(0, 60%, 50%)" },
  };
  const cc = chartColors[chartTrend];

  const handleChartClick = useCallback((state: any) => {
    if (state?.activeTooltipIndex !== undefined) {
      setSelectedProjectionIdx(state.activeTooltipIndex);
    }
  }, []);

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="space-y-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-secondary animate-pulse" />
          <div className="h-5 w-40 bg-secondary rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="glass-card p-4 space-y-3">
            <div className="h-4 w-32 bg-secondary rounded animate-pulse" />
            <div className="h-48 w-full bg-secondary/30 rounded-xl animate-pulse" />
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
      {/* Header — no subtitle */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button
          onClick={() => navigate("/bot-finance")}
          className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-bold">Projeções Inteligentes</h1>
      </motion.div>

      <div className="space-y-4">

        {/* ══════════════════════════════════════════ */}
        {/* 1. PROJEÇÃO DO MÊS SELECIONADO            */}
        {/* ══════════════════════════════════════════ */}
        <SectionHeader icon={<CalendarDays className="w-4 h-4 text-primary" />} title="Projeção do Mês" />

        <GlassSection delay={0.05}>
          {/* Month selector — dashboard style */}
          <div className="flex justify-center">
            <ProjectionMonthSelector
              projections={projectionsWithVariation}
              selectedIdx={selectedProjectionIdx}
              onSelect={setSelectedProjectionIdx}
            />
          </div>

          {/* Selected month summary */}
          {selectedProjection && (
            <motion.div
              key={`proj-${selectedProjection.month}-${selectedProjection.year}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-2"
            >
              <div className="text-center py-3 sm:py-5">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1.5">
                  Saldo previsto — {MONTH_FULL[selectedProjection.month]} {selectedProjection.year}
                </p>
                <p className={`text-4xl sm:text-5xl font-bold font-display tabular-nums ${selectedProjection.balance >= 0 ? "text-foreground" : "text-destructive"}`}>
                  {fmtCurrency(selectedProjection.balance)}
                </p>
                {selectedProjectionIdx > 0 && (
                  <p className={`text-xs tabular-nums mt-1 font-semibold ${selectedProjection.delta >= 0 ? "text-primary" : "text-destructive"}`}>
                    {selectedProjection.delta >= 0 ? "+" : ""}{fmtCurrency(selectedProjection.delta)} no mês
                  </p>
                )}
              </div>

              {/* Collapsible Composition */}
              <CompositionBlock
                prev={selectedProjection.prevBalance}
                income={selectedProjection.income}
                expense={selectedProjection.expense}
                final={selectedProjection.balance}
              />
            </motion.div>
          )}
        </GlassSection>

        {/* ══════════════════════════════════════════ */}
        {/* 2. GRÁFICO + TIMELINE                     */}
        {/* ══════════════════════════════════════════ */}
        <GlassSection delay={0.12}>
          <div className="flex items-center justify-between">
            <SectionHeader icon={<TrendingUp className="w-4 h-4 text-primary" />} title="Timeline de Saldo" />
            <div className="flex bg-card/60 backdrop-blur-xl border border-border/15 rounded-2xl p-0.5 gap-0.5">
              {(["mensal", "acumulado"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTimelineMode(mode)}
                  className={`relative text-[10px] px-3 py-1.5 rounded-xl font-medium transition-all ${
                    timelineMode === mode
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {timelineMode === mode && (
                    <motion.div
                      layoutId="timeline-mode-bg"
                      className="absolute inset-0 rounded-xl bg-primary/15 border border-primary/20"
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10">{mode === "mensal" ? "Mensal" : "Acumulado"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <motion.div
            key={`chart-${timelineMode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="h-44 sm:h-64 lg:h-72 w-full -mx-2"
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
                  tickFormatter={(v: number) => fmtCurrency(v)}
                  width={72}
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
            {/* Timeline line — green up to current month, then fades */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px">
              {projectionsWithVariation.map((_, i) => {
                const total = projectionsWithVariation.length;
                const topPct = (i / total) * 100;
                const heightPct = (1 / total) * 100;
                const isPastOrCurrent = i === 0;
                return (
                  <div
                    key={`line-${i}`}
                    className="absolute w-full"
                    style={{
                      top: `${topPct}%`,
                      height: `${heightPct}%`,
                      background: isPastOrCurrent
                        ? "hsl(150 100% 45%)"
                        : i <= 1
                        ? "hsl(150 100% 45% / 0.4)"
                        : "hsl(220 12% 20% / 0.4)",
                    }}
                  />
                );
              })}
            </div>
            {projectionsWithVariation.map((p, i) => {
              const rs = riskStyle(p.risk);
              const isCurrent = i === 0;
              const displayValue = timelineMode === "acumulado" ? p.balance : p.delta;
              const valueColor = displayValue >= 0 ? "text-primary" : "text-destructive";
              return (
                <button
                  key={`tl-${p.month}-${p.year}`}
                  onClick={() => setSelectedProjectionIdx(i)}
                  className={`w-full flex items-center gap-3 py-2.5 border-b border-border/5 last:border-0 group text-left hover:bg-secondary/20 rounded-lg transition-colors px-1 -mx-1 ${
                    selectedProjectionIdx === i ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="relative z-10 flex-shrink-0 w-4 flex justify-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? "bg-primary ring-2 ring-primary/30" : rs.dot} ${rs.glow} transition-all duration-300 group-hover:scale-125`} />
                  </div>
                  <div className="w-14 flex-shrink-0">
                    <span className={`text-xs font-semibold ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                      {MONTH_NAMES[p.month]}
                    </span>
                    <span className="text-[9px] text-muted-foreground/50 ml-1">{p.year}</span>
                  </div>
                  <div className="flex-1 text-right">
                    <p className={`text-sm font-bold tabular-nums ${isCurrent ? "text-primary" : "text-foreground"}`}>
                      {timelineMode === "mensal" && displayValue >= 0 ? "+" : ""}{fmtCurrency(displayValue)}
                    </p>
                  </div>
                  {i > 0 && (
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <span className={`text-[9px] font-medium tabular-nums ${p.variation >= 0 ? "text-primary" : "text-destructive"}`}>
                        {p.variation >= 0 ? "+" : ""}{p.variationPct.toFixed(0)}%
                      </span>
                      <TrendIcon delta={p.variation} />
                    </div>
                  )}
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
