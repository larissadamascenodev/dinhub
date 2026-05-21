import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-32 px-5 relative overflow-hidden bg-[#0a0a0a]">
      {/* Nectar style background accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] aspect-square bg-[#00e676]/10 rounded-full blur-[180px] pointer-events-none opacity-40" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
        >
            <h2 className="font-sora font-extrabold text-white text-3xl md:text-8xl tracking-tighter leading-[1.05] mb-8">
                Um dia com a Huby<br />
                <span className="bg-gradient-to-r from-[#00e676] to-[#00ff88] bg-clip-text text-transparent italic font-light">
                  muda tudo.
                </span>
            </h2>
            
            <p className="text-white/50 text-xl md:text-2xl max-w-2xl mx-auto font-medium mb-12">
                Comece agora e veja seu dinheiro trabalhar para você em vez de sumir da sua conta.
            </p>

            <div className="flex flex-col items-center gap-6">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-block"
                >
                    <a 
                    href="/auth"
                    className="flex items-center gap-4 px-14 py-6 rounded-2xl bg-[#00e676] text-[#0a0a0a] font-sora font-extrabold text-2xl hover:bg-[#00ff88] hover:shadow-[0_0_40px_rgba(0,230,118,0.6)] transition-all duration-500 hover:-translate-y-1.5"
                    >
                    Iniciar Ascensão
                    <ArrowRight className="w-7 h-7" />
                    </a>
                </motion.div>
                
                <div className="flex items-center gap-8 text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]">
                    <span>3 dias de teste grátis</span>
                    <span>Multiplataforma</span>
                </div>
            </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
