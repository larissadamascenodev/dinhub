import { memo, useMemo } from "react";
import { Zap, ChevronUp } from "lucide-react";

interface Props {
  gastosHoje: number;
  mediaGastosDiarios: number;
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MicroInteracoesCard = memo(({ gastosHoje, mediaGastosDiarios }: Props) => {
  const { message, pct } = useMemo(() => {
    const p = mediaGastosDiarios > 0 ? (gastosHoje / mediaGastosDiarios) * 100 : 0;
    let m: string;
    if (gastosHoje === 0) m = "Saldo intacto 🤑";
    else if (p < 50) m = "Dia tranquilo hoje 😎";
    else if (p < 80) m = "Tá controlado, mas fica de olho 👌";
    else if (p < 120) m = "Hoje já deu uma escapadinha 👀";
    else m = "Cuidado hoje hein… 🚨";
    return { message: m, pct: Math.round(p) };
  }, [gastosHoje, mediaGastosDiarios]);

  return (
    <div className="fp-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <Zap className="h-4 w-4 text-primary" />
          Hoje
        </div>
        <ChevronUp className="h-4 w-4 text-muted-foreground/50 cursor-pointer hover:text-foreground transition-colors" />
      </div>

      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-3xl font-extrabold fp-text-red tracking-tight">{fmt(gastosHoje)}</p>
          <p className="text-xs text-muted-foreground mt-1">gastos hoje</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">ainda pode gastar</p>
          <p className="text-xl font-bold text-foreground mt-0.5">
            {fmt(Math.max(0, mediaGastosDiarios - gastosHoje))}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-border">
        <p className="text-sm font-semibold text-foreground">{message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          ~{pct}% vs média
        </p>
      </div>
    </div>
  );
});

MicroInteracoesCard.displayName = "MicroInteracoesCard";
export default MicroInteracoesCard;
