import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (type: "receita" | "despesa") => void;
}

const TransactionTypeChooser = ({ open, onClose, onSelect }: Props) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="flex gap-4 p-2"
          >
            {/* Despesa */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect("despesa")}
              className="flex flex-col items-center gap-3 w-36 py-6 rounded-2xl bg-card border border-border/30 shadow-2xl hover:border-destructive/40 transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-destructive/15 flex items-center justify-center">
                <TrendingDown className="w-7 h-7 text-destructive" />
              </div>
              <span className="text-sm font-bold text-foreground">Despesa</span>
            </motion.button>

            {/* Receita */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect("receita")}
              className="flex flex-col items-center gap-3 w-36 py-6 rounded-2xl bg-card border border-border/30 shadow-2xl hover:border-primary/40 transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <span className="text-sm font-bold text-foreground">Receita</span>
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransactionTypeChooser;
