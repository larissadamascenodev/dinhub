import { memo, useMemo } from "react";
import { Check, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import type { FinanceEvent } from "@/types/finance";

interface ProximosEventosProps {
  events: FinanceEvent[];
  onVerTodos?: () => void;
}

const STATUS_CONFIG = {
  pago: { label: "Pago", color: "bg-finanpro-green/20 text-finanpro-green border-finanpro-green/30", dot: "bg-finanpro-green", icon: Check },
  pendente: { label: "A pagar", color: "bg-finanpro-yellow/20 text-finanpro-yellow border-finanpro-yellow/30", dot: "bg-finanpro-yellow", icon: Clock },
  atrasado: { label: "Atrasado", color: "bg-finanpro-red/20 text-finanpro-red border-finanpro-red/30", dot: "bg-finanpro-red", icon: AlertTriangle },
};

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
    <div className="flex items-center justify-between gap-1 mb-4">
      {days.map((d) => (
        <div
          key={d.day}
          className={`flex flex-col items-center gap-1 flex-1 py-1.5 rounded-lg text-xs ${
            d.isToday
              ? "bg-primary text-primary-foreground font-bold"
              : "text-muted-foreground"
          }`}
        >
          <span>{d.label}</span>
          <span className="text-sm">{d.day}</span>
        </div>
      ))}
    </div>
  );
});
MiniCalendar.displayName = "MiniCalendar";

const EventItem = memo(({ event, isLast }: { event: FinanceEvent; isLast: boolean }) => {
  const cfg = STATUS_CONFIG[event.status];
  const StatusIcon = cfg.icon;
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="flex gap-3 animate-fade-in-up">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${cfg.dot} ring-2 ring-card`} />
        {!isLast && <div className="w-0.5 flex-1 bg-border mt-1" />}
      </div>
      <div className="flex-1 pb-4">
        <p className="text-xs text-muted-foreground mb-1">{event.date}</p>
        <div className="rounded-xl border border-border bg-card p-3 card-glow flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{event.name}</p>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-foreground">{fmt(event.amount)}</p>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${cfg.dot}/20`}>
              <StatusIcon className={`h-3 w-3 ${cfg.dot === "bg-finanpro-green" ? "text-finanpro-green" : cfg.dot === "bg-finanpro-yellow" ? "text-finanpro-yellow" : "text-finanpro-red"}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
EventItem.displayName = "EventItem";

const ProximosEventos = memo(({ events, onVerTodos }: ProximosEventosProps) => (
  <div className="rounded-2xl border border-border bg-card p-5 card-glow lg:sticky lg:top-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-semibold text-foreground">Próximos Eventos</h3>
      <button
        onClick={onVerTodos}
        className="text-xs text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors"
      >
        Ver todos <ChevronRight className="h-3 w-3" />
      </button>
    </div>

    <MiniCalendar />

    <div className="flex items-center justify-center gap-4 mb-4 text-[10px] text-muted-foreground">
      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-finanpro-green" /> Pago</span>
      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-finanpro-yellow" /> Pendente</span>
      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-finanpro-red" /> Atrasado</span>
    </div>

    <div>
      {events.map((ev, i) => (
        <EventItem key={ev.id} event={ev} isLast={i === events.length - 1} />
      ))}
    </div>
  </div>
));

ProximosEventos.displayName = "ProximosEventos";
export default ProximosEventos;
