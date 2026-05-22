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
          transition={{ delay: 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-white/30 text-lg md:text-3xl max-w-3xl mx-auto mb-16 leading-tight font-inter font-light tracking-tight"
        >
          Organize sua vida inteira com <span className="text-white/90 font-medium tracking-normal">precisão absoluta</span> através da inteligência financeira de elite.
        </motion.p>
      </div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col sm:flex-row items-center gap-8 mb-24"
      >
        <a 
          href="/auth"
          className="relative group px-14 py-6 rounded-full bg-white text-[#0a0a0a] font-sora font-black text-xl hover:scale-105 transition-all duration-500 overflow-hidden shadow-[0_20px_60px_-15px_rgba(255,255,255,0.3)]"
        >
          <span className="relative z-10 flex items-center gap-4">
            Iniciar Ascensão
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-500" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#00e676] to-[#00ff88] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </a>
        
        <button 
          onClick={() => document.getElementById('radar-header')?.scrollIntoView({ behavior: 'smooth' })}
          className="group relative px-14 py-6 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-3xl text-white font-sora font-black text-xl hover:bg-white/[0.08] hover:border-white/20 transition-all duration-500"
        >
          <span className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Play className="w-3 h-3 fill-current ml-1" />
            </div>
            Ver Terminal
          </span>
        </button>
      </motion.div>

      {/* Futuristic Telemetry Data */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1.5 }}
        className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-12 text-[9px] font-black text-white/20 uppercase tracking-[0.4em]"
      >
        <div className="flex flex-col gap-2">
          <span className="text-[#00e676]/60">Latency</span>
          <span className="text-white/40">12ms</span>
        </div>
        <div className="flex flex-col gap-2 border-l border-white/5 pl-12">
          <span className="text-[#00e676]/60">Encryption</span>
          <span className="text-white/40">AES-256</span>
        </div>
        <div className="flex flex-col gap-2 border-l border-white/5 pl-12 hidden md:flex">
          <span className="text-[#00e676]/60">Uptime</span>
          <span className="text-white/40">99.9%</span>
        </div>
        <div className="flex flex-col gap-2 border-l border-white/5 pl-12 hidden md:flex">
          <span className="text-[#00e676]/60">Nodes</span>
          <span className="text-white/40">14.8k</span>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
