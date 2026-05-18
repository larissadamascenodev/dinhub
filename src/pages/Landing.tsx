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
import heroWoman from "@/assets/hero-woman.jpeg";
import hubyBot from "@/assets/huby-bot.jpeg";

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

      {/* ===== 5. INVOICES IN REAL TIME ===== */}
      <section className="relative py-32 px-6 lg:px-12 overflow-hidden">
        <div className="max-w-[1400px] mx-auto text-center mb-16">
          <Pill tone="green" icon={<Wallet size={12}/>}>Acompanhamento em tempo real</Pill>
          <h2 className="mt-5 text-5xl lg:text-7xl font-black leading-[1.02] tracking-[-0.035em] max-w-4xl mx-auto">
            Suas faturas <span className="text-[#00ff7b]">sempre sob controle</span> em tempo real.
          </h2>
          <p className="mt-6 text-lg text-white/55 max-w-2xl mx-auto">
            Acompanhe gastos, limite e cobranças em tempo real. Zero surpresas, mais organização e tranquilidade.
          </p>
        </div>

        <div className="relative max-w-[1100px] mx-auto h-[640px]">
          {/* Phone center */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[320px] h-[640px]">
            <div className="absolute inset-0 bg-[#00ff7b]/15 blur-[100px] rounded-full" />
            <div className="relative w-full h-full rounded-[44px] border border-white/15 bg-[#0a0d10] p-3 shadow-[0_40px_100px_rgba(0,0,0,0.7)]">
              <div className="w-full h-full rounded-[36px] border border-white/[0.06] overflow-hidden bg-black flex flex-col p-5 gap-4 relative">
                <div className="flex justify-between items-center text-[11px] text-white/70">
                  <span className="font-bold">09:49</span>
                  <span>•••• 92%</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-[#00ff7b]/15 text-[#00ff7b] flex items-center justify-center"><TrendingUp size={14}/></div>
                    <span className="font-black text-sm">DinHub</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[10px]">4</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {["Mai","Jun","Jul"].map((m,i)=>(
                    <span key={m} className={`px-3 py-1 text-[11px] font-bold rounded-full ${i===1?"bg-[#00ff7b]/20 text-[#00ff7b] border border-[#00ff7b]/30":"text-white/40 border border-white/10"}`}>{m}</span>
                  ))}
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-xs font-bold">Nubank PJ</p>
                      <p className="text-[10px] text-white/40">•••• 3426</p>
                    </div>
                    <span className="text-[10px] text-[#00ff7b] font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00ff7b]"/>Aberta</span>
                  </div>
                  <p className="text-center text-[10px] font-bold text-white/40 uppercase tracking-widest">Fatura de Junho</p>
                  <p className="text-center text-2xl font-black my-2 tabular-nums">R$ 631,57</p>
                  <p className="text-center text-[10px] text-white/40">Vence em 27 dias</p>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1.5"><span className="text-white/50">LIMITE</span><span className="text-[#00ff7b] font-bold">76% utilizado</span></div>
                  <div className="h-1.5 rounded-full bg-white/5"><div className="h-full w-[76%] rounded-full bg-[#00ff7b]"/></div>
                </div>
                <button className="mt-auto h-11 rounded-xl bg-[#00ff7b]/15 text-[#00ff7b] text-xs font-black border border-[#00ff7b]/20">Pagar Fatura · R$ 631,57</button>
              </div>
            </div>
          </div>

          {/* Floating cards around */}
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="absolute top-12 left-0 lg:left-8 w-[260px]">
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-2"><Wallet size={14} className="text-[#00ff7b]"/><span className="text-xs font-bold">Fatura fechada</span></div>
              <p className="text-[10px] text-white/40">Nubank PJ •••• 3426</p>
              <p className="text-xl font-black mt-2 tabular-nums">R$ 631,57</p>
              <p className="text-[10px] text-white/40 mt-1">Vence em 27 dias</p>
            </GlassCard>
          </motion.div>

          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="absolute top-[35%] left-0 lg:left-2 w-[260px]">
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-2"><span className="w-2 h-2 rounded-full bg-[#00ff7b]"/><span className="text-[10px] font-black uppercase tracking-wider text-white/60">Limite utilizado</span></div>
              <p className="text-2xl font-black tabular-nums">76%</p>
              <div className="h-1.5 rounded-full bg-white/5 mt-2"><div className="h-full w-[76%] rounded-full bg-[#00ff7b]"/></div>
              <p className="text-[10px] text-white/40 mt-2 tabular-nums">R$ 4.113,61 de R$ 5.380,63</p>
            </GlassCard>
          </motion.div>

          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="absolute top-12 right-0 lg:right-4 w-[280px]">
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-3"><CreditCard size={14} className="text-[#00ff7b]"/><span className="text-xs font-bold">Parcelamentos Ativos</span><span className="ml-auto text-[10px] text-white/40">7 itens</span></div>
              {[
                {n:"PlayStation 5",v:"R$ 337,67",p:"3 de 10",c:"#a78bfa",i:<Gamepad2 size={12}/>},
                {n:"iPhone 14",v:"R$ 289,90",p:"5 de 12",c:"#3b82f6",i:<Smartphone size={12}/>},
                {n:"Sofá retrátil",v:"R$ 237,45",p:"4 de 18",c:"#00ff7b",i:<Sofa size={12}/>},
              ].map((x,i)=>(
                <div key={i} className="flex items-center gap-2 py-1.5 border-t border-white/5 first:border-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:`${x.c}1a`,color:x.c}}>{x.i}</div>
                  <div className="flex-1"><p className="text-[11px] font-bold">{x.n}</p><p className="text-[9px] text-white/40">{x.p} parcelas</p></div>
                  <p className="text-[11px] font-black tabular-nums">{x.v}</p>
                </div>
              ))}
            </GlassCard>
          </motion.div>

          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="absolute bottom-4 right-0 lg:right-12 w-[240px]">
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-2"><Bell size={14} className="text-orange-400"/><span className="text-xs font-bold">Alerta inteligente</span></div>
              <p className="text-xs text-white/60 leading-relaxed">Você gastou <span className="text-[#00ff7b] font-bold">90% do limite</span> em <span className="text-[#00ff7b] font-bold">Delivery</span> este mês.</p>
            </GlassCard>
          </motion.div>
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
              A Huby transforma dados em clareza. Faça perguntas sobre seu dinheiro, receba respostas práticas e descubra o que realmente importa.
            </p>

            <div className="relative mt-10">
              <img src={hubyBot} alt="Huby - assistente IA" className="w-64 h-64 object-contain mx-auto lg:mx-0" />
            </div>
          </div>

          <div className="space-y-4">
            {[
              { icon:<TrendingUp size={18}/>, c:"#00ff7b", t:"Você gastou ", b:"18% a mais com delivery", t2:" do que no mês passado.", tag:"Alimentação" },
              { icon:<Bell size={18}/>, c:"#f59e0b", t:"", b:"3 assinaturas somam R$ 79,90/mês", t2:" e quase não são usadas.", tag:"Assinaturas" },
              { icon:<BarChart3 size={18}/>, c:"#a78bfa", t:"Se investir R$ 300/mês, pode acumular ", b:"R$ 31.723,41 em 5 anos.", t2:"", tag:"Investimentos" },
              { icon:<Car size={18}/>, c:"#3b82f6", t:"Seus gastos com ", b:"Uber aumentaram 38%", t2:" este mês.", tag:"Transporte" },
            ].map((card, i) => (
              <motion.div key={i} initial={{opacity:0,x:20}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.08}}>
                <GlassCard className="p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{background:`${card.c}1a`,color:card.c}}>{card.icon}</div>
                  <p className="text-sm text-white/80 leading-relaxed flex-1">
                    {card.t}<span className="text-[#00ff7b] font-bold">{card.b}</span>{card.t2}
                  </p>
                  <span className="text-[10px] font-bold text-white/50 px-3 py-1 rounded-full bg-white/5 border border-white/10 shrink-0">{card.tag}</span>
                </GlassCard>
              </motion.div>
            ))}
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
