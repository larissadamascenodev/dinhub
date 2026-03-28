import { memo, useMemo, useState } from "react";
import { Check, Clock, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
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
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const WEEK_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

const parseDayFromDate = (dateStr: string): number | null => {
  const match = dateStr.match(/^(\d{1,2})/);
  return match ? parseInt(match[1], 10) : null;
};

const STATUS_PRIORITY: Record<string, number> = { atrasado: 3, pendente: 2, pago: 1, recebido: 1 };

const ProximosEventos = memo(({ events, selectedMonth, selectedYear }: Props) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

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

  const dayEvents = useMemo(() => {
    if (selectedDay === null) return events;
    return events.filter((ev) => parseDayFromDate(ev.date) === selectedDay);
  }, [events, selectedDay]);

  const today = new Date();
  const firstDay = new Date(selectedYear, selectedMonth, 1);
  const startDow = firstDay.getDay();
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const calendarDays = useMemo(() => {
    const days: Array<{ day: number; inMonth: boolean }> = [];
    // Previous month padding
    const prevMonthDays = new Date(selectedYear, selectedMonth, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, inMonth: false });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, inMonth: true });
    }
    // Next month padding
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        days.push({ day: d, inMonth: false });
      }
    }
    return days;
  }, [selectedMonth, selectedYear, startDow, daysInMonth]);

  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === selectedMonth && today.getFullYear() === selectedYear;

  return (
    <div className="space-y-2">
      {/* Calendar Card */}
      <div className="rounded-2xl bg-card/90 backdrop-blur-xl border border-border/30 shadow-2xl shadow-black/40 p-4">
        {/* Month title */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground">
            {MONTH_NAMES[selectedMonth]} <span className="text-muted-foreground/40 font-normal">{selectedYear}</span>
          </h3>
          <div className="flex items-center gap-3">
            {[
              { label: "Pago", accent: "150 100% 45%" },
              { label: "Pendente", accent: "40 80% 50%" },
              { label: "Atrasado", accent: "0 60% 50%" },
            ].map((s) => (
              <span key={s.label} className="flex items-center gap-1 text-[8px] text-muted-foreground/40 font-medium">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: `hsl(${s.accent})` }}
                />
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Week headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEK_LABELS.map((label, i) => (
            <div key={i} className="text-center text-[9px] text-muted-foreground/30 font-semibold py-1">
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-[2px]">
          {calendarDays.map((d, i) => {
            const eventInfo = d.inMonth ? dayStatusMap.get(d.day) : undefined;
            const isTodayDay = d.inMonth && isToday(d.day);
            const isSelected = d.inMonth && selectedDay === d.day;

            return (
              <button
                key={i}
                onClick={() => {
                  if (!d.inMonth) return;
                  setSelectedDay(selectedDay === d.day ? null : d.day);
                }}
                className={`relative aspect-square flex items-center justify-center rounded-lg text-[11px] font-medium transition-all ${
                  !d.inMonth ? "opacity-15 pointer-events-none" : "hover:bg-white/[0.04]"
                } ${isSelected ? "ring-1 ring-primary/40" : ""}`}
                style={
                  isTodayDay
                    ? {
                        background: "hsl(150 100% 45%)",
                        color: "hsl(220 20% 4%)",
                        fontWeight: 800,
                        boxShadow: "0 2px 10px -2px hsl(150 100% 45% / 0.5)",
                      }
                    : {}
                }
              >
                <span className={isTodayDay ? "" : eventInfo ? "text-foreground/80" : "text-muted-foreground/50"}>
                  {d.day}
                </span>
                {eventInfo && !isTodayDay && (
                  <span
                    className="absolute bottom-0.5 w-1 h-1 rounded-full"
                    style={{ background: `hsl(${eventInfo.accent})`, boxShadow: `0 0 4px hsl(${eventInfo.accent} / 0.6)` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Timeline */}
      <div className="space-y-1">
        <AnimatePresence mode="sync">
          {dayEvents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6"
            >
              <p className="text-[11px] text-muted-foreground/30">Nenhum evento neste dia</p>
            </motion.div>
          ) : (
            dayEvents.map((ev, i) => {
              const cfg = STATUS_CONFIG[ev.status];
              const a = cfg.accent;
              const StatusIcon = cfg.Icon;

              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 30 }}
                  className="flex items-center gap-3 rounded-[14px] bg-card/90 backdrop-blur-xl border border-border/30 shadow-lg shadow-black/20 px-3.5 py-2.5 group cursor-pointer"
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: `hsl(${a} / 0.12)`, boxShadow: `0 0 8px hsl(${a} / 0.15)` }}
                    >
                      <StatusIcon className="w-3 h-3" style={{ color: `hsl(${a})` }} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground/90 truncate leading-tight">{ev.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] text-muted-foreground/35">{ev.date}</span>
                      <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/20" />
                      <span className="text-[9px] font-semibold" style={{ color: `hsl(${a} / 0.7)` }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <p className="text-[12px] font-bold tabular-nums text-foreground/80 shrink-0">
                    {fmt(ev.amount)}
                  </p>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

ProximosEventos.displayName = "ProximosEventos";
export default ProximosEventos;
