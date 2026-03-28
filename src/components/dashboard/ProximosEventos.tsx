import { memo, useMemo, useRef } from "react";
import { Check, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import type { FinanceEvent } from "@/types/finance";

interface Props {
  events: FinanceEvent[];
  selectedMonth: number;
  selectedYear: number;
  onVerTodos?: () => void;
}

const STATUS_CONFIG = {
  pago: { label: "Pago", accent: "150 100% 45%", Icon: Check },
  pendente: { label: "Pendente", accent: "40 80% 50%", Icon: Clock },
  atrasado: { label: "Atrasado", accent: "0 60% 50%", Icon: AlertTriangle },
  recebido: { label: "Recebido", accent: "150 100% 45%", Icon: Check },
};

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

const parseDayFromDate = (dateStr: string): number | null => {
  const match = dateStr.match(/^(\d{1,2})/);
  return match ? parseInt(match[1], 10) : null;
};

const MONTH_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const ProximosEventos = memo(({ events, selectedMonth }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  // Group events by day
  const grouped = useMemo(() => {
    const map = new Map<number, FinanceEvent[]>();
    for (const ev of events) {
      const day = parseDayFromDate(ev.date);
      if (day === null) continue;
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(ev);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [events]);

  // Days strip (next 14 days from today or month start)
  const daysStrip = useMemo(() => {
    const daysInMonth = new Date(today.getFullYear(), selectedMonth + 1, 0).getDate();
    const days: number[] = [];
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [selectedMonth, today]);

  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === selectedMonth;

  const hasEvent = (day: number) => grouped.some(([d]) => d === day);

  return (
    <div className="space-y-3">
      {/* Horizontal day strip */}
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1"
        style={{ scrollbarWidth: "none" }}
      >
        {daysStrip.map((day) => {
          const todayDay = isToday(day);
          const hasEv = hasEvent(day);
          const dow = new Date(today.getFullYear(), selectedMonth, day).getDay();
          const dowLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

          return (
            <div
              key={day}
              className={`flex flex-col items-center shrink-0 rounded-xl py-2 px-2.5 transition-all ${
                todayDay ? "" : "opacity-60"
              }`}
              style={
                todayDay
                  ? {
                      background: "hsl(150 100% 45%)",
                      boxShadow: "0 4px 16px -4px hsl(150 100% 45% / 0.5)",
                    }
                  : {}
              }
            >
              <span
                className={`text-[8px] font-semibold uppercase ${
                  todayDay ? "text-background" : "text-muted-foreground/30"
                }`}
              >
                {dowLabels[dow]}
              </span>
              <span
                className={`text-sm font-bold leading-tight ${
                  todayDay ? "text-background" : "text-muted-foreground/50"
                }`}
              >
                {day}
              </span>
              {hasEv && !todayDay && (
                <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-[18px] top-2 bottom-2 w-px"
          style={{ background: "linear-gradient(180deg, hsl(220 15% 20% / 0.4), transparent)" }}
        />

        <div className="space-y-3">
          {grouped.map(([day, evs], gi) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: gi * 0.06, type: "spring", stiffness: 400, damping: 30 }}
            >
              {/* Day label */}
              <div className="flex items-center gap-3 mb-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    isToday(day) ? "bg-primary shadow-[0_0_12px_hsl(150_100%_45%/0.4)]" : "bg-card border border-border/30"
                  }`}
                >
                  <span className={`text-xs font-bold ${isToday(day) ? "text-background" : "text-muted-foreground/60"}`}>
                    {day}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground/30 font-medium uppercase tracking-wider">
                  {day} {MONTH_SHORT[selectedMonth]}
                  {isToday(day) && <span className="text-primary ml-1.5">· Hoje</span>}
                </span>
              </div>

              {/* Events for this day */}
              <div className="ml-[42px] space-y-1.5">
                {evs.map((ev, i) => {
                  const cfg = STATUS_CONFIG[ev.status];
                  const a = cfg.accent;
                  const StatusIcon = cfg.Icon;

                  return (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: gi * 0.06 + i * 0.03 }}
                      className="flex items-center gap-2.5 rounded-xl bg-card/90 backdrop-blur-xl border border-border/30 shadow-lg shadow-black/15 px-3 py-2.5 cursor-pointer group hover:border-border/50 transition-all"
                    >
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `hsl(${a} / 0.1)` }}
                      >
                        <StatusIcon className="w-3 h-3" style={{ color: `hsl(${a})` }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-foreground/85 truncate">{ev.name}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[11px] font-bold tabular-nums text-foreground/80">{fmt(ev.amount)}</p>
                        <span className="text-[8px] font-semibold uppercase tracking-wider" style={{ color: `hsl(${a} / 0.7)` }}>
                          {cfg.label}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
});

ProximosEventos.displayName = "ProximosEventos";
export default ProximosEventos;
