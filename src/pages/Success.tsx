import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";

export default function Success() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSubscribed, polling, startPollingUntilActive, refresh } = useSubscription();
  const pollStarted = useRef(false);
  const [pollingExhausted, setPollingExhausted] = useState(false);

  // Start polling immediately — webhook may not have fired yet
  useEffect(() => {
    if (user && !pollStarted.current) {
      pollStarted.current = true;
      startPollingUntilActive();
    }
  }, [user, startPollingUntilActive]);

  // Detect when polling finishes without confirming subscription
  useEffect(() => {
    if (!polling && !isSubscribed && pollStarted.current) {
      setPollingExhausted(true);
    }
  }, [polling, isSubscribed]);

  // Auto-redirect as soon as subscription is confirmed — no delay
  useEffect(() => {
    if (isSubscribed) {
      navigate("/dashboard", { replace: true });
    }
  }, [isSubscribed, navigate]);

  const handleGoToApp = () => {
    // Always navigate to dashboard; ProtectedRoute will recheck subscription
    navigate("/dashboard", { replace: true });
  };

  const handleRetry = async () => {
    setPollingExhausted(false);
    await refresh();
    if (!isSubscribed) {
      pollStarted.current = false;
      pollStarted.current = true;
      startPollingUntilActive();
    }
  };

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
          {polling && !isSubscribed
            ? "Confirmando pagamento..."
            : isSubscribed
            ? "Assinatura Ativada!"
            : "Pagamento recebido!"}
        </h1>

        <p className="text-muted-foreground">
          {polling && !isSubscribed
            ? "Estamos verificando seu pagamento. Isso leva alguns segundos."
            : isSubscribed
            ? "Parabéns! Você agora tem acesso completo ao DinHub Pro."
            : "Seu pagamento foi processado. Estamos ativando seu acesso."}
        </p>

        {isSubscribed && (
          <div className="space-y-2 pt-2 text-left">
            <ul className="text-sm space-y-2 opacity-80">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                O Bot Huby já está pronto para analisar suas finanças.
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                Você tem 3 dias de trial — sem cobrança agora.
              </li>
            </ul>
          </div>
        )}

        {pollingExhausted && !isSubscribed && (
          <div className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-4 text-left space-y-2">
            <p>Seu pagamento foi recebido pelo Stripe. A ativação pode levar até 1 minuto.</p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 text-primary font-medium text-sm hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Verificar novamente
            </button>
          </div>
        )}

        <Button
          onClick={handleGoToApp}
          disabled={polling && !isSubscribed && !pollingExhausted}
          className="w-full h-12 bg-primary text-black font-bold text-lg"
        >
          {polling && !isSubscribed && !pollingExhausted ? (
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
