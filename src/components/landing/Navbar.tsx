import React from 'react';

const Navbar = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-fit">
      <div className="flex items-center justify-between gap-8 px-5 py-2 rounded-full border border-[#1e1e1e] bg-[#0a0a0a]/88 backdrop-blur-[24px]">
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
            className="text-sm font-medium text-[#a0a0a0] hover:text-[#00e676] transition-colors"
          >
            Funcionalidades
          </button>
          <button 
            onClick={() => scrollTo('planos')}
            className="text-sm font-medium text-[#a0a0a0] hover:text-[#00e676] transition-colors"
          >
            Planos
          </button>
        </div>

        {/* CTA */}
        <a 
          href="/auth"
          className="px-5 py-2 rounded-full bg-[#00e676] text-[#0a0a0a] font-sora font-bold text-sm hover:brightness-110 transition-all whitespace-nowrap"
        >
          Começar grátis
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
