import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronRight, Sparkles, TrendingUp, TrendingDown,
  AlertTriangle, Target, Brain, PieChart as PieChartIcon, Info, ShieldCheck, BarChart3,
  Repeat,
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
  BarChart, Bar, Cell, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
  PieChart, Pie, Sector,
} from "recharts";
import { toast } from "sonner";

// ── Helpers ──────────────────────────────────────────────
const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const SHORT_MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

// ── Types ────────────────────────────────────────────────
interface TxRow {
  id: string; name: string; category: string; date: string;
  amount: number; type: string; status: string;
  recurrence_type?: string; installments?: number | null;
  installment_current?: number | null; parent_transaction_id?: string | null;
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

interface HistoricalEntry {
  month: number;
  year: number;
  label: string;
  amount: number;
}


type HistoricalMap = Record<string, HistoricalEntry[]>;

interface InstallmentImpact {
  category: string;
  monthlyAmount: number;
  totalRemaining: number;
  monthsRemaining: number;
  impactPct: number;
  items: { name: string; amount: number; remaining: number; total: number }[];
}

type InstallmentImpactMap = Record<string, InstallmentImpact>;


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
  <GlassCard className="p-3 md:p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[9px] md:text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">
          Total de Despesas · {monthLabel}
        </p>
        <p className="text-lg md:text-3xl font-bold text-foreground tabular-nums mt-0.5 md:mt-1">
          {fmt(totalExpenses)}
        </p>
      </div>
      {topCategory && (
        <div className="text-right">
          <p className="text-[9px] md:text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">Maior gasto</p>
          <p className="text-xs md:text-sm font-bold text-foreground mt-0.5">{topCategory.name}</p>
          <p className="text-[10px] md:text-xs text-muted-foreground/60">{topCategory.percentage}%</p>
        </div>
      )}
    </div>
  </GlassCard>
);

// ── Donut: default center shows total ────────────────────
const DonutDefaultCenter = ({ total }: { total: number }) => (
  <g>
    <text x="50%" y="46%" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={10} fontWeight={600}>
      Total Despesas
    </text>
    <text x="50%" y="58%" textAnchor="middle" fill="hsl(var(--foreground))" fontSize={16} fontWeight={800}>
      {fmt(total)}
    </text>
  </g>
);

// ── Custom active shape for donut ─────────────────────────
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.9} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 3} outerRadius={innerRadius - 1} startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.3} />
      <text x={cx} y={cy - 12} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={10} fontWeight={700}>
        {payload.fullName}
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={16} fontWeight={800}>
        {fmt(payload.value)}
      </text>
      <text x={cx} y={cy + 22} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={10} fontWeight={600}>
        {(percent * 100).toFixed(0)}%
      </text>
    </g>
  );
};

// ── Default (non-active) donut shape ─────────────────────
const renderDefaultShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
  );
};

