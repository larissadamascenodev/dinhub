import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, TrendingUp, TrendingDown, CalendarDays, FileText, Tag,
  Wallet, Repeat, StickyNote, Check, Clock, ChevronDown,
  CreditCard, Plus, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  createTransaction,
  getAccounts,
  createAccount,
  suggestCategory,
} from "@/services/transactionService";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES_EXPENSE = [
  "Alimentação", "Transporte", "Saúde", "Assinaturas",
  "Lazer", "Moradia", "Educação", "Vestuário", "Outros",
];
const CATEGORIES_INCOME = [
  "Salário", "Freelance", "Investimentos", "Outros",
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
  is_default: boolean;
}

const NovaTransacaoModal = ({ open, onClose, onSuccess }: Props) => {
  const { user } = useAuth();
  const [type, setType] = useState<"receita" | "despesa">("despesa");
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
  const [observation, setObservation] = useState("");
  const [accountId, setAccountId] = useState<string>("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newAccountName, setNewAccountName] = useState("");
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const suggestTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const categories = type === "receita" ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  // Fetch accounts
  useEffect(() => {
    if (open && user) {
      getAccounts().then((accs) => {
        setAccounts(accs as Account[]);
        const defaultAcc = accs.find((a: any) => a.is_default);
        if (defaultAcc) setAccountId(defaultAcc.id);
      });
    }
  }, [open, user]);

  // Reset form
  useEffect(() => {
    if (open) {
      setType("despesa");
      setStatus("pago");
      setDescription("");
      setAmountCents(0);
      setCategory("");
      setSuggestedCategory(null);
      setDate(new Date());
      setDateMode("hoje");
      setShowCalendar(false);
      setPaymentMethod("conta");
      setRecurrenceType("unica");
      setInstallments(2);
      setObservation("");
      setShowNewAccount(false);
      setNewAccountName("");
    }
  }, [open]);

  // AI category suggestion with debounce
  const triggerSuggest = useCallback(
    (desc: string, txType: "receita" | "despesa") => {
      if (suggestTimeoutRef.current) clearTimeout(suggestTimeoutRef.current);
      if (desc.trim().length < 3) {
        setSuggestedCategory(null);
        return;
      }
      suggestTimeoutRef.current = setTimeout(async () => {
        setSuggestingCategory(true);
        const cat = await suggestCategory(desc, txType);
        setSuggestedCategory(cat);
        if (cat && !category) setCategory(cat);
        setSuggestingCategory(false);
      }, 600);
    },
    [category]
  );

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    triggerSuggest(val, type);
  };

  // Date shortcuts
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

  // Currency input
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
      const acc = await createAccount(newAccountName.trim(), user.id);
      setAccounts((prev) => [...prev, acc as Account]);
      setAccountId(acc.id);
      setShowNewAccount(false);
      setNewAccountName("");
      toast.success("Conta criada!");
    } catch {
      toast.error("Erro ao criar conta");
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

    const realAmount = amountCents / 100;
    const dateStr = format(date, "yyyy-MM-dd");
    const finalName = description.trim() || category;

    setSubmitting(true);
    try {
      await createTransaction(
        {
          name: finalName,
          type,
          amount: realAmount,
          category,
          date: dateStr,
          status,
          account_id: accountId || null,
          payment_method: type === "despesa" ? paymentMethod : "conta",
          recurrence_type: recurrenceType,
          installments: recurrenceType === "parcelado" ? installments : null,
          observation: observation.trim() || null,
        },
        user.id
      );
      const statusLabel = status === "pago"
        ? (type === "receita" ? "recebida" : "registrada")
        : "agendada";
      toast.success(`Transação ${statusLabel} 🎯`, {
        description: `${type === "receita" ? "Receita" : "Despesa"} de R$ ${formatCurrency(amountCents)}`,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar transação");
    } finally {
      setSubmitting(false);
    }
  };

  const isReceita = type === "receita";
  const accentColor = isReceita ? "hsl(150 100% 45%)" : "hsl(0 60% 50%)";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md mx-0 md:mx-4 rounded-t-3xl md:rounded-2xl bg-card border border-border/20 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="overflow-y-auto flex-1 pb-4">
              {/* Type header */}
              <div className="flex flex-col items-center pt-6 pb-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 text-lg font-bold text-foreground hover:opacity-80 transition-opacity">
                      {isReceita ? (
                        <TrendingUp className="w-5 h-5" style={{ color: accentColor }} />
                      ) : (
                        <TrendingDown className="w-5 h-5" style={{ color: accentColor }} />
                      )}
                      {isReceita ? "Receita" : "Despesa"}
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-1" align="center">
                    <button
                      onClick={() => { setType("despesa"); setCategory(""); setSuggestedCategory(null); setRecurrenceType("unica"); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        type === "despesa" ? "bg-destructive/10 text-destructive" : "hover:bg-muted"
                      }`}
                    >
                      <TrendingDown className="w-4 h-4" />
                      Despesa
                    </button>
                    <button
                      onClick={() => { setType("receita"); setCategory(""); setSuggestedCategory(null); setPaymentMethod("conta"); setRecurrenceType("unica"); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        type === "receita" ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      Receita
                    </button>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Value display */}
              <div
                className="mx-5 mb-3 rounded-xl p-5 text-center cursor-text"
                onClick={() => amountInputRef.current?.focus()}
              >
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Valor</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-xl font-bold" style={{ color: accentColor }}>R$</span>
                  <motion.span
                    key={amountCents}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    className="font-display text-4xl font-bold tabular-nums tracking-tight text-foreground/70"
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

              {/* Status toggle */}
              <div className="flex justify-center mb-5">
                <div className="flex gap-1 p-0.5 rounded-full bg-muted/40">
                  <button
                    type="button"
                    onClick={() => setStatus("pago")}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      status === "pago"
                        ? "text-card shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={status === "pago" ? { background: accentColor } : {}}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isReceita ? "Já recebi" : "Já paguei"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("pendente")}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      status === "pendente"
                        ? "bg-amber-500 text-card shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Pendente
                  </button>
                </div>
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
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
                          dateMode === mode
                            ? "bg-primary/15 text-primary border border-primary/25"
                            : "bg-muted/50 text-muted-foreground hover:text-foreground border border-transparent"
                        }`}
                      >
                        {mode === "outros" ? "Outros" : mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {showCalendar && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => d && setDate(d)}
                          className="p-3 pointer-events-auto rounded-xl border border-border/20"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Descrição
                  </div>
                  <Input
                    placeholder={isReceita ? "Ex: Salário" : "Ex: Jantar no Outback"}
                    value={description}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    className="bg-muted/50 border-border/30 h-11"
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
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-muted/50 border-border/30 h-11">
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Account */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    Conta
                    {type === "despesa" && (
                      <span className="text-destructive text-xs">*</span>
                    )}
                  </div>

                  {/* Payment method toggle (expenses only) */}
                  {type === "despesa" && (
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("conta")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          paymentMethod === "conta"
                            ? "bg-primary/15 text-primary border border-primary/25"
                            : "bg-muted/50 text-muted-foreground border border-transparent"
                        }`}
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        Conta
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cartao")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          paymentMethod === "cartao"
                            ? "bg-primary/15 text-primary border border-primary/25"
                            : "bg-muted/50 text-muted-foreground border border-transparent"
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Cartão
                      </button>
                    </div>
                  )}

                  <Select value={accountId} onValueChange={setAccountId}>
                    <SelectTrigger className="bg-muted/50 border-border/30 h-11">
                      <SelectValue placeholder="Selecionar conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} {acc.is_default && "(padrão)"}
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
                    <div className="flex gap-2 mt-1">
                      <Input
                        placeholder="Nome da conta"
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        className="bg-muted/50 border-border/30 h-9 text-sm flex-1"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCreateAccount}
                        disabled={!newAccountName.trim()}
                        className="h-9 px-3 text-xs"
                      >
                        Criar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => { setShowNewAccount(false); setNewAccountName(""); }}
                        className="h-9 px-3 text-xs"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Recurrence */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Repeat className="w-4 h-4 text-muted-foreground" />
                    {isReceita ? "Receita fixa (recorrente)" : "Repetição"}
                  </div>
                  {isReceita ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRecurrenceType("unica")}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                          recurrenceType === "unica"
                            ? "bg-primary/15 text-primary border border-primary/25"
                            : "bg-muted/50 text-muted-foreground border border-transparent"
                        }`}
                      >
                        Única
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecurrenceType("fixa")}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                          recurrenceType === "fixa"
                            ? "bg-primary/15 text-primary border border-primary/25"
                            : "bg-muted/50 text-muted-foreground border border-transparent"
                        }`}
                      >
                        ∞ Fixa
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        {(["unica", "parcelado", "fixa"] as const).map((rt) => (
                          <button
                            key={rt}
                            type="button"
                            onClick={() => setRecurrenceType(rt)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                              recurrenceType === rt
                                ? "bg-primary/15 text-primary border border-primary/25"
                                : "bg-muted/50 text-muted-foreground border border-transparent"
                            }`}
                          >
                            {rt === "unica" ? "Única" : rt === "parcelado" ? "Parcelado" : "∞ Fixa"}
                          </button>
                        ))}
                      </div>

                      <AnimatePresence>
                        {recurrenceType === "parcelado" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex items-center gap-2 mt-1">
                              <Label className="text-xs text-muted-foreground whitespace-nowrap">Parcelas:</Label>
                              <Select value={String(installments)} onValueChange={(v) => setInstallments(Number(v))}>
                                <SelectTrigger className="bg-muted/50 border-border/30 h-9 w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 23 }, (_, i) => i + 2).map((n) => (
                                    <SelectItem key={n} value={String(n)}>{n}x</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {amountCents > 0 && (
                                <span className="text-[11px] text-muted-foreground">
                                  = R$ {formatCurrency(Math.round(amountCents / installments))}/mês
                                </span>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Observation */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <StickyNote className="w-4 h-4 text-muted-foreground" />
                    Observação
                  </div>
                  <Input
                    placeholder="Adicionar nota (opcional)"
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    className="bg-muted/50 border-border/30 h-11"
                    maxLength={200}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2 pb-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 h-12 font-semibold text-sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || amountCents === 0}
                    className="flex-1 h-12 font-semibold text-sm"
                    style={{ background: accentColor }}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NovaTransacaoModal;
