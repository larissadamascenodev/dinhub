import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

interface DayData {
  label: string;
  amount: number;
}

const GastosSemanaisCard = memo(() => {
  const { user } = useAuth();
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [prevWeekTotal, setPrevWeekTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchWeekData = async () => {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const prevMonday = new Date(monday);
      prevMonday.setDate(monday.getDate() - 7);
      const prevSunday = new Date(monday);
      prevSunday.setDate(monday.getDate() - 1);
      prevSunday.setHours(23, 59, 59, 999);

      const mondayStr = monday.toISOString().split("T")[0];
      const sundayStr = sunday.toISOString().split("T")[0];
      const prevMondayStr = prevMonday.toISOString().split("T")[0];
      const prevSundayStr = prevSunday.toISOString().split("T")[0];

      const [{ data: txs }, { data: prevTxs }] = await Promise.all([
        supabase
          .from("transactions")
          .select("date, amount")
          .eq("user_id", user.id)
          .eq("type", "despesa")
          .gte("date", mondayStr)
          .lte("date", sundayStr),
        supabase
          .from("transactions")
          .select("amount")
          .eq("user_id", user.id)
          .eq("type", "despesa")
          .gte("date", prevMondayStr)
          .lte("date", prevSundayStr),
      ]);

      // Build day map
      const dayMap = new Map<number, number>();
      for (let i = 0; i < 7; i++) {
        dayMap.set(i, 0);
      }

      if (txs) {
        for (const tx of txs) {
          const d = new Date(tx.date + "T12:00:00");
          const dow = d.getDay();
          const idx = dow === 0 ? 6 : dow - 1; // Mon=0, Sun=6
          dayMap.set(idx, (dayMap.get(idx) || 0) + Number(tx.amount));
        }
      }

      const days: DayData[] = DAYS.map((label, idx) => ({
        label,
        amount: dayMap.get(idx) || 0,
      }));

      setWeekData(days);
      setPrevWeekTotal(prevTxs?.reduce((s, t) => s + Number(t.amount), 0) || 0);
      setLoading(false);
    };

    fetchWeekData();

    const handler = () => fetchWeekData();
    window.addEventListener("finance-data-changed", handler);
    window.addEventListener("transaction-created", handler);
    return () => {
      window.removeEventListener("finance-data-changed", handler);
      window.removeEventListener("transaction-created", handler);
    };
  }, [user]);

  const total = useMemo(() => weekData.reduce((s, d) => s + d.amount, 0), [weekData]);
  const maxAmount = useMemo(() => Math.max(...weekData.map((d) => d.amount), 1), [weekData]);

  const variation = useMemo(() => {
    if (prevWeekTotal === 0) return null;
    return Math.round(((total - prevWeekTotal) / prevWeekTotal) * 100);
  }, [total, prevWeekTotal]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 bg-muted/30 rounded" />
          <div className="h-24 w-full bg-muted/10 rounded-xl" />
        </div>
      </div>
    );
  }

  if (total === 0 && weekData.every((d) => d.amount === 0)) return null;

  // Scale for Y axis
  const yMax = Math.ceil(maxAmount / 100) * 100 || 200;

  return (
    <div
      className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl overflow-hidden"
      style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.3)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-1">
        <div>
          <p className="text-[11px] text-muted-foreground/60 font-medium">Gastos essa semana</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <p className="text-xl font-bold text-foreground tabular-nums">{fmt(total)}</p>
            {variation !== null && (
              <span className={`text-xs font-semibold ${variation > 0 ? "text-primary" : "text-emerald-400"}`}>
                {variation > 0 ? "↑" : "↓"}{Math.abs(variation)}%
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/30 mt-1" />
      </div>

      {/* Chart */}
      <div className="px-4 pb-4 pt-2">
        <div className="relative">
          {/* Y axis labels */}
          <div className="absolute right-0 top-0 bottom-5 flex flex-col justify-between text-[9px] text-muted-foreground/40 tabular-nums pointer-events-none">
            <span>{fmt(yMax).replace("R$\u00a0", "R$ ")}</span>
            <span>R$ 0</span>
          </div>

          {/* Bars */}
          <div className="flex items-end justify-between gap-2 pr-14" style={{ height: "80px" }}>
            {weekData.map((day, idx) => {
              const heightPct = day.amount > 0 ? Math.max((day.amount / yMax) * 100, 6) : 0;
              const isEmpty = day.amount === 0;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                  {isEmpty ? (
                    <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/20 mt-auto" />
                  ) : (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ delay: idx * 0.06, duration: 0.4, ease: "easeOut" }}
                      className="w-full max-w-[20px] rounded-t-md bg-primary mt-auto"
                      style={{ minHeight: "4px" }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Day labels */}
          <div className="flex justify-between pr-14 mt-1.5">
            {weekData.map((day, idx) => (
              <div key={idx} className="flex-1 text-center">
                <span className="text-[9px] text-muted-foreground/50">{day.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

GastosSemanaisCard.displayName = "GastosSemanaisCard";
export default GastosSemanaisCard;
