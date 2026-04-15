import { useMemo, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ShieldCheck, TrendingUp, TrendingDown, CreditCard, BarChart3,
  AlertTriangle, Bot, ChevronRight, Settings2, List, Sparkles, Zap, PiggyBank, Scissors,
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

export default function BotFinanceSaude() {
  const navigate = useNavigate();
  const { data, loading } = useFinancialProjection();
  const { insights, loading: radarLoading } = useRadarFinanceiro();
  const { user } = useAuth();
  const { selectedMonth, selectedYear } = useMonth();
  const isLoading = loading || radarLoading;

  // Better installment calc: filter only parcelado
  const parceladoTotal = useMemo(
    () =>
      data.transactions
        .filter((t) => t.type === "despesa" && (t as any).recurrence_type === "parcelado")
        .reduce((s, t) => s + t.amount, 0),
    [data.transactions]
  );

  const health = useMemo<HealthScoreV2>(
    () => (isLoading ? { score: 0, label: "Atenção", level: "amarelo", factors: [] } : calculateHealthScore(data, insights, parceladoTotal)),
    [data, insights, parceladoTotal, isLoading]
  );

  // ── Persist current score ──
  const hasSaved = useRef(false);
  useEffect(() => {
    if (isLoading || !user?.id || hasSaved.current || health.score === 0) return;
    hasSaved.current = true;
    saveHealthScore(user.id, selectedMonth, selectedYear, health);
  }, [isLoading, user?.id, health, selectedMonth, selectedYear]);

  // ── Fetch real previous month score from DB ──
  const [prevPersisted, setPrevPersisted] = useState<PersistedScore | null>(null);
  const [prevLoaded, setPrevLoaded] = useState(false);
  useEffect(() => {
    if (!user?.id) return;
    setPrevLoaded(false);
    fetchPreviousScore(user.id, selectedMonth, selectedYear).then((s) => {
      setPrevPersisted(s);
      setPrevLoaded(true);
    });
  }, [user?.id, selectedMonth, selectedYear]);

  // Fetch score history (last 6 months)
  const [scoreHistory, setScoreHistory] = useState<PersistedScore[]>([]);
  useEffect(() => {
    if (!user?.id) return;
    fetchScoreHistory(user.id, 6).then(setScoreHistory);
  }, [user?.id, health.score]);

  // Build prevHealth from persisted data, fallback to calculated
  const { prevData } = useRadarFinanceiro();
  const prevInsights = useMemo(() => {
    if (isLoading || !prevData) return [];
    return generateRadarInsights(prevData, undefined as any);
  }, [prevData, isLoading]);

  const prevParcelado = useMemo(
    () => (prevData?.transactions ?? []).filter((t) => t.type === "despesa" && (t as any).recurrence_type === "parcelado").reduce((s, t) => s + t.amount, 0),
    [prevData]
  );

  const prevHealth = useMemo<HealthScoreV2>(() => {
    // Prefer persisted score
    if (prevPersisted && prevLoaded) {
      return {
        score: prevPersisted.score,
        label: prevPersisted.score >= 80 ? "Saudável" : prevPersisted.score >= 50 ? "Atenção" : "Crítico",
        level: (prevPersisted.level as HealthScoreV2["level"]) ?? "amarelo",
        factors: (prevPersisted.factors ?? []) as HealthFactor[],
      };
    }
    // Fallback to calculated
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

  // Fire score notifications
  useScoreNotifications(health, prevHealth, isLoading);

  const animatedScore = useAnimatedCounter(health.score);
  const lc = levelConfig[health.level];

  // ── Smart actions from Huby ──
  const { prevData: radarPrevData } = useRadarFinanceiro();
  const hubyActions = useMemo<HubyAction[]>(
    () => (isLoading ? [] : generateHubyActions(data, insights, health, radarPrevData ?? undefined)),
    [data, insights, health, radarPrevData, isLoading]
  );

  return (
    <div className="space-y-4 pb-4">
      {/* Back */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
      </motion.div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
        <h1 className="font-display text-[22px] font-bold text-foreground tracking-tight">Saúde Financeira</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">{lc.message}</p>
      </motion.div>

      {/* ── Score Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="rounded-[20px] p-6 relative overflow-hidden"
        style={{ background: lc.bg, border: `1px solid ${lc.border}` }}
      >
        <div
          className="absolute -top-10 -right-10 w-[120px] h-[120px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${lc.glow} 0%, transparent 70%)` }}
        />

        <div className="flex flex-col items-center gap-4 relative z-[1]">
          {/* Ring */}
          <div className="relative w-36 h-36">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 144 144">
              <circle cx="72" cy="72" r="60" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
              <motion.circle
                cx="72" cy="72" r="60" fill="none"
                stroke={lc.stroke}
                strokeWidth="8" strokeLinecap="round"
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
                {scoreDiff > 0 ? (
                  <TrendingUp className="w-3 h-3 text-primary" />
                ) : scoreDiff < 0 ? (
                  <TrendingDown className="w-3 h-3 text-destructive" />
                ) : null}
                <span className={`text-[11px] font-semibold ${scoreDiff > 0 ? "text-primary" : scoreDiff < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                  {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff < 0 ? `${scoreDiff}` : "="} pontos em relação ao mês passado
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Factor breakdown ── */}
      {!isLoading && health.factors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <p className="text-[11px] font-semibold tracking-[1px] text-muted-foreground/70 uppercase">
            Detalhamento
          </p>
          {health.factors.map((f, i) => {
            const sc = statusColors[f.status];
            const pct = f.value;
            return (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 + i * 0.05 }}
                className="rounded-[16px] p-4 border border-border/10 bg-card/60 backdrop-blur-xl"
                style={{ boxShadow: "0 2px 8px -4px rgba(0,0,0,0.15)" }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${sc.bg}`}>
                    <span className={sc.text}>{factorIcons[f.label] ?? <ShieldCheck className="w-4 h-4" />}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[13px] font-bold text-foreground">{f.label}</h4>
                      <span className={`text-[12px] font-bold tabular-nums ${sc.text}`}>
                        {Math.round(f.weighted)}/{Math.round(f.weight * 100)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">{f.description}</p>
                    <div className="h-1.5 w-full bg-border/15 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.25 + i * 0.05 }}
                        className={`h-full rounded-full ${sc.bar}`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Huby message ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-[18px] p-4 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f2318 0%, #0a1a0f 60%, hsl(var(--card)) 100%)",
          border: "1px solid rgba(74, 222, 128, 0.2)",
        }}
      >
        <div
          className="absolute -top-6 -right-6 w-[80px] h-[80px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)" }}
        />
        <div className="flex items-start gap-3 relative z-[1]">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), #16a34a)",
              boxShadow: "0 0 12px rgba(74,222,128,0.25)",
            }}
          >
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

      {/* ── Huby Smart Actions ── */}
      {!isLoading && hubyActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="space-y-3"
        >
          <p className="text-[11px] font-semibold tracking-[1px] text-muted-foreground/70 uppercase">
            Sugestões da Huby
          </p>
          {hubyActions.map((action, i) => {
            const iconMap = {
              economia: <Scissors className="w-4 h-4" />,
              ajuste: <Zap className="w-4 h-4" />,
              oportunidade: <PiggyBank className="w-4 h-4" />,
            };
            const colorMap = {
              economia: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/15" },
              ajuste: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/15" },
              oportunidade: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/15" },
            };
            const c = colorMap[action.tipo];
            return (
              <motion.div
                key={`${action.titulo}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}
                className={`rounded-[16px] p-4 border ${c.border} bg-card/60 backdrop-blur-xl`}
                style={{ boxShadow: "0 2px 8px -4px rgba(0,0,0,0.12)" }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                    <span className={c.text}>{iconMap[action.tipo]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-bold text-foreground mb-0.5">{action.titulo}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
                      {action.descricao}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[12px] font-bold ${c.text}`}>
                        Economia estimada: R${action.impacto_estimado.toLocaleString("pt-BR")}
                      </span>
                      <button
                        onClick={() => navigate(action.path)}
                        className={`text-[11px] font-semibold ${c.text} flex items-center gap-0.5 hover:underline`}
                      >
                        {action.acao}
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Quick actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-2"
      >
        <p className="text-[11px] font-semibold tracking-[1px] text-muted-foreground/70 uppercase">
          Ações rápidas
        </p>
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
        <div
          className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0 text-base"
          style={{ background: "rgba(245,158,11,0.12)" }}
        >
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
