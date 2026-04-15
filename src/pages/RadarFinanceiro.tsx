import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, AlertTriangle, TrendingUp, TrendingDown, Zap,
  ShieldCheck, ChevronRight, Bot, BarChart3, Settings2, List, Sparkles,
} from "lucide-react";
import { useRadarFinanceiro } from "@/hooks/useRadarFinanceiro";
import type { RadarInsight } from "@/services/radarService";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ─── Sub-components ─────────────────────────────────────────────────

function InsightIcon({ tipo }: { tipo: RadarInsight["tipo"] }) {
  if (tipo === "alerta")
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-destructive/15">
        <AlertTriangle className="w-[18px] h-[18px] text-destructive" />
      </div>
    );
  if (tipo === "atencao")
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)" }}>
        <Zap className="w-[18px] h-[18px] text-warning" />
      </div>
    );
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/15">
      <Sparkles className="w-[18px] h-[18px] text-primary" />
    </div>
  );
}

function intensityLabel(i: RadarInsight["intensidade"]) {
  if (i === "alta") return { text: "Alto", color: "text-destructive", bg: "bg-destructive/10" };
  if (i === "media") return { text: "Moderado", color: "text-warning", bg: "rgba(245,158,11,0.1)" };
  return { text: "Leve", color: "text-muted-foreground", bg: "bg-muted/15" };
}

function actionLabel(acao: RadarInsight["acao"]) {
  if (acao.tipo === "ver_categoria") return "Ver categoria";
  if (acao.tipo === "ajustar_limite") return "Ajustar limite";
  return "Ver detalhes";
}

function actionPath(acao: RadarInsight["acao"]) {
  if (acao.tipo === "ver_categoria") return "/analytics/categorias";
  if (acao.referencia === "parcelamentos") return "/parcelamentos";
  return "/transacoes";
}

// ─── Mini bar chart (current vs previous) ───────────────────────────

