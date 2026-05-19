import React from "react";
import { ArrowRight, Search, Bell, ShieldCheck, Star } from "lucide-react";
import { NEON } from "./shared";
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
    <section className="relative w-full overflow-hidden bg-[#0a0a0a]" style={{ paddingTop: "clamp(5rem, 8vw, 7rem)", paddingBottom: "clamp(3rem, 6vw, 5rem)" }}>
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-[10%] -left-[5%] w-[60%] h-[60%] rounded-full opacity-20 blur-[100px]"
          style={{ background: `radial-gradient(circle, ${NEON} 0%, transparent 70%)` }}
        />
        <div 
          className="absolute bottom-0 right-0 w-[40%] h-[40%] rounded-full opacity-10 blur-[80px]"
          style={{ background: `radial-gradient(circle, #a855f7 0%, transparent 70%)` }}
        />
        {/* Animated Grid Lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(${NEON} 1px, transparent 1px), linear-gradient(90deg, ${NEON} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative mx-auto w-full px-5 lg:px-10" style={{ maxWidth: "1320px" }}>
        <div className="flex flex-col items-center text-center max-w-[950px] mx-auto z-10 relative">
          
          {/* Top Badge - Reduced size on mobile */}
          <div
            className="inline-flex items-center gap-2 rounded-full border mb-6 px-3 py-1 lg:px-4 lg:py-2 transition-transform hover:scale-105"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.1)" }}
          >
            <div className="flex -space-x-1.5 shrink-0">
              {avatars.map((src, i) => (
                <img key={i} src={src} alt="" className="rounded-full border w-5 h-5 lg:w-7 lg:h-7 border-[#0a0a0a]" />
              ))}
            </div>
            <div className="h-3 w-px bg-white/10 mx-0.5 lg:mx-1" />
            <span className="text-white/80 text-[10px] lg:text-xs font-bold tracking-tight">
              <span style={{ color: NEON }}>+2.847</span> usuários no controle
            </span>
          </div>

          {/* Main Headline - Adjusted font sizes */}
          <h1
            className="font-display font-black text-white tracking-tight w-full mb-5 lg:mb-8 leading-[1.0]"
            style={{ fontSize: "clamp(1.8rem, 8vw, 5.5rem)" }}
          >
            O fim do <span className="text-white/30 italic">"não sei onde"</span><br />
            o meu <span style={{ color: NEON }}>dinheiro parou.</span>
          </h1>

          {/* Supporting Text - Adjusted font sizes */}
          <p
            className="text-white/60 w-full mb-8 lg:mb-10 max-w-[650px] font-medium"
            style={{ fontSize: "clamp(0.95rem, 1.2vw, 1.3rem)", lineHeight: 1.4 }}
          >
            Esqueça as planilhas. O DinHub conecta suas contas e revela exatamente onde você está desperdiçando seu dinheiro todo mês.
          </p>

          {/* Call to Action Group */}
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 items-center justify-center w-full sm:w-auto mb-12 lg:mb-20">
            <button
              onClick={onCta}
              className="group relative inline-flex items-center justify-center gap-3 rounded-2xl font-black text-black transition-all hover:scale-[1.05] active:scale-[0.95] w-full sm:w-auto overflow-hidden"
              style={{
                background: NEON,
                padding: "clamp(0.9rem, 1.3vw, 1.1rem) clamp(1.8rem, 2.5vw, 2.8rem)",
                fontSize: "clamp(0.9rem, 1.1vw, 1.1rem)",
                boxShadow: `0 15px 40px ${NEON}33`,
              }}
            >
              <span className="relative z-10 flex items-center gap-2 uppercase tracking-tight">
                COMEÇAR AGORA <ArrowRight size={20} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out" />
            </button>
            
            <div className="flex items-center gap-3 lg:gap-4 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-1.5">
                <Star size={14} className="fill-[#f59e0b] text-[#f59e0b]" />
                <span className="text-white font-bold text-xs lg:text-sm">4.9/5</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <span className="text-white/40 text-[9px] lg:text-[10px] uppercase font-bold tracking-widest">Nota na Store</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview - Simplified for visual clarity */}
        <div className="relative flex justify-center perspective-[2000px] mb-12 lg:mb-0">
          <div 
            className="relative w-full max-w-[850px] aspect-[16/10] lg:aspect-[16/9] rounded-2xl lg:rounded-3xl overflow-hidden border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
            style={{ 
              background: "#0d0d0d",
              transform: "rotateX(12deg)",
              transformStyle: "preserve-3d"
            }}
          >
            {/* Woman Background - More integrated */}
            <img 
              src={heroWoman} 
              alt="" 
              className="absolute right-0 top-0 h-full w-auto object-cover opacity-20 lg:opacity-30" 
              style={{ 
                maskImage: "linear-gradient(to left, black, transparent)",
                WebkitMaskImage: "linear-gradient(to left, black, transparent)"
              }}
            />
            
            <div className="absolute inset-0 p-6 lg:p-10 flex flex-col gap-5 lg:gap-8">
              <div className="flex justify-between items-center opacity-30">
                <div className="h-3 w-24 bg-white/20 rounded-full" />
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-white/10" />
                  <div className="h-6 w-6 rounded-full bg-white/10" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
                <div className="h-24 lg:h-32 rounded-xl bg-white/[0.03] border border-white/5 p-4">
                  <div className="h-2 w-12 bg-white/10 rounded mb-3" />
                  <div className="h-4 w-20 bg-white/20 rounded" />
                </div>
                <div className="h-24 lg:h-32 rounded-xl bg-white/[0.03] border border-white/5 p-4">
                  <div className="h-2 w-12 bg-white/10 rounded mb-3" />
                  <div className="h-4 w-20 bg-white/20 rounded" />
                </div>
                <div className="hidden lg:block h-32 rounded-xl bg-[#00e676]/5 border border-[#00e676]/20 p-4">
                  <div className="h-2 w-12 bg-[#00e676]/20 rounded mb-3" />
                  <div className="h-4 w-20 bg-[#00e676]/30 rounded" />
                </div>
              </div>

              <div className="flex-1 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(90deg, transparent, ${NEON}, transparent)`, width: '200%', left: '-50%', animation: 'shimmer 4s infinite linear' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Bottom Row - Horizontal on Mobile */}
        <div className="flex flex-row overflow-x-auto lg:overflow-visible gap-4 lg:gap-8 pb-4 lg:pb-0 px-2 lg:px-0 -mx-5 lg:mx-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory lg:grid lg:grid-cols-3">
          <FeatureItem icon={<Search />} title="Auditoria IA" desc="Cada gasto é rastreado." />
          <FeatureItem icon={<Bell />} title="Alertas" desc="Evite desperdícios." />
          <FeatureItem icon={<ShieldCheck />} title="Segurança" desc="Dados criptografados." />
        </div>
      </div>

      <style>{`
        @keyframes shimmer { from { transform: translateX(-50%); } to { transform: translateX(50%); } }
      `}</style>
    </section>
  );
};

const FeatureItem: React.FC<{ icon: React.ReactElement; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex items-center gap-3 p-4 lg:p-6 rounded-2xl bg-white/[0.02] border border-white/5 min-w-[200px] lg:min-w-0 snap-center transition-colors hover:bg-white/[0.04]">
    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.03)", color: NEON, border: "1px solid rgba(255,255,255,0.08)" }}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div className="min-w-0">
      <h3 className="text-white font-bold text-sm lg:text-base leading-tight truncate">{title}</h3>
      <p className="text-white/40 text-[11px] lg:text-sm mt-0.5 leading-snug truncate">{desc}</p>
    </div>
  </div>
);
