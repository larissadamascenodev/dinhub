import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Plus, X, Landmark, Banknote, PiggyBank, TrendingUp, ChevronRight, Briefcase, ArrowDownLeft, CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getAccounts, createAccount, getCreditCards, createCreditCard } from "@/services/transactionService";
import { supabase } from "@/integrations/supabase/client";
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

interface InvoiceData {
  credit_card_id: string;
  total_amount: number;
  is_paid: boolean;
  month: number;
  year: number;
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
  const [openInvoices, setOpenInvoices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [accountsRef] = useEmblaCarousel({ loop: false, align: "start", dragFree: true, containScroll: "trimSnaps" });
  const [cardsRef] = useEmblaCarousel({ loop: false, align: "start", dragFree: true, containScroll: "trimSnaps" });

  // Add account state
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccName, setNewAccName] = useState("");
  const [newAccType, setNewAccType] = useState<"checking" | "cash" | "savings" | "investment">("checking");
  const [newAccBalance, setNewAccBalance] = useState("");
  const [newAccColor, setNewAccColor] = useState("violet");
  const [newInvestmentType, setNewInvestmentType] = useState("cdb");
  const [newRateType, setNewRateType] = useState("percent_cdi");
  const [newAnnualRate, setNewAnnualRate] = useState("");
  const [newStartDate, setNewStartDate] = useState<Date>(new Date());
  const [newMaturityDate, setNewMaturityDate] = useState<Date | undefined>(undefined);

  // Add card state
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [newCardLimit, setNewCardLimit] = useState("");
  const [newCardClosing, setNewCardClosing] = useState("10");
  const [newCardDue, setNewCardDue] = useState("20");
  const [newCardColor, setNewCardColor] = useState("emerald");
  const [newCardDigits, setNewCardDigits] = useState("");

  // Aporte state
  const [showAporteModal, setShowAporteModal] = useState(false);
  const [aporteTargetId, setAporteTargetId] = useState("");
  const [aporteTargetName, setAporteTargetName] = useState("");
  const [aporteFromId, setAporteFromId] = useState("");
  const [aporteCents, setAporteCents] = useState(0);
  const [aporteSubmitting, setAporteSubmitting] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [accs, cards] = await Promise.all([getAccounts(), getCreditCards()]);
      setAccounts(accs as unknown as Account[]);
      setCreditCards(cards as unknown as CreditCardItem[]);

      // Fetch open invoices for current month
      const now = new Date();
      const { data: invoices } = await supabase
        .from("invoices")
        .select("credit_card_id, total_amount, is_paid, month, year")
        .eq("is_paid", false)
        .eq("month", now.getMonth() + 1)
        .eq("year", now.getFullYear());

      const invoiceMap: Record<string, number> = {};
      if (invoices) {
        for (const inv of invoices as unknown as InvoiceData[]) {
          invoiceMap[inv.credit_card_id] = Number(inv.total_amount);
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
    fetchData();
  }, [user]);

