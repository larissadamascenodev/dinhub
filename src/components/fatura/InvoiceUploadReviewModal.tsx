import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Check, Loader2, Sparkles, ShieldCheck, ShieldAlert, AlertTriangle,
  Edit3, ChevronDown, ArrowDownCircle, ArrowUpCircle, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { DEFAULT_CATEGORY_ICONS, DEFAULT_CATEGORY_COLORS } from "@/lib/categoryIcons";

export interface ExtractedItem {
  description: string;
  amount: number;
  date: string | null;
  installment_current: number | null;
  installment_total: number | null;
  category: string;
  type?: string;
  confidence?: number;
  merchant?: string | null;
  selected: boolean;
  is_recurring?: boolean;
  time?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  items: ExtractedItem[];
  message: string;
  onConfirm: (items: ExtractedItem[]) => void;
  confirming: boolean;
  avgConfidence?: number;
  onFallback?: (item: ExtractedItem) => void;
}

const CATEGORIES = Object.keys(DEFAULT_CATEGORY_ICONS);

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  if (confidence >= 0.8) {
    return (
      <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 px-2 py-1 rounded-full">
        <ShieldCheck className="w-3 h-3 text-primary" />
        <span className="text-[10px] font-bold text-primary">{pct}%</span>
      </div>
    );
  }
  if (confidence >= 0.5) {
    return (
      <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full">
        <ShieldAlert className="w-3 h-3 text-amber-400" />
        <span className="text-[10px] font-bold text-amber-400">{pct}%</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 bg-destructive/10 border border-destructive/20 px-2 py-1 rounded-full">
      <AlertTriangle className="w-3 h-3 text-destructive" />
      <span className="text-[10px] font-bold text-destructive">{pct}%</span>
    </div>
  );
}

