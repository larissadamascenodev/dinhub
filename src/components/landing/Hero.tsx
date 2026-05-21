import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start pt-24 md:pt-32 pb-12 md:pb-20 px-5 overflow-hidden">
      {/* Background Mesh Grid - Inspired by Nectar */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] aspect-square max-w-[1000px] rounded-full bg-[#00e676]/10 blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-0 w-[50%] aspect-square bg-[#00e676]/5 blur-[120px] pointer-events-none z-0" />

      {/* Badge */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-xl mb-12 shadow-2xl shadow-black"
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
          className="font-sora font-bold leading-[1.1] mb-6 text-white text-center"
          style={{ fontSize: "clamp(2rem, 10vw, 5.5rem)" }}
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
          className="text-white/50 text-lg md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed font-inter font-light tracking-tight"
        >
          O assistente financeiro de elite que organiza sua vida inteira — <span className="text-white/80 font-medium">com precisão absoluta.</span>
        </motion.p>
      </div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 flex flex-col sm:flex-row items-center gap-6 mb-20"
      >
        <a 
          href="/auth"
          className="group relative flex items-center gap-3 px-12 py-5 rounded-2xl bg-[#00e676] text-[#0a0a0a] font-sora font-extrabold text-lg hover:bg-[#00ff88] hover:shadow-[0_0_30px_rgba(0,230,118,0.5)] transition-all duration-500 hover:-translate-y-1"
        >
          Eleve suas finanças
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-500" />
        </a>
        
        <button className="flex items-center gap-3 px-12 py-5 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-xl text-white font-sora font-extrabold text-lg hover:bg-white/[0.08] transition-all duration-500 group border-b-white/10">
          <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform duration-500" />
          Ver Experiência
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
        <div className="relative rounded-[2rem] md:rounded-[3rem] border border-white/[0.05] bg-[#050505] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden aspect-[4/5] sm:aspect-[16/10] md:aspect-[16/9] group/mockup">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#00e676]/5 to-transparent opacity-0 group-hover/mockup:opacity-100 transition-opacity duration-1000" />
          {/* Top Bar */}
          <div className="absolute top-0 inset-x-0 h-8 md:h-12 border-b border-white/[0.03] bg-white/[0.01] flex items-center px-4 md:px-8 gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="mx-auto bg-white/5 px-4 py-1 rounded-md text-[9px] text-white/20 font-mono tracking-widest uppercase">
              huby.dinhub.app
            </div>
          </div>
          
          {/* Mockup Content - Chatting with Huby */}
          <div className="pt-12 md:pt-20 px-4 md:px-8 flex flex-col items-center justify-center h-full">
            <div className="max-w-xl w-full space-y-3 md:space-y-4">
              <div className="bg-white/[0.03] border border-white/[0.05] p-4 md:p-8 rounded-[32px] rounded-tr-none ml-auto text-[10px] md:text-sm text-white/70 leading-relaxed backdrop-blur-xl shadow-2xl">
                Huby, quanto eu gastei com delivery essa semana? E me diz se ainda estou dentro da meta.
              </div>
              <div className="flex gap-2 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#00e676]/20 border border-[#00e676]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[8px] md:text-[10px] font-bold text-[#00e676]">HB</span>
                </div>
                <div className="bg-[#00e676]/10 border border-[#00e676]/20 p-3 md:p-5 rounded-2xl rounded-tl-none text-xs md:text-sm text-white/90 leading-relaxed">
                  Você gastou <span className="text-[#00e676] font-bold">R$ 247,00</span> com delivery. 
                  Isso representa 82% da sua meta semanal de R$ 300. 
                  Sugiro segurar um pouco o iFood no final de semana para não ultrapassar! 😉
                </div>
              </div>
            </div>
          </div>
          
          {/* Ambient Glow behind mockup */}
          <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-full aspect-square bg-[#00e676]/10 blur-[100px] rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;