import { memo, useMemo } from "react";
import { Zap, ChevronUp } from "lucide-react";

interface MicroInteracoesProps {
  gastosHoje: number;
  mediaGastosDiarios: number;
}

const MicroInteracoesCard = memo(({ gastosHoje, mediaGastosDiarios }: MicroInteracoesProps) => {
  const { message, percentVsMedia } = useMemo(() => {
    const pct = mediaGastosDiarios > 0 ? (gastosHoje / mediaGastosDiarios) * 100 : 0;
    let msg: string;
    if (gastosHoje === 0) msg = "Saldo intacto 🤑";
    else if (pct < 50) msg = "Dia tranquilo hoje 😎";
    else if (pct < 80) msg = "Tá controlado, mas fica de olho 👌";
    else if (pct < 120) msg = "Hoje já deu uma escapadinha 👀";
    else msg = "Cuidado hoje hein… 🚨";
    return { message: msg, percentVsMedia: Math.round(pct) };
  }, [gastosHoje, mediaGastosDiarios]);

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-glow transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium uppercase tracking-wider">
          <Zap className="h-4 w-4 text-primary" />
          Hoje
        </div>
        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-2xl font-bold text-finanpro-red">{fmt(gastosHoje)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">gastos hoje</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">ainda pode gastar</p>
          <p className="text-lg font-bold text-foreground">
            {fmt(Math.max(0, mediaGastosDiarios - gastosHoje))}
          </p>
        </div>
      </div>
      <div className="pt-3 border-t border-border">
        <p className="text-sm font-medium text-foreground">{message}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          ~{percentVsMedia}% vs média
        </p>
      </div>
    </div>
  );
});

MicroInteracoesCard.displayName = "MicroInteracoesCard";
export default MicroInteracoesCard;
