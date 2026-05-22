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
          <div className="flex items-center gap-0.5">
            <span className="font-sora font-black text-xl sm:text-2xl text-white tracking-tighter uppercase">
              Din
            </span>
            <div className="relative">
              <span className="font-sora font-light text-xl sm:text-2xl text-[#00e676] tracking-widest uppercase italic ml-1">
                Huby
              </span>
              <div className="absolute -bottom-1 left-1 w-full h-[2px] bg-gradient-to-r from-[#00e676] to-transparent opacity-50" />
            </div>
          </div>
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
