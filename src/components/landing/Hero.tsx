import React from "react";
import { ArrowRight, Search, Bell, ShieldCheck, Star, Camera, Mic, Type } from "lucide-react";
import { NEON } from "./shared";
import heroWoman from "@/assets/hero-woman.jpeg";
import dashboardPhone from "@/assets/dashboard-phone.jpeg";

export const Hero: React.FC<{ onCta: () => void }> = ({ onCta }) => {
  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-[#0a0a0a] flex flex-col items-center pt-24 pb-16 lg:pt-32">
      {/* Background Elements - Inspired by Operafit */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[120%] h-[70%] rounded-[50%] opacity-20 blur-[120px]"
          style={{ background: `radial-gradient(circle, ${NEON} 0%, transparent 70%)` }}
        />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(${NEON} 1px, transparent 1px), linear-gradient(90deg, ${NEON} 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative z-10 w-full px-5 flex flex-col items-center text-center">
        {/* Top Feature Pill */}
        <div 
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 border border-white/10 bg-white/[0.03] backdrop-blur-sm"
          style={{ fontSize: "clamp(0.7rem, 0.9vw, 0.85rem)" }}
        >
          <span style={{ color: NEON }} className="font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e676] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e676]"></span>
            </span>
            IA que entende suas finanças
          </span>
        </div>

        {/* Main Headline */}
        <h1
          className="font-display font-black text-white tracking-tight w-full mb-6 leading-[1.0] max-w-[900px]"
          style={{ fontSize: "clamp(2.5rem, 8vw, 6.2rem)" }}
        >
          Seu dinheiro <span className="opacity-40 italic">no</span><br />
          <span style={{ color: NEON }}>piloto automático.</span>
        </h1>

        {/* Supporting Text */}
        <p
          className="text-white/60 w-full mb-10 max-w-[650px] font-medium"
          style={{ fontSize: "clamp(1rem, 1.2vw, 1.3rem)", lineHeight: 1.5 }}
        >
          Aponte a câmera. A IA calcula gastos e categoriza tudo em 3 segundos. Metas, faturas, grupos e medalhas — tudo num só app.
        </p>

        {/* CTA Group */}
        <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 items-center justify-center w-full sm:w-auto mb-12">
          <button
            onClick={onCta}
            className="group relative inline-flex items-center justify-center gap-3 rounded-full font-black text-black transition-all hover:scale-[1.05] active:scale-[0.95] w-full sm:w-auto overflow-hidden px-8 py-4 lg:px-12 lg:py-5"
            style={{
              background: NEON,
              fontSize: "clamp(1rem, 1.1vw, 1.2rem)",
              boxShadow: `0 15px 40px ${NEON}44`,
            }}
          >
            <span className="relative z-10 flex items-center gap-2 uppercase tracking-tight">
              COMEÇAR GRÁTIS <ArrowRight size={22} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
            </span>
          </button>
          
          <button 
            onClick={onCta}
            className="flex flex-col items-center gap-2 group transition-opacity hover:opacity-80"
          >
            <div className="flex items-center gap-6 text-white/40 mb-2">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                <Camera size={14} /> Foto
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                <Mic size={14} /> Voz
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                <Type size={14} /> Texto
              </div>
            </div>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Sem cartão de crédito · Cancele quando quiser</p>
          </button>
        </div>

        {/* Floating Badges Area - The "Scatter" layout from Operafit */}
        <div className="relative w-full max-w-[1200px] h-[500px] lg:h-[700px] flex items-center justify-center mt-[-40px]">
          {/* Scatter items around the center */}
          <ScatterBadge 
            icon={<Search size={16}/>} 
            label="SCANNER IA" 
            className="absolute top-[10%] left-[5%] -rotate-12 bg-[#00e676]/10 border-[#00e676]/30 text-[#00ff88]"
          />
          <ScatterBadge 
            icon={<Bell size={16}/>} 
            label="ALERTAS" 
            className="absolute top-[5%] right-[10%] rotate-6 bg-orange-500/10 border-orange-500/30 text-orange-400"
          />
          <ScatterBadge 
            icon={<Star size={16}/>} 
            label="METAS" 
            className="absolute bottom-[30%] left-[-2%] rotate-12 bg-purple-500/10 border-purple-500/30 text-purple-400"
          />
          <ScatterBadge 
            icon={<ShieldCheck size={16}/>} 
            label="SEGURANÇA" 
            className="absolute bottom-[20%] right-[-5%] -rotate-6 bg-blue-500/10 border-blue-500/30 text-blue-400"
          />

          {/* Center Phone Mockup */}
          <div className="relative z-20 group">
             {/* Glow behind phone */}
             <div className="absolute inset-0 bg-[#00e676] rounded-[3rem] blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity" />
             
             <div
                className="relative mx-auto rounded-[3rem] p-3 border border-white/10"
                style={{
                  background: "linear-gradient(145deg,#1c1c1c,#0a0a0a)",
                  boxShadow: `0 40px 100px -20px rgba(0,0,0,0.8)`,
                  width: "clamp(260px, 40vw, 360px)"
                }}
              >
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 h-6 w-28 rounded-full bg-black" />
                <div className="rounded-[2.4rem] bg-[#0a0a0a] overflow-hidden relative" style={{ aspectRatio: "9/19" }}>
                   <img 
                    src={heroWoman} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover opacity-40 brightness-50"
                  />
                  
                  {/* Mockup content */}
                  <div className="absolute inset-0 p-6 pt-12 flex flex-col justify-between">
                    <div className="space-y-4">
                       <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-3 backdrop-blur-md">
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Analisando faturas...</p>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-[#00e676] animate-progress-fast" style={{ width: '60%' }} />
                          </div>
                       </div>
                       
                       {[
                         { icon: "🍕", label: "Delivery iFood", value: "-R$ 45,90" },
                         { icon: "🚗", label: "Viagem Uber", value: "-R$ 28,40" },
                         { icon: "🛍️", label: "Mercado Livre", value: "-R$ 199,90" }
                       ].map((item, i) => (
                         <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5">
                            <div className="flex items-center gap-2">
                               <span className="text-base">{item.icon}</span>
                               <span className="text-white font-medium text-xs">{item.label}</span>
                            </div>
                            <span className="text-white/60 font-bold text-[10px]">{item.value}</span>
                         </div>
                       ))}
                    </div>

                    <div className="rounded-2xl bg-[#00e676] p-4 text-black flex flex-col items-center gap-1">
                       <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Saldo Previsto</span>
                       <span className="text-2xl font-black">R$ 3.847,90</span>
                       <div className="flex gap-2 w-full mt-2">
                          <div className="h-1 flex-1 bg-black/20 rounded-full" />
                          <div className="h-1 flex-1 bg-black/20 rounded-full" />
                          <div className="h-1 flex-1 bg-black/20 rounded-full" />
                       </div>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>

        {/* Bottom Stats Grid - Like Operafit */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-20 mt-16 lg:mt-10 text-center z-20">
          <StatBox label="Para registrar" value="3s" />
          <StatBox label="Estágios de controle" value="7+" />
          <StatBox label="Medalhas" value="50+" />
          <StatBox label="Gratuito" value="100%" />
        </div>

        {/* Scroll Indicator */}
        <div className="mt-16 text-white/20">
          <div className="w-5 h-8 rounded-full border border-current flex justify-center p-1.5">
             <div className="w-1 h-1 rounded-full bg-current animate-bounce" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress-fast {
          0% { width: 0; }
          100% { width: 100%; }
        }
        .animate-progress-fast {
          animation: progress-fast 2s infinite linear;
        }
      `}</style>
    </section>
  );
};

const ScatterBadge: React.FC<{ icon: React.ReactNode; label: string; className?: string }> = ({ icon, label, className = "" }) => (
  <div className={`hidden lg:flex items-center gap-3 px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest border backdrop-blur-md shadow-2xl transition-transform hover:scale-110 cursor-default ${className}`}>
    {icon} {label}
  </div>
);

const StatBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col items-center">
    <span className="text-2xl lg:text-4xl font-black text-white mb-1">{value}</span>
    <span className="text-white/40 text-[10px] lg:text-xs font-bold uppercase tracking-widest">{label}</span>
  </div>
);
