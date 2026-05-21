import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, Send } from 'lucide-react';
import ParticleSphere from './ParticleSphere';

const QUESTIONS = [
  { id: 1, text: "💰 Quanto ainda posso gastar esse mês?" },
  { id: 2, text: "📅 Quando fico livre de parcelas?" },
  { id: 3, text: "📈 Qual minha projeção para o próximo mês?" },
  { id: 4, text: "⚠ Onde estou gastando demais?" },
];

const APP_SCREENS = [
  { id: 'balanco', label: "📊 Ver meu balanço mensal" },
  { id: 'fatura', label: "💳 Ver minha próxima fatura" },
  { id: 'parcelas', label: "📦 Ver meus parcelamentos" },
  { id: 'projecao', label: "📈 Ver minha projeção financeira" },
  { id: 'categorias', label: "🗂 Ver gastos por categoria" },
];

const HubySection = () => {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'active' | 'responding'>('idle');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleQuestionClick = (q: any) => {
    if (isLoading) return;
    setActiveQuestion(q.id);
    setStatus('active');
    
    // Clear chat and start sequence
    setChatHistory([]);
    setIsLoading(true);

    // Sequence
    setTimeout(() => {
      setStatus('responding');
      setChatHistory([{ role: 'user', content: q.text }]);
      
      setTimeout(() => {
        const response = getResponseForQuestion(q.id);
        setChatHistory(prev => [...prev, { role: 'huby', ...response }]);
        setIsLoading(false);
      }, 1500);
    }, 800);
  };

  const getResponseForQuestion = (id: number) => {
    switch(id) {
      case 1:
        return {
          text: "Você tem R$ 847,30 disponíveis.",
          highlight: true,
          card: (
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] p-4 rounded-xl mt-3 space-y-3">
              <div className="text-[10px] text-[#a0a0a0] font-bold">ORÇAMENTO DE MAIO</div>
              <div className="flex justify-between text-sm">
                <span className="text-white">Usado: <span className="text-red-500">R$ 2.302,70</span></span>
                <span className="text-white">Disponível: <span className="text-[#00e676]">R$ 847,30</span></span>
              </div>
              <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '73%' }} />
              </div>
              <div className="text-[10px] text-[#a0a0a0]">73% do mês utilizado</div>
            </div>
          ),
          followUp: "No ritmo atual vai estourar em 6 dias. Corta R$ 200 em delivery essa semana."
        };
      case 2:
        return {
          text: "Você fica livre em abril de 2027.",
          highlight: true,
          card: (
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] p-4 rounded-xl mt-3 space-y-3 text-xs">
              <div className="text-[10px] text-[#a0a0a0] font-bold">PARCELAMENTOS ATIVOS</div>
              <div className="flex items-center justify-between p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <span>PS5 — livre Jul/26</span>
                <span className="text-purple-400">3/10</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <span>Notebook Dell — Dez/26</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <span>Seguro carro — Mai/26</span>
              </div>
            </div>
          ),
          followUp: "R$ 8.594 em parcelas ativas. Quitando o PS5 agora economiza R$ 180 em juros."
        };
      case 3:
        return {
            text: "Mantendo o ritmo, você chega a R$ 8.750 em setembro.",
            highlight: true,
            card: (
              <div className="bg-[#0f0f0f] border border-[#1a1a1a] p-4 rounded-xl mt-3 space-y-3">
                <div className="h-32 w-full flex items-end gap-1">
                  {[30, 45, 60, 80, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-[#00e676]/20 border-t-2 border-[#00e676] rounded-t-sm" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-[#a0a0a0]">
                  <span>Mai</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Set</span>
                </div>
              </div>
            ),
            followUp: "Economizando 23% a mais que em abril."
          };
      case 4:
        return {
          text: "Três lugares: delivery, compras online e apostas.",
          highlight: true,
          card: (
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] p-4 rounded-xl mt-3 space-y-3 text-xs">
              <div className="text-[10px] text-[#a0a0a0] font-bold">GASTOS ACIMA DO NORMAL</div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-red-500">R$ 842,90 (+R$180)</span>
              </div>
              <div className="flex justify-between">
                <span>Compras online</span>
                <span className="text-purple-400">R$ 731,20</span>
              </div>
              <div className="flex justify-between">
                <span>Apostas</span>
                <span className="text-orange-400">R$ 427,00</span>
              </div>
            </div>
          ),
          followUp: "Só esses três = 52% dos gastos. Teto de R$ 400 em delivery resolve R$ 440 extras por mês."
        };
      default:
        return { text: "Como posso ajudar?" };
    }
  };

  const renderAppScreen = (id: string) => {
    switch(id) {
        case 'balanco':
          return (
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] p-5 rounded-2xl w-full max-w-[280px] space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="text-[10px] text-[#a0a0a0]">Receitas</div>
                  <div className="text-[#00e676] font-bold text-sm">R$ 2.131,02</div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="text-[10px] text-[#a0a0a0]">Despesas</div>
                  <div className="text-red-500 font-bold text-sm">R$ 1.961,14</div>
                </div>
              </div>
              <div className="pt-2 border-t border-[#1a1a1a]">
                <div className="text-[10px] text-[#a0a0a0]">Saldo Atual</div>
                <div className="text-white font-bold text-lg">R$ 494,76</div>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] text-white/60">Previsto fim do mês: R$ 334,88</div>
                <div className="flex h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#00e676] w-[60%]" />
                    <div className="bg-red-500 w-[40%]" />
                </div>
              </div>
            </div>
          );
        case 'fatura':
            return (
              <div className="bg-[#0f0f0f] border border-[#1a1a1a] p-5 rounded-2xl w-full max-w-[280px] space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-white text-xs font-bold">Nubank PJ 3426</div>
                        <div className="text-[10px] text-[#00e676]">Aberta</div>
                    </div>
                </div>
                <div>
                    <div className="text-[10px] text-[#a0a0a0]">Fatura Junho</div>
                    <div className="text-white font-bold text-lg">R$ 631,57</div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px]">
                        <span className="text-[#a0a0a0]">Vence em 27 dias</span>
                        <span className="text-orange-400">Limite: 76%</span>
                    </div>
                    <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#00e676] to-orange-500 w-[76%]" />
                    </div>
                </div>
              </div>
            );
        case 'parcelas':
            return (
              <div className="bg-[#0f0f0f] border border-[#1a1a1a] p-5 rounded-2xl w-full max-w-[280px] space-y-4">
                <div className="space-y-1">
                    <div className="text-[10px] text-[#a0a0a0]">Comprometido p/ mês</div>
                    <div className="text-orange-400 font-bold text-lg">R$ 1.279,47</div>
                </div>
                <div className="space-y-1">
                    <div className="text-[10px] text-[#a0a0a0]">Total restante</div>
                    <div className="text-white text-sm">R$ 8.594,01</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['PS5 3/10', 'Notebook 5/12', 'Seguro 7/12', 'Sofá 4/18'].map((p) => (
                        <span key={p} className="px-2 py-1 bg-[#1a1a1a] rounded text-[9px] text-[#a0a0a0] border border-white/5">{p}</span>
                    ))}
                </div>
              </div>
            );
        default:
            return <div className="text-[#a0a0a0] text-xs">A Huby está carregando estes dados...</div>;
    }
  };

  return (
    <section className="py-40 px-5 flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] aspect-square bg-[#00e676]/5 blur-[150px] pointer-events-none rounded-full" />
      <div className="w-full max-w-5xl flex flex-col items-center relative z-10">
        
        {/* Carrossel de Perguntas */}
        <div className="w-full flex overflow-x-auto no-scrollbar gap-3 pb-8 justify-start md:justify-center">
          {QUESTIONS.map((q) => (
            <button
              key={q.id}
              onClick={() => handleQuestionClick(q)}
              className={`whitespace-nowrap px-5 py-3 rounded-full border transition-all duration-300 text-sm font-medium ${
                activeQuestion === q.id 
                  ? "bg-[#00e676]/10 border-[#00e676] text-[#00e676]" 
                  : "bg-[#111] border-[#1a1a1a] text-[#777] hover:border-[#00e676]/30 hover:text-[#ccc]"
              }`}
            >
              {q.text}
            </button>
          ))}
        </div>

        {/* Esfera */}
        <div className="relative mb-12">
            <ParticleSphere state={status} />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 whitespace-nowrap">
                <div className={`w-2 h-2 rounded-full ${status === 'responding' ? 'bg-[#00e676] animate-pulse' : 'bg-[#777]'}`} />
                <span className="text-[10px] font-bold text-[#a0a0a0] uppercase tracking-widest">
                    {status === 'responding' ? 'Huby está analisando...' : 'Huby online'}
                </span>
            </div>
        </div>

        {/* Chat Area */}
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
                        <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
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
                            
                            <div className={`p-4 max-w-[85%] ${
                                msg.role === 'user' 
                                    ? "bg-[#1a1a1a] rounded-[18px_18px_4px_18px] text-white" 
                                    : "bg-[#00e676]/8 rounded-[4px_18px_18px_18px] text-white border border-[#00e676]/10"
                            }`}>
                                <p className="text-sm leading-relaxed">
                                    {msg.text}
                                </p>
                                {msg.card}
                                {msg.followUp && <p className="mt-4 text-sm text-[#a0a0a0]">{msg.followUp}</p>}
                            </div>
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="flex gap-1 p-2">
                            <div className="w-1.5 h-1.5 bg-[#00e676] rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-[#00e676] rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1.5 h-1.5 bg-[#00e676] rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>

        {/* Explore Tabs */}
        <div className="mt-20 md:mt-32 w-full text-center">
            <h3 className="text-[#a0a0a0] text-sm font-medium mb-8">Ou explore o que a Huby vê sobre você:</h3>
            <div className="flex overflow-x-auto no-scrollbar gap-3 pb-8 md:justify-center">
                {APP_SCREENS.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => {
                            setChatHistory([{ role: 'huby', text: `Aqui está seu resumo:`, card: renderAppScreen(s.id) }]);
                            setStatus('responding');
                            const element = document.getElementById('chat-anchor');
                            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            setTimeout(() => setStatus('idle'), 1000);
                        }}
                        className="whitespace-nowrap px-4 py-2 rounded-full border border-[#1a1a1a] bg-[#0a0a0a] text-[#a0a0a0] text-xs hover:border-[#00e676]/30 hover:text-white transition-all"
                    >
                        {s.label}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
};

export default HubySection;
