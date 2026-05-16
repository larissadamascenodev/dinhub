import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CreditCard, ShieldCheck, ArrowRight, Check, Zap, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { createStripeCheckout } from "@/services/stripe";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PRICE_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_MONTHLY as string;
const PRICE_ANNUAL = import.meta.env.VITE_STRIPE_PRICE_ANNUAL as string;

const FEATURES = [
  "Dashboard completo com saldo em tempo real",
  "Cartões de crédito e faturas",
  "Metas financeiras com IA",
  "Radar de padrões de gasto",
  "Bot Huby — assistente financeiro IA",
  "OCR de recibos e faturas",
  "Desafios de economia",
  "Projeções financeiras",
];

export default function Upgrade() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSubscribed, loading: subLoading } = useSubscription();
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");

  // If the user already has an active subscription, send them to the app
  useEffect(() => {
    if (!subLoading && isSubscribed) {
      navigate("/dashboard", { replace: true });
    }
  }, [isSubscribed, subLoading, navigate]);

  const handleUpgrade = async (selectedPlan: "monthly" | "annual") => {
    if (!user) return;
    const priceId = selectedPlan === "annual" ? PRICE_ANNUAL : PRICE_MONTHLY;

    if (!priceId || priceId.startsWith("price_SUBSTITUIR")) {
      alert("Plano ainda não configurado. Configure VITE_STRIPE_PRICE_MONTHLY e VITE_STRIPE_PRICE_ANNUAL no .env");
      return;
    }

    setLoading(selectedPlan);
    try {
      await createStripeCheckout({
        priceId,
        userId: user.id,
        userEmail: user.email || "",
        userName: user.user_metadata?.display_name || "",
        successUrl: `${window.location.origin}/obrigado`,
        cancelUrl: `${window.location.origin}/upgrade`,
      });
    } finally {
      setLoading(null);
    }
  };

  // Show spinner while checking subscription to avoid flashing the upgrade page
  if (subLoading) {
    return (
      <div className="min-h-screen bg-landing flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-landing flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto">
            <CreditCard className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold">DinHub Pro</h1>
          <p className="text-muted-foreground text-sm">
            Controle total das suas finanças com IA. Experimente 3 dias grátis, cancele quando quiser.
          </p>
        </div>

        {/* Plan toggle */}
        <div className="bg-card-landing border border-green-landing rounded-2xl p-1 flex gap-1">
          <button
            onClick={() => setPlan("monthly")}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              plan === "monthly" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setPlan("annual")}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
              plan === "annual" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Anual
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              plan === "annual" ? "bg-black/20 text-black" : "bg-primary/20 text-primary"
            }`}>
              -40%
            </span>
          </button>
        </div>

        {/* Card */}
        <div className="bg-card-landing border border-green-landing rounded-3xl p-6 space-y-5">
          <div className="flex items-end gap-1">
            <span className="text-4xl font-display font-bold">
              {plan === "annual" ? "R$ 14,90" : "R$ 24,90"}
            </span>
            <span className="text-muted-foreground text-sm pb-1">/mês</span>
            {plan === "annual" && (
              <span className="text-xs text-muted-foreground pb-1 ml-1">(R$ 178,80/ano)</span>
            )}
          </div>

          <div className="space-y-2.5">
            {FEATURES.map((feat) => (
              <div key={feat} className="flex items-center gap-2.5 text-sm">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={() => handleUpgrade(plan)}
            disabled={loading !== null}
            className="w-full h-12 bg-primary text-black font-bold text-base rounded-xl"
          >
            {loading === plan ? (
              "Redirecionando..."
            ) : (
              <>
                <Zap className="mr-2 w-4 h-4" />
                Começar 3 dias grátis
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Sem cobrança nos primeiros 3 dias. Cancele a qualquer momento.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs opacity-40">
          <ShieldCheck className="w-3.5 h-3.5" />
          Pagamento 100% seguro via Stripe
        </div>
      </motion.div>
    </div>
  );
}
