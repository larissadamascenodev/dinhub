import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Sparkles, Radar, TrendingUp, CreditCard, 
  Camera, ShieldCheck, CheckCircle2, AlertCircle,
  TrendingDown, Zap, ArrowRight, Wallet, PieChart,
  ArrowUpRight, BarChart3, FileText, Repeat,
  AlertOctagon, Coins, ChevronRight, Utensils,
  ShoppingBag, Car, Home, Plane, Heart,
  Info, ArrowDownRight, Clock
} from 'lucide-react';

const RADAR_SLIDES = [
  {
    insight: {
      icon: ArrowUpRight,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/10',
      text: <>Você gastou <span className="text-orange-400 font-semibold">18% a mais com delivery</span> do que no mês passado.</>,
      tag: 'Alimentação',
    },
    actions: [
      { icon: ShoppingBag, iconColor: 'text-[#00e676]', iconBg: 'bg-[#00e676]/10', title: 'Reduzir gastos com delivery', sub: 'Meta sugerida: R$ 250,00/mês', value: 'R$ 180,00', valueColor: 'text-[#00e676]' },
      { icon: Utensils, iconColor: 'text-orange-400', iconBg: 'bg-orange-500/10', title: 'Cozinhar em casa (FDS)', sub: 'Economia estimada p/ semana', value: 'R$ 85,00', valueColor: 'text-orange-400' },
      { icon: PieChart, iconColor: 'text-white/40', iconBg: 'bg-white/5', title: 'Ver relatório de categorias', sub: 'Análise detalhada de consumo', value: 'Ver mais', valueColor: 'text-white/60' },
    ]
  },
  {
    insight: {
      icon: AlertOctagon,
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-500/10',
      text: <>3 assinaturas somam <span className="text-yellow-400 font-semibold">R$ 79,90/mês</span> e quase não são usadas.</>,
      tag: 'Assinaturas',
    },
    actions: [
      { icon: FileText, iconColor: 'text-[#00e676]', iconBg: 'bg-[#00e676]/10', title: 'Cancelar assinaturas inativas', sub: 'Economize até R$ 79,90/mês', value: 'R$ 79,90', valueColor: 'text-[#00e676]' },
      { icon: Repeat, iconColor: 'text-blue-400', iconBg: 'bg-blue-500/10', title: 'Migrar p/ Plano Familiar', sub: 'Compartilhe custos de streaming', value: 'R$ 24,00', valueColor: 'text-blue-400' },
      { icon: Info, iconColor: 'text-white/40', iconBg: 'bg-white/5', title: 'Revisar termos de uso', sub: 'Verifique multas de cancelamento', value: 'Info', valueColor: 'text-white/60' },
    ]
  },
  {
    insight: {
      icon: BarChart3,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10',
      text: <>Se investir R$ 300/mês, pode acumular <span className="text-[#00e676] font-semibold">R$ 31.723,41 em 5 anos.</span></>,
      tag: 'Investimentos',
    },
    actions: [
      { icon: TrendingUp, iconColor: 'text-[#00e676]', iconBg: 'bg-[#00e676]/10', title: 'Investir com recorrência', sub: 'Aporte mensal sugerido', value: 'R$ 300,00', valueColor: 'text-[#00e676]' },
      { icon: Coins, iconColor: 'text-purple-400', iconBg: 'bg-purple-500/10', title: 'Ativar aporte automático', sub: 'Direto da conta p/ corretora', value: 'Ativar', valueColor: 'text-purple-400' },
      { icon: Zap, iconColor: 'text-white/40', iconBg: 'bg-white/5', title: 'Simular novos cenários', sub: 'Aumente o aporte p/ 10 anos', value: 'Simular', valueColor: 'text-white/60' },
    ]
  },
  {
    insight: {
      icon: CreditCard,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10',
      text: <>Sua fatura atingiu <span className="text-red-400 font-semibold">80% do limite</span> antes do fechamento.</>,
      tag: 'Cartão',
    },
    actions: [
      { icon: Wallet, iconColor: 'text-orange-400', iconBg: 'bg-orange-500/10', title: 'Pagar fatura adiantada', sub: 'Libere limite p/ emergências', value: 'Pagar', valueColor: 'text-orange-400' },
      { icon: ArrowUpRight, iconColor: 'text-[#00e676]', iconBg: 'bg-[#00e676]/10', title: 'Solicitar aumento de limite', sub: 'Baseado no seu score Huby', value: '+R$ 500', valueColor: 'text-[#00e676]' },
      { icon: Clock, iconColor: 'text-white/40', iconBg: 'bg-white/5', title: 'Histórico de faturas', sub: 'Compare com meses anteriores', value: 'Ver', valueColor: 'text-white/60' },
    ]
  },
  {
    insight: {
      icon: Repeat,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      text: <>Detectamos <span className="text-blue-400 font-semibold">cobrança duplicada</span> de R$ 49,90 no seu cartão.</>,
      tag: 'Alerta',
    },
    actions: [
      { icon: ShieldCheck, iconColor: 'text-[#00e676]', iconBg: 'bg-[#00e676]/10', title: 'Contestar transação no App', sub: 'Reembolso em até 24h', value: 'Reaver', valueColor: 'text-[#00e676]' },
      { icon: CreditCard, iconColor: 'text-red-400', iconBg: 'bg-red-500/10', title: 'Bloqueio temporário', sub: 'Evite novas cobranças indevidas', value: 'Bloquear', valueColor: 'text-red-400' },
      { icon: AlertCircle, iconColor: 'text-white/40', iconBg: 'bg-white/5', title: 'Notificar banco emisor', sub: 'Abrir protocolo de segurança', value: 'Abrir', valueColor: 'text-white/60' },
    ]
  }
];

