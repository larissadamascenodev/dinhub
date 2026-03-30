import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  Zap,
  Brain,
  ChevronRight,
  RotateCcw,
  Target,
  Scissors,
  Settings2,
} from "lucide-react";
import { useFinancialProjection } from "@/hooks/useFinancialProjection";
import { useFormattedCounter } from "@/hooks/useAnimatedCounter";

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const fmtCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const TrendIcon = ({ delta }: { delta: number }) => {
  if (delta > 500) return <ArrowUpRight className="w-3.5 h-3.5 text-primary" />;
  if (delta > 0) return <TrendingUp className="w-3.5 h-3.5 text-primary" />;
  if (delta === 0) return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  if (delta > -500) return <TrendingDown className="w-3.5 h-3.5 text-destructive" />;
  return <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />;
};

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

const SectionHeader = ({
  icon,
  title,
  accent = false,
}: {
  icon: React.ReactNode;
  title: string;
  accent?: boolean;
}) => (
  <div className="flex items-center gap-2">
    {icon}
    <h2 className={`text-sm font-semibold font-display ${accent ? "bg-gradient-to-r from-[hsl(260,80%,65%)] to-[hsl(200,80%,60%)] bg-clip-text text-transparent" : ""}`}>
      {title}
    </h2>
  </div>
);

const riskColors = {
  positivo: { dot: "bg-primary", text: "text-primary", glow: "shadow-[0_0_10px_hsl(150_100%_45%/0.4)]" },
  atencao: { dot: "bg-warning", text: "text-warning", glow: "shadow-[0_0_10px_hsl(40_80%_50%/0.4)]" },
  risco: { dot: "bg-destructive", text: "text-destructive", glow: "shadow-[0_0_10px_hsl(0_60%_50%/0.4)]" },
};

const toneClasses = {
  positive: { text: "text-primary", border: "border-l-primary", bg: "bg-primary/8" },
  neutral: { text: "text-warning", border: "border-l-warning", bg: "bg-warning/8" },
  negative: { text: "text-destructive", border: "border-l-destructive", bg: "bg-destructive/8" },
};

