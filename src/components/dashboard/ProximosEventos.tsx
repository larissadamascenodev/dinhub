import { memo } from "react";
import { Calendar, ChevronRight, Check, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import type { FinanceEvent } from "@/types/finance";

interface Props {
  events: FinanceEvent[];
  onVerTodos?: () => void;
}

const STATUS_CONFIG = {
  pago: {
    label: "Pago",
    color: "hsl(var(--primary))",
    bg: "bg-primary/15",
    text: "text-primary",
    border: "border-primary/25",
    Icon: Check,
  },
  pendente: {
    label: "A pagar",
    color: "hsl(var(--warning))",
    bg: "bg-warning/15",
    text: "text-warning",
    border: "border-warning/25",
    Icon: Clock,
  },
  atrasado: {
    label: "Atrasado",
    color: "hsl(var(--destructive))",
    bg: "bg-destructive/15",
    text: "text-destructive",
    border: "border-destructive/25",
    Icon: AlertTriangle,
  },
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

const ProximosEventos = memo(({ events, onVerTodos }: Props) => (
  <div
    className="rounded-xl border border-border/20 bg-card shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden"
    style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.04) 0%, transparent 60%)" }}
  >
    {/* Header */}
    <div className="flex items-center justify-between px-4 pt-4 pb-2">
      <div className="flex items-center gap-2">
        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Próximos Eventos</h3>
      </div>
      <button
        onClick={onVerTodos}
        className="text-[10px] text-primary/70 hover:text-primary transition-colors flex items-center gap-0.5"
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

    {/* Timeline */}
    <div className="px-4 pb-4">
      {events.map((ev, i) => {
        const cfg = STATUS_CONFIG[ev.status];
        const StatusIcon = cfg.Icon;
        const isLast = i === events.length - 1;

        return (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className="flex gap-3"
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center pt-1">
              <div className={`w-3 h-3 rounded-full ${cfg.bg} ring-2 ring-card`} style={{ backgroundColor: cfg.color }} />
              {!isLast && <div className="w-px flex-1 bg-border/30 mt-1" />}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <p className="text-[11px] text-muted-foreground mb-1.5 font-medium">{ev.date}</p>
              <div className="rounded-xl border border-border/20 bg-card/60 p-3 flex items-center justify-between shadow-[0_1px_4px_-1px_rgba(0,0,0,0.15),inset_0_1px_0_0_rgba(255,255,255,0.03)]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{ev.name}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                    {cfg.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <p className="text-sm font-bold text-foreground tabular-nums">{fmt(ev.amount)}</p>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${cfg.bg}`}>
                    <StatusIcon className={`h-3.5 w-3.5 ${cfg.text}`} />
                  </div>
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
              ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
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