function MiniComparisonChart({
  currentVal,
  prevVal,
  label,
}: {
  currentVal: number;
  prevVal: number;
  label: string;
}) {
  const max = Math.max(currentVal, prevVal, 1);
  const currentPct = (currentVal / max) * 100;
  const prevPct = (prevVal / max) * 100;

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground/60 w-16 text-right">Anterior</span>
          <div className="flex-1 h-2 bg-border/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${prevPct}%` }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="h-full rounded-full bg-muted-foreground/30"
            />
          </div>
          <span className="text-[9px] text-muted-foreground/60 w-20 tabular-nums">{fmt(prevVal)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-warning w-16 text-right font-semibold">Atual</span>
          <div className="flex-1 h-2 bg-border/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentPct}%` }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="h-full rounded-full"
              style={{ background: currentVal > prevVal ? "hsl(var(--destructive))" : "hsl(var(--primary))" }}
            />
          </div>
          <span className={`text-[9px] w-20 tabular-nums font-semibold ${currentVal > prevVal ? "text-destructive" : "text-primary"}`}>
            {fmt(currentVal)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────

export default function RadarFinanceiro() {
  const navigate = useNavigate();
  const { insights, status, loading, currentData, prevData } = useRadarFinanceiro();

  const statusConfig = {
    verde: {
      bg: "rgba(74,222,128,0.08)",
      border: "rgba(74,222,128,0.2)",
      glow: "rgba(74,222,128,0.06)",
      text: "text-primary",
      subtitle: "Tudo sob controle. Seu dinheiro está bem organizado.",
      emoji: "🟢",
    },
    amarelo: {
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.2)",
      glow: "rgba(245,158,11,0.06)",
      text: "text-warning",
      subtitle: "Alguns pontos merecem sua atenção.",
      emoji: "🟡",
    },
    vermelho: {
      bg: "rgba(239,68,68,0.08)",
      border: "rgba(239,68,68,0.2)",
      glow: "rgba(239,68,68,0.06)",
      text: "text-destructive",
      subtitle: "Detectamos pontos que podem impactar sua vida financeira.",
      emoji: "🔴",
    },
  };
  const sc = statusConfig[status.level];

  // Potential savings calculation
  const potentialSavings = useMemo(
    () => insights.reduce((s, i) => s + i.impacto_valor, 0),
    [insights]
  );

  // Find the top impacted category for the mini chart
  const topCategoryInsight = insights.find((i) => i.categoria);
  const topCatCurrent = topCategoryInsight
    ? (currentData?.categories?.find((c) => c.name === topCategoryInsight.categoria)?.amount ?? 0)
    : 0;
  const topCatPrev = topCategoryInsight
    ? (prevData?.categories?.find((c) => c.name === topCategoryInsight.categoria)?.amount ?? 0)
    : 0;

  // Huby message
  const hubyMessage = useMemo(() => {
    if (insights.length === 0) {
      return "Tá tudo nos trilhos! 🚀 Continue assim que o mês fecha no verde.";
    }
    const topInsight = insights[0];
    if (topInsight.tipo === "alerta" && topInsight.id === "comprometimento-renda") {
      return "Ei, suas despesas estão quase passando da receita... bora dar uma olhada juntos? 👀";
    }
    if (topInsight.categoria) {
      return `Seus gastos com ${topInsight.categoria} subiram esse mês... quer ver onde dá pra ajustar? 😉`;
    }
    return "Encontrei alguns padrões nos seus gastos. Vamos dar uma olhada? 🧐";
  }, [insights]);

  // Summary text
  const summaryText = useMemo(() => {
    const alertas = insights.filter((i) => i.tipo === "alerta").length;
    const atencoes = insights.filter((i) => i.tipo === "atencao").length;
    const parts: string[] = [];
    if (atencoes > 0) parts.push(`${atencoes} ponto${atencoes > 1 ? "s" : ""} de atenção`);
    if (alertas > 0) parts.push(`${alertas} alerta${alertas > 1 ? "s" : ""} importante${alertas > 1 ? "s" : ""}`);
    if (parts.length === 0) return "Nenhum alerta detectado este mês.";
    return `Você tem ${parts.join(" e ")} este mês.`;
  }, [insights]);

  return (
    <div className="space-y-4 pb-4">
      {/* ── Back ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
      </motion.div>

      {/* ── 1. Header inteligente ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
        <h1 className="font-display text-[22px] font-bold text-foreground tracking-tight">Radar Financeiro</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">{sc.subtitle}</p>
      </motion.div>

      {/* ── 2. Resumo Visual ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="rounded-[20px] p-5 relative overflow-hidden"
        style={{ background: sc.bg, border: `1px solid ${sc.border}` }}
      >
        {/* Glow */}
        <div
          className="absolute -top-8 -right-8 w-[100px] h-[100px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${sc.glow} 0%, transparent 70%)` }}
        />
        <div className="flex items-center gap-3.5 relative z-[1]">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: sc.bg }}
          >
            <ShieldCheck className={`w-6 h-6 ${sc.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm">{sc.emoji}</span>
              <h2 className={`text-[15px] font-bold ${sc.text}`}>{status.label}</h2>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">{summaryText}</p>
          </div>
        </div>
      </motion.div>

      {/* ── 3. Insights ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-28 rounded-[16px] bg-muted/10" />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 text-center"
          style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)" }}
        >
          <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-foreground mb-1">Tudo sob controle!</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Nenhum padrão de risco detectado. Continue mantendo seus gastos equilibrados.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold tracking-[1px] text-muted-foreground/70 uppercase">
            Insights detectados
          </p>
          {insights.map((insight, i) => {
            const intensity = intensityLabel(insight.intensidade);
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.05 }}
                className="rounded-[16px] p-4 border border-border/10 bg-card/60 backdrop-blur-xl relative overflow-hidden"
                style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.2)" }}
              >
                <div className="flex items-start gap-3">
                  <InsightIcon tipo={insight.tipo} />
                  <div className="flex-1 min-w-0">
                    {/* Title + category tag */}
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <h4 className="text-[13px] font-bold text-foreground truncate">{insight.titulo}</h4>
                      {insight.categoria && (
                        <span className="text-[9px] font-semibold text-muted-foreground bg-muted/20 px-2 py-0.5 rounded-full flex-shrink-0">
                          {insight.categoria}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-[12px] text-muted-foreground leading-relaxed mb-2.5">
                      {insight.descricao}
                    </p>

                    {/* Impact + intensity + action */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[14px] font-bold tabular-nums ${
                            insight.tipo === "alerta" ? "text-destructive" : "text-warning"
                          }`}
                        >
                          {insight.tipo === "alerta" && insight.id === "comprometimento-renda"
                            ? `${Math.round((currentData?.despesas ?? 0) / Math.max(currentData?.receitas ?? 1, 1) * 100)}% da renda`
                            : fmt(insight.impacto_valor)}
                        </span>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${intensity.color}`}
                          style={{ background: typeof intensity.bg === "string" && intensity.bg.startsWith("bg-") ? undefined : intensity.bg }}
                        >
                          {intensity.text}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(actionPath(insight.acao))}
                        className="flex items-center gap-0.5 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors flex-shrink-0"
                      >
                        {actionLabel(insight.acao)}
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── 4. Huby message ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
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
            <p className="text-[12px] text-muted-foreground leading-relaxed italic">
              {hubyMessage}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── 5. Impacto / economia potencial ── */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-[18px] p-4 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(74,222,128,0.06), rgba(74,222,128,0.02))",
            border: "1px solid rgba(74,222,128,0.15)",
          }}
        >
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
            Economia potencial
          </p>
          <p className="text-xl font-display font-bold text-primary tabular-nums">
            {fmt(potentialSavings)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            Se você ajustar esses gastos, pode economizar até esse valor no próximo mês.
          </p>
        </motion.div>
      )}

      {/* ── 6. Mini gráfico ── */}
      {topCategoryInsight && topCatCurrent > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-[18px] p-4 border border-border/10 bg-card/60 backdrop-blur-xl"
        >
          <MiniComparisonChart
            currentVal={topCatCurrent}
            prevVal={topCatPrev}
            label={`Evolução: ${topCategoryInsight.categoria}`}
          />
        </motion.div>
      )}

      {/* ── 7. Ações rápidas ── */}
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
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="rounded-[14px] p-3 flex flex-col items-center gap-1.5 border border-border/10 bg-card/40 backdrop-blur-xl hover:bg-card/60 active:scale-[0.97] transition-all"
            >
              <div className="text-primary">{action.icon}</div>
              <span className="text-[10px] font-semibold text-muted-foreground">{action.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Dica ── */}
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
          <h5 className="text-xs font-bold text-warning mb-0.5">Como funciona o Radar</h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            O Radar analisa automaticamente suas transações e compara com o mês anterior para identificar padrões, riscos e oportunidades.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
