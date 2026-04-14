import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Plus, X, Landmark, Banknote, PiggyBank, ChevronRight, Wallet, Brain, Calendar, CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCachedDashboardData, buildDashboardCacheKey } from "@/services/dashboardData";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getAccounts, createAccount, getCreditCards, createCreditCard } from "@/services/transactionService";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { fetchGoals, type Goal } from "@/services/goalService";
import AIFinancialWizardModal from "@/components/shared/AIFinancialWizardModal";

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

interface InvoiceData {
  credit_card_id: string;
  total_amount: number;
  is_paid: boolean;
  month: number;
  year: number;
  paid_amount?: number;
}

interface OpenInvoiceInfo {
  amount: number;
  month: number;
  year: number;
  isPaid: boolean;
}

function getInvoiceStatusLabel(card: CreditCardItem, invoiceInfo?: OpenInvoiceInfo): { label: string; isClosed: boolean } {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // If the invoice shown is for a future month (current month already paid), show closing date
  if (invoiceInfo && (invoiceInfo.month > currentMonth || invoiceInfo.year > currentYear || invoiceInfo.isPaid)) {
    const closingDay = card.closing_day;
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const monthLabel = monthNames[(invoiceInfo.month - 1) % 12];
    return { label: `Fecha dia ${closingDay} de ${monthLabel}`, isClosed: false };
  }

  const today = now.getDate();
  const closingDay = card.closing_day;
  const dueDay = card.due_day;

  if (today >= closingDay) {
    let dueDate: Date;
    if (dueDay > closingDay) {
      dueDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
    } else {
      dueDate = new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
    }
    const diffMs = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: `Venceu há ${Math.abs(diffDays)} dias`, isClosed: true };
    if (diffDays === 0) return { label: "Vence hoje", isClosed: true };
    if (diffDays === 1) return { label: "Vence amanhã", isClosed: true };
    return { label: `Vence em ${diffDays} dias`, isClosed: true };
  }

  const daysUntilClose = closingDay - today;
  return { label: `Fecha em ${daysUntilClose} dia${daysUntilClose > 1 ? "s" : ""}`, isClosed: false };
}

