import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bot, MessageCircle, Camera, Mic, Radar, HeartPulse, TrendingUp, Sparkles, Lightbulb } from "lucide-react";
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
  const scoreColor =
    score >= 80 ? "hsl(var(--primary))" : score >= 60 ? "hsl(var(--primary))" : score >= 40 ? "hsl(40 80% 55%)" : "hsl(0 70% 55%)";

  const tools = [
    {
      icon: <Radar className="w-6 h-6" />,
      label: "Radar Financeiro",
      desc: "Alertas e padrões detectados",
      stat: "3 alertas",
      statColor: "hsl(0 70% 55%)",
      badge: "🔴 Atenção",
      path: "/bot-finance/balanco",
      borderColor: "hsl(var(--primary) / 0.2)",
    },
    {
      icon: <HeartPulse className="w-6 h-6" />,
      label: "Saúde Financeira",
      desc: "Score geral do seu dinheiro",
      stat: `${score} / 100`,
      statColor: scoreColor,
      badge: `🟢 ${scoreLabel}`,
      path: "/bot-finance/saude",
      borderColor: "hsl(var(--primary) / 0.2)",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: "Projeções",
      desc: "Como seu dinheiro evolui",
      stat: "abr/2027",
      statColor: "hsl(var(--primary))",
      badge: "🏖️ Livre em 12 meses",
      path: "/bot-finance/projecoes",
      borderColor: "hsl(var(--primary) / 0.2)",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      label: "Análise IA",
      desc: "Insights personalizados",
      stat: "5 dicas",
      statColor: "hsl(var(--primary))",
      badge: "✨ Novidades",
      path: "/analytics-categorias",
      borderColor: "hsl(var(--primary) / 0.2)",
    },
  ];

  return (
    <div className="space-y-5 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="font-display text-2xl font-bold text-foreground">Bot Finance</h1>
        <p className="text-sm text-muted-foreground">Sua central de inteligência financeira</p>
      </motion.div>

      {/* Assistant Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5 space-y-4"
        style={{ borderColor: "hsl(var(--primary) / 0.15)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Assistente DinHub</p>
            <p className="text-xs text-primary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              Online agora
            </p>
          </div>
        </div>

        <div className="bg-muted/40 rounded-xl p-3.5">
          <p className="text-sm text-muted-foreground">
            <span className="text-base mr-1">💡</span>
            Olá, {firstName}!{" "}
            <span className="text-primary">
              Seus gastos com Eletrônicos subiram 40% esse mês. Quer que eu analise onde você pode economizar?
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/bot-finance/balanco")}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 px-4 text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Conversar agora →
          </button>
          <button className="w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center border border-border/30 hover:bg-muted/70 transition-colors">
            <Camera className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center border border-border/30 hover:bg-muted/70 transition-colors">
            <Mic className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </motion.div>

      {/* AI Tools Grid */}
      <div className="space-y-3">
        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
          Ferramentas de IA
        </p>
        <div className="grid grid-cols-2 gap-3">
          {tools.map((tool, i) => (
            <motion.button
              key={tool.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              onClick={() => navigate(tool.path)}
              className="glass-card p-4 text-left space-y-2.5 hover:border-primary/30 transition-colors"
              style={{ borderColor: tool.borderColor }}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {tool.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{tool.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{tool.desc}</p>
              </div>
              <p
                className="text-base font-bold font-mono tracking-tight"
                style={{ color: tool.statColor }}
              >
                {tool.stat}
              </p>
              <span className="inline-block text-[10px] bg-muted/60 rounded-full px-2.5 py-0.5 text-muted-foreground">
                {tool.badge}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tip Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-4 flex items-start gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-warning" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">Dica do Assistente</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Você tem R$ 1.318 comprometidos em parcelamentos por mês. Evitar novas compras parceladas agora acelera sua liberdade financeira.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default BotFinance;
