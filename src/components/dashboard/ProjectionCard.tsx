import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const bars = [0.4, 0.65, 0.5, 0.8, 0.6, 0.9];

const ProjectionCard = memo(() => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      onClick={() => navigate("/bot-finance/projecoes")}
      className="cursor-pointer rounded-xl border border-border/10 p-4 group hover:border-primary/20 transition-all overflow-hidden relative"
      style={{
        background:
          "linear-gradient(160deg, hsl(150 40% 12% / 0.25) 0%, hsl(220 18% 8% / 0.8) 40%, hsl(220 20% 5% / 0.95) 100%)",
      }}
    >
      {/* Decorative mini bars */}
      <div className="flex items-end gap-1.5 h-10 mb-3">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.2 + i * 0.06, duration: 0.4, ease: "easeOut" }}
            className="flex-1 rounded-sm origin-bottom"
            style={{
              height: `${h * 100}%`,
              background: i < 2
                ? "hsl(150 100% 45% / 0.15)"
                : `hsl(150 100% 45% / ${0.2 + i * 0.1})`,
            }}
          />
        ))}
      </div>

      <p className="text-xs font-semibold font-display text-foreground leading-tight">
        Projeções
      </p>
      <p className="text-[9px] text-muted-foreground mt-0.5 mb-3 leading-snug">
        Visualize a evolução dos próximos meses
      </p>

      <div className="flex items-center gap-1 text-primary">
        <span className="text-[10px] font-medium group-hover:underline transition-all">
          Ver completo
        </span>
        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </motion.div>
  );
});

ProjectionCard.displayName = "ProjectionCard";
export default ProjectionCard;
