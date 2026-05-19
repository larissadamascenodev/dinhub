import React from "react";
import { 
  ArrowRight, 
  Search, 
  Bell, 
  ShieldCheck, 
  Star, 
  Camera, 
  Mic, 
  Type, 
  MessageSquare, 
  Brain, 
  LayoutGrid, 
  TrendingUp 
} from "lucide-react";
import { NEON, Reveal } from "./shared";
import { AuthForm } from "../auth/AuthForm";

export const Hero: React.FC<{ onCta: () => void }> = ({ onCta }) => {
  return (
    <section className="relative w-full min-h-screen bg-[#0a0a0a] flex flex-col items-center pt-16 pb-16">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[120%] h-[70%] rounded-[50%] opacity-10 blur-[120px]"
          style={{ background: `radial-gradient(circle, ${NEON} 0%, transparent 70%)` }}
        />
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.02]" style={{ backgroundImage: "radial-gradient(#00e676 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }} />
      </div>

      <div className="relative z-10 w-full max-w-[1320px] px-5 flex flex-col items-center text-center">
        {/* Offer Pill */}
        <div className="flex items-center gap-2 mb-12">
           <div className="flex items-center gap-2 bg-black border border-white/5 px-4 py-2 rounded-full">
              <span className="text-[#00e676] text-sm">✦</span>
              <span className="text-white font-bold text-xs lg:text-sm uppercase tracking-wider">Oferta de Lançamento:</span>
              <span className="text-[#00e676] font-bold text-xs lg:text-sm uppercase tracking-wider">TESTE GRATUITAMENTE</span>
           </div>
        </div>

        {/* Top Feature Pill */}
        <div 
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8 bg-[#00e676]/5 border border-[#00e676]/10 backdrop-blur-sm"
          style={{ fontSize: "clamp(0.7rem, 0.9vw, 0.85rem)" }}
        >
          <div className="flex -space-x-1.5 mr-1">
            {[1,2,3].map(i => (
              <img key={i} src={`https://i.pravatar.cc/100?u=${i+10}`} className="w-5 h-5 rounded-full border border-[#0a0a0a]" alt="" />
            ))}
          </div>
          <span style={{ color: "#00ff88" }} className="font-bold uppercase tracking-widest flex items-center gap-2">
            +2.847 pessoas controlando suas finanças
          </span>
        </div>

        {/* Main Headline */}
        <h1
          className="font-display font-black text-white tracking-tight w-full mb-6 leading-[1.1] max-w-[1000px]"
          style={{ fontSize: "clamp(2rem, 5vw, 4.4rem)" }}
        >
          Assuma o controle total da sua <span style={{ color: NEON }}>vida financeira.</span>
        </h1>

        {/* Supporting Text */}
        <p
          className="text-white/60 w-full mb-10 max-w-[700px] font-medium"
          style={{ fontSize: "clamp(1rem, 1.2vw, 1.3rem)", lineHeight: 1.5 }}
        >
          Organize suas finanças, entenda para onde seu dinheiro vai e acompanhe a evolução do seu patrimônio em tempo real.
        </p>

        {/* Record Pill */}
        <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-white/5 border border-white/10 mb-12 text-[10px] lg:text-xs font-bold uppercase tracking-widest text-white/40">
           <span>Registre via</span>
           <span className="flex items-center gap-1.5 text-[#00e676] opacity-80"><MessageSquare size={14} /> texto</span>
           <span className="flex items-center gap-1.5 text-[#00e676] opacity-80"><Mic size={14} /> áudio</span>
           <span className="flex items-center gap-1.5 text-[#00e676] opacity-80"><Camera size={14} /> foto</span>
           <span className="text-[#00e676]">✦</span>
        </div>

        {/* Auth Form Area */}
        <div className="w-full flex justify-center mb-16">
          <AuthForm />
        </div>

        {/* Bottom Info Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 w-full max-w-[1200px] mt-12">
          <HeroFeatureCard 
            icon={<LayoutGrid size={20} />} 
            title="Controle total" 
            desc="Receitas, despesas e cartões reunidos em um só lugar" 
          />
          <HeroFeatureCard 
            icon={<Brain size={20} />} 
            title="Assistente financeiro" 
            desc="Analisa seus hábitos e sugere melhorias personalizadas" 
          />
          <HeroFeatureCard 
            icon={<TrendingUp size={20} />} 
            title="Projeções inteligentes" 
            desc="Acompanhe projeções do seu dinheiro para o futuro" 
          />
          <HeroFeatureCard 
            icon={<ShieldCheck size={20} />} 
            title="Radar financeiro" 
            desc="Entenda para onde seu dinheiro está indo de verdade" 
          />
        </div>

        {/* Testimonial Card Snippet */}
        <div className="mt-16 w-full max-w-[800px] bg-[#111] border border-white/5 rounded-3xl p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-6 text-left">
           <img src="https://i.pravatar.cc/150?u=rafael" className="w-16 h-16 rounded-full grayscale" alt="" />
           <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-bold">Rafael M.</span>
                <div className="flex text-[#00e676]"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
              </div>
              <p className="text-white/60 text-sm italic leading-relaxed">
                "Finalmente consigo enxergar para onde meu dinheiro vai. O DinHub me deu o controle que eu precisava para organizar minha vida financeira."
              </p>
           </div>
        </div>
      </div>
    </section>
  );
};

const HeroFeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="bg-[#111]/50 border border-white/5 rounded-2xl p-5 text-left group hover:border-[#00e676]/20 transition-all">
    <div className="h-10 w-10 rounded-xl bg-[#00e676]/10 flex items-center justify-center text-[#00e676] mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="text-white font-bold text-sm mb-2">{title}</h4>
    <p className="text-white/40 text-[11px] leading-relaxed">{desc}</p>
  </div>
);
