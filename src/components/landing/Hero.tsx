import React from "react";
import { ArrowRight, Play, Search, Bell, MoveRight, CreditCard } from "lucide-react";
import { NEON, NEON_GLOW } from "./shared";
import heroWoman from "@/assets/hero-woman.jpeg";

const avatars = [
  "https://randomuser.me/api/portraits/women/12.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/45.jpg",
  "https://randomuser.me/api/portraits/men/52.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
];

type Txn = { name: string; time: string; value: string; logo: React.ReactNode; logoBg: string; highlight?: boolean };

const txns: Txn[] = [
  { name: "iFood", time: "Hoje, 13:42", value: "- R$ 45,90", logo: <span className="text-white font-black italic text-sm">iFood</span>, logoBg: "bg-[#EA1D2C]" },
  { name: "Uber", time: "Hoje, 12:18", value: "- R$ 28,40", logo: <span className="text-black font-black text-xs">Uber</span>, logoBg: "bg-white" },
  { name: "Mercado Livre", time: "Hoje, 10:37", value: "- R$ 199,90", logo: <span className="text-2xl">🤝</span>, logoBg: "bg-[#FFE600]" },
  { name: "Netflix", time: "Ontem, 21:34", value: "- R$ 55,90", logo: <span className="text-[#E50914] font-black text-xl">N</span>, logoBg: "bg-black border border-white/15" },
  { name: "Fatura cartão", time: "Ontem, 18:20", value: "- R$ 1.254,80", logo: <CreditCard className="text-white" size={20} />, logoBg: "bg-[#00e676]", highlight: true },
];

export const Hero: React.FC<{ onCta: () => void }> = ({ onCta }) => {
  return (
    <section className="relative w-full overflow-hidden" style={{ paddingTop: "clamp(7rem, 11vw, 9rem)", paddingBottom: "clamp(3rem, 6vw, 5rem)" }}>
      <div className="hero-bg-woman absolute inset-0 pointer-events-none">
        <img
          src={heroWoman}
          alt=""
          className="absolute right-0 top-0 h-full w-full lg:w-[65%] object-cover object-center opacity-[0.55]"
          style={{ maskImage: "linear-gradient(to left, black 30%, transparent 100%)", WebkitMaskImage: "linear-gradient(to left, black 30%, transparent 100%)" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, #0a0a0a 0%, rgba(10,10,10,0.7) 45%, rgba(10,10,10,0.35) 100%)" }} />
        <div
          className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${NEON}33 0%, transparent 65%)`, filter: "blur(40px)" }}
        />
      </div>

      <div
        className="relative mx-auto w-full hero-container"
        style={{ maxWidth: "1320px" }}
      >
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* LEFT: copy */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left" style={{ gap: "24px" }}>
            <div
              className="inline-flex items-center gap-3 rounded-full border px-3 py-2 max-w-full"
              style={{ background: "rgba(0,230,118,0.06)", borderColor: "rgba(0,230,118,0.25)" }}
            >
              <div className="flex -space-x-2 shrink-0">
                {avatars.map((src, i) => (
                  <img key={i} src={src} alt="" className="h-7 w-7 rounded-full border-2" style={{ borderColor: "#0a0a0a" }} />
                ))}
              </div>
              <span className="font-semibold" style={{ color: NEON_GLOW, fontSize: "clamp(0.78rem, 2.6vw, 0.9rem)" }}>
                +2.847 pessoas assumindo o controle
              </span>
            </div>

            <h1
              className="font-display font-extrabold text-white tracking-tight w-full"
              style={{
                fontSize: "clamp(2rem, 8vw, 4.4rem)",
                lineHeight: 1.08,
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              Seu dinheiro some todo mês e você{" "}
              <span style={{ color: NEON }}>não sabe por quê.</span>
            </h1>

            <p
              className="text-[#a0a0a0] w-full"
              style={{
                fontSize: "clamp(0.9rem, 3.5vw, 1.18rem)",
                lineHeight: 1.55,
                wordWrap: "break-word",
                overflowWrap: "break-word",
                paddingLeft: "4px",
                paddingRight: "4px",
              }}
            >
              O DinHub analisa cada centavo, te avisa antes de virar problema e te mostra o que fazer. Em português, sem enrolação.
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-1 w-full">
              <button
                onClick={onCta}
                className="inline-flex items-center justify-center gap-2 rounded-full font-bold text-black transition-all hover:scale-[1.02] w-full sm:w-auto"
                style={{
                  background: NEON,
                  padding: "clamp(0.9rem, 1.3vw, 1.1rem) clamp(1.4rem, 2vw, 1.9rem)",
                  fontSize: "clamp(0.9rem, 1.05vw, 1.05rem)",
                  boxShadow: "0 0 30px rgba(0,255,136,0.35)",
                }}
              >
                Descobrir para onde vai meu dinheiro <ArrowRight size={18} />
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.03] font-semibold text-white transition-all hover:bg-white/[0.08] w-full sm:w-auto"
                style={{
                  padding: "clamp(0.9rem, 1.3vw, 1.1rem) clamp(1.4rem, 2vw, 1.9rem)",
                  fontSize: "clamp(0.9rem, 1.05vw, 1.05rem)",
                }}
              >
                <Play size={16} fill="white" /> Ver como funciona
              </button>
            </div>
          </div>

          {/* RIGHT: floating txn cards */}
          <div className="relative flex flex-col gap-3 items-stretch lg:items-end">
            {/* Mobile: horizontal carousel */}
            <div
              className="flex lg:hidden gap-3 overflow-x-auto hero-scroll snap-x snap-mandatory"
              style={{ marginLeft: "-20px", marginRight: "-20px", paddingLeft: "20px", paddingRight: "20px", scrollPadding: "20px" }}
            >
              {txns.map((t, i) => (
                <TxnCard key={i} {...t} className="snap-center shrink-0" style={{ width: "85vw", maxWidth: "360px" }} />
              ))}
            </div>
            {/* Desktop: stack */}
            <div className="hidden lg:flex flex-col gap-3 w-full max-w-[360px]">
              {txns.map((t, i) => (
                <div key={i} style={{ animation: `floatIn 0.7s ${0.15 * i}s both` }}>
                  <TxnCard {...t} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom mini cards — 3 em linha, desktop e mobile */}
        <div className="mt-10 lg:mt-16 border-t border-white/[0.06] pt-8">
          <div className="grid grid-cols-3 gap-2 sm:gap-5">
            <MiniInfo icon={<Search />} title="Analisa cada centavo" subtitle="Visão completa de tudo que entra e sai." />
            <MiniInfo icon={<Bell />} title="Te avisa antes" subtitle="Alertas antes de virar problema no seu bolso." />
            <MiniInfo icon={<MoveRight />} title="Te mostra o que fazer" subtitle="Decisões claras para você agir com confiança." />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .hero-scroll::-webkit-scrollbar { display: none; }
        .hero-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .hero-container { padding-left: 20px; padding-right: 20px; }
        @media (min-width: 640px) {
          .hero-container { padding-left: clamp(1.5rem, 4vw, 3rem); padding-right: clamp(1.5rem, 4vw, 3rem); }
        }
      `}</style>
    </section>
  );
};

