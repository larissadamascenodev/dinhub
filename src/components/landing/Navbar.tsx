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
    <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] sm:w-auto min-w-[320px] max-w-[95%]">
      <div className="flex items-center justify-between gap-3 sm:gap-8 px-4 sm:px-10 py-2.5 sm:py-4 rounded-full border border-white/[0.08] bg-black/60 backdrop-blur-2xl shadow-2xl">
        {/* Logo */}
        <div className="flex items-center cursor-pointer group shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="font-sora font-black text-lg sm:text-3xl text-white tracking-tighter flex items-center">
            DIN<span className="inline-block bg-white text-black px-1.5 ml-0.5 rounded-sm transform -skew-x-12 italic text-[0.8em]">HUBY</span>
          </span>
        </div>

        {/* Links - Now visible on mobile too but more compact */}
        <div className="flex items-center gap-4 sm:gap-14">
          <button 
            onClick={() => scrollTo('radar-header')}
            className="text-[8px] sm:text-[11px] font-black tracking-[0.2em] sm:tracking-[0.3em] text-white/40 hover:text-white transition-all duration-300 uppercase touch-target"
          >
            Func.
          </button>
          <button 
            onClick={() => scrollTo('planos')}
            className="text-[8px] sm:text-[11px] font-black tracking-[0.2em] sm:tracking-[0.3em] text-white/40 hover:text-white transition-all duration-300 uppercase touch-target"
          >
            Planos
          </button>
        </div>

        {/* CTA */}
        <a 
          href="/auth"
          className="px-4 sm:px-12 py-2 sm:py-4 rounded-full bg-white text-black font-sora font-black text-[9px] sm:text-sm uppercase tracking-[0.1em] sm:tracking-[0.2em] hover:bg-[#00e676] hover:scale-105 transition-all duration-500 whitespace-nowrap touch-target !min-h-0"
        >
          Entrar
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
