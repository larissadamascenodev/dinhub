import { memo, useMemo, useState } from "react";
import { ChevronRight, Check, Clock, AlertTriangle, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import type { FinanceEvent } from "@/types/finance";

interface Props {
  events: FinanceEvent[];
  selectedMonth: number;
  selectedYear: number;
  onVerTodos?: () => void;
}

const STATUS_CONFIG = {
  pago: { label: "Pago", textColor: "text-primary", accent: "150 100% 45%", Icon: Check },
  pendente: { label: "A pagar", textColor: "text-warning", accent: "40 80% 50%", Icon: Clock },
  atrasado: { label: "Atrasado", textColor: "text-destructive", accent: "0 60% 50%", Icon: AlertTriangle },
  recebido: { label: "Recebido", textColor: "text-primary", accent: "150 100% 45%", Icon: Check },
};

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

const parseDayFromDate = (dateStr: string): number | null => {
  const match = dateStr.match(/^(\d{1,2})/);
  return match ? parseInt(match[1], 10) : null;
};

const STATUS_PRIORITY: Record<string, number> = { atrasado: 3, pendente: 2, pago: 1, recebido: 1 };

const ProximosEventos = memo(({ events, selectedMonth, selectedYear, onVerTodos }: Props) => {
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

  return (
    <div
      className="rounded-2xl bg-card/90 backdrop-blur-xl border border-border/30 shadow-2xl shadow-black/40 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "hsl(150 100% 45% / 0.08)",
              border: "1px solid hsl(150 100% 45% / 0.15)",
            }}
          >
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight">Próximos Eventos</h3>
            <p className="text-[10px] text-muted-foreground/50">{events.length} eventos este mês</p>
          </div>
        </div>
        <button
          onClick={onVerTodos}
          className="text-[11px] text-muted-foreground/60 hover:text-primary transition-all flex items-center gap-0.5 font-medium px-2.5 py-1 rounded-lg hover:bg-white/[0.03]"
        >
          Ver todos
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mini Calendar */}
      <MiniCalendar dayStatusMap={dayStatusMap} selectedMonth={selectedMonth} selectedYear={selectedYear} />

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 px-5 pb-4">
        {[
          { label: "Pago", accent: "150 100% 45%" },
          { label: "Pendente", accent: "40 80% 50%" },
          { label: "Atrasado", accent: "0 60% 50%" },
        ].map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-medium">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: `hsl(${s.accent})`, boxShadow: `0 0 6px hsl(${s.accent} / 0.5)` }}
            />
            {s.label}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-5">
        <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(220 15% 25% / 0.3), transparent)" }} />
      </div>

      {/* Event Cards */}
      <div className="px-4 py-4 space-y-1.5">
        {events.map((ev, i) => {
          const cfg = STATUS_CONFIG[ev.status];
          const StatusIcon = cfg.Icon;
          const a = cfg.accent;

          return (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="group relative rounded-xl overflow-hidden p-3 flex items-center justify-between cursor-pointer transition-all duration-300"
              style={{
                background: `hsl(${a} / 0.04)`,
                border: `1px solid hsl(${a} / 0.1)`,
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.02)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `hsl(${a} / 0.08)`;
                e.currentTarget.style.borderColor = `hsl(${a} / 0.18)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `hsl(${a} / 0.04)`;
                e.currentTarget.style.borderColor = `hsl(${a} / 0.1)`;
              }}
            >
              {/* Full-height accent line */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
                style={{ background: `hsl(${a})`, boxShadow: `0 0 8px hsl(${a} / 0.4)` }}
              />

              {/* Left */}
              <div className="flex items-center gap-2.5 min-w-0 pl-1.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `hsl(${a} / 0.1)`, border: `1px solid hsl(${a} / 0.12)` }}
                >
                  <StatusIcon className={`w-3.5 h-3.5 ${cfg.textColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-foreground/90 truncate">{ev.name}</p>
                  <p className="text-[10px] text-muted-foreground/40">{ev.date}</p>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <div className="text-right">
                  <p className="text-[13px] font-bold text-foreground tabular-nums">{fmt(ev.amount)}</p>
                  <span className={`text-[9px] font-semibold ${cfg.textColor} opacity-80 uppercase tracking-wider`}>
                    {cfg.label}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

// Mini calendar
interface MiniCalendarProps {
  dayStatusMap: Map<number, { accent: string; priority: number }>;
  selectedMonth: number;
  selectedYear: number;
}

const WEEK_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

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

  const weeks: Array<Array<{ day: number; month: number; label: string; isToday: boolean; inMonth: boolean }>> = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const week: typeof weeks[0] = [];
    for (let i = 0; i < 7; i++) {
      week.push({
        day: cursor.getDate(),
        month: cursor.getMonth(),
        label: WEEK_LABELS[cursor.getDay()],
        isToday: cursor.toDateString() === today.toDateString(),
        inMonth: cursor.getMonth() === month,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
};

const MiniCalendar = memo(({ dayStatusMap, selectedMonth, selectedYear }: MiniCalendarProps) => {
  const weeks = useMemo(() => getMonthWeeks(selectedMonth, selectedYear), [selectedMonth, selectedYear]);

  const today = new Date();
  const initialWeek = (today.getMonth() === selectedMonth && today.getFullYear() === selectedYear)
    ? weeks.findIndex((w) => w.some((d) => d.isToday)) || 0
    : 0;

  const [weekIdx, setWeekIdx] = useState(initialWeek);
  const clampedIdx = Math.max(0, Math.min(weekIdx, weeks.length - 1));
  const days = weeks[clampedIdx];

  return (
    <div className="px-5 mb-3">
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
          const eventInfo = d.inMonth ? dayStatusMap.get(d.day) : undefined;
          const dimmed = !d.inMonth;

          return (
            <div
              key={`${d.day}-${d.month}-${i}`}
              className={`flex flex-col items-center py-2 rounded-xl text-xs transition-all relative ${dimmed ? "opacity-25" : ""}`}
              style={
                d.isToday
                  ? {
                      background: "hsl(150 100% 45%)",
                      color: "hsl(220 20% 4%)",
                      fontWeight: 800,
                      boxShadow: "0 4px 16px -4px hsl(150 100% 45% / 0.5), 0 0 20px hsl(150 100% 45% / 0.2)",
                    }
                  : eventInfo
                  ? {
                      background: `hsl(${eventInfo.accent} / 0.08)`,
                      border: `1px solid hsl(${eventInfo.accent} / 0.15)`,
                    }
                  : {}
              }
            >
              <span className={`text-[10px] mb-0.5 ${d.isToday ? "opacity-90 font-bold" : eventInfo ? "opacity-70" : "text-muted-foreground/40"}`}>
                {d.label}
              </span>
              <span
                className={`text-sm ${d.isToday ? "font-extrabold" : eventInfo ? "font-semibold" : "font-semibold text-muted-foreground/60"}`}
                style={!d.isToday && eventInfo ? { color: `hsl(${eventInfo.accent})` } : {}}
              >
                {d.day}
              </span>
              {eventInfo && !d.isToday && (
                <span
                  className="absolute bottom-1 w-1 h-1 rounded-full"
                  style={{ background: `hsl(${eventInfo.accent})`, boxShadow: `0 0 4px hsl(${eventInfo.accent} / 0.6)` }}
                />
              )}
            </div>
          );
        })}
      </motion.div>

      {weeks.length > 1 && (
        <div className="flex items-center justify-center gap-1 mt-2">
          {weeks.map((_, i) => (
            <span
              key={i}
              className={`w-1 h-1 rounded-full transition-all ${i === clampedIdx ? "bg-primary w-2.5" : "bg-muted-foreground/20"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
});
MiniCalendar.displayName = "MiniCalendar";

ProximosEventos.displayName = "ProximosEventos";
export default ProximosEventos;
