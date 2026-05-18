import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, TrendingUp, ShoppingBag, Car, Tv, Dices, UtensilsCrossed,
  Gamepad2, Laptop, Sofa, Plane, Smartphone, Bell, Shield, Sparkles,
  Lock, Play, CreditCard, Wallet, Zap, CheckCircle2, Brain, BarChart3,
} from "lucide-react";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import heroWoman from "@/assets/hero-woman.jpeg";
import hubyBot from "@/assets/huby-character.png";


const NEON = "#00ff7b";

// ============ ATOMS ============
const Pill: React.FC<{ icon?: React.ReactNode; children: React.ReactNode; tone?: "green" | "orange" | "default" }> = ({ icon, children, tone = "default" }) => {
  const colors = {
    green: "border-[#00ff7b]/20 bg-[#00ff7b]/[0.06] text-[#00ff7b]",
    orange: "border-orange-500/20 bg-orange-500/[0.06] text-orange-400",
    default: "border-white/10 bg-white/[0.04] text-white/70",
  }[tone];
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${colors} text-[11px] font-bold uppercase tracking-[0.18em]`}>
      {icon}
      <span>{children}</span>
    </div>
  );
};

const GlassCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = "", children, ...rest }) => (
  <div
    className={`relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] ${className}`}
    {...rest}
  >
    {children}
  </div>
);

const FloatingTxn: React.FC<{ name: string; time: string; value: string; logo: React.ReactNode; logoBg: string }> = ({ name, time, value, logo, logoBg }) => (
  <GlassCard className="px-4 py-3 flex items-center gap-3 min-w-[230px]">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${logoBg}`}>{logo}</div>
    <div className="flex-1">
      <p className="text-sm font-bold text-white leading-tight">{name}</p>
      <p className="text-[11px] text-white/40 mt-0.5">{time}</p>
    </div>
    <p className="text-sm font-black text-red-400 tabular-nums">{value}</p>
  </GlassCard>
);

