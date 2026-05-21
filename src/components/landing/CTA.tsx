import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-32 px-5 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] aspect-square bg-[#00e676]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="font-sora font-extrabold text-white text-4xl md:text-6xl mb-6 leading-tight">
          Seu dinheiro merece mais atenção do que está recebendo.
        </h2>
        <p className="text-[#00e676] text-xl md:text-2xl font-medium mb-16">
          Comece hoje. Veja a diferença esta semana.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { t: "Você lança.", s: "A Huby organiza." },
            { t: "Você pergunta.", s: "A Huby responde." },
            { t: "Você decide.", s: "Com dados reais." },
          ].map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="text-[#a0a0a0] text-sm">{item.t}</div>
              <div className="text-white font-bold">{item.s}</div>
            </div>
          ))}
        </div>

        <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-block"
        >
            <a 
            href="/auth"
            className="flex items-center gap-2 px-10 py-6 rounded-full bg-[#00e676] text-[#0a0a0a] font-sora font-bold text-xl shadow-[0_0_40px_rgba(0,230,118,0.4)] hover:shadow-[0_0_60px_rgba(0,230,118,0.6)] transition-all"
            >
            Conversar com a Huby
            <ArrowRight className="w-6 h-6" />
            </a>
        </motion.div>
        
        <p className="mt-8 text-sm text-[#444] font-medium">
            3 dias grátis · Sem cartão · Cancele quando quiser
        </p>
      </div>
    </section>
  );
};

export default CTA;
