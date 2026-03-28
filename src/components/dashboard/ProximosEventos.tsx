import { memo, useMemo, useState } from "react";
import { Check, Clock, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const WEEK_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEK_FULL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MONTH_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MONTH_FULL = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
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

const ProximosEventos = memo(({ events, selectedMonth, selectedYear }: Props) => {
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

  // Group events by day, sorted
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

  return (
    <div className="space-y-2.5">
      {/* Swipeable week strip */}
      <div className="rounded-[14px] bg-card/90 backdrop-blur-xl border border-border/30 shadow-lg shadow-black/20 p-3">
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
                className={`flex flex-col items-center py-2.5 px-1 rounded-2xl text-xs transition-all relative ${dimmed ? "opacity-20" : ""}`}
                style={
                  d.isToday
                    ? {
                        background: "hsl(150 100% 45%)",
                        color: "hsl(220 20% 4%)",
                        fontWeight: 800,
                        boxShadow: "0 3px 12px -3px hsl(150 100% 45% / 0.5)",
                      }
                    : eventInfo
                    ? {
                        background: `hsl(${eventInfo.accent} / 0.08)`,
                        border: `1px solid hsl(${eventInfo.accent} / 0.12)`,
                      }
                    : {}
                }
              >
                <span className={`text-[8px] mb-1 ${d.isToday ? "opacity-90 font-bold" : eventInfo ? "opacity-60" : "text-muted-foreground/30"}`}>
                  {d.label}
                </span>
                <span
                  className={`text-base leading-none ${d.isToday ? "font-extrabold" : eventInfo ? "font-semibold" : "font-medium text-muted-foreground/50"}`}
                  style={!d.isToday && eventInfo ? { color: `hsl(${eventInfo.accent})` } : {}}
                >
                  {d.day}
                </span>
                {eventInfo && !d.isToday && (
                  <span
                    className="absolute bottom-1 w-1 h-1 rounded-full"
                    style={{ background: `hsl(${eventInfo.accent})`, boxShadow: `0 0 4px hsl(${eventInfo.accent} / 0.5)` }}
                  />
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Week dots */}
        {weeks.length > 1 && (
          <div className="flex items-center justify-center gap-1 mt-2">
            {weeks.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all ${i === clampedIdx ? "bg-primary w-2.5" : "bg-muted-foreground/15 w-1"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative pl-5">
        {/* Vertical line */}
        <div
          className="absolute left-[7px] top-1 bottom-1 w-px"
          style={{ background: "linear-gradient(180deg, hsl(220 15% 20% / 0.3), transparent)" }}
        />

        <div className="space-y-2">
          {grouped.slice(0, 3).map(([day, evs], gi) => {
            const isToday = today.getDate() === day && today.getMonth() === selectedMonth;

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: gi * 0.05, type: "spring", stiffness: 400, damping: 30 }}
              >
                {/* Day marker - styled like reference for today */}
                {isToday ? (
                  <div className="flex items-center gap-2 mb-1 -ml-5">
                    <div className="w-3.5 h-3.5 rounded-full bg-primary shadow-[0_0_8px_hsl(150_100%_45%/0.5)] z-10 shrink-0" />
                    <div
                      className="flex-1 rounded-full px-3 py-1.5"
                      style={{
                        background: "hsl(150 100% 45% / 0.1)",
                        border: "1px solid hsl(150 100% 45% / 0.25)",
                      }}
                    >
                      <span className="text-[12px] font-bold text-primary">
                        Hoje, {WEEK_FULL[new Date(selectedYear, selectedMonth, day).getDay()]}, {day} De {MONTH_FULL[selectedMonth]}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mb-1 -ml-5">
                    <div className="w-3.5 h-3.5 rounded-full bg-card border border-border/40 flex items-center justify-center z-10 shrink-0">
                      <span className="text-[6px] font-bold text-muted-foreground/50">{day}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground/40 font-medium">
                      {WEEK_FULL[new Date(selectedYear, selectedMonth, day).getDay()]}, {day} {MONTH_SHORT[selectedMonth]}
                    </span>
                  </div>
                )}

                {/* Events */}
                <div className="space-y-1">
                  {evs.map((ev, i) => {
                    const cfg = STATUS_CONFIG[ev.status];
                    const a = cfg.accent;
                    const StatusIcon = cfg.Icon;

                    return (
                      <motion.div
                        key={ev.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: gi * 0.05 + i * 0.03 }}
                        className="flex items-center gap-3 rounded-xl px-3.5 py-3 cursor-pointer transition-all"
                        style={{
                          background: `hsl(${a} / 0.05)`,
                          border: `1px solid hsl(${a} / 0.1)`,
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `hsl(${a} / 0.12)` }}
                        >
                          <StatusIcon className="w-3.5 h-3.5" style={{ color: `hsl(${a})` }} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-foreground/90 truncate">{ev.name}</p>
                          <p className="text-[10px] text-muted-foreground/50 mt-0.5">{ev.category}</p>
                        </div>

                        <div className="flex flex-col items-end shrink-0">
                          <p className="text-[13px] font-bold tabular-nums" style={{ color: `hsl(${a})` }}>
                            {fmt(ev.amount)}
                          </p>
                          <span className="text-[9px] font-semibold uppercase mt-0.5" style={{ color: `hsl(${a} / 0.6)` }}>
                            {cfg.label}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
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
