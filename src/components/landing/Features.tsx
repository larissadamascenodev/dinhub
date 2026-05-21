import React from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  Sparkles, Radar, TrendingUp, CreditCard, 
  Camera, ShieldCheck, CheckCircle2, AlertCircle
} from 'lucide-react';

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <section id="funcionalidades" className="py-32 md:py-48 px-5 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at center, rgba(0,230,118,0.08) 0%, transparent 70%)' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-40 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-md"
          >
            <span className="text-[10px] font-black tracking-[0.3em] text-[#00e676] uppercase">The Architecture of Control</span>
          </motion.div>
          
          <h2 className="font-sora font-extrabold text-white text-4xl md:text-7xl tracking-tighter leading-[1.05]">
            Enquanto você vive,<br />
            <span className="bg-gradient-to-r from-white/20 to-white bg-clip-text text-transparent italic font-light">
              a Huby organiza.
            </span>
          </h2>
          
          <p className="text-white/60 max-w-2xl mx-auto text-xl font-inter font-light leading-relaxed">
            Esqueça as planilhas. A Huby é sua inteligência de elite que <span className="text-white font-medium">antecipa movimentos</span> e blinda seu patrimônio com precisão cirúrgica.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-32 md:space-y-48"
        >
          {/* 1. RADAR FINANCEIRO */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-[#00e676]/10 border border-[#00e676]/20 flex items-center justify-center">
                <Radar className="w-7 h-7 text-[#00e676]" />
              </div>
              <h3 className="text-3xl md:text-4xl font-sora font-bold text-white tracking-tight">Radar Financeiro</h3>
              <p className="text-white/50 text-lg leading-relaxed font-light">
                "Ei, percebi que você deu uma exagerada no iFood essa semana... Se continuar assim, o final de semana vai ser de miojo! 😅"
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  'Detecção de gastos atípicos em tempo real',
                  'Alertas inteligentes sobre metas semanais',
                  'Linguagem direta, sem "financês" chato'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-[#00e676]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-[#00e676]/10 blur-[100px] rounded-full group-hover:bg-[#00e676]/20 transition-all duration-1000" />
              <div className="relative bg-[#0f0f0f] border border-white/10 rounded-[32px] p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Alerta de Inteligência</span>
                  <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-500 text-[9px] font-bold uppercase tracking-wider">Atenção</span>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex gap-4 items-start animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white mb-1">Gasto fora do padrão</div>
                      <div className="text-xs text-white/40">iFood • R$ 187,00 • Acima da média</div>
                    </div>
                  </div>
                  <div className="p-4 bg-[#00e676]/5 border border-[#00e676]/20 rounded-2xl flex gap-4 items-start translate-x-4">
                    <div className="w-10 h-10 rounded-full bg-[#00e676]/20 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-[#00e676]">HB</div>
                    <div className="text-xs text-white/90 leading-relaxed">
                      "Vi que o delivery subiu 42% este mês. Quer que eu te ajude a definir um limite pra gente não furar o balanço?"
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. SCORE FINANCEIRO */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="order-2 md:order-1 relative group">
              <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-all duration-1000" />
              <div className="relative bg-[#0f0f0f] border border-white/10 rounded-[32px] p-10 shadow-2xl backdrop-blur-xl text-center">
                <div className="inline-block relative mb-6">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" 
                            strokeDasharray="440" strokeDashoffset="88" className="text-[#00e676]" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white">82</span>
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Score Huby</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm font-medium text-[#00e676]">Status: Excelente</div>
                  <div className="flex items-center gap-2 justify-center bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] text-white/80">Atraso na Internet (-3 pts)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-[#00e676]/10 border border-[#00e676]/20 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-[#00e676]" />
              </div>
              <h3 className="text-3xl md:text-4xl font-sora font-bold text-white tracking-tight">Score Huby</h3>
              <p className="text-white/50 text-lg leading-relaxed font-light">
                "Opa, esqueceu de pagar a Vivo? Seu score caiu 3 pontos. Paga logo antes que isso vire uma bola de neve! 📉"
              </p>
              <p className="text-white/40 text-sm">
                Sua pontuação de saúde financeira baseada em hábitos reais, não apenas em crédito. Atrasou? Cai. Guardou? Sobe.
              </p>
            </div>
          </motion.div>

          {/* 3. PROJEÇÕES INTELIGENTES */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-[#00e676]/10 border border-[#00e676]/20 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-[#00e676]" />
              </div>
              <h3 className="text-3xl md:text-4xl font-sora font-bold text-white tracking-tight">Projeções de Elite</h3>
              <p className="text-white/50 text-lg leading-relaxed font-light">
                "No ritmo atual, você chega aos R$ 10k investidos em Outubro. Se cortar o café gourmet, chega em Agosto! 🚀"
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div className="text-2xl font-bold text-white">6 meses</div>
                  <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Visão de Futuro</div>
                </div>
                <div className="p-4 rounded-2xl border border-[#00e676]/20 bg-[#00e676]/5">
                  <div className="text-2xl font-bold text-[#00e676]">R$ 12.450</div>
                  <div className="text-[10px] text-[#00e676]/60 uppercase font-bold tracking-widest">Saldo Previsto</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-[#0f0f0f] border border-white/10 rounded-[32px] p-8 shadow-2xl">
                <div className="h-48 w-full flex items-end gap-3">
                  {[30, 45, 35, 65, 85, 100].map((h, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      transition={{ delay: i * 0.1, duration: 1 }}
                      className="flex-1 bg-gradient-to-t from-[#00e676]/5 to-[#00e676]/40 rounded-t-lg border-t border-[#00e676]/30"
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-[10px] text-white/20 font-bold uppercase tracking-widest">
                  <span>Hoje</span>
                  <span>Setembro</span>
                  <span>Janeiro</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 4. SCANNER DE COMPROVANTES */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="order-2 md:order-1 relative group">
              <div className="relative bg-white border border-black/10 rounded-lg p-6 w-64 mx-auto shadow-2xl rotate-[-2deg] z-10">
                <div className="text-center border-b border-black/5 pb-4 mb-4">
                  <div className="text-[10px] font-mono text-black/50">MERCADO CENTRAL LTDA</div>
                  <div className="text-[8px] font-mono text-black/30">CNPJ: 00.123.456/0001-99</div>
                </div>
                <div className="space-y-2 font-mono text-[9px] text-black/70">
                  <div className="flex justify-between"><span>CERVEJA ARTESANAL</span> <span>R$ 45,00</span></div>
                  <div className="flex justify-between"><span>CARNE BOVINA 1KG</span> <span>R$ 58,90</span></div>
                  <div className="flex justify-between border-t border-black/5 pt-2 font-bold text-black">
                    <span>TOTAL</span> <span>R$ 103,90</span>
                  </div>
                </div>
                {/* Scanner line animation */}
                <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-[#00e676] shadow-[0_0_15px_#00e676] z-20"
                />
              </div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-40 bg-[#00e676]/5 border border-[#00e676]/20 backdrop-blur-md rounded-2xl z-0 p-6 flex flex-col justify-end"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00e676]/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-[#00e676]" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Registrado com Sucesso</div>
                    <div className="text-sm font-bold text-white">Mercado • R$ 103,90</div>
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-[#00e676]/10 border border-[#00e676]/20 flex items-center justify-center">
                <Camera className="w-7 h-7 text-[#00e676]" />
              </div>
              <h3 className="text-3xl md:text-4xl font-sora font-bold text-white tracking-tight">Scanner Mágico</h3>
              <p className="text-white/50 text-lg leading-relaxed font-light">
                "Escaneou, registrou. A Huby lê o papel, identifica a categoria e já abate do seu orçamento. Sem esforço. ✨"
              </p>
              <p className="text-white/40 text-sm">
                Nossa IA processa notas fiscais e comprovantes em segundos, extraindo valores e itens automaticamente para você.
              </p>
            </div>
          </motion.div>

          {/* 5. FATURAS EM TEMPO REAL */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-[#00e676]/10 border border-[#00e676]/20 flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-[#00e676]" />
              </div>
              <h3 className="text-3xl md:text-4xl font-sora font-bold text-white tracking-tight">Faturas em Tempo Real</h3>
              <p className="text-white/50 text-lg leading-relaxed font-light">
                "Sua fatura do Nubank chegou em 80% do limite. Cuidado pra não ter o cartão recusado no jantar de hoje! 💳"
              </p>
              <div className="space-y-3">
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '80%' }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-gradient-to-r from-[#00e676] to-orange-500"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-white/40 font-bold uppercase tracking-widest">
                  <span>R$ 2.400,00 gastos</span>
                  <span>Limite R$ 3.000,00</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-[#00e676]/10 blur-[100px] rounded-full" />
              <div className="relative bg-[#0f0f0f] border border-white/10 rounded-[32px] p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#820ad1] flex items-center justify-center font-bold text-white text-xs">Nu</div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white">Nubank Gold</div>
                    <div className="text-[9px] text-white/30 uppercase tracking-widest font-bold">•••• 8842</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">R$ 2.400,12</div>
                    <div className="text-[9px] text-[#00e676] font-bold uppercase tracking-widest">Fatura Aberta</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { l: 'Amazon.com', v: 'R$ 189,90', d: 'Hoje, 14:20' },
                    { l: 'Uber Trip', v: 'R$ 24,50', d: 'Hoje, 09:15' },
                    { l: 'Starbucks', v: 'R$ 18,00', d: 'Ontem, 16:40' },
                  ].map((t, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <div>
                        <div className="text-[11px] font-bold text-white">{t.l}</div>
                        <div className="text-[9px] text-white/20">{t.d}</div>
                      </div>
                      <div className="text-[11px] font-bold text-white">{t.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Features;