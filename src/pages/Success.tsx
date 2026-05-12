import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Success() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-landing flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-card-landing p-8 rounded-3xl border border-green-landing text-center space-y-6"
      >
        <div className="flex justify-center">
          <CheckCircle2 className="w-20 h-20 text-primary" />
        </div>
        <h1 className="text-3xl font-display font-bold">Assinatura Ativada!</h1>
        <p className="text-muted-foreground">
          Parabéns! Você acaba de dar o primeiro passo para assumir o controle total das suas finanças.
        </p>
        <div className="space-y-3 pt-4">
          <p className="text-sm font-medium">Próximos passos:</p>
          <ul className="text-sm text-left space-y-2 opacity-80">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              O Bot Huby já está analisando suas transações.
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Você tem 3 dias de trial gratuito.
            </li>
          </ul>
        </div>
        <Button 
          onClick={() => navigate("/")}
          className="w-full h-12 bg-primary text-black font-bold text-lg"
        >
          Ir para o App <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
}
