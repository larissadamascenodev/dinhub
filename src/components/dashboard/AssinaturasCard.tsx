import { memo, useEffect, useState, useMemo } from "react";
import { ChevronRight, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Subscription {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  source: "conta" | "cartao";
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Brand colors & initials for known services
const BRAND_MAP: Record<string, { bg: string; fg: string; icon: string }> = {
  netflix:   { bg: "#E50914", fg: "#fff", icon: "N" },
  spotify:   { bg: "#1DB954", fg: "#fff", icon: "♫" },
  "apple music": { bg: "#FC3C44", fg: "#fff", icon: "♪" },
  "youtube music": { bg: "#FF0000", fg: "#fff", icon: "▶" },
  youtube:   { bg: "#FF0000", fg: "#fff", icon: "▶" },
  deezer:    { bg: "#A238FF", fg: "#fff", icon: "♫" },
  "disney+": { bg: "#113CCF", fg: "#fff", icon: "D+" },
  disney:    { bg: "#113CCF", fg: "#fff", icon: "D+" },
  "hbo max": { bg: "#5822B4", fg: "#fff", icon: "H" },
  hbo:       { bg: "#5822B4", fg: "#fff", icon: "H" },
  max:       { bg: "#002BE7", fg: "#fff", icon: "M" },
  "prime video": { bg: "#00A8E1", fg: "#fff", icon: "▶" },
  "amazon prime": { bg: "#00A8E1", fg: "#fff", icon: "▶" },
  amazon:    { bg: "#FF9900", fg: "#111", icon: "A" },
  icloud:    { bg: "#3693F3", fg: "#fff", icon: "☁" },
  "google one": { bg: "#4285F4", fg: "#fff", icon: "G" },
  dropbox:   { bg: "#0061FF", fg: "#fff", icon: "D" },
  onedrive:  { bg: "#0078D4", fg: "#fff", icon: "O" },
  chatgpt:   { bg: "#10A37F", fg: "#fff", icon: "G" },
  openai:    { bg: "#10A37F", fg: "#fff", icon: "AI" },
  academia:  { bg: "#FF6B35", fg: "#fff", icon: "💪" },
  "smart fit": { bg: "#FFD100", fg: "#111", icon: "S" },
  smartfit:  { bg: "#FFD100", fg: "#111", icon: "S" },
  bluefit:   { bg: "#0077C8", fg: "#fff", icon: "B" },
  claro:     { bg: "#ED1C24", fg: "#fff", icon: "C" },
  vivo:      { bg: "#660099", fg: "#fff", icon: "V" },
  tim:       { bg: "#004B93", fg: "#fff", icon: "T" },
  uber:      { bg: "#000000", fg: "#fff", icon: "U" },
  "99":      { bg: "#FFCB05", fg: "#111", icon: "99" },
  ifood:     { bg: "#EA1D2C", fg: "#fff", icon: "iF" },
  rappi:     { bg: "#FF441F", fg: "#fff", icon: "R" },
  nubank:    { bg: "#8A05BE", fg: "#fff", icon: "Nu" },
  xbox:      { bg: "#107C10", fg: "#fff", icon: "X" },
  playstation: { bg: "#003087", fg: "#fff", icon: "PS" },
  psn:       { bg: "#003087", fg: "#fff", icon: "PS" },
  "game pass": { bg: "#107C10", fg: "#fff", icon: "GP" },
  canva:     { bg: "#00C4CC", fg: "#fff", icon: "C" },
  notion:    { bg: "#000000", fg: "#fff", icon: "N" },
  figma:     { bg: "#F24E1E", fg: "#fff", icon: "F" },
  github:    { bg: "#181717", fg: "#fff", icon: "GH" },
  globoplay: { bg: "#E21B22", fg: "#fff", icon: "G" },
  crunchyroll: { bg: "#F47521", fg: "#fff", icon: "CR" },
  paramount: { bg: "#0064FF", fg: "#fff", icon: "P+" },
  "star+":   { bg: "#032541", fg: "#fff", icon: "S+" },
  twitch:    { bg: "#9146FF", fg: "#fff", icon: "T" },
};

function getBrand(name: string) {
  const n = name.toLowerCase().trim();
  for (const [key, val] of Object.entries(BRAND_MAP)) {
    if (n.includes(key)) return val;
  }
  // Fallback: generate from first letter with accent color
  return {
    bg: "hsl(var(--primary) / 0.15)",
    fg: "hsl(var(--primary))",
    icon: name.charAt(0).toUpperCase(),
  };
}

function getDaysUntil(dueDay: number): number {
  const now = new Date();
  const today = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let nextDue: Date;
  if (dueDay >= today) {
    nextDue = new Date(currentYear, currentMonth, dueDay);
  } else {
    nextDue = new Date(currentYear, currentMonth + 1, dueDay);
  }

  const diff = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

const AssinaturasCard = memo(() => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      setLoading(true);

      const { data: txs } = await supabase
        .from("transactions")
        .select("id, name, amount, date, category, payment_method, credit_card_id")
        .eq("user_id", user.id)
        .eq("recurrence_type", "fixa")
        .eq("type", "despesa");

      if (!txs) { setLoading(false); return; }

      const seen = new Map<string, typeof txs[0]>();
      for (const tx of txs) {
        const key = tx.name.toLowerCase().trim();
        if (!seen.has(key) || tx.date < seen.get(key)!.date) {
          seen.set(key, tx);
        }
      }

      const subs: Subscription[] = Array.from(seen.values()).map((tx) => ({
        id: tx.id,
        name: tx.name,
        amount: Number(tx.amount),
        dueDay: new Date(tx.date + "T12:00:00").getDate(),
        category: tx.category,
        source: tx.payment_method === "cartao" ? "cartao" : "conta",
      }));

      subs.sort((a, b) => {
        const da = getDaysUntil(a.dueDay);
        const db = getDaysUntil(b.dueDay);
        return da - db;
      });

      setSubscriptions(subs);
      setLoading(false);
    };

    fetch();
  }, [user]);

  const total = useMemo(() => subscriptions.reduce((s, x) => s + x.amount, 0), [subscriptions]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-card/90 backdrop-blur-xl border border-border/30 shadow-lg shadow-black/20 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-28 bg-muted/30 rounded" />
          <div className="h-20 w-full bg-muted/10 rounded-xl" />
        </div>
      </div>
    );
  }

  if (subscriptions.length === 0) return null;

  return (
    <div className="rounded-2xl bg-card/90 backdrop-blur-xl border border-border/30 shadow-lg shadow-black/20 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-3.5 pb-1">
        <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
          Recorrentes
        </span>
        <h2 className="text-sm font-bold text-foreground mt-1.5">Assinaturas</h2>
        <p className="text-[10px] text-muted-foreground/50 mt-0.5">Seus gastos fixos e recorrentes</p>
      </div>

      {/* Cards list */}
      <div className="px-3 pb-2 mt-1.5 space-y-2">
        <AnimatePresence>
          {subscriptions.map((sub, idx) => {
            const brand = getBrand(sub.name);
            const days = getDaysUntil(sub.dueDay);
            const isFallback = brand.bg.startsWith("hsl");

            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, type: "spring", stiffness: 400, damping: 30 }}
                className="relative rounded-xl border border-white/[0.06] overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--card) / 0.95), hsl(var(--card) / 0.7))",
                  backdropFilter: "blur(16px)",
                }}
              >
                {/* Subtle brand glow */}
                {!isFallback && (
                  <div
                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at 20% 50%, ${brand.bg}, transparent 70%)` }}
                  />
                )}

                <div className="relative flex items-center gap-3 px-3 py-3">
                  {/* Brand icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                    style={{
                      background: isFallback ? brand.bg : brand.bg,
                      color: brand.fg,
                    }}
                  >
                    <span className="text-sm font-black leading-none">{brand.icon}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground/90 truncate">{sub.name}</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                      Dia {sub.dueDay} · {days === 0 ? "Hoje" : days === 1 ? "Amanhã" : `Em ${days} dias`}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-bold text-foreground tabular-nums">{fmt(sub.amount)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/15">
        <span className="text-[10px] text-muted-foreground/50">Total/mês</span>
        <span className="text-[13px] font-bold text-primary tabular-nums">{fmt(total)}</span>
      </div>
    </div>
  );
});

AssinaturasCard.displayName = "AssinaturasCard";
export default AssinaturasCard;