// ── Custom bar shape with icon on top ────────────────────
const BarWithIcon = (props: any) => {
  const { x, y, width, height, fill, payload } = props;
  if (!payload?.iconName) return <rect x={x} y={y} width={width} height={height} fill={fill} rx={6} ry={6} />;

  const IconComp = payload.iconComponent;
  const iconSize = 14;
  const iconX = x + width / 2 - iconSize / 2;
  const iconY = y - iconSize - 4;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={6} ry={6} />
      {IconComp && iconY > 0 && (
        <foreignObject x={iconX} y={iconY} width={iconSize} height={iconSize}>
          <div style={{ width: iconSize, height: iconSize, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconComp style={{ width: iconSize, height: iconSize, color: fill }} />
          </div>
        </foreignObject>
      )}
    </g>
  );
};

// ── Category Chart (Donut + Bar toggle) ──────────────────
const CategoryChartSection = ({ categoryData, isMobile }: {
  categoryData: CategorySummary[];
  isMobile: boolean;
}) => {
  const [mode, setMode] = useState<"donut" | "bar">("donut");
  const [activeIdx, setActiveIdx] = useState<number | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ startX: 0, scrollLeft: 0 });

  const totalExpenses = useMemo(() => categoryData.reduce((s, c) => s + c.amount, 0), [categoryData]);

  const chartData = categoryData.map((c) => ({
    name: c.name.length > 8 ? c.name.slice(0, 7) + "…" : c.name,
    fullName: c.name,
    value: c.amount,
    fill: c.hexColor,
    percentage: c.percentage,
    iconComponent: c.icon,
    iconName: c.name,
  }));

  // Drag to scroll for bar chart
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    dragState.current = { startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft };
    el.style.cursor = "grabbing";
  }, []);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const el = scrollRef.current;
    const x = e.pageX - el.offsetLeft;
    el.scrollLeft = dragState.current.scrollLeft - (x - dragState.current.startX);
  }, [isDragging]);
  const onMouseUp = useCallback(() => {
    setIsDragging(false);
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  }, []);

  return (
    <GlassCard className="p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] md:text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
          Gastos por Categoria
        </p>
        <div className="flex items-center gap-1 bg-muted/20 rounded-lg p-0.5">
          <button
            onClick={() => setMode("donut")}
            className={`p-1.5 rounded-md transition-colors ${mode === "donut" ? "bg-primary/15 text-primary" : "text-muted-foreground/50 hover:text-foreground/70"}`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMode("bar")}
            className={`p-1.5 rounded-md transition-colors ${mode === "bar" ? "bg-primary/15 text-primary" : "text-muted-foreground/50 hover:text-foreground/70"}`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === "donut" ? (
          <motion.div
            key="donut"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ height: isMobile ? 240 : 280 }}
            onMouseLeave={() => setActiveIdx(undefined)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIdx}
                  activeShape={renderActiveShape}
                  inactiveShape={renderDefaultShape}
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 58 : 72}
                  outerRadius={isMobile ? 88 : 108}
                  dataKey="value"
                  paddingAngle={2}
                  onMouseEnter={(_, idx) => setActiveIdx(idx)}
                  onClick={(_, idx) => setActiveIdx(idx)}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="hsl(var(--background))" strokeWidth={2} />
                  ))}
                </Pie>
                {activeIdx === undefined && (
                  <DonutDefaultCenter total={totalExpenses} />
                )}
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        ) : (
          <motion.div
            key="bar"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            ref={scrollRef}
            className="overflow-x-auto scrollbar-none select-none"
            style={{ cursor: "grab" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <div style={{ height: 220, minWidth: Math.max(categoryData.length * 56, 300) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ left: 4, right: 4, top: 24, bottom: 0 }}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-lg bg-popover border border-border/30 px-3 py-2 shadow-xl">
                          <p className="text-xs font-bold text-foreground">{d.fullName}</p>
                          <p className="text-[11px] text-muted-foreground tabular-nums">{fmt(d.value)}</p>
                          <p className="text-[10px] text-muted-foreground/60">{d.percentage}%</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="value" shape={<BarWithIcon />} animationDuration={800}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

// ── Category List with traffic-light bars ────────────────
const CategoryList = ({ categoryData, onSelect, selectedCat, prevCategoryData }: {
  categoryData: CategorySummary[];
  onSelect: (name: string) => void;
  selectedCat: string | null;
  prevCategoryData?: { name: string; amount: number }[];
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
      <div className="px-4 md:px-5 pb-3 space-y-1 max-h-[420px] overflow-y-auto scrollbar-none">
        {categoryData.map((cat, i) => {
          const CatIcon = cat.icon;
          const isSelected = selectedCat === cat.name;
          const dimmed = selectedCat && !isSelected;
          const prev = prevCategoryData?.find((p) => p.name === cat.name);
          const prevAmount = prev?.amount ?? 0;
          const variation = prevAmount > 0
            ? Math.round(((cat.amount - prevAmount) / prevAmount) * 100)
            : null;
          const isNew = prevAmount === 0 && cat.amount > 0;
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
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1.5 bg-border/15 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ delay: 0.1 + i * 0.03, duration: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: getBarColor(cat.percentage) }}
                    />
                  </div>
                  {isNew ? (
                    <span className="text-[8px] md:text-[9px] font-semibold text-blue-400 whitespace-nowrap">Novo</span>
                  ) : variation !== null ? (
                    <span className={`text-[8px] md:text-[9px] font-semibold whitespace-nowrap flex items-center gap-0.5 ${
                      variation > 0 ? "text-destructive" : variation < 0 ? "text-success" : "text-muted-foreground/50"
                    }`}>
                      {variation > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : variation < 0 ? <TrendingDown className="w-2.5 h-2.5" /> : null}
                      {variation > 0 ? "+" : ""}{variation}%
                    </span>
                  ) : null}
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

// ── Comparison Insights Section ───────────────────────────
const ComparisonInsightsSection = ({ categoryData, prevCategoryData }: {
  categoryData: CategorySummary[];
  prevCategoryData: { name: string; amount: number }[];
}) => {
  const insights = useMemo(() => {
    const results: { message: string; severity: "up" | "down" | "new"; impact: number }[] = [];

    categoryData.forEach((cat) => {
      const prev = prevCategoryData.find((p) => p.name === cat.name);
      const prevAmount = prev?.amount ?? 0;

      if (prevAmount === 0 && cat.amount > 0) {
        results.push({
          message: `Você começou a gastar com ${cat.name} esse mês`,
          severity: "new",
          impact: cat.amount,
        });
        return;
      }
      if (prevAmount === 0) return;

      const variation = ((cat.amount - prevAmount) / prevAmount) * 100;
      if (variation > 20) {
        results.push({
          message: `Seus gastos com ${cat.name} aumentaram bastante esse mês 👀 Vale dar uma olhada pra entender o que mudou`,
          severity: "up",
          impact: Math.abs(variation),
        });
      } else if (variation >= 5) {
        results.push({
          message: `${cat.name} teve um leve aumento esse mês`,
          severity: "up",
          impact: Math.abs(variation),
        });
      } else if (variation < -1) {
        results.push({
          message: `Boa! Você reduziu seus gastos com ${cat.name} 👏`,
          severity: "down",
          impact: Math.abs(variation),
        });
      }
    });

    return results.sort((a, b) => b.impact - a.impact).slice(0, 3);
  }, [categoryData, prevCategoryData]);

  if (insights.length === 0) return null;

  const severityConfig = {
    up: { icon: TrendingUp, bg: "bg-destructive/5", border: "border-destructive/15", text: "text-destructive" },
    down: { icon: TrendingDown, bg: "bg-success/5", border: "border-success/15", text: "text-success" },
    new: { icon: Sparkles, bg: "bg-blue-500/5", border: "border-blue-500/15", text: "text-blue-400" },
  };

  return (
    <GlassCard className="p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">💡</span>
        <p className="text-[10px] md:text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
          Insights Inteligentes
        </p>
      </div>
      <div className="space-y-2">
        {insights.map((ins, i) => {
          const config = severityConfig[ins.severity];
          const Icon = config.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl ${config.bg} border ${config.border}`}
            >
              <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${config.text}`} />
              <p className="text-xs text-foreground/80 leading-relaxed">{ins.message}</p>
            </motion.div>
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

// ── Projections Inline (compact, merges with summary) ────
const ProjectionsInline = ({ totalExpenses }: { totalExpenses: number }) => {
  const annualEstimate = totalExpenses * 12;
  return (
    <div className="grid grid-cols-2 gap-2">
      <GlassCard className="p-3 text-center">
        <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-medium">Gasto anual estimado</p>
        <p className="text-base font-bold text-destructive tabular-nums mt-1">{fmt(annualEstimate)}</p>
        <p className="text-[8px] text-muted-foreground/40 mt-0.5">Se continuar nesse ritmo</p>
      </GlassCard>
      <GlassCard className="p-3 text-center">
        <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-medium">Média mensal</p>
        <p className="text-base font-bold text-foreground tabular-nums mt-1">{fmt(totalExpenses)}</p>
        <p className="text-[8px] text-muted-foreground/40 mt-0.5">Este mês</p>
      </GlassCard>
    </div>
  );
};

// ── Limit Suggestions (detailed) ─────────────────────────
const LimitSuggestions = ({ suggestions, categoryData }: { suggestions: AIInsights["limitSuggestions"]; categoryData: CategorySummary[] }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <GlassCard className="p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-primary" />
        <p className="text-[10px] md:text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
          Sugestões de Limite
        </p>
      </div>
      <div className="space-y-2.5">
        {suggestions.map((s, i) => {
          const cat = categoryData.find((c) => c.name.toLowerCase() === s.category.toLowerCase());
          const currentAmount = cat?.amount ?? 0;
          const saving = currentAmount - s.suggestedLimit;
          const annualSaving = saving > 0 ? saving * 12 : 0;
          const CatIcon = cat?.icon;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-3 rounded-xl bg-primary/5 border border-primary/10"
            >
              <div className="flex items-center gap-2.5 mb-2">
                {CatIcon && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${cat?.hexColor}18` }}>
                    <CatIcon className="w-3.5 h-3.5" style={{ color: cat?.hexColor }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{s.category}</p>
                  <p className="text-[10px] text-muted-foreground/60">{s.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[8px] text-muted-foreground/50 uppercase">Atual</p>
                    <p className="text-[11px] font-bold text-destructive tabular-nums">{fmt(currentAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-muted-foreground/50 uppercase">Limite</p>
                    <p className="text-[11px] font-bold text-primary tabular-nums">{fmt(s.suggestedLimit)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-muted-foreground/50 uppercase">Economia/ano</p>
                    <p className="text-[11px] font-bold text-success tabular-nums">{fmt(annualSaving)}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  toast.success(`Limite de ${fmt(s.suggestedLimit)} definido para ${s.category}! 🎯`, {
                    description: `Economia potencial de ${fmt(annualSaving)} por ano.`,
                  });
                }}
                className="mt-2.5 w-full px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-semibold border border-primary/15 hover:bg-primary/20 transition-colors"
              >
                Definir limite de {fmt(s.suggestedLimit)}
              </button>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
};

// ── Installment Insights Section ─────────────────────────
const InstallmentInsightsSection = ({ impacts }: { impacts: InstallmentImpact[] }) => {
  // Filter only relevant impacts
  const relevant = impacts
    .filter((imp) => imp.totalRemaining > 300 || imp.monthsRemaining >= 3 || imp.impactPct > 20)
    .sort((a, b) => b.totalRemaining - a.totalRemaining || b.monthsRemaining - a.monthsRemaining)
    .slice(0, 3);

  if (relevant.length === 0) return null;

  const getSeverity = (imp: InstallmentImpact) => {
    if (imp.impactPct > 50 || imp.totalRemaining > 2000) return "danger";
    if (imp.impactPct > 30 || imp.totalRemaining > 1000) return "warning";
    return "info";
  };

  const getMessage = (imp: InstallmentImpact) => {
    const severity = getSeverity(imp);
    if (severity === "danger") {
      return `⚠️ Parte do seu orçamento futuro já está comprometido com ${imp.category}. Talvez seja melhor segurar novos gastos aqui por enquanto.`;
    }
    if (severity === "warning") {
      return `Você ainda tem ${fmt(imp.totalRemaining)} comprometidos em ${imp.category}. Esse valor vai impactar seus próximos ${imp.monthsRemaining} meses 😅`;
    }
    return `Mesmo com parcelamentos ativos, seus gastos em ${imp.category} estão sob controle 👍`;
  };

  const severityStyles = {
    info: { border: "border-blue-500/15", bg: "bg-blue-500/5", icon: "text-blue-400" },
    warning: { border: "border-warning/15", bg: "bg-warning/5", icon: "text-warning" },
    danger: { border: "border-destructive/15", bg: "bg-destructive/5", icon: "text-destructive" },
  };

  return (
    <GlassCard className="p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">💳</span>
        <p className="text-[10px] md:text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
          Impacto de Parcelamentos
        </p>
      </div>
      <div className="space-y-2.5">
        {relevant.map((imp, i) => {
          const severity = getSeverity(imp);
          const styles = severityStyles[severity];
          return (
            <motion.div
              key={imp.category}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-3 rounded-xl ${styles.bg} border ${styles.border}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs">💳</span>
                <p className="text-xs font-semibold text-foreground flex-1">{imp.category}</p>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                  severity === "danger" ? "bg-destructive/10 text-destructive" :
                  severity === "warning" ? "bg-warning/10 text-warning" : "bg-blue-500/10 text-blue-400"
                }`}>
                  {imp.impactPct}% da categoria
                </span>
              </div>
              <p className="text-[11px] text-foreground/70 leading-relaxed mb-2">
                {getMessage(imp)}
              </p>
              <div className="grid grid-cols-3 gap-2 text-center py-1.5 rounded-lg bg-background/30">
                <div>
                  <p className="text-[8px] text-muted-foreground/50 uppercase">Mensal</p>
                  <p className="text-[11px] font-bold text-foreground tabular-nums">{fmt(imp.monthlyAmount)}</p>
                </div>
                <div>
                  <p className="text-[8px] text-muted-foreground/50 uppercase">Restante</p>
                  <p className="text-[11px] font-bold text-foreground tabular-nums">{fmt(imp.totalRemaining)}</p>
                </div>
                <div>
                  <p className="text-[8px] text-muted-foreground/50 uppercase">Meses</p>
                  <p className="text-[11px] font-bold text-foreground tabular-nums">⏳ {imp.monthsRemaining}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
};

// ── Category Installment Detail ──────────────────────────
const CategoryInstallmentDetail = ({ impact }: { impact: InstallmentImpact | undefined }) => {
  if (!impact || impact.items.length === 0) return null;

  const isRelevant = impact.totalRemaining > 300 || impact.monthsRemaining >= 3 || impact.impactPct > 20;
  if (!isRelevant) return null;

  const isHighImpact = impact.impactPct > 30 || impact.totalRemaining > 1000;

  return (
    <GlassCard className={`p-4 md:p-5 ${isHighImpact ? "border-warning/20" : "border-border/20"}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">💳</span>
        <p className="text-[10px] md:text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
          Parcelamentos Ativos
        </p>
      </div>

      {/* Summary */}
      <div className={`p-3 rounded-xl mb-3 ${isHighImpact ? "bg-warning/5 border border-warning/10" : "bg-muted/10 border border-border/10"}`}>
        <p className="text-xs text-foreground/80 leading-relaxed">
          {isHighImpact
            ? `⚠️ ${fmt(impact.totalRemaining)} comprometidos nos próximos ${impact.monthsRemaining} meses. Cuidado com novos parcelamentos aqui.`
            : `${fmt(impact.totalRemaining)} restantes em parcelamentos (${impact.monthsRemaining} meses). Tudo sob controle 👍`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <p className="text-[9px] text-muted-foreground/50 uppercase">Mensal</p>
          <p className="text-sm font-bold text-foreground tabular-nums">{fmt(impact.monthlyAmount)}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-muted-foreground/50 uppercase">Total restante</p>
          <p className="text-sm font-bold text-foreground tabular-nums">{fmt(impact.totalRemaining)}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-muted-foreground/50 uppercase">% da categoria</p>
          <p className="text-sm font-bold text-foreground tabular-nums">{impact.impactPct}%</p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {impact.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/10">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
              <p className="text-[9px] text-muted-foreground/40">
                {item.total - item.remaining} de {item.total} parcelas pagas
              </p>
            </div>
            <div className="text-right shrink-0 ml-2">
              <p className="text-xs font-bold text-foreground tabular-nums">{fmt(item.amount)}/mês</p>
              <p className="text-[9px] text-muted-foreground/40">{item.remaining} restantes</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};


const EvolutionGlowDot = (props: any) => {
  const { cx, cy } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill={props.stroke} opacity={0.15} />
      <circle cx={cx} cy={cy} r={4} fill={props.stroke} stroke="hsl(220 20% 5%)" strokeWidth={2} />
    </g>
  );
};

const EvolutionChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as HistoricalEntry;
  return (
    <div className="bg-popover border border-border/40 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[10px] text-muted-foreground">{MONTH_NAMES[d.month]}/{d.year}</p>
      <p className="text-sm font-bold tabular-nums text-foreground">{fmt(d.amount)}</p>
    </div>
  );
};

const EvolutionChart = ({ data, hexColor, currentMonth }: {
  data: HistoricalEntry[];
  hexColor: string;
  currentMonth: number;
}) => {
  if (data.length < 2) return null;

  const gradientId = `evo-gradient-${hexColor.replace("#", "")}`;

  return (
    <GlassCard className="p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-primary" />
        <p className="text-[10px] md:text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
          Evolução Mensal
        </p>
      </div>
      <div style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={hexColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={hexColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 12% 16%)" strokeOpacity={0.4} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "hsl(220 8% 50%)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(220 8% 50%)", fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => fmt(v)}
              width={72}
            />
            <Tooltip content={<EvolutionChartTooltip />} cursor={{ stroke: "hsl(220 8% 50%)", strokeWidth: 1, strokeDasharray: "4 4" }} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke={hexColor}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              activeDot={<EvolutionGlowDot />}
              dot={{ r: 3, fill: hexColor, stroke: "hsl(220 20% 5%)", strokeWidth: 2 }}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

// ── Category Detail View ─────────────────────────────────
const CategoryDetail = ({
  category, transactions, onBack, monthLabel, isMobile, totalExpenses,
  historicalData, aiInsights, selectedMonth, installmentImpact,
}: {
  category: CategorySummary;
  transactions: TxRow[];
  onBack: () => void;
  monthLabel: string;
  isMobile: boolean;
  totalExpenses: number;
  historicalData: HistoricalEntry[];
  aiInsights: AIInsights | null;
  selectedMonth: number;
  installmentImpact?: InstallmentImpact;
}) => {
  const catTxs = transactions
    .filter((t) => t.category === category.name && t.type === "despesa")
    .sort((a, b) => b.date.localeCompare(a.date));

  const CatIcon = category.icon;
  const annualEstimate = category.amount * 12;

  // Filter AI data for this category
  const categoryAlerts = useMemo(() =>
    aiInsights?.alerts.filter((a) => a.category.toLowerCase() === category.name.toLowerCase()) ?? [],
    [aiInsights, category.name]
  );

  // Filter insights mentioning this category
  const categoryInsights = useMemo(() => {
    if (!aiInsights?.insights) return [];
    const catLower = category.name.toLowerCase();
    return aiInsights.insights.filter((msg) => msg.toLowerCase().includes(catLower));
  }, [aiInsights, category.name]);

  const categoryLimitSuggestion = useMemo(() =>
    aiInsights?.limitSuggestions.find((s) => s.category.toLowerCase() === category.name.toLowerCase()),
    [aiInsights, category.name]
  );

  // 3-month trend analysis
  const trendAnalysis = useMemo(() => {
    if (historicalData.length < 3) return null;
    const recent3 = historicalData.slice(-3);
    const current = recent3[2]?.amount ?? 0;
    const prev = recent3[1]?.amount ?? 0;
    const older = recent3[0]?.amount ?? 0;

    // Month-over-month change
    const momChange = prev > 0 ? Math.round(((current - prev) / prev) * 100) : null;

    // 3-month average
    const avg3 = (current + prev + older) / 3;

    // Check if there's a rising trend (each month higher than previous)
    const risingTrend = current > prev && prev > older && older > 0;

    // Total increase over 3 months
    const totalIncrease = older > 0 ? Math.round(((current - older) / older) * 100) : null;

    return { momChange, avg3, risingTrend, totalIncrease, months: recent3 };
  }, [historicalData]);

  // Smart limit suggestion with economy potential
  const smartSuggestion = useMemo(() => {
    if (categoryLimitSuggestion) {
      const saving = category.amount - categoryLimitSuggestion.suggestedLimit;
      return {
        suggestedLimit: categoryLimitSuggestion.suggestedLimit,
        message: categoryLimitSuggestion.message,
        monthlySaving: saving > 0 ? saving : 0,
        annualSaving: saving > 0 ? saving * 12 : 0,
      };
    }
    // Local fallback: suggest reducing to 3-month average or 85% of current
    if (trendAnalysis && trendAnalysis.avg3 > 0 && category.amount > trendAnalysis.avg3 * 1.1) {
      const suggested = Math.round(trendAnalysis.avg3 / 10) * 10;
      const saving = category.amount - suggested;
      return {
        suggestedLimit: suggested,
        message: `Sua média dos últimos 3 meses é ${fmt(trendAnalysis.avg3)}. Definir um limite de ${fmt(suggested)} ajuda a controlar o crescimento.`,
        monthlySaving: saving > 0 ? saving : 0,
        annualSaving: saving > 0 ? saving * 12 : 0,
      };
    }
    if (category.percentage > 25 && totalExpenses > 0) {
      const suggested = Math.round(category.amount * 0.85 / 10) * 10;
      const saving = category.amount - suggested;
      return {
        suggestedLimit: suggested,
        message: `Essa categoria representa ${category.percentage}% dos seus gastos. Reduzindo para ${fmt(suggested)}/mês você economiza ${fmt(saving > 0 ? saving : 0)}.`,
        monthlySaving: saving > 0 ? saving : 0,
        annualSaving: saving > 0 ? saving * 12 : 0,
      };
    }
    return null;
  }, [category, totalExpenses, categoryLimitSuggestion, trendAnalysis]);

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
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">{category.name}</h2>
          <p className="text-xs text-muted-foreground/60">{monthLabel}</p>
        </div>
        {trendAnalysis?.momChange != null && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${
            trendAnalysis.momChange > 0
              ? "bg-destructive/10 text-destructive"
              : "bg-success/10 text-success"
          }`}>
            {trendAnalysis.momChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendAnalysis.momChange > 0 ? "+" : ""}{trendAnalysis.momChange}%
          </div>
        )}
      </div>

      {/* Stats — compact 2x2 grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Total gasto", value: fmt(category.amount) },
          { label: "Transações", value: String(category.txCount) },
          { label: "Média/transação", value: fmt(category.avgPerTx) },
          { label: "Projeção anual", value: fmt(annualEstimate) },
        ].map((s) => (
          <GlassCard key={s.label} className="p-3 text-center">
            <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-medium">{s.label}</p>
            <p className="text-sm font-bold text-foreground mt-1 tabular-nums">{s.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Evolution Chart (6 months) */}
      <EvolutionChart
        data={historicalData}
        hexColor={category.hexColor}
        currentMonth={selectedMonth}
      />

      {/* 3-month trend alert */}
      {trendAnalysis?.risingTrend && trendAnalysis.totalIncrease != null && (
        <GlassCard className="p-4 border-warning/20">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">Tendência de alta</p>
              <p className="text-[11px] text-muted-foreground/70 mt-1 leading-relaxed">
                {category.name} subiu {trendAnalysis.totalIncrease}% nos últimos 3 meses
                {trendAnalysis.months && (
                  <span>
                    {" "}— de {fmt(trendAnalysis.months[0].amount)} para {fmt(trendAnalysis.months[2].amount)}
                  </span>
                )}
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* AI Insights for this category */}
      {categoryInsights.length > 0 && (
        <GlassCard className="p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-primary" />
            <p className="text-[10px] md:text-[11px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
              Insights · {category.name}
            </p>
          </div>
          <div className="space-y-2">
            {categoryInsights.map((msg, i) => (
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
      )}

      {/* AI Alerts for this category */}
      {categoryAlerts.length > 0 && <AlertsSection alerts={categoryAlerts} />}

      {/* Installment Impact */}
      <CategoryInstallmentDetail impact={installmentImpact} />

      {/* Smart limit + economy suggestion */}
      {smartSuggestion && (
        <GlassCard className="p-4 md:p-5 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">
                💡 Sugestão de limite
              </p>
              <p className="text-[11px] text-muted-foreground/70 mt-1 leading-relaxed">
                {smartSuggestion.message}
              </p>
              {smartSuggestion.monthlySaving > 0 && (
                <div className="flex items-center gap-3 mt-2 py-2 px-3 rounded-lg bg-success/5 border border-success/10">
                  <div>
                    <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-medium">Economia/mês</p>
                    <p className="text-xs font-bold text-success tabular-nums">{fmt(smartSuggestion.monthlySaving)}</p>
                  </div>
                  <div className="w-px h-6 bg-border/20" />
                  <div>
                    <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-medium">Economia/ano</p>
                    <p className="text-xs font-bold text-success tabular-nums">{fmt(smartSuggestion.annualSaving)}</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  toast.success(`Limite de ${fmt(smartSuggestion.suggestedLimit)} definido para ${category.name}! 🎯`, {
                    description: "Em breve você poderá acompanhar o progresso aqui.",
                  });
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-primary/15 text-primary text-xs font-semibold border border-primary/20 hover:bg-primary/25 transition-colors"
              >
                Definir limite de {fmt(smartSuggestion.suggestedLimit)}
              </button>
            </div>
          </div>
        </GlassCard>
      )}

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
  const [historicalMap, setHistoricalMap] = useState<HistoricalMap>({});
  const [customCats, setCustomCats] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [installmentImpacts, setInstallmentImpacts] = useState<InstallmentImpactMap>({});

  // Fetch transactions for current month, previous month, and 6-month history
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

      // 6-month history range (5 months back + current)
      const histStart = new Date(selectedYear, selectedMonth - 5, 1).toISOString().split("T")[0];

      const [txRes, prevTxRes, histRes, installmentRes, recurringTxs, prevRecurring, cats] = await Promise.all([
        supabase.from("transactions").select("*").eq("user_id", user.id)
          .gte("date", start).lte("date", end).order("date", { ascending: false }),
        supabase.from("transactions").select("*").eq("user_id", user.id)
          .gte("date", prevStart).lte("date", prevEnd),
        supabase.from("transactions").select("id,category,date,amount,type").eq("user_id", user.id)
          .eq("type", "despesa")
          .gte("date", histStart).lte("date", end),
        // Fetch all active installment transactions (future parcels)
        supabase.from("transactions").select("id,name,category,amount,date,installments,installment_current,parent_transaction_id,recurrence_type")
          .eq("user_id", user.id).eq("recurrence_type", "parcelado").eq("type", "despesa")
          .gte("date", start),
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

      // Build historical map from 6-month data
      const histTxs = (histRes.data ?? []) as { id: string; category: string; date: string; amount: number; type: string }[];
      const hMap: HistoricalMap = {};
      histTxs.forEach((tx) => {
        const d = new Date(tx.date + "T12:00:00");
        const m = d.getMonth();
        const y = d.getFullYear();
        const key = tx.category;
        if (!hMap[key]) hMap[key] = [];
        const existing = hMap[key].find((e) => e.month === m && e.year === y);
        if (existing) {
          existing.amount += tx.amount;
        } else {
          hMap[key].push({ month: m, year: y, label: SHORT_MONTH_NAMES[m], amount: tx.amount });
        }
      });
      // Sort each category's entries chronologically
      Object.values(hMap).forEach((arr) => arr.sort((a, b) => a.year - b.year || a.month - b.month));

      // Ensure all 6 months exist for each category (fill gaps with 0)
      const allMonths: { month: number; year: number; label: string }[] = [];
      for (let i = -5; i <= 0; i++) {
        const d = new Date(selectedYear, selectedMonth + i, 1);
        allMonths.push({ month: d.getMonth(), year: d.getFullYear(), label: SHORT_MONTH_NAMES[d.getMonth()] });
      }
      Object.keys(hMap).forEach((cat) => {
        const filled = allMonths.map((slot) => {
          const found = hMap[cat].find((e) => e.month === slot.month && e.year === slot.year);
          return found ?? { ...slot, amount: 0 };
        });
        hMap[cat] = filled;
      });

      // Build installment impact map
      const instTxs = (installmentRes.data ?? []) as {
        id: string; name: string; category: string; amount: number; date: string;
        installments: number | null; installment_current: number | null;
        parent_transaction_id: string | null; recurrence_type: string;
      }[];

      // Group by parent (or self if parent) to find unique installment groups
      const groupMap = new Map<string, { name: string; category: string; amount: number; total: number; maxCurrent: number }>();
      instTxs.forEach((tx) => {
        if (!tx.installments || tx.installments <= 1) return;
        const groupId = tx.parent_transaction_id ?? tx.id;
        const existing = groupMap.get(groupId);
        const current = tx.installment_current ?? 1;
        if (!existing) {
          groupMap.set(groupId, { name: tx.name, category: tx.category, amount: tx.amount, total: tx.installments, maxCurrent: current });
        } else {
          existing.maxCurrent = Math.max(existing.maxCurrent, current);
        }
      });

      const iMap: InstallmentImpactMap = {};
      groupMap.forEach(({ name, category, amount, total, maxCurrent }) => {
        const remaining = total - maxCurrent;
        if (remaining <= 0) return;
        if (!iMap[category]) {
          iMap[category] = { category, monthlyAmount: 0, totalRemaining: 0, monthsRemaining: 0, impactPct: 0, items: [] };
        }
        iMap[category].monthlyAmount += amount;
        iMap[category].totalRemaining += amount * remaining;
        iMap[category].monthsRemaining = Math.max(iMap[category].monthsRemaining, remaining);
        iMap[category].items.push({ name, amount, remaining, total });
      });

      setTransactions([...baseTxs, ...materializedRecurring]);
      setPrevMonthTxs([...prevBaseTxs, ...prevMaterialized]);
      setHistoricalMap(hMap);
      setInstallmentImpacts(iMap);
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

  // Compute impactPct for installment impacts
  const enrichedInstallmentImpacts = useMemo(() => {
    const result: InstallmentImpact[] = [];
    Object.values(installmentImpacts).forEach((imp) => {
      const catData = categoryData.find((c) => c.name === imp.category);
      const catAmount = catData?.amount ?? 0;
      result.push({
        ...imp,
        impactPct: catAmount > 0 ? Math.round((imp.monthlyAmount / catAmount) * 100) : 0,
      });
    });
    return result;
  }, [installmentImpacts, categoryData]);

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
      {/* Header — hidden when viewing category detail */}
      {!selectedCategory && (
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
      )}

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
            historicalData={historicalMap[selectedCategory] ?? []}
            aiInsights={aiInsights}
            selectedMonth={selectedMonth}
            installmentImpact={enrichedInstallmentImpacts.find((i) => i.category === selectedCategory)}
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
                {/* Summary + Projections together */}
                <SummaryCard totalExpenses={totalExpenses} topCategory={topCategory} monthLabel={monthLabel} />
                <ProjectionsInline totalExpenses={totalExpenses} />

                {/* Chart — full width */}
                <CategoryChartSection
                  categoryData={categoryData}
                  isMobile={isMobile}
                />

                {/* Comparison Insights — between chart and AI */}
                <ComparisonInsightsSection categoryData={categoryData} prevCategoryData={prevCategoryData} />

                {/* AI Insights */}
                <AIInsightsSection insights={aiInsights} loading={aiLoading} />

                {/* All Categories list */}
                <CategoryList
                  categoryData={categoryData}
                  onSelect={setSelectedCategory}
                  selectedCat={null}
                  prevCategoryData={prevCategoryData}
                />

                {/* Alerts */}
                {aiInsights && <AlertsSection alerts={aiInsights.alerts} />}

                {/* Installment Insights */}
                <InstallmentInsightsSection impacts={enrichedInstallmentImpacts} />

                {/* Limit Suggestions */}
                {aiInsights && <LimitSuggestions suggestions={aiInsights.limitSuggestions} categoryData={categoryData} />}
              </>
            ) : (
              <GlassCard className="p-8 text-center">
                <PieChartIcon className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
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
