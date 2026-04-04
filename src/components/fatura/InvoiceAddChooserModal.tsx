import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PenLine, ScanLine } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onManual: () => void;
  onImage: (file: File) => void;
  onPdf: (file: File) => void;
  onCsv: (file: File) => void;
}

export default function InvoiceAddChooserModal({ open, onClose, onManual, onImage, onPdf, onCsv }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") {
      onPdf(file);
    } else if (ext === "csv" || ext === "xls" || ext === "xlsx") {
      onCsv(file);
    } else {
      onImage(file);
    }
    onClose();
    e.target.value = "";
  };

  const options = [
    {
      icon: PenLine,
      label: "Adicionar manualmente",
      description: "Preencha nome, valor, parcelas e categoria",
      onClick: () => { onManual(); onClose(); },
    },
    {
      icon: ScanLine,
      label: "Escanear fatura",
      description: "Importe via foto, PDF ou planilha CSV",
      onClick: () => fileInputRef.current?.click(),
    },
  ];

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
          className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border/20 shadow-2xl"
        >
          <div className="p-5 pb-24 sm:pb-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">Adicionar Lançamento</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <motion.button
                  key={opt.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={opt.onClick}
                  className="w-full flex items-center gap-3 rounded-xl border border-border/15 bg-muted/10 hover:bg-muted/20 px-4 py-3.5 text-left transition-colors active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <opt.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-foreground">{opt.label}</p>
                    <p className="text-[11px] text-muted-foreground">{opt.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Single file input that accepts all types */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.csv,.xls,.xlsx"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </motion.div>
    </AnimatePresence>
  );
}
