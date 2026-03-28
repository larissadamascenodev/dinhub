import { memo } from "react";
import { Briefcase, ShoppingCart, Car, Heart, Tv, Receipt, Bell, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Transaction } from "@/types/finance";

interface Props {
  transactions: Transaction[];
  onVerTodas?: () => void;
}

const ICONS: Record<string, { icon: React.ComponentType<any>; color: string; emoji: string }> = {
  Salário: { icon: Briefcase, color: "#22c55e", emoji: "💰" },
  Alimentação: { icon: ShoppingCart, color: "#f97316", emoji: "🛒" },
  Transporte: { icon: Car, color: "#3b82f6", emoji: "🚗" },
  Saúde: { icon: Heart, color: "#ef4444", emoji: "💊" },
  Assinaturas: { icon: Tv, color: "#a855f7", emoji: "📺" },
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function timeAgo(index: number): string {
  const times = ["agora", "2 min atrás", "15 min atrás", "1h atrás", "3h atrás"];
  return times[index] || `${index + 1}h atrás`;
}

const TransacoesRecentes = memo(({ transactions, onVerTodas }: Props) => (
  <div
    className="rounded-xl border border-border/20 bg-card shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden"
    style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.03) 0%, transparent 60%)" }}
  >
    {/* Header */}
    <div className="flex items-center justify-between px-4 pt-4 pb-2">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Bell className="w-4 h-4 text-primary" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Transações Recentes</h3>
      </div>
      <button
        onClick={onVerTodas}
        className="text-[10px] text-primary/70 hover:text-primary transition-colors flex items-center gap-0.5"
      >
        Ver todas
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>

    {transactions.length === 0 ? (
      <div className="p-8 text-center">
        <Receipt className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground/50">Nenhuma transação ainda</p>
      </div>
    ) : (
      <div className="px-3 pb-3">
        {transactions.slice(0, 5).map((tx, index) => {
          const cfg = ICONS[tx.category] || ICONS.Salário;
          const isReceita = tx.type === "receita";
          const accentColor = isReceita ? "#22c55e" : cfg.color;

          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06, type: "spring", stiffness: 400, damping: 30 }}
              className="group relative"
            >
              {/* Notification row */}
              <div
                className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                style={{
                  borderLeft: `3px solid ${accentColor}`,
                  background: index === 0
                    ? `linear-gradient(135deg, ${accentColor}12 0%, transparent 70%)`
                    : "transparent",
                }}
              >
                {/* Emoji avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}25, ${accentColor}08)`,
                    boxShadow: index === 0 ? `0 0 16px ${accentColor}25` : "none",
                  }}
                >
                  {cfg.emoji}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-semibold text-foreground truncate">{tx.name}</p>
                    {index === 0 && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[8px] font-bold uppercase tracking-wider">
                        novo
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                    {tx.category} · {timeAgo(index)}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <motion.p
                    initial={index === 0 ? { scale: 1.2 } : {}}
                    animate={{ scale: 1 }}
                    className="text-[14px] font-bold tabular-nums tracking-tight"
                    style={{
                      color: isReceita ? "hsl(142 71% 55%)" : "hsl(0 72% 51%)",
                      textShadow: index === 0 ? `0 0 12px ${accentColor}40` : "none",
                    }}
                  >
                    {isReceita ? "+" : "-"}{fmt(tx.amount)}
                  </motion.p>
                  <p className="text-[9px] text-muted-foreground/40 font-medium">
                    {isReceita ? "Receita" : "Despesa"}
                  </p>
                </div>
              </div>

              {/* Separator */}
              {index < transactions.length - 1 && index < 4 && (
                <div className="mx-14 h-px bg-border/15" />
              )}
            </motion.div>
          );
        })}
      </div>
    )}
  </div>
));

TransacoesRecentes.displayName = "TransacoesRecentes";
export default TransacoesRecentes;
