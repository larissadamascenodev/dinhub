import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bot, MessageCircle, Camera, Mic, Radar, HeartPulse, TrendingUp, Sparkles, Lightbulb, Search } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useFinancialProjection } from "@/hooks/useFinancialProjection";

const BotFinance = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { healthScore } = useFinancialProjection();

  const firstName = profile?.display_name?.split(" ")[0] || "usuário";
  const score = healthScore?.score ?? 0;
  const scoreLabel =
    score >= 80 ? "Excelente" : score >= 60 ? "Bom" : score >= 40 ? "Regular" : "Atenção";

  const tools = [
    {
      icon: <Radar className="w-[18px] h-[18px]" />,
      label: "Radar Financeiro",
      desc: "Alertas e padrões detectados",
      stat: "3 alertas",
      badge: "🟡 Atenção",
      path: "/bot-finance/balanco",
      theme: "amber" as const,
    },
    {
      icon: <HeartPulse className="w-[18px] h-[18px]" />,
      label: "Saúde Financeira",
      desc: "Score geral do seu dinheiro",
      stat: `${score} / 100`,
      badge: `🟢 ${scoreLabel}`,
      path: "/bot-finance/saude",
      theme: "green" as const,
    },
    {
      icon: <TrendingUp className="w-[18px] h-[18px]" />,
      label: "Projeções",
      desc: "Como seu dinheiro evolui",
      stat: "abr/2027",
      badge: "🔮 Livre em 12 meses",
      path: "/bot-finance/projecoes",
      theme: "purple" as const,
    },
    {
      icon: <Search className="w-[18px] h-[18px]" />,
      label: "Análise IA",
      desc: "Insights personalizados",
      stat: "5 dicas",
      badge: "✨ Novidades",
      path: "/analytics-categorias",
      theme: "cyan" as const,
    },
  ];

  const themeStyles = {
    amber: {
      iconBg: "rgba(245,158,11,0.15)",
      iconColor: "#f59e0b",
      statColor: "#f59e0b",
      borderColor: "rgba(245,158,11,0.15)",
      cardBg: "linear-gradient(135deg, #1a1608, hsl(var(--card)))",
    },
    green: {
      iconBg: "rgba(74,222,128,0.15)",
      iconColor: "hsl(var(--primary))",
      statColor: "hsl(var(--primary))",
      borderColor: "rgba(74,222,128,0.2)",
      cardBg: "linear-gradient(135deg, #111a13, hsl(var(--card)))",
    },
    purple: {
      iconBg: "rgba(167,139,250,0.15)",
      iconColor: "#a78bfa",
      statColor: "#a78bfa",
      borderColor: "rgba(167,139,250,0.15)",
      cardBg: "linear-gradient(135deg, #14111a, hsl(var(--card)))",
    },
    cyan: {
      iconBg: "rgba(34,211,238,0.15)",
      iconColor: "#22d3ee",
      statColor: "#22d3ee",
      borderColor: "rgba(34,211,238,0.15)",
      cardBg: "linear-gradient(135deg, #0e181a, hsl(var(--card)))",
    },
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-1"
      >
        <h1 className="font-display text-[22px] font-bold text-foreground tracking-tight">Bot Huby</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Sua central de inteligência financeira</p>
      </motion.div>

      {/* Assistente Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative rounded-[20px] p-5 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
        style={{
          background: "linear-gradient(135deg, #0f2318 0%, #0a1a0f 60%, hsl(var(--card)) 100%)",
          border: "1px solid rgba(74, 222, 128, 0.25)",
        }}
      >
        {/* Glow effect */}
        <div
          className="absolute -top-10 -right-10 w-[120px] h-[120px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)" }}
        />

        <div className="flex items-center gap-3 mb-3.5 relative z-[1]">
          <div
            className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 text-xl"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), #16a34a)",
              boxShadow: "0 0 20px rgba(74,222,128,0.3)",
            }}
          >
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Assistente DinHub</h3>
            <p className="text-xs text-primary flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block animate-pulse" />
              Online agora
            </p>
          </div>
        </div>

        <div
          className="rounded-xl p-3 mb-3.5 text-[13px] leading-relaxed relative z-[1]"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <span className="font-semibold text-foreground">💡 Olá, {firstName}!</span>{" "}
          <span className="text-muted-foreground italic">
            Seus gastos com Eletrônicos subiram 40% esse mês. Quer que eu analise onde você pode economizar?
          </span>
        </div>

        <div className="flex gap-2 relative z-[1]">
          <button
            onClick={() => navigate("/bot-finance/balanco")}
            className="flex-1 flex items-center justify-center gap-1.5 bg-primary/15 text-primary rounded-xl py-2.5 text-[13px] font-bold hover:bg-primary/20 active:opacity-85 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            Conversar agora →
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground border border-border/30 hover:bg-white/5 active:bg-white/10 transition-colors"
            style={{ background: "rgba(255,255,255,0.07)" }}>
            <Camera className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground border border-border/30 hover:bg-white/5 active:bg-white/10 transition-colors"
            style={{ background: "rgba(255,255,255,0.07)" }}>
            <Mic className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* AI Tools */}
      <div>
        <p className="text-[11px] font-semibold tracking-[1px] text-muted-foreground/70 uppercase mb-3">
          Ferramentas de IA
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {tools.map((tool, i) => {
            const t = themeStyles[tool.theme];
            return (
              <motion.button
                key={tool.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => navigate(tool.path)}
                className="rounded-[18px] p-4 text-left active:scale-[0.97] transition-transform relative overflow-hidden"
                style={{
                  background: t.cardBg,
                  border: `1px solid ${t.borderColor}`,
                }}
              >
                <div
                  className="w-[38px] h-[38px] rounded-xl flex items-center justify-center mb-3"
                  style={{ background: t.iconBg, color: t.iconColor }}
                >
                  {tool.icon}
                </div>
                <h4 className="text-[13px] font-bold text-foreground mb-1">{tool.label}</h4>
                <p className="text-[11px] text-muted-foreground/70 leading-snug">{tool.desc}</p>
                <p
                  className="text-[15px] font-bold font-mono tracking-tight mt-2.5"
                  style={{ color: t.statColor }}
                >
                  {tool.stat}
                </p>
                <span
                  className="inline-flex items-center gap-1 mt-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  {tool.badge}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Dica do Bot */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
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
          <h5 className="text-xs font-bold text-warning mb-0.5">Dica do Assistente</h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Você tem R$ 1.318 comprometidos em parcelamentos por mês. Evitar novas compras parceladas agora acelera sua liberdade financeira.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default BotFinance;
