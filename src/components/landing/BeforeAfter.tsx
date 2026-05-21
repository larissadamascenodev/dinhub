import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

const BeforeAfter = () => {
  return (
    <section className="py-32 px-5 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#00e676] uppercase">A diferença</span>
          <h2 className="font-sora font-extrabold text-white text-4xl md:text-5xl">
            Antes e depois de ter a Huby do seu lado.
          </h2>
          <p className="text-[#a0a0a0] max-w-2xl mx-auto">
            Em menos de 5 minutos de setup, você sai do caos para a clareza.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* CARD ANTES */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#0a0a0a] border border-white/[0.03] rounded-[40px] p-10 md:p-16 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[60px]" />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/5 border border-red-500/10 mb-10">
              <X className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Legacy Chaos</span>
            </div>
            <h3 className="text-2xl font-sora font-bold text-white mb-8">Você no modo caos.</h3>
            
            <ul className="space-y-6 mb-12">
              {[
                "Não sabe quanto gastou esse mês",
                "Descobre dívida quando já é tarde",
                "Planilha que nunca preenche",
                "Sensação de que o dinheiro some"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500/50 shrink-0 mt-0.5" />
                  <span className="text-[#a0a0a0] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-red-500/60 font-medium">Saldo Negativo</span>
                    <span className="text-red-500 font-bold">- R$ 1.240,00</span>
                </div>
                <div className="flex gap-1 items-end h-16">
                    {[40, 70, 45, 90, 60, 80].map((h, i) => (
                        <div key={i} className="flex-1 bg-red-500/20 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                </div>
            </div>
          </motion.div>

          {/* CARD DEPOIS */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-[#0f0f0f] border border-[#00e676]/40 rounded-[24px] p-8 md:p-12 shadow-[0_0_40px_rgba(0,230,118,0.1)]"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00e676]/10 border border-[#00e676]/20 mb-8">
              <Check className="w-3 h-3 text-[#00e676]" />
              <span className="text-[10px] font-bold text-[#00e676] uppercase tracking-widest">COM A HUBY</span>
            </div>
            <h3 className="text-2xl font-sora font-bold text-white mb-8">Você no controle de verdade.</h3>
            
            <ul className="space-y-6 mb-12">
              {[
                "Sabe para onde vai cada real",
                "Toma decisões com confiança",
                "Guarda dinheiro todo mês",
                "Dorme tranquilo no fim do mês"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#00e676] shrink-0 mt-0.5" />
                  <span className="text-[#a0a0a0] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <div className="p-6 bg-[#00e676]/5 border border-[#00e676]/10 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-[#00e676] font-medium">Economia Gerada</span>
                    <span className="text-[#00e676] font-bold">+ R$ 1.257,30</span>
                </div>
                <div className="flex gap-1 items-end h-16">
                    {[30, 45, 55, 70, 85, 100].map((h, i) => (
                        <div key={i} className="flex-1 bg-[#00e676]/40 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;