const SCORE_INSIGHTS = [
  {
    score: 82,
    status: 'Excelente',
    color: '#00e676',
    insight: {
      icon: TrendingUp,
      iconColor: 'text-[#00e676]',
      iconBg: 'bg-[#00e676]/10',
      text: <>Seu score subiu <span className="text-[#00e676] font-semibold">12 pontos</span> este mês após você aumentar sua reserva.</>,
      tag: 'Saúde Financeira',
    },
    actions: [
      { icon: ShieldCheck, iconColor: 'text-[#00e676]', iconBg: 'bg-[#00e676]/10', title: 'Manter hábito de poupança', sub: 'Projeção: +5 pts no próximo mês', value: '+5 pts', valueColor: 'text-[#00e676]' },
      { icon: Zap, iconColor: 'text-blue-400', iconBg: 'bg-blue-500/10', title: 'Aporte em Renda Fixa', sub: 'Aumente sua blindagem patrimonial', value: 'Investir', valueColor: 'text-blue-400' },
      { icon: Info, iconColor: 'text-white/40', iconBg: 'bg-white/5', title: 'Ver detalhes do cálculo', sub: 'Entenda como sua nota é formada', value: 'Ver', valueColor: 'text-white/60' },
    ]
  },
  {
    score: 79,
    status: 'Bom',
    color: '#facc15',
    insight: {
      icon: AlertCircle,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10',
      text: <>Seu score caiu <span className="text-red-400 font-semibold">3 pontos</span>. Detectamos um atraso na fatura da Vivo.</>,
      tag: 'Alerta',
    },
    actions: [
      { icon: CreditCard, iconColor: 'text-[#00e676]', iconBg: 'bg-[#00e676]/10', title: 'Pagar conta pendente', sub: 'Recupere seus pontos imediatamente', value: 'Pagar', valueColor: 'text-[#00e676]' },
      { icon: Clock, iconColor: 'text-yellow-400', iconBg: 'bg-yellow-500/10', title: 'Ativar débito automático', sub: 'Evite novas quedas por esquecimento', value: 'Ativar', valueColor: 'text-yellow-400' },
      { icon: ShieldCheck, iconColor: 'text-white/40', iconBg: 'bg-white/5', title: 'Proteger Score Huby', sub: 'Blindagem contra pequenos atrasos', value: 'Ativar', valueColor: 'text-white/60' },
    ]
  }
];

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.98, filter: 'blur(10px)' },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] 
      }
    }
  };

  return (
    <section id="radar" className="section-padding px-4 sm:px-6 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at center, rgba(0,230,118,0.4) 0%, transparent 70%)' }} />

      <div className="fluid-container relative z-10">
        <div id="radar-header" className="text-center mb-16 md:mb-32 lg:mb-40 space-y-6 md:space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 md:px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md"
          >
            <span className="text-[9px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.3em] text-[#00e676] uppercase text-center">The Architecture of Control</span>
          </motion.div>
          
          <h2 className="display-title text-white text-3xl sm:text-4xl md:text-6xl lg:text-8xl">
            Enquanto você vive,<br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-white/20 via-white to-white/20 bg-clip-text text-transparent italic font-light">
              a Huby organiza.
            </span>
          </h2>
          
          <p className="text-white/40 max-w-2xl mx-auto text-base sm:text-lg md:text-xl lg:text-2xl font-inter font-light leading-relaxed">
            Esqueça as planilhas. A Huby é sua inteligência de elite que <span className="text-white font-medium">antecipa movimentos</span> e blinda seu patrimônio com precisão cirúrgica.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-32 md:space-y-64"
        >
          {/* 1. RADAR FINANCEIRO */}
          <div id="radar-section" className="relative">
            <motion.div variants={itemVariants} className="flex flex-col gap-16 md:gap-24 items-center">
              <div className="w-full max-w-4xl mx-auto text-center space-y-8 sm:space-y-10">
                <div className="flex flex-col items-center gap-5">
                  <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-sora font-extrabold text-white tracking-tighter">Radar Financeiro</h3>
                </div>
                
                <div className="space-y-8">
                  <p className="text-white/50 text-lg sm:text-xl md:text-2xl leading-relaxed font-light max-w-3xl mx-auto px-4 sm:px-0">
                    O Radar identifica padrões perigosos e indica exatamente o que você deve fazer. <span className="text-white/80 font-medium">Tudo visual, direto e automático.</span>
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-4 sm:gap-10 px-4">
                    {[
                      'Insights preditivos de inteligência',
                      'Indicação de ações corretivas imediatas',
                      'Monitoramento de padrões de consumo'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs sm:text-sm font-medium text-white/50 hover:text-white transition-colors duration-300">
                        <div className="w-5 h-5 rounded-full border border-[#00e676]/20 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-[#00e676]" />
                        </div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 sm:pt-10 border-t border-white/[0.05] max-w-2xl mx-auto">
                  <p className="text-white/30 text-base sm:text-lg md:text-xl font-light italic px-4 sm:px-0">
                    "Identificamos padrões, alertamos riscos e sugerimos ações imediatas antes mesmo de você abrir o banco."
                  </p>
                </div>
              </div>
              
              <div className="w-full relative px-4">
                <HubyInsightsPanel />
              </div>
            </motion.div>
          </div>

          {/* 2. SCORE FINANCEIRO */}
          <motion.div variants={itemVariants} className="flex flex-col gap-16 md:gap-24 items-center">
            <div className="w-full max-w-4xl mx-auto text-center space-y-8 sm:space-y-10">
              <div className="flex flex-col items-center gap-5">
                <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-sora font-extrabold text-white tracking-tighter">Score Huby</h3>
              </div>
              
              <div className="space-y-8">
                <p className="text-white/50 text-lg sm:text-xl md:text-2xl leading-relaxed font-light max-w-3xl mx-auto px-4 sm:px-0">
                  Sua pontuação de saúde financeira baseada em hábitos reais. Guardou? Sobe. Esqueceu um boleto? A Huby avisa e seu score reflete na hora. <span className="text-white/80 font-medium">Controle total da sua reputação financeira.</span>
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 sm:gap-10 px-4">
                  {[
                    'Cálculo baseado em comportamento real',
                    'Feedback imediato sobre ganhos e perdas',
                    'Dicas práticas para subir sua pontuação'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs sm:text-sm font-medium text-white/50 hover:text-white transition-colors duration-300">
                      <div className="w-5 h-5 rounded-full border border-[#00e676]/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-[#00e676]" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 sm:pt-10 border-t border-white/[0.05] max-w-2xl mx-auto">
                <p className="text-white/30 text-base sm:text-lg md:text-xl font-light italic px-4 sm:px-0">
                  "O score que realmente importa: aquele que mede sua disciplina e liberdade, não apenas sua dívida."
                </p>
              </div>
            </div>
            
            <div className="w-full relative px-4">
              <HubyScorePanel />
            </div>
          </motion.div>

          {/* 3. PROJEÇÕES INTELIGENTES */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-32 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="w-14 h-14 rounded-2xl bg-[#00e676]/10 border border-[#00e676]/20 flex items-center justify-center mx-auto lg:mx-0">
                <TrendingUp className="w-7 h-7 text-[#00e676]" />
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-sora font-bold text-white tracking-tight">Projeções de Elite</h3>
              <p className="text-white/50 text-base sm:text-lg lg:text-xl leading-relaxed font-light px-4 sm:px-0">
                "No ritmo atual, você chega aos R$ 10k investidos em Outubro. Se cortar o café gourmet, chega em Agosto! 🚀"
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 px-4 sm:px-0">
                <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div className="text-xl sm:text-2xl font-bold text-white">6 meses</div>
                  <div className="text-[9px] lg:text-[10px] text-white/40 uppercase font-bold tracking-widest">Visão de Futuro</div>
                </div>
                <div className="p-4 rounded-2xl border border-[#00e676]/20 bg-[#00e676]/5">
                  <div className="text-xl sm:text-2xl font-bold text-[#00e676]">R$ 12.450</div>
                  <div className="text-[9px] lg:text-[10px] text-[#00e676]/60 uppercase font-bold tracking-widest">Saldo Previsto</div>
                </div>
              </div>
            </div>
            <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
              <div className="bg-[#0f0f0f] border border-white/10 rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-2xl">
                <div className="h-40 sm:h-48 w-full flex items-end gap-2 sm:gap-3 px-2 sm:px-4">
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
                <div className="flex justify-between mt-6 text-[9px] lg:text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">
                  <span>Hoje</span>
                  <span>Setembro</span>
                  <span>Janeiro</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 4. SCANNER DE COMPROVANTES */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-32 items-center">
            <div className="order-2 lg:order-1 relative group py-8 sm:py-12">
              <div className="relative bg-white border border-black/10 rounded-lg p-5 sm:p-6 w-56 sm:w-64 mx-auto shadow-2xl rotate-[-2deg] z-10 transition-transform group-hover:rotate-0 duration-500">
                <div className="text-center border-b border-black/5 pb-4 mb-4">
                  <div className="text-[9px] sm:text-[10px] font-mono text-black/50 uppercase tracking-tight">Mercado Central LTDA</div>
                  <div className="text-[7px] sm:text-[8px] font-mono text-black/30">CNPJ: 00.123.456/0001-99</div>
                </div>
                <div className="space-y-2 font-mono text-[8px] sm:text-[9px] text-black/70">
                  <div className="flex justify-between"><span>CERVEJA ARTESANAL</span> <span>R$ 45,00</span></div>
                  <div className="flex justify-between"><span>CARNE BOVINA 1KG</span> <span>R$ 58,90</span></div>
                  <div className="flex justify-between border-t border-black/5 pt-2 font-bold text-black text-[9px] sm:text-[10px]">
                    <span>TOTAL</span> <span>R$ 103,90</span>
                  </div>
                </div>
                {/* Scanner line animation */}
                <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 sm:h-1 bg-[#00e676] shadow-[0_0_15px_#00e676] z-20"
                />
              </div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-80 h-36 sm:h-40 bg-[#00e676]/5 border border-[#00e676]/20 backdrop-blur-md rounded-2xl z-0 p-5 sm:p-6 flex flex-col justify-end"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#00e676]/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#00e676]" />
                  </div>
                  <div>
                    <div className="text-[9px] lg:text-[10px] text-white/40 uppercase font-bold tracking-[0.1em]">Registrado com Sucesso</div>
                    <div className="text-xs sm:text-sm font-bold text-white">Mercado • R$ 103,90</div>
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="order-1 lg:order-2 space-y-6 text-center lg:text-left">
              <div className="w-14 h-14 rounded-2xl bg-[#00e676]/10 border border-[#00e676]/20 flex items-center justify-center mx-auto lg:mx-0">
                <Camera className="w-7 h-7 text-[#00e676]" />
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-sora font-bold text-white tracking-tight">Scanner Mágico</h3>
              <p className="text-white/50 text-base sm:text-lg lg:text-xl leading-relaxed font-light px-4 sm:px-0">
                "Escaneou, registrou. A Huby lê o papel, identifica a categoria e já abate do seu orçamento. Sem esforço. ✨"
              </p>
              <p className="text-white/40 text-sm px-4 sm:px-0">
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
              <h3 className="text-2xl md:text-4xl font-sora font-bold text-white tracking-tight">Faturas em Tempo Real</h3>
              <p className="text-white/50 text-base md:text-lg leading-relaxed font-light">
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
              <div className="relative bg-[#0f0f0f] border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl backdrop-blur-xl">
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

const HubyInsightsPanel: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(0);
  
  useEffect(() => {
    // Tela fixa conforme solicitado
    return () => {};
  }, []);

  const handleDotClick = (newIdx: number) => {
    setDirection(newIdx > idx ? 1 : -1);
    setIdx(newIdx);
  };

  const currentSlide = RADAR_SLIDES[idx];
  const insight = currentSlide.insight;
  const InsightIcon = insight.icon;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
      filter: 'blur(10px)',
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
      filter: 'blur(10px)',
    })
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto min-h-[600px] flex items-center justify-center">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-[#00e676]/10 via-transparent to-blue-500/10 blur-[120px] opacity-40" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        {/* Left Section: The "Scanner/Radar" Core */}
        <div className="lg:col-span-5 flex flex-col justify-center items-center lg:items-start space-y-8 order-2 lg:order-1">
          <div className="relative group">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-12 border border-white/5 rounded-full"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8 border border-[#00e676]/10 rounded-full"
            />
            
            <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#00e676]/5 border border-[#00e676]/20 backdrop-blur-sm" />
              <Radar className="w-16 h-16 md:w-24 md:h-24 text-[#00e676] drop-shadow-[0_0_20px_rgba(0,230,118,0.4)]" />
              
              {/* Spinning Scan Line */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-transparent to-[#00e676]/20"
                style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%)' }}
              />
            </div>
          </div>

          <div className="space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00e676]/10 border border-[#00e676]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
              <span className="text-[10px] font-black text-[#00e676] uppercase tracking-[0.2em]">Neural Processing Active</span>
            </div>
            <h4 className="text-xl md:text-2xl font-bold text-white tracking-tight">Scanner de Padrões v4.0</h4>
            <p className="text-white/40 text-sm max-w-sm font-medium italic">"Analisando milhões de variáveis financeiras para proteger seu patrimônio em tempo real."</p>
          </div>
        </div>

        {/* Right Section: Intelligence Display */}
        <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
          {/* Main Insight Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-[40px] bg-white/[0.02] border border-white/10 backdrop-blur-2xl relative overflow-hidden group hover:border-[#00e676]/30 transition-all duration-500"
          >
            <div className="absolute top-0 right-0 p-6">
              <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/40 font-bold uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-3 h-3" /> 14:42:01
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black text-[#00e676] uppercase tracking-[0.3em]">{insight.tag}</span>
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl ${insight.iconBg} flex items-center justify-center shrink-0 border border-white/5 shadow-2xl group-hover:scale-110 transition-transform`}>
                    <InsightIcon className={`w-8 h-8 ${insight.iconColor}`} />
                  </div>
                  <p className="text-white/90 text-2xl md:text-3xl leading-[1.2] font-semibold tracking-tight">
                    {insight.text}
                  </p>
                </div>
              </div>

              {/* Action Grid */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-[#00e676]" />
                  <h5 className="text-xs font-black text-white/40 uppercase tracking-widest">Protocolos Sugeridos</h5>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentSlide.actions.slice(0, 2).map((a, i) => {
                    const ActionIcon = a.icon;
                    return (
                      <div 
                        key={i}
                        className="flex items-center gap-4 p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-[#00e676]/10 hover:border-[#00e676]/30 transition-all duration-300 group/item cursor-pointer"
                      >
                        <div className={`w-12 h-12 rounded-2xl ${a.iconBg} flex items-center justify-center shrink-0 border border-white/5 group-hover/item:scale-110 transition-transform`}>
                          <ActionIcon className={`w-6 h-6 ${a.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-white group-hover/item:text-[#00e676] transition-colors">{a.title}</div>
                          <div className="text-[10px] text-white/30 font-medium mt-1 uppercase tracking-wider">{a.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Secondary Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-[32px] bg-white/[0.01] border border-white/5 flex flex-col justify-between group hover:bg-white/[0.03] transition-all">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Confiança da IA</span>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-2xl font-bold text-white tracking-tighter">98.4%</span>
                <TrendingUp className="w-5 h-5 text-[#00e676]" />
              </div>
            </div>
            <div className="p-6 rounded-[32px] bg-white/[0.01] border border-white/5 flex flex-col justify-between group hover:bg-white/[0.03] transition-all">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Latência de Rede</span>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-2xl font-bold text-white tracking-tighter">12ms</span>
                <div className="flex gap-1 h-5 items-end">
                  {[4, 8, 5, 10, 6].map((h, i) => <div key={i} className="w-1 bg-[#00e676]/40 rounded-full" style={{ height: `${h * 10}%` }} />)}
                </div>
              </div>
            </div>
            <div className="p-6 rounded-[32px] bg-[#00e676]/5 border border-[#00e676]/10 flex flex-col justify-between group hover:bg-[#00e676]/10 transition-all cursor-pointer">
              <span className="text-[9px] font-black text-[#00e676] uppercase tracking-widest">Otimizar Agora</span>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-bold text-white">Executar Tudo</span>
                <ArrowRight className="w-5 h-5 text-[#00e676] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots moved to bottom */}
      <div className="flex items-center justify-center gap-3 mt-auto pt-8 pb-2">
        {RADAR_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            className={`group/dot relative h-1.5 transition-all duration-500 cursor-pointer overflow-hidden ${
              i === idx ? 'w-10 bg-[#00e676]' : 'w-2 bg-white/10 hover:bg-white/30'
            } rounded-full`}
            aria-label={`Ir para slide ${i + 1}`}
          >
            {i === idx && (
              <motion.div 
                initial={{ left: '-100%' }}
                animate={{ left: '0%' }}
                transition={{ duration: 5, ease: "linear" }}
                className="absolute top-0 bottom-0 w-full bg-white/40"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const HubyScorePanel: React.FC = () => {
  const currentSlide = SCORE_INSIGHTS[0]; // Fixado na primeira tela (Excelente)
  const insight = currentSlide.insight;
  const InsightIcon = insight.icon;

  return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
      {/* Futuristic Background Accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[#00e676]/5 blur-[120px] rounded-full pointer-events-none opacity-50" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay" />
      
      {/* Left Column: Visual Data */}
      <div className="flex-1 flex flex-col items-center justify-center relative space-y-8">
        <div className="relative">
          {/* Animated Glow Rings */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-[#00e676]/20 blur-sm"
          />
          <motion.div 
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute -inset-4 rounded-full border border-blue-500/10"
          />

          <div className="relative w-48 h-48 md:w-64 md:h-64">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(0,230,118,0.2)]">
              <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/[0.03]" />
              <motion.circle 
                cx="50%" cy="50%" r="45%" 
                stroke="url(#scoreGradient)" strokeWidth="12" fill="transparent" 
                strokeDasharray="283" 
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 - (283 * (currentSlide.score / 100)) }}
                transition={{ duration: 2, ease: "circOut" }}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00e676" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <span className="text-6xl md:text-8xl font-black text-white tracking-tighter block leading-none">
                  {currentSlide.score}
                </span>
                <span className="text-[10px] md:text-xs text-white/40 font-black uppercase tracking-[0.4em] mt-2 block">
                  Neural Score
                </span>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <div className="px-6 py-2 rounded-full bg-[#00e676]/10 border border-[#00e676]/20 backdrop-blur-md">
            <span className="text-xs font-black text-[#00e676] uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
              Status: {currentSlide.status}
            </span>
          </div>
          <span className="text-[10px] text-white/20 font-medium italic">Sincronizado via Huby Core v2.4</span>
        </div>
      </div>

      {/* Right Column: Intelligence & Actions */}
      <div className="flex-1 flex flex-col justify-center space-y-8 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <h4 className="text-lg font-bold text-white tracking-tight">Análise Preditiva</h4>
          </div>

          <div className="p-6 rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#00e676]" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#00e676] uppercase tracking-widest">{insight.tag}</span>
                <div className="flex items-center gap-1.5 text-[10px] text-white/30 font-bold">
                  <Clock className="w-3 h-3" /> ATUALIZADO AGORA
                </div>
              </div>
              <p className="text-white/90 text-lg leading-relaxed font-medium">
                {insight.text}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-[#00e676]" />
            <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest">Ações de Otimização</h4>
          </div>

          <div className="grid gap-3">
            {currentSlide.actions.map((a, i) => {
              const ActionIcon = a.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#00e676]/40 hover:bg-[#00e676]/10 transition-all duration-300 group cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl ${a.iconBg} flex items-center justify-center shrink-0 border border-white/5 group-hover:border-[#00e676]/20 transition-all`}>
                    <ActionIcon className={`w-5 h-5 ${a.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white group-hover:text-[#00e676] transition-colors">{a.title}</div>
                    <div className="text-[11px] text-white/30 truncate mt-0.5">{a.sub}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`text-xs font-black ${a.valueColor} bg-white/[0.03] px-3 py-1 rounded-lg border border-white/5`}>
                      {a.value}
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-[#00e676] group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
