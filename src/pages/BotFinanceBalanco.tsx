import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFormattedCounter } from "@/hooks/useAnimatedCounter";

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

  const now = new Date();
  const currentMonthData = months.find(
    (m) => m.month === now.getMonth() && m.year === now.getFullYear()
  );

  const [prevBalanco, setPrevBalanco] = useState<number | null>(null);
  useEffect(() => {
    if (!user) return;
    const pm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const py = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
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
  }, [user]);

  const maxAbsBalance = useMemo(() => {
    if (months.length === 0) return 1;
    return Math.max(...months.map((m) => Math.abs(m.balanco)), 1);
  }, [months]);

  const summaryBalanco = currentMonthData?.balanco ?? 0;
  const summaryReceitas = currentMonthData?.receitas ?? 0;
  const summaryDespesas = currentMonthData?.despesas ?? 0;
  const isPositive = summaryBalanco >= 0;
  const animatedBalanco = useFormattedCounter(summaryBalanco);

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const progressPct = Math.round((dayOfMonth / daysInMonth) * 100);

  let variationPct: number | null = null;
  if (prevBalanco !== null && prevBalanco !== 0) {
    variationPct = ((summaryBalanco - prevBalanco) / Math.abs(prevBalanco)) * 100;
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div>
          <h1 className="font-display text-base font-bold">Balanço Mensal</h1>
          <p className="text-[10px] text-muted-foreground">Receitas vs Despesas por mês</p>
        </div>
      </motion.div>

      {/* Summary Card */}
      {!loading && currentMonthData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl overflow-hidden relative"
        >
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(160deg, hsl(220 15% 14% / 0.6) 0%, hsl(220 18% 8% / 0.75) 50%, hsl(220 20% 4% / 0.9) 100%)",
            }}
          />
          <div className="absolute inset-0 border border-border/10 rounded-xl" />

          <div className="relative px-3.5 py-3.5 space-y-2.5">
            <div>
              <p className="text-[8px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">
                BALANÇO PARCIAL
              </p>
              <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                {MONTH_NAMES[now.getMonth()]} de {now.getFullYear()}
              </p>
            </div>

            <div>
              <p className={`font-display text-2xl font-bold tabular-nums leading-none ${isPositive ? "text-primary" : "text-destructive"}`}>
                {isPositive && summaryBalanco > 0 ? "+" : ""}{animatedBalanco}
              </p>
              {variationPct !== null && (
                <div className="flex items-center gap-1 mt-1">
                  {variationPct >= 0 ? (
                    <TrendingUp className="w-2.5 h-2.5 text-primary" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5 text-destructive" />
                  )}
                  <span className={`text-[9px] font-medium ${variationPct >= 0 ? "text-primary" : "text-destructive"}`}>
                    {variationPct >= 0 ? "↑" : "↓"} {Math.abs(variationPct).toFixed(1)}% vs mês anterior
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-2 h-2 text-primary" />
                </div>
                <div>
                  <span className="text-[7px] text-muted-foreground uppercase tracking-wider font-semibold">Receitas</span>
                  <p className="text-[10px] font-bold text-primary tabular-nums leading-tight">{fmt(summaryReceitas)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-destructive/10 flex items-center justify-center">
                  <TrendingDown className="w-2 h-2 text-destructive" />
                </div>
                <div>
                  <span className="text-[7px] text-muted-foreground uppercase tracking-wider font-semibold">Despesas</span>
                  <p className="text-[10px] font-bold text-destructive tabular-nums leading-tight">{fmt(summaryDespesas)}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1">
                  <Calendar className="w-2 h-2 text-muted-foreground/50" />
                  <span className="text-[8px] text-muted-foreground/60">Progresso do mês</span>
                </div>
                <span className="text-[8px] text-muted-foreground/80 font-semibold tabular-nums">
                  {dayOfMonth}/{daysInMonth} dias
                </span>
              </div>
              <div className="w-full h-1 bg-border/15 rounded-full overflow-hidden">
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
      )}

      {/* Monthly list */}
      <div className="space-y-2.5">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse h-16 rounded-xl bg-muted/10" />
          ))
        ) : (
          months.map((mb, idx) => {
            const isCurrentMonth = mb.month === now.getMonth() && mb.year === now.getFullYear();
            const isPos = mb.balanco >= 0;
            const barPct = maxAbsBalance > 0 ? Math.min(Math.abs(mb.balanco) / maxAbsBalance * 100, 100) : 0;
            const yearLabel = mb.year !== now.getFullYear() ? ` ${mb.year}` : "";

            return (
              <motion.div
                key={`${mb.month}-${mb.year}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`rounded-xl border overflow-hidden ${
                  isCurrentMonth
                    ? "border-primary/20 bg-primary/[0.03]"
                    : "border-border/10 bg-card/60"
                } backdrop-blur-xl`}
                style={{ boxShadow: "0 2px 8px -4px rgba(0,0,0,0.15)" }}
              >
                <div className="px-3.5 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      {isCurrentMonth && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                      <p className={`text-[11px] font-bold ${isCurrentMonth ? "text-primary" : "text-foreground"}`}>
                        {MONTH_NAMES[mb.month]}{yearLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {mb.balanco === 0 ? (
                        <Minus className="w-3 h-3 text-muted-foreground" />
                      ) : isPos ? (
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-400" />
                      )}
                      <p className={`text-[12px] font-bold tabular-nums ${
                        mb.balanco === 0 ? "text-muted-foreground" : isPos ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {isPos && mb.balanco > 0 ? "+" : ""}{fmt(mb.balanco)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[9px] mb-1.5">
                    <span className="text-muted-foreground/60">
                      Receitas: <span className="text-emerald-400/80 font-semibold">{fmt(mb.receitas)}</span>
                    </span>
                    <span className="text-muted-foreground/60">
                      Despesas: <span className="text-red-400/80 font-semibold">{fmt(mb.despesas)}</span>
                    </span>
                  </div>

                  <div className="w-full h-1 bg-border/15 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barPct}%` }}
                      transition={{ delay: 0.1 + idx * 0.03, duration: 0.5, ease: "easeOut" }}
                      className={`h-full rounded-full ${isPos ? "bg-emerald-400/70" : "bg-red-400/70"}`}
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
