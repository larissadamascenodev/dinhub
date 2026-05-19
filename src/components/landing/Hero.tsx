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

        {/* Floating Badges Area - Reduced height after mockup removal */}
        <div className="relative w-full max-w-[1000px] h-[250px] lg:h-[350px] flex items-center justify-center mt-[-20px]">
          {/* Scatter items */}
          <ScatterBadge 
            icon={<Search size={16}/>} 
            label="SCANNER IA" 
            className="absolute top-[10%] left-[10%] -rotate-12 bg-[#00e676]/10 border-[#00e676]/30 text-[#00ff88]"
          />
          <ScatterBadge 
            icon={<Bell size={16}/>} 
            label="ALERTAS" 
            className="absolute top-[20%] right-[10%] rotate-6 bg-orange-500/10 border-orange-500/30 text-orange-400"
          />
          <ScatterBadge 
            icon={<Star size={16}/>} 
            label="METAS" 
            className="absolute bottom-[20%] left-[5%] rotate-12 bg-purple-500/10 border-purple-500/30 text-purple-400"
          />
          <ScatterBadge 
            icon={<ShieldCheck size={16}/>} 
            label="SEGURANÇA" 
            className="absolute bottom-[10%] right-[5%] -rotate-6 bg-blue-500/10 border-blue-500/30 text-blue-400"
          />
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
