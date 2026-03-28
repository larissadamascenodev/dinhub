import { memo, useMemo } from "react";
import { Smile, Meh, AlertTriangle, PartyPopper, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  gastosHoje: number;
  mediaGastosDiarios: number;
}

const buckets = {
  zero: {
    msgs: ["Hoje tá tranquilo até agora 😄", "Nenhum gasto registrado hoje 🎉"],
    icon: PartyPopper,
    bg: "hsl(var(--primary) / 0.08)",
    border: "hsl(var(--primary) / 0.18)",
    iconColor: "hsl(var(--primary))",
  },
  saving: {
    msgs: ["Hoje você tá no controle 💰", "Economia real hoje, parabéns 🚀"],
    icon: TrendingDown,
    bg: "hsl(var(--primary) / 0.08)",
    border: "hsl(var(--primary) / 0.18)",
    iconColor: "hsl(var(--primary))",
  },
  below: {
    msgs: ["Tá indo bem hoje, continua assim 👏", "Ritmo saudável hoje 😊"],
    icon: Smile,
    bg: "hsl(var(--primary) / 0.06)",
    border: "hsl(var(--primary) / 0.15)",
    iconColor: "hsl(var(--primary))",
  },
  above: {
    msgs: ["Cuidado, o ritmo subiu um pouco ⚠️", "Um pouco acima da média hoje 👀"],
    icon: Meh,
    bg: "hsl(45 93% 47% / 0.08)",
    border: "hsl(45 93% 47% / 0.18)",
    iconColor: "hsl(45, 93%, 47%)",
  },
  high: {
    msgs: ["Hoje você tá gastando mais que o normal 👀", "Calma… desse jeito o mês sente 😅"],
    icon: AlertTriangle,
    bg: "hsl(var(--destructive) / 0.08)",
    border: "hsl(var(--destructive) / 0.18)",
    iconColor: "hsl(var(--destructive))",
  },
};

const MicroInteracoesCard = memo(({ gastosHoje, mediaGastosDiarios }: Props) => {
  const { bucket, msg } = useMemo(() => {
    const variacao = mediaGastosDiarios > 0 ? ((gastosHoje - mediaGastosDiarios) / mediaGastosDiarios) * 100 : 0;
    const b =
      gastosHoje === 0
        ? "zero" as const
        : variacao > 20
          ? "high" as const
          : variacao > 0
            ? "above" as const
            : variacao > -20
              ? "below" as const
              : "saving" as const;
    const cfg = buckets[b];
    const m = cfg.msgs[new Date().getDate() % cfg.msgs.length];
    return { bucket: b, msg: m };
  }, [gastosHoje, mediaGastosDiarios]);

  const cfg = buckets[bucket];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-xl px-4 py-2.5 cursor-pointer transition-all"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 0 12px -4px ${cfg.border}`,
      }}
    >
      <motion.div
        key={bucket}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <Icon className="w-4 h-4 shrink-0" style={{ color: cfg.iconColor }} />
      </motion.div>
      <motion.p
        key={msg}
        initial={{ opacity: 0, x: 6 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-xs text-foreground/80 leading-snug"
      >
        {msg}
      </motion.p>
    </motion.div>
  );
});

MicroInteracoesCard.displayName = "MicroInteracoesCard";
export default MicroInteracoesCard;
