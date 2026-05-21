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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V5Z" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 19C19 16.2386 15.866 14 12 14C8.13401 14 5 16.2386 5 19" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
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
