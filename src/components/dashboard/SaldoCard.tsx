import { memo } from "react";
import { Scale, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface SaldoCardProps {
  saldoAtual: number;
  saldoPrevisto: number;
  onNovaTransacao?: () => void;
  mobile?: boolean;
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

const SaldoCard = memo(({ saldoAtual, saldoPrevisto, onNovaTransacao, mobile }: SaldoCardProps) => (
  <div
    className={`relative rounded-2xl overflow-hidden flex flex-col justify-between ${mobile ? "p-4" : "p-5"}`}
    style={{
      background: "linear-gradient(145deg, hsl(225 20% 10%) 0%, hsl(225 22% 6%) 100%)",
      boxShadow: "0 8px 40px -8px rgba(0,0,0,0.7), 0 2px 6px -2px rgba(0,0,0,0.4), inset 0 1px 0 0 rgba(255,255,255,0.05)",
      border: "1px solid hsl(225 14% 16% / 0.6)",
    }}
  >
    {/* Subtle gradient glow */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ background: "radial-gradient(ellipse at 30% 0%, hsl(152 45% 45% / 0.06) 0%, transparent 50%)" }}
    />

    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(152 50% 48% / 0.15) 0%, hsl(165 55% 38% / 0.05) 100%)" }}>
            <Scale className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">Saldo do mês</span>
        </div>
        <button
          onClick={onNovaTransacao}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-semibold text-primary-foreground transition-all"
          style={{
            background: "linear-gradient(135deg, hsl(152 50% 48%) 0%, hsl(165 55% 38%) 100%)",
            boxShadow: "0 2px 12px -2px hsl(152 45% 45% / 0.3)",
          }}
        >
          <Plus className="w-3 h-3" />
          Nova transação
        </button>
      </div>
      <motion.p
        key={saldoAtual}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`font-display ${mobile ? "text-2xl" : "text-4xl"} font-bold tracking-tight tabular-nums leading-none ${saldoAtual >= 0 ? "text-foreground" : "text-destructive"}`}
      >
        {fmt(saldoAtual)}
      </motion.p>
      <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "hsl(225 20% 8% / 0.6)", border: "1px solid hsl(225 14% 16% / 0.3)" }}>
        <div className={`w-1.5 h-1.5 rounded-full ${saldoPrevisto >= 0 ? "bg-primary" : "bg-destructive"}`} style={{ boxShadow: saldoPrevisto >= 0 ? "0 0 6px hsl(152 45% 45% / 0.5)" : "0 0 6px hsl(0 55% 48% / 0.5)" }} />
        <span className="text-[10px] text-muted-foreground/60">Previsto ao final do mês</span>
        <span className={`text-[13px] font-semibold tabular-nums tracking-tight ${saldoPrevisto >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(saldoPrevisto)}</span>
      </div>
    </div>
  </div>
));

SaldoCard.displayName = "SaldoCard";
export default SaldoCard;
