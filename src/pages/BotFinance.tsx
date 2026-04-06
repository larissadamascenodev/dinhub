import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Radar, HeartPulse, PieChart, Lightbulb, ChevronRight, Lock, Target } from "lucide-react";

interface ToolCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  path?: string;
  disabled?: boolean;
}

const tools: ToolCard[] = [
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Projeções Inteligentes",
    description: "Veja para onde seu dinheiro está indo e quanto você pode gastar com segurança",
    path: "/bot-finance/projecoes",
  },
  {
    icon: <Radar className="w-5 h-5" />,
    title: "Radar Financeiro",
    description: "Detecte padrões incomuns e oportunidades de economia",
    disabled: true,
  },
  {
    icon: <HeartPulse className="w-5 h-5" />,
    title: "Saúde Financeira",
    description: "Um score completo da sua vida financeira com dicas personalizadas",
    path: "/bot-finance/saude",
  },
  {
    icon: <PieChart className="w-5 h-5" />,
    title: "Análise por Categorias",
    description: "Entenda como seus gastos se distribuem e onde otimizar",
    disabled: true,
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Metas Financeiras",
    description: "Defina objetivos, acompanhe progresso e receba dicas inteligentes",
    path: "/metas",
  },
];

const BotFinance = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <h1 className="font-display text-xl font-bold">Bot Finance</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Seu assistente financeiro pessoal
        </p>
      </motion.div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tools.map((tool, i) => (
          <motion.button
            key={tool.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={tool.disabled ? {} : { scale: 1.02 }}
            whileTap={tool.disabled ? {} : { scale: 0.98 }}
            onClick={() => !tool.disabled && tool.path && navigate(tool.path)}
            disabled={tool.disabled}
            className={`glass-card p-4 text-left transition-all duration-200 group relative overflow-hidden ${
              tool.disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-primary/20 cursor-pointer"
            }`}
          >
            {/* Glow effect on hover */}
            {!tool.disabled && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 30% 20%, hsl(var(--primary) / 0.06) 0%, transparent 60%)" }}
              />
            )}

            <div className="relative flex items-start gap-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                tool.disabled
                  ? "bg-muted/50 text-muted-foreground"
                  : "bg-primary/10 text-primary"
              }`}>
                {tool.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-semibold truncate">
                    {tool.title}
                  </h3>
                  {tool.disabled && (
                    <span className="flex-shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
                      Em breve
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {tool.description}
                </p>
              </div>
              {!tool.disabled ? (
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0 mt-1" />
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Dica section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-4 flex items-start gap-3"
      >
        <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-4 h-4 text-warning" />
        </div>
        <div>
          <p className="text-xs font-medium text-foreground">Dica do Bot</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Comece pelas Projeções Inteligentes para entender como seu dinheiro se comporta ao longo dos próximos meses.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default BotFinance;
