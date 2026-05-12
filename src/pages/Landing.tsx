import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Check, Zap, Smartphone, Bot, TrendingUp, BarChart, CreditCard, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  return (
    <div className="bg-landing min-h-screen text-foreground selection:bg-primary/30">
      {/* Topbar */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent py-2 text-center text-xs font-medium tracking-wide">
        ⚡ Lançamento — 3 dias grátis, sem cartão, sem compromisso — <span className="text-primary font-bold">Vagas abertas</span>
      </div>

      {/* Navbar */}
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
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-6" onClick={() => navigate("/auth")}>
            Testar grátis →
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-20 pb-32 relative landing-grid overflow-hidden">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-card-landing border border-green-landing px-4 py-2 rounded-full text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            +2.847 usuários ativos
          </div>
          <h1 className="text-5xl md:text-[88px] font-display font-extrabold leading-[1.1] tracking-tighter">
            Chega de viver no <span className="text-primary text-glow">automático.</span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-display font-semibold opacity-90">Assuma o controle.</h2>
          <p className="text-lg md:text-xl opacity-70 max-w-2xl mx-auto">Seu dinheiro some e você nem sabe como? O DinHub é seu copiloto financeiro com IA — que analisa, conversa e te mostra o caminho.</p>
          
          <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-black glow-button font-bold" onClick={() => navigate("/auth")}>
              Assumir o controle agora →
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-landing">
              ▶ Ver como funciona
            </Button>
          </div>
          <p className="text-sm opacity-60">3 dias grátis. <span className="text-primary">Sem cartão.</span> Sem desculpa.</p>
        </div>
      </section>

      {/* Pricing placeholder */}
      <section id="preços" className="py-24 bg-card-landing">
        <div className="container mx-auto px-4 text-center">
           <h2 className="text-4xl font-bold mb-12">Um plano. Tudo incluído.</h2>
           <div className="max-w-md mx-auto bg-landing p-8 rounded-3xl border border-green-landing relative">
             <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-bold px-4 py-1 rounded-full">ACESSO COMPLETO</div>
             <h3 className="text-2xl font-bold mb-4">DinHub Pro</h3>
             <div className="text-5xl font-bold mb-6">{billingCycle === 'annual' ? 'R$12,42' : 'R$19,90'}<span className="text-sm font-normal opacity-60">/mês</span></div>
             <Button className="w-full h-12 bg-primary text-black font-bold mb-6" onClick={() => navigate("/auth")}>Começar meus 3 dias grátis →</Button>
             <p className="text-xs opacity-50 mb-8">🛡️ Garantia de 7 dias após assinar</p>
           </div>
        </div>
      </section>
      
      <footer className="py-12 border-t border-landing text-center text-sm opacity-60">
        © 2026 DinHub — Todos os direitos reservados.
      </footer>
    </div>
  );
}
