import { memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, ArrowUpRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useFormattedCounter } from "@/hooks/useAnimatedCounter";
import { useMonth } from "@/contexts/MonthContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface Props {
  receitas: number;
  despesas: number;
}

const BalancoMensalCard = memo(({ receitas, despesas }: Props) => {
  const navigate = useNavigate();
  const { selectedMonth, selectedYear } = useMonth();
  const { user } = useAuth();
  const balanco = receitas - despesas;
  const isPositive = balanco >= 0;
  const animatedBalanco = useFormattedCounter(balanco);

  const [prevBalanco, setPrevBalanco] = useState<number | null>(null);

  // Fetch previous month balance for comparison
  useEffect(() => {
    if (!user) return;
    const prevDate = new Date(selectedYear, selectedMonth - 1, 1);
    const pm = prevDate.getMonth();
    const py = prevDate.getFullYear();
    const startDate = `${py}-${String(pm + 1).padStart(2, "0")}-01`;
    const endDate = new Date(py, pm + 1, 0).toISOString().split("T")[0];

    supabase
      .from("transactions")
      .select("amount, type")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .in("type", ["receita", "despesa"])
      .then(({ data: txs }) => {
        if (!txs) { setPrevBalanco(null); return; }
        let r = 0, d = 0;
        for (const tx of txs) {
          if (tx.type === "receita") r += Number(tx.amount);
          else d += Number(tx.amount);
        }
        setPrevBalanco(r - d);
      });
  }, [user, selectedMonth, selectedYear]);

  // Month progress
  const now = new Date();
  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const dayOfMonth = isCurrentMonth ? now.getDate() : daysInMonth;
  const progressPct = Math.round((dayOfMonth / daysInMonth) * 100);

  // Variation vs previous month
  let variationPct: number | null = null;
  if (prevBalanco !== null && prevBalanco !== 0) {
    variationPct = ((balanco - prevBalanco) / Math.abs(prevBalanco)) * 100;
  }

  const isPastMonth = selectedYear < now.getFullYear() || (selectedYear === now.getFullYear() && selectedMonth < now.getMonth());
  const cardTitle = isPastMonth ? "BALANÇO FINAL" : isCurrentMonth ? "BALANÇO PARCIAL" : "BALANÇO PREVISTO";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 }}
      onClick={() => navigate("/bot-finance/balanco")}
      className="cursor-pointer rounded-xl overflow-hidden relative group"
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, hsl(220 15% 14% / 0.6) 0%, hsl(220 18% 8% / 0.75) 50%, hsl(220 20% 4% / 0.9) 100%)",
        }}
      />
      <div className="absolute inset-0 border border-border/10 rounded-xl group-hover:border-primary/20 transition-colors" />

      <div className="relative px-4 py-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">
              {cardTitle}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              {MONTH_NAMES[selectedMonth]} de {selectedYear}
            </p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
          </div>
        </div>

        {/* Big balance value */}
        <div>
          <p className={`font-display text-2xl md:text-3xl font-bold tabular-nums leading-none ${isPositive ? "text-primary" : "text-destructive"}`}>
            {isPositive && balanco > 0 ? "+" : ""}{animatedBalanco}
          </p>

          {/* Variation badge */}
          {variationPct !== null && (
            <div className="flex items-center gap-1 mt-1.5">
              {variationPct >= 0 ? (
                <TrendingUp className="w-3 h-3 text-primary" />
              ) : (
                <TrendingDown className="w-3 h-3 text-destructive" />
              )}
              <span className={`text-[10px] font-medium ${variationPct >= 0 ? "text-primary" : "text-destructive"}`}>
                {variationPct >= 0 ? "↑" : "↓"} {Math.abs(variationPct).toFixed(1)}% vs mês anterior
              </span>
            </div>
          )}
        </div>

        {/* Receitas / Despesas row */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-2.5 h-2.5 text-primary" />
            </div>
            <div>
              <span className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold">Receitas</span>
              <p className="text-[11px] font-bold text-primary tabular-nums leading-tight">{fmt(receitas)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="w-2.5 h-2.5 text-destructive" />
            </div>
            <div>
              <span className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold">Despesas</span>
              <p className="text-[11px] font-bold text-destructive tabular-nums leading-tight">{fmt(despesas)}</p>
            </div>
          </div>
        </div>

        {/* Month progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5 text-muted-foreground/50" />
              <span className="text-[9px] text-muted-foreground/60">Progresso do mês</span>
            </div>
            <span className="text-[9px] text-muted-foreground/80 font-semibold tabular-nums">
              {dayOfMonth}/{daysInMonth} dias
            </span>
          </div>
          <div className="w-full h-1.5 bg-border/15 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
});

BalancoMensalCard.displayName = "BalancoMensalCard";
export default BalancoMensalCard;
