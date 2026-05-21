import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, LayoutGrid, Camera, Radar, 
  BarChart3, CreditCard, TrendingUp, ArrowRight 
} from 'lucide-react';

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section id="funcionalidades" className="py-32 px-5 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background decoration like Nectar */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at center, rgba(0,230,118,0.05) 0%, transparent 70%)' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-32 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-md"
          >
            <span className="text-[10px] font-black tracking-[0.3em] text-[#00e676] uppercase">The Architecture of Control</span>
          </motion.div>
          
          <h2 className="font-sora font-bold text-white text-3xl md:text-5xl lg:text-7xl leading-tight tracking-tight">
            Enquanto você vive,<br />
            <span className="bg-gradient-to-r from-white/40 to-white bg-clip-text text-transparent italic">
              a Huby organiza.
            </span>
          </h2>
          
          <p className="text-white/40 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Num simples áudio ou mensagem, você organiza o mês inteiro. Sem planilhas, sem esforço.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]"
        >
          {/* CARD 1 - GRANDE (BENTO STYLE) */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-8 md:row-span-2 bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/[0.05] rounded-[32px] p-12 flex flex-col justify-between group hover:border-[#00e676]/30 transition-all duration-700 overflow-hidden relative shadow-2xl"
          >
            <div className="relative z-10">
              <Sparkles className="w-12 h-12 text-[#00e676] mb-6" />
              <h3 className="text-2xl font-sora font-bold text-white mb-4">Assistente Inteligente</h3>
              <p className="text-[#a0a0a0] max-w-sm">
                Converse com seus dados. Pergunte qualquer coisa, receba respostas práticas em segundos.
              </p>
            </div>
            <div className="relative z-10 mt-8 space-y-3">
               <div className="bg-[#1a1a1a] p-3 rounded-xl rounded-bl-none max-w-[200px] text-[10px] text-white animate-pulse">
                "Huby, quanto gastei no mercado?"
               </div>
               <div className="bg-[#00e676]/10 p-3 rounded-xl rounded-br-none max-w-[200px] text-[10px] text-[#00e676] self-end ml-auto [animation-delay:1s] animate-pulse">
                "Foram R$ 432,50 este mês."
               </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e676]/10 rounded-full blur-[100px] pointer-events-none" />
          </motion.div>

          {/* CARD 2 - MÉDIO */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-4 md:row-span-2 bg-[#0f0f0f] border border-white/[0.05] rounded-[32px] p-10 flex flex-col justify-between group hover:border-[#00e676]/30 transition-all duration-700 shadow-2xl"
          >
            <div>
              <LayoutGrid className="w-8 h-8 text-[#00e676] mb-6" />
              <h3 className="text-xl font-sora font-bold text-white mb-4">Gastos por Categoria</h3>
              <p className="text-[#a0a0a0] text-sm">Veja para onde cada real vai, automaticamente.</p>
            </div>
            <div className="space-y-2">
                <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00e676] w-[70%] transition-all duration-1000" />
                </div>
                <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[45%] transition-all duration-1000" />
                </div>
                <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[30%] transition-all duration-1000" />
                </div>
            </div>
          </motion.div>

          {/* CARD 3 - MÉDIO */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-4 md:row-span-1 bg-[#0f0f0f] border border-white/[0.05] rounded-[32px] p-8 flex flex-col justify-between group hover:border-[#00e676]/30 transition-all duration-700 relative overflow-hidden shadow-2xl"
          >
            <div>
              <Camera className="w-8 h-8 text-[#00e676] mb-6 shadow-[0_0_15px_rgba(0,230,118,0.3)]" />
              <h3 className="text-xl font-sora font-bold text-white mb-4">Scanner de Comprovantes</h3>
              <p className="text-[#a0a0a0] text-sm">Escaneie e esqueça. A Huby faz o resto.</p>
            </div>
            <div className="relative h-24 bg-[#1a1a1a]/50 border border-white/5 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00e676]/20 to-transparent h-1/2 w-full animate-scan" />
            </div>
          </motion.div>

          {/* CARD 4 - PEQUENO */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-1 bg-[#0f0f0f] border border-[#1a1a1a] rounded-[24px] p-6 group hover:border-[#00e676]/40 transition-all flex flex-col justify-center gap-4"
          >
            <div className="flex items-center gap-4">
                <div className="relative w-10 h-10 flex items-center justify-center">
                    <Radar className="w-6 h-6 text-[#00e676] z-10" />
                    <div className="absolute inset-0 border border-[#00e676]/30 rounded-full animate-ping" />
                </div>
                <div>
                    <h3 className="text-sm font-sora font-bold text-white">Radar Financeiro</h3>
                    <p className="text-[#a0a0a0] text-[10px]">Alertas antes de virar problema.</p>
                </div>
            </div>
          </motion.div>

          {/* CARD 5 - PEQUENO */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-1 bg-[#0f0f0f] border border-[#1a1a1a] rounded-[24px] p-6 group hover:border-[#00e676]/40 transition-all flex flex-col justify-center gap-4"
          >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#00e676]/30 flex items-center justify-center text-[10px] font-bold text-[#00e676]">82</div>
                <div>
                    <h3 className="text-sm font-sora font-bold text-white">Score Financeiro</h3>
                    <p className="text-[#a0a0a0] text-[10px]">Saiba onde você está.</p>
                </div>
            </div>
          </motion.div>

          {/* CARD 6 - MÉDIO */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-1 bg-[#0f0f0f] border border-[#1a1a1a] rounded-[24px] p-6 group hover:border-[#00e676]/40 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
                <TrendingUp className="w-6 h-6 text-[#00e676]" />
                <span className="text-[10px] font-bold text-[#00e676]">+23%</span>
            </div>
            <h3 className="text-sm font-sora font-bold text-white mb-1">Projeções Inteligentes</h3>
            <p className="text-[#a0a0a0] text-[10px]">Veja onde você vai estar em 6 meses.</p>
          </motion.div>

          {/* CARD 7 - MÉDIO */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-1 bg-[#0f0f0f] border border-[#1a1a1a] rounded-[24px] p-6 group hover:border-[#00e676]/40 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
                <CreditCard className="w-6 h-6 text-[#00e676]" />
            </div>
            <h3 className="text-sm font-sora font-bold text-white mb-1">Faturas em Tempo Real</h3>
            <p className="text-[#a0a0a0] text-[10px]">Nunca mais seja pego de surpresa.</p>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: -50%; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Features;
