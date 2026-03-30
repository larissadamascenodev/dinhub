import { useState, useMemo } from "react";
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
  Heart,
  Zap,
  Brain,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useMonth } from "@/contexts/MonthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useFormattedCounter, useAnimatedCounter } from "@/hooks/useAnimatedCounter";

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

interface MonthProjection {
  month: number;
  year: number;
  balance: number;
  delta: number;
  income: number;
  expense: number;
  risk: "positivo" | "atencao" | "risco";
}

// ─── Helpers ───
const fmtCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const TrendIcon = ({ delta }: { delta: number }) => {
  if (delta > 500) return <ArrowUpRight className="w-3.5 h-3.5 text-primary" />;
  if (delta > 0) return <TrendingUp className="w-3.5 h-3.5 text-primary" />;
  if (delta === 0) return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  if (delta > -500) return <TrendingDown className="w-3.5 h-3.5 text-destructive" />;
  return <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />;
};

// ─── Reusable glass section ───
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

const BotFinanceProjecoes = () => {
  const navigate = useNavigate();
  const { selectedMonth, selectedYear } = useMonth();
  const { data } = useFinanceData(selectedMonth, selectedYear);

  const [savingsBoost, setSavingsBoost] = useState(0);
  const [incomeBoost, setIncomeBoost] = useState(0);

  // ─── 6-month projection ───
  const projections = useMemo<MonthProjection[]>(() => {
    const avgIncome = data.projection.avgIncome3m || data.receitas;
    const avgExpense = data.projection.avgExpense3m || data.despesas;
    const incomeWithBoost = avgIncome + incomeBoost;
    const expenseWithBoost = avgExpense - savingsBoost;
    const monthlyNet = incomeWithBoost - expenseWithBoost;

    let balance = data.saldoPrevisto;
    const result: MonthProjection[] = [];

    for (let i = 0; i < 6; i++) {
      const d = new Date(selectedYear, selectedMonth + i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const isFirst = i === 0;
      const projected = isFirst ? balance : balance + monthlyNet;
      const delta = isFirst ? data.balanco : monthlyNet;
      const income = isFirst ? data.receitas : incomeWithBoost;
      const expense = isFirst ? data.despesas : expenseWithBoost;

      // Risk classification
      const risk: MonthProjection["risk"] =
        delta > 0 ? "positivo" : delta > -200 ? "atencao" : "risco";

      result.push({
        month: m,
        year: y,
        balance: isFirst ? balance : projected,
        delta,
        income,
        expense,
        risk,
      });

      if (!isFirst) balance = projected;
    }

    return result;
  }, [data, selectedMonth, selectedYear, savingsBoost, incomeBoost]);

  // ─── Daily limit ───
  const today = new Date();
  const daysLeft = useMemo(() => {
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const currentDay =
      today.getMonth() === selectedMonth && today.getFullYear() === selectedYear
        ? today.getDate()
        : 1;
    return Math.max(lastDay - currentDay, 1);
  }, [selectedMonth, selectedYear]);

  const limitRestante = Math.max(data.saldoAtual - data.despesasPendentes + savingsBoost, 0);
  const safeToSpend = limitRestante / daysLeft;
  const formattedSafe = useFormattedCounter(safeToSpend);

  const limitTone = safeToSpend > 200 ? "positive" : safeToSpend > 50 ? "neutral" : "negative";
  const limitMsg =
    limitTone === "positive"
      ? "Tá com folga hoje 👏"
      : limitTone === "negative"
        ? "Melhor segurar um pouco hoje 😅"
        : "Gaste com consciência 👀";

  // ─── Month projection ───
  const saldoInicial = data.previousMonthEndingBalance;
  const balanco = data.balanco;
  const saldoFinal = saldoInicial + balanco + savingsBoost + incomeBoost;

  // ─── Health score (0–100) ───
  const healthScore = useMemo(() => {
    let score = 50;
    // Positive balance = good
    if (balanco > 0) score += Math.min(balanco / 100, 25);
    else score += Math.max(balanco / 100, -25);
    // Low pending expenses ratio
    const pendingRatio = data.despesas > 0 ? data.despesasPendentes / data.despesas : 0;
    score += (1 - pendingRatio) * 15;
    // Savings boost bonus
    if (savingsBoost > 0) score += Math.min(savingsBoost / 200, 10);
    return Math.round(Math.max(0, Math.min(100, score)));
  }, [balanco, data.despesas, data.despesasPendentes, savingsBoost]);

  const animatedScore = useAnimatedCounter(healthScore);
  const scoreLabel =
    healthScore >= 75 ? "Excelente" : healthScore >= 50 ? "Estável" : healthScore >= 30 ? "Atenção" : "Crítico";
  const scoreColor =
    healthScore >= 75
      ? "text-primary"
      : healthScore >= 50
        ? "text-warning"
        : "text-destructive";

  // ─── Insight ───
  const insight = useMemo(() => {
    const endBalance = projections[projections.length - 1]?.balance ?? 0;
    if (endBalance > data.saldoAtual * 1.1)
      return { text: "Se continuar assim, seu saldo cresce mês a mês 👏", tone: "positive" as const };
    if (endBalance > 0)
      return { text: "Se reduzir um pouco aqui, sobra bem mais no final 💡", tone: "neutral" as const };
    return { text: "Você está gastando mais do que o ideal 😬", tone: "negative" as const };
  }, [projections, data.saldoAtual]);

  const toneClasses = {
    positive: { text: "text-primary", border: "border-l-primary", bg: "bg-primary/8" },
    neutral: { text: "text-warning", border: "border-l-warning", bg: "bg-warning/8" },
    negative: { text: "text-destructive", border: "border-l-destructive", bg: "bg-destructive/8" },
  };

  const hasSimulation = savingsBoost > 0 || incomeBoost > 0;

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

      {/* ── DESKTOP: single column, max-width centered ── */}
      <div className="space-y-4 max-w-3xl mx-auto">

        {/* 1 — TIMELINE */}
        <GlassSection delay={0.05}>
          <SectionHeader icon={<TrendingUp className="w-4 h-4 text-primary" />} title="Timeline de Saldo" />
          <div className="space-y-0">
            {projections.map((p, i) => (
              <motion.div
                key={`${p.month}-${p.year}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + i * 0.04 }}
                className="flex items-center gap-3 py-3 border-b border-border/15 last:border-0 group"
              >
                {/* Dot + line */}
                <div className="flex flex-col items-center gap-0.5 w-4">
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-transform duration-200 group-hover:scale-125 ${
                      i === 0 ? "bg-primary shadow-[0_0_8px_hsl(150_100%_45%/0.4)]" : "bg-muted-foreground/25"
                    }`}
                  />
                  {i < projections.length - 1 && <div className="w-px h-5 bg-border/30" />}
                </div>

                {/* Month */}
                <div className="w-16">
                  <span className={`text-xs font-medium ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                    {MONTH_NAMES[p.month]}
                  </span>
                  <span className="text-[10px] text-muted-foreground/50 ml-1">{p.year}</span>
                </div>

                {/* Balance */}
                <div className="flex-1 text-right">
                  <p className="text-base font-bold tabular-nums">{fmtCurrency(p.balance)}</p>
                </div>

                {/* Trend */}
                <div className="w-8 flex justify-end">
                  <TrendIcon delta={p.delta} />
                </div>
              </motion.div>
            ))}
          </div>
        </GlassSection>

        {/* 2 — INSIGHT IA (destaque com gradiente sutil) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className={`glass-card p-4 border-l-2 ${toneClasses[insight.tone].border}`}
          style={{
            background: "linear-gradient(135deg, hsl(260 60% 50% / 0.06) 0%, transparent 60%)",
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[hsl(260,60%,50%)]/10 flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-[hsl(260,60%,65%)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-[hsl(260,60%,65%)] mb-1">Insight da IA</p>
              <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
            </div>
          </div>
        </motion.div>

        {/* Row: Score + Limite diário (desktop side-by-side) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* 3 — LIMITE DIÁRIO */}
          <GlassSection delay={0.18}>
            <SectionHeader icon={<Wallet className="w-4 h-4 text-primary" />} title="Limite Diário" />
            <div className="text-center py-1">
              <p className="text-3xl font-bold text-primary font-display">{formattedSafe}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{daysLeft} dias restantes</p>
            </div>
            <div
              className={`rounded-xl px-3 py-2 text-center text-xs font-medium ${
                limitTone === "positive"
                  ? "bg-primary/10 text-primary"
                  : limitTone === "negative"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-warning/10 text-warning"
              }`}
            >
              {limitMsg}
            </div>
          </GlassSection>

          {/* 5 — SCORE DE SAÚDE FINANCEIRA */}
          <GlassSection delay={0.22}>
            <SectionHeader icon={<Heart className="w-4 h-4 text-primary" />} title="Saúde Financeira" />
            <div className="flex items-center justify-center gap-5 py-1">
              {/* Circular score indicator */}
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--secondary))" strokeWidth="5" />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke={
                      healthScore >= 75
                        ? "hsl(var(--primary))"
                        : healthScore >= 50
                          ? "hsl(var(--warning))"
                          : "hsl(var(--destructive))"
                    }
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${(healthScore / 100) * 213.6} 213.6`}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-xl font-bold tabular-nums ${scoreColor}`}>
                    {Math.round(animatedScore)}
                  </span>
                </div>
              </div>
              <div>
                <p className={`text-sm font-bold ${scoreColor}`}>{scoreLabel}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {healthScore >= 75
                    ? "Suas finanças estão ótimas!"
                    : healthScore >= 50
                      ? "Pode melhorar com ajustes"
                      : "Precisa de atenção"}
                </p>
              </div>
            </div>
          </GlassSection>
        </div>

        {/* 4 — SIMULAÇÃO */}
        <GlassSection delay={0.26}>
          <SectionHeader icon={<PiggyBank className="w-4 h-4 text-primary" />} title="Simulação" />

          {/* Quick action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSavingsBoost((p) => Math.min(p + 200, 2000))}
              className="text-xs font-medium py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 active:scale-[0.97] transition-all"
            >
              E se eu economizar?
            </button>
            <button
              onClick={() => setIncomeBoost((p) => Math.min(p + 500, 5000))}
              className="text-xs font-medium py-2.5 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 active:scale-[0.97] transition-all"
            >
              E se eu ganhar mais?
            </button>
          </div>

          {/* Sliders */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] text-muted-foreground">Economia mensal</label>
                <span className="text-xs font-semibold text-primary tabular-nums">{fmtCurrency(savingsBoost)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={2000}
                step={50}
                value={savingsBoost}
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
                type="range"
                min={0}
                max={5000}
                step={100}
                value={incomeBoost}
                onChange={(e) => setIncomeBoost(Number(e.target.value))}
                className="w-full h-1.5 rounded-full bg-secondary appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
              />
            </div>
          </div>

          {/* Simulation result */}
          {hasSimulation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-xl bg-primary/5 border border-primary/10 p-3 space-y-1"
            >
              {savingsBoost > 0 && (
                <p className="text-xs text-foreground">
                  Economia: <span className="font-semibold text-primary">{fmtCurrency(savingsBoost)}</span>
                </p>
              )}
              {incomeBoost > 0 && (
                <p className="text-xs text-foreground">
                  Renda extra: <span className="font-semibold text-primary">{fmtCurrency(incomeBoost)}</span>
                </p>
              )}
              <p className="text-xs font-semibold pt-1 border-t border-primary/10">
                Saldo final → <span className="text-primary">{fmtCurrency(saldoFinal)}</span>
              </p>
            </motion.div>
          )}

          {hasSimulation && (
            <button
              onClick={() => { setSavingsBoost(0); setIncomeBoost(0); }}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Resetar simulação
            </button>
          )}
        </GlassSection>

        {/* 6 — AÇÕES RÁPIDAS */}
        <GlassSection delay={0.3}>
          <SectionHeader icon={<Zap className="w-4 h-4 text-primary" />} title="Ações Rápidas" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              {
                label: "Nova transação",
                desc: "Registrar receita ou despesa",
                action: () => window.dispatchEvent(new CustomEvent("open-nova-transacao-direct", { detail: { type: "despesa" } })),
              },
              {
                label: "Ver transações",
                desc: "Histórico completo",
                action: () => navigate("/transacoes"),
              },
              {
                label: "Gestão financeira",
                desc: "Contas e cartões",
                action: () => navigate("/gestao"),
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="group flex items-center gap-2.5 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 active:scale-[0.97] transition-all text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{item.desc}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </GlassSection>
      </div>
    </div>
  );
};

export default BotFinanceProjecoes;
