import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Sparkles, Wallet, Sliders } from "lucide-react";
import { useMonth } from "@/contexts/MonthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useFormattedCounter } from "@/hooks/useAnimatedCounter";

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface MonthProjection {
  month: number;
  year: number;
  label: string;
  balance: number;
  delta: number;
}

const BotFinanceProjecoes = () => {
  const navigate = useNavigate();
  const { selectedMonth, selectedYear } = useMonth();
  const { data } = useFinanceData(selectedMonth, selectedYear);

  const [savingsBoost, setSavingsBoost] = useState(0);
  const [incomeBoost, setIncomeBoost] = useState(0);

  // Build 6-month projection timeline
  const projections = useMemo<MonthProjection[]>(() => {
    const avgIncome = data.projection.avgIncome3m || data.receitas;
    const avgExpense = data.projection.avgExpense3m || data.despesas;
    const monthlyNet = (avgIncome + incomeBoost) - (avgExpense - savingsBoost);

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

  // Dynamic daily spending limit
  const today = new Date();
  const daysLeft = useMemo(() => {
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const currentDay = today.getMonth() === selectedMonth && today.getFullYear() === selectedYear
      ? today.getDate()
      : 1;
    return Math.max(lastDay - currentDay, 1);
  }, [selectedMonth, selectedYear, today]);

  const safeToSpend = Math.max(
    (data.saldoAtual - data.despesasPendentes + savingsBoost) / daysLeft,
    0
  );
  const formattedSafe = useFormattedCounter(safeToSpend);

  // Insight text
  const insight = useMemo(() => {
    const endBalance = projections[projections.length - 1]?.balance ?? 0;
    if (endBalance > data.saldoAtual * 1.1) {
      return { text: "Se continuar assim, você termina os próximos meses com folga 👏", tone: "positive" as const };
    }
    if (endBalance > 0) {
      return { text: "Seu saldo se mantém estável. Pequenas economias podem fazer diferença! 💡", tone: "neutral" as const };
    }
    return { text: "Se continuar nesse ritmo… melhor segurar um pouco 😅", tone: "negative" as const };
  }, [projections, data.saldoAtual]);

  return (
    <div className="space-y-5 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate("/bot-finance")} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div>
          <h1 className="font-display text-lg font-bold">Projeções</h1>
          <p className="text-[11px] text-muted-foreground">Previsão dos próximos 6 meses</p>
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold font-display">Timeline</h2>
        </div>
        <div className="space-y-0">
          {projections.map((p, i) => {
            const isPositive = p.delta >= 0;
            return (
              <motion.div
                key={`${p.month}-${p.year}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0"
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center gap-0.5 w-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                  {i < projections.length - 1 && <div className="w-px h-4 bg-border/50" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-medium ${i === 0 ? "text-primary" : "text-foreground"}`}>
                    {p.label}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {p.balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                  <div className={`flex items-center gap-0.5 justify-end text-[10px] ${
                    isPositive ? "text-primary" : "text-destructive"
                  }`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{isPositive ? "+" : ""}{p.delta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Dynamic Limit */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold font-display">Limite Diário</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Hoje você pode gastar até
        </p>
        <p className="text-2xl font-bold text-primary mt-1 font-display">{formattedSafe}</p>
        <p className="text-[10px] text-muted-foreground mt-1">
          sem comprometer seu mês ({daysLeft} dias restantes)
        </p>
      </motion.div>

      {/* Simulation */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold font-display">Simulação</h2>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-muted-foreground">Se você economizar por mês</label>
              <span className="text-xs font-semibold text-primary tabular-nums">
                {savingsBoost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
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
              <label className="text-xs text-muted-foreground">Se aumentar sua renda</label>
              <span className="text-xs font-semibold text-primary tabular-nums">
                {incomeBoost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
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
      </motion.div>

      {/* Insight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`glass-card p-4 border-l-2 ${
          insight.tone === "positive" ? "border-l-primary" :
          insight.tone === "negative" ? "border-l-destructive" : "border-l-warning"
        }`}
      >
        <div className="flex items-start gap-2.5">
          <Sparkles className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
            insight.tone === "positive" ? "text-primary" :
            insight.tone === "negative" ? "text-destructive" : "text-warning"
          }`} />
          <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default BotFinanceProjecoes;
