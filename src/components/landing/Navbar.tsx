import React from 'react';

const Navbar = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-5xl">
      <div className="flex items-center justify-between gap-8 px-6 py-3 rounded-2xl border border-white/5 bg-[#0a0a0a]/70 backdrop-blur-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          {/* Icon removed by user request */}
          <span className="font-sora font-extrabold text-lg text-white">
            Din<span className="text-[#00e676]">Hub</span>
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => scrollTo('funcionalidades')}
            className="text-xs font-semibold text-white/50 hover:text-[#00e676] tracking-widest uppercase transition-all duration-300"
          >
            Funcionalidades
          </button>
          <button 
            onClick={() => scrollTo('planos')}
            className="text-xs font-semibold text-white/50 hover:text-[#00e676] tracking-widest uppercase transition-all duration-300"
          >
            Planos
          </button>
        </div>

        {/* CTA */}
        <a 
          href="/auth"
          className="px-6 py-2.5 rounded-xl bg-[#00e676] text-[#0a0a0a] font-sora font-bold text-xs hover:bg-[#00ff88] hover:shadow-[0_0_20px_rgba(0,230,118,0.4)] transition-all duration-300 whitespace-nowrap"
        >
          Acessar Plataforma
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
