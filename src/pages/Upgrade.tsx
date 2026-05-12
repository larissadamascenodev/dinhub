import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CreditCard, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createStripeCheckout } from "@/services/stripe";
import { useState } from "react";

export default function Upgrade() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (priceId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      await createStripeCheckout({
        priceId,
        userId: user.id,
        userEmail: user.email || "",
        userName: user.user_metadata?.display_name || "",
        successUrl: `${window.location.origin}/obrigado`,
        cancelUrl: window.location.href,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-landing flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-card-landing p-8 rounded-3xl border border-green-landing text-center space-y-6"
      >
        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
          <CreditCard className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-display font-bold">Acesso Bloqueado</h1>
        <p className="text-muted-foreground">
          Sua assinatura expirou ou o pagamento falhou. Para continuar acessando o DinHub, reative seu plano.
        </p>
        
        <div className="space-y-4 pt-4">
          <Button 
            disabled={loading}
            onClick={() => handleUpgrade("price_annual")}
            className="w-full h-12 bg-primary text-black font-bold text-lg rounded-xl"
          >
            Reativar Plano Pro <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <div className="flex items-center justify-center gap-2 text-xs opacity-50">
            <ShieldCheck className="w-4 h-4" /> Pagamento 100% seguro via Stripe
          </div>
        </div>
      </motion.div>
    </div>
  );
}
