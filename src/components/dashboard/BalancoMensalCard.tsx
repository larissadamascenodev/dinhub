import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const BalancoMensalCard = memo(() => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      onClick={() => navigate("/bot-finance/balanco")}
      className="cursor-pointer rounded-xl overflow-hidden relative group"
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(145deg, hsl(200 50% 18% / 0.35) 0%, hsl(200 40% 10% / 0.2) 50%, hsl(220 20% 6% / 0.9) 100%)",
        }}
      />
      <div className="absolute inset-0 border border-blue-400/10 rounded-xl group-hover:border-blue-400/25 transition-colors" />

      <div className="relative flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          <svg width="28" height="20" viewBox="0 0 28 20" fill="none" className="flex-shrink-0">
            <rect x="1" y="14" width="5" height="6" rx="1" fill="hsl(200 80% 55%)" opacity="0.5" />
            <rect x="8" y="8" width="5" height="12" rx="1" fill="hsl(200 80% 55%)" opacity="0.7" />
            <rect x="15" y="4" width="5" height="16" rx="1" fill="hsl(200 80% 55%)" opacity="0.85" />
            <rect x="22" y="1" width="5" height="19" rx="1" fill="hsl(200 80% 55%)" />
          </svg>

          <div>
            <p className="text-[11px] font-semibold font-display text-foreground leading-tight">
              Balanço Mensal
            </p>
            <p className="text-[9px] text-muted-foreground leading-tight mt-px">
              Receitas vs Despesas por mês
            </p>
          </div>
        </div>

        <div className="w-7 h-7 rounded-lg bg-blue-400/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-400/20 transition-colors">
          <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
        </div>
      </div>
    </motion.div>
  );
});

BalancoMensalCard.displayName = "BalancoMensalCard";
export default BalancoMensalCard;
