import { motion } from "framer-motion";
import { ScanLine, Sparkles, FileSearch } from "lucide-react";

interface Props {
  open: boolean;
}

const steps = [
  { icon: ScanLine, label: "Lendo comprovante…", color: "text-blue-400" },
  { icon: FileSearch, label: "Extraindo dados…", color: "text-amber-400" },
  { icon: Sparkles, label: "Classificando com IA…", color: "text-primary" },
];

export default function ScanProcessingOverlay({ open }: Props) {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-6 p-8"
      >
        {/* Animated scanner icon */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 rounded-full border-2 border-primary/20 flex items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center"
            >
              <ScanLine className="w-7 h-7 text-primary" />
            </motion.div>
          </motion.div>
          {/* Scanning line */}
          <motion.div
            animate={{ y: [-20, 20, -20] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 1.2 }}
              className="flex items-center gap-2.5"
            >
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.5 }}
              >
                <step.icon className={`w-4 h-4 ${step.color}`} />
              </motion.div>
              <span className="text-sm text-muted-foreground font-medium">{step.label}</span>
            </motion.div>
          ))}
        </div>

        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-xs text-muted-foreground/60 mt-2"
        >
          Isso pode levar alguns segundos
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
