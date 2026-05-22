import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

const BeforeAfter = () => {
  return (
    <section className="section-padding px-4 sm:px-6 bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]">
      <div className="fluid-container">
        <div className="text-center mb-16 md:mb-24 lg:mb-32 space-y-6 md:space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md"
          >
            <span className="text-[9px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.3em] text-[#00e676] uppercase">A diferença</span>
          </motion.div>
          
          <h2 className="display-title text-white text-3xl sm:text-4xl md:text-5xl lg:text-7xl">
            Antes e depois<br className="hidden sm:block" /> de ter a Huby do seu lado.
          </h2>
          <p className="text-white/40 max-w-2xl mx-auto text-base sm:text-lg lg:text-xl font-inter font-light leading-relaxed">
            Em menos de 5 minutos de setup, você sai do caos para a clareza.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* CARD ANTES */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card !rounded-[40px] p-8 sm:p-12 lg:p-16 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[60px] pointer-events-none" />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/5 border border-red-500/10 mb-8 sm:mb-10">
              <X className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Legacy Chaos</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-sora font-bold text-white mb-6 sm:mb-8">Você no modo caos.</h3>
            
            <ul className="space-y-4 sm:space-y-6 mb-10 sm:mb-12">
              {[
                "Não sabe quanto gastou esse mês",
                "Descobre dívida quando já é tarde",
                "Planilha que nunca preenche",
                "Sensação de que o dinheiro some"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <X className="w-5 h-5 text-red-500/50 shrink-0 mt-1" />
                  <span className="text-white/50 text-sm sm:text-base leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] sm:text-xs text-red-500/60 font-black uppercase tracking-widest">Saldo Negativo</span>
                    <span className="text-red-500 font-bold text-sm sm:text-base">- R$ 1.240,00</span>
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
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card !rounded-[40px] p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-[0_0_100px_rgba(0,230,118,0.05)] group border-[#00e676]/10"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#00e676]/10 blur-[80px] pointer-events-none" />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00e676]/5 border border-[#00e676]/20 mb-8 sm:mb-10">
              <Check className="w-3.5 h-3.5 text-[#00e676]" />
              <span className="text-[9px] md:text-[10px] font-black text-[#00e676] uppercase tracking-[0.2em]">Neural Mastery</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-sora font-bold text-white mb-6 sm:mb-8">Você no controle de verdade.</h3>
            
            <ul className="space-y-4 sm:space-y-6 mb-10 sm:mb-12">
              {[
                "Sabe para onde vai cada real",
                "Toma decisões com confiança",
                "Guarda dinheiro todo mês",
                "Dorme tranquilo no fim do mês"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <Check className="w-5 h-5 text-[#00e676] shrink-0 mt-1" />
                  <span className="text-white/50 text-sm sm:text-base leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <div className="p-6 bg-[#00e676]/5 border border-[#00e676]/10 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] sm:text-xs text-[#00e676]/60 font-black uppercase tracking-widest">Economia Gerada</span>
                    <span className="text-[#00e676] font-bold text-sm sm:text-base">+ R$ 1.257,30</span>
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
