import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Plus, X, Landmark, Banknote, PiggyBank, TrendingUp, ChevronRight, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getAccounts, createAccount, getCreditCards, createCreditCard } from "@/services/transactionService";
import { cn } from "@/lib/utils";

interface Account {
  id: string;
  name: string;
  type: string;
  is_default: boolean;
  current_balance: number;
  initial_balance: number;
  color: string | null;
}

interface CreditCardItem {
  id: string;
  name: string;
  limit: number;
  used_limit: number;
  closing_day: number;
  due_day: number;
  color: string | null;
  last_four_digits: string | null;
}

const ACCOUNT_TYPE_LABELS: Record<string, { label: string; icon: typeof Landmark }> = {
  cash: { label: "Dinheiro", icon: Banknote },
  checking: { label: "Conta corrente", icon: Landmark },
  savings: { label: "Poupança", icon: PiggyBank },
  investment: { label: "Investimento", icon: Briefcase },
};

const COLOR_OPTIONS = [
  { value: "violet", label: "Roxo", bg: "from-violet-700/80 to-violet-950/90", accent: "bg-violet-500" },
  { value: "emerald", label: "Verde", bg: "from-emerald-700/80 to-emerald-950/90", accent: "bg-emerald-500" },
  { value: "sky", label: "Azul", bg: "from-sky-700/80 to-sky-950/90", accent: "bg-sky-500" },
  { value: "amber", label: "Laranja", bg: "from-amber-700/80 to-amber-950/90", accent: "bg-amber-500" },
  { value: "rose", label: "Rosa", bg: "from-rose-700/80 to-rose-950/90", accent: "bg-rose-500" },
  { value: "cyan", label: "Ciano", bg: "from-cyan-700/80 to-cyan-950/90", accent: "bg-cyan-500" },
  { value: "fuchsia", label: "Fúcsia", bg: "from-fuchsia-700/80 to-fuchsia-950/90", accent: "bg-fuchsia-500" },
  { value: "lime", label: "Lima", bg: "from-lime-700/80 to-lime-950/90", accent: "bg-lime-500" },
];

function getGradient(color: string | null): string {
  const found = COLOR_OPTIONS.find((c) => c.value === color);
  return found?.bg ?? COLOR_OPTIONS[0].bg;
}

const ACCENT_MAP: Record<string, { border: string; iconBg: string; dot: string }> = {
  violet: { border: "border-violet-500/25", iconBg: "bg-violet-500/15", dot: "bg-violet-400" },
  emerald: { border: "border-emerald-500/25", iconBg: "bg-emerald-500/15", dot: "bg-emerald-400" },
  sky: { border: "border-sky-500/25", iconBg: "bg-sky-500/15", dot: "bg-sky-400" },
  amber: { border: "border-amber-500/25", iconBg: "bg-amber-500/15", dot: "bg-amber-400" },
  rose: { border: "border-rose-500/25", iconBg: "bg-rose-500/15", dot: "bg-rose-400" },
  cyan: { border: "border-cyan-500/25", iconBg: "bg-cyan-500/15", dot: "bg-cyan-400" },
  fuchsia: { border: "border-fuchsia-500/25", iconBg: "bg-fuchsia-500/15", dot: "bg-fuchsia-400" },
  lime: { border: "border-lime-500/25", iconBg: "bg-lime-500/15", dot: "bg-lime-400" },
};

