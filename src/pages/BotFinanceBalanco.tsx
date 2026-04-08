import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface MonthBalance {
  month: number;
  year: number;
  receitas: number;
  despesas: number;
  balanco: number;
}

export default function BotFinanceBalanco() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [months, setMonths] = useState<MonthBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchBalances = async () => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Fetch 12 months starting from current
      const results: MonthBalance[] = [];

      for (let i = 0; i < 12; i++) {
        const m = (currentMonth + i) % 12;
        const y = currentYear + Math.floor((currentMonth + i) / 12);

        const startDate = `${y}-${String(m + 1).padStart(2, "0")}-01`;
        const endDate = new Date(y, m + 1, 0).toISOString().split("T")[0];

        const { data: txs } = await supabase
          .from("transactions")
          .select("amount, type")
          .eq("user_id", user.id)
          .gte("date", startDate)
          .lte("date", endDate)
          .in("type", ["receita", "despesa"]);

        let receitas = 0;
        let despesas = 0;
        if (txs) {
          for (const tx of txs) {
            if (tx.type === "receita") receitas += Number(tx.amount);
            else despesas += Number(tx.amount);
          }
        }

        results.push({ month: m, year: y, receitas, despesas, balanco: receitas - despesas });
      }

      setMonths(results);
      setLoading(false);
    };

    fetchBalances();
  }, [user]);

  const maxAbsBalance = useMemo(() => {
    if (months.length === 0) return 1;
    return Math.max(...months.map((m) => Math.abs(m.balanco)), 1);
  }, [months]);

  const now = new Date();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-2xl bg-background/80 border-b border-border/10">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg bg-muted/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-sm font-bold font-display text-foreground">Balanço Mensal</h1>
            <p className="text-[10px] text-muted-foreground">Receitas vs Despesas por mês</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-3 pb-28">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse h-20 rounded-2xl bg-muted/10" />
            ))}
          </div>
        ) : (
          months.map((mb, idx) => {
            const isCurrentMonth = mb.month === now.getMonth() && mb.year === now.getFullYear();
            const isPositive = mb.balanco >= 0;
            const barPct = maxAbsBalance > 0 ? Math.min(Math.abs(mb.balanco) / maxAbsBalance * 100, 100) : 0;
            const yearLabel = mb.year !== now.getFullYear() ? ` ${mb.year}` : "";

            return (
              <motion.div
                key={`${mb.month}-${mb.year}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`rounded-2xl border overflow-hidden ${
                  isCurrentMonth
                    ? "border-primary/20 bg-primary/[0.03]"
                    : "border-border/15 bg-card/60"
                } backdrop-blur-xl`}
                style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.2)" }}
              >
                <div className="px-4 py-3.5">
                  {/* Month header */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      {isCurrentMonth && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                      <p className={`text-[13px] font-bold ${isCurrentMonth ? "text-primary" : "text-foreground"}`}>
                        {MONTH_NAMES[mb.month]}{yearLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {mb.balanco === 0 ? (
                        <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : isPositive ? (
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                      )}
                      <p className={`text-[15px] font-bold tabular-nums ${
                        mb.balanco === 0 ? "text-muted-foreground" : isPositive ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {isPositive && mb.balanco > 0 ? "+" : ""}{fmt(mb.balanco)}
                      </p>
                    </div>
                  </div>

                  {/* Receitas / Despesas row */}
                  <div className="flex items-center gap-4 text-[11px] mb-2">
                    <span className="text-muted-foreground/60">
                      Receitas: <span className="text-emerald-400/80 font-semibold">{fmt(mb.receitas)}</span>
                    </span>
                    <span className="text-muted-foreground/60">
                      Despesas: <span className="text-red-400/80 font-semibold">{fmt(mb.despesas)}</span>
                    </span>
                  </div>

                  {/* Balance bar */}
                  <div className="w-full h-1.5 bg-border/15 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barPct}%` }}
                      transition={{ delay: 0.1 + idx * 0.04, duration: 0.5, ease: "easeOut" }}
                      className={`h-full rounded-full ${isPositive ? "bg-emerald-400/70" : "bg-red-400/70"}`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
