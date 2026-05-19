import React from "react";
import { ArrowRight, Search, Bell, MoveRight, CreditCard, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import { NEON, NEON_GLOW } from "./shared";
import heroWoman from "@/assets/hero-woman.jpeg";

const avatars = [
  "https://randomuser.me/api/portraits/women/12.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/45.jpg",
  "https://randomuser.me/api/portraits/men/52.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
];

export const Hero: React.FC<{ onCta: () => void }> = ({ onCta }) => {
  return (
    <section className="relative w-full overflow-hidden bg-[#0a0a0a]" style={{ paddingTop: "clamp(6rem, 10vw, 8rem)", paddingBottom: "clamp(4rem, 8vw, 6rem)" }}>
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full opacity-20 blur-[120px]"
          style={{ background: `radial-gradient(circle, ${NEON} 0%, transparent 70%)` }}
        />
        <div 
          className="absolute bottom-0 right-0 w-[50%] h-[50%] rounded-full opacity-10 blur-[100px]"
          style={{ background: `radial-gradient(circle, #a855f7 0%, transparent 70%)` }}
        />
        {/* Animated Grid Lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(${NEON} 1px, transparent 1px), linear-gradient(90deg, ${NEON} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative mx-auto w-full px-5 lg:px-10" style={{ maxWidth: "1320px" }}>
        <div className="flex flex-col items-center text-center max-w-[1000px] mx-auto z-10 relative">
          
          {/* Top Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full border mb-8 px-4 py-2 transition-transform hover:scale-105"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.1)" }}
          >
            <div className="flex -space-x-2 shrink-0">
              {avatars.map((src, i) => (
                <img key={i} src={src} alt="" className="rounded-full border-2 w-7 h-7 border-[#0a0a0a]" />
              ))}
            </div>
            <div className="h-4 w-px bg-white/10 mx-1" />
            <span className="text-white/90 text-xs font-bold tracking-tight">
              A escolha de <span style={{ color: NEON }}>+2.847</span> usuários inteligentes
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className="font-display font-black text-white tracking-tighter w-full mb-8 leading-[0.95]"
            style={{ fontSize: "clamp(2.8rem, 9vw, 6rem)" }}
          >
            O fim do <span className="text-white/30 italic">"não sei onde"</span><br />
            o meu <span style={{ color: NEON }}>dinheiro parou.</span>
          </h1>

          {/* Supporting Text */}
          <p
            className="text-white/60 w-full mb-10 max-w-[700px] font-medium"
            style={{ fontSize: "clamp(1.1rem, 1.4vw, 1.4rem)", lineHeight: 1.5 }}
          >
            Esqueça as planilhas chatas. O DinHub conecta suas contas, identifica gastos inúteis e te dá um plano real para sobrar dinheiro todo mês.
          </p>

          {/* Call to Action Group */}
          <div className="flex flex-col sm:flex-row gap-5 items-center justify-center w-full sm:w-auto">
            <button
              onClick={onCta}
              className="group relative inline-flex items-center justify-center gap-3 rounded-2xl font-black text-black transition-all hover:scale-[1.05] active:scale-[0.95] w-full sm:w-auto overflow-hidden"
              style={{
                background: NEON,
                padding: "1.2rem 2.8rem",
                fontSize: "1.1rem",
                boxShadow: `0 20px 50px ${NEON}33`,
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                COMEÇAR AGORA <ArrowRight size={22} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out" />
            </button>
            
            <div className="flex flex-col items-center sm:items-start gap-1">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-0.5">
                  {[1,2,3,4,5].map(s => <span key={s} className="text-[#f59e0b] text-sm leading-none">★</span>)}
                </div>
                <span className="text-white font-bold text-sm">4.9/5</span>
              </div>
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Baseado em reviews reais</span>
            </div>
          </div>
        </div>

        {/* Floating Dashboard Preview (Centralized Overlapping) */}
        <div className="mt-16 lg:mt-24 relative flex justify-center perspective-[2000px]">
          <div 
            className="relative w-full max-w-[900px] aspect-[16/9] rounded-3xl overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
            style={{ 
              background: "#111",
              transform: "rotateX(15deg)",
              transformStyle: "preserve-3d"
            }}
          >
            {/* Mock Dashboard UI */}
            <div className="absolute inset-0 p-4 lg:p-8 flex flex-col gap-6">
              <div className="flex justify-between items-center opacity-40">
                <div className="h-4 w-32 bg-white/10 rounded" />
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-white/5" />
                  <div className="h-8 w-8 rounded-full bg-white/5" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="h-32 rounded-2xl bg-white/[0.03] border border-white/5 p-5">
                  <div className="h-3 w-16 bg-white/10 rounded mb-3" />
                  <div className="h-6 w-24 bg-white/20 rounded" />
                </div>
                <div className="h-32 rounded-2xl bg-white/[0.03] border border-white/5 p-5">
                  <div className="h-3 w-16 bg-white/10 rounded mb-3" />
                  <div className="h-6 w-24 bg-white/20 rounded" />
                </div>
                <div className="h-32 rounded-2xl bg-white/[0.03] border border-white/5 p-5" style={{ borderColor: `${NEON}33`, background: `${NEON}05` }}>
                  <div className="h-3 w-16 bg-[#00e676]/30 rounded mb-3" />
                  <div className="h-6 w-24 bg-[#00e676]/40 rounded" />
                </div>
              </div>
              <div className="flex-1 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(90deg, transparent, ${NEON}, transparent)`, width: '200%', left: '-50%', animation: 'shimmer 3s infinite linear' }} />
              </div>
            </div>
            {/* Woman Overlay with Mask */}
            <img 
              src={heroWoman} 
              alt="Background" 
              className="absolute right-0 top-0 h-full w-auto object-cover mix-blend-overlay opacity-30" 
            />
          </div>

          {/* Floating Feature Cards around the Dashboard */}
          <div className="absolute -left-4 lg:-left-20 top-1/4 animate-bounce hidden sm:block" style={{ animationDuration: '4s' }}>
            <HeroCard icon={<Sparkles size={18} />} color={NEON} label="AI Insights" text="R$ 340 economizados hoje" />
          </div>
          <div className="absolute -right-4 lg:-right-12 bottom-1/4 animate-bounce hidden sm:block" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
            <HeroCard icon={<TrendingUp size={18} />} color="#a855f7" label="Projeção" text="Meta de férias 85% concluída" />
          </div>
        </div>

        {/* Triple Feature Bottom Row */}
        <div className="mt-12 lg:mt-0 grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12">
          <FeatureItem icon={<Search />} title="Auditoria Automática" desc="Cada transação é rastreada e classificada por nossa IA." />
          <FeatureItem icon={<Bell />} title="Alertas Preventivos" desc="Receba notificações antes que um gasto comprometa seu mês." />
          <FeatureItem icon={<ShieldCheck />} title="Segurança Bancária" desc="Criptografia de ponta a ponta com acesso somente leitura." />
        </div>
      </div>

      <style>{`
        @keyframes shimmer { from { transform: translateX(-50%); } to { transform: translateX(50%); } }
        @keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>
    </section>
  );
};

const HeroCard: React.FC<{ icon: React.ReactNode; color: string; label: string; text: string }> = ({ icon, color, label, text }) => (
  <div className="p-4 rounded-2xl bg-[#111] border border-white/10 shadow-2xl flex items-center gap-4 backdrop-blur-xl">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, color: color }}>
      {icon}
    </div>
    <div className="pr-4">
      <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{label}</p>
      <p className="text-white font-bold text-sm whitespace-nowrap">{text}</p>
    </div>
  </div>
);

const FeatureItem: React.FC<{ icon: React.ReactElement; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-4 p-6 rounded-3xl transition-colors hover:bg-white/[0.02]">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.03)", color: NEON, border: "1px solid rgba(255,255,255,0.08)" }}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <div>
      <h3 className="text-white font-black text-lg tracking-tight">{title}</h3>
      <p className="text-white/40 text-sm mt-2 leading-relaxed">{desc}</p>
    </div>
  </div>
);
