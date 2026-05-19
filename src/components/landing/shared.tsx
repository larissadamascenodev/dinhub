import React from "react";

export const NEON = "#00e676";
export const NEON_GLOW = "#00ff88";
export const BG = "#0a0a0a";
export const CARD_BG = "#111111";
export const CARD_BORDER = "#1a1a1a";

export const Section: React.FC<React.HTMLAttributes<HTMLElement>> = ({ className = "", children, ...rest }) => (
  <section
    className={`relative w-full ${className}`}
    style={{ paddingTop: "clamp(3rem, 7vw, 7rem)", paddingBottom: "clamp(3rem, 7vw, 7rem)" }}
    {...rest}
  >
    <div className="mx-auto w-full" style={{ maxWidth: "1320px", paddingLeft: "clamp(1.25rem, 4vw, 3rem)", paddingRight: "clamp(1.25rem, 4vw, 3rem)" }}>
      {children}
    </div>
  </section>
);

export const Pill: React.FC<{ children: React.ReactNode; tone?: "green" | "orange" | "neutral"; className?: string }> = ({ children, tone = "green", className = "" }) => {
  const styles =
    tone === "green"
      ? "border-[#00e676]/25 bg-[#00e676]/10 text-[#00ff88]"
      : tone === "orange"
      ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
      : "border-white/10 bg-white/5 text-white/70";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-bold uppercase tracking-[0.18em] ${styles} ${className}`}
      style={{ fontSize: "clamp(0.65rem, 0.8vw, 0.78rem)" }}
    >
      {children}
    </span>
  );
};

export const H2: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <h2 className={`font-display font-extrabold text-white leading-[1.05] tracking-tight ${className}`} style={{ fontSize: "clamp(1.8rem, 3.5vw, 3.2rem)" }}>
    {children}
  </h2>
);

export const Sub: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <p className={`text-[#a0a0a0] leading-relaxed ${className}`} style={{ fontSize: "clamp(1rem, 1.5vw, 1.18rem)" }}>
    {children}
  </p>
);

export const Body: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <p className={`text-[#a0a0a0] ${className}`} style={{ fontSize: "clamp(0.875rem, 1.1vw, 1rem)" }}>
    {children}
  </p>
);

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = "", children, style, ...rest }) => (
  <div
    className={`relative rounded-[22px] ${className}`}
    style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, ...style }}
    {...rest}
  >
    {children}
  </div>
);

export const GreenBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = "", children, ...rest }) => (
  <button
    className={`relative inline-flex items-center justify-center gap-2 rounded-full font-bold text-black transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${className}`}
    style={{
      background: NEON,
      padding: "clamp(0.75rem, 1.2vw, 1rem) clamp(1.25rem, 2vw, 1.75rem)",
      fontSize: "clamp(0.875rem, 1vw, 1rem)",
      boxShadow: "0 0 0 0 rgba(0,230,118,0)",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 40px rgba(0,255,136,0.45)")}
    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 0 0 rgba(0,230,118,0)")}
    {...rest}
  >
    {children}
  </button>
);

export const OutlineBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = "", children, ...rest }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] font-semibold text-white transition-all hover:bg-white/[0.08] hover:border-white/30 ${className}`}
    style={{
      padding: "clamp(0.75rem, 1.2vw, 1rem) clamp(1.25rem, 2vw, 1.75rem)",
      fontSize: "clamp(0.875rem, 1vw, 1rem)",
    }}
    {...rest}
  >
    {children}
  </button>
);

export const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = "" }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
