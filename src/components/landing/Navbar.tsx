import React from 'react';

const Navbar = () => {
  return (
    <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] sm:w-auto transition-all duration-500">
      <div className="flex items-center justify-between gap-6 sm:gap-12 lg:gap-20 px-6 sm:px-10 py-3 sm:py-4 rounded-full border border-white/[0.08] bg-black/60 backdrop-blur-2xl shadow-2xl">
        {/* Logo */}
        <div 
          className="flex items-center cursor-pointer group shrink-0" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="font-sora font-bold text-lg sm:text-xl text-white tracking-tight">
            DinHub
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 lg:gap-12">
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-white/70 hover:text-white font-sora text-xs lg:text-sm font-medium transition-colors whitespace-nowrap"
          >
            Funcionalidades
          </button>
          <button 
            onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-white/70 hover:text-white font-sora text-xs lg:text-sm font-medium transition-colors whitespace-nowrap"
          >
            Planos
          </button>
        </div>

        {/* CTA Button */}
        <a 
          href="/login"
          className="px-6 sm:px-8 py-2 sm:py-3 rounded-full bg-white text-black font-sora font-bold text-[10px] sm:text-xs uppercase tracking-wider hover:bg-[#00e676] hover:scale-105 transition-all duration-500 whitespace-nowrap shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          Entrar
        </a>
      </div>
    </nav>
  );
};

export default Navbar;