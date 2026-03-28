import { memo } from "react";
import { Calendar, ChevronRight, Check, Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { FinanceEvent } from "@/types/finance";

interface Props {
  events: FinanceEvent[];
  onVerTodos?: () => void;
}

const STATUS_CONFIG = {
  pago: {
    label: "Pago",
    dotColor: "bg-primary",
    badgeBg: "bg-primary/15",
    badgeText: "text-primary",
    badgeBorder: "border-primary/30",
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
    Icon: Check,
  },
  pendente: {
    label: "A pagar",
    dotColor: "bg-warning",
    badgeBg: "bg-warning/15",
    badgeText: "text-warning",
    badgeBorder: "border-warning/30",
    iconBg: "bg-warning/15",
    iconColor: "text-warning",
    Icon: Clock,
  },
  atrasado: {
    label: "Atrasado",
    dotColor: "bg-destructive",
    badgeBg: "bg-destructive/15",
    badgeText: "text-destructive",
    badgeBorder: "border-destructive/30",
    iconBg: "bg-destructive/15",
    iconColor: "text-destructive",
    Icon: Clock,
  },
};

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

const ProximosEventos = memo(({ events, onVerTodos }: Props) => (
  <div
    className="rounded-xl border border-border/20 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.03)] overflow-hidden"
    style={{
      background: "linear-gradient(145deg, hsl(220 18% 9% / 0.9) 0%, hsl(220 20% 5% / 0.95) 100%)",
    }}
  >
    {/* Header */}
    <div className="flex items-center justify-between px-4 pt-4 pb-2">
      <div className="flex items-center gap-2">
        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
          Próximos Eventos
        </h3>
      </div>
      <button
        onClick={onVerTodos}
        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
      >
        Ver todos
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>

    {/* Mini Calendar */}
    <MiniCalendar />

    {/* Legend */}
    <div className="flex items-center justify-center gap-5 px-4 pb-3">
      {[
        { label: "Pago", cls: "bg-primary" },
        { label: "Pendente", cls: "bg-warning" },
        { label: "Atrasado", cls: "bg-destructive" },
      ].map((s) => (
        <span key={s.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className={`w-2 h-2 rounded-full ${s.cls}`} />
          {s.label}
        </span>
      ))}
    </div>

    {/* Event cards */}
    <div className="px-4 pb-4 space-y-2.5">
      {events.map((ev, i) => {
        const cfg = STATUS_CONFIG[ev.status];
        const StatusIcon = cfg.Icon;

        return (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3"
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center self-stretch">
              <div className={`w-3 h-3 rounded-full ${cfg.dotColor} ring-2 ring-background flex-shrink-0 mt-4`} />
              {i < events.length - 1 && <div className="w-px flex-1 bg-border/40 mt-1" />}
            </div>

            {/* Card */}
            <div
              className="flex-1 rounded-2xl border border-border/20 px-4 py-3 flex items-center justify-between"
              style={{
                background: "linear-gradient(145deg, hsl(220 18% 9% / 0.85) 0%, hsl(220 20% 5% / 0.9) 100%)",
                boxShadow: "0 2px 8px -2px rgba(0,0,0,0.3), inset 0 1px 0 0 rgba(255,255,255,0.03)",
              }}
            >
              {/* Left: date, name, badge */}
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground/50 mb-0.5">{ev.date}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground truncate">{ev.name}</p>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap border ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder}`}
                  >
                    {cfg.label}
                  </span>
                </div>
              </div>

              {/* Right: amount + icon */}
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <p className="text-sm font-bold text-foreground tabular-nums">{fmt(ev.amount)}</p>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${cfg.iconBg}`}>
                  <StatusIcon className={`h-3.5 w-3.5 ${cfg.iconColor}`} />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
));

// Mini calendar component
const MiniCalendar = memo(() => {
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
    <div className="grid grid-cols-7 gap-1 px-4 mb-3">
      {days.map((d) => (
        <div
          key={`${d.label}-${d.day}`}
          className={`flex flex-col items-center py-2 rounded-xl text-xs transition-all ${
            d.isToday
              ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/15"
              : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          <span className="text-[10px] mb-0.5">{d.label}</span>
          <span className="text-sm font-medium">{d.day}</span>
        </div>
      ))}
    </div>
  );
});
MiniCalendar.displayName = "MiniCalendar";

ProximosEventos.displayName = "ProximosEventos";
export default ProximosEventos;
