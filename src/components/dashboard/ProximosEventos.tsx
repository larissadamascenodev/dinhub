import { memo, useMemo, useState } from "react";
import { Check, Clock, AlertTriangle, ChevronRight } from "lucide-react";
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
  pendente: { label: "A pagar", accent: "40 80% 50%", Icon: Clock },
  atrasado: { label: "Atrasado", accent: "0 60% 50%", Icon: AlertTriangle },
  recebido: { label: "Recebido", accent: "150 100% 45%", Icon: Check },
};

const LEGEND = [
  { label: "Pago", color: "150 100% 45%" },
  { label: "Pendente", color: "40 80% 50%" },
  { label: "Atrasado", color: "0 60% 50%" },
];

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const parseDayFromDate = (dateStr: string): number | null => {
  const match = dateStr.match(/^(\d{1,2})/);
  return match ? parseInt(match[1], 10) : null;
};

const DAY_INITIALS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTH_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const STATUS_PRIORITY: Record<string, number> = { atrasado: 3, pendente: 2, pago: 1, recebido: 1 };

const getMonthWeeks = (month: number, year: number) => {
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay();
  const start = new Date(firstDay);
  start.setDate(1 - startDow);

  const lastDay = new Date(year, month + 1, 0);
  const endDow = lastDay.getDay();
  const end = new Date(lastDay);
  end.setDate(lastDay.getDate() + (6 - endDow));

  const weeks: Array<Array<{ day: number; month: number; dow: number; isToday: boolean; inMonth: boolean }>> = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const week: typeof weeks[0] = [];
    for (let i = 0; i < 7; i++) {
      week.push({
        day: cursor.getDate(),
        month: cursor.getMonth(),
        dow: cursor.getDay(),
        isToday: cursor.toDateString() === today.toDateString(),
        inMonth: cursor.getMonth() === month,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
};

const ProximosEventos = memo(({ events, selectedMonth, selectedYear, onVerTodos }: Props) => {
  const today = new Date();

  const dayStatusMap = useMemo(() => {
    const map = new Map<number, { accent: string; priority: number }>();
    for (const ev of events) {
      const day = parseDayFromDate(ev.date);
      if (day === null) continue;
      const cfg = STATUS_CONFIG[ev.status];
      const priority = STATUS_PRIORITY[ev.status] || 0;
      const existing = map.get(day);
      if (!existing || priority > existing.priority) {
        map.set(day, { accent: cfg.accent, priority });
      }
    }
    return map;
  }, [events]);

  const weeks = useMemo(() => getMonthWeeks(selectedMonth, selectedYear), [selectedMonth, selectedYear]);

  const initialWeek = (today.getMonth() === selectedMonth && today.getFullYear() === selectedYear)
    ? weeks.findIndex((w) => w.some((d) => d.isToday)) || 0
    : 0;

  const [weekIdx, setWeekIdx] = useState(initialWeek);
  const clampedIdx = Math.max(0, Math.min(weekIdx, weeks.length - 1));
  const days = weeks[clampedIdx];

  // All events sorted by day
  const sortedEvents = useMemo(() => {
    return [...events]
      .map((ev) => ({ ...ev, _day: parseDayFromDate(ev.date) }))
      .filter((ev) => ev._day !== null)
      .sort((a, b) => a._day! - b._day!);
  }, [events]);

  return (
    <div className="rounded-2xl bg-card/90 backdrop-blur-xl border border-border/30 shadow-lg shadow-black/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-base font-bold text-foreground italic">Próximos Eventos</h2>
        <button
          onClick={onVerTodos}
          className="flex items-center gap-0.5 text-[11px] text-primary font-semibold hover:opacity-80 transition-opacity"
        >
          Ver todos <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Calendar strip */}
      <div className="px-4 pb-2">
        <motion.div
          key={`${selectedMonth}-${selectedYear}-${clampedIdx}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onDragEnd={(_, info) => {
            if (info.offset.x > 50 && clampedIdx > 0) setWeekIdx((w) => w - 1);
            else if (info.offset.x < -50 && clampedIdx < weeks.length - 1) setWeekIdx((w) => w + 1);
          }}
          className="grid grid-cols-7 gap-1 cursor-grab active:cursor-grabbing select-none"
        >
          {days.map((d, i) => {
            const dimmed = !d.inMonth;

            return (
              <div
                key={`${d.day}-${d.month}-${i}`}
                className={`flex flex-col items-center py-2 rounded-xl transition-all ${dimmed ? "opacity-20" : ""}`}
              >
                <span className={`text-[9px] mb-1.5 font-medium ${d.isToday ? "text-primary" : "text-muted-foreground/40"}`}>
                  {DAY_INITIALS[d.dow]}
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    d.isToday
                      ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(150_100%_45%/0.4)]"
                      : "text-muted-foreground/60"
                  }`}
                >
                  {d.day}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Week dots */}
        {weeks.length > 1 && (
          <div className="flex items-center justify-center gap-1 mt-1.5">
            {weeks.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all ${i === clampedIdx ? "bg-primary w-2.5" : "bg-muted-foreground/15 w-1"}`}
              />
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-2.5 pb-1">
          {LEGEND.map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: `hsl(${l.color})` }} />
              <span className="text-[10px] text-muted-foreground/50 font-medium">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/20 mx-4" />

      {/* Timeline events */}
      <div className="relative px-4 py-3">
        {/* Vertical timeline line */}
        <div
          className="absolute left-[22px] top-3 bottom-3 w-px"
          style={{ background: "linear-gradient(180deg, hsl(40 80% 50% / 0.4), hsl(150 100% 45% / 0.3), transparent)" }}
        />

        <div className="space-y-3">
          {sortedEvents.map((ev, idx) => {
            const cfg = STATUS_CONFIG[ev.status];
            const a = cfg.accent;
            const StatusIcon = cfg.Icon;
            const isPaidOrReceived = ev.status === "pago" || ev.status === "recebido";

            return (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, type: "spring", stiffness: 400, damping: 30 }}
                className="flex gap-3"
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center pt-3 shrink-0 z-10">
                  <div
                    className="w-3 h-3 rounded-full border-2"
                    style={{
                      borderColor: `hsl(${a})`,
                      background: isPaidOrReceived ? `hsl(${a})` : "hsl(var(--card))",
                      boxShadow: `0 0 6px hsl(${a} / 0.4)`,
                    }}
                  />
                </div>

                <div className="flex-1">
                  {/* Date label outside card */}
                  <p className="text-[9px] text-muted-foreground/35 font-medium mb-1">
                    {ev._day && ev._day < 10 ? `0${ev._day}` : ev._day} de {MONTH_SHORT[selectedMonth]}
                  </p>

                  {/* Card */}
                  <div
                    className="rounded-xl border px-3 py-2 cursor-pointer transition-all hover:scale-[1.01]"
                    style={{
                      background: `hsl(${a} / 0.06)`,
                      borderColor: `hsl(${a} / 0.15)`,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Status icon */}
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: isPaidOrReceived
                            ? `linear-gradient(160deg, hsl(${a} / 0.2) 0%, hsl(${a} / 0.1) 100%)`
                            : "transparent",
                          border: isPaidOrReceived
                            ? `1px solid hsl(${a} / 0.3)`
                            : `1.5px solid hsl(${a} / 0.4)`,
                          boxShadow: isPaidOrReceived ? `0 2px 8px -2px hsl(${a} / 0.3)` : "none",
                        }}
                      >
                        <StatusIcon
                          className="w-3 h-3"
                          style={{ color: `hsl(${a})` }}
                        />
                      </div>

                      {/* Name */}
                      <p className="flex-1 text-[13px] font-semibold text-foreground/90 truncate">{ev.name}</p>

                      {/* Amount + status label */}
                      <div className="flex flex-col items-end shrink-0">
                        <p className="text-[13px] font-bold tabular-nums" style={{ color: `hsl(${a})` }}>
                          {fmt(ev.amount)}
                        </p>
                        <span className="text-[8px] font-semibold uppercase mt-0.5" style={{ color: `hsl(${a} / 0.7)` }}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

ProximosEventos.displayName = "ProximosEventos";
export default ProximosEventos;
