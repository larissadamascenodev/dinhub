/**
 * Huby — Dynamic message generator.
 * Transforms Radar insights AND score evolution into natural, friendly, actionable messages.
 */

import type { RadarInsight } from "@/services/radarService";

export interface HubyMessage {
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

// ─── Score evolution templates ──────────────────────────────────────

type ScoreLevel = "saudavel" | "atencao" | "critico";

interface ScoreEvolutionInput {
  scoreAtual: number;
  scoreAnterior: number;
  classificacaoAtual: ScoreLevel;
  classificacaoAnterior: ScoreLevel;
}

const scoreTemplates = {
  melhora: {
    obs: [
      "Seu score melhorou esse mês 👏",
      "Boa! Seu controle financeiro evoluiu",
      "Você está no caminho certo 🚀",
    ],
    comp: [
      "pequenos ajustes já fizeram diferença",
      "isso mostra que você está mais no controle",
      "continue assim que a tendência é boa",
    ],
    acao: [
      "quer ver o que mais ajudou nisso?",
      "posso te mostrar onde você acertou",
    ],
  },
  piora: {
    obs: [
      "Seu score caiu um pouco esse mês…",
      "Teve uma leve queda no seu controle financeiro",
      "Seu score deu uma reduzida",
    ],
    comp: [
      "nada grave, mas vale atenção",
      "isso pode virar padrão se não ajustar",
      "melhor olhar isso agora",
    ],
    acao: [
      "quer ver o que causou isso?",
      "posso te ajudar a ajustar",
    ],
  },
  estavel: {
    obs: [
      "Seu score se manteve estável",
      "Nada mudou muito esse mês",
    ],
    comp: [
      "isso é bom, mas sempre dá pra melhorar",
      "talvez tenha oportunidades escondidas",
    ],
    acao: [
      "quer dar uma otimizada nisso?",
      "posso te mostrar onde melhorar",
    ],
  },
  // Classification change (priority)
  melhoraGrande: {
    obs: [
      "Boa! Você saiu da zona crítica 👏",
      "Seu financeiro deu um salto importante 🚀",
      "Parabéns! Evolução significativa no seu score",
    ],
    comp: [
      "isso mostra que seus ajustes estão funcionando",
      "grande progresso, continue nessa direção",
    ],
    acao: [
      "quer ver o que fez a diferença?",
      "posso mostrar os detalhes da evolução",
    ],
  },
  quedaGrande: {
    obs: [
      "Você saiu da zona saudável… vale atenção aqui",
      "Seu controle financeiro perdeu um pouco de força",
      "O score caiu de forma significativa esse mês",
    ],
    comp: [
      "isso pode pesar se continuar assim",
      "quanto antes ajustar, melhor",
    ],
    acao: [
      "quer ver onde está o problema?",
      "posso te ajudar a voltar ao controle",
    ],
  },
};

// ─── Helpers ────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
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

const levelPriority: Record<ScoreLevel, number> = { critico: 0, atencao: 1, saudavel: 2 };

function getScoreTemplateKey(input: ScoreEvolutionInput) {
  const diff = input.scoreAtual - input.scoreAnterior;
  const prevP = levelPriority[input.classificacaoAnterior];
  const currP = levelPriority[input.classificacaoAtual];

  // Classification changed → priority
  if (currP > prevP) return "melhoraGrande";
  if (currP < prevP) return "quedaGrande";

  // Same classification → use score diff
  if (diff > 0) return "melhora";
  if (diff < 0) return "piora";
  return "estavel";
}

// ─── Main generator (Radar-based) ───────────────────────────────────

export function generateHubyMessage(insights: RadarInsight[]): HubyMessage {
  if (insights.length === 0) {
    return {
      main: pick(templates.positivo),
      secondary: null,
    };
  }

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

// ─── Score evolution generator ──────────────────────────────────────

export function generateHubyScoreMessage(input: ScoreEvolutionInput): HubyMessage {
  const key = getScoreTemplateKey(input);
  const t = scoreTemplates[key];
  const obs = pick(t.obs);
  const comp = pick(t.comp);
  const acao = pick(t.acao);

  return {
    main: `${obs}\n${comp}\n${acao}`,
    secondary: null,
  };
}

/**
 * Returns just the main message string for simple display contexts.
 */
export function getHubyMessageText(insights: RadarInsight[]): string {
  return generateHubyMessage(insights).main;
}
