import { memo } from "react";
import { ChevronRight, Check, Clock, AlertTriangle, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import type { FinanceEvent } from "@/types/finance";

interface Props {
  events: FinanceEvent[];
  onVerTodos?: () => void;
}

const STATUS_CONFIG = {
  pago: {
    label: "Pago",
    gradient: "from-primary/20 to-primary/5",
    borderColor: "border-primary/25",
    textColor: "text-primary",
    dotGlow: "shadow-[0_0_8px_hsl(150_100%_45%/0.5)]",
    dotBg: "bg-primary",
    Icon: Check,
  },
  pendente: {
    label: "A pagar",
    gradient: "from-warning/20 to-warning/5",
    borderColor: "border-warning/25",
    textColor: "text-warning",
    dotGlow: "shadow-[0_0_8px_hsl(40_80%_50%/0.5)]",
    dotBg: "bg-warning",
    Icon: Clock,
  },
  atrasado: {
    label: "Atrasado",
    gradient: "from-destructive/20 to-destructive/5",
    borderColor: "border-destructive/25",
    textColor: "text-destructive",
    dotGlow: "shadow-[0_0_8px_hsl(0_60%_50%/0.5)]",
    dotBg: "bg-destructive",
    Icon: AlertTriangle,
  },
  recebido: {
    label: "Recebido",
    gradient: "from-primary/20 to-primary/5",
    borderColor: "border-primary/25",
    textColor: "text-primary",
    dotGlow: "shadow-[0_0_8px_hsl(150_100%_45%/0.5)]",
    dotBg: "bg-primary",
    Icon: Check,
  },
};

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

const ProximosEventos = memo(({ events, onVerTodos }: Props) => (
  <div className="rounded-2xl overflow-hidden border border-border/30"
    style={{
      background: "linear-gradient(180deg, hsl(220 18% 8% / 0.95) 0%, hsl(220 20% 4%) 100%)",
      boxShadow: "0 8px 32px -8px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.04)",
    }}
  >
    {/* Header */}
    <div className="flex items-center justify-between px-5 pt-5 pb-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Calendar className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-sm font-bold text-foreground tracking-tight">Próximos Eventos</h3>
      </div>
      <button
        onClick={onVerTodos}
        className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5 font-medium"
      >
        Ver todos
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>

    {/* Mini Calendar */}
    <MiniCalendar />

    {/* Legend */}
    <div className="flex items-center justify-center gap-5 px-5 pb-4">
      {[
        { label: "Pago", cls: "bg-primary", glow: "shadow-[0_0_6px_hsl(150_100%_45%/0.4)]" },
        { label: "Pendente", cls: "bg-warning", glow: "shadow-[0_0_6px_hsl(40_80%_50%/0.4)]" },
        { label: "Atrasado", cls: "bg-destructive", glow: "shadow-[0_0_6px_hsl(0_60%_50%/0.4)]" },
      ].map((s) => (
        <span key={s.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
          <span className={`w-2 h-2 rounded-full ${s.cls} ${s.glow}`} />
          {s.label}
        </span>
      ))}
    </div>

    {/* Divider */}
    <div className="mx-5 h-px bg-border/20" />

    {/* Event Cards */}
    <div className="px-5 py-4 space-y-2.5">
      {events.map((ev, i) => {
        const cfg = STATUS_CONFIG[ev.status];
        const StatusIcon = cfg.Icon;

        return (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={`group relative rounded-xl border ${cfg.borderColor} bg-gradient-to-r ${cfg.gradient} p-3.5 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-all duration-200`}
            style={{
              boxShadow: "0 2px 12px -4px rgba(0,0,0,0.4), inset 0 1px 0 0 rgba(255,255,255,0.03)",
            }}
          >
            {/* Left */}
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0 border ${cfg.borderColor}`}>
                <StatusIcon className={`w-4 h-4 ${cfg.textColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{ev.name}</p>
                <p className="text-[11px] text-muted-foreground">{ev.date}</p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2.5 shrink-0 ml-3">
              <div className="text-right">
                <p className="text-sm font-bold text-foreground tabular-nums">{fmt(ev.amount)}</p>
                <span className={`text-[10px] font-semibold ${cfg.textColor}`}>
                  {cfg.label}
                </span>
              </div>
              <div className={`w-2 h-2 rounded-full ${cfg.dotBg} ${cfg.dotGlow} flex-shrink-0`} />
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
    <div className="grid grid-cols-7 gap-1.5 px-5 mb-3">
      {days.map((d) => (
        <div
          key={`${d.label}-${d.day}`}
          className={`flex flex-col items-center py-2 rounded-xl text-xs transition-all ${
            d.isToday
              ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
              : "text-muted-foreground hover:bg-secondary/60"
          }`}
        >
          <span className="text-[10px] mb-0.5 opacity-70">{d.label}</span>
          <span className="text-sm font-semibold">{d.day}</span>
        </div>
      ))}
    </div>
  );
});
MiniCalendar.displayName = "MiniCalendar";

ProximosEventos.displayName = "ProximosEventos";
export default ProximosEventos;
