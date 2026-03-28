import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const NovaTransacaoModal = ({ open, onClose, onSuccess }: Props) => {
  const { user } = useAuth();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  const categories = type === "income" ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim() || !amount || !category || !date) {
      toast.error("Preencha todos os campos");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Valor inválido");
      return;
    }

    setSubmitting(true);
    try {
      await createTransaction(
        { name: name.trim(), type, amount: parsedAmount, category, date },
        user.id
      );
      toast.success(type === "income" ? "Receita adicionada!" : "Despesa adicionada!");
      setName("");
      setAmount("");
      setCategory("");
      setDate(new Date().toISOString().split("T")[0]);
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
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border/20 bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-lg font-display font-bold text-foreground">Nova transação</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type Toggle */}
            <div className="px-5 pb-4">
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Descrição</Label>
                <Input
                  placeholder="Ex: Supermercado, Salário..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-muted border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-muted border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Data</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-muted border-border"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 font-semibold"
                style={{ background: type === "income" ? "var(--gradient-primary)" : undefined }}
                variant={type === "expense" ? "destructive" : "default"}
              >
                {submitting ? (
                  <span className="animate-pulse">Salvando...</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" />
                    {type === "income" ? "Adicionar receita" : "Adicionar despesa"}
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NovaTransacaoModal;
