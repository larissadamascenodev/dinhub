import { memo } from "react";
import { Briefcase, ShoppingCart, Car, Heart, Tv, Receipt } from "lucide-react";
import { motion } from "framer-motion";
import type { Transaction } from "@/types/finance";

interface Props {
  transactions: Transaction[];
  onVerTodas?: () => void;
}

const ICONS: Record<string, { icon: React.ComponentType<any>; color: string }> = {
  Salário: { icon: Briefcase, color: "#22c55e" },
  Alimentação: { icon: ShoppingCart, color: "#f97316" },
  Transporte: { icon: Car, color: "#3b82f6" },
  Saúde: { icon: Heart, color: "#ef4444" },
  Assinaturas: { icon: Tv, color: "#a855f7" },
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const TransacoesRecentes = memo(({ transactions, onVerTodas }: Props) => (
  <div
    className="rounded-xl border border-border/20 bg-card shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden p-4"
    style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.03) 0%, transparent 60%)" }}
  >
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Transações Recentes</h3>
      <button
        onClick={onVerTodas}
        className="text-[10px] text-primary/70 hover:text-primary transition-colors"
      >
        Ver todas
      </button>
    </div>

    {transactions.length === 0 ? (
      <div className="p-6 rounded-2xl bg-card/40 border border-border/20 text-center">
        <Receipt className="w-5 h-5 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">Nenhuma transação</p>
      </div>
    ) : (
      <div className="space-y-1.5">
        {transactions.slice(0, 5).map((tx, index) => {
          const cfg = ICONS[tx.category] || ICONS.Salário;
          const Icon = cfg.icon;
          const color = cfg.color;
          const isReceita = tx.type === "receita";

          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
              style={{
                background: `linear-gradient(135deg, ${color}14 0%, transparent 60%)`,
                border: `1px solid ${color}1a`,
                boxShadow: `0 1px 4px -1px rgba(0,0,0,0.15), inset 0 1px 0 0 rgba(255,255,255,0.03)`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${color}35, ${color}15)`,
                  boxShadow: `0 0 12px ${color}20`,
                }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{
                    color: color,
                    filter: `drop-shadow(0 0 4px ${color}80)`,
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-foreground">{tx.name}</p>
                <p className="text-[11px] text-muted-foreground/60">
                  {tx.category} · {tx.date}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <p
                  className="text-sm font-bold tabular-nums"
                  style={{
                    color: isReceita ? "hsl(142 71% 55%)" : "hsl(0 72% 51%)",
                  }}
                >
                  {isReceita ? "+" : "-"}{fmt(tx.amount)}
                </p>
                <p className="text-[10px] text-muted-foreground/40">
                  {isReceita ? "Receita" : "Despesa"}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    )}
  </div>
));

TransacoesRecentes.displayName = "TransacoesRecentes";
export default TransacoesRecentes;
