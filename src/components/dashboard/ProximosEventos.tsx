import { memo, useMemo, useState } from "react";
import { Check, Clock, AlertTriangle, ChevronRight, ChevronDown, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { FinanceEvent } from "@/types/finance";

interface Props {
  events: FinanceEvent[];
  selectedMonth: number;
  selectedYear: number;
  onVerTodos?: () => void;
  onEventClick?: (event: FinanceEvent) => void;
}

const STATUS_CONFIG = {
  pago: { label: "Pago", accent: "150 100% 45%", Icon: Check },
  pendente: { label: "Pendente", accent: "40 80% 50%", Icon: Clock },
  atrasado: { label: "Atrasado", accent: "0 60% 50%", Icon: AlertTriangle },
  recebido: { label: "Recebido", accent: "150 100% 45%", Icon: Check },
};

const getStatusLabel = (status: string, type?: string) => {
  if (type === "receita") {
    if (status === "pago" || status === "recebido") return "Recebido";
    if (status === "pendente") return "A Receber";
  }
  if (type === "despesa") {
    if (status === "pago") return "Pago";
    if (status === "pendente") return "Pendente";
  }
  if (status === "atrasado") return "A Pagar";
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label ?? status;
};

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MONTH_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const parseDateSafe = (dateStr: string): Date => {
  if (dateStr.includes("T")) return new Date(dateStr);
  return new Date(dateStr + "T12:00:00");
};

const getWeekRange = () => {
  const today = new Date();
  const dow = today.getDay();
  const start = new Date(today);
  start.setDate(today.getDate() - dow);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const ProximosEventos = memo(({ events, selectedMonth, selectedYear, onVerTodos, onEventClick }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const { weekEvents, restEvents } = useMemo(() => {
    const { start, end } = getWeekRange();
    const sorted = [...events]
      .map((ev) => ({ ...ev, _date: parseDateSafe(ev.date) }))
      .sort((a, b) => a._date.getTime() - b._date.getTime());

    const week: typeof sorted = [];
    const rest: typeof sorted = [];
    for (const ev of sorted) {
      if (ev._date >= start && ev._date <= end) week.push(ev);
      else rest.push(ev);
    }
    return { weekEvents: week, restEvents: rest };
  }, [events]);

  const displayEvents = expanded ? [...weekEvents, ...restEvents].sort((a, b) => a._date.getTime() - b._date.getTime()) : weekEvents;
  const totalRest = restEvents.length;

  const renderEvent = (ev: typeof displayEvents[0], idx: number) => {
    const cfg = STATUS_CONFIG[ev.status];
    const a = cfg.accent;
    const StatusIcon = cfg.Icon;
    const isPaidOrReceived = ev.status === "pago" || ev.status === "recebido";
    const isClickable = ev.isTransaction && ev.status === "pendente";
    const day = ev._date.getDate();
    const month = ev._date.getMonth();

    return (
      <motion.div
        key={ev.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ delay: idx * 0.03, type: "spring", stiffness: 500, damping: 35 }}
        className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all ${isClickable ? "cursor-pointer hover:scale-[1.01] active:scale-[0.99]" : ""}`}
        style={{
          background: `hsl(${a} / 0.05)`,
          borderColor: `hsl(${a} / 0.12)`,
        }}
        onClick={() => {
          if (isClickable && onEventClick) onEventClick(ev);
        }}
      >
        {/* Date chip */}
        <div className="flex flex-col items-center shrink-0 w-9">
          <span className="text-[9px] uppercase text-muted-foreground/40 font-semibold leading-none">
            {MONTH_SHORT[month]}
          </span>
          <span className="text-base font-bold leading-tight" style={{ color: `hsl(${a})` }}>
            {day < 10 ? `0${day}` : day}
          </span>
        </div>

        {/* Divider line */}
        <div className="w-px h-8 rounded-full" style={{ background: `hsl(${a} / 0.2)` }} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-foreground/90 truncate">{ev.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StatusIcon className="w-2.5 h-2.5" style={{ color: `hsl(${a})` }} />
            <span className="text-[9px] font-medium" style={{ color: `hsl(${a} / 0.7)` }}>
              {getStatusLabel(ev.status, ev.type)}
            </span>
          </div>
        </div>

        {/* Amount */}
        <p className="text-[12px] font-bold tabular-nums shrink-0" style={{ color: `hsl(${a})` }}>
          {fmt(ev.amount)}
        </p>
      </motion.div>
    );
  };

  return (
    <div className="rounded-2xl bg-card/90 backdrop-blur-xl border border-border/30 shadow-lg shadow-black/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Próximos Eventos</h2>
          <span className="text-[10px] text-muted-foreground/40 font-medium">· esta semana</span>
        </div>
      </div>

      {/* Events list */}
      <div className="px-3 pb-2 space-y-1.5">
        <AnimatePresence mode="popLayout">
          {displayEvents.length > 0 ? (
            displayEvents.map((ev, idx) => renderEvent(ev, idx))
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-[11px] text-muted-foreground/40 py-4"
            >
              Nenhum evento esta semana
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Ver todos / Recolher */}
      {(totalRest > 0 || expanded) && (
        <div className="px-4 pb-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-center gap-1 text-[11px] text-primary font-semibold py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
          >
            {expanded ? (
              <>Recolher <ChevronDown className="w-3.5 h-3.5 rotate-180" /></>
            ) : (
              <>Ver todos ({totalRest + weekEvents.length}) <ChevronRight className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
});

ProximosEventos.displayName = "ProximosEventos";
export default ProximosEventos;
