import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Check, Zap, Bot, ShieldCheck, Play, Lock, ChevronDown, Smartphone } from "lucide-react";
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
        cancelUrl: window.location.href,
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
                <motion.div 
                    key={activeFeature}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-landing rounded-[40px] border border-landing h-[500px] flex items-center justify-center text-primary/20 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                    <div className="z-10 text-center p-8">
                        <Smartphone className="w-20 h-20 mx-auto mb-4 opacity-40 group-hover:scale-110 transition-all" />
                        <p className="font-bold text-lg opacity-60">Screenshot: {features[activeFeature].title}</p>
                        <p className="text-xs opacity-40 mt-2 max-w-[200px] mx-auto">Visualização real da interface do DinHub Pro para mobile</p>
                    </div>
                    {/* Floating elements to mimic app UI */}
                    <div className="absolute top-8 left-8 right-8 h-12 rounded-xl bg-white/5 border border-white/10" />
                    <div className="absolute bottom-8 left-8 right-8 h-32 rounded-2xl bg-white/5 border border-white/10" />
                </motion.div>
                <div className="space-y-6">
                    <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-[10px] font-bold text-primary inline-block uppercase tracking-wider">Aba {activeFeature + 1}</div>
                    <h2 className="text-4xl font-display font-bold">{features[activeFeature].desc}</h2>
                    <p className="text-lg opacity-70 leading-relaxed">
                        {activeFeature === 0 && "Saldo disponível, receitas, despesas, gastos por categoria e parcelamentos ativos."}
                        {activeFeature === 1 && "O Bot Huby não espera você perguntar — ele te avisa proativamente."}
                        {activeFeature === 2 && "Score financeiro em tempo real com recomendações do que fazer agora."}
                        {activeFeature === 3 && "Timeline de saldo com projeção para 6 meses baseada nos seus hábitos reais."}
                        {activeFeature === 4 && "22 parcelamentos ativos, quanto está comprometido e quando termina cada um."}
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                        {(activeFeature === 0 ? ["Saldo com projeção fim do mês", "Receitas vs Despesas em destaque", "Gastos por categoria visual", "Parcelamentos ativos com valor/mês"] :
                          activeFeature === 1 ? ["Detecta comportamentos incomuns", "Conversa sem jargão", "Sugere com base no SEU histórico", "Disponível via texto, foto ou áudio"] :
                          activeFeature === 2 ? ["Score 0 a 100", "Alertas por padrão anormal", "Diagnóstico com pontos de atenção", "Recomendações: O que fazer"] :
                          activeFeature === 3 ? ["Timeline acumulada mês a mês", "Previsão baseada em histórico real", "Balanço com receitas vs despesas", "Visão de até 12 meses"] :
                          ["22 parcelamentos em um lugar", "Comprometido por mês em destaque", "Data de liberdade financeira", "Progresso visual por parcela"]).map(p => (
                            <div key={p} className="flex items-center gap-3 text-sm opacity-80">
                                <Check className="w-4 h-4 text-primary" /> {p}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-6">
                        {features[activeFeature].stats.map(s => (
                            <div key={s} className="bg-landing p-3 rounded-2xl border border-landing text-center">
                                <p className="text-[10px] font-bold text-primary uppercase mb-1">{s.split(' ').slice(1).join(' ')}</p>
                                <p className="text-sm font-bold">{s.split(' ')[0]}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
         </div>
      </section>

      <section id="preços" className="py-24">
        <div className="container mx-auto px-4 text-center">
           <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-[10px] font-bold text-primary mb-4 uppercase tracking-wider">Sem enrolação</div>
           <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">Um plano. Tudo incluído.</h2>
           
           <div className="flex items-center justify-center gap-4 mb-12">
               <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>Mensal</span>
               <button 
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="w-14 h-7 rounded-full bg-card-landing border border-landing relative p-1 transition-all"
               >
                 <motion.div 
                    animate={{ x: billingCycle === 'annual' ? 28 : 0 }}
                    className="w-5 h-5 rounded-full bg-primary shadow-lg"
                 />
               </button>
               <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-foreground' : 'text-muted-foreground'}`}>Anual</span>
           </div>

           {billingCycle === 'annual' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-primary font-bold text-sm">
                🎉 Você economiza R$88 por ano no plano anual
             </motion.div>
           )}

           <div className="max-w-md mx-auto bg-card-landing p-8 rounded-[32px] border border-green-landing relative shadow-2xl shadow-primary/5">
             <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-bold px-4 py-1.5 rounded-full">ACESSO COMPLETO</div>
             <h3 className="text-2xl font-display font-bold mb-4">DinHub Pro</h3>
             <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-5xl font-bold">{billingCycle === 'annual' ? 'R$12,42' : 'R$19,90'}</span>
                <span className="text-sm opacity-60">/mês</span>
             </div>
             {billingCycle === 'annual' && <p className="text-xs opacity-50 mb-6">Cobrado R$149/ano</p>}
             
             <div className="bg-primary/10 border border-primary/20 rounded-full py-2 px-4 mb-8 text-[11px] font-bold text-primary">
                🎁 3 dias grátis para testar — sem cartão de crédito
             </div>

             <div className="space-y-4 text-left mb-8">
                {[
                    "Bot Huby ilimitado — IA que conversa com você",
                    "Radar Financeiro com alertas automáticos",
                    "Score de saúde financeira em tempo real",
                    "Projeções inteligentes para 12 meses",
                    "Control completo de parcelamentos",
                    "Balanço mensal com previsão de meses futuros",
                    "Registre via texto, áudio ou foto",
                    "Relatórios financeiros em PDF",
                    "Suporte prioritário em português"
                ].map(item => (
                    <div key={item} className="flex items-center gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="opacity-80">{item}</span>
                    </div>
                ))}
             </div>

             <Button 
                disabled={loadingCheckout}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-black font-bold text-lg rounded-2xl mb-6 shadow-lg shadow-primary/20" 
                onClick={handleStartTrial}
             >
              {loadingCheckout ? "Processando..." : "Começar meus 3 dias grátis →"}
             </Button>

             <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-[10px] opacity-60">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    🛡️ Garantia de 7 dias após assinar — reembolso 100%
                </div>
                <div className="pt-4 border-t border-landing flex items-center justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                    <div className="flex items-center gap-1.5">
                        <Lock className="w-3 h-3" />
                        <span className="text-[10px] font-bold">Stripe Secured</span>
                    </div>
                    <span className="text-[10px]">SSL · No Card Data · PCI DSS</span>
                </div>
             </div>
           </div>
        </div>
      </section>
      
      <section className="py-24 bg-landing overflow-hidden">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-[10px] font-bold text-primary mb-4 uppercase tracking-wider">Simples assim</div>
                <h2 className="text-4xl font-display font-bold">3 passos para assumir o controle.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 relative">
                {[
                    { n: "01", t: "Cria sua conta", d: "Menos de 2 minutos. Sem cartão nos 3 dias de trial." },
                    { n: "02", t: "A IA analisa", d: "Bot Huby lê seus gastos e gera insights personalizados." },
                    { n: "03", t: "Você decide", d: "Com visibilidade real, você toma decisões melhores." }
                ].map((s, idx) => (
                    <div key={s.n} className="p-8 rounded-[32px] bg-card-landing border border-landing relative group hover:border-green-landing transition-all">
                        <div className="text-6xl font-display font-black text-primary/10 absolute top-4 right-8 group-hover:text-primary/20 transition-all">{s.n}</div>
                        <h3 className="text-xl font-bold mb-4">{s.t}</h3>
                        <p className="opacity-60 text-sm">{s.d}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      <section id="depoimentos" className="py-24 bg-card-landing">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-[10px] font-bold text-primary mb-4 uppercase tracking-wider">Quem já assumiu o controle</div>
                <h2 className="text-4xl font-display font-bold">Resultados reais. Pessoas reais.</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { n: "Rafael M.", j: "Designer 26 anos", t: "Em 3 semanas o Huby me mostrou que eu gastava R$400/mês em coisas que nem lembrava.", r: "R$400 economizados/mês" },
                    { n: "Larissa T.", j: "Analista 24 anos", t: "Finalmente entendi pra onde meu salário ia.", r: "Controle total em 1 semana", featured: true },
                    { n: "Bruno K.", j: "Freelancer 29 anos", t: "Hoje tenho 4 meses guardados pela primeira vez na vida.", r: "4 meses de reserva criados" }
                ].map(d => (
                    <div key={d.n} className={`p-8 rounded-[32px] bg-landing border ${d.featured ? 'border-green-landing shadow-2xl shadow-primary/5' : 'border-landing'} space-y-4`}>
                        <div className="flex gap-1 text-primary">
                            {Array(5).fill(0).map((_, i) => <Check key={i} className="w-4 h-4" />)}
                        </div>
                        <p className="italic opacity-80 leading-relaxed">"{d.t}"</p>
                        <div className="pt-4 border-t border-landing flex items-center justify-between">
                            <div>
                                <p className="font-bold text-sm">{d.n}</p>
                                <p className="text-[10px] opacity-50">{d.j}</p>
                            </div>
                            <div className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full">
                                {d.r}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      <section id="faq" className="py-24 bg-landing">
        <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-display font-bold">Perguntas frequentes</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
                {[
                    { q: "Preciso de cartão para o trial?", a: "Não! Você pode testar todas as funcionalidades por 3 dias sem cadastrar nenhum cartão de crédito." },
                    { q: "O que acontece depois dos 3 dias?", a: "Sua conta ficará em modo de visualização. Para continuar usando a IA e registrando novas transações, você precisará escolher um plano." },
                    { q: "O Bot Huby realmente funciona?", a: "Sim! Ele utiliza modelos avançados de IA para analisar seus gastos reais e te dar conselhos que fazem sentido para o seu momento." },
                    { q: "O DinHub acessa minha conta bancária?", a: "Não. Por segurança, você registra seus gastos via texto, áudio ou foto, e a IA organiza tudo." },
                    { q: "Posso cancelar quando quiser?", a: "Sim, o cancelamento é instantâneo e pode ser feito diretamente na sua área de configurações." }
                ].map((f, i) => (
                    <AccordionItem key={i} value={`item-${i}`} className="border border-landing bg-card-landing rounded-2xl px-6">
                        <AccordionTrigger className="hover:no-underline font-bold text-left">{f.q}</AccordionTrigger>
                        <AccordionContent className="opacity-70 leading-relaxed">{f.a}</AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
      </section>

      <section className="py-24 landing-grid relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-5xl md:text-7xl font-display font-extrabold mb-12 leading-tight">
                O futuro da sua vida financeira <span className="text-primary text-glow">começa aqui.</span>
            </h2>
            <Button size="lg" className="h-16 px-12 text-xl rounded-full bg-primary hover:bg-primary/90 text-black font-bold glow-button mb-12" onClick={() => navigate("/auth")}>
                Assumir o controle agora →
            </Button>
            <div className="flex flex-wrap justify-center gap-6 opacity-60 text-xs font-bold">
                {["✓ 3 dias grátis", "✓ Sem cartão", "✓ Cancele quando quiser", "✓ Garantia 7 dias", "✓ Suporte em português"].map(t => (
                    <span key={t}>{t}</span>
                ))}
            </div>
        </div>
      </section>

      <footer className="py-12 border-t border-landing bg-card-landing">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
                <span className="text-2xl">🐷</span>
                <span className="font-display font-bold text-xl tracking-tight">Din<span className="text-primary">Hub</span></span>
            </div>
            <div className="flex gap-8 text-xs font-medium opacity-60">
                <a href="/termos-de-uso" className="hover:text-primary transition-colors">Termos</a>
                <a href="/politica-privacidade" className="hover:text-primary transition-colors">Privacidade</a>
                <a href="/suporte" className="hover:text-primary transition-colors">Suporte</a>
            </div>
            <p className="text-[10px] opacity-40">© 2026 DinHub — Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

