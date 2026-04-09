import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useFinancialProjection } from "@/hooks/useFinancialProjection";
import { useFormattedCounter } from "@/hooks/useAnimatedCounter";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function BotFinanceBalanco() {
  const navigate = useNavigate();
  const { projections, loading, selectedMonth, selectedYear } = useFinancialProjection();

  const now = new Date();
  const currentProj = projections[0];
  const futureProjs = projections.slice(1);

  const summaryBalanco = currentProj?.delta ?? 0;
  const summaryReceitas = currentProj?.income ?? 0;
  const summaryDespesas = currentProj?.expense ?? 0;
  const isPositive = summaryBalanco >= 0;
  const animatedBalanco = useFormattedCounter(summaryBalanco);

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
  const dayOfMonth = isCurrentMonth ? now.getDate() : daysInMonth;
  const progressPct = Math.round((dayOfMonth / daysInMonth) * 100);

  const isPastMonth = selectedYear < now.getFullYear() || (selectedYear === now.getFullYear() && selectedMonth < now.getMonth());
  const cardTitle = isPastMonth ? "BALANÇO FINAL" : isCurrentMonth ? "BALANÇO PARCIAL" : "BALANÇO PREVISTO";

  const maxAbsDelta = useMemo(() => {
    if (projections.length === 0) return 1;
    return Math.max(...projections.map((p) => Math.abs(p.delta)), 1);
  }, [projections]);

  return (
    <div className="space-y-4 pb-4">
      {/* Back button */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
      </motion.div>

      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
        <h1 className="font-display text-base font-bold">Balanço Mensal</h1>
        <p className="text-[10px] text-muted-foreground">Receitas vs Despesas</p>
      </motion.div>

      {/* Summary Card */}
      {!loading && currentProj && (
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
                {cardTitle}
              </p>
              <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                {MONTH_NAMES[selectedMonth]} de {selectedYear}
              </p>
            </div>

            <div>
              <p className={`font-display text-2xl font-bold tabular-nums leading-none ${isPositive ? "text-primary" : "text-destructive"}`}>
                {isPositive && summaryBalanco > 0 ? "+" : ""}{animatedBalanco}
              </p>
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

            {isCurrentMonth && (
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
            )}
          </div>
        </motion.div>
      )}

      {/* Previsão section title */}
      {futureProjs.length > 0 && !loading && (
        <div className="flex items-center gap-2 pt-1">
          <TrendingUp className="w-3.5 h-3.5 text-primary/60" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">Previsão dos próximos meses</p>
        </div>
      )}

      {/* Monthly list */}
      <div className="space-y-2.5">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse h-16 rounded-xl bg-muted/10" />
          ))
        ) : (
          futureProjs.map((proj, idx) => {
            const isPos = proj.delta >= 0;
            const barPct = maxAbsDelta > 0 ? Math.min(Math.abs(proj.delta) / maxAbsDelta * 100, 100) : 0;
            const yearLabel = proj.year !== now.getFullYear() ? ` ${proj.year}` : "";

            return (
              <motion.div
                key={`${proj.month}-${proj.year}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="rounded-xl border border-border/10 bg-card/60 backdrop-blur-xl overflow-hidden"
                style={{ boxShadow: "0 2px 8px -4px rgba(0,0,0,0.15)" }}
              >
                <div className="px-3.5 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-foreground">
                      {MONTH_NAMES[proj.month]}{yearLabel}
                    </p>
                    <div className="flex items-center gap-1">
                      {proj.delta === 0 ? (
                        <Minus className="w-3 h-3 text-muted-foreground" />
                      ) : isPos ? (
                        <TrendingUp className="w-3 h-3 text-primary" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-destructive" />
                      )}
                      <p className={`text-[12px] font-bold tabular-nums ${
                        proj.delta === 0 ? "text-muted-foreground" : isPos ? "text-primary" : "text-destructive"
                      }`}>
                        {isPos && proj.delta > 0 ? "+" : ""}{fmt(proj.delta)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[9px] mb-1.5">
                    <span className="text-muted-foreground/60">
                      Receitas: <span className="text-primary/80 font-semibold">{fmt(proj.income)}</span>
                    </span>
                    <span className="text-muted-foreground/60">
                      Despesas: <span className="text-destructive/80 font-semibold">{fmt(proj.expense)}</span>
                    </span>
                  </div>

                  <div className="w-full h-1 bg-border/15 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barPct}%` }}
                      transition={{ delay: 0.1 + idx * 0.03, duration: 0.5, ease: "easeOut" }}
                      className={`h-full rounded-full ${isPos ? "bg-primary/70" : "bg-destructive/70"}`}
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
