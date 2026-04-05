import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const ProjectionCard = memo(() => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      onClick={() => navigate("/bot-finance/projecoes")}
      className="cursor-pointer rounded-xl overflow-hidden relative group"
    >
      {/* Gradient background with glass effect */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(145deg, hsl(150 50% 18% / 0.35) 0%, hsl(150 40% 10% / 0.2) 50%, hsl(220 20% 6% / 0.9) 100%)",
        }}
      />
      <div className="absolute inset-0 border border-primary/10 rounded-xl group-hover:border-primary/25 transition-colors" />

      <div className="relative flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          {/* Mini line chart icon */}
          <svg width="28" height="20" viewBox="0 0 28 20" fill="none" className="flex-shrink-0">
            <polyline
              points="0,16 5,12 10,14 15,8 20,10 25,4 28,2"
              stroke="hsl(150 100% 45%)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="28" cy="2" r="2.5" fill="hsl(150 100% 45%)" className="animate-pulse" />
          </svg>

          <div>
            <p className="text-[11px] font-semibold font-display text-foreground leading-tight">
              Projeções
            </p>
            <p className="text-[9px] text-muted-foreground leading-tight mt-px">
              Tendência dos próximos 6 meses
            </p>
          </div>
        </div>

        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
          <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
        </div>
      </div>
    </motion.div>
  );
});

ProjectionCard.displayName = "ProjectionCard";
export default ProjectionCard;