const ACCOUNT_TYPE_LABELS: Record<string, { label: string; icon: typeof Landmark }> = {
  cash: { label: "Dinheiro", icon: Banknote },
  checking: { label: "Conta corrente", icon: Landmark },
  savings: { label: "Poupança", icon: PiggyBank },
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

const GOAL_COLORS = [
  "hsl(40 90% 55%)",
  "hsl(150 100% 45%)",
  "hsl(210 80% 55%)",
  "hsl(330 80% 55%)",
  "hsl(270 70% 60%)",
  "hsl(180 70% 50%)",
];

/* ══════════════════════════════════════════════
   Credit Card Tile – shared by mobile & desktop
   ══════════════════════════════════════════════ */
const CreditCardTile = ({ card, idx, invoiceInfo, navigate, extraClass }: {
  card: CreditCardItem;
  idx: number;
  invoiceInfo?: OpenInvoiceInfo;
  navigate: (path: string) => void;
  extraClass?: string;
}) => {
  const usedValue = Number(card.used_limit);
  const limitValue = Number(card.limit);
  const usedPct = limitValue > 0 ? Math.min((usedValue / limitValue) * 100, 100) : 0;
  const available = Math.max(limitValue - usedValue, 0);
  const accent = getAccent(card.color);
  const status = getInvoiceStatusLabel(card, invoiceInfo);
  const invoiceAmount = invoiceInfo?.amount || 0;

  const barColor = usedPct >= 100 ? "bg-destructive" : usedPct >= 80 ? "bg-amber-400" : "bg-primary";
  const barTrackColor = usedPct >= 100 ? "bg-destructive/15" : usedPct >= 80 ? "bg-amber-400/15" : "bg-primary/15";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06 }}
      onClick={() => navigate(`/fatura/${card.id}`)}
      className={cn(
        "relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 active:scale-[0.98]",
        "bg-card/60 backdrop-blur-xl border border-border/15 hover:border-primary/25",
        extraClass
      )}
    >
      <div className="p-4">
        {/* Header: icon + name + chevron */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", accent.iconBg)}>
            <CreditCard className={cn("w-4 h-4", accent.dot.replace("bg-", "text-"))} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-foreground leading-tight truncate">{card.name}</p>
            {card.last_four_digits && (
              <p className="text-[10px] text-muted-foreground/40 tabular-nums mt-0.5">•••• {card.last_four_digits}</p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/20 group-hover:text-primary/50 transition-colors shrink-0" />
        </div>

        {/* Invoice highlight */}
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider leading-none mb-1">Fatura em aberto</p>
            <p className={cn(
              "text-xl font-extrabold tabular-nums leading-none tracking-tight",
              invoiceAmount > 0 ? "text-foreground" : "text-muted-foreground/25"
            )}>
              {formatCurrency(invoiceAmount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground/40 leading-none mb-1">Disponível</p>
            <p className={cn("text-sm font-bold tabular-nums leading-none", available > 0 ? "text-primary" : "text-destructive")}>
              {formatCurrency(available)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-2.5">
          <div className={cn("w-full h-1.5 rounded-full overflow-hidden", barTrackColor)}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usedPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn("h-full rounded-full", barColor)}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-muted-foreground/45 tabular-nums">
              {formatCurrency(usedValue)} / {formatCurrency(limitValue)}
            </span>
            <span className={cn("text-[10px] font-semibold tabular-nums", usedPct >= 80 ? "text-amber-400" : "text-muted-foreground/50")}>
              {usedPct.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Footer: contextual date */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/10">
          <CalendarClock className="w-3 h-3 text-muted-foreground/30 shrink-0" />
          <span className={cn("text-[10px] tabular-nums", status.isClosed ? "text-primary font-semibold" : "text-muted-foreground/50")}>
            {status.label}
          </span>
        </div>
      </div>
    </motion.div>
  );
};


const ModalOverlay = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
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
  const warmDashboardData = getCachedDashboardData(buildDashboardCacheKey(user?.id, new Date().getMonth(), new Date().getFullYear()));
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCardItem[]>([]);
  const [openInvoices, setOpenInvoices] = useState<Record<string, OpenInvoiceInfo>>({});
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(() => !warmDashboardData);

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

  // Add menu state
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAIWizard, setShowAIWizard] = useState<"meta" | null>(null);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [accs, cards, goalsData] = await Promise.all([
        getAccounts(),
        getCreditCards(),
        fetchGoals(),
      ]);
      setAccounts(accs as unknown as Account[]);
      setCreditCards(cards as unknown as CreditCardItem[]);
      setGoals(goalsData);
      setLoading(false);

      // Fetch invoices for current and next month to show next when current is paid
      const now = new Date();
      const curMonth = now.getMonth() + 1;
      const curYear = now.getFullYear();
      const nextMonth = curMonth === 12 ? 1 : curMonth + 1;
      const nextYear = curMonth === 12 ? curYear + 1 : curYear;

      const { data: invoices } = await supabase
        .from("invoices")
        .select("credit_card_id, total_amount, paid_amount, is_paid, month, year")
        .or(`and(month.eq.${curMonth},year.eq.${curYear}),and(month.eq.${nextMonth},year.eq.${nextYear})`);

      const invoiceMap: Record<string, OpenInvoiceInfo> = {};
      if (invoices) {
        // Group by card, prefer current month unpaid; if paid, show next month
        const byCard = new Map<string, InvoiceData[]>();
        for (const inv of invoices as unknown as InvoiceData[]) {
          const arr = byCard.get(inv.credit_card_id) || [];
          arr.push(inv);
          byCard.set(inv.credit_card_id, arr);
        }
        for (const [cardId, invs] of byCard.entries()) {
          const currentInv = invs.find(i => i.month === curMonth && i.year === curYear);
          const nextInv = invs.find(i => i.month === nextMonth && i.year === nextYear);

          if (currentInv && !currentInv.is_paid) {
            invoiceMap[cardId] = {
              amount: Math.max(0, Number(currentInv.total_amount) - Number(currentInv.paid_amount ?? 0)),
              month: curMonth,
              year: curYear,
              isPaid: false,
            };
          } else if (nextInv) {
            invoiceMap[cardId] = {
              amount: Math.max(0, Number(nextInv.total_amount) - Number(nextInv.paid_amount ?? 0)),
              month: nextMonth,
              year: nextYear,
              isPaid: nextInv.is_paid,
            };
          } else {
            // Current is paid and no next invoice yet — show next month with 0
            invoiceMap[cardId] = {
              amount: 0,
              month: nextMonth,
              year: nextYear,
              isPaid: false,
            };
          }
        }
      }
      setOpenInvoices(invoiceMap);
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchData();
    const onChange = () => fetchData();
    window.addEventListener("finance-data-changed", onChange);

    const channel = supabase
      .channel("gestao-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "credit_cards", filter: `user_id=eq.${user.id}` }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices", filter: `user_id=eq.${user.id}` }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "accounts", filter: `user_id=eq.${user.id}` }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "goals", filter: `user_id=eq.${user.id}` }, () => fetchData())
      .subscribe();

    return () => {
      window.removeEventListener("finance-data-changed", onChange);
      supabase.removeChannel(channel);
    };
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
      const accPayload: any = {
        name: newAccName.trim(),
        type: newAccType,
        initial_balance: newAccBalance ? parseFloat(newAccBalance) : 0,
        color: newAccColor,
      };
      await createAccount(user.id, accPayload);
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


  // ═══════ Computed values ═══════
  const bankAccounts = accounts.filter(a => a.type !== "investment");

  const saldoDisponivel = bankAccounts.reduce((s, a) => s + Number(a.current_balance), 0);
  const totalMetas = goals.reduce((s, g) => s + g.current_amount, 0);
  const patrimonioTotal = saldoDisponivel + totalMetas;

  return (
    <div className="pt-2 pb-8 space-y-6">
      {/* ═══════ Page Header ═══════ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Carteira</h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">Organize seu dinheiro de forma inteligente</p>
          </div>
        </div>
      </div>


      {/* ═══════ Contas ═══════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Landmark className="w-4 h-4 text-primary" />
              Contas
            </h2>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5 ml-6">Saldo disponível para uso</p>
          </div>
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
        ) : bankAccounts.length === 0 ? (
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
            <div className="overflow-hidden sm:hidden" ref={accountsRef}>
              <div className="flex gap-3 px-4">
              {bankAccounts.map((acc, idx) => {
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
                    className="relative rounded-2xl overflow-hidden cursor-pointer group min-w-0 shrink-0 basis-[80%] border border-primary/20 hover:border-primary/40 transition-all duration-300 active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}
                  >
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", accent.iconBg)}>
                            <Icon className={cn("w-4 h-4", accent.dot.replace("bg-", "text-"))} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground leading-tight">{acc.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{typeInfo.label}</p>
                          </div>
                        </div>
                        {acc.is_default ? (
                          <span className="text-[8px] bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider">
                            Principal
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground/25 group-hover:text-primary transition-colors" />
                        )}
                      </div>
                      <div className="h-px bg-border/10" />
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className={cn("w-1.5 h-1.5 rounded-full", balance >= 0 ? "bg-primary" : "bg-destructive")} />
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">Saldo disponível</p>
                        </div>
                        <p className={cn("text-2xl font-extrabold tabular-nums tracking-tight", balance >= 0 ? "text-foreground" : "text-destructive")}>
                          {formatCurrency(balance)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowAddAccount(true)}
                className="rounded-2xl p-4 min-h-[148px] min-w-0 shrink-0 basis-[60%] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-primary/20 hover:border-primary/40 bg-primary/[0.03] transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-primary/70 font-medium">Adicionar conta</span>
              </motion.button>
              </div>
            </div>

            {/* Desktop grid */}
            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {bankAccounts.map((acc, idx) => {
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
                    className="relative rounded-2xl overflow-hidden cursor-pointer group border border-primary/20 hover:border-primary/40 transition-all duration-300 active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}
                  >
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", accent.iconBg)}>
                            <Icon className={cn("w-4 h-4", accent.dot.replace("bg-", "text-"))} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground leading-tight">{acc.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{typeInfo.label}</p>
                          </div>
                        </div>
                        {acc.is_default ? (
                          <span className="text-[8px] bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider">
                            Principal
                          </span>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground/25 group-hover:text-primary transition-colors" />
                        )}
                      </div>
                      <div className="h-px bg-border/10" />
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className={cn("w-1.5 h-1.5 rounded-full", balance >= 0 ? "bg-primary" : "bg-destructive")} />
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">Saldo disponível</p>
                        </div>
                        <p className={cn("text-2xl font-extrabold tabular-nums tracking-tight", balance >= 0 ? "text-foreground" : "text-destructive")}>
                          {formatCurrency(balance)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: bankAccounts.length * 0.05 }}
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
            <div className="overflow-hidden sm:hidden" ref={cardsRef}>
              <div className="flex gap-3 px-4">
              {creditCards.map((card, idx) => (
                <CreditCardTile key={card.id} card={card} idx={idx} invoiceInfo={openInvoices[card.id]} navigate={navigate} extraClass="min-w-0 shrink-0 basis-[85%]" />
              ))}
              <motion.button
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowAddCard(true)}
                className="rounded-2xl p-4 min-h-[148px] min-w-0 shrink-0 basis-[60%] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-primary/20 hover:border-primary/40 bg-primary/[0.03] transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-primary/70 font-medium">Adicionar cartão</span>
              </motion.button>
              </div>
            </div>

            {/* Desktop grid */}
            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {creditCards.map((card, idx) => (
                <CreditCardTile key={card.id} card={card} idx={idx} invoiceInfo={openInvoices[card.id]} navigate={navigate} />
              ))}
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


      {/* ═══════ Microcopy educativo ═══════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl p-4 border border-border/5 text-center"
        style={{ background: "linear-gradient(135deg, hsl(var(--card) / 0.3) 0%, transparent 100%)" }}
      >
        <p className="text-[11px] text-muted-foreground/50 italic">
          "Separe o que é gasto do que é construção de patrimônio"
        </p>
      </motion.div>

      {/* ═══════ MODALS ═══════ */}
      <ModalOverlay open={showAddAccount} onClose={resetAddAccount}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-foreground">Nova Conta</p>
            <button onClick={resetAddAccount} className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Nome da conta</label>
            <Input
              placeholder="Ex: Nubank, Itaú, Bradesco..."
              value={newAccName}
              onChange={(e) => setNewAccName(e.target.value)}
              className="bg-muted/30 border-border/20 h-11 rounded-xl"
            />
          </div>
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

      {/* AI Financial Wizard */}
      <AIFinancialWizardModal
        open={!!showAIWizard}
        onClose={() => setShowAIWizard(null)}
        type="meta"
        onConfirm={async (plan, objective) => {
          if (!user) return;
          try {
            const { createGoal } = await import("@/services/goalService");
            await createGoal({
              name: objective,
              target_amount: plan.monthly_contribution * plan.estimated_months,
              monthly_contribution: plan.monthly_contribution,
            }, user.id);
            toast.success("Meta criada com IA! 🤖🎯");
            fetchData();
          } catch {
            toast.error("Erro ao criar com IA");
          }
        }}
      />
    </div>
  );
};

export default GestaoFinanceira;
