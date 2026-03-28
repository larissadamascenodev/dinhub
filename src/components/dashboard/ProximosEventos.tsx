import { memo, useMemo } from "react";
import { Check, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import type { FinanceEvent } from "@/types/finance";

interface Props {
  events: FinanceEvent[];
  onVerTodos?: () => void;
}

const STATUS = {
  pago: {
    label: "Pago",
    badge: "bg-fp-green/15 text-fp-green border border-fp-green/25",
    dot: "bg-fp-green",
    iconColor: "text-fp-green",
    Icon: Check,
  },
  pendente: {
    label: "A pagar",
    badge: "bg-fp-yellow/15 text-fp-yellow border border-fp-yellow/25",
    dot: "bg-fp-yellow",
    iconColor: "text-fp-yellow",
    Icon: Clock,
  },
  atrasado: {
    label: "Atrasado",
    badge: "bg-fp-red/15 text-fp-red border border-fp-red/25",
    dot: "bg-fp-red",
    iconColor: "text-fp-red",
    Icon: AlertTriangle,
  },
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MiniCalendar = memo(() => {
  const days = useMemo(() => {
    const today = new Date();
    const dow = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        day: d.getDate(),
        label: ["D", "S", "T", "Q", "Q", "S", "S"][i],
        isToday: d.toDateString() === today.toDateString(),
      };
    });
  }, []);

  return (
    <div className="grid grid-cols-7 gap-1 mb-4">
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

const EventRow = memo(({ event, isLast, index }: { event: FinanceEvent; isLast: boolean; index: number }) => {
  const cfg = STATUS[event.status];
  const StatusIcon = cfg.Icon;

  return (
    <div
      className="flex gap-3"
      style={{ animation: `fade-up 0.4s ease-out ${index * 0.08}s both` }}
    >
      {/* Timeline */}
      <div className="flex flex-col items-center pt-1">
        <div className={`w-3 h-3 rounded-full ${cfg.dot} ring-4 ring-card shadow-lg`} />
        {!isLast && <div className="w-px flex-1 bg-border/60 mt-1.5" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <p className="text-[11px] text-muted-foreground mb-1.5 font-medium">{event.date}</p>
        <div className="fp-card p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{event.name}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.badge}`}>
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 ml-2">
            <p className="text-sm font-bold text-foreground">{fmt(event.amount)}</p>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${cfg.dot}/10`}>
              <StatusIcon className={`h-3.5 w-3.5 ${cfg.iconColor}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
EventRow.displayName = "EventRow";

const ProximosEventos = memo(({ events, onVerTodos }: Props) => (
  <div className="fp-card p-5 lg:sticky lg:top-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-bold text-foreground">Próximos Eventos</h3>
      <button
        onClick={onVerTodos}
        className="text-xs font-semibold fp-text-green hover:opacity-80 flex items-center gap-0.5 transition-colors"
      >
        Ver todos <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>

    <MiniCalendar />

    <div className="flex items-center justify-center gap-5 mb-5">
      {[
        { label: "Pago", color: "bg-fp-green" },
        { label: "Pendente", color: "bg-fp-yellow" },
        { label: "Atrasado", color: "bg-fp-red" },
      ].map((s) => (
        <span key={s.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className={`w-2 h-2 rounded-full ${s.color}`} />
          {s.label}
        </span>
      ))}
    </div>

    <div>
      {events.map((ev, i) => (
        <EventRow key={ev.id} event={ev} isLast={i === events.length - 1} index={i} />
      ))}
    </div>
  </div>
));

ProximosEventos.displayName = "ProximosEventos";
export default ProximosEventos;
