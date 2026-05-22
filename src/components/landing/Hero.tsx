import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 px-5 overflow-hidden bg-[#050505]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Animated Mesh Grid */}
        <div className="absolute inset-0 opacity-[0.08]" 
             style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '48px 48px' }} />
        
        {/* Deep Cinematic Glows */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] aspect-square max-w-[1400px] rounded-full bg-gradient-to-b from-[#00e676]/[0.08] via-transparent to-transparent blur-[160px] pointer-events-none z-0" />
        <div className="absolute top-1/4 -left-1/4 w-[60%] aspect-square bg-blue-600/[0.04] blur-[180px] pointer-events-none z-0 rounded-full animate-pulse" />
        <div className="absolute bottom-0 -right-1/4 w-[50%] aspect-square bg-purple-600/[0.03] blur-[150px] pointer-events-none z-0 rounded-full" />
        
        {/* Horizontal Beam Line */}
        <div className="absolute top-[20%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      </div>

      {/* Badge */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/[0.1] bg-black/40 backdrop-blur-2xl mb-12 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] group hover:border-[#00e676]/30 transition-colors duration-500"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e676] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e676]"></span>
        </span>
        <span className="text-[9px] font-black text-white/40 tracking-[0.3em] uppercase">
          Neural Core <span className="text-white/70 mx-1">v2.4.0</span> Online
        </span>
      </motion.div>

      {/* Headline */}
      <div className="relative z-10 text-center max-w-6xl px-4">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="display-title mb-10 text-white text-center"
          style={{ fontSize: "clamp(3rem, 12vw, 8rem)" }}
        >
          Domine sua<br />
          <span className="relative inline-block">
            <span className="absolute -inset-2 bg-[#00e676]/10 blur-2xl rounded-full opacity-50" />
            <span className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent italic font-light tracking-tighter">
              realidade.
            </span>
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