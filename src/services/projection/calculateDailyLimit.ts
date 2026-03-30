/**
 * Safe daily spending limit calculator.
 */

import type { DashboardData } from "@/types/finance";
import type { DailyLimitResult } from "./types";

/**
 * Calculate safe daily spending limit.
 * Formula: (saldo + receitas_pendentes - despesas_pendentes - objetivo_guardar) / dias_restantes
 */
export function getDailyLimit(
  data: DashboardData,
  selectedMonth: number,
  selectedYear: number,
  savingsGoal: number = 0
): DailyLimitResult {
  const today = new Date();
  const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const currentDay =
    today.getMonth() === selectedMonth && today.getFullYear() === selectedYear
      ? today.getDate()
      : 1;
  const daysLeft = Math.max(lastDay - currentDay, 1);

  const available = Math.max(
    data.saldoAtual + data.receitasPendentes - data.despesasPendentes - savingsGoal,
    0
  );
  const safeToSpend = available / daysLeft;

  const gastoHoje = data.gastosHoje;
  const spendRatio = safeToSpend > 0 ? Math.min(gastoHoje / safeToSpend, 1) : 1;

  const tone: DailyLimitResult["tone"] =
    gastoHoje <= safeToSpend * 0.7 ? "positive"
    : gastoHoje <= safeToSpend ? "neutral"
    : "negative";

  let message: string;
  if (savingsGoal > 0) {
    if (tone === "positive") {
      message = "Tá no caminho certo pra guardar o que planejou 😎";
    } else if (tone === "neutral") {
      message = "Cuidado — se passar disso hoje, começa a mexer no que queria guardar 👀";
    } else {
      message = "Passou do limite — tá comprometendo sua meta de economia 💸";
    }
  } else {
    if (tone === "positive") {
      message = "Tá suave hoje 😎";
    } else if (tone === "neutral") {
      message = "Já acelerou um pouco hoje 👀";
    } else {
      message = "Se continuar assim, vai estourar o mês 💸";
    }
  }

  return { safeToSpend, daysLeft, spendRatio, tone, message };
}
