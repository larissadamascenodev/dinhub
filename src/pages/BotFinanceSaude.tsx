import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, TrendingUp, Shield, Clock, Wallet, ChevronRight, Target, Settings2, Scissors, Zap, Sparkles, Brain } from "lucide-react";
import { useFinancialProjection } from "@/hooks/useFinancialProjection";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

const fmtCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const GlassSection = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35, ease: "easeOut" }}
    className={`glass-card p-4 space-y-3 ${className}`}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-2">
    {icon}
    <h2 className="text-sm font-semibold font-display">{title}</h2>
  </div>
);

const BotFinanceSaude = () => {
  const navigate = useNavigate();
  const { healthScore: healthData, projections, data, dailyLimit } = useFinancialProjection();
  const animatedScore = useAnimatedCounter(healthData.score);

  const scoreColor =
    healthData.score >= 75 ? "text-primary" : healthData.score >= 50 ? "text-warning" : "text-destructive";
  const scoreStroke =
    healthData.score >= 75 ? "hsl(var(--primary))" : healthData.score >= 50 ? "hsl(var(--warning))" : "hsl(var(--destructive))";
  const scoreBg =
    healthData.score >= 75 ? "bg-primary/10" : healthData.score >= 50 ? "bg-warning/10" : "bg-destructive/10";

  // Generate personalized tips based on factors
  const tips = healthData.factors
    .filter((f) => f.value / f.max < 0.6)
    .map((f) => {
      if (f.label === "Saldo crescente") return { icon: TrendingUp, text: "Foque em aumentar seu saldo — reduza gastos variáveis ou busque renda extra.", color: "text-primary" };
      if (f.label === "Controle de gastos") return { icon: Shield, text: "Seus gastos de hoje estão altos. Tente manter dentro da média diária.", color: "text-warning" };
      if (f.label === "Consistência") return { icon: Clock, text: "Sua projeção mostra meses negativos. Busque estabilizar receita e despesa.", color: "text-destructive" };
      return { icon: Wallet, text: "Pague suas despesas pendentes para melhorar sua pontuação.", color: "text-primary" };
    });

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button
          onClick={() => navigate("/bot-finance")}
          className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div>
          <h1 className="font-display text-lg font-bold">Saúde Financeira</h1>
          <p className="text-[11px] text-muted-foreground">Score completo com dicas personalizadas</p>
        </div>
      </motion.div>

      <div className="space-y-4 max-w-3xl mx-auto">

        {/* Score principal */}
        <GlassSection delay={0.05}>
          <div className="flex flex-col items-center py-4 gap-3">
            {/* Large circular score */}
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="54" fill="none" stroke="hsl(var(--secondary))" strokeWidth="7" />
                <circle
                  cx="64" cy="64" r="54" fill="none"
                  stroke={scoreStroke}
                  strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={`${(healthData.score / 100) * 339.3} 339.3`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold tabular-nums font-display ${scoreColor}`}>{Math.round(animatedScore)}</span>
                <span className="text-[10px] text-muted-foreground">/100</span>
              </div>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold font-display ${scoreColor}`}>{healthData.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {healthData.score >= 75
                  ? "Suas finanças estão ótimas! Continue assim 🎉"
                  : healthData.score >= 50
                    ? "Pode melhorar com pequenos ajustes 💡"
                    : healthData.score >= 30
                      ? "Atenção: alguns pontos precisam de cuidado ⚠️"
                      : "Situação crítica — hora de agir 🚨"}
              </p>
            </div>
          </div>
        </GlassSection>

        {/* Fatores detalhados */}
        <GlassSection delay={0.12}>
          <SectionHeader icon={<Heart className="w-4 h-4 text-primary" />} title="Fatores de Pontuação" />
          <div className="space-y-3">
            {healthData.factors.map((f, i) => {
              const pct = f.value / f.max;
              const barColor = pct >= 0.7 ? "bg-primary" : pct >= 0.4 ? "bg-warning" : "bg-destructive";
              const textColor = pct >= 0.7 ? "text-primary" : pct >= 0.4 ? "text-warning" : "text-destructive";
              return (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground font-medium">{f.label}</span>
                    <span className={`text-xs font-bold tabular-nums ${textColor}`}>{f.value}/{f.max}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct * 100}%` }}
                      transition={{ duration: 0.7, delay: 0.2 + i * 0.06 }}
                      className={`h-full rounded-full ${barColor}`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassSection>

        {/* Dicas personalizadas */}
        {tips.length > 0 && (
          <GlassSection delay={0.2}>
            <SectionHeader icon={<Sparkles className="w-4 h-4 text-[hsl(260,60%,65%)]" />} title="Dicas para Melhorar" />
            <div className="space-y-2">
              {tips.map((tip, i) => {
                const Icon = tip.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.06 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30"
                  >
                    <div className={`w-7 h-7 rounded-lg ${scoreBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 ${tip.color}`} />
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{tip.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </GlassSection>
        )}

        {/* Resumo rápido */}
        <GlassSection delay={0.28}>
          <SectionHeader icon={<Brain className="w-4 h-4 text-[hsl(260,60%,65%)]" />} title="Resumo" />
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-secondary/40 rounded-xl p-3 text-center">
              <p className="text-[9px] text-muted-foreground mb-0.5">Limite diário</p>
              <p className={`text-sm font-bold tabular-nums ${
                dailyLimit.tone === "positive" ? "text-primary" : dailyLimit.tone === "neutral" ? "text-warning" : "text-destructive"
              }`}>
                {fmtCurrency(dailyLimit.safeToSpend)}
              </p>
            </div>
            <div className="bg-secondary/40 rounded-xl p-3 text-center">
              <p className="text-[9px] text-muted-foreground mb-0.5">Saldo previsto</p>
              <p className={`text-sm font-bold tabular-nums ${data.saldoPrevisto >= 0 ? "text-primary" : "text-destructive"}`}>
                {fmtCurrency(data.saldoPrevisto)}
              </p>
            </div>
            <div className="bg-secondary/40 rounded-xl p-3 text-center">
              <p className="text-[9px] text-muted-foreground mb-0.5">Meses positivos</p>
              <p className="text-sm font-bold tabular-nums text-primary">
                {projections.filter((p) => p.delta > 0).length}/6
              </p>
            </div>
            <div className="bg-secondary/40 rounded-xl p-3 text-center">
              <p className="text-[9px] text-muted-foreground mb-0.5">Pendências</p>
              <p className="text-sm font-bold tabular-nums text-warning">
                {fmtCurrency(data.despesasPendentes)}
              </p>
            </div>
          </div>
        </GlassSection>

        {/* Ações inteligentes */}
        <GlassSection delay={0.34}>
          <SectionHeader icon={<Zap className="w-4 h-4 text-primary" />} title="Ações Recomendadas" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              {
                icon: Target, label: "Ver projeções", desc: "Simule cenários futuros",
                color: "text-primary", bgColor: "bg-primary/10 group-hover:bg-primary/20",
                action: () => navigate("/bot-finance/projecoes"),
              },
              {
                icon: Settings2, label: "Ajustar limite", desc: "Configurar gasto diário",
                color: "text-warning", bgColor: "bg-warning/10 group-hover:bg-warning/20",
                action: () => navigate("/bot-finance/projecoes"),
              },
              {
                icon: Scissors, label: "Reduzir gastos", desc: "Veja onde cortar",
                color: "text-destructive", bgColor: "bg-destructive/10 group-hover:bg-destructive/20",
                action: () => navigate("/transacoes"),
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 active:scale-[0.96] transition-all text-left relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at 30% 50%, hsl(var(--primary) / 0.06) 0%, transparent 70%)" }}
                  />
                  <div className={`relative w-9 h-9 rounded-xl ${item.bgColor} flex items-center justify-center flex-shrink-0 transition-colors`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{item.desc}</p>
                  </div>
                  <ChevronRight className="relative w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </GlassSection>
      </div>
    </div>
  );
};

export default BotFinanceSaude;
