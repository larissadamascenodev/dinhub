import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface GoalConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
}

const GoalConfirmModal = ({ open, onClose, onConfirm, title, description, confirmLabel = "Confirmar", loading }: GoalConfirmModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-card border border-border/20 shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/15 border border-destructive/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted/20 transition-colors flex-shrink-0">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-muted/10 border border-border/15 text-foreground hover:bg-muted/20 transition-colors"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-destructive/15 border border-destructive/20 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
              >
                {loading ? "Aguarde..." : confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GoalConfirmModal;
