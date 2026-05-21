import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-20 px-5 border-t border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V5Z" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 19C19 16.2386 15.866 14 12 14C8.13401 14 5 16.2386 5 19" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-sora font-extrabold text-2xl text-white">
                    Din<span className="text-[#00e676]">Hub</span>
                </span>
            </div>
            <p className="text-[#a0a0a0] text-sm text-center">
                Inteligência financeira que trabalha por você.
            </p>
        </div>

        <div className="flex gap-8">
          <a href="/termos-de-uso" className="text-xs text-[#444] hover:text-[#00e676] transition-colors">Termos</a>
          <a href="/politica-privacidade" className="text-xs text-[#444] hover:text-[#00e676] transition-colors">Privacidade</a>
          <a href="/suporte" className="text-xs text-[#444] hover:text-[#00e676] transition-colors">Suporte</a>
        </div>

        <div className="text-[10px] text-[#222] font-bold uppercase tracking-widest">
          © {currentYear} DinHub
        </div>
      </div>
    </footer>
  );
};

export default Footer;
