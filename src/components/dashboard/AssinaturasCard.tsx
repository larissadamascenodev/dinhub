import { memo, useEffect, useState, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Subscription {
  id: string;
  name: string;
  amount: number;
  date: string;
  dueDay: number;
  category: string;
  source: "conta" | "cartao";
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const CATEGORY_ICONS: Record<string, string> = {
  Assinaturas: "📦",
  Streaming: "🎬",
  Música: "🎵",
  Saúde: "❤️",
  Academia: "💪",
  Educação: "📚",
  Transporte: "🚗",
  Moradia: "🏠",
  Internet: "🌐",
  Telefone: "📱",
  Seguro: "🛡️",
};

const guessIcon = (name: string, category: string): string => {
  const n = name.toLowerCase();
  if (n.includes("netflix") || n.includes("disney") || n.includes("hbo") || n.includes("prime video") || n.includes("streaming")) return "🎬";
  if (n.includes("spotify") || n.includes("deezer") || n.includes("youtube music") || n.includes("apple music")) return "🎵";
  if (n.includes("icloud") || n.includes("google one") || n.includes("dropbox") || n.includes("onedrive")) return "☁️";
  if (n.includes("academia") || n.includes("gym") || n.includes("smartfit") || n.includes("smart fit") || n.includes("bluefit")) return "💪";
  if (n.includes("internet") || n.includes("fibra") || n.includes("wifi")) return "🌐";
  if (n.includes("celular") || n.includes("telefone") || n.includes("claro") || n.includes("vivo") || n.includes("tim")) return "📱";
  if (n.includes("seguro")) return "🛡️";
  if (n.includes("aluguel") || n.includes("condomínio") || n.includes("condominio")) return "🏠";
  return CATEGORY_ICONS[category] ?? "📋";
};

const AssinaturasCard = memo(() => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSubscriptions = async () => {
      setLoading(true);

      const { data: txs } = await supabase
        .from("transactions")
        .select("id, name, amount, date, category, payment_method, credit_card_id")
        .eq("user_id", user.id)
        .eq("recurrence_type", "fixa")
        .eq("type", "despesa");

      if (!txs) {
        setLoading(false);
        return;
      }

      const seen = new Map<string, typeof txs[0]>();
      for (const tx of txs) {
        const key = tx.name.toLowerCase().trim();
        if (!seen.has(key) || tx.date < seen.get(key)!.date) {
          seen.set(key, tx);
        }
      }

      const subs: Subscription[] = Array.from(seen.values()).map((tx) => {
        const d = new Date(tx.date + "T12:00:00");
        return {
          id: tx.id,
          name: tx.name,
          amount: Number(tx.amount),
          date: tx.date,
          dueDay: d.getDate(),
          category: tx.category,
          source: tx.payment_method === "cartao" ? "cartao" : "conta",
        };
      });

      subs.sort((a, b) => a.dueDay - b.dueDay);
      setSubscriptions(subs);
      setLoading(false);
    };

    fetchSubscriptions();
  }, [user]);

  const total = useMemo(() => subscriptions.reduce((s, x) => s + x.amount, 0), [subscriptions]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-card/90 backdrop-blur-xl border border-border/30 shadow-lg shadow-black/20 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-28 bg-muted/30 rounded" />
          <div className="h-3 w-48 bg-muted/20 rounded" />
          <div className="h-8 w-full bg-muted/10 rounded" />
        </div>
      </div>
    );
  }

  if (subscriptions.length === 0) return null;

  return (
    <div className="rounded-2xl bg-card/90 backdrop-blur-xl border border-border/30 shadow-lg shadow-black/20 overflow-hidden">
      <div className="px-4 pt-3.5 pb-1.5">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
            Recorrentes
          </span>
        </div>
        <h2 className="text-sm font-bold text-foreground mt-1.5">Assinaturas</h2>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
          Seus gastos fixos e recorrentes
        </p>
      </div>

      <div className="px-4 pb-1 mt-1">
        <AnimatePresence>
          {subscriptions.map((sub, idx) => {
            const icon = guessIcon(sub.name, sub.category);
            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-center gap-3 py-2.5 border-b border-border/10 last:border-b-0"
              >
                <span className="text-base shrink-0">{icon}</span>
                <span className="text-[12px] font-medium text-foreground/90 flex-1 truncate">
                  {sub.name}
                </span>
                <span className="text-[10px] text-muted-foreground/50 mr-1 tabular-nums shrink-0">
                  Dia {sub.dueDay}
                </span>
                <span className="text-[12px] font-bold text-primary tabular-nums shrink-0">
                  {fmt(sub.amount)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/15">
        <span className="text-[10px] text-muted-foreground/50">Total/mês</span>
        <span className="text-[13px] font-bold text-primary tabular-nums">{fmt(total)}</span>
      </div>
    </div>
  );
});

AssinaturasCard.displayName = "AssinaturasCard";
export default AssinaturasCard;
