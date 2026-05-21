import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start pt-32 pb-20 px-5 overflow-hidden">
      {/* Background Mesh Grid - Inspired by Nectar */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[100%] aspect-square max-w-[800px] rounded-full bg-[#00e676]/5 blur-[120px] pointer-events-none z-0" />

      {/* Badge */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
        <span className="text-[11px] font-bold text-white/60 tracking-widest uppercase">
          +2.847 pessoas no controle da própria vida
        </span>
      </motion.div>

      {/* Headline - Nectar Style with DinHub Identity */}
      <div className="relative z-10 text-center max-w-5xl px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-sora font-bold leading-[1.1] mb-6 text-white"
          style={{ fontSize: "clamp(2.5rem, 8vw, 5.5rem)" }}
        >
          Tony Stark tem o Jarvis.<br />
          <span className="bg-gradient-to-r from-[#00e676] to-[#00ff88] bg-clip-text text-transparent">
            Você tem a Huby.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-inter"
        >
          O assistente financeiro inteligente que organiza sua vida inteira — só conversando.
        </motion.p>
      </div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 flex flex-col sm:flex-row items-center gap-4 mb-16"
      >
        <a 
          href="/auth"
          className="group relative flex items-center gap-2 px-10 py-4 rounded-full bg-white text-[#0a0a0a] font-sora font-bold text-lg hover:scale-105 transition-all duration-300"
        >
          Começar agora
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>
        
        <button className="flex items-center gap-2 px-10 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white font-sora font-bold text-lg hover:bg-white/10 transition-all duration-300 group">
          <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
          Ver demo
        </button>
      </motion.div>

      {/* Trust Badges */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 flex items-center gap-6 text-[11px] font-bold text-white/40 uppercase tracking-widest"
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border border-[#00e676]/30 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00e676]" />
          </div>
          3 dias de teste grátis
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border border-[#00e676]/30 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00e676]" />
          </div>
          Multiplataforma
        </div>
      </motion.div>

      {/* Dashboard Preview - Mockup like Nectar */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mt-20 w-full max-w-6xl mx-auto px-4"
      >
        <div className="relative rounded-[2rem] border border-white/10 bg-[#0d0d0d] shadow-2xl overflow-hidden aspect-[16/10] md:aspect-[16/9]">
          {/* Top Bar */}
          <div className="absolute top-0 inset-x-0 h-10 border-b border-white/5 bg-white/[0.02] flex items-center px-6 gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="mx-auto bg-white/5 px-4 py-1 rounded-md text-[9px] text-white/20 font-mono tracking-widest uppercase">
              huby.dinhub.app
            </div>
          </div>
          
          {/* Mockup Content - Chatting with Huby */}
          <div className="pt-20 px-8 flex flex-col items-center justify-center h-full">
            <div className="max-w-xl w-full space-y-4">
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl rounded-tr-none ml-auto text-sm text-white/80 leading-relaxed">
                Huby, quanto eu gastei com delivery essa semana? E me diz se ainda estou dentro da meta.
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#00e676]/20 border border-[#00e676]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-[#00e676]">HB</span>
                </div>
                <div className="bg-[#00e676]/10 border border-[#00e676]/20 p-5 rounded-2xl rounded-tl-none text-sm text-white/90 leading-relaxed">
                  Você gastou <span className="text-[#00e676] font-bold">R$ 247,00</span> com delivery. 
                  Isso representa 82% da sua meta semanal de R$ 300. 
                  Sugiro segurar um pouco o iFood no final de semana para não ultrapassar! 😉
                </div>
              </div>
            </div>
            
            {/* Ambient Glow behind mockup */}
            <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-full aspect-square bg-[#00e676]/10 blur-[100px] rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
