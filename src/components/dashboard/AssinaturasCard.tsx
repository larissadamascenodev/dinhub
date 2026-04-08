import { memo, useEffect, useState, useMemo, useCallback } from "react";
import { ChevronRight, ChevronUp, Pencil, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getCategoryIcon } from "@/lib/categoryUtils";
import { getCustomCategories, type CustomCategory } from "@/services/categoryService";
import { deleteTransaction, getTransactionById } from "@/services/transactionService";
import { toast } from "sonner";

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

type BrandInfo = {
  bg: string;
  fg: string;
  logo?: string;
  icon?: string;
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
  "paramount+":   { bg: "#000000", fg: "#0064FF", icon: "P+" },
  "star+":        { bg: "#000000", fg: "#fff", icon: "S+" },
  twitch:         { bg: "#000000", fg: "#9146FF", logo: "https://static.twitchcdn.net/assets/mobile_iphone-526a7948e69b1a48.png" },
  kwai:           { bg: "#000000", fg: "#FF4906", icon: "K" },
  tiktok:         { bg: "#000000", fg: "#fff", icon: "TT" },
  telegram:       { bg: "#000000", fg: "#26A5E4", icon: "TG" },
  whatsapp:       { bg: "#000000", fg: "#25D366", icon: "WA" },
  linkedin:       { bg: "#000000", fg: "#0A66C2", icon: "In" },
  "apple tv":     { bg: "#000000", fg: "#fff", icon: "TV" },
  "apple tv+":    { bg: "#000000", fg: "#fff", icon: "TV" },
  mubi:           { bg: "#000000", fg: "#fff", icon: "M" },
  starzplay:      { bg: "#000000", fg: "#D4A017", icon: "SZ" },
  starz:          { bg: "#000000", fg: "#D4A017", icon: "SZ" },
  "lionsgate+":   { bg: "#000000", fg: "#F5A623", icon: "LG" },
  pluto:          { bg: "#000000", fg: "#fff", icon: "PT" },
  "pluto tv":     { bg: "#000000", fg: "#fff", icon: "PT" },
  duolingo:       { bg: "#000000", fg: "#58CC02", icon: "DL" },
  coursera:       { bg: "#000000", fg: "#0056D2", icon: "Co" },
  udemy:          { bg: "#000000", fg: "#A435F0", icon: "U" },
  alura:          { bg: "#000000", fg: "#0056FF", icon: "Al" },
  hotmart:        { bg: "#000000", fg: "#F04E23", icon: "HM" },
  mercado:        { bg: "#000000", fg: "#FFE600", icon: "ML" },
  "mercado livre": { bg: "#000000", fg: "#FFE600", icon: "ML" },
  shopee:         { bg: "#000000", fg: "#EE4D2D", icon: "Sh" },
  shein:          { bg: "#000000", fg: "#fff", icon: "SH" },
  magalu:         { bg: "#000000", fg: "#0086FF", icon: "MG" },
  "magazine luiza": { bg: "#000000", fg: "#0086FF", icon: "MG" },
  gympass:        { bg: "#000000", fg: "#D4FF00", icon: "GP" },
  wellhub:        { bg: "#000000", fg: "#D4FF00", icon: "WH" },
  totalpass:      { bg: "#000000", fg: "#FF6B00", icon: "TP" },
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

const BrandIcon = ({ name, category, brand, customCategories }: { name: string; category: string; brand: BrandInfo & { matched: boolean }; customCategories?: CustomCategory[] }) => {
  const [imgError, setImgError] = useState(false);

  if (brand.matched && brand.logo && !imgError) {
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md overflow-hidden" style={{ background: brand.bg }}>
        <img src={brand.logo} alt={name} className="w-6 h-6 object-contain" onError={() => setImgError(true)} loading="lazy" />
      </div>
    );
  }

  if (brand.matched) {
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md" style={{ background: brand.bg, color: brand.fg }}>
        <span className="text-[11px] font-black leading-none">{brand.icon || name.charAt(0).toUpperCase()}</span>
      </div>
    );
  }

  const IconComponent = getCategoryIcon(category, customCategories);
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md bg-primary/10">
      <IconComponent className="w-5 h-5 text-primary" />
    </div>
  );
};

