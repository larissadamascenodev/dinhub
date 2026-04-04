import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, TrendingUp, TrendingDown, CalendarDays, FileText, Tag,
  Wallet, Repeat, StickyNote, Check, Clock, CreditCard, Plus,
  Sparkles, Search, Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  createTransaction,
  updateTransaction,
  getAccounts,
  createAccount,
  suggestCategory,
  getCreditCards,
  createCreditCard,
} from "@/services/transactionService";
import { getCustomCategories, createCustomCategory, type CustomCategory } from "@/services/categoryService";
import CategoryCreateModal, { getIconComponent } from "@/components/dashboard/CategoryCreateModal";
import { getDefaultCategoryIcon } from "@/lib/categoryIcons";

export interface EditTransactionData {
  id: string;
  name: string;
  type: "receita" | "despesa";
  amount: number;
  category: string;
  date: string;
  status: "pago" | "pendente";
  payment_method: "conta" | "cartao";
  account_id?: string | null;
  credit_card_id?: string | null;
  recurrence_type?: "unica" | "parcelado" | "fixa";
  installments?: number | null;
  installment_current?: number | null;
  observation?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: "receita" | "despesa";
  initialPaymentMethod?: "conta" | "cartao";
  initialCreditCardId?: string;
  editTransaction?: EditTransactionData | null;
}

const CATEGORIES_EXPENSE = [
  "Alimentação", "Transporte", "Saúde", "Assinaturas",
  "Lazer", "Moradia", "Educação", "Vestuário", "Pets",
  "Beleza", "Presentes", "Viagem", "Tecnologia", "Impostos",
];
const CATEGORIES_INCOME = [
  "Salário", "Freelance", "Investimentos", "Vendas",
  "Aluguéis", "Bônus", "Comissão", "Mesada",
];

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface Account {
  id: string;
  name: string;
  type: string;
  is_default: boolean;
}

interface CreditCardItem {
  id: string;
  name: string;
  limit: number;
  used_limit: number;
  closing_day: number;
  due_day: number;
  color: string | null;
}

