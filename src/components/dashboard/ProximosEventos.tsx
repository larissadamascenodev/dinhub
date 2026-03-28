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
    textColor: "text-primary",
    dotBg: "bg-primary",
    dotGlow: "shadow-[0_0_8px_hsl(150_100%_45%/0.5)]",
    cardBg: "hsl(150 100% 45% / 0.04)",
    cardBorder: "hsl(150 100% 45% / 0.12)",
    iconBg: "hsl(150 100% 45% / 0.08)",
    Icon: Check,
  },
  pendente: {
    label: "A pagar",
    textColor: "text-warning",
    dotBg: "bg-warning",
    dotGlow: "shadow-[0_0_8px_hsl(40_80%_50%/0.5)]",
    cardBg: "hsl(40 80% 50% / 0.04)",
    cardBorder: "hsl(40 80% 50% / 0.12)",
    iconBg: "hsl(40 80% 50% / 0.08)",
    Icon: Clock,
  },
  atrasado: {
    label: "Atrasado",
    textColor: "text-destructive",
    dotBg: "bg-destructive",
    dotGlow: "shadow-[0_0_8px_hsl(0_60%_50%/0.5)]",
    cardBg: "hsl(0 60% 50% / 0.04)",
    cardBorder: "hsl(0 60% 50% / 0.12)",
    iconBg: "hsl(0 60% 50% / 0.08)",
    Icon: AlertTriangle,
  },
  recebido: {
    label: "Recebido",
    textColor: "text-primary",
    dotBg: "bg-primary",
    dotGlow: "shadow-[0_0_8px_hsl(150_100%_45%/0.5)]",
    cardBg: "hsl(150 100% 45% / 0.04)",
    cardBorder: "hsl(150 100% 45% / 0.12)",
    iconBg: "hsl(150 100% 45% / 0.08)",
    Icon: Check,
  },
};

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

const ProximosEventos = memo(({ events, onVerTodos }: Props) => (
  <div
    className="rounded-2xl overflow-hidden border border-white/[0.06] backdrop-blur-xl"
    style={{
      background: "linear-gradient(170deg, hsl(220 18% 10% / 0.45) 0%, hsl(220 20% 6% / 0.55) 50%, hsl(220 22% 4% / 0.65) 100%)",
      boxShadow: "0 8px 40px -12px rgba(0,0,0,0.5), inset 0 1px 0 0 rgba(255,255,255,0.05), inset 0 -1px 0 0 rgba(255,255,255,0.02)",
    }}
  >
    {/* Header */}
    <div className="flex items-center justify-between px-5 pt-5 pb-3">
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-sm"
          style={{ background: "hsl(150 100% 45% / 0.08)", border: "1px solid hsl(150 100% 45% / 0.12)" }}
        >
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
    <div className="mx-5 h-px bg-white/[0.04]" />

    {/* Event Cards */}
    <div className="px-4 py-4 space-y-2">
      {events.map((ev, i) => {
        const cfg = STATUS_CONFIG[ev.status];
        const StatusIcon = cfg.Icon;

        return (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            className="group relative rounded-xl p-3 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-all duration-200 backdrop-blur-sm"
            style={{
              background: cfg.cardBg,
              border: `1px solid ${cfg.cardBorder}`,
              boxShadow: "0 2px 8px -3px rgba(0,0,0,0.3), inset 0 1px 0 0 rgba(255,255,255,0.02)",
            }}
          >
            {/* Left */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm"
                style={{ background: cfg.iconBg, border: `1px solid ${cfg.cardBorder}` }}
              >
                <StatusIcon className={`w-3.5 h-3.5 ${cfg.textColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{ev.name}</p>
                <p className="text-[10px] text-muted-foreground/60">{ev.date}</p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <div className="text-right">
                <p className="text-[13px] font-bold text-foreground tabular-nums">{fmt(ev.amount)}</p>
                <span className={`text-[9px] font-semibold ${cfg.textColor} uppercase tracking-wider`}>
                  {cfg.label}
                </span>
              </div>
              <div className={`w-1.5 h-1.5 rounded-full ${cfg.dotBg} ${cfg.dotGlow} flex-shrink-0`} />
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
));

// Mini calendar
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
              ? "bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 backdrop-blur-sm"
              : "text-muted-foreground/70 hover:bg-white/[0.04] hover:text-muted-foreground"
          }`}
        >
          <span className="text-[10px] mb-0.5 opacity-60">{d.label}</span>
          <span className="text-sm font-semibold">{d.day}</span>
        </div>
      ))}
    </div>
  );
});
MiniCalendar.displayName = "MiniCalendar";

ProximosEventos.displayName = "ProximosEventos";
export default ProximosEventos;
