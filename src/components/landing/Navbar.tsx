import React from 'react';
import { Sparkles } from 'lucide-react';

const NavLink = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => (
  <button 
    onClick={onClick}
    className="text-[8px] sm:text-[11px] font-black tracking-[0.2em] sm:tracking-[0.3em] text-white/40 hover:text-white transition-all duration-300 uppercase touch-target"
  >
    {children}
  </button>
);

const Navbar = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { label: 'Func.', id: 'radar-header' },
    { label: 'Planos', id: 'planos' },
  ];

  return (
    <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] sm:w-auto min-w-[320px] md:min-w-[650px] max-w-[95%] transition-all duration-500">
      <div className="flex items-center justify-between gap-3 sm:gap-12 px-4 sm:px-12 py-2.5 sm:py-5 rounded-full border border-white/[0.08] bg-black/60 backdrop-blur-2xl shadow-2xl">
        {/* Logo */}
        <div 
          className="flex items-center cursor-pointer group shrink-0" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="flex items-center space-x-0.5">
            <span className="font-sora font-black text-lg sm:text-xl text-white tracking-tighter">
              DIN
            </span>
            <span className="font-sora font-extrabold text-lg sm:text-xl text-[#00e676] tracking-tighter">
              HUBY
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-4 sm:gap-14">
          {navItems.map((item) => (
            <NavLink key={item.id} onClick={() => scrollTo(item.id)}>
              {item.label}
            </NavLink>
          ))}
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
