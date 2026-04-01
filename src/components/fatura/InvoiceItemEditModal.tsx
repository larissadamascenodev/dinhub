import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Pencil, Tag, DollarSign, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, type EnrichedItem } from "@/pages/FaturaCartao";
import { Input } from "@/components/ui/input";
import { getCustomCategories, type CustomCategory } from "@/services/categoryService";

interface Props {
  item: EnrichedItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (transactionId: string, updates: { name?: string; amount?: number; category?: string }) => Promise<void>;
}

const DEFAULT_CATEGORIES = [
  "Alimentação", "Transporte", "Saúde", "Assinaturas",
  "Lazer", "Moradia", "Educação", "Vestuário", "Pets",
  "Beleza", "Presentes", "Viagem", "Tecnologia", "Impostos",
];

export default function InvoiceItemEditModal({ item, open, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [customCats, setCustomCats] = useState<CustomCategory[]>([]);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    if (item && open) {
      setName(item.transaction_name ?? "");
      setAmount(String(Number(item.amount ?? 0)));
      setCategory(item.transaction_category ?? "");
      setShowCategories(false);
    }
  }, [item, open]);

  useEffect(() => {
    getCustomCategories("despesa").then(setCustomCats).catch(() => {});
  }, []);

  if (!open || !item) return null;

  const isInstallment = item.total_installments > 1;
  const allCategories = [
    ...customCats.map((c) => ({ name: c.name, icon: c.icon, color: c.color, isCustom: true })),
    ...DEFAULT_CATEGORIES.map((name) => ({ name, icon: "📋", color: "#666", isCustom: false })),
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const newAmount = parseFloat(amount);
      const updates: { name?: string; amount?: number; category?: string } = {};
      if (name !== item.transaction_name) updates.name = name;
      if (!isNaN(newAmount) && newAmount !== Number(item.amount)) updates.amount = newAmount;
      if (category !== item.transaction_category) updates.category = category;
      if (Object.keys(updates).length > 0) {
        await onSave(item.transaction_id, updates);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-md max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card border border-border/20 shadow-2xl"
        >
          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"
                  style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.3))" }}>
                  <Pencil className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Editar Lançamento</h2>
                  {isInstallment && (
                    <p className="text-[10px] text-muted-foreground">
                      Parcela {item.installment_number}/{item.total_installments}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Name field */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Descrição
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 bg-muted/20 border-border/20 text-sm rounded-xl"
                placeholder="Nome da transação"
              />
            </div>

            {/* Amount field */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1.5">
                <DollarSign className="w-3 h-3" /> {isInstallment ? "Valor da parcela" : "Valor"}
              </label>
              <Input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-11 bg-muted/20 border-border/20 text-sm rounded-xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                placeholder="0,00"
              />
              {isInstallment && (
                <p className="text-[10px] text-muted-foreground">
                  Total: {formatCurrency(Number(amount || 0) * item.total_installments)}
                </p>
              )}
            </div>

            {/* Category field */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Tag className="w-3 h-3" /> Categoria
              </label>
              <button
                type="button"
                onClick={() => setShowCategories(!showCategories)}
                className="w-full h-11 px-3 rounded-xl bg-muted/20 border border-border/20 flex items-center justify-between text-sm text-foreground hover:bg-muted/30 transition-colors"
              >
                <span className={category ? "text-foreground" : "text-muted-foreground"}>
                  {category || "Selecionar categoria"}
                </span>
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              <AnimatePresence>
                {showCategories && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-1.5 pt-1.5 max-h-40 overflow-y-auto">
                      {allCategories.map((cat) => (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => {
                            setCategory(cat.name);
                            setShowCategories(false);
                          }}
                          className={cn(
                            "flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left",
                            category === cat.name
                              ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                              : "bg-muted/10 text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                          )}
                        >
                          <span className="text-sm" style={{ filter: "saturate(1.3) brightness(1.2)" }}>{cat.icon}</span>
                          <span className="truncate">{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 rounded-xl text-xs font-bold border border-border/30 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className={cn(
                  "flex-1 h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                  name.trim()
                    ? "bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25"
                    : "bg-muted/20 text-muted-foreground border border-border/10 cursor-not-allowed"
                )}
              >
                <Check className="w-3.5 h-3.5" />
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
