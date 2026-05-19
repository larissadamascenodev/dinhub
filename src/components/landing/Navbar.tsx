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

  const links = [
    { label: "Quem Somos", href: "#" },
    { label: "Termos de Uso", href: "/termos-de-uso" },
  ];

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
          <a href="#" className="font-display font-extrabold text-white" style={{ fontSize: "clamp(1.35rem, 1.8vw, 1.7rem)", letterSpacing: "-0.02em" }}>
            Din<span style={{ color: NEON }}>Hub</span>
          </a>

          {/* Desktop pill nav */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full border border-white/8 bg-white/[0.03] px-2 py-1.5 backdrop-blur">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-white/75 transition-colors hover:text-white hover:bg-white/[0.06]"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="rounded-full border border-white/15 bg-white/[0.03] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]"
            >
              Entrar
            </button>
            <button
              onClick={onSignup}
              className="hidden lg:flex rounded-full px-5 py-2.5 text-sm font-bold text-black transition-all hover:scale-[1.03]"
              style={{ background: NEON, boxShadow: "0 0 24px rgba(0,230,118,0.35)" }}
            >
              Cadastre-se
            </button>
          </div>
        </div>
      </header>

      {false && open && null}
    </>
  );
};
