/**
 * Huby Smart Actions — generates personalized, actionable financial suggestions.
 */

import type { DashboardData, Transaction } from "@/types/finance";
import type { RadarInsight } from "@/services/radarService";
import type { HealthScoreV2 } from "@/services/healthScoreService";

export interface HubyAction {
  tipo: "economia" | "ajuste" | "oportunidade";
  categoria: string | null;
  titulo: string;
  descricao: string;
  impacto_estimado: number;
  acao: string;
  path: string;
}

// ─── Helpers ────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  const d = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return arr[d % arr.length];
}

function fmt(v: number) {
  return `R$${Math.round(v).toLocaleString("pt-BR")}`;
}

function sumByCategory(txs: Transaction[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const t of txs) {
    if (t.type === "despesa" && t.status === "pago") {
      m[t.category] = (m[t.category] ?? 0) + t.amount;
    }
  }
  return m;
}

function countByCategory(txs: Transaction[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const t of txs) {
    if (t.type === "despesa" && t.status === "pago") {
      m[t.category] = (m[t.category] ?? 0) + 1;
    }
  }
  return m;
}

// ─── Main generator ─────────────────────────────────────────────────

export function generateHubyActions(
  data: DashboardData,
  insights: RadarInsight[],
  health: HealthScoreV2,
  prevData?: DashboardData
): HubyAction[] {
  const actions: HubyAction[] = [];
  const receitas = data.receitas || 1;
  const catSums = sumByCategory(data.transactions);
  const catCounts = countByCategory(data.transactions);
  const prevCatSums = prevData ? sumByCategory(prevData.transactions) : {};

  // Sort categories by spending (descending)
  const topCats = Object.entries(catSums).sort((a, b) => b[1] - a[1]);

  // ── 1. Category with high increase ──
  for (const insight of insights.filter((i) => i.id.startsWith("aumento-"))) {
    const cat = insight.categoria ?? "";
    const atual = catSums[cat] ?? 0;
    const anterior = prevCatSums[cat] ?? 0;
    if (atual <= 0) continue;

    const reducao = Math.round(atual * 0.25); // suggest 25% cut
    actions.push({
      tipo: "economia",
      categoria: cat,
      titulo: `Reduzir ${cat}`,
      descricao: pick([
        `Se você der uma segurada em ${cat}, já dá pra economizar uma grana boa 👀`,
        `Só de cortar um pouco em ${cat}, seu mês já respira melhor`,
        `${cat} tá pesando… um ajuste pequeno já faz diferença real`,
      ]),
      impacto_estimado: reducao,
      acao: "Ver categoria",
      path: "/analytics/categorias",
    });
  }

  // ── 2. High frequency ──
  for (const insight of insights.filter((i) => i.id.startsWith("frequencia-"))) {
    const cat = insight.categoria ?? "";
    const count = catCounts[cat] ?? 0;
    const avg = (catSums[cat] ?? 0) / Math.max(count, 1);
    const corte = Math.round(avg * 3); // ~3 fewer uses

    if (count > 5) {
      actions.push({
        tipo: "ajuste",
        categoria: cat,
        titulo: `Menos ${cat}`,
        descricao: pick([
          `Você usou ${cat} ${count} vezes esse mês… reduzir isso pode gerar uma boa economia`,
          `${cat} virou rotina — cortando só 2 ou 3 vezes já muda o cenário`,
          `Muita movimentação em ${cat}… pequenos cortes somam rápido`,
        ]),
        impacto_estimado: corte,
        acao: "Analisar gastos",
        path: "/transacoes",
      });
    }
  }

  // ── 3. Installments heavy ──
  const parcelado = data.transactions
    .filter((t) => t.type === "despesa" && (t as any).recurrence_type === "parcelado")
    .reduce((s, t) => s + t.amount, 0);
  const parcPct = (parcelado / receitas) * 100;

  if (parcPct > 30) {
    actions.push({
      tipo: "ajuste",
      categoria: null,
      titulo: "Controlar parcelas",
      descricao: pick([
        "Você já tem bastante valor comprometido em parcelas… evitar novas agora pode aliviar o próximo mês",
        "Os parcelamentos tão consumindo boa parte da renda — segurar novas compras parceladas ajuda muito",
        "Isso aqui é ajuste simples que já faz diferença real 💪 menos parcelas = mais liberdade",
      ]),
      impacto_estimado: Math.round(parcelado * 0.15),
      acao: "Ver parcelamentos",
      path: "/parcelamentos",
    });
  }

  // ── 4. Score low — suggest top 2 cuts ──
  if (health.score < 50 && topCats.length >= 2) {
    const [c1, c2] = topCats;
    const combined = Math.round((c1[1] + c2[1]) * 0.2);
    actions.push({
      tipo: "economia",
      categoria: `${c1[0]} e ${c2[0]}`,
      titulo: "Focar nas maiores",
      descricao: `Se você ajustar seus gastos em ${c1[0]} e ${c2[0]}, já dá pra melhorar bastante seu score`,
      impacto_estimado: combined,
      acao: "Ver categorias",
      path: "/analytics/categorias",
    });
  }

  // ── 5. Healthy user — opportunity ──
  if (health.score >= 80 && actions.length === 0) {
    const sobra = Math.max(data.receitas - data.despesas, 0);
    const sugestao = Math.round(sobra * 0.3);
    if (sugestao > 50) {
      actions.push({
        tipo: "oportunidade",
        categoria: null,
        titulo: "Guardar dinheiro",
        descricao: pick([
          "Seu financeiro tá bem controlado… que tal transformar isso em reserva? 🚀",
          "Tá sobrando uma grana boa — perfeito pra começar ou reforçar uma meta",
          "Momento ideal pra guardar! Seu controle financeiro tá no ponto ✨",
        ]),
        impacto_estimado: sugestao,
        acao: "Ver metas",
        path: "/metas",
      });
    }
  }

  // Deduplicate by categoria, keep highest impact, limit to 3
  const seen = new Set<string>();
  return actions
    .sort((a, b) => b.impacto_estimado - a.impacto_estimado)
    .filter((a) => {
      const key = a.categoria ?? a.titulo;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);
}
