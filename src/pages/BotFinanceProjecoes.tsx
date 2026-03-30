import { useState, useMemo } from "react";
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
} from "lucide-react";
import { useFinancialProjection } from "@/hooks/useFinancialProjection";
import { useFormattedCounter } from "@/hooks/useAnimatedCounter";

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const fmtCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ─── Shared UI ───

const GlassSection = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35, ease: "easeOut" }}
    className={`glass-card p-4 space-y-3 ${className}`}
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

// Contextual risk colors — less green, more semantic variety
const riskStyle = (risk: string) => {
  if (risk === "positivo") return { dot: "bg-accent", text: "text-foreground", glow: "" };
  if (risk === "atencao") return { dot: "bg-warning", text: "text-warning", glow: "" };
  return { dot: "bg-destructive", text: "text-destructive", glow: "" };
};

const deltaColor = (d: number) => (d >= 0 ? "text-foreground" : "text-destructive");

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
    resetSimulation,
    data,
  } = useFinancialProjection();

  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const formattedSafe = useFormattedCounter(dailyLimit.safeToSpend);

  // Tone-based classes for daily limit
  const toneMap = {
    positive: { bar: "bg-accent", text: "text-foreground", badge: "bg-secondary text-foreground" },
    neutral: { bar: "bg-warning", text: "text-warning", badge: "bg-warning/10 text-warning" },
    negative: { bar: "bg-destructive", text: "text-destructive", badge: "bg-destructive/10 text-destructive" },
  };
  const lt = toneMap[dailyLimit.tone];

  // Savings incentive
  const potentialSavings = useMemo(() => {
    const avgExpense = data.projection.avgExpense3m || data.despesas;
    const tenPct = avgExpense * 0.1;
    return { monthly: tenPct, sixMonth: tenPct * 6 };
  }, [data]);

  const hasSimulation = simulation.hasSimulation;

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
          <p className="text-[11px] text-muted-foreground">Previsão e simulação dos próximos 6 meses</p>
        </div>
      </motion.div>

      <div className="space-y-4 max-w-3xl mx-auto">

        {/* ── 1. TIMELINE DE PROJEÇÃO ── */}
        <GlassSection delay={0.05}>
          <SectionHeader icon={<CalendarDays className="w-4 h-4 text-foreground" />} title="Timeline de Saldo" />

          {/* Mini bar chart overview */}
          <div className="flex items-end gap-1.5 h-16 px-1">
            {projections.map((p, i) => {
              const maxBal = Math.max(...projections.map((x) => Math.abs(x.balance)), 1);
              const h = Math.max((Math.abs(p.balance) / maxBal) * 100, 8);
              const isNeg = p.balance < 0;
              return (
                <button
                  key={`bar-${p.month}-${p.year}`}
                  onClick={() => setExpandedMonth(expandedMonth === i ? null : i)}
                  className="flex-1 flex flex-col items-center gap-1 group"
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
                    className={`w-full rounded-t-md transition-colors ${
                      expandedMonth === i
                        ? "bg-foreground"
                        : isNeg
                          ? "bg-destructive/40"
                          : "bg-muted-foreground/20 group-hover:bg-muted-foreground/35"
                    }`}
                  />
                  <span className={`text-[9px] tabular-nums ${expandedMonth === i ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                    {MONTH_NAMES[p.month]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Timeline list */}
          <div className="relative mt-1">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-border/40 via-border/20 to-transparent" />
            {projections.map((p, i) => {
              const rs = riskStyle(p.risk);
              const isExpanded = expandedMonth === i;
              const isCurrent = i === 0;
              return (
                <div key={`tl-${p.month}-${p.year}`} className="relative">
                  <button
                    onClick={() => setExpandedMonth(isExpanded ? null : i)}
                    className="w-full flex items-center gap-3 py-2.5 border-b border-border/5 last:border-0 group text-left hover:bg-secondary/20 rounded-lg transition-colors px-1 -mx-1"
                  >
                    <div className="relative z-10 flex-shrink-0 w-4 flex justify-center">
                      <div className={`w-2.5 h-2.5 rounded-full ${rs.dot} transition-all duration-300 group-hover:scale-125 ${isCurrent ? "ring-2 ring-foreground/20" : ""}`} />
                    </div>
                    <div className="w-14 flex-shrink-0">
                      <span className={`text-xs font-semibold ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                        {MONTH_NAMES[p.month]}
                      </span>
                      <span className="text-[9px] text-muted-foreground/50 ml-1">{p.year}</span>
                    </div>
                    <div className="flex-1 text-right">
                      <p className={`text-sm font-bold tabular-nums ${rs.text}`}>{fmtCurrency(p.balance)}</p>
                    </div>
                    <div className="flex items-center gap-1 w-20 justify-end flex-shrink-0">
                      <span className={`text-[10px] font-medium tabular-nums ${deltaColor(p.delta)}`}>
                        {p.delta >= 0 ? "+" : ""}{fmtCurrency(p.delta)}
                      </span>
                      <TrendIcon delta={p.delta} />
                    </div>
                    <ChevronDown className={`w-3 h-3 text-muted-foreground/30 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>

                  {/* ── 2. DRILLDOWN ── */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-7 mb-2 grid grid-cols-3 gap-2">
                          <div className="bg-secondary/40 rounded-xl p-2.5 text-center">
                            <p className="text-[9px] text-muted-foreground mb-0.5">Receitas</p>
                            <p className="text-xs font-bold tabular-nums text-foreground">{fmtCurrency(p.income)}</p>
                          </div>
                          <div className="bg-secondary/40 rounded-xl p-2.5 text-center">
                            <p className="text-[9px] text-muted-foreground mb-0.5">Despesas</p>
                            <p className="text-xs font-bold tabular-nums text-destructive">{fmtCurrency(p.expense)}</p>
                          </div>
                          <div className="bg-secondary/40 rounded-xl p-2.5 text-center">
                            <p className="text-[9px] text-muted-foreground mb-0.5">Balanço</p>
                            <p className={`text-xs font-bold tabular-nums ${p.delta >= 0 ? "text-foreground" : "text-destructive"}`}>
                              {p.delta >= 0 ? "+" : ""}{fmtCurrency(p.delta)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </GlassSection>

        {/* ── 3. INSIGHT INTELIGENTE ── */}
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

        {/* ── 4. LIMITE DIÁRIO COM OBJETIVO ── */}
        <GlassSection delay={0.18}>
          <SectionHeader icon={<Wallet className="w-4 h-4 text-foreground" />} title="Limite Diário" />

          <div className="text-center py-2">
            <p className={`text-3xl font-bold font-display transition-colors duration-500 ${lt.text}`}>
              {formattedSafe}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              por dia · {dailyLimit.daysLeft} dias restantes no mês
            </p>
          </div>

          {/* Progress */}
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

          {/* Objective indicator */}
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-3.5 h-3.5 flex-shrink-0 ${lt.text}`} />
            <motion.p
              key={dailyLimit.tone}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-xs font-medium ${lt.text}`}
            >
              {dailyLimit.message}
            </motion.p>
          </div>

          {/* Remaining budget */}
          <div className="bg-secondary/30 rounded-xl px-3 py-2 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Orçamento restante do mês</span>
            <span className="text-xs font-bold tabular-nums text-foreground">
              {fmtCurrency(Math.max(data.saldoAtual - data.despesasPendentes, 0))}
            </span>
          </div>
        </GlassSection>

        {/* ── 5. SIMULAÇÃO INTERATIVA ── */}
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

        {/* ── 6. INCENTIVO DE ECONOMIA ── */}
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

        {/* ── 7. AÇÕES RÁPIDAS ── */}
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
