import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain, TrendingUp, Radar, HeartPulse, PieChart, Lightbulb,
  BarChart3, Sparkles, Lock,
} from "lucide-react";

interface ToolItem {
  icon: React.ReactNode;
  label: string;
  path?: string;
  disabled?: boolean;
  color: string; // hsl accent
  bgFrom: string;
}

const tools: ToolItem[] = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    label: "Projeções",
    path: "/bot-finance/projecoes",
    color: "hsl(var(--primary))",
    bgFrom: "hsl(150 40% 14%)",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    label: "Balanço",
    path: "/bot-finance/balanco",
    color: "hsl(215 80% 60%)",
    bgFrom: "hsl(215 30% 14%)",
  },
  {
    icon: <Radar className="w-5 h-5" />,
    label: "Radar",
    disabled: true,
    color: "hsl(280 60% 60%)",
    bgFrom: "hsl(280 20% 14%)",
  },
  {
    icon: <HeartPulse className="w-5 h-5" />,
    label: "Saúde",
    path: "/bot-finance/saude",
    color: "hsl(340 70% 55%)",
    bgFrom: "hsl(340 25% 14%)",
  },
  {
    icon: <PieChart className="w-5 h-5" />,
    label: "Categorias",
    disabled: true,
    color: "hsl(40 80% 55%)",
    bgFrom: "hsl(40 25% 14%)",
  },
];

const BotFinance = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

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

      {/* ═══ Circular Tools ═══ */}
      {/* Mobile: horizontal carousel / Desktop: flex wrap row */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto md:overflow-visible md:flex-wrap md:justify-start pb-2 md:pb-0 scrollbar-none snap-x snap-mandatory md:snap-none -mx-1 px-1"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {tools.map((tool, i) => {
          const isDisabled = !!tool.disabled;
          return (
            <motion.button
              key={tool.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 260, damping: 20 }}
              whileHover={isDisabled ? {} : { scale: 1.08 }}
              whileTap={isDisabled ? {} : { scale: 0.92 }}
              onClick={() => !isDisabled && tool.path && navigate(tool.path)}
              disabled={isDisabled}
              className="flex flex-col items-center gap-2 flex-shrink-0 snap-center group"
              style={{ opacity: isDisabled ? 0.45 : 1 }}
            >
              {/* Circle */}
              <div
                className="relative w-16 h-16 md:w-[72px] md:h-[72px] rounded-full flex items-center justify-center border transition-shadow duration-300"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${tool.bgFrom}, hsl(220 18% 7%) 90%)`,
                  borderColor: isDisabled ? "hsl(220 10% 18%)" : `${tool.color}33`,
                  boxShadow: isDisabled ? "none" : `0 0 20px ${tool.color}15, inset 0 1px 0 hsl(220 20% 20% / 0.25)`,
                }}
              >
                {/* Subtle glow behind icon */}
                {!isDisabled && (
                  <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${tool.color}20, transparent 65%)` }}
                  />
                )}
                <div style={{ color: isDisabled ? "hsl(220 10% 40%)" : tool.color }}>
                  {tool.icon}
                </div>
                {isDisabled && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-muted border border-border/50 flex items-center justify-center">
                    <Lock className="w-2 h-2 text-muted-foreground" />
                  </div>
                )}
              </div>
              {/* Label */}
              <span
                className="text-[10px] md:text-[11px] font-semibold leading-tight text-center max-w-[72px]"
                style={{ color: isDisabled ? "hsl(220 10% 40%)" : "hsl(220 15% 75%)" }}
              >
                {tool.label}
              </span>
            </motion.button>
          );
        })}
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
