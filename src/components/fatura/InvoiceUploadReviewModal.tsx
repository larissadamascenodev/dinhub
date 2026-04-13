import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Trash2, Loader2, Package, Sparkles, AlertTriangle, ShieldCheck, ShieldAlert, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

function ConfidenceBadge({ confidence }: { confidence: number }) {
  if (confidence >= 0.8) {
    return (
      <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">
        <ShieldCheck className="w-3 h-3 text-primary" />
        <span className="text-[9px] font-bold text-primary">{Math.round(confidence * 100)}%</span>
      </div>
    );
  }
  if (confidence >= 0.5) {
    return (
      <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
        <ShieldAlert className="w-3 h-3 text-amber-400" />
        <span className="text-[9px] font-bold text-amber-400">{Math.round(confidence * 100)}%</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 bg-destructive/10 border border-destructive/20 px-1.5 py-0.5 rounded-full">
      <AlertTriangle className="w-3 h-3 text-destructive" />
      <span className="text-[9px] font-bold text-destructive">{Math.round(confidence * 100)}%</span>
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

  if (!open) return null;

  const toggleItem = (idx: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, selected: !item.selected } : item))
    );
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof ExtractedItem, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleEditManually = (item: ExtractedItem) => {
    if (onFallback) {
      onFallback(item);
    }
  };

  const selectedItems = items.filter((i) => i.selected);
  const totalSelected = selectedItems.reduce((sum, i) => sum + i.amount, 0);
  const lowConfidenceCount = items.filter((i) => (i.confidence || 0) < 0.7).length;

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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
          className="w-full sm:max-w-lg max-h-[85vh] rounded-t-2xl sm:rounded-2xl bg-card border border-border/20 shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-5 pb-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Lançamentos Detectados</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* AI Message */}
          <div className="px-5 pb-3 shrink-0 space-y-2">
            <div className="bg-primary/10 border border-primary/20 rounded-xl px-3.5 py-2.5">
              <p className="text-[12px] text-primary font-medium">{message}</p>
            </div>

            {/* Confidence summary */}
            {avgConfidence !== undefined && (
              <div className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium",
                avgConfidence >= 0.8
                  ? "bg-primary/5 text-primary border border-primary/10"
                  : avgConfidence >= 0.5
                    ? "bg-amber-500/5 text-amber-400 border border-amber-500/10"
                    : "bg-destructive/5 text-destructive border border-destructive/10"
              )}>
                {avgConfidence >= 0.8 ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                <span>
                  Confiança geral: {Math.round(avgConfidence * 100)}%
                  {lowConfidenceCount > 0 && ` · ${lowConfidenceCount} item${lowConfidenceCount > 1 ? "s" : ""} precisa${lowConfidenceCount > 1 ? "m" : ""} de revisão`}
                </span>
              </div>
            )}
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto px-5 space-y-2 pb-3 min-h-0">
            {items.map((item, idx) => {
              const conf = item.confidence || 0.5;
              const isLowConfidence = conf < 0.7;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={cn(
                    "rounded-xl border p-3 transition-colors",
                    isLowConfidence && item.selected
                      ? "border-amber-500/30 bg-amber-500/5"
                      : item.selected
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/15 bg-muted/10 opacity-50"
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleItem(idx)}
                      className={cn(
                        "mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                        item.selected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {item.selected && <Check className="w-3 h-3" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(idx, "description", e.target.value)}
                          className="h-7 text-[12px] font-semibold bg-transparent border-none px-0 focus-visible:ring-0"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          {isLowConfidence && onFallback && (
                            <button
                              onClick={() => handleEditManually(item)}
                              className="text-amber-400/60 hover:text-amber-400 transition-colors"
                              title="Editar manualmente"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => removeItem(idx)}
                            className="text-muted-foreground/40 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">R$</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.amount}
                            onChange={(e) =>
                              updateItem(idx, "amount", parseFloat(e.target.value) || 0)
                            }
                            className="h-6 w-20 text-[12px] font-bold bg-transparent border-none px-0 focus-visible:ring-0"
                          />
                        </div>

                        {item.installment_total && item.installment_total > 1 && (
                          <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                            <Package className="w-3 h-3 text-primary" />
                            <span className="text-[10px] font-bold text-primary">
                              {item.installment_current}/{item.installment_total}
                            </span>
                          </div>
                        )}

                        {item.type && item.type === "receita" ? (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            Receita
                          </span>
                        ) : item.type === "despesa" ? (
                          <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                            Despesa
                          </span>
                        ) : null}

                        <span className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>

                        <ConfidenceBadge confidence={conf} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {items.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Nenhum lançamento detectado</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 pt-3 border-t border-border/10 shrink-0 space-y-3 pb-24 sm:pb-5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">
                {selectedItems.length} de {items.length} selecionados
              </span>
              <span className="font-bold text-foreground">{formatCurrency(totalSelected)}</span>
            </div>

            <Button
              onClick={() => onConfirm(selectedItems)}
              disabled={selectedItems.length === 0 || confirming}
              className="w-full h-11 rounded-xl text-xs font-bold"
            >
              {confirming ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Importar {selectedItems.length} lançamento{selectedItems.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