const NovaTransacaoModal = ({ open, onClose, onSuccess, initialType = "despesa", initialPaymentMethod, initialCreditCardId, editTransaction }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState<"receita" | "despesa">(initialType);
  const [status, setStatus] = useState<"pago" | "pendente">("pago");
  const [description, setDescription] = useState("");
  const [amountCents, setAmountCents] = useState(0);
  const [category, setCategory] = useState("");
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [suggestingCategory, setSuggestingCategory] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [dateMode, setDateMode] = useState<"hoje" | "ontem" | "outros">("hoje");
  const [showCalendar, setShowCalendar] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"conta" | "cartao">("conta");
  const [recurrenceType, setRecurrenceType] = useState<"unica" | "parcelado" | "fixa">("unica");
  const [installments, setInstallments] = useState<number>(2);
  const [paidInstallments, setPaidInstallments] = useState<number>(0);
  const [installmentFrequency, setInstallmentFrequency] = useState<"mensal" | "anual">("mensal");
  const [observation, setObservation] = useState("");
  const [accountId, setAccountId] = useState<string>("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newAccountName, setNewAccountName] = useState("");
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [creditCards, setCreditCards] = useState<CreditCardItem[]>([]);
  const [creditCardId, setCreditCardId] = useState<string>("");
  const [showNewCard, setShowNewCard] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [newCardLimit, setNewCardLimit] = useState("");
  const [newCardClosingDay, setNewCardClosingDay] = useState("10");
  const [newCardDueDay, setNewCardDueDay] = useState("20");
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCategoryCreate, setShowCategoryCreate] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const suggestTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const allCategories = [
    ...(type === "receita" ? CATEGORIES_INCOME : CATEGORIES_EXPENSE),
    ...customCategories.filter((c) => c.type === type).map((c) => c.name),
  ];

  const filteredCategories = categorySearch
    ? allCategories.filter((c) => c.toLowerCase().includes(categorySearch.toLowerCase()))
    : allCategories;

  // Fetch accounts, credit cards and custom categories
  useEffect(() => {
    if (open && user) {
      getAccounts().then((accs) => {
        setAccounts(accs as Account[]);
        const defaultAcc = accs.find((a: any) => a.is_default);
        if (defaultAcc) setAccountId(defaultAcc.id);
      });
      getCreditCards().then((cards) => {
        const typedCards = cards as unknown as CreditCardItem[];
        setCreditCards(typedCards);
        if (initialCreditCardId && typedCards.some(c => c.id === initialCreditCardId)) {
          setCreditCardId(initialCreditCardId);
        } else if (typedCards.length > 0) {
          setCreditCardId(typedCards[0].id);
        }
      });
      getCustomCategories().then((cats) => setCustomCategories(cats)).catch(() => {});
    }
  }, [open, user]);

  const isEditMode = !!editTransaction;

  // Reset form
  useEffect(() => {
    if (open) {
      if (editTransaction) {
        // Edit mode: pre-fill with transaction data
        setType(editTransaction.type);
        setStatus(editTransaction.status);
        setDescription(editTransaction.name);
        setAmountCents(Math.round(editTransaction.amount * 100));
        setCategory(editTransaction.category);
        setSuggestedCategory(null);
        const txDate = new Date(editTransaction.date + "T12:00:00");
        setDate(txDate);
        setDateMode("outros");
        setShowCalendar(false);
        setPaymentMethod(editTransaction.payment_method || "conta");
        setRecurrenceType((editTransaction.recurrence_type as any) || "unica");
        setInstallments(editTransaction.installments || 2);
        setPaidInstallments(editTransaction.installment_current ? editTransaction.installment_current - 1 : 0);
        setInstallmentFrequency("mensal");
        setObservation(editTransaction.observation?.replace(/^paid_installments:\d+\s*(\|\s*)?/, "") || "");
        setShowNewAccount(false);
        setNewAccountName("");
        setShowCategoryModal(false);
        setCategorySearch("");
        if (editTransaction.credit_card_id) setCreditCardId(editTransaction.credit_card_id);
        if (editTransaction.account_id) setAccountId(editTransaction.account_id);
        setShowNewCard(false);
        setNewCardName("");
        setNewCardLimit("");
        setNewCardClosingDay("10");
        setNewCardDueDay("20");
      } else {
        // Create mode: reset form
        setType(initialType);
        setStatus("pago");
        setDescription("");
        setAmountCents(0);
        setCategory("");
        setSuggestedCategory(null);
        setDate(new Date());
        setDateMode("hoje");
        setShowCalendar(false);
        setPaymentMethod(initialPaymentMethod ?? "conta");
        setRecurrenceType("unica");
        setInstallments(2);
        setPaidInstallments(0);
        setInstallmentFrequency("mensal");
        setObservation("");
        setShowNewAccount(false);
        setNewAccountName("");
        setShowCategoryModal(false);
        setCategorySearch("");
        setCreditCardId("");
        setShowNewCard(false);
        setNewCardName("");
        setNewCardLimit("");
        setNewCardClosingDay("10");
        setNewCardDueDay("20");
      }
    }
  }, [open, initialType, editTransaction]);

  // AI category suggestion with debounce - faster
  const triggerSuggest = useCallback(
    (desc: string, txType: "receita" | "despesa") => {
      if (suggestTimeoutRef.current) clearTimeout(suggestTimeoutRef.current);
      if (desc.trim().length < 2) {
        setSuggestedCategory(null);
        return;
      }
      suggestTimeoutRef.current = setTimeout(async () => {
        setSuggestingCategory(true);
        const cat = await suggestCategory(desc, txType);
        setSuggestedCategory(cat);
        if (cat && !category) setCategory(cat);
        setSuggestingCategory(false);
      }, 350);
    },
    [category]
  );

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    triggerSuggest(val, type);
  };

  const handleDateMode = (mode: "hoje" | "ontem" | "outros") => {
    setDateMode(mode);
    if (mode === "hoje") {
      setDate(new Date());
      setShowCalendar(false);
    } else if (mode === "ontem") {
      setDate(subDays(new Date(), 1));
      setShowCalendar(false);
    } else {
      setShowCalendar(true);
    }
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      setAmountCents((prev) => Math.floor(prev / 10));
      return;
    }
    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      setAmountCents((prev) => {
        const next = prev * 10 + parseInt(e.key);
        return next > 99999999 ? prev : next;
      });
    }
  };

  const handleCreateAccount = async () => {
    if (!user || !newAccountName.trim()) return;
    try {
      const acc = await createAccount(user.id, { name: newAccountName.trim() });
      setAccounts((prev) => [...prev, acc as Account]);
      setAccountId(acc.id);
      setShowNewAccount(false);
      setNewAccountName("");
      toast.success("Conta criada!");
    } catch {
      toast.error("Erro ao criar conta");
    }
  };

  const handleCreateCreditCard = async () => {
    if (!user || !newCardName.trim() || !newCardLimit) return;
    try {
      const card = await createCreditCard(
        {
          name: newCardName.trim(),
          limit: parseFloat(newCardLimit),
          closing_day: parseInt(newCardClosingDay),
          due_day: parseInt(newCardDueDay),
        },
        user.id
      );
      const typedCard = card as unknown as CreditCardItem;
      setCreditCards((prev) => [...prev, typedCard]);
      setCreditCardId(typedCard.id);
      setShowNewCard(false);
      setNewCardName("");
      setNewCardLimit("");
      toast.success("Cartão cadastrado!");
    } catch {
      toast.error("Erro ao criar cartão");
    }
  };

  const handleCreateCategory = (nameOverride?: string) => {
    const name = (nameOverride || newCategoryName).trim();
    if (!name) return;
    setCategory(name);
    setNewCategoryName("");
    setShowCategoryModal(false);
  };

  const handleCreateCategoryFromModal = async (data: { name: string; icon: string; color: string }) => {
    if (!user) return;
    try {
      const cat = await createCustomCategory(user.id, { ...data, type });
      setCustomCategories((prev) => [...prev, cat]);
      setCategory(data.name);
      setShowCategoryCreate(false);
    } catch {
      // fallback: just use the name
      setCategory(data.name);
      setShowCategoryCreate(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (amountCents === 0) {
      toast.error("Digite um valor");
      return;
    }
    if (!category) {
      toast.error("Selecione uma categoria");
      return;
    }
    if ((paymentMethod === "conta" || type === "receita") && accounts.length === 0) {
      toast.error("Você precisa cadastrar uma conta antes");
      return;
    }
    if ((paymentMethod === "conta" || type === "receita") && !accountId) {
      toast.error("Selecione uma conta");
      return;
    }

    const realAmount = amountCents / 100;
    const isParcelado = recurrenceType === "parcelado" && installments > 1;
    // For parcelado, the amount stored per transaction is per-installment
    const perInstallmentAmount = isParcelado ? Math.round((realAmount / installments) * 100) / 100 : realAmount;
    const currentInstallment = isParcelado ? (paidInstallments + 1) : null;
    const dateStr = format(date, "yyyy-MM-dd");
    const finalName = description.trim() || category;

    setSubmitting(true);
    try {
      if (isEditMode && editTransaction) {
        // Edit mode: update existing transaction
        await updateTransaction(editTransaction.id, {
          name: finalName,
          type,
          amount: isParcelado ? perInstallmentAmount : realAmount,
          category,
          date: dateStr,
          status: paymentMethod === "cartao" ? "pendente" : status,
        });
        toast.success("Transação atualizada ✏️", {
          description: `${type === "receita" ? "Receita" : "Despesa"} de R$ ${formatCurrency(amountCents)}`,
        });
      } else {
        // Create mode
        await createTransaction(
          {
            name: finalName,
            type,
            amount: perInstallmentAmount,
            category,
            date: dateStr,
            status: paymentMethod === "cartao" ? "pendente" : status,
            account_id: paymentMethod === "cartao" ? null : (accountId || null),
            payment_method: type === "despesa" ? paymentMethod : "conta",
            recurrence_type: recurrenceType,
            installments: isParcelado ? installments : null,
            installment_current: currentInstallment,
            observation: isParcelado && paidInstallments > 0
              ? `paid_installments:${paidInstallments}${observation.trim() ? ` | ${observation.trim()}` : ""}`
              : (observation.trim() || null),
            credit_card_id: paymentMethod === "cartao" ? (creditCardId || null) : null,
          },
          user.id
        );
        const statusLabel = status === "pago"
          ? (type === "receita" ? "recebida" : "registrada")
          : "agendada";
        toast.success(`Transação ${statusLabel} 🎯`, {
          description: `${type === "receita" ? "Receita" : "Despesa"} de R$ ${formatCurrency(amountCents)}`,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar transação");
    } finally {
      setSubmitting(false);
    }
  };

  const isReceita = type === "receita";
  const accentHsl = isReceita ? "hsl(var(--primary))" : "hsl(var(--destructive))";

  // Account colors for visual dots
  const accountColors = ["#8b5cf6", "#f97316", "#00e676", "#00e676", "#3b82f6", "#ec4899"];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-stretch md:items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full h-full md:h-auto md:max-h-[92vh] max-w-md mx-0 md:mx-4 rounded-none md:rounded-2xl bg-card border-0 md:border md:border-border/20 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="relative flex items-center justify-center pt-5 pb-3 px-5">
              <div className="flex items-center gap-2">
                {isReceita ? (
                  <TrendingUp className="w-5 h-5 text-primary" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-destructive" />
                )}
                <span className="text-lg font-bold text-foreground">
                  {isEditMode
                    ? "Editar Lançamento"
                    : isReceita ? "Nova Receita" : "Nova Despesa"}
                </span>
              </div>
              <button
                onClick={onClose}
                className="absolute right-4 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pb-20 md:pb-4">
              {/* Value display */}
              <div
                className="mx-5 mb-4 rounded-xl p-5 text-center cursor-text border border-border/10"
                style={{ background: `${accentHsl}08` }}
                onClick={() => amountInputRef.current?.focus()}
              >
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Valor</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-xl font-bold" style={{ color: accentHsl }}>R$</span>
                  <motion.span
                    key={amountCents}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    className="font-display text-4xl font-bold tabular-nums tracking-tight text-foreground/80"
                  >
                    {formatCurrency(amountCents)}
                  </motion.span>
                </div>
                <input
                  ref={amountInputRef}
                  className="sr-only"
                  onKeyDown={handleAmountKeyDown}
                  aria-label="Valor da transação"
                  autoFocus
                />
              </div>

              {/* Payment method toggle (expenses only) - below value */}
              {type === "despesa" && (
                <div className="flex gap-2 mx-5 mb-4">
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod("conta"); }}
                    className={cn(
                      "flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border",
                      paymentMethod === "conta"
                        ? "bg-primary/15 text-primary border-primary/25"
                        : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"
                    )}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Conta
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod("cartao"); setStatus("pendente"); }}
                    className={cn(
                      "flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border",
                      paymentMethod === "cartao"
                        ? "bg-primary/15 text-primary border-primary/25"
                        : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"
                    )}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Cartão de Crédito
                  </button>
                </div>
              )}

              {/* Account / Credit Card section - moved up after payment method */}
              <div className="px-5 mb-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {paymentMethod === "cartao" && type === "despesa" ? (
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                  )}
                  {paymentMethod === "cartao" && type === "despesa" ? "Cartão de Crédito" : "Conta"}
                </div>

                {paymentMethod === "conta" || type === "receita" ? (
                  accounts.length === 0 ? (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center space-y-2">
                      <Wallet className="w-6 h-6 text-primary mx-auto" />
                      <p className="text-xs text-foreground font-medium">Você precisa adicionar uma conta antes</p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => { onClose(); window.location.href = "/gestao"; }}
                        className="h-8 px-4 text-xs rounded-xl"
                      >
                        Adicionar conta
                      </Button>
                    </div>
                  ) : (
                  <>
                    <Select value={accountId} onValueChange={setAccountId}>
                      <SelectTrigger className="bg-muted/30 border-border/20 h-11 rounded-xl">
                        <SelectValue placeholder="Selecionar conta" />
                      </SelectTrigger>
                      <SelectContent className="z-[70]">
                        {accounts.map((acc, idx) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: accountColors[idx % accountColors.length] }}
                              />
                              {acc.name} {acc.is_default && "(padrão)"}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {!showNewAccount ? (
                      <button
                        type="button"
                        onClick={() => setShowNewAccount(true)}
                        className="flex items-center gap-1 text-[11px] text-primary font-medium hover:opacity-80 mt-1"
                      >
                        <Plus className="w-3 h-3" />
                        Criar nova conta
                      </button>
                    ) : (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="flex gap-2 mt-1 overflow-hidden"
                      >
                        <Input
                          placeholder="Nome da conta"
                          value={newAccountName}
                          onChange={(e) => setNewAccountName(e.target.value)}
                          className="bg-muted/30 border-border/20 h-9 text-sm flex-1 rounded-xl"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleCreateAccount}
                          disabled={!newAccountName.trim()}
                          className="h-9 px-3 text-xs rounded-xl"
                        >
                          Criar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => { setShowNewAccount(false); setNewAccountName(""); }}
                          className="h-9 px-3 text-xs rounded-xl"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </motion.div>
                    )}
                  </>
                  )
                ) : (
                  /* Cartão de crédito mode */
                  <div className="space-y-2">
                    {creditCards.length > 0 ? (
                      <Select value={creditCardId} onValueChange={setCreditCardId}>
                        <SelectTrigger className="bg-muted/30 border-border/20 h-11 rounded-xl">
                          <SelectValue placeholder="Selecionar cartão" />
                        </SelectTrigger>
                        <SelectContent className="z-[70]">
                          {creditCards.map((card) => (
                            <SelectItem key={card.id} value={card.id}>
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{card.name}</span>
                                <span className="text-[10px] text-muted-foreground ml-1">
                                  Fecha dia {card.closing_day} · Vence dia {card.due_day}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="rounded-xl border border-border/20 bg-muted/30 p-3 text-center">
                        <CreditCard className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Nenhum cartão cadastrado</p>
                      </div>
                    )}

                    {!showNewCard ? (
                      <button
                        type="button"
                        onClick={() => setShowNewCard(true)}
                        className="flex items-center gap-1 text-[11px] text-primary font-medium hover:opacity-80 mt-1"
                      >
                        <Plus className="w-3 h-3" />
                        Cadastrar cartão
                      </button>
                    ) : (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="space-y-2 mt-1 overflow-hidden"
                      >
                        <Input
                          placeholder="Nome do cartão (ex: Nubank)"
                          value={newCardName}
                          onChange={(e) => setNewCardName(e.target.value)}
                          className="bg-muted/30 border-border/20 h-9 text-sm rounded-xl"
                        />
                        <Input
                          placeholder="Limite (ex: 5000)"
                          type="number"
                          value={newCardLimit}
                          onChange={(e) => setNewCardLimit(e.target.value)}
                          className="bg-muted/30 border-border/20 h-9 text-sm rounded-xl"
                        />
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Label className="text-[10px] text-muted-foreground">Fecha dia</Label>
                            <Input
                              type="number"
                              min={1}
                              max={31}
                              value={newCardClosingDay}
                              onChange={(e) => setNewCardClosingDay(e.target.value)}
                              className="bg-muted/30 border-border/20 h-9 text-sm rounded-xl"
                            />
                          </div>
                          <div className="flex-1">
                            <Label className="text-[10px] text-muted-foreground">Vence dia</Label>
                            <Input
                              type="number"
                              min={1}
                              max={31}
                              value={newCardDueDay}
                              onChange={(e) => setNewCardDueDay(e.target.value)}
                              className="bg-muted/30 border-border/20 h-9 text-sm rounded-xl"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleCreateCreditCard}
                            disabled={!newCardName.trim() || !newCardLimit}
                            className="h-9 px-3 text-xs rounded-xl flex-1"
                          >
                            Cadastrar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => { setShowNewCard(false); setNewCardName(""); setNewCardLimit(""); }}
                            className="h-9 px-3 text-xs rounded-xl"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* Form fields */}
              <form onSubmit={handleSubmit} className="px-5 space-y-5">
                {/* Date */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                    Data
                  </div>
                  <div className="flex gap-2">
                    {(["hoje", "ontem", "outros"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => handleDateMode(mode)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-semibold transition-all border",
                          dateMode === mode
                            ? "bg-primary/15 text-primary border-primary/25"
                            : "bg-muted/30 text-muted-foreground hover:text-foreground border-transparent"
                        )}
                      >
                        {mode === "outros" ? "Outros" : mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                  {dateMode === "outros" && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setShowCalendar((prev) => !prev)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/30 border border-border/20 text-sm text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <CalendarDays className="w-4 h-4 text-muted-foreground" />
                        {format(date, "dd/MM/yyyy", { locale: ptBR })}
                      </button>

                      {showCalendar && (
                        <div className="rounded-xl border border-border/20 bg-muted/20 p-2">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => {
                              if (d) {
                                setDate(d);
                                setShowCalendar(false);
                              }
                            }}
                            className="p-1 pointer-events-auto"
                            locale={ptBR}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Descrição
                  </div>
                  <Input
                    placeholder={isReceita ? "Ex: Salário mensal" : "Ex: Jantar no Outback"}
                    value={description}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    className="bg-muted/30 border-border/20 h-11 rounded-xl"
                    maxLength={100}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    Categoria
                    {suggestingCategory && (
                      <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                    )}
                    {suggestedCategory && !suggestingCategory && category === suggestedCategory && (
                      <span className="text-[9px] text-primary/60 font-medium ml-1">sugestão IA ✨</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 h-11 rounded-xl text-sm border transition-colors",
                      category
                        ? "bg-muted/30 border-border/20 text-foreground"
                        : "bg-muted/30 border-border/20 text-muted-foreground"
                    )}
                  >
                    {category || "Selecionar categoria"}
                    <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>


                {/* Recurrence */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Repeat className="w-4 h-4 text-muted-foreground" />
                    {isReceita ? "Repetição" : "Repetição"}
                  </div>
                  {isReceita ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRecurrenceType("unica")}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-semibold transition-all border",
                          recurrenceType === "unica"
                            ? "bg-primary/15 text-primary border-primary/25"
                            : "bg-muted/30 text-muted-foreground border-transparent"
                        )}
                      >
                        Única
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecurrenceType("fixa")}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-semibold transition-all border",
                          recurrenceType === "fixa"
                            ? "bg-primary/15 text-primary border-primary/25"
                            : "bg-muted/30 text-muted-foreground border-transparent"
                        )}
                      >
                        {paymentMethod === "cartao" ? "∞ Assinatura" : "∞ Fixa"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        {(["unica", "parcelado", "fixa"] as const).map((rt) => (
                          <button
                            key={rt}
                            type="button"
                            onClick={() => setRecurrenceType(rt)}
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-semibold transition-all border",
                              recurrenceType === rt
                                ? "bg-primary/15 text-primary border-primary/25"
                                : "bg-muted/30 text-muted-foreground border-transparent"
                            )}
                          >
                            {rt === "unica" ? "Única" : rt === "parcelado" ? "Parcelado" : paymentMethod === "cartao" ? "∞ Assinatura" : "∞ Fixa"}
                          </button>
                        ))}
                      </div>

                      <AnimatePresence>
                        {recurrenceType === "parcelado" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden space-y-3"
                          >
                            {/* Quantidade de parcelas */}
                            <Input
                              type="number"
                              inputMode="numeric"
                              placeholder="Quantidade de parcelas"
                              value={installments === 0 ? "" : installments}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "") {
                                  setInstallments(0);
                                  return;
                                }

                                const parsed = Number(value);
                                if (!Number.isNaN(parsed)) {
                                  setInstallments(parsed);
                                }
                              }}
                              onBlur={() => {
                                setInstallments((prev) => {
                                  if (!prev || prev < 2) return 2;
                                  return Math.min(prev, 48);
                                });
                              }}
                              min={2}
                              max={48}
                              className="bg-muted/30 border-border/20 h-11 rounded-xl"
                            />

                            {/* Mensal / Anual */}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setInstallmentFrequency("mensal")}
                                className={cn(
                                  "flex-1 py-2 rounded-xl text-xs font-semibold transition-all border",
                                  installmentFrequency === "mensal"
                                    ? "bg-primary/15 text-primary border-primary/25"
                                    : "bg-muted/30 text-muted-foreground border-transparent"
                                )}
                              >
                                Mensal
                              </button>
                              <button
                                type="button"
                                onClick={() => setInstallmentFrequency("anual")}
                                className={cn(
                                  "flex-1 py-2 rounded-xl text-xs font-semibold transition-all border",
                                  installmentFrequency === "anual"
                                    ? "bg-primary/15 text-primary border-primary/25"
                                    : "bg-muted/30 text-muted-foreground border-transparent"
                                )}
                              >
                                Anual
                              </button>
                            </div>

                            {/* Parcelas já pagas */}
                            <Input
                              type="number"
                              inputMode="numeric"
                              placeholder="Parcelas já pagas (opcional)"
                              value={paidInstallments === 0 ? "" : paidInstallments}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "") {
                                  setPaidInstallments(0);
                                  return;
                                }

                                const parsed = Number(value);
                                if (!Number.isNaN(parsed)) {
                                  setPaidInstallments(parsed);
                                }
                              }}
                              onBlur={() => {
                                setPaidInstallments((prev) => {
                                  if (prev < 0) return 0;
                                  return Math.min(prev, Math.max(installments - 1, 0));
                                });
                              }}
                              min={0}
                              max={Math.max(installments - 1, 0)}
                              className="bg-muted/30 border-border/20 h-11 rounded-xl"
                            />

                            {amountCents > 0 && installments > 0 && (
                              <p className="text-[11px] text-muted-foreground px-1">
                                {installments}x de R$ {formatCurrency(Math.round(amountCents / installments))}
                                {paidInstallments > 0 && ` · ${paidInstallments} já pagas`}
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Status toggle switch - hidden when cartão */}
                {(type === "receita" || paymentMethod === "conta") && (
                  <div className="flex items-center justify-between rounded-xl bg-muted/30 border border-border/20 px-4 py-3">
                    <div className="flex items-center gap-2">
                      {status === "pago" ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-400" />
                      )}
                      <span className="text-sm font-medium text-foreground">
                        {status === "pago"
                          ? (isReceita ? "Recebido" : "Pago")
                          : (isReceita ? "A receber" : "Pendente")}
                      </span>
                    </div>
                    <Switch
                      checked={status === "pago"}
                      onCheckedChange={(checked) => setStatus(checked ? "pago" : "pendente")}
                      className={cn(
                        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-amber-500"
                      )}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <StickyNote className="w-4 h-4 text-muted-foreground" />
                    Observação
                  </div>
                  <Input
                    placeholder="Adicionar nota (opcional)"
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    className="bg-muted/30 border-border/20 h-11 rounded-xl"
                    maxLength={200}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2 pb-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 h-12 font-semibold text-sm rounded-xl"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || amountCents === 0}
                    className={cn(
                      "flex-1 h-12 font-semibold text-sm rounded-xl text-white",
                      isReceita ? "bg-primary hover:bg-primary/90" : "bg-destructive hover:bg-destructive/90"
                    )}
                  >
                    {submitting ? (
                      <span className="animate-pulse">Salvando...</span>
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Category modal overlay */}
          <AnimatePresence>
            {showCategoryModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50"
                onClick={() => setShowCategoryModal(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 350 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-[90%] max-w-sm rounded-2xl bg-card border border-border/30 shadow-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-foreground">Categoria</h3>
                    <button
                      onClick={() => setShowCategoryModal(false)}
                      className="w-7 h-7 rounded-full border border-primary/40 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar categoria"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="pl-9 bg-muted/30 border-border/20 h-10 rounded-xl"
                    />
                  </div>

                  {/* Category list */}
                  <div className="max-h-48 overflow-y-auto space-y-1 mb-3 scrollbar-none">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat) => {
                        const customCat = customCategories.find((c) => c.name === cat && c.type === type);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setCategory(cat);
                              setShowCategoryModal(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-xl text-sm transition-colors",
                              category === cat
                                ? "bg-primary/15 text-primary font-semibold"
                                : "text-foreground hover:bg-muted/50"
                            )}
                          >
                            {(() => {
                              if (customCat) {
                                const CatIcon = getIconComponent(customCat.icon);
                                return (
                                  <span
                                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: `${customCat.color}20`, border: `1px solid ${customCat.color}30` }}
                                  >
                                    <CatIcon className="w-3.5 h-3.5" style={{ color: customCat.color }} />
                                  </span>
                                );
                              }
                              const DefaultIcon = getDefaultCategoryIcon(cat);
                              return (
                                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 border border-primary/20"
                                  style={{ filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.3))" }}>
                                  <DefaultIcon className="w-3.5 h-3.5 text-primary" />
                                </span>
                              );
                            })()}
                            {cat}
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        Nenhuma categoria encontrada
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/20">
                    <button
                      type="button"
                      onClick={() => setShowCategoryCreate(true)}
                      className="flex items-center gap-1 text-xs text-primary font-medium hover:opacity-80"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Criar categoria
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryModal(false);
                        onClose();
                        navigate("/categorias");
                      }}
                      className="flex items-center gap-1 text-xs text-muted-foreground font-medium hover:text-foreground"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Gerenciar
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Create Modal */}
          <CategoryCreateModal
            open={showCategoryCreate}
            onClose={() => setShowCategoryCreate(false)}
            onSave={handleCreateCategoryFromModal}
            title="Nova Categoria"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NovaTransacaoModal;
