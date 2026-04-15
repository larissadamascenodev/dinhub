/**
 * Health score calculator v2 — uses Radar insights + financial ratios.
 */

import type { DashboardData } from "@/types/finance";
import type { RadarInsight } from "@/services/radarService";

export interface HealthFactor {
  label: string;
  value: number;      // raw points (0-100 before weight)
  weight: number;     // 0-1
  weighted: number;   // value * weight
  status: "saudavel" | "atencao" | "critico";
  description: string;
}

export interface HealthScoreV2 {
  score: number;
  label: "Saudável" | "Atenção" | "Crítico";
  level: "verde" | "amarelo" | "vermelho";
  factors: HealthFactor[];
}

export function calculateHealthScore(
  data: DashboardData,
  insights: RadarInsight[],
  totalParcelado: number
): HealthScoreV2 {
  const receitas = data.receitas || 0;
  const despesas = data.despesas || 0;

  // ── Factor 1: Income commitment (40%) ──────────────────────────
  const commitPct = receitas > 0 ? (despesas / receitas) * 100 : 100;
  let commitScore: number;
  let commitDesc: string;
  if (commitPct <= 50) { commitScore = 100; commitDesc = `${Math.round(commitPct)}% da renda comprometida — excelente`; }
  else if (commitPct <= 70) { commitScore = 70; commitDesc = `${Math.round(commitPct)}% da renda comprometida — ok`; }
  else if (commitPct <= 90) { commitScore = 40; commitDesc = `${Math.round(commitPct)}% da renda comprometida — cuidado`; }
  else { commitScore = 10; commitDesc = `${Math.round(commitPct)}% da renda comprometida — crítico`; }

  // ── Factor 2: Installments (25%) ───────────────────────────────
  const parcPct = receitas > 0 ? (totalParcelado / receitas) * 100 : 0;
  let parcScore: number;
  let parcDesc: string;
  if (parcPct <= 20) { parcScore = 100; parcDesc = `${Math.round(parcPct)}% em parcelas — saudável`; }
  else if (parcPct <= 40) { parcScore = 70; parcDesc = `${Math.round(parcPct)}% em parcelas — moderado`; }
  else { parcScore = 30; parcDesc = `${Math.round(parcPct)}% em parcelas — alto`; }

  // ── Factor 3: Spending stability (20%) ─────────────────────────
  const aumentos = insights.filter((i) => i.id.startsWith("aumento-") || i.id.startsWith("frequencia-"));
  const maxIntensidade = aumentos.reduce<string | null>(
    (max, i) => (i.intensidade === "alta" ? "alta" : max === "alta" ? "alta" : i.intensidade === "media" ? "media" : max),
    null
  );
  let stabScore: number;
  let stabDesc: string;
  if (!maxIntensidade) { stabScore = 100; stabDesc = "Gastos estáveis em relação ao mês anterior"; }
  else if (maxIntensidade === "media") { stabScore = 70; stabDesc = "Aumento leve em algumas categorias"; }
  else { stabScore = 40; stabDesc = "Aumento significativo detectado"; }

  // ── Factor 4: Radar alerts (15%) ───────────────────────────────
  const alertCount = insights.filter((i) => i.tipo === "alerta").length;
  let alertScore: number;
  let alertDesc: string;
  if (alertCount === 0) { alertScore = 100; alertDesc = "Nenhum alerta ativo"; }
  else if (alertCount === 1) { alertScore = 60; alertDesc = "1 alerta detectado"; }
  else { alertScore = 30; alertDesc = `${alertCount} alertas detectados`; }

  // ── Final score ────────────────────────────────────────────────
  const factors: HealthFactor[] = [
    {
      label: "Comprometimento da renda",
      value: commitScore,
      weight: 0.4,
      weighted: commitScore * 0.4,
      status: commitScore >= 70 ? "saudavel" : commitScore >= 40 ? "atencao" : "critico",
      description: commitDesc,
    },
    {
      label: "Parcelamentos",
      value: parcScore,
      weight: 0.25,
      weighted: parcScore * 0.25,
      status: parcScore >= 70 ? "saudavel" : parcScore >= 40 ? "atencao" : "critico",
      description: parcDesc,
    },
    {
      label: "Estabilidade de gastos",
      value: stabScore,
      weight: 0.2,
      weighted: stabScore * 0.2,
      status: stabScore >= 70 ? "saudavel" : stabScore >= 40 ? "atencao" : "critico",
      description: stabDesc,
    },
    {
      label: "Alertas do Radar",
      value: alertScore,
      weight: 0.15,
      weighted: alertScore * 0.15,
      status: alertScore >= 60 ? "saudavel" : alertScore >= 40 ? "atencao" : "critico",
      description: alertDesc,
    },
  ];

  const score = Math.round(factors.reduce((s, f) => s + f.weighted, 0));

  let label: HealthScoreV2["label"];
  let level: HealthScoreV2["level"];
  if (score >= 80) { label = "Saudável"; level = "verde"; }
  else if (score >= 50) { label = "Atenção"; level = "amarelo"; }
  else { label = "Crítico"; level = "vermelho"; }

  return { score, label, level, factors };
}