import { useState } from "react";

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

  // Animated values
  const formattedSafe = useFormattedCounter(dailyLimit.safeToSpend);

  // Derived UI classes
  const limitBarColor =
    dailyLimit.tone === "positive" ? "bg-primary" : dailyLimit.tone === "neutral" ? "bg-warning" : "bg-destructive";
  const limitTextColor =
    dailyLimit.tone === "positive" ? "text-primary" : dailyLimit.tone === "neutral" ? "text-warning" : "text-destructive";
  const limitBgColor =
    dailyLimit.tone === "positive" ? "bg-primary/10" : dailyLimit.tone === "neutral" ? "bg-warning/10" : "bg-destructive/10";

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

        {/* 1 — TIMELINE */}
        <GlassSection delay={0.05}>
          <SectionHeader icon={<TrendingUp className="w-4 h-4 text-primary" />} title="Timeline de Saldo" />
          <div className="relative">
            <div className="absolute left-[7px] top-4 bottom-4 w-px bg-gradient-to-b from-primary/30 via-border/20 to-transparent" />
            {projections.map((p, i) => {
              const rc = riskColors[p.risk];
              const isExpanded = expandedMonth === i;
              const isCurrent = i === 0;
              return (
                <motion.div
                  key={`${p.month}-${p.year}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.05 }}
                  className="relative"
                >
                  <button
                    onClick={() => setExpandedMonth(isExpanded ? null : i)}
                    className="w-full flex items-center gap-3 py-3 border-b border-border/10 last:border-0 group text-left hover:bg-secondary/20 rounded-lg transition-colors px-1 -mx-1"
                  >
                    <div className="relative z-10 flex-shrink-0 w-4 flex justify-center">
                      <div className={`w-3 h-3 rounded-full ${rc.dot} ${rc.glow} transition-all duration-300 group-hover:scale-125 ${isCurrent ? "animate-pulse" : ""}`} />
                    </div>
                    <div className="w-14 flex-shrink-0">
                      <span className={`text-xs font-semibold ${isCurrent ? rc.text : "text-muted-foreground"}`}>{MONTH_NAMES[p.month]}</span>
                      <span className="text-[9px] text-muted-foreground/50 ml-1">{p.year}</span>
                    </div>
                    <div className="flex-1 text-right">
                      <p className={`text-base font-bold tabular-nums ${rc.text}`}>{fmtCurrency(p.balance)}</p>
                    </div>
                    <div className="flex items-center gap-1 w-24 justify-end flex-shrink-0">
                      <span className={`text-[10px] font-medium tabular-nums ${p.delta >= 0 ? "text-primary" : "text-destructive"}`}>
                        {p.delta >= 0 ? "+" : ""}{fmtCurrency(p.delta)}
                      </span>
                      <TrendIcon delta={p.delta} />
                    </div>
                  </button>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="ml-7 mb-2 grid grid-cols-3 gap-2"
                    >
                      <div className="bg-secondary/40 rounded-xl p-2.5 text-center">
                        <p className="text-[9px] text-muted-foreground mb-0.5">Receitas</p>
                        <p className="text-xs font-bold tabular-nums text-primary">{fmtCurrency(p.income)}</p>
                      </div>
                      <div className="bg-secondary/40 rounded-xl p-2.5 text-center">
                        <p className="text-[9px] text-muted-foreground mb-0.5">Despesas</p>
                        <p className="text-xs font-bold tabular-nums text-destructive">{fmtCurrency(p.expense)}</p>
                      </div>
                      <div className="bg-secondary/40 rounded-xl p-2.5 text-center">
                        <p className="text-[9px] text-muted-foreground mb-0.5">Acumulado</p>
                        <p className={`text-xs font-bold tabular-nums ${p.balance >= 0 ? "text-primary" : "text-destructive"}`}>{fmtCurrency(p.balance)}</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </GlassSection>

        {/* 2 — INSIGHT IA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className={`glass-card p-5 border-l-2 ${toneClasses[insight.tone].border} overflow-hidden relative`}
          style={{ background: "linear-gradient(135deg, hsl(260 60% 50% / 0.06) 0%, transparent 60%)" }}
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[hsl(260,60%,50%)]/5 blur-2xl pointer-events-none" />
          <div className="relative flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[hsl(260,60%,50%)]/10 flex items-center justify-center flex-shrink-0">
              <Brain className="w-4.5 h-4.5 text-[hsl(260,60%,65%)]" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(260,60%,65%)]">Insight da IA</p>
              <p className="text-sm text-foreground leading-relaxed font-medium">{insight.text}</p>
              <div className="flex items-start gap-2 pt-1 border-t border-border/10">
                <Sparkles className="w-3 h-3 text-[hsl(260,60%,65%)] mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">{insight.tip}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Limite diário */}
        <GlassSection delay={0.18}>
          <SectionHeader icon={<Wallet className="w-4 h-4 text-primary" />} title="Limite Diário" />
          <div className="text-center py-2">
            <p className={`text-3xl font-bold font-display transition-colors duration-500 ${limitTextColor}`}>{formattedSafe}</p>
            <p className="text-[10px] text-muted-foreground mt-1">por dia · {dailyLimit.daysLeft} dias restantes</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Gasto hoje</span>
              <span className={`font-semibold tabular-nums ${limitTextColor}`}>
                {fmtCurrency(data.gastosHoje)} / {formattedSafe}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dailyLimit.spendRatio * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${limitBarColor} transition-colors duration-500 ${dailyLimit.tone === "negative" ? "animate-pulse" : ""}`}
              />
            </div>
          </div>
          <motion.div
            key={dailyLimit.tone}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className={`rounded-xl px-3 py-2.5 text-center text-xs font-medium ${limitBgColor} ${limitTextColor}`}
          >
            {dailyLimit.message}
          </motion.div>
        </GlassSection>

        {/* 4 — SIMULAÇÃO */}
        <GlassSection delay={0.26} className={simulation.hasSimulation ? "relative overflow-hidden" : ""}>
          {simulation.hasSimulation && (
            <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary/5 blur-3xl pointer-events-none transition-opacity duration-500" />
          )}
          <div className="relative">
            <SectionHeader icon={<PiggyBank className="w-4 h-4 text-primary" />} title="Simulação Financeira" />
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={() => setSavingsBoost((p) => Math.min(p + 200, 2000))}
                className="text-xs font-medium py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 active:scale-[0.97] transition-all"
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
                  <span className="text-xs font-semibold text-primary tabular-nums">{fmtCurrency(savingsBoost)}</span>
                </div>
                <input
                  type="range" min={0} max={2000} step={50} value={savingsBoost}
                  onChange={(e) => setSavingsBoost(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full bg-secondary appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] text-muted-foreground">Renda extra</label>
                  <span className="text-xs font-semibold text-primary tabular-nums">{fmtCurrency(incomeBoost)}</span>
                </div>
                <input
                  type="range" min={0} max={5000} step={100} value={incomeBoost}
                  onChange={(e) => setIncomeBoost(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full bg-secondary appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
                />
              </div>
            </div>

            {simulation.hasSimulation && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 rounded-xl bg-primary/5 border border-primary/15 p-4 space-y-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-secondary/40 rounded-xl p-2.5 text-center">
                    <p className="text-[9px] text-muted-foreground mb-0.5">Impacto em 3 meses</p>
                    <p className="text-sm font-bold tabular-nums text-primary">+{fmtCurrency(simulation.impact3m)}</p>
                  </div>
                  <div className="bg-secondary/40 rounded-xl p-2.5 text-center">
                    <p className="text-[9px] text-muted-foreground mb-0.5">Impacto em 6 meses</p>
                    <p className="text-sm font-bold tabular-nums text-primary">+{fmtCurrency(simulation.impact6m)}</p>
                  </div>
                </div>
                <div className="border-t border-primary/10 pt-2 space-y-1">
                  {savingsBoost > 0 && (
                    <p className="text-[11px] text-foreground">
                      💰 Economizando <span className="font-semibold text-primary">{fmtCurrency(savingsBoost)}</span>/mês
                    </p>
                  )}
                  {incomeBoost > 0 && (
                    <p className="text-[11px] text-foreground">
                      📈 Renda extra de <span className="font-semibold text-primary">{fmtCurrency(incomeBoost)}</span>/mês
                    </p>
                  )}
                  <p className="text-xs font-semibold pt-1">
                    Saldo final do mês → <span className="text-primary">{fmtCurrency(simulation.saldoFinal)}</span>
                    <span className="text-[10px] text-muted-foreground ml-1.5">(antes: {fmtCurrency(simulation.saldoFinalBase)})</span>
                  </p>
                </div>
              </motion.div>
            )}

            {simulation.hasSimulation && (
              <button
                onClick={resetSimulation}
                className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Resetar simulação
              </button>
            )}
          </div>
        </GlassSection>

        {/* 6 — AÇÕES INTELIGENTES */}
        <GlassSection delay={0.3}>
          <SectionHeader icon={<Zap className="w-4 h-4 text-primary" />} title="Ações Inteligentes" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              {
                icon: Target, label: "Criar meta", desc: "Com base na sua projeção",
                color: "text-primary", bgColor: "bg-primary/10 group-hover:bg-primary/20",
                action: () => navigate("/bot-finance"),
              },
              {
                icon: Settings2, label: "Ajustar limite", desc: "Configurar gasto diário",
                color: "text-warning", bgColor: "bg-warning/10 group-hover:bg-warning/20",
                action: () => {
                  const el = document.querySelector('[data-section="limite"]');
                  el?.scrollIntoView({ behavior: "smooth" });
                },
              },
              {
                icon: Scissors, label: "Reduzir gastos", desc: "Sugestões automáticas",
                color: "text-destructive", bgColor: "bg-destructive/10 group-hover:bg-destructive/20",
                action: () => navigate("/transacoes"),
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 active:scale-[0.96] transition-all text-left relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at 30% 50%, hsl(var(--primary) / 0.06) 0%, transparent 70%)" }}
                  />
                  <div className={`relative w-9 h-9 rounded-xl ${item.bgColor} flex items-center justify-center flex-shrink-0 transition-colors`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{item.desc}</p>
                  </div>
                  <ChevronRight className="relative w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0" />
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
