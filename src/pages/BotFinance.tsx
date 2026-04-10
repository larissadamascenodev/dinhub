import { motion } from "framer-motion";
import { Brain, Lightbulb } from "lucide-react";
import BotFinanceTools from "@/components/dashboard/BotFinanceTools";

const BotFinance = () => {
  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          <h1 className="font-display text-xl font-bold">BotHub</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Seu assistente financeiro pessoal
        </p>
      </motion.div>

      {/* Tools */}
      <BotFinanceTools layout="carousel" />

      {/* Dica section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-4 flex items-start gap-3"
      >
        <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-4 h-4 text-warning" />
        </div>
        <div>
          <p className="text-xs font-medium text-foreground">Dica do Bot</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Comece pelas Projeções Inteligentes para entender como seu dinheiro se comporta ao longo dos próximos meses.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default BotFinance;
