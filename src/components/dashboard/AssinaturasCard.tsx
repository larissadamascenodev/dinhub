import { memo, useEffect, useState, useMemo } from "react";
import { ChevronRight, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultCategoryIcon } from "@/lib/categoryIcons";

type RecurringType = "despesa" | "receita";

interface Subscription {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  source: "conta" | "cartao";
  txType: RecurringType;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Known brands with logo URLs (using high-quality sources)
type BrandInfo = {
  bg: string;
  fg: string;
  logo?: string; // URL to logo image
  icon?: string; // fallback text icon
};

const BRAND_MAP: Record<string, BrandInfo> = {
  netflix:        { bg: "#000000", fg: "#E50914", logo: "https://images.ctfassets.net/4cd45et68cgf/7LrExJ6PAj6MSIPkDrGdbk/c30d6fc8f5a9f1d73ac79e3fb5a2353e/Netflix-Brand-Symbol.png" },
  spotify:        { bg: "#191414", fg: "#1DB954", logo: "https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png" },
  "apple music":  { bg: "#000000", fg: "#FC3C44", logo: "https://music.apple.com/assets/knowledge-graph/music.png" },
  "youtube music":{ bg: "#000000", fg: "#FF0000", logo: "https://lh3.googleusercontent.com/z6Sl4j9zQ88oUKNy0G3PAMiVwy8DzQLh_ygyvBXv0zVNUZ_wQPN_n7EAR2By3dhoUpX7kTpaHjRPni1MHwKpaBJbpNqdEsHZsH4q" },
  youtube:        { bg: "#000000", fg: "#FF0000", logo: "https://www.youtube.com/s/desktop/29d9ee5c/img/favicon_144x144.png" },
  deezer:         { bg: "#000000", fg: "#A238FF", logo: "https://e-cdns-files.dzcdn.net/cache/slash/images/common/logos/deezer_logo_circle.png" },
  "disney+":      { bg: "#040714", fg: "#0063e5", logo: "https://cnbl-cdn.bamgrid.com/assets/7ecc8bcb60ad77193058d63e321bd21cbac2fc67/original" },
  disney:         { bg: "#040714", fg: "#0063e5", logo: "https://cnbl-cdn.bamgrid.com/assets/7ecc8bcb60ad77193058d63e321bd21cbac2fc67/original" },
  "hbo max":      { bg: "#000000", fg: "#5822B4", icon: "HBO" },
  hbo:            { bg: "#000000", fg: "#fff", icon: "HBO" },
  max:            { bg: "#002BE7", fg: "#fff", icon: "MAX" },
  "prime video":  { bg: "#00131F", fg: "#00A8E1", logo: "https://m.media-amazon.com/images/G/01/digital/video/web/Logo-sm.png" },
  "amazon prime": { bg: "#00131F", fg: "#00A8E1", logo: "https://m.media-amazon.com/images/G/01/digital/video/web/Logo-sm.png" },
  amazon:         { bg: "#131921", fg: "#FF9900", icon: "A" },
  icloud:         { bg: "#000000", fg: "#3693F3", logo: "https://www.apple.com/v/icloud/d/images/overview/icloud-storage-icon__bxnlrftjhdiq_large.png" },
  "google one":   { bg: "#000000", fg: "#4285F4", logo: "https://www.gstatic.com/images/branding/product/2x/google_one_64dp.png" },
  dropbox:        { bg: "#000000", fg: "#0061FF", icon: "DB" },
  onedrive:       { bg: "#000000", fg: "#0078D4", icon: "OD" },
  chatgpt:        { bg: "#000000", fg: "#10A37F", logo: "https://cdn.oaistatic.com/assets/apple-touch-icon-mz9nytnj.png" },
  openai:         { bg: "#000000", fg: "#10A37F", logo: "https://cdn.oaistatic.com/assets/apple-touch-icon-mz9nytnj.png" },
  academia:       { bg: "#1a1a2e", fg: "#FF6B35" },
  "smart fit":    { bg: "#000000", fg: "#FFD100", icon: "SF" },
  smartfit:       { bg: "#000000", fg: "#FFD100", icon: "SF" },
  bluefit:        { bg: "#000000", fg: "#0077C8", icon: "BF" },
  claro:          { bg: "#000000", fg: "#ED1C24", icon: "C" },
  vivo:           { bg: "#1B003A", fg: "#660099", logo: "https://appvivo.vivo.com.br/images/icons/vivo-icon-192x192.png" },
  tim:            { bg: "#000000", fg: "#004B93", icon: "TIM" },
  uber:           { bg: "#000000", fg: "#fff", logo: "https://d1a3f4spazzrp4.cloudfront.net/uber-com/1.3.8/d1a3f4spazzrp4.cloudfront.net/icons/uber_home_UberLogo_night_192x192.png" },
  "99":           { bg: "#000000", fg: "#FFCB05", icon: "99" },
  ifood:          { bg: "#000000", fg: "#EA1D2C", logo: "https://static.ifood-static.com.br/image/upload/t_high/webapp/landing/landing-logo-ifood.png" },
  rappi:          { bg: "#000000", fg: "#FF441F", icon: "R" },
  nubank:         { bg: "#1A0533", fg: "#8A05BE", logo: "https://nubank.com.br/images-cms/1652883558-nu-icon.png" },
  xbox:           { bg: "#000000", fg: "#107C10", icon: "X" },
  playstation:    { bg: "#000000", fg: "#003087", icon: "PS" },
  psn:            { bg: "#000000", fg: "#003087", icon: "PS" },
  "game pass":    { bg: "#000000", fg: "#107C10", icon: "GP" },
  canva:          { bg: "#000000", fg: "#00C4CC", icon: "Ca" },
  notion:         { bg: "#000000", fg: "#fff", icon: "N" },
  figma:          { bg: "#000000", fg: "#F24E1E", icon: "F" },
  github:         { bg: "#000000", fg: "#fff", logo: "https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png" },
  globoplay:      { bg: "#000000", fg: "#E21B22", icon: "G" },
  crunchyroll:    { bg: "#000000", fg: "#F47521", icon: "CR" },
  paramount:      { bg: "#000000", fg: "#0064FF", icon: "P+" },
  "star+":        { bg: "#000000", fg: "#fff", icon: "S+" },
  twitch:         { bg: "#000000", fg: "#9146FF", logo: "https://static.twitchcdn.net/assets/mobile_iphone-526a7948e69b1a48.png" },
};

function getBrand(name: string): BrandInfo & { matched: boolean } {
  const n = name.toLowerCase().trim();
  for (const [key, val] of Object.entries(BRAND_MAP)) {
    if (n.includes(key)) return { ...val, matched: true };
  }
  return { bg: "transparent", fg: "hsl(var(--primary))", matched: false };
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

/** Renders brand logo or category-style Lucide icon */
const BrandIcon = ({ name, category, brand }: { name: string; category: string; brand: BrandInfo & { matched: boolean } }) => {
  const [imgError, setImgError] = useState(false);

  // Known brand with logo URL
  if (brand.matched && brand.logo && !imgError) {
    return (
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md overflow-hidden"
        style={{ background: brand.bg }}
      >
        <img
          src={brand.logo}
          alt={name}
          className="w-6 h-6 object-contain"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Known brand with text icon (no logo URL or image failed)
  if (brand.matched) {
    return (
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md"
        style={{ background: brand.bg, color: brand.fg }}
      >
        <span className="text-[11px] font-black leading-none">{brand.icon || name.charAt(0).toUpperCase()}</span>
      </div>
    );
  }

  // Fallback: use the Lucide category icon (same style as categories page)
  const IconComponent = getDefaultCategoryIcon(category);
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md bg-primary/10">
      <IconComponent className="w-5 h-5 text-primary" />
    </div>
  );
};

const AssinaturasCard = memo(() => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<RecurringType>("despesa");

  useEffect(() => {
    if (!user) return;

    const fetchSubs = async () => {
      setLoading(true);

      const { data: txs } = await supabase
        .from("transactions")
        .select("id, name, amount, date, category, payment_method, credit_card_id, type")
        .eq("user_id", user.id)
        .eq("recurrence_type", "fixa");

      if (!txs) { setLoading(false); return; }

      const seen = new Map<string, typeof txs[0]>();
      for (const tx of txs) {
        const key = `${tx.type}-${tx.name.toLowerCase().trim()}`;
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
        source: tx.payment_method === "cartao" ? "cartao" as const : "conta" as const,
        txType: tx.type as RecurringType,
      }));

      subs.sort((a, b) => getDaysUntil(a.dueDay) - getDaysUntil(b.dueDay));

      setSubscriptions(subs);
      setLoading(false);
    };

    fetchSubs();
  }, [user]);

  const filtered = useMemo(() => subscriptions.filter((s) => s.txType === activeTab), [subscriptions, activeTab]);
  const total = useMemo(() => filtered.reduce((s, x) => s + x.amount, 0), [filtered]);
  const despesaCount = useMemo(() => subscriptions.filter((s) => s.txType === "despesa").length, [subscriptions]);
  const receitaCount = useMemo(() => subscriptions.filter((s) => s.txType === "receita").length, [subscriptions]);

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

  const displaySubs = expanded ? filtered : filtered.slice(0, 3);
  const hasMore = filtered.length > 3;

  return (
    <div className="rounded-2xl bg-card/90 backdrop-blur-xl border border-border/30 shadow-lg shadow-black/20 overflow-hidden">
      {/* Header with total */}
      <div className="flex items-start justify-between px-4 pt-3.5 pb-1">
        <div>
          <h2 className="text-sm font-bold text-foreground">Recorrentes</h2>
          <p className="text-[10px] text-muted-foreground/50 mt-0.5">Seus gastos fixos mensais</p>
        </div>
        <div className="text-right pt-1">
          <p className="text-[10px] text-muted-foreground/50">Total/mês</p>
          <p className="text-[15px] font-bold text-primary tabular-nums">{fmt(total)}</p>
        </div>
      </div>

      {/* Cards list */}
      <div className="px-3 pb-2 mt-1.5 space-y-2">
        <AnimatePresence mode="popLayout">
          {displaySubs.map((sub, idx) => {
            const brand = getBrand(sub.name);
            const days = getDaysUntil(sub.dueDay);

            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ delay: idx * 0.04, type: "spring", stiffness: 400, damping: 30 }}
                className="relative rounded-xl border border-white/[0.06] overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--card) / 0.95), hsl(var(--card) / 0.7))",
                  backdropFilter: "blur(16px)",
                }}
              >
                {/* Subtle brand glow for matched brands */}
                {brand.matched && (
                  <div
                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at 20% 50%, ${brand.fg}, transparent 70%)` }}
                  />
                )}

                <div className="relative flex items-center gap-3 px-3 py-3">
                  <BrandIcon name={sub.name} category={sub.category} brand={brand} />

                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground/90 truncate">{sub.name}</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                      Dia {sub.dueDay} · {days === 0 ? "Hoje" : days === 1 ? "Amanhã" : `Em ${days} dias`}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-bold text-foreground tabular-nums">{fmt(sub.amount)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Ver todos / Recolher */}
      {hasMore && (
        <div className="px-4 pb-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-center gap-1 text-[11px] text-primary font-semibold py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
          >
            {expanded ? (
              <>Recolher <ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <>Ver todos ({subscriptions.length}) <ChevronRight className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
});

AssinaturasCard.displayName = "AssinaturasCard";
export default AssinaturasCard;