const AssinaturasCard = memo(() => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customCats, setCustomCats] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<RecurringType>("despesa");

  // Action sheet state
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchSubs = useCallback(async () => {
    if (!user) return;
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
  }, [user]);

  useEffect(() => { fetchSubs(); getCustomCategories().then(setCustomCats).catch(() => {}); }, [fetchSubs]);

  // Listen for finance changes to refresh
  useEffect(() => {
    const handler = () => fetchSubs();
    window.addEventListener("finance-data-changed", handler);
    window.addEventListener("transaction-created", handler);
    return () => {
      window.removeEventListener("finance-data-changed", handler);
      window.removeEventListener("transaction-created", handler);
    };
  }, [fetchSubs]);

  const handleEdit = useCallback(async (sub: Subscription) => {
    setShowActions(false);
    try {
      const tx = await getTransactionById(sub.id);
      window.dispatchEvent(new CustomEvent("edit-transaction", {
        detail: {
          id: tx.id,
          name: tx.name,
          type: tx.type,
          amount: Number(tx.amount),
          category: tx.category,
          date: tx.date,
          status: tx.status,
          payment_method: tx.payment_method,
          account_id: tx.account_id,
          credit_card_id: tx.credit_card_id,
          recurrence_type: tx.recurrence_type,
          installments: tx.installments,
          installment_current: tx.installment_current,
          observation: tx.observation,
        },
      }));
    } catch {
      toast.error("Erro ao carregar transação");
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!selectedSub) return;
    setDeleting(true);
    try {
      await deleteTransaction(selectedSub.id);
      toast.success(`"${selectedSub.name}" removida com sucesso`);
      setShowDeleteConfirm(false);
      setShowActions(false);
      setSelectedSub(null);
      fetchSubs();
    } catch {
      toast.error("Erro ao excluir recorrência");
    } finally {
      setDeleting(false);
    }
  }, [selectedSub, fetchSubs]);

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
    <>
      <div className="rounded-2xl bg-card/90 backdrop-blur-xl border border-border/30 shadow-lg shadow-black/20 overflow-hidden">
        {/* Header with total */}
        <div className="flex items-start justify-between px-4 pt-3.5 pb-1">
          <div>
            <h2 className="text-sm font-bold text-foreground">Recorrentes</h2>
            <p className="text-[10px] text-muted-foreground/50 mt-0.5">Seus gastos fixos mensais</p>
          </div>
          <div className="text-right pt-1">
            <p className="text-[10px] text-muted-foreground/50">Total/mês</p>
            <p className={`text-[15px] font-bold tabular-nums ${activeTab === "receita" ? "text-emerald-400" : "text-primary"}`}>{fmt(total)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 mt-1 mb-1.5">
          <div className="relative flex rounded-lg bg-muted/20 p-0.5">
            <motion.div
              className="absolute top-0.5 bottom-0.5 rounded-md bg-primary/15 border border-primary/20"
              layoutId="recorrentes-tab"
              style={{ width: "50%", left: activeTab === "despesa" ? "0%" : "50%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <button
              onClick={() => { setActiveTab("despesa"); setExpanded(false); }}
              className={`relative z-10 flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-colors ${activeTab === "despesa" ? "text-primary" : "text-muted-foreground/50"}`}
            >
              Despesas {despesaCount > 0 && <span className="ml-0.5 opacity-60">({despesaCount})</span>}
            </button>
            <button
              onClick={() => { setActiveTab("receita"); setExpanded(false); }}
              className={`relative z-10 flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-colors ${activeTab === "receita" ? "text-primary" : "text-muted-foreground/50"}`}
            >
              Receitas {receitaCount > 0 && <span className="ml-0.5 opacity-60">({receitaCount})</span>}
            </button>
          </div>
        </div>

        {/* Cards list */}
        <div className="px-3 pb-2 mt-1.5 space-y-2">
          <AnimatePresence mode="popLayout">
            {displaySubs.length > 0 ? displaySubs.map((sub, idx) => {
              const brand = getBrand(sub.name);
              const days = getDaysUntil(sub.dueDay);

              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ delay: idx * 0.04, type: "spring", stiffness: 400, damping: 30 }}
                  className="relative rounded-xl border border-white/[0.06] overflow-hidden cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-transform"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--card) / 0.95), hsl(var(--card) / 0.7))",
                    backdropFilter: "blur(16px)",
                  }}
                  onClick={() => { setSelectedSub(sub); setShowActions(true); }}
                >

                  <div className="relative flex items-center gap-3 px-3 py-3">
                    <BrandIcon name={sub.name} category={sub.category} brand={brand} customCategories={customCats} />

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
            }) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-[11px] text-muted-foreground/40 py-4"
              >
                Nenhum {activeTab === "receita" ? "receita recorrente" : "gasto recorrente"}
              </motion.p>
            )}
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
                <>Ver todos ({filtered.length}) <ChevronRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Action Sheet Modal */}
      <AnimatePresence>
        {showActions && selectedSub && !showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={() => { setShowActions(false); setSelectedSub(null); }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-card border border-border/20 shadow-2xl p-5 pb-24 sm:pb-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">{selectedSub.name}</h3>
                <button onClick={() => { setShowActions(false); setSelectedSub(null); }} className="text-muted-foreground/50 hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleEdit(selectedSub)}
                  className="w-full flex items-center gap-3 rounded-xl border border-border/15 bg-muted/10 hover:bg-muted/20 px-4 py-3.5 text-left transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Pencil className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-foreground">Editar</p>
                    <p className="text-[11px] text-muted-foreground">Alterar valor, nome ou categoria</p>
                  </div>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center gap-3 rounded-xl border border-red-500/15 bg-red-500/5 hover:bg-red-500/10 px-4 py-3.5 text-left transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-red-400">Cancelar recorrência</p>
                    <p className="text-[11px] text-muted-foreground">Remove esta e todas as futuras</p>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && selectedSub && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-card border border-border/20 shadow-2xl p-5"
            >
              <h3 className="text-sm font-bold text-foreground mb-1">Cancelar recorrência</h3>
              <p className="text-[12px] text-muted-foreground mb-5">
                Tem certeza que deseja cancelar <span className="font-semibold text-foreground">"{selectedSub.name}"</span>? Isso removerá esta transação e todas as futuras ocorrências.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 text-[12px] font-semibold py-2.5 rounded-xl bg-muted/20 hover:bg-muted/30 text-foreground transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 text-[12px] font-semibold py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 transition-colors disabled:opacity-50"
                >
                  {deleting ? "Removendo..." : "Confirmar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

AssinaturasCard.displayName = "AssinaturasCard";
export default AssinaturasCard;