function getAccent(color: string | null) {
  return ACCENT_MAP[color ?? "violet"] ?? ACCENT_MAP.violet;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* ══════════════════════════════════════════════
   Modal overlay shared by account & card forms
   ══════════════════════════════════════════════ */
const ModalOverlay = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
      >
        {/* backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative z-10 w-full max-w-md rounded-2xl bg-card border border-border/40 p-6 shadow-2xl"
        >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const GestaoFinanceira = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCardItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [accountsRef] = useEmblaCarousel({ loop: false, align: "start", dragFree: true, containScroll: "trimSnaps" });
  const [cardsRef] = useEmblaCarousel({ loop: false, align: "start", dragFree: true, containScroll: "trimSnaps" });

  // Add account state
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccName, setNewAccName] = useState("");
  const [newAccType, setNewAccType] = useState<"checking" | "cash" | "savings">("checking");
  const [newAccBalance, setNewAccBalance] = useState("");
  const [newAccColor, setNewAccColor] = useState("violet");

  // Add card state
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [newCardLimit, setNewCardLimit] = useState("");
  const [newCardClosing, setNewCardClosing] = useState("10");
  const [newCardDue, setNewCardDue] = useState("20");
  const [newCardColor, setNewCardColor] = useState("emerald");
  const [newCardDigits, setNewCardDigits] = useState("");

  const fetchData = async () => {
    if (!user) return;
    try {
      const [accs, cards] = await Promise.all([getAccounts(), getCreditCards()]);
      setAccounts(accs as unknown as Account[]);
      setCreditCards(cards as unknown as CreditCardItem[]);
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const resetAddAccount = () => {
    setShowAddAccount(false);
    setNewAccName("");
    setNewAccType("checking");
    setNewAccBalance("");
    setNewAccColor("violet");
  };

  const resetAddCard = () => {
    setShowAddCard(false);
    setNewCardName("");
    setNewCardLimit("");
    setNewCardClosing("10");
    setNewCardDue("20");
    setNewCardColor("emerald");
    setNewCardDigits("");
  };

  const handleAddAccount = async () => {
    if (!user || !newAccName.trim()) return;
    try {
      await createAccount(user.id, {
        name: newAccName.trim(),
        type: newAccType,
        initial_balance: newAccBalance ? parseFloat(newAccBalance) : 0,
        color: newAccColor,
      });
      toast.success("Conta criada!");
      resetAddAccount();
      fetchData();
    } catch {
      toast.error("Erro ao criar conta");
    }
  };

  const handleAddCard = async () => {
    if (!user || !newCardName.trim() || !newCardLimit) return;
    try {
      await createCreditCard(
        {
          name: newCardName.trim(),
          limit: parseFloat(newCardLimit),
          closing_day: parseInt(newCardClosing),
          due_day: parseInt(newCardDue),
          color: newCardColor,
          last_four_digits: newCardDigits.trim() || null,
        },
        user.id
      );
      toast.success("Cartão cadastrado!");
      resetAddCard();
      fetchData();
    } catch {
      toast.error("Erro ao criar cartão");
    }
  };

  return (
    <div className="pt-2 pb-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Carteira</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gerencie suas contas, cartões e assinaturas</p>
      </div>

      {/* ═══════ Contas Bancárias ═══════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Landmark className="w-4 h-4 text-primary" />
            Contas Bancárias
          </h2>
          <button
            onClick={() => setShowAddAccount(true)}
            className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-4 h-4 text-primary" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="rounded-2xl bg-card/60 backdrop-blur-sm border border-border/20 p-8 text-center">
            <Landmark className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">Nenhuma conta cadastrada</p>
            <p className="text-xs text-muted-foreground/60 mb-4">Crie sua primeira conta para começar</p>
            <Button
              onClick={() => setShowAddAccount(true)}
              size="sm"
              className="rounded-xl bg-primary/15 text-primary hover:bg-primary/25 border-0"
            >
              <Plus className="w-4 h-4 mr-1" /> Criar Conta
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile carousel */}
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide sm:hidden -mx-4 px-4">
              {accounts.filter((a) => a.type !== "investment").map((acc, idx) => {
                const typeInfo = ACCOUNT_TYPE_LABELS[acc.type] ?? ACCOUNT_TYPE_LABELS.checking;
                const Icon = typeInfo.icon;
                const gradient = getGradient(acc.color);
                const balance = Number(acc.current_balance);
                const isPositive = balance >= 0;

                const accent = getAccent(acc.color);

                return (
                  <motion.div
                    key={acc.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    onClick={() => navigate(`/conta/${acc.id}`)}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group snap-start shrink-0 w-[78vw] max-w-[290px] bg-background/60 backdrop-blur-xl border border-border/15 hover:border-primary/20 transition-all duration-300 active:scale-[0.98]"
                  >
                    {/* Top accent gradient */}
                    <div className={cn("absolute top-0 left-0 right-0 h-[3px]", accent.dot)} />

                    {/* Watermark icon */}
                    <Icon className="absolute right-3 bottom-3 w-16 h-16 text-foreground/[0.03]" />

                    <div className="relative z-10 p-4 flex flex-col min-h-[152px]">
                      {/* Header */}
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center ring-1 ring-border/10", accent.iconBg)}>
                          <Icon className="w-[18px] h-[18px] text-foreground/70" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-foreground truncate">{acc.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-[10px] text-muted-foreground">{typeInfo.label}</p>
                            {acc.is_default && (
                              <>
                                <span className="w-[3px] h-[3px] rounded-full bg-primary/40" />
                                <span className="text-[9px] text-primary font-semibold">Principal</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Balance */}
                      <div className="mt-auto">
                        <p className="text-[9px] text-muted-foreground/70 uppercase tracking-widest font-medium mb-1">Saldo disponível</p>
                        <div className="flex items-end justify-between">
                          <p className={cn("text-[22px] font-extrabold tabular-nums tracking-tight leading-none", balance >= 0 ? "text-foreground" : "text-destructive")}>
                            {formatCurrency(balance)}
                          </p>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors mb-0.5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowAddAccount(true)}
                className="rounded-2xl p-4 min-h-[148px] w-[60vw] max-w-[200px] shrink-0 snap-start flex flex-col items-center justify-center gap-2 border-2 border-dashed border-primary/20 hover:border-primary/40 bg-primary/[0.03] transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-primary/70 font-medium">Adicionar conta</span>
              </motion.button>
            </div>

            {/* Desktop grid */}
            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {accounts.filter((a) => a.type !== "investment").map((acc, idx) => {
                const typeInfo = ACCOUNT_TYPE_LABELS[acc.type] ?? ACCOUNT_TYPE_LABELS.checking;
                const Icon = typeInfo.icon;
                const balance = Number(acc.current_balance);
                const accent = getAccent(acc.color);

                return (
                  <motion.div
                    key={acc.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    onClick={() => navigate(`/conta/${acc.id}`)}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group bg-background/60 backdrop-blur-xl border border-border/15 hover:border-primary/20 transition-all duration-300 active:scale-[0.98]"
                  >
                    <div className={cn("absolute top-0 left-0 right-0 h-[3px]", accent.dot)} />
                    <Icon className="absolute right-3 bottom-3 w-16 h-16 text-foreground/[0.03]" />
                    <div className="relative z-10 p-4 flex flex-col min-h-[152px]">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center ring-1 ring-border/10", accent.iconBg)}>
                          <Icon className="w-[18px] h-[18px] text-foreground/70" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-foreground truncate">{acc.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-[10px] text-muted-foreground">{typeInfo.label}</p>
                            {acc.is_default && (
                              <>
                                <span className="w-[3px] h-[3px] rounded-full bg-primary/40" />
                                <span className="text-[9px] text-primary font-semibold">Principal</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <p className="text-[9px] text-muted-foreground/70 uppercase tracking-widest font-medium mb-1">Saldo disponível</p>
                        <div className="flex items-end justify-between">
                          <p className={cn("text-[22px] font-extrabold tabular-nums tracking-tight leading-none", balance >= 0 ? "text-foreground" : "text-destructive")}>
                            {formatCurrency(balance)}
                          </p>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors mb-0.5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: accounts.length * 0.05 }}
                onClick={() => setShowAddAccount(true)}
                className="rounded-2xl p-4 min-h-[148px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-primary/20 hover:border-primary/40 bg-primary/[0.03] hover:bg-primary/[0.06] transition-all duration-300 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-primary/70 font-medium">Adicionar conta</span>
              </motion.button>
            </div>
          </>
        )}
      </section>

      {/* ═══════ Cartões de Crédito ═══════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Cartões de Crédito
          </h2>
          <button
            onClick={() => setShowAddCard(true)}
            className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-4 h-4 text-primary" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        ) : creditCards.length === 0 ? (
          <div className="rounded-2xl bg-card/60 backdrop-blur-sm border border-border/20 p-8 text-center">
            <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">Nenhum cartão cadastrado</p>
            <p className="text-xs text-muted-foreground/60 mb-4">Cadastre seu cartão de crédito</p>
            <Button
              onClick={() => setShowAddCard(true)}
              size="sm"
              className="rounded-xl bg-primary/15 text-primary hover:bg-primary/25 border-0"
            >
              <Plus className="w-4 h-4 mr-1" /> Cadastrar Cartão
            </Button>
          </div>
        ) : (
          <>
            {/* Mobile carousel */}
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide sm:hidden -mx-4 px-4">
              {creditCards.map((card, idx) => {
                const usedPct = card.limit > 0 ? Math.min((Number(card.used_limit) / Number(card.limit)) * 100, 100) : 0;
                const available = Math.max(Number(card.limit) - Number(card.used_limit), 0);
                const gradient = getGradient(card.color);

                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => navigate(`/fatura/${card.id}`)}
                    className={cn(
                      "relative rounded-2xl p-4 overflow-hidden bg-gradient-to-br cursor-pointer group snap-start shrink-0 w-[75vw] max-w-[280px]",
                      "border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 active:scale-[0.98]",
                      gradient
                    )}
                  >
                    <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/[0.04]" />
                    <div className="relative z-10 flex flex-col h-full min-h-[148px]">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                            <CreditCard className="w-4 h-4 text-white/80" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-bold text-white truncate">{card.name}</p>
                              <ChevronRight className="w-3.5 h-3.5 text-white/30 shrink-0" />
                            </div>
                            {card.last_four_digits && (
                              <p className="text-[10px] text-white/40">•••• {card.last_four_digits}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-auto pt-3">
                        <p className="text-[10px] text-white/50 font-medium uppercase tracking-wide mb-0.5">Disponível</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(available)}</p>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-2.5 mb-1.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${usedPct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-white/60"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-white/60">{usedPct.toFixed(0)}% usado</span>
                          <span className="text-[10px] text-white/40">Dia {card.due_day}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowAddCard(true)}
                className="rounded-2xl p-4 min-h-[148px] w-[60vw] max-w-[200px] shrink-0 snap-start flex flex-col items-center justify-center gap-2 border-2 border-dashed border-primary/20 hover:border-primary/40 bg-primary/[0.03] transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-primary/70 font-medium">Adicionar cartão</span>
              </motion.button>
            </div>

            {/* Desktop grid */}
            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {creditCards.map((card, idx) => {
                const usedPct = card.limit > 0 ? Math.min((Number(card.used_limit) / Number(card.limit)) * 100, 100) : 0;
                const available = Math.max(Number(card.limit) - Number(card.used_limit), 0);
                const gradient = getGradient(card.color);

                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => navigate(`/fatura/${card.id}`)}
                    className={cn(
                      "relative rounded-2xl p-4 overflow-hidden bg-gradient-to-br cursor-pointer group",
                      "border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 active:scale-[0.98]",
                      gradient
                    )}
                  >
                    <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/[0.04]" />
                    <div className="relative z-10 flex flex-col h-full min-h-[148px]">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                            <CreditCard className="w-4 h-4 text-white/80" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-bold text-white truncate">{card.name}</p>
                              <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors shrink-0" />
                            </div>
                            {card.last_four_digits && (
                              <p className="text-[10px] text-white/40">•••• {card.last_four_digits}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-auto pt-3">
                        <p className="text-[10px] text-white/50 font-medium uppercase tracking-wide mb-0.5">Disponível</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(available)}</p>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-2.5 mb-1.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${usedPct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-white/60"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-white/60">{usedPct.toFixed(0)}% usado</span>
                          <span className="text-[10px] text-white/40">Dia {card.due_day}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: creditCards.length * 0.05 }}
                onClick={() => setShowAddCard(true)}
                className="rounded-2xl p-4 min-h-[148px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-primary/20 hover:border-primary/40 bg-primary/[0.03] hover:bg-primary/[0.06] transition-all duration-300 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-primary/70 font-medium">Adicionar cartão</span>
              </motion.button>
            </div>
          </>
        )}
      </section>

      {/* ═══════ Carteira de Investimentos ═══════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Investimentos
          </h2>
          <button
            onClick={() => {
              setNewAccType("investment" as any);
              setShowAddAccount(true);
            }}
            className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-4 h-4 text-primary" />
          </button>
        </div>

        {(() => {
          const investmentAccounts = accounts.filter((a) => a.type === "investment");
          const totalInvested = investmentAccounts.reduce((s, a) => s + Number(a.current_balance), 0);

          if (loading) {
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <div className="h-44 rounded-2xl bg-card animate-pulse" />
              </div>
            );
          }

          if (investmentAccounts.length === 0) {
            return (
              <div className="rounded-2xl bg-card/60 backdrop-blur-sm border border-border/20 p-8 text-center">
                <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">Nenhuma carteira de investimento</p>
                <p className="text-xs text-muted-foreground/60 mb-4">Crie uma carteira para organizar seus investimentos</p>
                <Button
                  onClick={() => {
                    setNewAccType("investment" as any);
                    setShowAddAccount(true);
                  }}
                  size="sm"
                  className="rounded-xl bg-primary/15 text-primary hover:bg-primary/25 border-0"
                >
                  <Plus className="w-4 h-4 mr-1" /> Criar Carteira
                </Button>
              </div>
            );
          }

          return (
            <div className="space-y-3">
              {/* Total invested summary */}
              <div className="rounded-2xl bg-amber-500/[0.06] border border-amber-500/15 p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total investido</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(totalInvested)}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {investmentAccounts.map((acc, idx) => {
                  const gradient = getGradient(acc.color);
                  const balance = Number(acc.current_balance);

                  return (
                    <motion.div
                      key={acc.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => navigate(`/conta/${acc.id}`)}
                      className={cn(
                        "relative rounded-2xl p-4 overflow-hidden bg-gradient-to-br cursor-pointer group",
                        "border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 active:scale-[0.98]",
                        gradient
                      )}
                    >
                      <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/[0.04]" />
                      <div className="relative z-10 flex flex-col h-full min-h-[120px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                            <Briefcase className="w-4 h-4 text-white/80" />
                          </div>
                          <p className="text-sm font-bold text-white truncate">{acc.name}</p>
                        </div>
                        <div className="mt-auto pt-3">
                          <p className="text-[10px] text-white/40 font-medium uppercase tracking-wide mb-0.5">Saldo</p>
                          <p className="text-lg font-bold text-white">{formatCurrency(balance)}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </section>
      <ModalOverlay open={showAddAccount} onClose={resetAddAccount}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-foreground">Nova Conta</p>
            <button onClick={resetAddAccount} className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <Input
            placeholder="Nome do banco (ex: Nubank)"
            value={newAccName}
            onChange={(e) => setNewAccName(e.target.value)}
            className="bg-muted/30 border-border/20 h-11 rounded-xl"
          />
          <Select value={newAccType} onValueChange={(v) => setNewAccType(v as any)}>
            <SelectTrigger className="bg-muted/30 border-border/20 h-11 rounded-xl">
              <SelectValue placeholder="Tipo de conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="checking">Conta Corrente</SelectItem>
              <SelectItem value="savings">Poupança</SelectItem>
              <SelectItem value="cash">Dinheiro</SelectItem>
            </SelectContent>
          </Select>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Saldo inicial (opcional)</Label>
            <Input
              placeholder="0,00"
              type="number"
              value={newAccBalance}
              onChange={(e) => setNewAccBalance(e.target.value)}
              className="bg-muted/30 border-border/20 h-11 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Cor do cartão</Label>
            <div className="flex flex-wrap gap-2 items-center">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setNewAccColor(c.value)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all duration-200",
                    c.accent,
                    newAccColor === c.value && !newAccColor.startsWith("#")
                      ? "ring-2 ring-white ring-offset-2 ring-offset-card scale-110"
                      : "opacity-60 hover:opacity-100"
                  )}
                  title={c.label}
                />
              ))}
              {/* Custom color picker */}
              <label
                className={cn(
                  "w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-muted-foreground/60 transition-all overflow-hidden",
                  newAccColor.startsWith("#") && "ring-2 ring-white ring-offset-2 ring-offset-card scale-110 border-0"
                )}
                style={newAccColor.startsWith("#") ? { background: newAccColor } : undefined}
                title="Cor personalizada"
              >
                {!newAccColor.startsWith("#") && <Plus className="w-3.5 h-3.5 text-muted-foreground/50" />}
                <input
                  type="color"
                  className="sr-only"
                  onChange={(e) => setNewAccColor(e.target.value)}
                />
              </label>
            </div>
          </div>
          <Button
            onClick={handleAddAccount}
            disabled={!newAccName.trim()}
            className="w-full h-11 rounded-xl text-sm font-semibold bg-primary/15 text-primary hover:bg-primary/25 border-0"
          >
            Criar Conta
          </Button>
        </div>
      </ModalOverlay>

      {/* ═══════ MODAL: Novo Cartão ═══════ */}
      <ModalOverlay open={showAddCard} onClose={resetAddCard}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-foreground">Novo Cartão</p>
            <button onClick={resetAddCard} className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <Input
            placeholder="Nome do cartão (ex: Nubank Platinum)"
            value={newCardName}
            onChange={(e) => setNewCardName(e.target.value)}
            className="bg-muted/30 border-border/20 h-11 rounded-xl"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Limite</Label>
              <Input
                placeholder="5000"
                type="number"
                value={newCardLimit}
                onChange={(e) => setNewCardLimit(e.target.value)}
                className="bg-muted/30 border-border/20 h-10 text-sm rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">4 últimos dígitos</Label>
              <Input
                placeholder="1234"
                maxLength={4}
                value={newCardDigits}
                onChange={(e) => setNewCardDigits(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="bg-muted/30 border-border/20 h-10 text-sm rounded-xl"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Dia do fechamento</Label>
              <Input
                type="number" min={1} max={31}
                value={newCardClosing}
                onChange={(e) => setNewCardClosing(e.target.value)}
                className="bg-muted/30 border-border/20 h-10 text-sm rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Dia do vencimento</Label>
              <Input
                type="number" min={1} max={31}
                value={newCardDue}
                onChange={(e) => setNewCardDue(e.target.value)}
                className="bg-muted/30 border-border/20 h-10 text-sm rounded-xl"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Cor do cartão</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setNewCardColor(c.value)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all duration-200",
                    c.accent,
                    newCardColor === c.value
                      ? "ring-2 ring-white ring-offset-2 ring-offset-card scale-110"
                      : "opacity-60 hover:opacity-100"
                  )}
                  title={c.label}
                />
              ))}
            </div>
          </div>
          <Button
            onClick={handleAddCard}
            disabled={!newCardName.trim() || !newCardLimit}
            className="w-full h-11 rounded-xl text-sm font-semibold"
          >
            Cadastrar Cartão
          </Button>
        </div>
      </ModalOverlay>
    </div>
  );
};

export default GestaoFinanceira;
