import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, TrendingUp, Zap, ShieldCheck, ChevronRight } from "lucide-react";
import { useRadarFinanceiro } from "@/hooks/useRadarFinanceiro";
import type { RadarInsight } from "@/services/radarService";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function InsightIcon({ tipo }: { tipo: RadarInsight["tipo"] }) {
  if (tipo === "alerta")
    return (
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-destructive/15">
        <AlertTriangle className="w-4 h-4 text-destructive" />
      </div>
    );
  if (tipo === "atencao")
    return (
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)" }}>
        <Zap className="w-4 h-4 text-warning" />
      </div>
    );
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/15">
      <TrendingUp className="w-4 h-4 text-primary" />
    </div>
  );
}

function actionLabel(acao: RadarInsight["acao"]) {
  if (acao.tipo === "ver_categoria") return "Ver categoria";
  if (acao.tipo === "ajustar_limite") return "Ajustar limite";
  return "Analisar gastos";
}

function actionPath(acao: RadarInsight["acao"]) {
  if (acao.tipo === "ver_categoria") return "/analytics/categorias";
  if (acao.referencia === "parcelamentos") return "/parcelamentos";
  return "/transacoes";
}

export default function RadarFinanceiro() {
  const navigate = useNavigate();
  const { insights, status, loading } = useRadarFinanceiro();

  const statusColors = {
    verde: { bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.25)", text: "text-primary" },
    amarelo: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", text: "text-warning" },
    vermelho: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)", text: "text-destructive" },
  };
  const sc = statusColors[status.level];

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

      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
        <h1 className="font-display text-[22px] font-bold text-foreground tracking-tight">Radar Financeiro</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Alertas e padrões detectados no seu mês</p>
      </motion.div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="rounded-[20px] p-5 relative overflow-hidden"
        style={{ background: sc.bg, border: `1px solid ${sc.border}` }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: sc.bg }}>
            <ShieldCheck className={`w-6 h-6 ${sc.text}`} />
          </div>
          <div>
            <h2 className={`text-base font-bold ${sc.text}`}>{status.label}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {status.insightCount === 0
                ? "Nenhum alerta detectado este mês"
                : `${status.insightCount} insight${status.insightCount > 1 ? "s" : ""} identificado${status.insightCount > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Insights */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-24 rounded-xl bg-muted/10" />
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
          <p className="text-xs text-muted-foreground">
            Nenhum padrão de risco detectado. Continue mantendo seus gastos equilibrados.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] font-semibold tracking-[1px] text-muted-foreground/70 uppercase">
            Insights detectados
          </p>
          {insights.map((insight, i) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.05 }}
              className="rounded-[16px] p-4 border border-border/10 bg-card/60 backdrop-blur-xl"
              style={{ boxShadow: "0 2px 8px -4px rgba(0,0,0,0.15)" }}
            >
              <div className="flex items-start gap-3">
                <InsightIcon tipo={insight.tipo} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-[13px] font-bold text-foreground">{insight.titulo}</h4>
                    {insight.categoria && (
                      <span className="text-[10px] font-semibold text-muted-foreground bg-muted/20 px-2 py-0.5 rounded-full">
                        {insight.categoria}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed mb-2">
                    {insight.descricao}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[13px] font-bold tabular-nums ${
                        insight.tipo === "alerta" ? "text-destructive" : "text-warning"
                      }`}
                    >
                      {fmt(insight.impacto_valor)}
                    </span>
                    <button
                      onClick={() => navigate(actionPath(insight.acao))}
                      className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      {actionLabel(insight.acao)}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
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
