import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const ProjectionCard = memo(() => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      onClick={() => navigate("/bot-finance/projecoes")}
      className="w-full rounded-xl border border-primary/10 p-3.5 flex items-center gap-3 group hover:border-primary/25 transition-all text-left overflow-hidden relative"
      style={{
        background:
          "linear-gradient(135deg, hsl(150 60% 15% / 0.15) 0%, hsl(220 18% 8% / 0.7) 60%, hsl(220 20% 6% / 0.85) 100%)",
      }}
    >
      {/* Glow accent */}
      <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-primary/8 blur-2xl pointer-events-none" />

      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold font-display text-foreground leading-tight">
          Projeções inteligentes
        </p>
        <p className="text-[9px] text-muted-foreground leading-snug mt-0.5">
          Veja como suas finanças evoluem nos próximos meses
        </p>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0" />
    </motion.button>
  );
});

ProjectionCard.displayName = "ProjectionCard";
export default ProjectionCard;
