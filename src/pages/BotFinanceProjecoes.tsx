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
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { useMonth } from "@/contexts/MonthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useFormattedCounter } from "@/hooks/useAnimatedCounter";

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

interface MonthProjection {
  month: number;
  year: number;
  label: string;
  balance: number;
  delta: number;
}

// ─── Trend icon helper ───
const TrendIcon = ({ delta }: { delta: number }) => {
  if (delta > 500) return <ArrowUpRight className="w-3.5 h-3.5 text-primary" />;
  if (delta > 0) return <TrendingUp className="w-3.5 h-3.5 text-primary" />;
  if (delta === 0) return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  if (delta > -500) return <TrendingDown className="w-3.5 h-3.5 text-destructive" />;
  return <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />;
};

// ─── Section wrapper ───
const Section = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className="glass-card p-4 space-y-3"
  >
    {children}
  </motion.div>
);

const SectionTitle = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <div className="flex items-center gap-2">
    {icon}
    <h2 className="text-sm font-semibold font-display">{title}</h2>
  </div>
);

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
    const monthlyNet = avgIncome + incomeBoost - (avgExpense - savingsBoost);

    let balance = data.saldoPrevisto;
    const result: MonthProjection[] = [];

    for (let i = 0; i < 6; i++) {
      const d = new Date(selectedYear, selectedMonth + i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const isFirst = i === 0;
      const projected = isFirst ? balance : balance + monthlyNet;
      const delta = isFirst ? data.balanco : monthlyNet;

      result.push({
        month: m,
        year: y,
        label: `${MONTH_NAMES[m]} ${y}`,
        balance: isFirst ? balance : projected,
        delta,
      });

      if (!isFirst) balance = projected;
    }

    return result;
  }, [data, selectedMonth, selectedYear, savingsBoost, incomeBoost]);

  // ─── Daily spending limit ───
  const today = new Date();
  const daysLeft = useMemo(() => {
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const currentDay =
      today.getMonth() === selectedMonth &&
      today.getFullYear() === selectedYear
        ? today.getDate()
        : 1;
    return Math.max(lastDay - currentDay, 1);
  }, [selectedMonth, selectedYear]);

  const limitRestante = Math.max(
    data.saldoAtual - data.despesasPendentes + savingsBoost,
    0
  );
  const safeToSpend = limitRestante / daysLeft;
  const formattedSafe = useFormattedCounter(safeToSpend);

  const limitMessage = useMemo(() => {
    if (safeToSpend > 200)
      return { text: "Tá com folga hoje 👏", tone: "positive" as const };
    if (safeToSpend > 50)
      return {
        text: `Hoje você pode gastar até ${formattedSafe} sem comprometer seu mês 👀`,
        tone: "neutral" as const,
      };
    return {
      text: "Melhor segurar um pouco hoje 😅",
      tone: "negative" as const,
    };
  }, [safeToSpend, formattedSafe]);

  // ─── Month projection block ───
  const saldoInicial = data.previousMonthEndingBalance;
  const balanco = data.balanco;
  const saldoFinal = saldoInicial + balanco + savingsBoost + incomeBoost;

  const fmtCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // ─── Insight ───
  const insight = useMemo(() => {
    const endBalance = projections[projections.length - 1]?.balance ?? 0;
    if (endBalance > data.saldoAtual * 1.1) {
      return {
        text: "Se continuar assim, seu saldo cresce mês a mês 👏",
        tone: "positive" as const,
      };
    }
    if (endBalance > 0) {
      return {
        text: "Se reduzir um pouco aqui, sobra bem mais no final 💡",
        tone: "neutral" as const,
      };
    }
    return {
      text: "Você está gastando mais do que o ideal 😬",
      tone: "negative" as const,
    };
  }, [projections, data.saldoAtual]);

  const toneColor = (tone: "positive" | "neutral" | "negative") =>
    tone === "positive"
      ? "text-primary"
      : tone === "negative"
        ? "text-destructive"
        : "text-warning";

  const toneBorder = (tone: "positive" | "neutral" | "negative") =>
    tone === "positive"
      ? "border-l-primary"
      : tone === "negative"
        ? "border-l-destructive"
        : "border-l-warning";

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => navigate("/bot-finance")}
          className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div>
          <h1 className="font-display text-lg font-bold">Projeções</h1>
          <p className="text-[11px] text-muted-foreground">
            Previsão dos próximos 6 meses
          </p>
        </div>
      </motion.div>

      {/* Desktop: 2 columns */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left column: Timeline */}
        <div className="flex-1 space-y-4">
          {/* BLOCO 1 — TIMELINE */}
          <Section delay={0.05}>
            <SectionTitle
              icon={<TrendingUp className="w-4 h-4 text-primary" />}
              title="Timeline de Saldo"
            />
            <div className="space-y-0">
              {projections.map((p, i) => {
                const isPositive = p.delta >= 0;
                return (
                  <motion.div
                    key={`${p.month}-${p.year}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.04 }}
                    className="flex items-center gap-3 py-3 border-b border-border/20 last:border-0"
                  >
                    {/* Dot */}
                    <div className="flex flex-col items-center gap-0.5 w-4">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          i === 0 ? "bg-primary" : "bg-muted-foreground/25"
                        }`}
                      />
                      {i < projections.length - 1 && (
                        <div className="w-px h-5 bg-border/40" />
                      )}
                    </div>

                    {/* Month label */}
                    <div className="w-16">
                      <span
                        className={`text-xs font-medium ${
                          i === 0 ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {MONTH_NAMES[p.month]}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 ml-1">
                        {p.year}
                      </span>
                    </div>

                    {/* Balance — primary visual element */}
                    <div className="flex-1 text-right">
                      <p className="text-base font-bold tabular-nums">
                        {fmtCurrency(p.balance)}
                      </p>
                    </div>

                    {/* Trend */}
                    <div className="flex items-center gap-1 w-10 justify-end">
                      <TrendIcon delta={p.delta} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Section>

          {/* BLOCO 3 — PROJEÇÃO DO MÊS */}
          <Section delay={0.15}>
            <SectionTitle
              icon={<DollarSign className="w-4 h-4 text-primary" />}
              title="Projeção do Mês"
            />
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: "Saldo Inicial",
                  value: saldoInicial,
                  color: "text-foreground",
                },
                {
                  label: "Balanço",
                  value: balanco,
                  color: balanco >= 0 ? "text-primary" : "text-destructive",
                },
                {
                  label: "Saldo Final",
                  value: saldoFinal,
                  color: saldoFinal >= 0 ? "text-primary" : "text-destructive",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-secondary/40 rounded-xl p-3 text-center"
                >
                  <p className="text-[10px] text-muted-foreground mb-1">
                    {item.label}
                  </p>
                  <p className={`text-sm font-bold tabular-nums ${item.color}`}>
                    {fmtCurrency(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Right column */}
        <div className="flex-1 space-y-4">
          {/* BLOCO 2 — LIMITE DINÂMICO */}
          <Section delay={0.1}>
            <SectionTitle
              icon={<Wallet className="w-4 h-4 text-primary" />}
              title="Limite Diário"
            />
            <div className="text-center py-2">
              <p className="text-3xl font-bold text-primary font-display">
                {formattedSafe}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {daysLeft} dias restantes no mês
              </p>
            </div>
            <div
              className={`rounded-lg px-3 py-2 text-center text-xs ${
                limitMessage.tone === "positive"
                  ? "bg-primary/10 text-primary"
                  : limitMessage.tone === "negative"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-warning/10 text-warning"
              }`}
            >
              {limitMessage.text}
            </div>
          </Section>

          {/* BLOCO 4 — SIMULAÇÃO */}
          <Section delay={0.2}>
            <SectionTitle
              icon={<PiggyBank className="w-4 h-4 text-primary" />}
              title="Simulação"
            />

            {/* Quick action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setSavingsBoost((p) => Math.min(p + 200, 2000))
                }
                className="flex-1 text-xs font-medium py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                E se eu economizar?
              </button>
              <button
                onClick={() =>
                  setIncomeBoost((p) => Math.min(p + 500, 5000))
                }
                className="flex-1 text-xs font-medium py-2.5 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              >
                E se eu ganhar mais?
              </button>
            </div>

            {/* Sliders */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] text-muted-foreground">
                    Economia mensal
                  </label>
                  <span className="text-xs font-semibold text-primary tabular-nums">
                    {fmtCurrency(savingsBoost)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2000}
                  step={50}
                  value={savingsBoost}
                  onChange={(e) => setSavingsBoost(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full bg-secondary appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] text-muted-foreground">
                    Renda extra
                  </label>
                  <span className="text-xs font-semibold text-primary tabular-nums">
                    {fmtCurrency(incomeBoost)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5000}
                  step={100}
                  value={incomeBoost}
                  onChange={(e) => setIncomeBoost(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full bg-secondary appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg"
                />
              </div>
            </div>

            {/* Simulation result */}
            {(savingsBoost > 0 || incomeBoost > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-xs text-foreground"
              >
                {savingsBoost > 0 && (
                  <p>
                    Se você economizar{" "}
                    <span className="font-semibold text-primary">
                      {fmtCurrency(savingsBoost)}
                    </span>
                    :
                  </p>
                )}
                {incomeBoost > 0 && (
                  <p>
                    Se aumentar sua renda em{" "}
                    <span className="font-semibold text-primary">
                      {fmtCurrency(incomeBoost)}
                    </span>
                    :
                  </p>
                )}
                <p className="mt-1 font-semibold">
                  Saldo final →{" "}
                  <span className="text-primary">
                    {fmtCurrency(saldoFinal)}
                  </span>
                </p>
              </motion.div>
            )}

            {/* Reset */}
            {(savingsBoost > 0 || incomeBoost > 0) && (
              <button
                onClick={() => {
                  setSavingsBoost(0);
                  setIncomeBoost(0);
                }}
                className="text-[10px] text-muted-foreground underline hover:text-foreground transition-colors"
              >
                Resetar simulação
              </button>
            )}
          </Section>

          {/* BLOCO 5 — INSIGHT */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`glass-card p-4 border-l-2 ${toneBorder(insight.tone)}`}
          >
            <div className="flex items-start gap-2.5">
              <Sparkles
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${toneColor(insight.tone)}`}
              />
              <p className="text-sm text-foreground leading-relaxed">
                {insight.text}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BotFinanceProjecoes;
