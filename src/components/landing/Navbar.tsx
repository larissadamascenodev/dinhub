import React from 'react';

const Navbar = () => {
  return (
    <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] sm:w-auto min-w-[280px] md:min-w-[450px] max-w-[95%] transition-all duration-500">
      <div className="flex items-center justify-between gap-6 sm:gap-24 px-6 sm:px-14 py-2.5 sm:py-5 rounded-full border border-white/[0.08] bg-black/60 backdrop-blur-2xl shadow-2xl">
        {/* Logo */}
        <div 
          className="flex items-center cursor-pointer group shrink-0" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="flex items-center space-x-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00e676] to-[#00c853] flex items-center justify-center shadow-[0_0_15px_rgba(0,230,118,0.3)] group-hover:scale-110 transition-transform duration-300">
              <span className="font-sora font-black text-black text-sm">D</span>
            </div>
            <span className="font-sora font-bold text-xl text-white tracking-tight ml-1">
              Din<span className="text-[#00e676]">Hub</span>
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <a 
          href="/auth"
          className="px-4 sm:px-12 py-2 sm:py-4 rounded-full bg-white text-black font-sora font-black text-[9px] sm:text-sm uppercase tracking-[0.1em] sm:tracking-[0.2em] hover:bg-[#00e676] hover:scale-105 transition-all duration-500 whitespace-nowrap touch-target !min-h-0 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          Entrar
        </a>
      </div>
    </nav>
  );
};

export default Navbar;