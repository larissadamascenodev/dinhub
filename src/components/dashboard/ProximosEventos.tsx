import { memo, useMemo, useState, useRef } from "react";
import { ChevronRight, Check, Clock, AlertTriangle, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import type { FinanceEvent } from "@/types/finance";

interface Props {
  events: FinanceEvent[];
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

/** Parse "24 de mar" → day number */
const parseDayFromDate = (dateStr: string): number | null => {
  const match = dateStr.match(/^(\d{1,2})/);
  return match ? parseInt(match[1], 10) : null;
};

/** Get best status priority for a day: atrasado > pendente > pago/recebido */
const STATUS_PRIORITY: Record<string, number> = { atrasado: 3, pendente: 2, pago: 1, recebido: 1 };

const ProximosEventos = memo(({ events, onVerTodos }: Props) => {
  // Build map: day → best status accent color
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
    <div className="relative rounded-2xl overflow-hidden">
      <div
        className="absolute -inset-px rounded-2xl"
        style={{ background: "linear-gradient(180deg, hsl(150 100% 45% / 0.08) 0%, transparent 40%)" }}
      />
      <div
        className="relative rounded-2xl border border-white/[0.07] backdrop-blur-2xl overflow-hidden"
        style={{
          background: "linear-gradient(175deg, hsl(220 16% 12% / 0.5) 0%, hsl(220 20% 7% / 0.65) 40%, hsl(220 22% 5% / 0.8) 100%)",
          boxShadow: "0 20px 50px -15px rgba(0,0,0,0.5), inset 0 1px 0 0 rgba(255,255,255,0.06), inset 0 0 80px rgba(255,255,255,0.01)",
        }}
      >
        {/* Top highlight */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
          style={{ background: "linear-gradient(90deg, transparent, hsl(150 100% 45% / 0.2), transparent)" }}
        />

        {/* Header */}
        <div className="relative flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(150 100% 45% / 0.12) 0%, hsl(150 100% 45% / 0.04) 100%)",
                border: "1px solid hsl(150 100% 45% / 0.15)",
                boxShadow: "0 0 12px hsl(150 100% 45% / 0.06)",
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
        <MiniCalendar dayStatusMap={dayStatusMap} />

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
          <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(220 15% 30% / 0.3), transparent)" }} />
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
                className="group relative rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, hsl(${a} / 0.03) 0%, hsl(220 20% 8% / 0.3) 100%)`,
                  border: `1px solid hsl(${a} / 0.08)`,
                  boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.02)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, hsl(${a} / 0.07) 0%, hsl(220 20% 8% / 0.4) 100%)`;
                  e.currentTarget.style.borderColor = `hsl(${a} / 0.18)`;
                  e.currentTarget.style.boxShadow = `0 4px 16px -4px hsl(${a} / 0.12), inset 0 1px 0 0 rgba(255,255,255,0.03)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, hsl(${a} / 0.03) 0%, hsl(220 20% 8% / 0.3) 100%)`;
                  e.currentTarget.style.borderColor = `hsl(${a} / 0.08)`;
                  e.currentTarget.style.boxShadow = "inset 0 1px 0 0 rgba(255,255,255,0.02)";
                }}
              >
                {/* Accent line left */}
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full opacity-60"
                  style={{ background: `hsl(${a})`, boxShadow: `0 0 6px hsl(${a} / 0.4)` }}
                />

                {/* Left */}
                <div className="flex items-center gap-2.5 min-w-0 pl-1.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `hsl(${a} / 0.08)`, border: `1px solid hsl(${a} / 0.1)` }}
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
    </div>
  );
});

// Mini calendar with event indicators
interface MiniCalendarProps {
  dayStatusMap: Map<number, { accent: string; priority: number }>;
}

const MiniCalendar = memo(({ dayStatusMap }: MiniCalendarProps) => {
  const today = new Date();
  const dow = today.getDay();
  const start = new Date(today);
  start.setDate(today.getDate() - dow);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      day: d.getDate(),
      label: ["D", "S", "T", "Q", "Q", "S", "S"][i],
      isToday: d.toDateString() === today.toDateString(),
    };
  });

  return (
    <div className="grid grid-cols-7 gap-1 px-5 mb-3">
      {days.map((d) => {
        const eventInfo = dayStatusMap.get(d.day);

        return (
          <div
            key={`${d.label}-${d.day}`}
            className="flex flex-col items-center py-2 rounded-xl text-xs transition-all relative"
            style={
              d.isToday
                ? {
                    background: "linear-gradient(180deg, hsl(150 100% 45%) 0%, hsl(150 100% 38%) 100%)",
                    color: "white",
                    fontWeight: 700,
                    boxShadow: "0 4px 14px -4px hsl(150 100% 45% / 0.35), inset 0 1px 0 0 rgba(255,255,255,0.2)",
                  }
                : eventInfo
                ? {
                    background: `hsl(${eventInfo.accent} / 0.06)`,
                    border: `1px solid hsl(${eventInfo.accent} / 0.12)`,
                  }
                : {}
            }
          >
            <span className={`text-[10px] mb-0.5 ${d.isToday ? "opacity-80" : eventInfo ? `opacity-70` : "text-muted-foreground/40"}`}>
              {d.label}
            </span>
            <span
              className={`text-sm font-semibold ${d.isToday ? "" : eventInfo ? "" : "text-muted-foreground/60"}`}
              style={!d.isToday && eventInfo ? { color: `hsl(${eventInfo.accent})` } : {}}
            >
              {d.day}
            </span>
            {/* Event dot indicator */}
            {eventInfo && !d.isToday && (
              <span
                className="absolute bottom-1 w-1 h-1 rounded-full"
                style={{ background: `hsl(${eventInfo.accent})`, boxShadow: `0 0 4px hsl(${eventInfo.accent} / 0.6)` }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});
MiniCalendar.displayName = "MiniCalendar";

ProximosEventos.displayName = "ProximosEventos";
export default ProximosEventos;
