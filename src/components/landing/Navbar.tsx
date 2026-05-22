import React from 'react';
import { Sparkles } from 'lucide-react';

const Navbar = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] sm:w-[95%] max-w-5xl">
      <div className="flex items-center justify-between gap-4 sm:gap-8 px-5 sm:px-10 py-3 sm:py-4 rounded-full border border-white/[0.08] bg-black/60 backdrop-blur-2xl shadow-2xl">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#00e676]/10 flex items-center justify-center border border-[#00e676]/20 group-hover:border-[#00e676]/50 transition-all duration-500 shadow-[0_0_15px_rgba(0,230,118,0.2)]">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#00e676]" />
          </div>
          <span className="font-sora font-extrabold text-xl sm:text-2xl text-white tracking-tighter italic">
            Huby
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          <button 
            onClick={() => scrollTo('radar-header')}
            className="text-[10px] font-black tracking-[0.25em] text-white/40 hover:text-white transition-all duration-300 uppercase touch-target"
          >
            Radar
          </button>
          <button 
            onClick={() => scrollTo('planos')}
            className="text-[10px] font-black tracking-[0.25em] text-white/40 hover:text-white transition-all duration-300 uppercase touch-target"
          >
            Membro
          </button>
          <button 
            onClick={() => scrollTo('radar-section')}
            className="text-[10px] font-black tracking-[0.25em] text-white/40 hover:text-white transition-all duration-300 uppercase touch-target"
          >
            Funções
          </button>
        </div>

        {/* CTA */}
        <a 
          href="/auth"
          className="px-6 sm:px-10 py-3 sm:py-3.5 rounded-full bg-white text-black font-sora font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-[#00e676] hover:scale-105 transition-all duration-500 whitespace-nowrap touch-target !min-h-0"
        >
          Entrar
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
