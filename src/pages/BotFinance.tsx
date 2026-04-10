import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain, TrendingUp, Radar, HeartPulse, PieChart, Lightbulb,
  ChevronRight, Lock, BarChart3, Sparkles, Activity,
} from "lucide-react";

interface ToolCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  path?: string;
  disabled?: boolean;
}

const tools: ToolCard[] = [
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
];

const BotFinance = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-5 pb-4">
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

      {/* ═══ Featured Cards: Projeções + Balanço ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Projeções Inteligentes */}
        <motion.button
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/bot-finance/projecoes")}
          className="relative overflow-hidden rounded-xl border border-primary/15 backdrop-blur-xl p-4 text-left group cursor-pointer"
          style={{
            background: "linear-gradient(160deg, hsl(160 30% 12% / 0.5) 0%, hsl(220 18% 8% / 0.7) 50%, hsl(220 20% 5% / 0.85) 100%)",
          }}
        >
          {/* Decorative glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.1), transparent 65%)", filter: "blur(30px)" }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06), transparent 65%)", filter: "blur(25px)" }} />

          {/* Floating sparkle dots */}
          <motion.div
            className="absolute top-3 right-12 w-1 h-1 rounded-full bg-primary/30"
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-8 right-6 w-0.5 h-0.5 rounded-full bg-primary/20"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          />

          <div className="relative flex items-start gap-3.5">
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm font-bold text-foreground mb-0.5">Projeções Inteligentes</h3>
              <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                Tendência · próximos 12 meses
              </p>
              {/* Mini trend indicator */}
              <div className="flex items-center gap-1.5 mt-2.5">
                <div className="flex items-end gap-px">
                  {[3, 5, 4, 7, 6, 8].map((h, i) => (
                    <motion.div
                      key={i}
                      className="w-[3px] rounded-full bg-primary/40"
                      initial={{ height: 0 }}
                      animate={{ height: h * 2.2 }}
                      transition={{ delay: 0.3 + i * 0.06, duration: 0.4, ease: "easeOut" }}
                    />
                  ))}
                </div>
                <TrendingUp className="w-3 h-3 text-primary/50 ml-1" />
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-primary/30 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
          </div>
        </motion.button>

        {/* Balanço Mensal */}
        <motion.button
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/bot-finance/balanco")}
          className="relative overflow-hidden rounded-xl border border-blue-400/15 backdrop-blur-xl p-4 text-left group cursor-pointer"
          style={{
            background: "linear-gradient(160deg, hsl(220 28% 13% / 0.5) 0%, hsl(220 18% 8% / 0.7) 50%, hsl(220 20% 5% / 0.85) 100%)",
          }}
        >
          {/* Decorative glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, hsl(215 80% 55% / 0.08), transparent 65%)", filter: "blur(30px)" }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, hsl(215 80% 55% / 0.05), transparent 65%)", filter: "blur(25px)" }} />

          <div className="relative flex items-start gap-3.5">
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-400/10 border border-blue-400/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-sm font-bold text-foreground mb-0.5">Balanço Mensal</h3>
              <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                Receitas vs Despesas por mês
              </p>
              {/* Mini bar chart indicator */}
              <div className="flex items-end gap-[3px] mt-2.5">
                {[
                  { up: 14, down: 10 },
                  { up: 12, down: 13 },
                  { up: 16, down: 9 },
                  { up: 11, down: 14 },
                  { up: 15, down: 11 },
                ].map((bar, i) => (
                  <div key={i} className="flex gap-px items-end">
                    <motion.div
                      className="w-[3px] rounded-full bg-primary/35"
                      initial={{ height: 0 }}
                      animate={{ height: bar.up }}
                      transition={{ delay: 0.35 + i * 0.06, duration: 0.4, ease: "easeOut" }}
                    />
                    <motion.div
                      className="w-[3px] rounded-full bg-blue-400/30"
                      initial={{ height: 0 }}
                      animate={{ height: bar.down }}
                      transition={{ delay: 0.38 + i * 0.06, duration: 0.4, ease: "easeOut" }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-400/30 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
          </div>
        </motion.button>
      </div>

      {/* Other Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tools.map((tool, i) => (
          <motion.button
            key={tool.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
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
            {!tool.disabled && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 30% 20%, hsl(var(--primary) / 0.06) 0%, transparent 60%)" }}
              />
            )}
            <div className="relative flex items-start gap-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                tool.disabled ? "bg-muted/50 text-muted-foreground" : "bg-primary/10 text-primary"
              }`}>
                {tool.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-semibold truncate">{tool.title}</h3>
                  {tool.disabled && (
                    <span className="flex-shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
                      Em breve
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tool.description}</p>
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
