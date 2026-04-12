import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles, Loader2, TrendingUp, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";

interface GoalCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    target_amount: number;
    monthly_contribution?: number | null;
    deadline?: string | null;
  }) => void;
}

const GOAL_PRESETS = [
  { id: "casa", name: "Casa Própria", emoji: "🏠", subtitle: "Conquistar o lar dos seus sonhos", coverUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80" },
  { id: "carro", name: "Carro Novo", emoji: "🚗", subtitle: "Dirigir o carro que você sempre quis", coverUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80" },
  { id: "viagem", name: "Viagem dos Sonhos", emoji: "✈️", subtitle: "Conhecer o mundo e criar memórias", coverUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80" },
  { id: "liberdade", name: "Liberdade Financeira", emoji: "💰", subtitle: "Viver sem depender de salário", coverUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80" },
  { id: "educacao", name: "Educação", emoji: "🎓", subtitle: "Investir no seu futuro profissional", coverUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=600&q=80" },
  { id: "aposentadoria", name: "Aposentadoria Tranquila", emoji: "🌅", subtitle: "Curtir a vida com tranquilidade", coverUrl: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&q=80" },
  { id: "emergencia", name: "Reserva de Emergência", emoji: "🛡️", subtitle: "Proteção para imprevistos da vida", coverUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80" },
  { id: "negocio", name: "Negócio Próprio", emoji: "🚀", subtitle: "Empreender e ser dono do seu tempo", coverUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80" },
];

const AMOUNT_CHIPS = [
  { label: "5k", value: 5000 },
  { label: "10k", value: 10000 },
  { label: "25k", value: 25000 },
  { label: "50k", value: 50000 },
  { label: "100k", value: 100000 },
  { label: "250k", value: 250000 },
  { label: "500k", value: 500000 },
  { label: "1M", value: 1000000 },
];

const fmtShort = (v: number) => {
  if (v >= 1000000) return `${(v / 1000000).toLocaleString("pt-BR")}M`;
  if (v >= 1000) return `${(v / 1000).toLocaleString("pt-BR")}k`;
  return v.toLocaleString("pt-BR");
};

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const GoalCreateModal = ({ open, onClose, onSubmit }: GoalCreateModalProps) => {
  const [step, setStep] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [targetAmount, setTargetAmount] = useState(50000);
  const [amountInput, setAmountInput] = useState("50.000");
  const [submitting, setSubmitting] = useState(false);

  const reset = useCallback(() => {
    setStep(0);
    setSelectedPreset(null);
    setCustomName("");
    setTargetAmount(50000);
    setAmountInput("50.000");
    setSubmitting(false);
  }, []);

  const handleClose = () => {
    onClose();
    setTimeout(reset, 300);
  };

  const isCustom = selectedPreset === "custom";
  const preset = GOAL_PRESETS.find((p) => p.id === selectedPreset);
  const goalName = isCustom ? customName.trim() : (preset?.name ?? "");
  const goalEmoji = isCustom ? "✨" : (preset?.emoji ?? "🎯");
  const goalSubtitle = isCustom ? "Sua meta personalizada" : (preset?.subtitle ?? "");
  const goalCover = preset?.coverUrl ?? null;

  const handleSelectPreset = (id: string) => {
    setSelectedPreset(id);
    if (id !== "custom") {
      setStep(1);
    }
  };

  const handleAmountChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const num = parseInt(digits || "0", 10);
    setTargetAmount(num);
    setAmountInput(num.toLocaleString("pt-BR"));
  };

  const handleChip = (value: number) => {
    setTargetAmount(value);
    setAmountInput(value.toLocaleString("pt-BR"));
  };

  const handleSubmit = async () => {
    if (!goalName || targetAmount <= 0) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: goalName,
        target_amount: targetAmount,
        monthly_contribution: null,
        deadline: null,
      });
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedStep0 = isCustom ? customName.trim().length > 0 : !!selectedPreset;
  const canProceedStep1 = targetAmount > 0;

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
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  {step === 0 ? "Nova Meta" : step === 1 ? "Valor da Meta" : "Tudo Pronto"}
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
                {/* STEP 0 — Choose category */}
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
                      <h2 className="text-lg font-bold text-foreground">Qual é o sonho que te motiva?</h2>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">Escolha seu grande objetivo</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {GOAL_PRESETS.map((p) => {
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

                      {/* Custom / Outro */}
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
                            <p className="text-[11px] text-muted-foreground/60">Crie uma meta com o nome que quiser</p>
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
                              Nome da meta
                            </label>
                            <Input
                              value={customName}
                              onChange={(e) => setCustomName(e.target.value)}
                              placeholder="Ex: Fundo para faculdade, Moto nova..."
                              className="bg-muted/10 border-border/15 h-12 text-sm"
                              autoFocus
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* STEP 1 — Amount */}
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
                    {goalCover && (
                      <div className="relative rounded-2xl overflow-hidden h-36 -mx-1">
                        <img src={goalCover} alt={goalName} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                        <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
                          <span className="text-2xl drop-shadow-lg">{goalEmoji}</span>
                          <div>
                            <p className="text-base font-bold text-white drop-shadow-md">{goalName}</p>
                            <p className="text-[10px] text-white/60 drop-shadow-sm">{goalSubtitle}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!goalCover && (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{goalEmoji}</span>
                        <div>
                          <p className="text-base font-bold text-foreground">{goalName}</p>
                          <p className="text-[10px] text-muted-foreground/50">{goalSubtitle}</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <h2 className="text-lg font-bold text-foreground">Quanto quer juntar?</h2>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">Defina o valor total da sua meta</p>
                    </div>

                    {/* Amount input */}
                    <div className="rounded-2xl border border-border/15 bg-muted/5 p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-muted-foreground/50">R$</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={amountInput}
                          onChange={(e) => handleAmountChange(e.target.value)}
                          className="flex-1 bg-transparent text-2xl font-bold text-foreground outline-none tabular-nums"
                        />
                        <span className="text-xs text-muted-foreground/30 tabular-nums">{fmtShort(targetAmount)}</span>
                      </div>
                    </div>

                    {/* Quick chips */}
                    <div className="flex flex-wrap gap-2">
                      {AMOUNT_CHIPS.map((chip) => {
                        const isActive = targetAmount === chip.value;
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
                    {goalCover ? (
                      <div className="relative rounded-2xl overflow-hidden h-40 -mx-1">
                        <img src={goalCover} alt={goalName} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                          <span className="text-4xl drop-shadow-lg">{goalEmoji}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <span className="text-4xl">{goalEmoji}</span>
                      </div>
                    )}

                    <div className="text-center space-y-2">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/70">Sua Meta Financeira</p>
                      <h2 className="text-xl font-bold text-foreground">{goalName}</h2>
                      <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/15">
                        <TrendingUp className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-bold text-primary tabular-nums">{fmt(targetAmount)}</span>
                      </div>
                    </div>

                    {/* Info card */}
                    <div className="rounded-2xl border border-border/15 bg-muted/5 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Tudo pronto para começar! 🎯</p>
                          <p className="text-[11px] text-muted-foreground/60 mt-1 leading-relaxed">
                            Sua meta ficará sempre visível, te lembrando por quê você está economizando. Acompanhe seu progresso a qualquer momento.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Summary cards */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl border border-border/10 bg-muted/5 px-4 py-3">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/40">Meta</p>
                        <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">{fmt(targetAmount)}</p>
                      </div>
                      <div className="rounded-xl border border-border/10 bg-muted/5 px-4 py-3">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/40">Objetivo</p>
                        <p className="text-sm font-bold text-foreground mt-0.5 truncate">{goalName}</p>
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
                  disabled={step === 0 ? !canProceedStep0 : !canProceedStep1}
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
                      <Sparkles className="w-4 h-4" /> Começar Jornada
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

export default GoalCreateModal;