const TxnCard: React.FC<Txn & { className?: string; style?: React.CSSProperties }> = ({ name, time, value, logo, logoBg, highlight, className = "", style }) => (
  <div
    className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${className}`}
    style={{
      background: "rgba(17,17,17,0.85)",
      backdropFilter: "blur(14px)",
      border: highlight ? `1.5px solid ${NEON}` : "1px solid rgba(255,255,255,0.07)",
      boxShadow: highlight ? `0 0 24px ${NEON}33` : "0 8px 30px rgba(0,0,0,0.4)",
      ...style,
    }}
  >
    <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${logoBg}`}>{logo}</div>
    <div className="flex-1 min-w-0">
      <p className="text-white font-bold text-sm leading-tight truncate">{name}</p>
      <p className="text-white/50 text-xs mt-0.5">{time}</p>
    </div>
    <p className="font-black text-[#ff5959] tabular-nums whitespace-nowrap" style={{ fontSize: "clamp(0.875rem, 1vw, 1rem)" }}>{value}</p>
  </div>
);

const MiniInfo: React.FC<{ icon: React.ReactElement; title: string; subtitle: string }> = ({ icon, title, subtitle }) => (
  <div className="flex flex-col items-start gap-2">
    <div
      className="rounded-lg sm:rounded-xl flex items-center justify-center shrink-0"
      style={{
        background: "rgba(0,230,118,0.1)",
        color: NEON,
        width: "clamp(32px, 8vw, 44px)",
        height: "clamp(32px, 8vw, 44px)",
      }}
    >
      {React.cloneElement(icon, { size: 20, strokeWidth: 2.2 })}
    </div>
    <div className="min-w-0">
      <p className="font-bold text-white mb-0.5 sm:mb-1 leading-tight" style={{ fontSize: "clamp(0.72rem, 2.6vw, 0.95rem)" }}>
        {title}
      </p>
      <p className="text-white/60 leading-snug" style={{ fontSize: "clamp(0.62rem, 2.2vw, 0.82rem)" }}>
        {subtitle}
      </p>
    </div>
  </div>
);
