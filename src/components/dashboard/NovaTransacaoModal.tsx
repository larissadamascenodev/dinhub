import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createTransaction } from "@/services/transactionService";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES_EXPENSE = [
  "Alimentação", "Transporte", "Saúde", "Assinaturas",
  "Lazer", "Moradia", "Educação", "Outros",
];
const CATEGORIES_INCOME = [
  "Salário", "Freelance", "Investimentos", "Outros",
];

// Format cents to BRL display
function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const NovaTransacaoModal = ({ open, onClose, onSuccess }: Props) => {
  const { user } = useAuth();
  const [type, setType] = useState<"receita" | "despesa">("despesa");
  const [description, setDescription] = useState("");
  const [amountCents, setAmountCents] = useState(0);
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [submitting, setSubmitting] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const categories = type === "receita" ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setType("despesa");
      setDescription("");
      setAmountCents(0);
      setCategory("");
      setDate(new Date());
    }
  }, [open]);

  // Currency mask: user types digits, we accumulate cents
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
        return next > 99999999 ? prev : next; // cap at 999,999.99
      });
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
        { name: finalName, type, amount: realAmount, category, date: dateStr },
        user.id
      );
      toast.success("Boa! Já registrei isso aqui 🎯", {
        description: `${type === "income" ? "Receita" : "Despesa"} de R$ ${formatCurrency(amountCents)}`,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar transação");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md mx-4 rounded-2xl border border-border/20 bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <h2 className="text-lg font-display font-bold text-foreground">Nova transação</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type Toggle */}
            <div className="px-5 pb-3">
              <div className="flex gap-2 p-1 rounded-xl bg-muted/50">
                <button
                  type="button"
                  onClick={() => { setType("expense"); setCategory(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    type === "expense"
                      ? "bg-destructive/20 text-destructive border border-destructive/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => { setType("income"); setCategory(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    type === "income"
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  Receita
                </button>
              </div>
            </div>

            {/* Big Value Display */}
            <div
              className="mx-5 mb-4 rounded-xl p-5 text-center cursor-text"
              style={{
                background: type === "income"
                  ? "hsl(150 100% 45% / 0.06)"
                  : "hsl(0 60% 50% / 0.06)",
                border: `1px solid ${type === "income" ? "hsl(150 100% 45% / 0.15)" : "hsl(0 60% 50% / 0.15)"}`,
              }}
              onClick={() => amountInputRef.current?.focus()}
            >
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">Valor</p>
              <motion.p
                key={amountCents}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                className={`font-display text-3xl md:text-4xl font-bold tabular-nums tracking-tight ${
                  type === "income" ? "text-primary" : "text-destructive"
                }`}
              >
                R$ {formatCurrency(amountCents)}
              </motion.p>
              {/* Hidden input to capture keystrokes */}
              <input
                ref={amountInputRef}
                className="sr-only"
                onKeyDown={handleAmountKeyDown}
                aria-label="Valor da transação"
                autoFocus
              />
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-muted border-border",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {format(date, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Descrição <span className="text-muted-foreground/50">(opcional)</span>
                </Label>
                <Input
                  placeholder="Ex: Supermercado, Salário..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-muted border-border"
                  maxLength={100}
                />
              </div>

              {/* Fixed Save Button */}
              <div className="pt-1">
                <Button
                  type="submit"
                  disabled={submitting || amountCents === 0}
                  className="w-full h-12 font-semibold text-sm"
                  style={{ background: type === "income" ? "var(--gradient-primary)" : undefined }}
                  variant={type === "expense" ? "destructive" : "default"}
                >
                  {submitting ? (
                    <span className="animate-pulse">Salvando...</span>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1.5" />
                      Adicionar transação
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NovaTransacaoModal;
