import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, TrendingUp, CreditCard, Shield, Bell, Zap, BarChart3, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const DinHubLanding = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#00ff7b]/30 overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#00ff7b10,transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center z-10">
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[#00ff7b] animate-pulse" />
              Fintech de Nova Geração
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
              Seu dinheiro some <br/>
              <span className="text-[#00ff7b]">todo mês</span>
            </h1>
            <p className="text-xl text-white/60 max-w-lg leading-relaxed">
              O DinHub identifica gastos invisíveis, organiza sua vida financeira e te avisa antes do problema acontecer.
            </p>
            <Button size="lg" className="h-14 px-10 rounded-full bg-[#00ff7b] text-black font-black text-lg hover:bg-white transition-all">
              Começar agora <ArrowRight className="ml-2" />
            </Button>
          </div>
          <div className="relative h-[500px] flex items-center justify-center">
            {/* Mockup Container */}
            <div className="relative w-80 h-[560px] bg-[#111] rounded-[40px] border border-white/10 shadow-2xl overflow-hidden p-4">
               <div className="w-full h-full bg-black rounded-[30px] border border-white/5 flex flex-col p-6 gap-4">
                  <div className="text-sm font-bold text-white/40">Saldo total</div>
                  <div className="text-4xl font-black">R$ 12.450,90</div>
                  <div className="w-full h-40 bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-[#00ff7b]/50">
                    <BarChart3 size={40} />
                  </div>
               </div>
            </div>
            {/* Floating Cards */}
            <motion.div initial={{ x: 100 }} animate={{ x: 0 }} className="absolute -right-10 top-20 p-4 rounded-3xl bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 shadow-xl">
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-full bg-[#00ff7b]/10 text-[#00ff7b]"><Bell size={16}/></div>
                 <div className="text-xs font-semibold">Alerta: Delivery alto este mês!</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <div className="flex -space-x-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-12 h-12 rounded-full border-2 border-[#050505] bg-white/10" />
            ))}
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">+2.847 pessoas retomando o controle financeiro</p>
            <p className="text-[#00ff7b] font-semibold">Economia média de R$420/mês</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-5xl font-black tracking-tight">Entenda para onde seu <br/>dinheiro está indo</h2>
            <p className="text-lg text-white/50">O DinHub organiza automaticamente seus gastos e revela padrões invisíveis.</p>
          </div>
          <div className="grid gap-4">
            {['Delivery', 'Compras online', 'Transporte', 'Assinaturas', 'Apostas'].map(cat => (
               <div key={cat} className="flex justify-between items-center p-6 rounded-2xl bg-white/5 border border-white/5">
                 <span className="font-bold">{cat}</span>
                 <span className="font-mono text-[#00ff7b]">R$ 842,90</span>
               </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installments */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="bg-[#111] p-10 rounded-3xl border border-white/10 space-y-6">
            <h3 className="text-xl font-bold">iPhone 15 Pro</h3>
            <div className="w-full h-2 rounded-full bg-white/5"><div className="w-[60%] h-full bg-[#00ff7b] rounded-full" /></div>
            <p className="text-sm text-white/40">R$ 4.500 restantes de R$ 7.500</p>
          </div>
          <div className="space-y-6">
             <h2 className="text-5xl font-black tracking-tight">Suas parcelas também consomem seu futuro.</h2>
             <p className="text-lg text-white/50">Acompanhe tudo em tempo real e descubra quanto da sua renda já está comprometida.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-[#050505] text-center space-y-8">
        <h2 className="text-6xl font-black tracking-tighter">Pare de perder dinheiro sem perceber.</h2>
        <Button size="lg" className="h-14 px-10 rounded-full bg-[#00ff7b] text-black font-black text-lg hover:bg-white">
          Quero entender meus gastos
        </Button>
      </section>
    </div>
  );
};

export default DinHubLanding;