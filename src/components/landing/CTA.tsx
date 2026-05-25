import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CTA = () => {
  return (
    <section className="section-padding px-5 relative overflow-hidden bg-[#0a0a0a]">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] aspect-square bg-[#00e676]/10 rounded-full blur-[200px] pointer-events-none opacity-20" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-12"
        >
            <h2 className="display-title text-white text-3xl md:text-8xl mb-12">
                Um dia com a Huby<br />
                <span className="bg-gradient-to-r from-[#00e676] via-[#00ff88] to-[#00e676] bg-clip-text text-transparent italic font-light">
                  muda tudo.
                </span>
            </h2>
            
            <p className="text-white/40 text-xl md:text-3xl max-w-2xl mx-auto font-light mb-16 leading-relaxed">
                Comece agora e veja seu dinheiro trabalhar para você em vez de sumir da sua conta.
            </p>

            <div className="flex flex-col items-center gap-10">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                >
                    <a 
                      href="/login?mode=signup"
                      className="premium-button-primary !px-16 !py-7 !text-2xl shadow-[0_20px_50px_-15px_rgba(0,230,118,0.4)]"
                    >
                      <span className="flex items-center gap-4">
                        Iniciar Ascensão
                        <ArrowRight className="w-8 h-8" />
                      </span>
                    </a>
                </motion.div>
                
                <div className="flex items-center gap-12 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00e676]/30" />
                        3 dias de teste grátis
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00e676]/30" />
                        Multiplataforma
                    </div>
                </div>
            </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
