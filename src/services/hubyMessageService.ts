/**
 * Huby — Dynamic message generator.
 * Transforms Radar insights into natural, friendly, actionable messages.
 */

import type { RadarInsight } from "@/services/radarService";

interface HubyMessage {
  main: string;
  secondary: string | null;
}

// ─── Template pools ─────────────────────────────────────────────────

const templates = {
  aumento: {
    obs: [
      (c: string) => `Seus gastos com ${c} subiram esse mês…`,
      (c: string) => `${c} apareceu mais do que o normal 👀`,
      (c: string) => `Você aumentou seus gastos com ${c}`,
      (c: string) => `${c} deu uma acelerada esse mês…`,
    ],
    comp: [
      "foi algo pontual ou tá virando padrão?",
      "vale dar uma olhada nisso",
      "isso pode pesar no seu orçamento",
      "talvez seja hora de rever isso",
    ],
    acao: [
      "quer ver onde isso aconteceu?",
      "posso te mostrar os detalhes",
      "bora dar uma olhada juntos?",
    ],
  },
  frequencia: {
    obs: [
      (c: string) => `Você tem usado bastante ${c} ultimamente…`,
      (c: string) => `${c} virou rotina esse mês`,
      (c: string) => `Tem bastante movimentação em ${c} 👀`,
    ],
    comp: [
      "talvez sem perceber",
      "isso costuma passar batido",
      "pequenos gastos somados fazem diferença",
    ],
    acao: [
      "vale revisar isso?",
      "quer analisar melhor?",
      "posso te mostrar o resumo",
    ],
  },
  comprometimento: {
    obs: [
      () => "Boa parte da sua renda já está comprometida…",
      () => "Seu orçamento está bem apertado esse mês",
      () => "As despesas estão quase alcançando a receita…",
    ],
    comp: [
      "isso pode limitar suas escolhas",
      "vale atenção aqui",
      "um imprevisto pode complicar as coisas",
    ],
    acao: [
      "quer ver onde ajustar?",
      "posso te ajudar a reorganizar isso",
      "vamos ver juntos onde dá pra respirar?",
    ],
  },
  parcelamentos: {
    obs: [
      () => "Você tem vários valores comprometidos em parcelas…",
      () => "Os parcelamentos estão pesando no seu mês",
      () => "Parcelas ativas estão consumindo bastante da renda…",
    ],
    comp: [
      "isso reduz sua liberdade financeira",
      "pode impactar os próximos meses",
      "evitar novas parcelas agora pode ajudar",
    ],
    acao: [
      "quer visualizar isso melhor?",
      "posso te mostrar o impacto",
      "vamos analisar o cenário?",
    ],
  },
  positivo: [
    "Está tudo sob controle por aqui 👌 continue assim!",
    "Seu financeiro está bem organizado 🚀 nada para se preocupar.",
    "Sem alertas por enquanto. Bom trabalho! 💪",
    "Tá tudo nos trilhos! Continue mantendo esse ritmo 🎯",
    "Nenhum alerta detectado. Seu dinheiro está bem cuidado ✨",
  ],
};

// ─── Helpers ────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  // Use a seed based on current date (day) to avoid changing every render
  // but still rotate daily
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return arr[dayOfYear % arr.length];
}

function pickExcluding<T>(arr: T[], exclude: T | null): T {
  const filtered = exclude ? arr.filter((x) => x !== exclude) : arr;
  return pick(filtered.length > 0 ? filtered : arr);
}

function getInsightType(insight: RadarInsight): keyof typeof templates | null {
  if (insight.id.startsWith("aumento-")) return "aumento";
  if (insight.id.startsWith("frequencia-")) return "frequencia";
  if (insight.id === "comprometimento-renda") return "comprometimento";
  if (insight.id === "parcelamentos-altos") return "parcelamentos";
  return null;
}

// ─── Main generator ─────────────────────────────────────────────────

export function generateHubyMessage(insights: RadarInsight[]): HubyMessage {
  if (insights.length === 0) {
    return {
      main: pick(templates.positivo),
      secondary: null,
    };
  }

  // Primary: most important insight
  const primary = insights[0];
  const primaryType = getInsightType(primary);

  let main: string;

  if (primaryType && primaryType in templates) {
    const t = templates[primaryType] as {
      obs: ((c: string) => string)[];
      comp: string[];
      acao: string[];
    };
    const cat = primary.categoria ?? "";
    const obs = pick(t.obs)(cat);
    const comp = pick(t.comp);
    const acao = pick(t.acao);
    main = `${obs}\n${comp}\n${acao}`;
  } else {
    main = `Encontrei algo nos seus gastos… quer dar uma olhada?`;
  }

  // Secondary: second insight (if exists)
  let secondary: string | null = null;
  if (insights.length > 1) {
    const sec = insights[1];
    const secType = getInsightType(sec);
    if (secType && secType in templates) {
      const t = templates[secType] as {
        obs: ((c: string) => string)[];
        comp: string[];
        acao: string[];
      };
      const cat = sec.categoria ?? "";
      secondary = pick(t.obs)(cat);
    }
  }

  return { main, secondary };
}

/**
 * Returns just the main message string for simple display contexts.
 */
export function getHubyMessageText(insights: RadarInsight[]): string {
  return generateHubyMessage(insights).main;
}
