import React from 'react';

const Navbar = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-4xl">
      <div className="flex items-center justify-between gap-8 px-8 py-3 rounded-full border border-white/[0.08] bg-[#0a0a0a]/70 backdrop-blur-2xl shadow-2xl">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-8 h-8 rounded-lg bg-[#00e676] flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 shadow-[0_0_15px_rgba(0,230,118,0.4)]">
            <span className="text-[#0a0a0a] font-black text-xs">D</span>
          </div>
          <span className="font-sora font-extrabold text-xl text-white tracking-tighter">
            Din<span className="text-[#00e676]">Hub</span>
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          <button 
            onClick={() => scrollTo('radar-header')}
            className="text-[10px] font-black tracking-[0.2em] text-white/30 hover:text-[#00e676] transition-all duration-300 uppercase"
          >
            Radar
          </button>
          <button 
            onClick={() => scrollTo('planos')}
            className="text-[10px] font-black tracking-[0.2em] text-white/30 hover:text-[#00e676] transition-all duration-300 uppercase"
          >
            Membro
          </button>
        </div>

        {/* CTA */}
        <a 
          href="/auth"
          className="px-6 py-2.5 rounded-full bg-white text-[#0a0a0a] font-sora font-black text-xs hover:bg-[#00e676] hover:shadow-[0_0_20px_rgba(0,230,118,0.4)] transition-all duration-500 whitespace-nowrap"
        >
          Acessar Terminal
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
