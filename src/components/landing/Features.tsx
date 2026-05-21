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
    <section id="radar" className="py-20 md:py-48 px-5 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at center, rgba(0,230,118,0.08) 0%, transparent 70%)' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <div id="radar-header" className="text-center mb-16 md:mb-40 space-y-6 md:space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-md"
          >
            <span className="text-[10px] font-black tracking-[0.3em] text-[#00e676] uppercase">The Architecture of Control</span>
          </motion.div>
          
          <h2 className="font-sora font-extrabold text-white text-3xl md:text-7xl tracking-tighter leading-[1.1] md:leading-[1.05]">
            Enquanto você vive,<br />
            <span className="bg-gradient-to-r from-white/20 to-white bg-clip-text text-transparent italic font-light">
              a Huby organiza.
            </span>
          </h2>
          
          <p className="text-white/60 max-w-2xl mx-auto text-lg md:text-xl font-inter font-light leading-relaxed px-2">
            Esqueça as planilhas. A Huby é sua inteligência de elite que <span className="text-white font-medium">antecipa movimentos</span> e blinda seu patrimônio com precisão cirúrgica.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-20 md:space-y-48"
        >
          {/* 1. RADAR FINANCEIRO - STATIC HUB INSIGHTS PANEL */}
          <div id="radar-section" className="space-y-12 md:space-y-16">
            <motion.div variants={itemVariants} className="max-w-3xl mx-auto text-center space-y-4">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#00e676]/20 blur-xl rounded-full animate-pulse" />
                  <div className="relative w-16 h-16 rounded-2xl bg-[#00e676]/10 border border-[#00e676]/20 flex items-center justify-center">
                    <Radar className="w-8 h-8 text-[#00e676]" />
                  </div>
                </div>
              </div>
              <h3 className="text-3xl md:text-5xl font-sora font-bold text-white tracking-tight">O Radar Financeiro da Huby</h3>
              <p className="text-white/50 text-lg md:text-xl font-light max-w-2xl mx-auto">
                Uma visão 360° do seu dinheiro em tempo real. Identificamos padrões, alertamos riscos e sugerimos ações imediatas.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-[#00e676]/10 border border-[#00e676]/20 flex items-center justify-center">
                <Radar className="w-7 h-7 text-[#00e676]" />
              </div>
              <h3 className="text-2xl md:text-4xl font-sora font-bold text-white tracking-tight">Radar Financeiro</h3>
              <p className="text-white/50 text-base md:text-lg leading-relaxed font-light">
                O Radar identifica padrões perigosos e indica exatamente o que você deve fazer. Tudo visual, direto e automático.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  'Insights preditivos de inteligência',
                  'Indicação de ações corretivas imediatas',
                  'Monitoramento de padrões de consumo'
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
              <HubyInsightsPanel />
            </div>
            </motion.div>
          </div>

          {/* 2. SCORE FINANCEIRO */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="order-2 md:order-1 relative group">
              <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-all duration-1000" />
              <div className="relative bg-[#0f0f0f] border border-white/10 rounded-[32px] p-6 md:p-10 shadow-2xl backdrop-blur-xl text-center">
                <div className="inline-block relative mb-6">
                  <svg className="w-32 h-32 md:w-40 md:h-40 transform -rotate-90">
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
              <h3 className="text-2xl md:text-4xl font-sora font-bold text-white tracking-tight">Score Huby</h3>
              <p className="text-white/50 text-base md:text-lg leading-relaxed font-light">
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
              <h3 className="text-2xl md:text-4xl font-sora font-bold text-white tracking-tight">Projeções de Elite</h3>
              <p className="text-white/50 text-base md:text-lg leading-relaxed font-light">
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
              <div className="bg-[#0f0f0f] border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl">
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
              <h3 className="text-2xl md:text-4xl font-sora font-bold text-white tracking-tight">Scanner Mágico</h3>
              <p className="text-white/50 text-base md:text-lg leading-relaxed font-light">
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
    const t = setInterval(() => {
      setDirection(1);
      setIdx((p) => (p + 1) % RADAR_SLIDES.length);
    }, 5000); // 5 segundos como solicitado
    return () => clearInterval(t);
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
    <div className="relative bg-[#0a0a0a]/40 border border-white/10 rounded-[40px] p-4 md:p-8 shadow-[0_0_50px_-12px_rgba(0,230,118,0.2)] backdrop-blur-2xl flex flex-col min-h-[540px] md:min-h-[520px] overflow-hidden group/panel transition-all duration-500 hover:border-[#00e676]/30">
      {/* Glow effect decorative elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00e676]/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
      
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={idx}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 },
            filter: { duration: 0.4 }
          }}
          className="flex-1 flex flex-col space-y-6 md:space-y-8"
        >
          {/* Insights da Huby */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#00e676]/15 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00e676]" />
              </div>
              <span className="text-sm font-semibold text-white">Insights da Huby</span>
            </div>

            <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5 rounded-2xl bg-white/[0.04] border border-white/10 shadow-inner">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${insight.iconBg} flex items-center justify-center shrink-0`}>
                <InsightIcon className={`w-5 h-5 md:w-6 md:h-6 ${insight.iconColor}`} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Detectado Agora</span>
                  <span className="text-[10px] text-white/50 px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] whitespace-nowrap">
                    {insight.tag}
                  </span>
                </div>
                <p className="text-sm md:text-lg text-white/90 leading-relaxed font-medium">
                  {insight.text}
                </p>
              </div>
            </div>
          </div>

          {/* Ações sugeridas pela Huby */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00e676]" />
                <span className="text-sm font-semibold text-white">Ações sugeridas pela Huby</span>
              </div>
              <span className="text-[11px] text-white/40 hover:text-[#00e676] cursor-pointer transition">Executar todas</span>
            </div>

            <div className="grid gap-3">
              {currentSlide.actions.map((a, i) => {
                const ActionIcon = a.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#00e676]/30 hover:bg-[#00e676]/5 transition-all duration-300 cursor-pointer group"
                  >
                    <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${a.iconBg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                      <ActionIcon className={`w-4 h-4 md:w-5 md:h-5 ${a.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="text-[12px] md:text-[14px] font-semibold text-white group-hover:text-[#00e676] transition-colors leading-tight">{a.title}</div>
                      <div className="text-[10px] md:text-[11px] text-white/40 truncate mt-0.5">{a.sub}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className={`text-[11px] md:text-[13px] font-bold ${a.valueColor} whitespace-nowrap`}>{a.value}</div>
                        <div className="text-[8px] md:text-[9px] text-white/20 font-bold uppercase tracking-tighter">Sugestão</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#00e676] group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                );
              })}
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

export default Features;
