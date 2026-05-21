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
    <section id="planos" className="py-40 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-24 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-md"
          >
            <span className="text-[10px] font-black tracking-[0.3em] text-[#00e676] uppercase">Elite Membership</span>
          </motion.div>
          <h2 className="font-sora font-extrabold text-white text-3xl md:text-6xl tracking-tighter leading-tight">
            O investimento no seu<br />
            <span className="bg-gradient-to-r from-[#00e676] to-[#00ff88] bg-clip-text text-transparent italic">sucesso financeiro.</span>
          </h2>

          {/* Toggle */}
          <div className="flex items-center justify-center pt-8">
            <div className="bg-[#111] border border-[#1a1a1a] p-1 rounded-full flex">
              <button 
                onClick={() => setBilling('monthly')}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${billing === 'monthly' ? 'bg-[#1a1a1a] text-white shadow-xl' : 'text-[#777]'}`}
              >
                MENSAL
              </button>
              <button 
                onClick={() => setBilling('annually')}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${billing === 'annually' ? 'bg-[#1a1a1a] text-white shadow-xl' : 'text-[#777]'}`}
              >
                ANUAL
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* MENSAL CARD */}
          <motion.div 
            whileHover={{ y: -10 }}
            className={`p-8 md:p-12 rounded-[24px] border transition-all ${billing === 'monthly' ? 'bg-[#0f0f0f] border-[#1a1a1a]' : 'bg-transparent border-[#1a1a1a]/50 opacity-60'}`}
          >
            <h3 className="font-sora font-extrabold text-white text-2xl mb-2">Mensal</h3>
            <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-sora font-extrabold text-white">R$ 24,90</span>
                <span className="text-[#a0a0a0]">/mês</span>
            </div>

            <ul className="space-y-4 mb-10">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#00e676]" />
                  <span className="text-white/80 text-sm">{f}</span>
                </li>
              ))}
            </ul>

            <a 
              href="/auth"
              className="block w-full text-center py-4 rounded-full border border-[#00e676] text-[#00e676] font-sora font-bold hover:bg-[#00e676]/10 transition-all"
            >
              Começar grátis
            </a>
            <p className="text-center text-[10px] text-[#444] mt-4 font-medium uppercase tracking-widest">
                Sem cobrança nos primeiros 3 dias.
            </p>
          </motion.div>

          {/* ANUAL CARD */}
          <motion.div 
            whileHover={{ y: -10 }}
            className={`p-8 md:p-12 rounded-[24px] border relative transition-all shadow-[0_0_50px_rgba(0,230,118,0.1)] ${billing === 'annually' ? 'bg-[#0f0f0f] border-[#00e676]' : 'bg-transparent border-[#1a1a1a]/50 opacity-60'}`}
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00e676] text-[#0a0a0a] text-[10px] font-bold uppercase tracking-wider">
                + MAIS ECONÔMICO
            </div>
            
            <h3 className="font-sora font-extrabold text-[#00e676] text-2xl mb-2">Anual</h3>
            <div className="flex items-baseline gap-1">
                <span className="text-4xl font-sora font-extrabold text-white">R$ 14,90</span>
                <span className="text-[#a0a0a0]">/mês</span>
            </div>
            <div className="text-[10px] font-bold text-[#00e676] uppercase tracking-widest mb-8 mt-2">
                Você economiza R$ 120/ano
            </div>

            <ul className="space-y-4 mb-10">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-[#00e676]" />
                  <span className="text-white/80 text-sm">{f}</span>
                </li>
              ))}
            </ul>

            <a 
              href="/auth"
              className="block w-full text-center py-4 rounded-full bg-[#00e676] text-[#0a0a0a] font-sora font-bold hover:brightness-110 transition-all"
            >
              Começar grátis
            </a>
            <p className="text-center text-[10px] text-[#444] mt-4 font-medium uppercase tracking-widest">
                🔒 Cobrado R$ 178,80 anualmente.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Plans;
