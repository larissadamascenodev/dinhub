import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";

export default function Success() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSubscribed, polling, startPollingUntilActive } = useSubscription();
  const pollStarted = useRef(false);

  // Start polling as soon as the page loads — webhook may not have fired yet
  useEffect(() => {
    if (user && !pollStarted.current) {
      pollStarted.current = true;
      startPollingUntilActive();
    }
  }, [user, startPollingUntilActive]);

  // Once subscription is confirmed, auto-redirect to dashboard
  useEffect(() => {
    if (isSubscribed && !polling) {
      const timer = setTimeout(() => navigate("/dashboard"), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSubscribed, polling, navigate]);

  return (
    <div className="min-h-screen bg-landing flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-card-landing p-8 rounded-3xl border border-green-landing text-center space-y-6"
      >
        <div className="flex justify-center">
          {polling && !isSubscribed ? (
            <Loader2 className="w-20 h-20 text-primary animate-spin" />
          ) : (
            <CheckCircle2 className="w-20 h-20 text-primary" />
          )}
        </div>

        <h1 className="text-3xl font-display font-bold">
          {polling && !isSubscribed ? "Confirmando pagamento..." : "Assinatura Ativada!"}
        </h1>

        <p className="text-muted-foreground">
          {polling && !isSubscribed
            ? "Estamos verificando seu pagamento. Isso leva alguns segundos."
            : "Parabéns! Você acaba de dar o primeiro passo para assumir o controle total das suas finanças."}
        </p>

        {isSubscribed && (
          <div className="space-y-3 pt-4">
            <p className="text-sm font-medium">Próximos passos:</p>
            <ul className="text-sm text-left space-y-2 opacity-80">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                O Bot Huby já está analisando suas transações.
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Você tem 3 dias de trial gratuito — sem cobrança agora.
              </li>
            </ul>
          </div>
        )}

        <Button
          onClick={() => navigate(isSubscribed ? "/dashboard" : "/")}
          disabled={polling && !isSubscribed}
          className="w-full h-12 bg-primary text-black font-bold text-lg"
        >
          {polling && !isSubscribed ? (
            <>
              <Loader2 className="mr-2 w-5 h-5 animate-spin" />
              Aguarde...
            </>
          ) : (
            <>
              Ir para o App <ArrowRight className="ml-2 w-5 h-5" />
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
