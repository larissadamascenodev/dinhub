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

const fmtDate = (d: Date) =>
  d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");

const parseDateSafe = (dateStr: string): Date => {
  if (dateStr.includes("T")) return new Date(dateStr);
  return new Date(dateStr + "T12:00:00");
};

const MIN_VISIBLE = 3;

const ProximosEventos = memo(({ events, selectedMonth, selectedYear, onVerTodos, onEventClick }: Props) => {
  const [expanded, setExpanded] = useState(false);

  // Sort: pendente/atrasado first, then pago/recebido; within each group sort by date
  const sortedEvents = useMemo(() => {
    const mapped = [...events].map((ev) => ({ ...ev, _date: parseDateSafe(ev.rawDate || ev.date) }));
    const statusOrder = (s: string) => (s === "pago" || s === "recebido" ? 1 : 0);
    return mapped.sort((a, b) => {
      const so = statusOrder(a.status) - statusOrder(b.status);
      if (so !== 0) return so;
      return a._date.getTime() - b._date.getTime();
    });
  }, [events]);

  // Always show at least MIN_VISIBLE, expand shows all
  const visibleCount = Math.max(MIN_VISIBLE, 0);
  const displayEvents = expanded ? sortedEvents : sortedEvents.slice(0, visibleCount);
  const hasMore = sortedEvents.length > visibleCount;

  const renderEvent = (ev: typeof sortedEvents[0], idx: number) => {
    const isPaid = ev.status === "pago" || ev.status === "recebido";
    const cfg = STATUS_CONFIG[ev.status] ?? STATUS_CONFIG.pendente;
    const a = cfg.accent;
    const StatusIcon = cfg.Icon;
    const isClickable = ev.isTransaction && ev.status === "pendente";

    return (
      <motion.div
        key={ev.id}
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ delay: idx * 0.03, type: "spring", stiffness: 500, damping: 35 }}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${isClickable ? "cursor-pointer hover:scale-[1.01] active:scale-[0.99]" : ""}`}
        style={{
          background: isPaid ? `hsl(150 100% 45% / 0.06)` : `hsl(${a} / 0.05)`,
          borderColor: isPaid ? `hsl(150 100% 45% / 0.15)` : `hsl(${a} / 0.12)`,
        }}
        onClick={() => {
          if (isClickable && onEventClick) onEventClick(ev);
        }}
      >
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-[12px] font-semibold truncate ${isPaid ? "text-foreground/50" : "text-foreground/90"}`}>
            {ev.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StatusIcon className="w-2.5 h-2.5" style={{ color: `hsl(${a})` }} />
            <span className="text-[9px] font-medium" style={{ color: `hsl(${a} / 0.7)` }}>
              {getStatusLabel(ev.status, ev.type)}
            </span>
          </div>
        </div>

        {/* Amount + date */}
        <div className="text-right shrink-0">
          <p className={`text-[12px] font-bold tabular-nums`} style={{ color: `hsl(${a})` }}>
            {fmt(ev.amount)}
          </p>
          <p className="text-[9px] text-muted-foreground/50 mt-0.5">
            {fmtDate(ev._date)}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="rounded-[32px] bg-white/[0.02] border border-white/[0.05] shadow-[0_8px_30px_-5px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/[0.05]">
            <CalendarDays className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em]">Compromissos</h2>
            <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider mt-0.5">Calendário mensal</p>
          </div>
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
