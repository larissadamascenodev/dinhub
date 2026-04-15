import { useMemo, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ShieldCheck, TrendingUp, TrendingDown, CreditCard, BarChart3,
  AlertTriangle, Bot, ChevronRight, ChevronDown, ChevronUp, Settings2, List,
  Sparkles, Zap, PiggyBank, Scissors, ThumbsUp, ThumbsDown, Sliders,
} from "lucide-react";
import { useFinancialProjection } from "@/hooks/useFinancialProjection";
import { useRadarFinanceiro } from "@/hooks/useRadarFinanceiro";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { calculateHealthScore, type HealthScoreV2, type HealthFactor } from "@/services/healthScoreService";
import { generateHubyScoreMessage } from "@/services/hubyMessageService";
import { generateRadarInsights } from "@/services/radarService";
import { useScoreNotifications } from "@/hooks/useScoreNotifications";
import { saveHealthScore, fetchPreviousScore, fetchScoreHistory, type PersistedScore } from "@/services/scoreHistoryService";
import { generateHubyActions, type HubyAction } from "@/services/hubyActionsService";
import { useAuth } from "@/contexts/AuthContext";
import { useMonth } from "@/contexts/MonthContext";
import { Slider } from "@/components/ui/slider";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ─── Factor icons ───────────────────────────────────────────────────
const factorIcons: Record<string, React.ReactNode> = {
  "Comprometimento da renda": <TrendingDown className="w-4 h-4" />,
  "Parcelamentos": <CreditCard className="w-4 h-4" />,
  "Estabilidade de gastos": <BarChart3 className="w-4 h-4" />,
  "Alertas do Radar": <AlertTriangle className="w-4 h-4" />,
};

const statusColors = {
  saudavel: { text: "text-primary", bg: "bg-primary/10", bar: "bg-primary" },
  atencao: { text: "text-warning", bg: "bg-warning/10", bar: "bg-warning" },
  critico: { text: "text-destructive", bg: "bg-destructive/10", bar: "bg-destructive" },
};

const levelConfig = {
  verde: {
    stroke: "hsl(var(--primary))",
    text: "text-primary",
    bg: "rgba(74,222,128,0.08)",
    border: "rgba(74,222,128,0.2)",
    glow: "rgba(74,222,128,0.06)",
    message: "Seu financeiro está bem equilibrado. Continue assim.",
  },
  amarelo: {
    stroke: "hsl(var(--warning))",
    text: "text-warning",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    glow: "rgba(245,158,11,0.06)",
    message: "Alguns pontos precisam de ajuste para evitar problemas.",
  },
  vermelho: {
    stroke: "hsl(var(--destructive))",
    text: "text-destructive",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
    glow: "rgba(239,68,68,0.06)",
    message: "Seu orçamento está sob pressão. Hora de agir.",
  },
};

