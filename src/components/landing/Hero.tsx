import React from "react";
import { ArrowRight, Play, Check } from "lucide-react";
import { NEON, Reveal, GreenBtn, OutlineBtn } from "./shared";
import heroWoman from "@/assets/hero-woman.jpeg";

export const Hero: React.FC<{ onCta: () => void }> = ({ onCta }) => {
  return (
    <section className="relative w-full overflow-hidden bg-[#0a0a0a] pt-28 pb-16 lg:pt-36 lg:pb-24">
      {/* Background with the woman asset - precisely positioned as requested earlier */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-full lg:w-[60%] opacity-40 lg:opacity-60">
           <img 
            src={heroWoman} 
            alt="" 
            className="w-full h-full object-cover object-center lg:object-right-top grayscale-[20%] mix-blend-lighten"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent lg:block hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>
        
        {/* Glow corner */}
        <div 
          className="absolute -top-[10%] -right-[5%] w-[50%] h-[50%] rounded-full opacity-20 blur-[120px]"
          style={{ background: `radial-gradient(circle, ${NEON} 0%, transparent 70%)` }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-w-0">
          
          {/* Left Column: Copy */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left max-w-full">
            <Reveal>
              {/* Avatar Badge */}
              <div className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-full pl-1 pr-4 py-1 mb-8 backdrop-blur-sm">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/100?u=${i}`}
                      alt=""
                      className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border-2 border-[#0a0a0a]"
                    />
                  ))}
                </div>
                <span className="font-bold tracking-tight text-[#00ff88]" style={{ fontSize: "clamp(0.78rem, 2.6vw, 0.9rem)" }}>
                  +2.847 pessoas assumindo o controle
                </span>
              </div>

              {/* Main Headline */}
              <h1 
                className="font-display font-extrabold text-white leading-[1.1] tracking-tight mb-6"
                style={{ 
                  fontSize: "clamp(2rem, 5vw, 4.4rem)",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  maxWidth: "100%"
                }}
              >
                Seu dinheiro some todo mês e você <span style={{ color: NEON }}>não sabe por quê.</span>
              </h1>

              {/* Supporting Text */}
              <p 
                className="text-[#a0a0a0] font-medium mb-10 max-w-[580px]"
                style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)", lineHeight: 1.5 }}
              >
                O DinHub analisa cada centavo, te avisa antes de virar problema e te mostra o que fazer. Em português, sem enrolação.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <GreenBtn onClick={onCta} className="px-8 py-4 text-base">
                  Descobrir para onde vai meu dinheiro <ArrowRight size={20} />
                </GreenBtn>
                <OutlineBtn onClick={onCta} className="px-8 py-4 text-base">
                  <Play size={18} fill="currentColor" /> Ver como funciona
                </OutlineBtn>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Transaction Cards (Desktop only or horizontal carousel on mobile) */}
          <div className="relative min-w-0 lg:h-[500px] flex items-center justify-center lg:justify-end overflow-visible">
             {/* Transaction Cards Wrapper */}
             <div className="flex lg:block gap-4 overflow-x-auto lg:overflow-visible pb-8 lg:pb-0 px-4 lg:px-0 w-full lg:w-auto scroll-smooth snap-x snap-mandatory no-scrollbar">
                <TransactionCard 
                  logo="iFood" 
                  logoBg="#ea1d2c" 
                  title="iFood" 
                  time="Hoje 13:42" 
                  value="-R$ 45,90" 
                  delay={0.1}
                  className="snap-center shrink-0 lg:absolute lg:top-0 lg:right-10"
                />
                <TransactionCard 
                  logo="Uber" 
                  logoBg="#000" 
                  title="Uber" 
                  time="Hoje 12:18" 
                  value="-R$ 28,40" 
                  delay={0.2}
                  className="snap-center shrink-0 lg:absolute lg:top-24 lg:-right-4"
                />
                <TransactionCard 
                  logo="ML" 
                  logoBg="#fff159" 
                  title="Mercado Livre" 
                  time="Hoje 10:37" 
                  value="-R$ 199,90" 
                  delay={0.3}
                  className="snap-center shrink-0 lg:absolute lg:top-48 lg:right-12"
                />
                <TransactionCard 
                  logo="N" 
                  logoBg="#e50914" 
                  title="Netflix" 
                  time="Ontem 21:34" 
                  value="-R$ 55,90" 
                  delay={0.4}
                  className="snap-center shrink-0 lg:absolute lg:top-72 lg:right-0"
                />
                <TransactionCard 
                  logo="DinHub" 
                  logoBg={NEON} 
                  title="Fatura cartão" 
                  time="Ontem 18:20" 
                  value="-R$ 1.254,80" 
                  isHighlighted
                  delay={0.5}
                  className="snap-center shrink-0 lg:absolute lg:top-[360px] lg:right-16"
                />
             </div>
          </div>
        </div>

        {/* Hero Footer: Mini Cards */}
        <div className="mt-20 lg:mt-12 pt-12 border-t border-white/5 overflow-x-auto no-scrollbar">
          <div className="flex gap-4 lg:grid lg:grid-cols-3 lg:gap-8 min-w-max lg:min-w-0 pb-4 lg:pb-0">
             <MiniInfoCard 
                icon="🎯" 
                title="Meta de férias" 
                detail="R$ 2.350 / R$ 5.000" 
                progress={47} 
                className="w-[280px] lg:w-auto"
             />
             <MiniInfoCard 
                icon="🔔" 
                title="Alerta de gastos" 
                detail={<>Você já gastou <span style={{ color: NEON }}>90%</span> do limite com Lazer</>} 
                className="w-[280px] lg:w-auto"
             />
             <MiniInfoCard 
                icon="🛡️" 
                title="Radar de risco" 
                detail={<>Detectamos aumento de gastos em <span style={{ color: NEON }}>Delivery</span></>} 
                className="w-[280px] lg:w-auto"
             />
          </div>
        </div>
      </div>
    </section>
  );
};

const TransactionCard: React.FC<{ 
  logo: string; 
  logoBg: string; 
  title: string; 
  time: string; 
  value: string; 
  isHighlighted?: boolean;
  delay?: number;
  className?: string;
}> = ({ logo, logoBg, title, time, value, isHighlighted, delay = 0, className = "" }) => (
  <Reveal delay={delay} className={`${className}`}>
    <div 
      className={`flex items-center gap-4 bg-[#111] p-4 rounded-2xl border ${isHighlighted ? 'border-[#00e676]/40 shadow-[0_0_25px_rgba(0,230,118,0.15)]' : 'border-[#1a1a1a]'} w-[260px]`}
    >
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0" 
        style={{ background: logoBg, fontSize: logo.length > 2 ? '10px' : '14px' }}
      >
        {logo}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-bold text-sm truncate">{title}</h4>
        <p className="text-white/40 text-[11px]">{time}</p>
      </div>
      <div className="text-white font-bold text-sm shrink-0">{value}</div>
    </div>
  </Reveal>
);

const MiniInfoCard: React.FC<{ icon: string; title: string; detail: React.ReactNode; progress?: number; className?: string }> = ({ 
  icon, title, detail, progress, className = "" 
}) => (
  <div className={`bg-white/[0.03] border border-white/5 rounded-2xl p-5 ${className}`}>
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xl">{icon}</span>
      <h5 className="text-white font-bold text-sm uppercase tracking-wider opacity-60">{title}</h5>
    </div>
    <p className="text-white font-medium text-sm lg:text-base mb-3">{detail}</p>
    {progress !== undefined && (
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000" 
          style={{ background: NEON, width: `${progress}%` }} 
        />
      </div>
    )}
  </div>
);
