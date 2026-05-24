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
    <div className="relative z-30 overflow-visible pt-2 pb-1">
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        className={
          isCarousel
            ? "flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none px-4 -mx-4"
            : "grid grid-cols-2 sm:grid-cols-3 gap-4 select-none"
        }
        style={isCarousel ? { WebkitOverflowScrolling: "touch" } : undefined}
      >
        {tools.map((tool, i) => {
          const isDisabled = !!tool.disabled;
          return (
            <motion.button
              key={tool.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 260, damping: 20 }}
              whileHover={isDisabled ? {} : { y: -4, scale: 1.02 }}
              whileTap={isDisabled ? {} : { scale: 0.96 }}
              onClick={() => {
                if (isDragging.current) return;
                if (!isDisabled && tool.path) navigate(tool.path);
              }}
              disabled={isDisabled}
              className={`relative flex flex-col items-center gap-3 p-4 rounded-[24px] border border-white/[0.04] bg-white/[0.02] transition-all duration-300 ${isCarousel ? "snap-center min-w-[100px]" : "w-full"}`}
              style={{ opacity: isDisabled ? 0.4 : 1 }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${tool.bgFrom}, transparent)`,
                  color: isDisabled ? "hsl(220 10% 40%)" : tool.color,
                  boxShadow: isDisabled ? "none" : `0 8px 16px -4px ${tool.color}20`,
                }}
              >
                {tool.icon}
              </div>
              <span
                className="text-[11px] font-bold tracking-tight text-white/60"
              >
                {tool.label}
              </span>
              {isDisabled && (
                <div className="absolute top-3 right-3">
                  <Lock className="w-2.5 h-2.5 text-white/20" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default BotFinanceTools;