// ─── Collapsible section ────────────────────────────────────────────
function Section({
  title,
  emoji,
  children,
  defaultOpen = true,
  delay = 0,
}: {
  title: string;
  emoji?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  delay?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-[18px] border border-border/10 bg-card/60 backdrop-blur-xl overflow-hidden"
      style={{ boxShadow: "0 2px 8px -4px rgba(0,0,0,0.12)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-card/80 transition-colors"
      >
        <span className="text-[13px] font-bold text-foreground flex items-center gap-2">
          {emoji && <span className="text-sm">{emoji}</span>}
          {title}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Score evolution mini line chart ────────────────────────────────
function ScoreChart({ history }: { history: PersistedScore[] }) {
  const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const points = history.map((s) => ({
    label: MONTHS[s.month] ?? `${s.month + 1}`,
    score: s.score,
    level: s.level,
  }));

  const W = 280, H = 100, padX = 24, padY = 12;
  const chartW = W - padX * 2, chartH = H - padY * 2;
  const minScore = Math.max(0, Math.min(...points.map((p) => p.score)) - 10);
  const maxScore = Math.min(100, Math.max(...points.map((p) => p.score)) + 10);
  const range = maxScore - minScore || 1;

  const coords = points.map((p, i) => ({
    x: padX + (i / Math.max(points.length - 1, 1)) * chartW,
    y: padY + chartH - ((p.score - minScore) / range) * chartH,
    ...p,
  }));

  const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const levelColor = (l: string) =>
    l === "verde" ? "hsl(var(--primary))" : l === "amarelo" ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[320px]" style={{ height: 120 }}>
        {[0, 0.5, 1].map((t) => {
          const y = padY + chartH - t * chartH;
          const val = Math.round(minScore + t * range);
          return (
            <g key={t}>
              <line x1={padX} y1={y} x2={W - padX} y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="3 3" opacity={0.3} />
              <text x={padX - 4} y={y + 3} textAnchor="end" fill="hsl(var(--muted-foreground))" fontSize="7" opacity={0.5}>{val}</text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={`${pathD} L ${coords[coords.length - 1].x} ${padY + chartH} L ${coords[0].x} ${padY + chartH} Z`} fill="url(#scoreGrad)" />
        <motion.path
          d={pathD} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.3 }}
        />
        {coords.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r="4" fill={levelColor(c.level)} stroke="hsl(var(--card))" strokeWidth="2" />
            <text x={c.x} y={c.y - 8} textAnchor="middle" fill="hsl(var(--foreground))" fontSize="8" fontWeight="700">{c.score}</text>
            <text x={c.x} y={padY + chartH + 10} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="7" opacity={0.6}>{c.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────

export default function BotFinanceSaude() {
  const navigate = useNavigate();
  const { data, loading } = useFinancialProjection();
  const { insights, loading: radarLoading, prevData } = useRadarFinanceiro();
  const { user } = useAuth();
  const { selectedMonth, selectedYear } = useMonth();
  const isLoading = loading || radarLoading;

  // Installments
  const parceladoTotal = useMemo(
    () => data.transactions.filter((t) => t.type === "despesa" && (t as any).recurrence_type === "parcelado").reduce((s, t) => s + t.amount, 0),
    [data.transactions]
  );

  const health = useMemo<HealthScoreV2>(
    () => (isLoading ? { score: 0, label: "Atenção", level: "amarelo", factors: [] } : calculateHealthScore(data, insights, parceladoTotal)),
    [data, insights, parceladoTotal, isLoading]
  );

  // Persist
  const hasSaved = useRef(false);
  useEffect(() => {
    if (isLoading || !user?.id || hasSaved.current || health.score === 0) return;
    hasSaved.current = true;
    saveHealthScore(user.id, selectedMonth, selectedYear, health);
  }, [isLoading, user?.id, health, selectedMonth, selectedYear]);

  // Previous score
  const [prevPersisted, setPrevPersisted] = useState<PersistedScore | null>(null);
  const [prevLoaded, setPrevLoaded] = useState(false);
  useEffect(() => {
    if (!user?.id) return;
    setPrevLoaded(false);
    fetchPreviousScore(user.id, selectedMonth, selectedYear).then((s) => { setPrevPersisted(s); setPrevLoaded(true); });
  }, [user?.id, selectedMonth, selectedYear]);

  // History
  const [scoreHistory, setScoreHistory] = useState<PersistedScore[]>([]);
  useEffect(() => {
    if (!user?.id) return;
    fetchScoreHistory(user.id, 6).then(setScoreHistory);
  }, [user?.id, health.score]);

  // Prev health
  const prevInsights = useMemo(() => {
    if (isLoading || !prevData) return [];
    return generateRadarInsights(prevData, undefined as any);
  }, [prevData, isLoading]);

  const prevParcelado = useMemo(
    () => (prevData?.transactions ?? []).filter((t) => t.type === "despesa" && (t as any).recurrence_type === "parcelado").reduce((s, t) => s + t.amount, 0),
    [prevData]
  );

  const prevHealth = useMemo<HealthScoreV2>(() => {
    if (prevPersisted && prevLoaded) {
      return {
        score: prevPersisted.score,
        label: prevPersisted.score >= 80 ? "Saudável" : prevPersisted.score >= 50 ? "Atenção" : "Crítico",
        level: (prevPersisted.level as HealthScoreV2["level"]) ?? "amarelo",
        factors: (prevPersisted.factors ?? []) as HealthFactor[],
      };
    }
    if (isLoading || !prevData) return { score: 0, label: "Atenção", level: "amarelo", factors: [] };
    return calculateHealthScore(prevData, prevInsights, prevParcelado);
  }, [prevPersisted, prevLoaded, isLoading, prevData, prevInsights, prevParcelado]);

  const scoreDiff = health.score - prevHealth.score;
  const classMap = { verde: "saudavel", amarelo: "atencao", vermelho: "critico" } as const;

  const hubyMsg = useMemo(() => generateHubyScoreMessage({
    scoreAtual: health.score,
    scoreAnterior: prevHealth.score,
    classificacaoAtual: classMap[health.level],
    classificacaoAnterior: classMap[prevHealth.level],
  }), [health, prevHealth]);

  useScoreNotifications(health, prevHealth, isLoading);
  const animatedScore = useAnimatedCounter(health.score);
  const lc = levelConfig[health.level];

  // Smart actions
  const { prevData: radarPrevData } = useRadarFinanceiro();
  const hubyActions = useMemo<HubyAction[]>(
    () => (isLoading ? [] : generateHubyActions(data, insights, health, radarPrevData ?? undefined)),
    [data, insights, health, radarPrevData, isLoading]
  );

  // ── Positive & negative factors ──
  const negativeFactors = useMemo(() => health.factors.filter((f) => f.status === "critico" || f.status === "atencao"), [health]);
  const positiveFactors = useMemo(() => health.factors.filter((f) => f.status === "saudavel"), [health]);

  // ── Simulator state ──
  const [simReduction, setSimReduction] = useState(20);
  const simScore = useMemo(() => {
    if (isLoading || data.despesas === 0) return health.score;
    const reducedDespesas = data.despesas * (1 - simReduction / 100);
    const simData = { ...data, despesas: reducedDespesas, despesasPagas: data.despesasPagas * (1 - simReduction / 100) };
    const simHealth = calculateHealthScore(simData, insights, parceladoTotal * (1 - simReduction / 200));
    return simHealth.score;
  }, [data, insights, parceladoTotal, simReduction, isLoading, health.score]);

  return (
    <div className="space-y-4 pb-4">
      {/* Back */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
      </motion.div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
        <h1 className="font-display text-[22px] font-bold text-foreground tracking-tight">Saúde Financeira</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">{lc.message}</p>
      </motion.div>

      {/* ── 1. Score Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="rounded-[20px] p-6 relative overflow-hidden"
        style={{ background: lc.bg, border: `1px solid ${lc.border}` }}
      >
        <div className="absolute -top-10 -right-10 w-[120px] h-[120px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${lc.glow} 0%, transparent 70%)` }} />
        <div className="flex flex-col items-center gap-4 relative z-[1]">
          {/* Ring */}
          <div className="relative w-36 h-36">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 144 144">
              <circle cx="72" cy="72" r="60" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
              <motion.circle
                cx="72" cy="72" r="60" fill="none"
                stroke={lc.stroke} strokeWidth="8" strokeLinecap="round"
                initial={{ strokeDasharray: "0 377" }}
                animate={{ strokeDasharray: `${(health.score / 100) * 377} 377` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold tabular-nums font-display ${lc.text}`}>
                {isLoading ? "—" : Math.round(animatedScore)}
              </span>
              <span className="text-[10px] text-muted-foreground">/100</span>
            </div>
          </div>

          {/* Label + evolution */}
          <div className="text-center">
            <p className={`text-lg font-bold font-display ${lc.text}`}>{health.label}</p>
            {!isLoading && (
              <div className="flex items-center justify-center gap-1 mt-1">
                {scoreDiff > 0 ? <TrendingUp className="w-3 h-3 text-primary" /> : scoreDiff < 0 ? <TrendingDown className="w-3 h-3 text-destructive" /> : null}
                <span className={`text-[11px] font-semibold ${scoreDiff > 0 ? "text-primary" : scoreDiff < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff < 0 ? `${scoreDiff}` : "="} pontos em relação ao mês passado
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── 2. Huby message (destaque) ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[18px] p-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f2318 0%, #0a1a0f 60%, hsl(var(--card)) 100%)", border: "1px solid rgba(74, 222, 128, 0.2)" }}
      >
        <div className="absolute -top-6 -right-6 w-[80px] h-[80px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)" }} />
        <div className="flex items-start gap-3 relative z-[1]">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), #16a34a)", boxShadow: "0 0 12px rgba(74,222,128,0.25)" }}>
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h5 className="text-[12px] font-bold text-primary mb-0.5">Huby diz</h5>
            <p className="text-[12px] text-muted-foreground leading-relaxed italic whitespace-pre-line">
              {isLoading ? "Analisando seus dados..." : hubyMsg.main}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── 3. Score Evolution Chart ── */}
      {!isLoading && scoreHistory.length >= 2 && (
        <Section title="Evolução do Score" emoji="📈" delay={0.14}>
          <ScoreChart history={scoreHistory} />
        </Section>
      )}

      {/* ── 4. Factor Breakdown ── */}
      {!isLoading && health.factors.length > 0 && (
        <Section title="Detalhamento do Score" emoji="🧠" delay={0.18}>
          <div className="space-y-3">
            {health.factors.map((f, i) => {
              const sc = statusColors[f.status];
              const pctVal = f.value;
              return (
                <div key={f.label} className="rounded-[14px] p-3 bg-secondary/20 border border-border/5">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${sc.bg}`}>
                      <span className={sc.text}>{factorIcons[f.label] ?? <ShieldCheck className="w-4 h-4" />}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-[12px] font-bold text-foreground">{f.label}</h4>
                        <span className={`text-[11px] font-bold tabular-nums ${sc.text}`}>
                          {Math.round(f.weighted)}/{Math.round(f.weight * 100)}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mb-2 leading-relaxed">{f.description}</p>
                      <div className="h-1.5 w-full bg-border/15 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pctVal}%` }}
                          transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }}
                          className={`h-full rounded-full ${sc.bar}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── 5. O que está puxando pra baixo ── */}
      {!isLoading && negativeFactors.length > 0 && (
        <Section title="O que está puxando pra baixo" emoji="👎" delay={0.22}>
          <div className="space-y-2">
            {negativeFactors.map((f) => (
              <div key={f.label} className="flex items-center gap-2.5 rounded-[12px] bg-destructive/[0.06] border border-destructive/10 px-3 py-2.5">
                <ThumbsDown className="w-4 h-4 text-destructive flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-foreground">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
                <span className={`text-[10px] font-bold ${f.status === "critico" ? "text-destructive" : "text-warning"}`}>
                  {Math.round(f.value)}%
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── 6. O que está ajudando ── */}
      {!isLoading && positiveFactors.length > 0 && (
        <Section title="O que está ajudando" emoji="👍" delay={0.26}>
          <div className="space-y-2">
            {positiveFactors.map((f) => (
              <div key={f.label} className="flex items-center gap-2.5 rounded-[12px] bg-primary/[0.06] border border-primary/10 px-3 py-2.5">
                <ThumbsUp className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-foreground">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
                <span className="text-[10px] font-bold text-primary">{Math.round(f.value)}%</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── 7. Plano de Ação (Sugestões da Huby) ── */}
      {!isLoading && hubyActions.length > 0 && (
        <Section title="Plano de Ação" emoji="🎯" delay={0.3}>
          <div className="space-y-2">
            {hubyActions.map((action, i) => {
              const iconMap = { economia: <Scissors className="w-4 h-4" />, ajuste: <Zap className="w-4 h-4" />, oportunidade: <PiggyBank className="w-4 h-4" /> };
              const colorMap = {
                economia: { bg: "bg-destructive/10", text: "text-destructive" },
                ajuste: { bg: "bg-warning/10", text: "text-warning" },
                oportunidade: { bg: "bg-primary/10", text: "text-primary" },
              };
              const c = colorMap[action.tipo];
              return (
                <div key={`${action.titulo}-${i}`} className="flex items-start gap-3 rounded-[14px] bg-secondary/20 border border-border/5 p-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                    <span className={c.text}>{iconMap[action.tipo]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[12px] font-bold text-foreground">{action.titulo}</h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{action.descricao}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[11px] font-bold ${c.text}`}>
                        Economia: R${action.impacto_estimado.toLocaleString("pt-BR")}
                      </span>
                      <button onClick={() => navigate(action.path)} className={`text-[10px] font-semibold ${c.text} flex items-center gap-0.5`}>
                        {action.acao} <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── 8. Simulador ── */}
      {!isLoading && data.despesas > 0 && (
        <Section title="Simulador" emoji="🔮" delay={0.34} defaultOpen={false}>
          <div className="space-y-4">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Arraste para ver como seu score muda se você reduzir seus gastos:
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Redução de gastos</span>
                <span className="text-[14px] font-bold text-primary tabular-nums">{simReduction}%</span>
              </div>
              <Slider
                value={[simReduction]}
                onValueChange={(v) => setSimReduction(v[0])}
                min={0}
                max={50}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-[9px] text-muted-foreground/50">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-[14px] bg-primary/[0.06] border border-primary/10 p-4">
              <div className="text-center">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Atual</p>
                <p className={`text-xl font-bold tabular-nums ${lc.text}`}>{health.score}</p>
              </div>
              <div className="flex-shrink-0 text-primary">
                <ChevronRight className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Estimado</p>
                <p className="text-xl font-bold tabular-nums text-primary">{simScore}</p>
              </div>
              <div className="flex-1 text-right">
                <span className={`text-[13px] font-bold ${simScore > health.score ? "text-primary" : "text-muted-foreground"}`}>
                  {simScore > health.score ? `+${simScore - health.score}` : simScore === health.score ? "=" : simScore - health.score} pts
                </span>
                <p className="text-[10px] text-muted-foreground">
                  Economia: {fmt(data.despesas * simReduction / 100)}
                </p>
              </div>
            </div>

            {simReduction > 0 && simScore > health.score && (
              <p className="text-[11px] text-primary/80 font-medium leading-relaxed text-center">
                Reduzindo {simReduction}% dos gastos, seu score sobe {simScore - health.score} pontos e você economiza {fmt(data.despesas * simReduction / 100)} 🚀
              </p>
            )}
          </div>
        </Section>
      )}

      {/* ── Quick actions ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <p className="text-[10px] font-semibold tracking-[1px] text-muted-foreground/70 uppercase mb-2">Ações rápidas</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <BarChart3 className="w-4 h-4" />, label: "Categorias", path: "/analytics/categorias" },
            { icon: <Settings2 className="w-4 h-4" />, label: "Limites", path: "/categorias" },
            { icon: <List className="w-4 h-4" />, label: "Transações", path: "/transacoes" },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className="rounded-[14px] p-3 flex flex-col items-center gap-1.5 border border-border/10 bg-card/40 backdrop-blur-xl hover:bg-card/60 active:scale-[0.97] transition-all"
            >
              <div className="text-primary">{a.icon}</div>
              <span className="text-[10px] font-semibold text-muted-foreground">{a.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Tip ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="rounded-2xl p-3.5 flex items-start gap-3"
        style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}
      >
        <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0 text-base" style={{ background: "rgba(245,158,11,0.12)" }}>
          💡
        </div>
        <div>
          <h5 className="text-xs font-bold text-warning mb-0.5">Como funciona o Score</h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            O score considera comprometimento da renda (40%), parcelamentos (25%), estabilidade dos gastos (20%) e alertas do Radar (15%).
          </p>
        </div>
      </motion.div>
    </div>
  );
}
