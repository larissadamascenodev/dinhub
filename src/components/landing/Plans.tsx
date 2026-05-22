import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const Plans = () => {
  const [billing, setBilling] = useState<'monthly' | 'annually'>('monthly');

  const features = [
    "Assistente Huby com IA",
    "Dashboard completo",
    "Categorização automática",
    "Radar Financeiro 24h",
    "Scanner de recibos",
    "Projeção de 12 meses",
    "Score Financeiro",
    "3 dias grátis"
  ];

  return (
    <section id="planos" className="section-padding px-5 bg-[#070707] relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24 md:mb-40 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md"
          >
            <span className="text-[10px] font-black tracking-[0.3em] text-[#00e676] uppercase">Elite Membership</span>
          </motion.div>
          <h2 className="display-title text-white text-3xl md:text-8xl">
            O investimento no seu<br />
            <span className="bg-gradient-to-r from-[#00e676] to-[#00ff88] bg-clip-text text-transparent italic font-light">sucesso financeiro.</span>
          </h2>

          {/* Toggle */}
          <div className="flex items-center justify-center pt-10">
            <div className="bg-[#111] border border-white/[0.05] p-1.5 rounded-full flex shadow-2xl">
              <button 
                onClick={() => setBilling('monthly')}
                className={`px-8 py-2.5 rounded-full text-[10px] font-black tracking-[0.1em] transition-all duration-500 ${billing === 'monthly' ? 'bg-[#1a1a1a] text-[#00e676] shadow-xl' : 'text-white/30 hover:text-white/50'}`}
              >
                MENSAL
              </button>
              <button 
                onClick={() => setBilling('annually')}
                className={`px-8 py-2.5 rounded-full text-[10px] font-black tracking-[0.1em] transition-all duration-500 ${billing === 'annually' ? 'bg-[#1a1a1a] text-[#00e676] shadow-xl' : 'text-white/30 hover:text-white/50'}`}
              >
                ANUAL
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {/* MENSAL CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`glass-card !rounded-[48px] p-12 md:p-16 relative overflow-hidden transition-all duration-700 ${billing === 'monthly' ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-40 grayscale pointer-events-none'}`}
          >
            <h3 className="font-sora font-extrabold text-white text-3xl mb-4">Mensal</h3>
            <div className="flex items-baseline gap-2 mb-12">
                <span className="text-5xl font-sora font-extrabold text-white">R$ 24,90</span>
                <span className="text-white/30 font-medium">/mês</span>
            </div>

            <ul className="space-y-5 mb-14">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-4 group">
                  <div className="w-5 h-5 rounded-full border border-[#00e676]/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#00e676]" />
                  </div>
                  <span className="text-white/60 text-sm font-medium group-hover:text-white transition-colors">{f}</span>
                </li>
              ))}
            </ul>

            <a 
              href="/auth"
              className="block w-full text-center py-5 rounded-2xl border border-white/10 text-white font-sora font-bold hover:bg-white/[0.05] hover:border-white/20 transition-all text-lg"
            >
              Começar grátis
            </a>
            <p className="text-center text-[9px] text-white/20 mt-6 font-black uppercase tracking-[0.2em]">
                Sem cobrança nos primeiros 3 dias.
            </p>
          </motion.div>

          {/* ANUAL CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`glass-card !rounded-[48px] p-12 md:p-16 relative overflow-hidden transition-all duration-700 border-[#00e676]/20 shadow-[0_0_80px_rgba(0,230,118,0.1)] ${billing === 'annually' ? 'scale-105 opacity-100' : 'scale-[0.98] opacity-40 grayscale pointer-events-none'}`}
          >
            <div className="absolute top-0 right-0 px-8 py-3 bg-[#00e676] text-[#0a0a0a] text-[10px] font-black uppercase tracking-[0.15em] rounded-bl-[24px]">
                MAIS ECONÔMICO
            </div>
            
            <h3 className="font-sora font-extrabold text-[#00e676] text-3xl mb-4">Anual</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-5xl font-sora font-extrabold text-white">R$ 14,90</span>
                <span className="text-white/30 font-medium">/mês</span>
            </div>
            <div className="text-[10px] font-black text-[#00e676] uppercase tracking-[0.15em] mb-12 mt-4 bg-[#00e676]/5 inline-block px-3 py-1 rounded-full border border-[#00e676]/10">
                Economia de R$ 120/ano
            </div>

            <ul className="space-y-5 mb-14">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-4 group">
                  <div className="w-5 h-5 rounded-full border border-[#00e676]/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#00e676]" />
                  </div>
                  <span className="text-white/60 text-sm font-medium group-hover:text-white transition-colors">{f}</span>
                </li>
              ))}
            </ul>

            <a 
              href="/auth"
              className="block w-full text-center py-5 rounded-2xl bg-[#00e676] text-[#0a0a0a] font-sora font-black hover:brightness-110 transition-all shadow-[0_15px_35px_-10px_rgba(0,230,118,0.4)] text-lg"
            >
              Começar grátis
            </a>
            <p className="text-center text-[9px] text-white/20 mt-6 font-black uppercase tracking-[0.2em]">
                🔒 Cobrado R$ 178,80 anualmente.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Plans;
