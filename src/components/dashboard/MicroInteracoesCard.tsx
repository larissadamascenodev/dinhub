import { memo, useMemo, useState, useEffect } from "react";
import { Smile, Meh, AlertTriangle, PartyPopper, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  gastosHoje: number;
  mediaGastosDiarios: number;
  status?: "safe" | "warning" | "danger";
}

const buckets = {
  zero: {
    msgs: ["Hoje tá tranquilo até agora 😌", "Nenhum gasto registrado hoje ✨"],
    icon: PartyPopper,
    iconClass: "text-primary",
  },
  saving: {
    msgs: ["Hoje você tá no controle 💪", "Economia real hoje, parabéns 🎉"],
    icon: TrendingDown,
    iconClass: "text-primary",
  },
  below: {
    msgs: ["Tudo sob controle 👍", "Ritmo saudável hoje 🧘"],
    icon: Smile,
    iconClass: "text-primary",
  },
  above: {
    msgs: ["Cuidado, o ritmo subiu um pouco ⚠️", "Um pouco acima da média hoje 📊"],
    icon: Meh,
    iconClass: "text-warning",
  },
  high: {
    msgs: ["Hoje você acelerou nos gastos 👀", "Calma… desse jeito o mês sente 🔥"],
    icon: AlertTriangle,
    iconClass: "text-destructive",
  },
};

function generateDailyMessage(gastosHoje: number, mediaGastosDiarios: number): keyof typeof buckets {
  if (gastosHoje === 0) return "zero";
  const variacao = mediaGastosDiarios > 0
    ? ((gastosHoje - mediaGastosDiarios) / mediaGastosDiarios) * 100
    : 0;
  if (variacao > 20) return "high";
  if (variacao > 0) return "above";
  if (variacao > -20) return "below";
  return "saving";
}

const MicroInteracoesCard = memo(({ gastosHoje, mediaGastosDiarios }: Props) => {
  const bucket = useMemo(
    () => generateDailyMessage(gastosHoje, mediaGastosDiarios),
    [gastosHoje, mediaGastosDiarios]
  );

  const cfg = buckets[bucket];
  const Icon = cfg.icon;
  const msgs = cfg.msgs;

  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (msgs.length <= 1) return;
    const interval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % msgs.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [msgs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-xl px-4 py-2.5 cursor-pointer transition-all border border-primary/20 backdrop-blur-sm overflow-hidden"
      style={{
        background: bucket === "high" || bucket === "above"
          ? "hsl(0 60% 50% / 0.06)"
          : "hsl(150 100% 45% / 0.06)",
        boxShadow: "0 2px 8px -2px rgba(0,0,0,0.4), inset 0 1px 0 0 hsl(150 100% 45% / 0.08)",
        borderColor: bucket === "high" || bucket === "above"
          ? "hsl(0 60% 50% / 0.2)"
          : undefined,
      }}
    >
      <motion.div
        key={bucket}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <Icon className={`w-4 h-4 shrink-0 ${cfg.iconClass}`} />
      </motion.div>
      <div className="relative flex-1 h-5 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIdx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="text-xs text-foreground leading-snug font-medium absolute inset-0 whitespace-nowrap"
          >
            {msgs[msgIdx]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

MicroInteracoesCard.displayName = "MicroInteracoesCard";
export default MicroInteracoesCard;
