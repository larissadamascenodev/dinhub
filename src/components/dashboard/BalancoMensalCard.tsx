import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const BalancoMensalCard = memo(() => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      onClick={() => navigate("/bot-finance/balanco")}
      className="cursor-pointer rounded-xl overflow-hidden relative group active:scale-[0.98] transition-transform"
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, hsl(220 15% 14% / 0.6) 0%, hsl(220 18% 8% / 0.75) 50%, hsl(220 20% 4% / 0.9) 100%)",
        }}
      />
      <div className="absolute inset-0 border border-border/10 rounded-xl group-hover:border-blue-400/20 transition-colors" />

      <div className="relative flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0">
            <svg width="32" height="22" viewBox="0 0 32 22" fill="none">
              <rect x="1" y="15" width="5" height="7" rx="1.5" fill="hsl(200 80% 55%)" opacity="0.35" />
              <rect x="9" y="10" width="5" height="12" rx="1.5" fill="hsl(200 80% 55%)" opacity="0.55" />
              <rect x="17" y="5" width="5" height="17" rx="1.5" fill="hsl(200 80% 55%)" opacity="0.75" />
              <rect x="25" y="1" width="5" height="21" rx="1.5" fill="hsl(200 80% 55%)" />
            </svg>
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold font-display text-foreground leading-tight">
              Balanço Mensal
            </p>
            <p className="text-[9px] text-muted-foreground/60 leading-tight mt-0.5">
              Receitas vs Despesas por mês
            </p>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 group-hover:text-blue-400/60 transition-colors" />
      </div>
    </motion.div>
  );
});

BalancoMensalCard.displayName = "BalancoMensalCard";
export default BalancoMensalCard;