function CategoryPickerSheet({
  open,
  selected,
  onSelect,
  onClose,
}: {
  open: boolean;
  selected: string;
  onSelect: (cat: string) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-card border border-border/20 shadow-2xl max-h-[60vh] flex flex-col"
        >
          <div className="p-4 pb-2 flex items-center justify-between shrink-0 border-b border-border/10">
            <h3 className="text-sm font-bold text-foreground">Selecionar Categoria</h3>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-none overscroll-contain">
            {CATEGORIES.map((cat) => {
              const Icon = DEFAULT_CATEGORY_ICONS[cat];
              const colorHsl = DEFAULT_CATEGORY_COLORS[cat] || "0 0% 60%";
              const isSelected = cat.toLowerCase() === selected.toLowerCase();

              return (
                <button
                  key={cat}
                  onClick={() => { onSelect(cat.toLowerCase()); onClose(); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                    isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/15"
                  )}
                >
                  {Icon && (
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `hsl(${colorHsl} / 0.15)` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: `hsl(${colorHsl})` }} />
                    </div>
                  )}
                  <span className={cn(
                    "text-[13px] font-medium",
                    isSelected ? "text-primary font-bold" : "text-foreground"
                  )}>
                    {cat}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-primary ml-auto" />}
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function SingleItemReview({
  item,
  onUpdate,
  onConfirm,
  confirming,
}: {
  item: ExtractedItem;
  onUpdate: (field: keyof ExtractedItem, value: any) => void;
  onConfirm: () => void;
  confirming: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const conf = item.confidence || 0.5;
  const isExpense = item.type === "despesa";

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    const date = new Date(d + "T12:00:00");
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Find category icon for display
  const matchedCat = CATEGORIES.find((c) => c.toLowerCase() === (item.category || "").toLowerCase());
  const CatIcon = matchedCat ? DEFAULT_CATEGORY_ICONS[matchedCat] : null;
  const catColor = matchedCat ? DEFAULT_CATEGORY_COLORS[matchedCat] : "0 0% 60%";

  return (
    <div className="space-y-4">
      {/* Confidence badge top-right */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">Detecção por IA</span>
        </div>
        <ConfidenceBadge confidence={conf} />
      </div>

      {/* Type indicator + Amount */}
      <div className="text-center space-y-1 py-2">
        <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Valor</span>

        {editing ? (
          <div className="flex items-center justify-center gap-1">
            <span className={cn("text-lg font-bold", isExpense ? "text-destructive" : "text-primary")}>
              R$
            </span>
            <input
              type="number"
              step="0.01"
              value={item.amount.toFixed(2)}
              onChange={(e) => onUpdate("amount", parseFloat(e.target.value) || 0)}
              className="w-36 text-3xl font-bold bg-transparent border-none outline-none focus:ring-0 px-0 py-0 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-foreground"
              style={{ fontSize: '1.875rem', lineHeight: '2.25rem' }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5">
            <span className={cn("text-lg font-bold", isExpense ? "text-destructive" : "text-primary")}>
              R$
            </span>
            <span className="text-3xl font-bold text-foreground">
              {item.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {/* Details card */}
      <div className="bg-muted/10 border border-border/15 rounded-xl divide-y divide-border/10">
        {/* Description */}
        <div className="flex items-center justify-between px-4 py-3 gap-3">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wide shrink-0">Descrição</span>
          {editing ? (
            <Input
              value={item.description}
              onChange={(e) => onUpdate("description", e.target.value)}
              className="h-7 flex-1 text-[13px] font-semibold text-right bg-transparent border-none focus-visible:ring-0 px-0"
            />
          ) : (
            <span className="text-[13px] font-semibold text-foreground truncate text-right">{item.description}</span>
          )}
        </div>

        {/* Merchant */}
        {(item.merchant || editing) && (
          <div className="flex items-center justify-between px-4 py-3 gap-3">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wide shrink-0">Estabelecimento</span>
            {editing ? (
              <Input
                value={item.merchant || ""}
                onChange={(e) => onUpdate("merchant", e.target.value)}
                placeholder="Nome do local"
                className="h-7 flex-1 text-[13px] text-right bg-transparent border-none focus-visible:ring-0 px-0"
              />
            ) : (
              <span className="text-[13px] text-foreground truncate text-right">{item.merchant}</span>
            )}
          </div>
        )}

        {/* Date */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Data</span>
          {editing ? (
            <Input
              type="date"
              value={item.date || ""}
              onChange={(e) => onUpdate("date", e.target.value)}
              className="h-7 w-[150px] text-[13px] text-right bg-transparent border-none focus-visible:ring-0 px-0 [color-scheme:dark]"
            />
          ) : (
            <span className="text-[13px] text-foreground capitalize">{formatDate(item.date)}</span>
          )}
        </div>

        {/* Time (read-only, detected from receipt) */}
        {item.time && (
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Horário</span>
            </div>
            <span className="text-[13px] text-foreground">{item.time}</span>
          </div>
        )}

        {/* Category */}
        <button
          onClick={() => setShowCategoryPicker(true)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Categoria</span>
          <div className="flex items-center gap-2">
            {CatIcon && (
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ backgroundColor: `hsl(${catColor} / 0.15)` }}
              >
                <CatIcon className="w-3 h-3" style={{ color: `hsl(${catColor})` }} />
              </div>
            )}
            <span className="text-[13px] font-medium text-foreground capitalize">{item.category}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        </button>

        {/* Type toggle */}
        {editing && (
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Tipo</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdate("type", "despesa")}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-bold transition-colors",
                  item.type === "despesa"
                    ? "bg-destructive/20 text-destructive"
                    : "bg-muted/20 text-muted-foreground"
                )}
              >
                Despesa
              </button>
              <button
                onClick={() => onUpdate("type", "receita")}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-bold transition-colors",
                  item.type === "receita"
                    ? "bg-primary/20 text-primary"
                    : "bg-muted/20 text-muted-foreground"
                )}
              >
                Receita
              </button>
            </div>
          </div>
        )}

        {/* Recurrence toggle */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Recorrente</span>
          <Switch
            checked={isRecurring}
            onCheckedChange={(checked) => {
              setIsRecurring(checked);
              onUpdate("is_recurring", checked);
            }}
          />
        </div>
      </div>

      {/* Category picker sheet */}
      <CategoryPickerSheet
        open={showCategoryPicker}
        selected={item.category}
        onSelect={(cat) => onUpdate("category", cat)}
        onClose={() => setShowCategoryPicker(false)}
      />

      {/* Edit toggle */}
      <button
        onClick={() => setEditing(!editing)}
        className="flex items-center gap-2 mx-auto text-xs text-primary hover:text-primary/80 transition-colors"
      >
        <Edit3 className="w-3.5 h-3.5" />
        {editing ? "Fechar edição" : "Editar informações"}
      </button>

      {/* Confirm button */}
      <Button
        onClick={onConfirm}
        disabled={confirming}
        className="w-full h-12 rounded-xl text-sm font-bold"
      >
        {confirming ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Importando...
          </>
        ) : (
          <>
            <Check className="w-4 h-4 mr-2" />
            Confirmar lançamento
          </>
        )}
      </Button>
    </div>
  );
}

function MultiItemReview({
  items,
  setItems,
  onConfirm,
  confirming,
  avgConfidence,
  message,
  onFallback,
}: {
  items: ExtractedItem[];
  setItems: React.Dispatch<React.SetStateAction<ExtractedItem[]>>;
  onConfirm: (items: ExtractedItem[]) => void;
  confirming: boolean;
  avgConfidence?: number;
  message: string;
  onFallback?: (item: ExtractedItem) => void;
}) {
  const toggleItem = (idx: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, selected: !item.selected } : item))
    );
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const selectedItems = items.filter((i) => i.selected);
  const totalSelected = selectedItems.reduce((sum, i) => sum + i.amount, 0);

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="flex flex-col max-h-[75vh]">
      {/* AI Message */}
      <div className="px-5 pb-3 shrink-0 space-y-2">
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-3.5 py-2.5">
          <p className="text-[12px] text-primary font-medium">{message}</p>
        </div>
        {avgConfidence !== undefined && (
          <div className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium",
            avgConfidence >= 0.8
              ? "bg-primary/5 text-primary border border-primary/10"
              : "bg-amber-500/5 text-amber-400 border border-amber-500/10"
          )}>
            {avgConfidence >= 0.8 ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            <span>Confiança geral: {Math.round(avgConfidence * 100)}%</span>
          </div>
        )}
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto px-5 space-y-2 pb-3 min-h-0 scrollbar-none overscroll-contain">
        {items.map((item, idx) => {
          const conf = item.confidence || 0.5;
          const matchedCat = CATEGORIES.find((c) => c.toLowerCase() === (item.category || "").toLowerCase());
          const CatIcon = matchedCat ? DEFAULT_CATEGORY_ICONS[matchedCat] : null;
          const catColor = matchedCat ? DEFAULT_CATEGORY_COLORS[matchedCat] : "0 0% 60%";

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={cn(
                "rounded-xl border p-3 transition-colors",
                item.selected ? "border-primary/30 bg-primary/5" : "border-border/15 bg-muted/10 opacity-50"
              )}
            >
              <div className="flex items-start gap-2.5">
                <button
                  onClick={() => toggleItem(idx)}
                  className={cn(
                    "mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                    item.selected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                  )}
                >
                  {item.selected && <Check className="w-3 h-3" />}
                </button>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12px] font-semibold text-foreground truncate">{item.description}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      {onFallback && (
                        <button onClick={() => onFallback(item)} className="text-primary/60 hover:text-primary transition-colors" title="Editar">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => removeItem(idx)} className="text-muted-foreground/40 hover:text-destructive transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12px] font-bold text-foreground">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      item.type === "receita" ? "text-primary bg-primary/10" : "text-destructive bg-destructive/10"
                    )}>
                      {item.type === "receita" ? "Receita" : "Despesa"}
                    </span>
                    {CatIcon && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: `hsl(${catColor} / 0.1)` }}>
                        <CatIcon className="w-3 h-3" style={{ color: `hsl(${catColor})` }} />
                        <span className="text-[10px] capitalize" style={{ color: `hsl(${catColor})` }}>{item.category}</span>
                      </div>
                    )}
                    <ConfidenceBadge confidence={conf} />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-5 pt-3 border-t border-border/10 shrink-0 space-y-3 pb-24 sm:pb-5">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-muted-foreground">{selectedItems.length} de {items.length} selecionados</span>
          <span className="font-bold text-foreground">{formatCurrency(totalSelected)}</span>
        </div>
        <Button
          onClick={() => onConfirm(selectedItems)}
          disabled={selectedItems.length === 0 || confirming}
          className="w-full h-11 rounded-xl text-xs font-bold"
        >
          {confirming ? (
            <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Importando...</>
          ) : (
            <><Check className="w-3.5 h-3.5 mr-1.5" />Importar {selectedItems.length} lançamento{selectedItems.length !== 1 ? "s" : ""}</>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function InvoiceUploadReviewModal({
  open,
  onClose,
  items: initialItems,
  message,
  onConfirm,
  confirming,
  avgConfidence,
  onFallback,
}: Props) {
  const [items, setItems] = useState<ExtractedItem[]>(initialItems);

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems);
    }
  }, [initialItems]);

  if (!open) return null;

  const isSingleItem = items.length === 1;

  const handleSingleConfirm = () => {
    const item = items[0];
    onConfirm([{ ...item, selected: true }]);
  };

  const handleSingleUpdate = (field: keyof ExtractedItem, value: any) => {
    setItems((prev) => prev.map((item, i) => (i === 0 ? { ...item, [field]: value } : item)));
  };

  return (
    <AnimatePresence>
      <motion.div
        key="invoice-upload-review-overlay"
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
          className={cn(
            "w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-card border border-border/20 shadow-2xl",
            isSingleItem ? "" : "max-h-[85vh] flex flex-col"
          )}
        >
          {/* Header */}
          <div className="p-5 pb-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">
                {isSingleItem ? "Lançamento Detectado" : "Lançamentos Detectados"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isSingleItem ? (
            <div className="px-5 pb-24 sm:pb-5">
              <SingleItemReview
                item={items[0]}
                onUpdate={handleSingleUpdate}
                onConfirm={handleSingleConfirm}
                confirming={confirming}
              />
            </div>
          ) : (
            <MultiItemReview
              items={items}
              setItems={setItems}
              onConfirm={onConfirm}
              confirming={confirming}
              avgConfidence={avgConfidence}
              message={message}
              onFallback={onFallback}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
