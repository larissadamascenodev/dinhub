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
      (c: string) => `Eita! Seus gastos com ${c} deram um salto esse mês 📈`,
      (c: string) => `Opa, ${c} tá querendo dominar seu orçamento? 👀`,
      (c: string) => `Você gastou uma grana a mais com ${c} ultimamente…`,
      (c: string) => `${c} deu uma acelerada forte. Vamos segurar? 🛑`,
    ],
    comp: [
      "isso aqui pode dar uma bagunçada nos seus planos.",
      "vale dar um check pra ver se foi planejado ou impulso.",
      "se continuar assim, a conta pode não fechar legal.",
      "bora rever isso pra sobrar mais pro que importa?",
    ],
    acao: [
      "quer dar uma olhada no que aconteceu?",
      "bora ver os detalhes disso juntos?",
      "posso te mostrar onde a grana fugiu?",
    ],
  },
  frequencia: {
    obs: [
      (c: string) => `Você e ${c} estão inseparáveis esse mês, hein? 😂`,
      (c: string) => `${c} virou rotina total por aqui…`,
      (c: string) => `Tem bastante movimento em ${c} ultimamente 👀`,
    ],
    comp: [
      "vários gastos pequenos que, somados, fazem um estrago.",
      "parece pouco, mas no fim do mês vira um monstro.",
      "será que tudo isso era realmente necessário?",
    ],
    acao: [
      "quer ver o resumo dessa 'amizade'?",
      "bora analisar se dá pra reduzir?",
      "posso te mostrar o impacto total disso.",
    ],
  },
  comprometimento: {
    obs: [
      () => "Sua renda tá pedindo socorro por aqui… 🆘",
      () => "Opa, seu orçamento tá mais apertado que sapato novo 👟",
      () => "As despesas tão quase dando um 'oi' pro seu salário total…",
    ],
    comp: [
      "isso te deixa sem margem pra manobra se algo rolar.",
      "atenção aqui pra não entrar no vermelho sem querer.",
      "vale dar uma segurada nas próximas semanas.",
    ],
    acao: [
      "bora ver onde dá pra respirar um pouco?",
      "quer uma ajuda pra reorganizar esse caos?",
      "vamos encontrar um fôlego extra juntos?",
    ],
  },
  parcelamentos: {
    obs: [
      () => "Cuidado com o 'efeito bola de neve' das parcelas! ❄️",
      () => "Seus próximos meses já estão com donos garantidos…",
      () => "Parcelas ativas tão consumindo um pedaço bom da sua liberdade.",
    ],
    comp: [
      "isso prende seu dinheiro e limita suas escolhas.",
      "cada parcela nova é menos grana livre no futuro.",
      "evitar novos 'suaves prestações' agora seria genial.",
    ],
    acao: [
      "quer ver quanto tempo falta pra se livrar disso?",
      "posso te mostrar o mapa das suas parcelas.",
      "bora traçar um plano de liberdade?",
    ],
  },
  positivo: [
    "Tá tudo dominado! Seu financeiro tá um luxo 💎",
    "Nenhum alerta! Você tá jogando no nível elite 🚀",
    "Tudo nos trilhos. Pode relaxar e curtir o progresso 👌",
    "Você tá mandando muito bem! Nada pra se preocupar por aqui 😎",
    "Score de mestre! Sua organização tá impecável ✨",
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
      "Boa! Mandou bem demais esse mês 👏",
      "Aí sim 👀 seu controle financeiro melhorou!",
      "Olha isso… evolução real acontecendo 🚀",
      "Tá vendo? Pequenas mudanças já fizeram diferença!",
      "Eee! Subiu o score 🎉 bom demais!",
    ],
    comp: [
      "isso mostra que você tá no controle",
      "continue nesse ritmo que tá funcionando",
      "tá funcionando, viu?",
      "cada ajuste conta — e você tá provando isso",
    ],
    acao: [
      "quer ver o que mais ajudou nisso?",
      "posso te mostrar onde você acertou",
      "bora ver o que fez a diferença?",
    ],
  },
  piora: {
    obs: [
      "Hmm… deu uma escorregada esse mês 😅",
      "Seu score caiu um pouquinho… acontece, né?",
      "Esse mês saiu um pouco do controle. Relaxa, vamos ajustar!",
      "Opa, teve uma quedinha ali… vamos recuperar? 👀",
    ],
    comp: [
      "mas dá pra ajustar rápido se a gente focar.",
      "nada grave ainda, mas fica de olho.",
      "só não deixa virar costume, beleza?",
      "o importante é que a gente viu agora.",
    ],
    acao: [
      "quer ver o que puxou isso pra baixo?",
      "bora botar ordem na casa?",
      "posso te mostrar onde dá pra melhorar.",
    ],
  },
  estavel: {
    obs: [
      "Seu score ficou na mesma esse mês 👀",
      "Nada mudou muito… zona de conforto?",
      "Tá ok… mas a gente sabe que você pode mais 😏",
      "Estável por aqui — que tal dar um gás pra subir?",
    ],
    comp: [
      "tem bastante espaço pra evoluir ainda.",
      "alguns ajustes bobos já fariam isso decolar.",
      "bora sair da estabilidade e buscar o topo?",
    ],
    acao: [
      "quer dar um upgrade real nisso?",
      "posso te mostrar os atalhos pra subir.",
      "bora encontrar oportunidades escondidas?",
    ],
  },
  melhoraGrande: {
    obs: [
      "CARACA 👏 olha essa virada!",
      "Você saiu da zona crítica! Isso é gigante 🚀",
      "Agora sim… virou o jogo!",
      "QUE EVOLUÇÃO! Isso aqui tá de parabéns 🎉",
    ],
    comp: [
      "seus ajustes fizeram uma diferença enorme",
      "isso mostra muita disciplina — orgulho!",
      "grande progresso, de verdade",
    ],
    acao: [
      "quer ver o que fez a diferença?",
      "posso mostrar os detalhes da virada",
      "bora celebrar e manter o ritmo?",
    ],
  },
  quedaGrande: {
    obs: [
      "Opa… saiu da zona segura 👀",
      "Seu financeiro deu uma apertada agora",
      "O score caiu mais do que o normal esse mês…",
    ],
    comp: [
      "vale dar uma atenção aqui antes de piorar",
      "quanto antes ajustar, mais fácil volta",
      "não é o fim do mundo, mas precisa de ação",
    ],
    acao: [
      "quer ver onde tá o problema?",
      "posso te ajudar a voltar ao controle",
      "bora resolver isso juntos?",
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