  const resetAddAccount = () => {
    setShowAddAccount(false);
    setNewAccName("");
    setNewAccType("checking");
    setNewAccBalance("");
    setNewAccColor("violet");
    setNewInvestmentType("cdb");
    setNewRateType("percent_cdi");
    setNewAnnualRate("");
    setNewStartDate(new Date());
    setNewMaturityDate(undefined);
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
      if (newAccType === "investment") {
        accPayload.rate_type = "fixed_monthly";
        accPayload.annual_rate = newAnnualRate ? parseFloat(newAnnualRate) : null;
      }
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

  const openAporte = (accId: string, accName: string) => {
    setAporteTargetId(accId);
    setAporteTargetName(accName);
    setAporteCents(0);
    const bankAccs = accounts.filter(a => a.type !== "investment");
    const defaultAcc = bankAccs.find(a => a.is_default) || bankAccs[0];
    setAporteFromId(defaultAcc?.id || "");
    setShowAporteModal(true);
  };

  const handleAporte = async () => {
    if (!user || !aporteFromId || !aporteTargetId || aporteCents === 0) return;
    setAporteSubmitting(true);
    try {
      const fromAcc = accounts.find(a => a.id === aporteFromId);
      const realAmount = aporteCents / 100;
      if (fromAcc && realAmount > Number(fromAcc.current_balance)) {
        toast.error("Saldo insuficiente na conta de origem");
        setAporteSubmitting(false);
        return;
      }
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        name: `Depósito: ${fromAcc?.name} → ${aporteTargetName}`,
        type: "investimento",
        amount: realAmount,
        category: "Investimentos",
        date: new Date().toISOString().split("T")[0],
        status: "pago",
        account_id: aporteFromId,
        to_account_id: aporteTargetId,
        payment_method: "conta",
        recurrence_type: "unica",
      } as any);
      if (error) throw error;
      toast.success("Depósito realizado! 💰");
      setShowAporteModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao realizar aporte");
    } finally {
      setAporteSubmitting(false);
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
            <div className="overflow-hidden sm:hidden" ref={accountsRef}>
              <div className="flex gap-3 px-4">
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
                    className="relative rounded-2xl overflow-hidden cursor-pointer group min-w-0 shrink-0 basis-[80%] border border-primary/20 hover:border-primary/40 transition-all duration-300 active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}
                  >
                    <div className="p-4 space-y-4">
                      {/* Row 1: Bank info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center",
                            accent.iconBg
                          )}>
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

                      {/* Divider */}
                      <div className="h-px bg-border/10" />

                      {/* Row 2: Balance */}
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
                    className="relative rounded-2xl overflow-hidden cursor-pointer group border border-primary/20 hover:border-primary/40 transition-all duration-300 active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}
                  >
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center",
                            accent.iconBg
                          )}>
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
            <div className="overflow-hidden sm:hidden" ref={cardsRef}>
              <div className="flex gap-3 px-4">
              {creditCards.map((card, idx) => {
                const usedPct = card.limit > 0 ? Math.min((Number(card.used_limit) / Number(card.limit)) * 100, 100) : 0;
                const available = Math.max(Number(card.limit) - Number(card.used_limit), 0);
                const accent = getAccent(card.color);

                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    onClick={() => navigate(`/fatura/${card.id}`)}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group min-w-0 shrink-0 basis-[80%] border border-primary/20 hover:border-primary/40 transition-all duration-300 active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}
                  >
                    <div className="p-4 space-y-4">
                      {/* Row 1: Card info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", accent.iconBg)}>
                            <CreditCard className={cn("w-4 h-4", accent.dot.replace("bg-", "text-"))} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground leading-tight">{card.name}</p>
                            {card.last_four_digits ? (
                              <p className="text-[10px] text-muted-foreground mt-0.5">•••• {card.last_four_digits}</p>
                            ) : (
                              <p className="text-[10px] text-muted-foreground mt-0.5">Cartão de crédito</p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/25 group-hover:text-primary transition-colors" />
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-border/10" />

                      {/* Row 2: Available + Used + Invoice */}
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className={cn("w-1.5 h-1.5 rounded-full", usedPct > 80 ? "bg-destructive" : "bg-primary")} />
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">Disponível</p>
                        </div>
                        <p className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
                          {formatCurrency(available)}
                        </p>
                        <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden mt-2.5 mb-1.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${usedPct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={cn("h-full rounded-full", usedPct > 80 ? "bg-destructive/60" : "bg-primary/40")}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-muted-foreground">{formatCurrency(Number(card.used_limit))} usado</span>
                          <span className="text-[10px] text-muted-foreground/60">Vence dia {card.due_day}</span>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-border/10 my-3" />

                        {/* Used + Invoice row */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium mb-0.5">Utilizado</p>
                            <p className="text-sm font-bold tabular-nums text-foreground">{usedPct.toFixed(0)}%</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium mb-0.5">Fatura aberta</p>
                            <p className={cn("text-sm font-bold tabular-nums", (openInvoices[card.id] || 0) > 0 ? "text-amber-400" : "text-muted-foreground")}>
                              {formatCurrency(openInvoices[card.id] || 0)}
                            </p>
                          </div>
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
              {creditCards.map((card, idx) => {
                const usedPct = card.limit > 0 ? Math.min((Number(card.used_limit) / Number(card.limit)) * 100, 100) : 0;
                const available = Math.max(Number(card.limit) - Number(card.used_limit), 0);
                const accent = getAccent(card.color);

                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    onClick={() => navigate(`/fatura/${card.id}`)}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group border border-primary/20 hover:border-primary/40 transition-all duration-300 active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}
                  >
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", accent.iconBg)}>
                            <CreditCard className={cn("w-4 h-4", accent.dot.replace("bg-", "text-"))} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground leading-tight">{card.name}</p>
                            {card.last_four_digits ? (
                              <p className="text-[10px] text-muted-foreground mt-0.5">•••• {card.last_four_digits}</p>
                            ) : (
                              <p className="text-[10px] text-muted-foreground mt-0.5">Cartão de crédito</p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/25 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="h-px bg-border/10" />
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className={cn("w-1.5 h-1.5 rounded-full", usedPct > 80 ? "bg-destructive" : "bg-primary")} />
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">Disponível</p>
                        </div>
                        <p className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
                          {formatCurrency(available)}
                        </p>
                        <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden mt-2.5 mb-1.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${usedPct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={cn("h-full rounded-full", usedPct > 80 ? "bg-destructive/60" : "bg-primary/40")}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-muted-foreground">{formatCurrency(Number(card.used_limit))} usado</span>
                          <span className="text-[10px] text-muted-foreground/60">Vence dia {card.due_day}</span>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-border/10 my-3" />

                        {/* Used + Invoice row */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium mb-0.5">Utilizado</p>
                            <p className="text-sm font-bold tabular-nums text-foreground">{usedPct.toFixed(0)}%</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium mb-0.5">Fatura aberta</p>
                            <p className={cn("text-sm font-bold tabular-nums", (openInvoices[card.id] || 0) > 0 ? "text-amber-400" : "text-muted-foreground")}>
                              {formatCurrency(openInvoices[card.id] || 0)}
                            </p>
                          </div>
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
              <div
                className="rounded-2xl border border-border/10 p-4 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}
              >
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">Total investido</p>
                  <p className="text-xl font-extrabold text-foreground tabular-nums">{formatCurrency(totalInvested)}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {investmentAccounts.map((acc, idx) => {
                  const accent = getAccent(acc.color);
                  const balance = Number(acc.current_balance);

                  return (
                    <motion.div
                      key={acc.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      onClick={() => navigate(`/investimento/${acc.id}`)}
                      className="relative rounded-2xl overflow-hidden cursor-pointer group border border-border/10 hover:border-primary/30 transition-all duration-300 active:scale-[0.98]"
                      style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}
                    >
                      <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", accent.iconBg)}>
                              <Briefcase className={cn("w-4 h-4", accent.dot.replace("bg-", "text-"))} />
                            </div>
                            <p className="text-sm font-bold text-foreground leading-tight truncate">{acc.name}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/25 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="h-px bg-border/10" />
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">Saldo</p>
                          </div>
                          <p className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
                            {formatCurrency(balance)}
                          </p>
                        </div>
                        {/* Depósito button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); openAporte(acc.id, acc.name); }}
                          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-primary/10 text-primary text-[11px] font-semibold hover:bg-primary/20 transition-colors border border-primary/20"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          Depósito
                        </button>
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
            <p className="text-base font-bold text-foreground">
              {newAccType === "investment" ? "Nova Carteira de Investimento" : "Nova Conta"}
            </p>
            <button onClick={resetAddAccount} className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Nome da conta</label>
            <Input
              placeholder={newAccType === "investment" ? "Ex: Tesouro Selic, CDB Banco X..." : "Ex: Nubank, Itaú, Bradesco..."}
              value={newAccName}
              onChange={(e) => setNewAccName(e.target.value)}
              className="bg-muted/30 border-border/20 h-11 rounded-xl"
            />
          </div>
          {newAccType !== "investment" && (
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
          )}
          {newAccType === "investment" && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Taxa de rendimento mensal</label>
                <div className="relative">
                  <Input
                    placeholder="0,50"
                    type="number"
                    value={newAnnualRate}
                    onChange={(e) => setNewAnnualRate(e.target.value)}
                    className="bg-muted/30 border-border/20 h-11 rounded-xl pr-20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    % a.m.
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground/70">
                  Ex: 0,5 para 0,5% ao mês (juros compostos)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Data de início</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-muted/30 border-border/20 h-11 rounded-xl text-xs"
                      >
                        <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                        {format(newStartDate, "d 'de' MMM. yyyy", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newStartDate}
                        onSelect={(d) => {
                          if (d) setNewStartDate(d);
                          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
                        }}
                        initialFocus
                        className="p-2 pointer-events-auto text-xs [&_table]:text-xs [&_button]:h-7 [&_button]:w-7 [&_th]:w-7 [&_.rdp-caption]:text-sm"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Vencimento <span className="text-muted-foreground font-normal">(opcional)</span></label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-muted/30 border-border/20 h-11 rounded-xl text-xs",
                          !newMaturityDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                        {newMaturityDate ? format(newMaturityDate, "d 'de' MMM. yyyy", { locale: ptBR }) : "dd/mm/aaaa"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newMaturityDate}
                        onSelect={(d) => {
                          setNewMaturityDate(d);
                          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
                        }}
                        initialFocus
                        className="p-2 pointer-events-auto text-xs [&_table]:text-xs [&_button]:h-7 [&_button]:w-7 [&_th]:w-7 [&_.rdp-caption]:text-sm"
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-[10px] leading-tight text-muted-foreground/60">Calcula valor estimado no vencimento</p>
                </div>
              </div>
            </>
          )}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              {newAccType === "investment" ? "Valor investido (opcional)" : "Saldo inicial (opcional)"}
            </Label>
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
            {newAccType === "investment" ? "Criar Carteira" : "Criar Conta"}
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

      {/* ═══════ MODAL: Aporte ═══════ */}
      <ModalOverlay open={showAporteModal} onClose={() => setShowAporteModal(false)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-foreground">Depósito em {aporteTargetName}</p>
            <button onClick={() => setShowAporteModal(false)} className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <Select value={aporteFromId} onValueChange={setAporteFromId}>
            <SelectTrigger className="bg-muted/30 border-border/20 h-11 rounded-xl">
              <SelectValue placeholder="Conta de origem" />
            </SelectTrigger>
            <SelectContent>
              {accounts.filter(a => a.type !== "investment").map(a => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name} · {formatCurrency(Number(a.current_balance))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Valor do depósito</Label>
            <Input
              placeholder="0,00"
              inputMode="numeric"
              value={aporteCents > 0 ? (aporteCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
              onKeyDown={(e) => {
                if (e.key === "Backspace") {
                  e.preventDefault();
                  setAporteCents(prev => Math.floor(prev / 10));
                } else if (e.key >= "0" && e.key <= "9") {
                  e.preventDefault();
                  setAporteCents(prev => {
                    const next = prev * 10 + parseInt(e.key);
                    return next > 99999999 ? prev : next;
                  });
                }
              }}
              readOnly
              className="bg-muted/30 border-border/20 h-11 rounded-xl text-lg font-bold text-center"
            />
          </div>

          <Button
            onClick={handleAporte}
            disabled={aporteCents === 0 || !aporteFromId || aporteSubmitting}
            className="w-full h-11 rounded-xl text-sm font-semibold bg-primary/15 text-primary hover:bg-primary/25 border border-primary/30"
          >
            {aporteSubmitting ? "Processando..." : `Depositar R$ ${(aporteCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          </Button>
        </div>
      </ModalOverlay>
    </div>
  );
};

export default GestaoFinanceira;
