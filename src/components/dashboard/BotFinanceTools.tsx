import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, BarChart3, Radar, HeartPulse, Target, Swords, Lock, Wallet,
} from "lucide-react";

interface ToolItem {
  icon: React.ReactNode;
  label: string;
  path?: string;
  disabled?: boolean;
  color: string;
  bgFrom: string;
  borderColor?: string;
}

const tools: ToolItem[] = [
  {
    icon: <Wallet className="w-5 h-5" />,
    label: "Carteira",
    path: "/gestao",
    color: "hsl(var(--primary))",
    bgFrom: "hsl(150 40% 14%)",
    borderColor: "hsl(var(--primary) / 0.18)",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    label: "Balanço",
    path: "/bot-finance/balanco",
    color: "hsl(215 80% 60%)",
    bgFrom: "hsl(215 30% 14%)",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    label: "Projeções",
    path: "/bot-finance/projecoes",
    color: "hsl(270 70% 65%)",
    bgFrom: "hsl(270 25% 14%)",
  },
  {
    icon: <Target className="w-5 h-5" />,
    label: "Metas",
    path: "/metas",
    color: "hsl(40 80% 55%)",
    bgFrom: "hsl(40 25% 14%)",
  },
  {
    icon: <Swords className="w-5 h-5" />,
    label: "Desafios",
    path: "/desafios",
    color: "hsl(25 85% 55%)",
    bgFrom: "hsl(25 30% 14%)",
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
    disabled: true,
    color: "hsl(340 70% 55%)",
    bgFrom: "hsl(340 25% 14%)",
  },
];

interface BotFinanceToolsProps {
  layout?: "carousel" | "grid";
}

const BotFinanceTools = ({ layout = "carousel" }: BotFinanceToolsProps) => {
  const navigate = useNavigate();
  const isCarousel = layout === "carousel";
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Desktop mouse drag for carousel
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCarousel || !containerRef.current) return;
    isDragging.current = false;
    const el = containerRef.current;
    const startX = e.pageX;
    const scrollLeft = el.scrollLeft;

    const onMove = (ev: MouseEvent) => {
      const dx = ev.pageX - startX;
      if (Math.abs(dx) > 3) isDragging.current = true;
      el.scrollLeft = scrollLeft - dx;
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <div className="relative z-30 overflow-visible -mx-1 px-1 pt-2 pb-1">
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        className={
          isCarousel
            ? "flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
            : "flex gap-3 flex-wrap justify-start select-none"
        }
        style={isCarousel ? { WebkitOverflowScrolling: "touch" } : undefined}
      >
        {tools.map((tool, i) => {
          const isDisabled = !!tool.disabled;
          return (
            <motion.button
              key={tool.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 260, damping: 20 }}
              whileHover={isDisabled ? {} : { y: -3, scale: 1.03, transition: { duration: 0.2 } }}
              whileTap={isDisabled ? {} : { scale: 0.95 }}
              onClick={() => {
                if (isDragging.current) return;
                if (!isDisabled && tool.path) navigate(tool.path);
              }}
              disabled={isDisabled}
              className={`relative z-0 hover:z-20 flex flex-col items-center gap-2 flex-shrink-0 group ${isCarousel ? "snap-center" : ""}`}
              style={{ opacity: isDisabled ? 0.45 : 1 }}
            >
              <div
                className="relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center border transition-all duration-300"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${tool.bgFrom}, hsl(220 18% 7%) 90%)`,
                  borderColor: isDisabled ? "hsl(220 10% 18%)" : (tool.borderColor || `${tool.color}30`),
                  boxShadow: isDisabled ? "none" : `0 0 12px ${tool.color}08, inset 0 1px 0 hsl(220 20% 20% / 0.15)`,
                }}
              >
                {!isDisabled && (
                  <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${tool.color}18, transparent 65%)` }}
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
              <span
                className="text-[10px] font-semibold leading-tight text-center max-w-[64px]"
                style={{ color: isDisabled ? "hsl(220 10% 40%)" : "hsl(220 15% 75%)" }}
              >
                {tool.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default BotFinanceTools;
