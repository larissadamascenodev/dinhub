import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative flex flex-col items-center justify-start pt-20 md:pt-28 pb-4 md:pb-6 px-5 overflow-hidden">
      {/* Cinematic mesh grid */}
      <div className="absolute inset-0 z-0 opacity-[0.12]" 
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      {/* Subtle cinematic glows */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[140%] aspect-square max-w-[1200px] rounded-full bg-[#00e676]/[0.04] blur-[180px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-1/4 w-[50%] aspect-square bg-blue-500/[0.03] blur-[150px] pointer-events-none z-0 rounded-full" />
      <div className="absolute bottom-[10%] right-0 w-[35%] aspect-square bg-purple-500/[0.03] blur-[140px] pointer-events-none z-0 rounded-full" />

      {/* Badge */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl mb-10 shadow-2xl shadow-black/50"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] shadow-[0_0_8px_#00e676]" />
        <span className="text-[10px] font-bold text-white/50 tracking-[0.15em] uppercase">
          +2.847 vidas transformadas pela tecnologia
        </span>
      </motion.div>

      {/* Headline */}
      <div className="relative z-10 text-center max-w-5xl px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="display-title mb-8 text-white text-center"
          style={{ fontSize: "clamp(2.5rem, 10vw, 6.5rem)" }}
        >
          Seu Jarvis<br />
          <span className="bg-gradient-to-r from-[#00e676] via-[#00ff88] to-[#00e676] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x italic font-light">
            financeiro.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-white/40 text-lg md:text-2xl max-w-2xl mx-auto mb-14 leading-relaxed font-inter font-light tracking-tight"
        >
          O assistente de elite que organiza sua vida inteira — <span className="text-white/80 font-medium tracking-normal">com precisão absoluta.</span>
        </motion.p>
      </div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col sm:flex-row items-center gap-6 mb-12"
      >
        <a 
          href="/auth"
          className="premium-button-primary group"
        >
          <span className="relative z-10 flex items-center gap-3">
            Começar Ascensão
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-500" />
          </span>
        </a>
        
        <button 
          onClick={() => document.getElementById('radar-header')?.scrollIntoView({ behavior: 'smooth' })}
          className="premium-button-secondary group"
        >
          <span className="relative z-10 flex items-center gap-3">
            <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform duration-500" />
            Experiência Huby
          </span>
        </button>
      </motion.div>

      {/* Trust Badges */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="relative z-10 flex items-center gap-8 text-[9px] font-black text-white/20 uppercase tracking-[0.25em]"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-3.5 h-3.5 rounded-full border border-white/10 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#00e676]" />
          </div>
          3 dias trial
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-3.5 h-3.5 rounded-full border border-white/10 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#00e676]" />
          </div>
          Multiplataforma
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;