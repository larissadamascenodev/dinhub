import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowRight, PieChart, CreditCard, 
  ShoppingBag, TrendingUp, BarChart3, Wallet,
  ArrowUpRight, ArrowDownRight, Clock, Target,
  Receipt, Tag, Calendar
} from 'lucide-react';
import ParticleSphere from './ParticleSphere';

type Role = 'user' | 'huby';
type ChatMsg = {
  role: Role;
  text?: string;
  card?: React.ReactNode;
  followUps?: string[];
};

const APP_SCREENS = [
  { id: 'balanco', label: 'Meu balanço mensal', icon: PieChart },
  { id: 'fatura', label: 'Minha próxima fatura', icon: CreditCard },
  { id: 'parcelas', label: 'Meus parcelamentos', icon: ShoppingBag },
  { id: 'projecao', label: 'Minha projeção', icon: TrendingUp },
  { id: 'categorias', label: 'Gastos por categoria', icon: BarChart3 },
];

const HubySection = () => {
  const [status, setStatus] = useState<'idle' | 'active' | 'responding'>('idle');
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([]);
  const [activeScreen, setActiveScreen] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const scrollToChat = () => {
    setTimeout(() => {
      const el = document.getElementById('chat-anchor');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // ---------- VISUAL CARDS ----------
  const renderCard = (id: string) => {
    switch (id) {
      case 'balanco':
        return (
          <div className="glass-card p-6 w-full space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00e676]/10 flex items-center justify-center border border-[#00e676]/20">
                  <PieChart className="w-5 h-5 text-[#00e676]" />
                </div>
                <span className="text-sm font-bold text-white/90">Fluxo Mensal</span>
              </div>
              <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Junho 2024</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl">
                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ArrowUpRight className="w-3 h-3 text-[#00e676]" /> Receitas
                </div>
                <div className="text-[#00e676] font-bold text-lg">R$ 2.131,02</div>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl">
                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ArrowDownRight className="w-3 h-3 text-red-500" /> Despesas
                </div>
                <div className="text-red-500 font-bold text-lg">R$ 1.961,14</div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Saldo em Conta</div>
                  <div className="text-white font-bold text-3xl tracking-tight">R$ 494,76</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#00e676] font-bold uppercase mb-1">Status</div>
                  <div className="text-xs text-white/80 font-medium">No azul </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/40 uppercase tracking-wider">Meta de economia</span>
                  <span className="text-[#00e676] font-bold">60%</span>
                </div>
                <div className="flex h-1.5 rounded-full overflow-hidden bg-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '60%' }}
                    className="bg-[#00e676] shadow-[0_0_10px_rgba(0,230,118,0.5)]" 
                  />
                </div>
                <div className="text-[10px] text-white/30 italic text-center pt-1">
                  Previsto fim do mês: <span className="text-white/60 font-medium">R$ 334,88</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'fatura':
        return (
          <div className="glass-card p-6 w-full space-y-5">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Nubank PJ</div>
                  <div className="text-[9px] text-white/30 tracking-widest uppercase font-bold">•••• 3426</div>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full border border-orange-500/20 bg-orange-500/10">
                <span className="text-[9px] text-orange-400 font-bold uppercase tracking-wider">76% do limite</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1 flex items-center gap-2">
                <Clock className="w-3 h-3" /> Fatura Aberta • Vence em 27 dias
              </div>
              <div className="text-white font-bold text-4xl tracking-tighter">R$ 631,57</div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '76%' }}
                  className="h-full bg-gradient-to-r from-[#00e676] via-yellow-400 to-orange-500" 
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/30 uppercase font-bold tracking-widest">
                <span>R$ 631,57 usados</span>
                <span>LMT R$ 2.500</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { l: 'Mercado', v: 'R$ 312', icon: ShoppingBag, color: 'text-[#00e676]' },
                { l: 'Lazer', v: 'R$ 187', icon: Tag, color: 'text-purple-400' },
                { l: 'Outros', v: 'R$ 132', icon: Receipt, color: 'text-white/40' },
              ].map((c) => {
                const CIcon = c.icon;
                return (
                  <div key={c.l} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-3 hover:bg-white/[0.05] transition-colors">
                    <CIcon className={`w-3 h-3 ${c.color} mb-1.5`} />
                    <div className="text-[9px] text-white/30 uppercase font-bold mb-0.5">{c.l}</div>
                    <div className="text-[11px] text-white font-bold">{c.v}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'parcelas':
        return (
          <div className="glass-card p-6 w-full space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <Receipt className="w-5 h-5 text-orange-400" />
                </div>
                <span className="text-sm font-bold text-white">Comprometimento</span>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/30 uppercase tracking-widest">Saldo Restante</div>
                <div className="text-white font-bold text-xs">R$ 8.594,01</div>
              </div>
            </div>

            <div className="text-center py-2">
              <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Total Mensal</div>
              <div className="text-orange-400 font-bold text-4xl tracking-tighter">R$ 1.279,47</div>
            </div>

            <div className="space-y-4">
              {[
                { name: 'PlayStation 5', paid: 3, total: 10, value: 'R$ 449,90', color: '#00e676' },
                { name: 'Notebook Dell', paid: 5, total: 12, value: 'R$ 389,00', color: '#7c3aed' },
                { name: 'Seguro Carro', paid: 7, total: 12, value: 'R$ 220,00', color: '#f97316' },
              ].map((p) => {
                const pct = (p.paid / p.total) * 100;
                return (
                  <div key={p.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-[11px] text-white font-medium">{p.name}</span>
                      </div>
                      <div className="text-[10px] font-mono text-white/70">{p.value}</div>
                    </div>
                    <div className="relative h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-white/20 uppercase font-bold tracking-tighter">
                      <span>{p.paid}/{p.total} parcelas</span>
                      <span>{Math.round(pct)}% completo</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'projecao':
        return (
          <div className="glass-card p-6 w-full space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00e676]/10 flex items-center justify-center border border-[#00e676]/20">
                  <Target className="w-5 h-5 text-[#00e676]" />
                </div>
                <span className="text-sm font-bold text-white">Objetivo Setembro</span>
              </div>
              <div className="px-2 py-0.5 rounded-md bg-[#00e676]/10 text-[#00e676] text-[10px] font-bold">+23%</div>
            </div>

            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Previsão de Patrimônio</div>
              <div className="text-white font-bold text-4xl tracking-tighter">R$ 8.750,00</div>
            </div>

            <div className="h-32 w-full flex items-end gap-2.5 pt-4 px-2">
              {[30, 45, 60, 80, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.1, duration: 1 }}
                      className="w-full bg-gradient-to-t from-[#00e676]/5 to-[#00e676]/30 border-t-2 border-[#00e676] rounded-t-lg group-hover:from-[#00e676]/20 transition-all"
                    />
                  </div>
                  <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">{['Mai', 'Jun', 'Jul', 'Ago', 'Set'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'categorias':
        return (
          <div className="glass-card p-6 w-full space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm font-bold text-white">Distribuição de Gastos</span>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'Mercado', value: 'R$ 842,90', pct: 82, color: '#00e676', icon: ShoppingBag },
                { name: 'Delivery', value: 'R$ 487,00', pct: 47, color: '#ef4444', icon: Receipt },
                { name: 'Transporte', value: 'R$ 312,00', pct: 30, color: '#3b82f6', icon: Tag },
                { name: 'Lazer', value: 'R$ 219,80', pct: 22, color: '#a855f7', icon: Calendar },
              ].map((c) => {
                const CIcon = c.icon;
                return (
                  <div key={c.name} className="group">
                    <div className="flex justify-between text-[11px] mb-2">
                      <div className="flex items-center gap-2">
                        <CIcon className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-white font-medium">{c.name}</span>
                      </div>
                      <span className="text-white/70 font-mono">{c.value}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${c.pct}%` }}
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ backgroundColor: c.color }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="pt-4 mt-2 border-t border-white/5 flex justify-between items-center">
              <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Destaque</div>
              <div className="text-[11px] text-red-400 font-medium">Delivery +12% esse mês</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // ---------- INSIGHT TEXT + FOLLOWUPS ----------
  const getScreenIntro = (id: string): { text: string; followUps: string[] } => {
    switch (id) {
      case 'balanco':
        return {
          text: 'Seu mês está positivo em R$ 494,76. No ritmo atual você fecha junho com R$ 334,88 sobrando.',
          followUps: [
            'Como aumentar minha sobra do mês?',
            'O que está puxando minhas despesas?',
            'Estou no ritmo certo pra fechar no azul?',
          ],
        };
      case 'fatura':
        return {
          text: 'Sua fatura está em R$ 631,57 — 76% do limite usado. Vence em 27 dias e o maior peso é mercado.',
          followUps: [
            'Quando eu fico livre dessa fatura?',
            'O que mais pesou no cartão esse mês?',
            'Vale antecipar parte da fatura?',
          ],
        };
      case 'parcelas':
        return {
          text: 'Você tem R$ 1.279,47/mês em parcelas ativas. Quitando o PS5 agora economiza R$ 180 em juros.',
          followUps: [
            'Quando fico livre dos parcelamentos?',
            'Qual parcela faz mais sentido quitar antes?',
            'Posso assumir uma nova compra parcelada?',
          ],
        };
      case 'projecao':
        return {
          text: 'Mantendo o ritmo, você chega a R$ 8.750 em setembro — 23% acima de abril.',
          followUps: [
            'O que muda se eu economizar R$ 200 a mais?',
            'E se eu quitar um parcelamento agora?',
            'Como acelerar minha meta?',
          ],
        };
      case 'categorias':
        return {
          text: 'Mercado lidera com R$ 842,90, seguido por delivery em R$ 487. Juntos = 52% dos gastos.',
          followUps: [
            'Como reduzir gastos com delivery?',
            'Mercado está acima do normal?',
            'Onde dá pra cortar sem dor?',
          ],
        };
      default:
        return { text: 'Como posso ajudar?', followUps: [] };
    }
  };

  // ---------- FOLLOW-UP RESPONSES ----------
  const getFollowUpAnswer = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes('livre') && q.includes('fatura')) return 'Pagando integralmente, você zera essa fatura em 27 dias. Sem novos lançamentos, libera 76% do limite.';
    if (q.includes('livre') && q.includes('parcelamento')) return 'Quitando o cronograma atual, você fica 100% livre em abril de 2027. Antecipando o PS5, antecipa pra outubro de 2026.';
    if (q.includes('antecipar') && q.includes('fatura')) return 'Sim. Pagar R$ 300 agora alivia 47% do limite e te deixa com folga pro próximo ciclo.';
    if (q.includes('pesou') || q.includes('puxando')) return 'Mercado (+R$ 180 vs. média), delivery (+R$ 120) e apps de transporte (+R$ 60). Esses três respondem por 60% da alta.';
    if (q.includes('quitar') && q.includes('antes')) return 'PS5: economiza R$ 180 em juros. É o que tem maior taxa efetiva entre seus ativos.';
    if (q.includes('nova compra')) return 'Hoje, no máximo R$ 380/mês sem comprometer sua reserva. Acima disso vira pressão no fluxo.';
    if (q.includes('delivery')) return 'Definindo teto de R$ 300/mês você libera R$ 187 sem perder qualidade de vida. Sugiro 2 pedidos/semana.';
    if (q.includes('mercado')) return 'Mercado está 27% acima da média dos últimos 3 meses. Provavelmente compras grandes — vale revisar o estoque em casa antes de repetir.';
    if (q.includes('cortar')) return 'Apps de transporte e assinaturas paradas. Identifiquei 3 assinaturas não usadas há 30+ dias = R$ 89/mês.';
    if (q.includes('economizar') || q.includes('200 a mais')) return 'Com +R$ 200/mês você chega a R$ 9.750 em setembro e antecipa sua meta em 38 dias.';
    if (q.includes('acelerar')) return 'Combinando corte em delivery (R$ 187) + quitar PS5 = ganho líquido de R$ 367/mês na sua projeção.';
    if (q.includes('aumentar') && q.includes('sobra')) return 'Foque em 3 alavancas: delivery (-R$ 180), apps parados (-R$ 89), quitar PS5 (-R$ 449 em juros).';
    if (q.includes('ritmo certo')) return 'Sim. Você está 11% acima da curva ideal pra fechar junho no azul.';
    return 'Boa pergunta. Analisando seus dados em tempo real… (a Huby completa essa resposta dentro do app).';
  };

  // ---------- HANDLERS ----------
  const handleScreenClick = (id: string) => {
    if (isLoading) return;
    setActiveScreen(id);
    setIsLoading(true);
    setStatus('active');
    setChatHistory([]);
    scrollToChat();

    setTimeout(() => {
      const intro = getScreenIntro(id);
      setStatus('responding');
      setChatHistory([
        {
          role: 'huby',
          text: intro.text,
          card: renderCard(id),
          followUps: intro.followUps,
        },
      ]);
      setIsLoading(false);
    }, 900);
  };

  const handleFollowUp = (question: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setStatus('active');

    // Remove follow-ups from previous huby message (already used)
    setChatHistory((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last && last.role === 'huby') {
        next[next.length - 1] = { ...last, followUps: undefined };
      }
      next.push({ role: 'user', text: question });
      return next;
    });

    setTimeout(() => {
      setStatus('responding');
      setChatHistory((prev) => [
        ...prev,
        { role: 'huby', text: getFollowUpAnswer(question) },
      ]);
      setIsLoading(false);
    }, 1100);
  };

  // ---------- RENDER ----------
  return (
    <section id="experiencia" className="section-padding px-5 flex flex-col items-center relative overflow-hidden bg-[#0a0a0a]">
      {/* Cinematic background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[400px] bg-gradient-to-b from-[#00e676]/[0.05] via-transparent to-transparent blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[400px] bg-blue-500/[0.02] blur-[150px] rounded-full" />
      </div>

      <div className="w-full max-w-5xl flex flex-col items-center relative z-10">
        <div className="text-center mb-24 md:mb-40 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00e676]" />
            <span className="text-[10px] font-black tracking-[0.3em] text-white/50 uppercase">Interface Neural</span>
          </motion.div>
          
          <h2 className="display-title text-white text-3xl sm:text-5xl md:text-8xl leading-[1.1] md:leading-[1.1]">
            O Tony Stark tem o Jarvis <br className="sm:block" />
            <span className="bg-gradient-to-r from-white/20 via-white to-white/20 bg-clip-text text-transparent italic font-light">
              e você tem a Huby.
            </span>
          </h2>
          
          <p className="text-white/60 max-w-2xl mx-auto text-lg md:text-xl font-inter font-light leading-relaxed px-2">
            Teste a experiência, interaja com a Huby.
          </p>
        </div>

        {/* Screens (former bottom row, now main entry point) */}
        <div className="w-full flex overflow-x-auto no-scrollbar gap-3 pb-8 md:justify-center mb-4">
          {APP_SCREENS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => handleScreenClick(s.id)}
                className={`flex items-center gap-2.5 whitespace-nowrap px-6 py-3.5 rounded-2xl border text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-500 hover:-translate-y-1 ${
                  activeScreen === s.id
                    ? 'bg-[#00e676]/10 border-[#00e676]/40 text-[#00e676] shadow-[0_10px_30px_-10px_rgba(0,230,118,0.3)]'
                    : 'bg-white/[0.02] border-white/[0.05] text-white/50 hover:border-[#00e676]/30 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeScreen === s.id ? 'text-[#00e676]' : 'text-white/30'}`} />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Sphere */}
        <div className="relative mb-12">
          <ParticleSphere state={status} />
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 whitespace-nowrap bg-white/[0.03] px-4 py-2 rounded-xl border border-white/[0.05] backdrop-blur-xl">
            <div
              className={`w-2 h-2 rounded-full ${
                status === 'responding'
                  ? 'bg-[#00e676] animate-pulse shadow-[0_0_10px_#00e676]'
                  : 'bg-white/20'
              }`}
            />
            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
              {status === 'responding' ? 'Huby está processando...' : 'Huby Neural Core Active'}
            </span>
          </div>
        </div>

        {/* Chat */}
        <div id="chat-anchor" className="scroll-mt-32" />
        <AnimatePresence>
          {chatHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-[640px] space-y-6"
            >
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {msg.role === 'huby' ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-[#00e676]/20 flex items-center justify-center border border-[#00e676]/30">
                          <Sparkles className="w-3.5 h-3.5 text-[#00e676]" />
                        </div>
                        <span className="text-[10px] font-bold text-white/40 uppercase">Huby</span>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold text-white/40 uppercase">Você</span>
                    )}
                  </div>

                  <div
                    className={`p-5 md:p-6 max-w-[90%] shadow-2xl ${
                      msg.role === 'user'
                        ? 'bg-white/[0.04] border border-white/10 rounded-[20px_20px_4px_20px] text-white/90'
                        : 'bg-white/[0.04] border border-white/10 rounded-[4px_20px_20px_20px] text-white backdrop-blur-xl'
                    }`}
                  >
                    {msg.text && (
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    )}
                    {msg.card && <div className="mt-4">{msg.card}</div>}
                  </div>

                  {/* Follow-up suggestions */}
                  {msg.followUps && msg.followUps.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mt-4 ml-9 flex flex-wrap gap-2 max-w-[90%]"
                    >
                      {msg.followUps.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleFollowUp(q)}
                          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#00e676]/20 bg-[#00e676]/[0.04] text-[11px] text-white/80 hover:text-[#00e676] hover:border-[#00e676]/50 hover:bg-[#00e676]/[0.08] transition-all duration-300"
                        >
                          {q}
                          <ArrowRight className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-1 p-2 ml-9">
                  <div className="w-1.5 h-1.5 bg-[#00e676] rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-[#00e676] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-[#00e676] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default HubySection;
