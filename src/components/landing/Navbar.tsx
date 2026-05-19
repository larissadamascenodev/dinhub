import React from "react";
import { NEON } from "./shared";

interface Props {
  onLogin: () => void;
  onSignup: () => void;
}

export const Navbar: React.FC<Props> = ({ onLogin, onSignup }) => {
  const [scrolled, setScrolled] = React.useState(false);
  const [open] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(10,10,10,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(18px) saturate(140%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px) saturate(140%)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        }}
      >
        <div
          className="mx-auto flex items-center justify-between"
          style={{
            maxWidth: "1440px",
            paddingLeft: "clamp(1.25rem, 4vw, 3rem)",
            paddingRight: "clamp(1.25rem, 4vw, 3rem)",
            paddingTop: "clamp(0.85rem, 1.2vw, 1.1rem)",
            paddingBottom: "clamp(0.85rem, 1.2vw, 1.1rem)",
          }}
        >
          <a href="#" className="flex items-center gap-2 group">
             <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-black text-sm" style={{ background: NEON }}>D</div>
             <span className="font-display font-extrabold text-white text-xl tracking-tight">DinHub</span>
          </a>

          <div className="flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="px-4 py-2 text-sm font-bold border border-white/20 rounded-full hover:bg-white/5 transition-all"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              Controle Inteligente
            </button>
          </div>
        </div>
      </header>

      {false && open && null}
    </>
  );
};
