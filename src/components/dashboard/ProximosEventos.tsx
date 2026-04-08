import { memo, useMemo, useState } from "react";
import { Check, Clock, AlertTriangle, ChevronRight, ChevronUp, CalendarDays } from "lucide-react";
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

const parseDateSafe = (dateStr: string): Date => {
  if (dateStr.includes("T")) return new Date(dateStr);
  return new Date(dateStr + "T12:00:00");
};

const ProximosEventos = memo(({ events, selectedMonth, selectedYear, onVerTodos, onEventClick }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const sortedEvents = useMemo(() => {
    return [...events]
      .map((ev) => ({ ...ev, _date: parseDateSafe(ev.date) }))
      .sort((a, b) => a._date.getTime() - b._date.getTime());
  }, [events]);

  const displayEvents = expanded ? sortedEvents : sortedEvents.slice(0, 3);
  const hasMore = sortedEvents.length > 3;

  const renderEvent = (ev: typeof sortedEvents[0], idx: number) => {
    const cfg = STATUS_CONFIG[ev.status];
    const a = cfg.accent;
    const StatusIcon = cfg.Icon;
    const isClickable = ev.isTransaction && ev.status === "pendente";

    return (
      <motion.div
        key={ev.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ delay: idx * 0.03, type: "spring", stiffness: 500, damping: 35 }}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${isClickable ? "cursor-pointer hover:scale-[1.01] active:scale-[0.99]" : ""}`}
        style={{
          background: `hsl(${a} / 0.05)`,
          borderColor: `hsl(${a} / 0.12)`,
        }}
        onClick={() => {
          if (isClickable && onEventClick) onEventClick(ev);
        }}
      >
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
              Nenhum evento este mês
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Ver todos / Recolher */}
      {hasMore && (
        <div className="px-4 pb-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-center gap-1 text-[11px] text-primary font-semibold py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
          >
            {expanded ? (
              <>Recolher <ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <>Ver todos ({sortedEvents.length}) <ChevronRight className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
});

ProximosEventos.displayName = "ProximosEventos";
export default ProximosEventos;
