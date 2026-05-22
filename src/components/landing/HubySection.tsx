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
          <div className="bg-[#0f0f0f] border border-white/[0.06] p-5 rounded-2xl w-full space-y-4">
            <div className="flex justify-between">
              <div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Receitas</div>
                <div className="text-[#00e676] font-bold text-base">R$ 2.131,02</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Despesas</div>
                <div className="text-red-500 font-bold text-base">R$ 1.961,14</div>
              </div>
            </div>
            <div className="pt-3 border-t border-white/[0.06]">
              <div className="text-[10px] text-white/40 uppercase tracking-wider">Saldo Atual</div>
              <div className="text-white font-bold text-2xl">R$ 494,76</div>
            </div>
            <div className="space-y-1.5">
              <div className="text-[10px] text-white/60">Previsto fim do mês: R$ 334,88</div>
              <div className="flex h-1.5 rounded-full overflow-hidden bg-[#1a1a1a]">
                <div className="bg-[#00e676] w-[60%]" />
                <div className="bg-red-500 w-[40%]" />
              </div>
            </div>
          </div>
        );
      case 'fatura':
        return (
          <div className="bg-[#0f0f0f] border border-white/[0.06] p-5 rounded-2xl w-full space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-white text-sm font-bold">Nubank PJ •••• 3426</div>
                <div className="text-[10px] text-[#00e676] uppercase tracking-wider">Fatura aberta</div>
              </div>
              <span className="text-[9px] text-orange-400 font-bold uppercase tracking-wider">76% do limite</span>
            </div>
            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">Fatura de Junho</div>
              <div className="text-white font-bold text-2xl">R$ 631,57</div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-white/60">
                <span>Vence em 27 dias</span>
                <span>Limite R$ 2.500</span>
              </div>
              <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00e676] via-yellow-400 to-orange-500 w-[76%]" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { l: 'Mercado', v: 'R$ 312' },
                { l: 'Apps', v: 'R$ 187' },
                { l: 'Outros', v: 'R$ 132' },
              ].map((c) => (
                <div key={c.l} className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-2">
                  <div className="text-[9px] text-white/40 uppercase">{c.l}</div>
                  <div className="text-[11px] text-white font-bold">{c.v}</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'parcelas':
        return (
          <div className="bg-[#0f0f0f] border border-white/[0.06] p-5 rounded-2xl w-full space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Comprometido / mês</div>
                <div className="text-orange-400 font-bold text-2xl">R$ 1.279,47</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Restante total</div>
                <div className="text-white font-bold text-sm">R$ 8.594,01</div>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              {[
                { name: 'PlayStation 5', paid: 3, total: 10, value: 'R$ 449,90', color: '#00e676' },
                { name: 'Notebook Dell', paid: 5, total: 12, value: 'R$ 389,00', color: '#7c3aed' },
                { name: 'Sofá retrátil', paid: 4, total: 18, value: 'R$ 220,57', color: '#3b82f6' },
                { name: 'Seguro carro', paid: 7, total: 12, value: 'R$ 220,00', color: '#f97316' },
              ].map((p) => {
                const pct = (p.paid / p.total) * 100;
                return (
                  <div key={p.name} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-[11px] text-white font-medium">{p.name}</span>
                      </div>
                      <div className="text-[10px] text-white/60">
                        <span className="text-white font-bold">{p.paid}</span>
                        <span className="text-white/40">/{p.total}</span>
                        <span className="ml-2 text-white/80">{p.value}</span>
                      </div>
                    </div>
                    <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%`, backgroundColor: p.color }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-white/30">
                      <span>{Math.round(pct)}% pago</span>
                      <span>Faltam {p.total - p.paid}x</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'projecao':
        return (
          <div className="bg-[#0f0f0f] border border-white/[0.06] p-5 rounded-2xl w-full space-y-4">
            <div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">Projeção 5 meses</div>
              <div className="text-white font-bold text-2xl">R$ 8.750,00</div>
              <div className="text-[10px] text-[#00e676]">+23% vs. abril</div>
            </div>
            <div className="h-32 w-full flex items-end gap-1.5">
              {[30, 45, 60, 80, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-[#00e676]/10 to-[#00e676]/40 border-t-2 border-[#00e676] rounded-t-md"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[9px] text-white/40">{['Mai', 'Jun', 'Jul', 'Ago', 'Set'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'categorias':
        return (
          <div className="bg-[#0f0f0f] border border-white/[0.06] p-5 rounded-2xl w-full space-y-3">
            <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Top categorias</div>
            {[
              { name: 'Mercado', value: 'R$ 842,90', pct: 82, color: '#00e676' },
              { name: 'Delivery', value: 'R$ 487,00', pct: 47, color: '#ef4444' },
              { name: 'Transporte', value: 'R$ 312,00', pct: 30, color: '#3b82f6' },
              { name: 'Lazer', value: 'R$ 219,80', pct: 22, color: '#a855f7' },
            ].map((c) => (
              <div key={c.name} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-white">{c.name}</span>
                  <span className="text-white/70 font-bold">{c.value}</span>
                </div>
                <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                </div>
              </div>
            ))}
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
    <section className="py-32 md:py-40 px-5 flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] aspect-square bg-[#00e676]/5 blur-[150px] pointer-events-none rounded-full" />

      <div className="w-full max-w-5xl flex flex-col items-center relative z-10">
        <div className="text-center mb-16 md:mb-24 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00e676]/20 bg-[#00e676]/5 backdrop-blur-md"
          >
            <Sparkles className="w-3 h-3 text-[#00e676]" />
            <span className="text-[10px] font-black tracking-[0.2em] text-[#00e676] uppercase">Interface Neural</span>
          </motion.div>
          
          <h2 className="font-sora font-extrabold text-white text-3xl md:text-7xl tracking-tighter leading-[1.1] md:leading-[1.05]">
            Teste a Experiência <br />
            <span className="bg-gradient-to-r from-white/20 to-white bg-clip-text text-transparent italic font-light">
              interaja com a Huby.
            </span>
          </h2>
          
          <p className="text-white/60 max-w-2xl mx-auto text-lg md:text-xl font-inter font-light leading-relaxed px-2">
            Clique nos tópicos abaixo para simular uma conversa em tempo real e ver como a Huby processa dados complexos em insights acionáveis instantaneamente.
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
