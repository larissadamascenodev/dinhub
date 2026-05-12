import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Check, Zap, Smartphone, Bot, TrendingUp, BarChart, CreditCard, ShieldCheck, Play, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { createStripeCheckout } from "@/services/stripe";
import { toast } from "sonner";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [activeFeature, setActiveFeature] = useState(0);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const handleStartTrial = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setLoadingCheckout(true);
    try {
      const priceId = billingCycle === "annual" 
        ? "price_annual" 
        : "price_monthly";

      await createStripeCheckout({
        priceId,
        userId: user.id,
        userEmail: user.email || "",
        userName: user.user_metadata?.display_name || "",
        successUrl: `${window.location.origin}/obrigado`,
        cancelUrl: window.location.origin,
      });
    } catch (err) {
      toast.error("Erro ao iniciar checkout. Tente novamente.");
    } finally {
      setLoadingCheckout(false);
    }
  };

  const features = [
    { id: 0, title: "Início", desc: "Tudo que importa numa tela só.", stats: ["R$713 Saldo", "22 Parcelas", "12 dias"] },
    { id: 1, title: "Bot Huby", desc: "Seu copiloto financeiro pessoal.", stats: ["24/7 Ativo", "100% Personalizado", "Proativo"] },
    { id: 2, title: "Radar", desc: "Diagnóstico completo da sua vida.", stats: ["Score 0-100", "Alertas em tempo", "IA Diagnóstico"] },
    { id: 3, title: "Projeções", desc: "Veja o futuro do seu dinheiro.", stats: ["+91% Crescimento", "6 meses", "R$3.075 Previsto"] },
    { id: 4, title: "Parcelas", desc: "Saiba onde seu dinheiro vai.", stats: ["R$1.428 Comp.", "11 meses", "R$9.569 Total"] },
  ];

  return (
    <div className="bg-landing min-h-screen text-foreground selection:bg-primary/30">
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent py-2 text-center text-xs font-medium tracking-wide">
        ⚡ Lançamento — 3 dias grátis, sem cartão, sem compromisso — <span className="text-primary font-bold">Vagas abertas</span>
      </div>

      <nav className="sticky top-0 z-50 backdrop-blur-md bg-landing/80 border-b border-landing">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐷</span>
            <span className="font-display font-bold text-xl tracking-tight">Din<span className="text-primary">Hub</span></span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium opacity-80">
            {["Funcionalidades", "Como funciona", "Depoimentos", "Preços"].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-primary transition-colors">{item}</a>
            ))}
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-black font-semibold rounded-full px-6" onClick={() => navigate("/auth")}>
            Testar grátis →
          </Button>
        </div>
      </nav>

      <section className="container mx-auto px-4 pt-20 pb-32 text-center relative landing-grid overflow-hidden">
          <div className="inline-flex items-center gap-2 bg-card-landing border border-green-landing px-4 py-2 rounded-full text-xs font-medium mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            +2.847 usuários ativos
          </div>
          <h1 className="text-5xl md:text-[88px] font-display font-extrabold leading-[1.1] tracking-tighter mb-6">
            Chega de viver no <span className="text-primary text-glow">automático.</span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-display font-semibold mb-6">Assuma o controle.</h2>
          <p className="text-lg md:text-xl opacity-70 max-w-2xl mx-auto mb-10">Seu dinheiro some e você nem sabe como? O DinHub é seu copiloto financeiro com IA — que analisa, conversa e te mostra o caminho.</p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-black font-bold" onClick={() => navigate("/auth")}>
              Assumir o controle agora →
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-landing">
              <Play className="w-4 h-4 mr-2" /> Ver como funciona
            </Button>
          </div>
          <p className="text-sm opacity-60">3 dias grátis. <span className="text-primary">Sem cartão.</span> Sem desculpa.</p>
      </section>

      <div className="ticker-wrap border-y border-landing py-4 bg-card-landing">
        <div className="ticker-content flex gap-8 text-sm font-semibold opacity-60">
           {Array(5).fill("Controle total · Bot Huby IA · Projeções · Radar Financeiro · Score tempo real · Sem planilha").join(" · ")}
        </div>
      </div>

      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
            <h3 className="text-primary font-bold mb-4">A realidade brasileira</h3>
            <h2 className="text-4xl font-bold mb-16">Seu dinheiro some e você <span className="text-primary">nem sabe como?</span></h2>
            <div className="grid md:grid-cols-3 gap-8">
                {[ { v: "67%", t: "dos brasileiros não sabem quanto gastam" }, { v: "R$580", t: "perdidos em gastos invisíveis" }, { v: "1 em 3", t: "jovens termina o mês sem saber onde foi o salário" } ].map(i => (
                    <div key={i.t} className="p-8 rounded-3xl bg-card-landing border border-landing">
                        <div className="text-4xl font-bold text-primary mb-2">{i.v}</div>
                        <div className="text-sm opacity-70">{i.t}</div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      <section id="funcionalidades" className="py-24 bg-card-landing">
         <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4 mb-12">
                {features.map((f, i) => (
                    <Button key={f.id} variant={activeFeature === i ? "default" : "ghost"} className="rounded-full" onClick={() => setActiveFeature(i)}>{f.title}</Button>
                ))}
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="bg-landing rounded-3xl border border-landing h-96 flex items-center justify-center text-primary/30">Placeholder {features[activeFeature].title}</div>
                <div>
                    <h2 className="text-3xl font-bold mb-4">{features[activeFeature].title}</h2>
                    <p className="text-lg opacity-70 mb-8">{features[activeFeature].desc}</p>
                    <div className="grid grid-cols-2 gap-4">
                        {features[activeFeature].stats.map(s => <div key={s} className="bg-landing p-4 rounded-xl border border-landing text-sm">{s}</div>)}
                    </div>
                </div>
            </div>
         </div>
      </section>

      <section id="preços" className="py-24">
        <div className="container mx-auto px-4 text-center">
           <h2 className="text-4xl font-bold mb-8">Um plano. Tudo incluído.</h2>
           <div className="flex justify-center gap-4 mb-12">
               <button onClick={() => setBillingCycle('monthly')} className={`px-4 py-2 rounded-full ${billingCycle === 'monthly' ? 'bg-primary text-black' : 'opacity-50'}`}>Mensal</button>
               <button onClick={() => setBillingCycle('annual')} className={`px-4 py-2 rounded-full ${billingCycle === 'annual' ? 'bg-primary text-black' : 'opacity-50'}`}>Anual</button>
           </div>
           <div className="max-w-md mx-auto bg-card-landing p-8 rounded-3xl border border-green-landing relative">
             <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-bold px-4 py-1 rounded-full">ACESSO COMPLETO</div>
             <h3 className="text-2xl font-bold mb-4">DinHub Pro</h3>
             <div className="text-5xl font-bold mb-6">{billingCycle === 'annual' ? 'R$12,42' : 'R$19,90'}<span className="text-sm font-normal opacity-60">/mês</span></div>
             <Button className="w-full h-12 bg-primary text-black font-bold mb-6" onClick={() => navigate("/auth")}>Começar meus 3 dias grátis →</Button>
           </div>
        </div>
      </section>
      
      <footer className="py-12 border-t border-landing text-center text-sm opacity-60">
        © 2026 DinHub — Todos os direitos reservados.
      </footer>
    </div>
  );
}