// ============ LANDING ============
const Landing: React.FC = () => {
  const [authOpen, setAuthOpen] = React.useState(false);
  const [authView, setAuthView] = React.useState<"login" | "signup">("signup");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedInsight, setSelectedInsight] = React.useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  const insights = [
    { 
      id: 0,
      question: "Quanto gastei com delivery este mês?",
      icon:<UtensilsCrossed size={18}/>, 
      c:"#00ff7b", 
      t:"Você gastou ", 
      b:"R$ 842,90 em delivery", 
      t2:" este mês, o que representa 18% a mais que no mês anterior.", 
      tag:"Alimentação",
      voiceText: "Senhor, identifiquei um aumento de 18% nos seus gastos com delivery este mês. O total acumulado é de 842 reais e 90 centavos. Recomendo cautela com os próximos pedidos."
    },
    { 
      id: 1,
      question: "Quantos parcelamentos ainda tenho?",
      icon:<CreditCard size={18}/>, 
      c:"#f59e0b", 
      t:"Você possui ", 
      b:"18 parcelamentos ativos", 
      t2:", com um comprometimento mensal de R$ 1.279,47.", 
      tag:"Parcelamentos",
      voiceText: "Atualmente, senhor, existem 18 parcelamentos ativos em seu nome. O valor mensal comprometido é de 1.279 reais. O próximo item a ser quitado será o PlayStation 5 em 7 meses."
    },
    { 
      id: 2,
      question: "Quanto vai sobrar este mês?",
      icon:<Wallet size={18}/>, 
      c:"#a78bfa", 
      t:"Baseado na sua média, deve sobrar ", 
      b:"R$ 1.150,00", 
      t2:" após todas as contas fixas e variáveis previstas.", 
      tag:"Previsão",
      voiceText: "De acordo com meus cálculos, senhor, a projeção de sobra para este mês é de aproximadamente 1.150 reais, já considerando todas as suas despesas recorrentes e parcelas."
    },
    { 
      id: 3,
      question: "Qual gasto mais cresceu este mês?",
      icon:<TrendingUp size={18}/>, 
      c:"#ef4444", 
      t:"Seus gastos com ", 
      b:"Apostas/Lazer subiram 45%", 
      t2:" nos últimos 30 dias.", 
      tag:"Alerta",
      voiceText: "Senhor, detectei um comportamento atípico. Seus gastos com apostas e lazer subiram 45% nos últimos 30 dias. Seria prudente revisar esses limites para manter a saúde do seu caixa."
    },
  ];

  const [audio, setAudio] = React.useState<HTMLAudioElement | null>(null);
  const [audioLevel, setAudioLevel] = React.useState(0);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const sourceMapRef = React.useRef<WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>>(new WeakMap());

  const stopLevelLoop = React.useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setAudioLevel(0);
  }, []);

  const startLevelLoop = React.useCallback((mediaEl: HTMLAudioElement) => {
    try {
      if (!audioCtxRef.current) {
        const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
        audioCtxRef.current = new Ctx();
      }
      const ctx = audioCtxRef.current!;
      if (ctx.state === "suspended") ctx.resume();

      let source = sourceMapRef.current.get(mediaEl);
      if (!source) {
        source = ctx.createMediaElementSource(mediaEl);
        sourceMapRef.current.set(mediaEl, source);
      }
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.75;
      source.disconnect();
      source.connect(analyser);
      analyser.connect(ctx.destination);

      const data = new Uint8Array(analyser.fftSize);
      let smoothed = 0;
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sumSq = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sumSq += v * v;
        }
        const rms = Math.sqrt(sumSq / data.length);
        const boosted = Math.min(1, rms * 2.6);
        smoothed = smoothed * 0.6 + boosted * 0.4;
        setAudioLevel(smoothed);
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      console.warn("Audio analyser unavailable", e);
    }
  }, []);

  const speakInsight = async (text: string) => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    window.speechSynthesis.cancel();
    stopLevelLoop();

    setIsSpeaking(true);

    try {
      const { data, error } = await supabase.functions.invoke("elevenlabs-tts", {
        body: { text },
      });

      if (error || !data) throw new Error("TTS function failed");

      const audioUrl = URL.createObjectURL(data);
      const newAudio = new Audio(audioUrl);
      newAudio.crossOrigin = "anonymous";
      setAudio(newAudio);
      newAudio.onended = () => { setIsSpeaking(false); stopLevelLoop(); };
      newAudio.onpause = () => stopLevelLoop();
      await newAudio.play();
      startLevelLoop(newAudio);
    } catch (e) {
      console.error("TTS Error, falling back to browser speech:", e);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.onend = () => { setIsSpeaking(false); stopLevelLoop(); };
      const startedAt = performance.now();
      const fakeTick = () => {
        const t = (performance.now() - startedAt) / 1000;
        const v = 0.35 + 0.4 * Math.abs(Math.sin(t * 6)) + 0.15 * Math.sin(t * 11);
        setAudioLevel(Math.max(0, Math.min(1, v)));
        rafRef.current = requestAnimationFrame(fakeTick);
      };
      fakeTick();
      window.speechSynthesis.speak(utterance);
    }
  };

  React.useEffect(() => () => { stopLevelLoop(); audioCtxRef.current?.close(); }, [stopLevelLoop]);


  const handleInsightClick = (id: number) => {
    if (selectedInsight === id) {
      setSelectedInsight(null);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    setSelectedInsight(id);
    speakInsight(insights[id].voiceText);
  };



  const openAuth = (v: "login" | "signup") => { setAuthView(v); setAuthOpen(true); };
  const goCta = () => user ? navigate("/dashboard") : openAuth("signup");

  return (
    <div className="min-h-screen bg-[#06080a] text-white selection:bg-[#00ff7b]/30 overflow-x-hidden antialiased">
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} defaultView={authView} />

      {/* Ambient global glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#00ff7b]/[0.08] blur-[180px] rounded-full" />
        <div className="absolute top-[40%] right-0 w-[500px] h-[500px] bg-[#00ff7b]/[0.04] blur-[180px] rounded-full" />
      </div>
      <div className="fixed inset-0 pointer-events-none opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:60px_60px]" />

      {/* ===== NAVBAR ===== */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[1280px]">
        <nav className="flex items-center justify-between px-6 py-3 rounded-full bg-black/40 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ff7b] to-[#00cc62] flex items-center justify-center">
              <TrendingUp size={18} className="text-black" strokeWidth={3} />
            </div>
            <span className="text-xl font-black tracking-tight">Din<span className="text-[#00ff7b]">Hub</span></span>
          </div>
          <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full bg-white/[0.03] border border-white/[0.05]">
            {["Funcionalidades", "Como Funciona", "Preços"].map((i) => (
              <a key={i} href="#" className="px-4 py-1.5 text-sm font-semibold text-white/60 hover:text-[#00ff7b] hover:bg-white/[0.04] rounded-full transition-all">{i}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => openAuth("login")} className="px-4 py-2 text-sm font-bold text-white/70 hover:text-white transition-colors hidden sm:block">Entrar</button>
            <button onClick={() => openAuth("signup")} className="px-5 py-2.5 rounded-full bg-[#00ff7b] text-black font-black text-sm shadow-[0_4px_20px_rgba(0,255,123,0.35)] hover:shadow-[0_8px_30px_rgba(0,255,123,0.55)] hover:scale-[1.03] transition-all">
              Começar grátis
            </button>
          </div>
        </nav>
      </header>

      {/* ===== 1. HERO ===== */}
      <section className="relative pt-32 pb-24 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-center">
          {/* LEFT: copy */}
          <div className="relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-7 inline-flex items-center gap-3 pl-1 pr-4 py-1 rounded-full border border-[#00ff7b]/20 bg-[#00ff7b]/[0.05]">
              <div className="flex -space-x-2">
                {["J","A","C","M","R"].map((l, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full border-2 border-[#06080a] flex items-center justify-center text-[10px] font-black text-white`} style={{ background: ["#7c3aed","#0ea5e9","#0d9488","#f59e0b","#dc2626"][i] }}>{l}</div>
                ))}
              </div>
              <span className="text-xs font-bold text-[#00ff7b]">+2.847 pessoas assumindo o controle</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
              className="text-[44px] sm:text-6xl lg:text-[72px] font-black leading-[1.02] tracking-[-0.035em]"
            >
              Seu dinheiro some<br/>
              todo mês e você <span className="text-[#00ff7b]">não</span><br/>
              <span className="text-[#00ff7b]">sabe por quê.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-7 text-lg text-white/55 max-w-[520px] leading-relaxed">
              O DinHub identifica gastos invisíveis, organiza sua vida financeira e te avisa antes do problema acontecer.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-10 flex flex-wrap gap-4 items-center">
              <button onClick={goCta} className="group h-14 px-7 rounded-full bg-[#00ff7b] text-black font-black text-base inline-flex items-center gap-2 shadow-[0_10px_40px_rgba(0,255,123,0.35)] hover:shadow-[0_15px_50px_rgba(0,255,123,0.55)] hover:scale-[1.02] transition-all">
                Começar agora <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="h-14 px-6 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md text-white font-bold text-sm inline-flex items-center gap-2 hover:bg-white/[0.06]">
                <Play size={14} className="fill-white" /> Ver como funciona
              </button>
            </motion.div>

            {/* mini features strip */}
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-[560px]">
              {[
                { icon: <BarChart3 size={16} />, t: "Meta de férias", s: "47%" },
                { icon: <Bell size={16} />, t: "Alerta de gastos", s: "90% do limite" },
                { icon: <Shield size={16} />, t: "Radar de risco", s: "Delivery ↑" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#00ff7b]/10 text-[#00ff7b] flex items-center justify-center shrink-0">{f.icon}</div>
                  <div>
                    <p className="text-[11px] font-bold text-white">{f.t}</p>
                    <p className="text-[11px] text-white/40">{f.s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: woman image + floating transactions */}
          <div className="relative h-[560px] lg:h-[680px]">
            {/* radial glow behind */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,#00ff7b22,transparent_60%)]" />
            <div className="absolute inset-0 rounded-[40px] overflow-hidden">
              <img src={heroWoman} alt="Pessoa olhando o celular preocupada com finanças" className="w-full h-full object-cover object-center opacity-80 [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_85%)]" />
            </div>

            {/* Floating transactions */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="absolute top-6 right-0 lg:-right-6">
              <FloatingTxn name="iFood" time="Hoje, 13:42" value="- R$ 45,90" logoBg="bg-red-500" logo={<UtensilsCrossed size={18} className="text-white"/>} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.65 }} className="absolute top-[24%] right-2 lg:-right-2">
              <FloatingTxn name="Uber" time="Hoje, 12:18" value="- R$ 28,40" logoBg="bg-white" logo={<Car size={18} className="text-black"/>} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="absolute top-[44%] right-0 lg:-right-8">
              <FloatingTxn name="Mercado Livre" time="Hoje, 10:37" value="- R$ 199,90" logoBg="bg-yellow-400" logo={<ShoppingBag size={18} className="text-black"/>} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.95 }} className="absolute top-[64%] right-2 lg:-right-2">
              <FloatingTxn name="Netflix" time="Ontem, 21:34" value="- R$ 55,90" logoBg="bg-red-600" logo={<Tv size={18} className="text-white"/>} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 }} className="absolute bottom-2 right-0 lg:-right-6">
              <FloatingTxn name="Fatura cartão" time="Ontem, 18:20" value="- R$ 1.254,80" logoBg="bg-[#00ff7b]/20" logo={<CreditCard size={18} className="text-[#00ff7b]"/>} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== 2. SOCIAL PROOF ===== */}
      <section className="relative py-16 px-6 border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center gap-5">
          <div className="flex -space-x-3">
            {[
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&h=80&fit=crop&crop=face",
            ].map((src, i) => (
              <img key={i} src={src} alt="" className="w-12 h-12 rounded-full border-2 border-[#06080a] object-cover shadow-[0_0_20px_rgba(0,255,123,0.15)]" />
            ))}
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black tracking-tight">+2.847 pessoas retomando o controle financeiro</p>
            <p className="text-sm text-[#00ff7b] font-bold mt-2">Usuários economizam em média <span className="text-white">R$ 420/mês</span></p>
          </div>
        </div>
      </section>

      {/* ===== 3. CATEGORIES ===== */}
      <section className="relative py-28 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <Pill tone="green" icon={<BarChart3 size={12}/>}>Análise inteligente</Pill>
            <h2 className="mt-5 text-5xl lg:text-6xl font-black leading-[1.05] tracking-[-0.03em]">
              Entenda para onde<br/>
              <span className="text-[#00ff7b] relative inline-block">
                seu dinheiro está indo
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none"><path d="M2 8 Q150 -2 298 8" stroke="#00ff7b" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
            </h2>
            <p className="mt-6 text-lg text-white/55 leading-relaxed max-w-lg">
              O DinHub organiza automaticamente seus gastos e revela padrões invisíveis. Mais clareza, menos sustos no fim do mês.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-5 max-w-lg">
              {[
                { icon: <Brain size={18}/>, t: "Categorização automática", s: "Nossa IA identifica e organiza seus gastos sem esforço." },
                { icon: <BarChart3 size={18}/>, t: "Visão clara e completa", s: "Veja quanto cada categoria pesa no seu mês." },
                { icon: <Bell size={18}/>, t: "Alertas inteligentes", s: "Detectamos aumentos e padrões preocupantes." },
                { icon: <Zap size={18}/>, t: "Decisões melhores", s: "Informamos o que importa para você economizar." },
              ].map((f, i) => (
                <div key={i}>
                  <div className="w-10 h-10 rounded-xl bg-[#00ff7b]/10 text-[#00ff7b] flex items-center justify-center mb-3">{f.icon}</div>
                  <p className="font-bold text-sm">{f.t}</p>
                  <p className="text-xs text-white/45 mt-1 leading-relaxed">{f.s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard mock */}
          <GlassCard className="p-7 lg:p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/60">Gastos por categoria · <span className="text-white">Maio</span></p>
              <a className="text-xs font-bold text-[#00ff7b] flex items-center gap-1">Análise completa <ArrowRight size={12}/></a>
            </div>
            <p className="mt-3 text-4xl font-black tracking-tight">R$ 3.847,90</p>
            <div className="mt-4 flex gap-1.5 h-2">
              {[{c:"#00ff7b",w:36},{c:"#a78bfa",w:24},{c:"#3b82f6",w:18},{c:"#f59e0b",w:8},{c:"#ef4444",w:14}].map((b,i)=>(
                <div key={i} className="rounded-full" style={{background:b.c,width:`${b.w}%`}}/>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {[
                { icon: <UtensilsCrossed size={18}/>, color:"#00ff7b", name:"Delivery", value:"R$ 842,90", pct:"21,9%", w:75 },
                { icon: <ShoppingBag size={18}/>, color:"#a78bfa", name:"Compras online", value:"R$ 731,20", pct:"19,0%", w:65 },
                { icon: <Car size={18}/>, color:"#3b82f6", name:"Transporte", value:"R$ 518,40", pct:"13,5%", w:46 },
                { icon: <Tv size={18}/>, color:"#f59e0b", name:"Assinaturas", value:"R$ 184,70", pct:"4,8%", w:18 },
                { icon: <Dices size={18}/>, color:"#ef4444", name:"Apostas", value:"R$ 427,00", pct:"11,1%", w:38 },
              ].map((r,i)=>(
                <div key={i} className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background:`${r.color}1a`,color:r.color}}>{r.icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1.5">
                      <p className="text-sm font-bold">{r.name}</p>
                      <p className="text-sm font-bold tabular-nums">{r.value}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full" style={{background:r.color,width:`${r.w}%`}}/>
                      </div>
                      <span className="text-[11px] text-white/40 tabular-nums w-10 text-right">{r.pct}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00ff7b]/15 text-[#00ff7b] flex items-center justify-center shrink-0"><Sparkles size={18}/></div>
              <div className="flex-1">
                <p className="text-xs font-bold text-[#00ff7b]">Insight do mês</p>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">Você gastou <span className="text-[#00ff7b] font-bold">R$ 1.574,10</span> com hábitos que podem ser reduzidos. Isso representa <span className="text-[#00ff7b] font-bold">40,9%</span> do total.</p>
              </div>
              <ArrowRight size={14} className="text-white/30 mt-3"/>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ===== 4. INSTALLMENTS ===== */}
      <section className="relative py-28 px-6 lg:px-12 bg-gradient-to-b from-transparent via-black/40 to-transparent">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-14 items-center">
          {/* Dashboard left */}
          <GlassCard className="p-7 lg:p-8 order-2 lg:order-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center"><CreditCard size={18}/></div>
                <p className="text-lg font-bold">Parcelamentos Ativos</p>
              </div>
              <span className="text-[11px] font-bold text-white/50 px-3 py-1 rounded-full bg-white/5 border border-white/10">18 itens</span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <p className="text-xs text-white/50">Comprometido/mês</p>
                <p className="text-xl font-black text-orange-400 mt-1 tabular-nums">R$ 1.279,47</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <p className="text-xs text-white/50">Total restante</p>
                <p className="text-xl font-black mt-1 tabular-nums">R$ 8.594,01</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-[#00ff7b] font-bold flex items-center gap-2"><TrendingUp size={12}/> Livre em 11 meses (abr. de 2027)</p>

            <div className="mt-5 space-y-3.5">
              {[
                { icon: <Gamepad2 size={16}/>, color:"#a78bfa", name:"PlayStation 5", v:"R$ 337,67", p:"3/10", prog:30 },
                { icon: <Laptop size={16}/>, color:"#94a3b8", name:"Notebook Dell", v:"R$ 289,90", p:"5/12", prog:42 },
                { icon: <Smartphone size={16}/>, color:"#3b82f6", name:"iPhone 14", v:"R$ 289,90", p:"5/12", prog:42 },
                { icon: <Sofa size={16}/>, color:"#00ff7b", name:"Sofá retrátil", v:"R$ 237,45", p:"4/18", prog:22 },
                { icon: <Plane size={16}/>, color:"#ec4899", name:"Viagem p/ Nordeste", v:"R$ 255,55", p:"2/8", prog:25 },
              ].map((r,i)=>(
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{background:`${r.color}1a`,color:r.color}}>{r.icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1.5">
                      <p className="text-sm font-bold">{r.name}</p>
                      <p className="text-sm font-bold tabular-nums">{r.v}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full bg-[#00ff7b]" style={{width:`${r.prog}%`}}/>
                      </div>
                      <span className="text-[11px] text-white/40 tabular-nums w-8 text-right">{r.p}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 p-4 rounded-2xl border border-orange-500/15 bg-orange-500/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center"><Bell size={16}/></div>
                <div>
                  <p className="text-sm font-bold">Próximas cobranças</p>
                  <p className="text-[11px] text-white/40">3 cobranças nos próximos 7 dias</p>
                </div>
              </div>
              <p className="text-base font-black text-orange-400 tabular-nums">R$ 623,82</p>
            </div>
          </GlassCard>

          <div className="order-1 lg:order-2">
            <Pill tone="orange" icon={<CreditCard size={12}/>}>Acompanhamento de parcelamentos</Pill>
            <h2 className="mt-5 text-5xl lg:text-6xl font-black leading-[1.05] tracking-[-0.03em]">
              Suas parcelas também<br/>
              <span className="text-[#00ff7b]">consomem seu futuro.</span>
            </h2>
            <p className="mt-6 text-lg text-white/55 max-w-lg leading-relaxed">
              Acompanhe tudo em tempo real e descubra quanto da sua renda já está comprometida. Mais controle, menos surpresas.
            </p>
            <div className="mt-8 space-y-3 max-w-lg">
              {[
                "Visão completa de parcelas ativas e futuras",
                "Impacto real no seu orçamento mensal",
                "Acompanhamento de progresso em tempo real",
                "Alertas inteligentes antes de cada cobrança",
              ].map((t,i)=>(
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-[#00ff7b] shrink-0"/>
                  <p className="text-sm text-white/75">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ===== 6. AI INSIGHTS (HUBY) ===== */}
      <section className="relative py-28 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <Pill tone="green" icon={<Sparkles size={12}/>}>Huby · Sua assistente financeira</Pill>
            <h2 className="mt-5 text-5xl lg:text-6xl font-black leading-[1.05] tracking-[-0.03em]">
              Pergunte. Entenda.<br/>
              <span className="text-[#00ff7b]">E tome decisões melhores.</span>
            </h2>
            <p className="mt-6 text-lg text-white/55 max-w-lg leading-relaxed">
              A Huby transforma dados em clareza. Clique em uma das perguntas frequentes e ouça a análise personalizada da sua assistente.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
              {insights.map((insight) => (
                <button
                  key={insight.id}
                  onClick={() => handleInsightClick(insight.id)}
                  className={`px-4 py-3 rounded-2xl border text-left transition-all text-xs font-bold leading-tight flex items-center gap-3 ${
                    selectedInsight === insight.id
                      ? "bg-[#00ff7b]/20 border-[#00ff7b]/50 text-[#00ff7b]"
                      : "bg-white/[0.03] border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:border-white/20"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedInsight === insight.id ? "bg-[#00ff7b]/20 text-[#00ff7b]" : "bg-white/5 text-white/40"
                  }`}>
                    {insight.id === 0 && <UtensilsCrossed size={14} />}
                    {insight.id === 1 && <Bell size={14} />}
                    {insight.id === 2 && <BarChart3 size={14} />}
                    {insight.id === 3 && <Car size={14} />}
                  </div>
                  {insight.question}
                </button>
              ))}
            </div>

            {/* Orb was here, moved to the right column */}


          </div>

          <div className="relative min-h-[400px] flex items-center justify-center">
            {!selectedInsight ? (
              <div className="text-center space-y-4 opacity-40">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <Brain size={32} className="text-white" />
                </div>
                <p className="text-sm font-bold tracking-widest uppercase">Selecione uma pergunta acima</p>
                <p className="text-xs text-white/50 max-w-[280px] mx-auto">A Huby analisará seus dados em tempo real para te dar a melhor resposta.</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                key={selectedInsight}
                className="w-full"
              >
                <GlassCard className="p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    {insights[selectedInsight].icon}
                  </div>
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${insights[selectedInsight].c}1a`, color: insights[selectedInsight].c }}>
                      {insights[selectedInsight].icon}
                    </div>
                    <div>
                      <Pill tone="green">{insights[selectedInsight].tag}</Pill>
                      <h3 className="text-xl font-black mt-1">Análise Huby</h3>
                    </div>
                  </div>

                  <p className="text-lg text-white/90 leading-relaxed">
                    {insights[selectedInsight].t}
                    <span className="text-[#00ff7b] font-black underline decoration-[#00ff7b]/30 underline-offset-4">
                      {insights[selectedInsight].b}
                    </span>
                    {insights[selectedInsight].t2}
                  </p>

                  <div className="mt-8 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3 text-[#00ff7b]">
                      <Sparkles size={16} />
                      <span className="text-xs font-black uppercase tracking-widest">Insight Recomendado</span>
                    </div>
                    <p className="mt-3 text-sm text-white/50 leading-relaxed italic">
                      "{insights[selectedInsight].voiceText}"
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ===== 7. HOW IT WORKS ===== */}
      <section className="relative py-28 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <Pill tone="green">Como funciona</Pill>
            <h2 className="mt-5 text-5xl lg:text-6xl font-black tracking-[-0.03em]">Três passos. <span className="text-[#00ff7b]">Zero fricção.</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* connecting line */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-[#00ff7b]/30 to-transparent" />

            {[
              { n: "01", t: "Conecte suas contas", s: "Integração segura com seus bancos e cartões em segundos." },
              { n: "02", t: "O DinHub analisa seus hábitos", s: "Nossa IA categoriza tudo automaticamente e identifica padrões." },
              { n: "03", t: "Receba insights automáticos", s: "Alertas, sugestões e relatórios feitos para você economizar." },
            ].map((s,i)=>(
              <div key={i} className="relative text-center">
                <div className="relative inline-flex items-center justify-center w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-[#00ff7b]/10 blur-2xl" />
                  <div className="relative w-24 h-24 rounded-full border border-[#00ff7b]/30 bg-black flex items-center justify-center">
                    <span className="text-2xl font-black text-[#00ff7b]">{s.n}</span>
                  </div>
                </div>
                <h3 className="text-xl font-black tracking-tight">{s.t}</h3>
                <p className="mt-3 text-sm text-white/50 leading-relaxed max-w-xs mx-auto">{s.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 8. FINAL CTA ===== */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#00ff7b22,transparent_70%)] blur-2xl" />
          <div className="relative text-center">
            <h2 className="text-5xl lg:text-7xl font-black tracking-[-0.035em] leading-[1.02]">
              Pare de perder dinheiro<br/>
              <span className="text-[#00ff7b]">sem perceber.</span>
            </h2>
            <p className="mt-6 text-lg text-white/55 max-w-xl mx-auto">
              Descubra hoje o que está sabotando sua vida financeira.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button onClick={goCta} className="group h-16 px-9 rounded-full bg-[#00ff7b] text-black font-black text-base inline-flex items-center gap-2 shadow-[0_15px_50px_rgba(0,255,123,0.4)] hover:shadow-[0_20px_60px_rgba(0,255,123,0.6)] hover:scale-[1.03] transition-all">
                Quero entender meus gastos <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
              </button>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-white/40">
              <span className="flex items-center gap-2"><Lock size={12}/> Criptografia bancária</span>
              <span className="flex items-center gap-2"><Shield size={12}/> Dados 100% seguros</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={12}/> Sem cartão de crédito</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-10 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00ff7b] to-[#00cc62] flex items-center justify-center">
              <TrendingUp size={14} className="text-black" strokeWidth={3} />
            </div>
            <span className="text-base font-black">Din<span className="text-[#00ff7b]">Hub</span></span>
          </div>
          <p className="text-xs text-white/30">© 2026 DinHub · Controle Financeiro Inteligente</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
