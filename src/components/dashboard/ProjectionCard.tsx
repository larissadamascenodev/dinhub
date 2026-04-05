import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const ProjectionCard = memo(() => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      onClick={() => navigate("/bot-finance/projecoes")}
      className="cursor-pointer rounded-xl border border-border/10 px-4 py-3 flex items-center gap-3 group hover:border-primary/20 transition-all relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(220 15% 10% / 0.7) 0%, hsl(220 18% 7% / 0.9) 100%)",
      }}
    >
      {/* Animated wave SVG */}
      <div className="absolute inset-0 opacity-[0.12] pointer-events-none">
        <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="w-full h-full">
          <path
            d="M0 40 Q25 20, 50 30 T100 25 T150 32 T200 20 V60 H0Z"
            fill="hsl(150 100% 45%)"
          />
          <path
            d="M0 48 Q30 35, 60 40 T120 35 T180 42 T200 32 V60 H0Z"
            fill="hsl(150 100% 45% / 0.5)"
          />
        </svg>
      </div>

      {/* Pulse dot */}
      <div className="relative flex-shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
        <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-primary animate-ping opacity-40" />
      </div>

      <div className="flex-1 min-w-0 relative">
        <p className="text-[11px] font-semibold font-display text-foreground">Projeções inteligentes</p>
        <p className="text-[9px] text-muted-foreground">Confira a tendência dos próximos meses</p>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0 relative" />
    </motion.div>
  );
});

ProjectionCard.displayName = "ProjectionCard";
export default ProjectionCard;
