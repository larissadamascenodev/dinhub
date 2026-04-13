import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles, Loader2, TrendingUp, Pencil, CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InvestmentCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    initial_balance: number;
    color: string;
    annual_rate?: number | null;
    rate_type?: string;
    maturity_date?: Date | null;
    start_date?: Date;
  }) => void;
}

const INVESTMENT_PRESETS = [
  { id: "patrimonio", name: "Crescer Patrimônio", emoji: "📈", subtitle: "Fazer seu dinheiro render e multiplicar", coverUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80" },
  { id: "renda_passiva", name: "Renda Passiva", emoji: "💸", subtitle: "Ganhar dinheiro sem trabalhar ativamente", coverUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80" },
  { id: "aposentadoria", name: "Aposentadoria", emoji: "🌅", subtitle: "Garantir um futuro tranquilo e seguro", coverUrl: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&q=80" },
  { id: "reserva", name: "Reserva Segura", emoji: "🛡️", subtitle: "Proteger seu dinheiro com segurança", coverUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80" },
  { id: "liberdade", name: "Liberdade Financeira", emoji: "🚀", subtitle: "Conquistar independência financeira", coverUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80" },
  { id: "educacao", name: "Educação / Filhos", emoji: "🎓", subtitle: "Investir no futuro da família", coverUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=600&q=80" },
];

const COLOR_OPTIONS = [
  { value: "violet", label: "Roxo" },
  { value: "emerald", label: "Verde" },
  { value: "sky", label: "Azul" },
  { value: "amber", label: "Laranja" },
  { value: "rose", label: "Rosa" },
  { value: "cyan", label: "Ciano" },
];

const COLOR_CLASSES: Record<string, string> = {
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  cyan: "bg-cyan-500",
};

const AMOUNT_CHIPS = [
  { label: "500", value: 500 },
  { label: "1k", value: 1000 },
  { label: "5k", value: 5000 },
  { label: "10k", value: 10000 },
  { label: "25k", value: 25000 },
  { label: "50k", value: 50000 },
  { label: "100k", value: 100000 },
];

const fmtShort = (v: number) => {
  if (v >= 1000000) return `${(v / 1000000).toLocaleString("pt-BR")}M`;
  if (v >= 1000) return `${(v / 1000).toLocaleString("pt-BR")}k`;
  return v.toLocaleString("pt-BR");
};

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const InvestmentCreateModal = ({ open, onClose, onSubmit }: InvestmentCreateModalProps) => {
  const [step, setStep] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [initialBalance, setInitialBalance] = useState(0);
  const [balanceInput, setBalanceInput] = useState("0");
  const [selectedColor, setSelectedColor] = useState("emerald");
  const [submitting, setSubmitting] = useState(false);

  // Rate & date fields
  const [ratePeriod, setRatePeriod] = useState<"monthly" | "annual">("monthly");
  const [rateInput, setRateInput] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [maturityDate, setMaturityDate] = useState<Date | null>(null);

  const reset = useCallback(() => {
    setStep(0);
    setSelectedPreset(null);
    setCustomName("");
    setInitialBalance(0);
    setBalanceInput("0");
    setSelectedColor("emerald");
    setSubmitting(false);
    setRatePeriod("monthly");
    setRateInput("");
    setStartDate(new Date());
    setMaturityDate(null);
  }, []);

  const handleClose = () => {
    onClose();
    setTimeout(reset, 300);
  };

  const isCustom = selectedPreset === "custom";
  const preset = INVESTMENT_PRESETS.find((p) => p.id === selectedPreset);
  const investName = isCustom ? customName.trim() : (preset?.name ?? "");
  const investEmoji = isCustom ? "💼" : (preset?.emoji ?? "📊");
  const investSubtitle = isCustom ? "Sua carteira personalizada" : (preset?.subtitle ?? "");
  const investCover = preset?.coverUrl ?? null;

  const handleSelectPreset = (id: string) => {
    setSelectedPreset(id);
    if (id !== "custom") {
      setStep(1);
    }
  };

  const handleAmountChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const num = parseInt(digits || "0", 10);
    setInitialBalance(num);
    setBalanceInput(num.toLocaleString("pt-BR"));
  };

  const handleChip = (value: number) => {
    setInitialBalance(value);
    setBalanceInput(value.toLocaleString("pt-BR"));
  };

  // Compute effective monthly rate for display
  const getMonthlyRate = (): number | null => {
    if (!rateInput) return null;
    const raw = parseFloat(rateInput.replace(",", "."));
    if (isNaN(raw) || raw <= 0) return null;
    if (ratePeriod === "monthly") return raw;
    return Number(((Math.pow(1 + raw / 100, 1 / 12) - 1) * 100).toFixed(4));
  };

  const handleSubmit = async () => {
    if (!investName) return;
    setSubmitting(true);
    try {
      let annual_rate: number | null = null;
      if (rateInput) {
        const raw = parseFloat(rateInput.replace(",", "."));
        if (!isNaN(raw) && raw > 0) {
          annual_rate = ratePeriod === "annual"
            ? Number(((Math.pow(1 + raw / 100, 1 / 12) - 1) * 100).toFixed(6))
            : raw;
        }
      }
      await onSubmit({
        name: investName,
        initial_balance: initialBalance,
        color: selectedColor,
        annual_rate,
        rate_type: "fixed_monthly",
        start_date: startDate,
        maturity_date: maturityDate,
      });
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedStep0 = isCustom ? customName.trim().length > 0 : !!selectedPreset;
  const monthlyRate = getMonthlyRate();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg max-h-[92vh] rounded-t-3xl sm:rounded-3xl bg-card border border-border/15 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  {step === 0 ? "Novo Investimento" : step === 1 ? "Detalhes" : "Tudo Pronto"}
                </span>
              </div>
              <button onClick={handleClose} className="p-1.5 rounded-full hover:bg-muted/15 transition-colors">
                <X className="w-4 h-4 text-muted-foreground/50" />
              </button>
            </div>

            {/* Steps indicator */}
            <div className="flex gap-1.5 px-5 pb-3">
              {[0, 1, 2].map((s) => (
                <div
                  key={s}
                  className="h-1 rounded-full flex-1 transition-all duration-500"
                  style={{
                    background: s <= step ? "hsl(150 100% 45%)" : "hsl(var(--muted) / 0.15)",
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-2">
              <AnimatePresence mode="wait">
                {/* STEP 0 — Choose type */}
                {step === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                  >
                     <div>
                       <h2 className="text-lg font-bold text-foreground">Qual é o seu objetivo?</h2>
                       <p className="text-xs text-muted-foreground/60 mt-0.5">Escolha o que te motiva a investir</p>
                     </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {INVESTMENT_PRESETS.map((p) => {
                        const isSelected = selectedPreset === p.id;
                        return (
                          <motion.button
                            key={p.id}
                            whileTap={{ scale: 0.96 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleSelectPreset(p.id)}
                            className={`relative rounded-2xl overflow-hidden text-left transition-all h-32 group ${
                              isSelected ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""
                            }`}
                          >
                            <img
                              src={p.coverUrl}
                              alt={p.name}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                            <div className="relative h-full flex flex-col justify-end p-3.5">
                              <span className="text-xl mb-1 drop-shadow-lg">{p.emoji}</span>
                              <p className="text-[13px] font-bold text-white leading-tight drop-shadow-md">{p.name}</p>
                              <p className="text-[9px] text-white/60 leading-tight mt-0.5 line-clamp-1">{p.subtitle}</p>
                            </div>
                          </motion.button>
                        );
                      })}

                      {/* Custom */}
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleSelectPreset("custom")}
                        className={`relative rounded-2xl overflow-hidden text-left transition-all h-32 col-span-2 ${
                          isCustom ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-card border border-primary/15 rounded-2xl" />
                        <div className="relative h-full flex items-center gap-4 px-5">
                          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <Pencil className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">Personalizar</p>
                            <p className="text-[11px] text-muted-foreground/60">Crie uma carteira com o nome que quiser</p>
                          </div>
                        </div>
                      </motion.button>
                    </div>

                    {/* Custom name input */}
                    <AnimatePresence>
                      {isCustom && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-1">
                            <label className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-1.5 block">
                              Nome da carteira
                            </label>
                            <Input
                              value={customName}
                              onChange={(e) => setCustomName(e.target.value)}
                              placeholder="Ex: CDB Nubank, Tesouro Selic..."
                              className="bg-muted/10 border-border/15 h-12 text-sm"
                              autoFocus
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* STEP 1 — Details: rate, dates, amount, color */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                  >
                    {/* Banner image */}
                    {investCover && (
                      <div className="relative rounded-2xl overflow-hidden h-36 -mx-1">
                        <img src={investCover} alt={investName} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                        <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
                          <span className="text-2xl drop-shadow-lg">{investEmoji}</span>
                          <div>
                            <p className="text-base font-bold text-white drop-shadow-md">{investName}</p>
                            <p className="text-[10px] text-white/60 drop-shadow-sm">{investSubtitle}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!investCover && (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{investEmoji}</span>
                        <div>
                          <p className="text-base font-bold text-foreground">{investName}</p>
                          <p className="text-[10px] text-muted-foreground/50">{investSubtitle}</p>
                        </div>
                      </div>
                    )}

                    {/* Rate input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                        Taxa de rendimento
                      </label>
                      <div className="flex items-center gap-2 mb-1.5">
                        <button
                          type="button"
                          onClick={() => setRatePeriod("monthly")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            ratePeriod === "monthly"
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "bg-muted/10 text-muted-foreground/50 border border-border/10"
                          }`}
                        >
                          % a.m.
                        </button>
                        <button
                          type="button"
                          onClick={() => setRatePeriod("annual")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            ratePeriod === "annual"
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "bg-muted/10 text-muted-foreground/50 border border-border/10"
                          }`}
                        >
                          % a.a.
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          placeholder={ratePeriod === "monthly" ? "0,50" : "6,00"}
                          value={rateInput}
                          onChange={(e) => setRateInput(e.target.value)}
                          className="bg-muted/10 border-border/15 h-11 rounded-xl pr-16"
                          inputMode="decimal"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/40 pointer-events-none">
                          {ratePeriod === "monthly" ? "% a.m." : "% a.a."}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground/40">
                        {ratePeriod === "monthly"
                          ? "Ex: 0,5 para 0,5% ao mês (juros compostos)"
                          : "Ex: 6 para 6% ao ano (será convertido)"}
                      </p>
                    </div>

                    {/* Dates row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                          Data de início
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal bg-muted/10 border-border/15 h-11 rounded-xl text-xs"
                            >
                              <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground/40" />
                              {format(startDate, "d 'de' MMM. yyyy", { locale: ptBR })}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={(d) => {
                                if (d) setStartDate(d);
                                document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
                              }}
                              initialFocus
                              className="p-2 pointer-events-auto text-xs [&_table]:text-xs [&_button]:h-7 [&_button]:w-7 [&_th]:w-7 [&_.rdp-caption]:text-sm"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                          Vencimento <span className="font-normal normal-case">(opcional)</span>
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal bg-muted/10 border-border/15 h-11 rounded-xl text-xs ${
                                !maturityDate ? "text-muted-foreground/40" : ""
                              }`}
                            >
                              <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground/40" />
                              {maturityDate ? format(maturityDate, "d 'de' MMM. yyyy", { locale: ptBR }) : "dd/mm/aaaa"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={maturityDate ?? undefined}
                              onSelect={(d) => {
                                setMaturityDate(d ?? null);
                                document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
                              }}
                              initialFocus
                              className="p-2 pointer-events-auto text-xs [&_table]:text-xs [&_button]:h-7 [&_button]:w-7 [&_th]:w-7 [&_.rdp-caption]:text-sm"
                            />
                          </PopoverContent>
                        </Popover>
                        <p className="text-[9px] text-muted-foreground/40">Calcula valor estimado no vencimento</p>
                      </div>
                    </div>

                    {/* Amount input */}
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-1.5 block">
                        Valor investido <span className="font-normal normal-case">(opcional)</span>
                      </label>
                      <div className="rounded-2xl border border-border/15 bg-muted/5 p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-muted-foreground/50">R$</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={balanceInput}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            className="flex-1 bg-transparent text-2xl font-bold text-foreground outline-none tabular-nums"
                          />
                          {initialBalance > 0 && (
                            <span className="text-xs text-muted-foreground/30 tabular-nums">{fmtShort(initialBalance)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick chips */}
                    <div className="flex flex-wrap gap-2">
                      {AMOUNT_CHIPS.map((chip) => {
                        const isActive = initialBalance === chip.value;
                        return (
                          <motion.button
                            key={chip.value}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleChip(chip.value)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                              isActive
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : "bg-muted/10 text-muted-foreground/50 border border-border/10 hover:bg-muted/15"
                            }`}
                          >
                            {chip.label}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Color picker */}
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2 block">
                        Cor da carteira
                      </label>
                      <div className="flex gap-2.5">
                        {COLOR_OPTIONS.map((c) => (
                          <motion.button
                            key={c.value}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedColor(c.value)}
                            className={`w-8 h-8 rounded-full ${COLOR_CLASSES[c.value]} transition-all ${
                              selectedColor === c.value
                                ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110"
                                : "opacity-50 hover:opacity-75"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 — Summary */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                  >
                    {/* Banner image or gradient hero */}
                    {investCover ? (
                      <div className="relative rounded-2xl overflow-hidden h-40 -mx-1">
                        <img src={investCover} alt={investName} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                          <span className="text-4xl drop-shadow-lg">{investEmoji}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <span className="text-4xl">{investEmoji}</span>
                      </div>
                    )}

                    <div className="text-center space-y-2">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/70">Sua Carteira de Investimento</p>
                      <h2 className="text-xl font-bold text-foreground">{investName}</h2>
                      {initialBalance > 0 && (
                        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/15">
                          <TrendingUp className="w-3.5 h-3.5 text-primary" />
                          <span className="text-sm font-bold text-primary tabular-nums">{fmt(initialBalance)}</span>
                        </div>
                      )}
                    </div>

                    {/* Info card */}
                    <div className="rounded-2xl border border-border/15 bg-muted/5 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Carteira pronta para crescer! 📈</p>
                          <p className="text-[11px] text-muted-foreground/60 mt-1 leading-relaxed">
                            Acompanhe a evolução do seu patrimônio. Você poderá adicionar e retirar valores a qualquer momento.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Summary cards */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl border border-border/10 bg-muted/5 px-4 py-3">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/40">Valor Inicial</p>
                        <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">{fmt(initialBalance)}</p>
                      </div>
                      <div className="rounded-xl border border-border/10 bg-muted/5 px-4 py-3">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/40">Rendimento</p>
                        <p className="text-sm font-bold text-foreground mt-0.5 truncate">
                          {monthlyRate ? `${monthlyRate.toLocaleString("pt-BR")}% a.m.` : "—"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/10 bg-muted/5 px-4 py-3">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/40">Início</p>
                        <p className="text-sm font-bold text-foreground mt-0.5">{format(startDate, "dd/MM/yyyy")}</p>
                      </div>
                      <div className="rounded-xl border border-border/10 bg-muted/5 px-4 py-3">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/40">Vencimento</p>
                        <p className="text-sm font-bold text-foreground mt-0.5">
                          {maturityDate ? format(maturityDate, "dd/MM/yyyy") : "—"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer buttons */}
            <div className="px-5 pt-2 pb-5 sm:pb-5 pb-8 flex items-center gap-3">
              {step > 0 && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-1 px-4 py-3 rounded-xl border border-border/15 text-xs font-bold text-muted-foreground hover:bg-muted/10 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Voltar
                </motion.button>
              )}

              {step < 2 ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={step === 0 ? !canProceedStep0 : false}
                  onClick={() => {
                    if (step === 0 && isCustom && !customName.trim()) return;
                    setStep((s) => s + 1);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-primary/80 to-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-primary/80 to-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Criando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Criar Carteira
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InvestmentCreateModal;
