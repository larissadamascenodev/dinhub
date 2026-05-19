import React from "react";
import { ArrowRight, Play, Target, Bell, Shield, CreditCard } from "lucide-react";
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
      {/* hero-bg-woman: SUBSTITUIR este asset pela imagem definitiva da mulher estressada */}
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

      <div className="relative mx-auto w-full" style={{ maxWidth: "1320px", paddingLeft: "clamp(1.25rem, 4vw, 3rem)", paddingRight: "clamp(1.25rem, 4vw, 3rem)" }}>
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* LEFT: copy */}
          <div className="flex flex-col" style={{ gap: "clamp(1rem, 1.8vw, 1.5rem)" }}>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-3 self-start rounded-full border px-3 py-2"
              style={{ background: "rgba(0,230,118,0.06)", borderColor: "rgba(0,230,118,0.25)" }}
            >
              <div className="flex -space-x-2">
                {avatars.map((src, i) => (
                  <img key={i} src={src} alt="" className="h-7 w-7 rounded-full border-2" style={{ borderColor: "#0a0a0a" }} />
                ))}
              </div>
              <span className="font-semibold" style={{ color: NEON_GLOW, fontSize: "clamp(0.75rem, 0.95vw, 0.9rem)" }}>
                +2.847 pessoas assumindo o controle
              </span>
            </div>

            <h1
              className="font-display font-extrabold text-white tracking-tight"
              style={{ fontSize: "clamp(2rem, 5vw, 4.4rem)", lineHeight: 1.02 }}
            >
              Seu dinheiro some todo mês e você{" "}
              <span style={{ color: NEON }}>não sabe por quê.</span>
            </h1>

            <p className="text-[#a0a0a0] max-w-[560px]" style={{ fontSize: "clamp(1rem, 1.3vw, 1.18rem)", lineHeight: 1.55 }}>
              O DinHub analisa cada centavo, te avisa antes de virar problema e te mostra o que fazer. Em português, sem enrolação.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={onCta}
                className="inline-flex items-center gap-2 rounded-full font-bold text-black transition-all hover:scale-[1.02]"
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
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.03] font-semibold text-white transition-all hover:bg-white/[0.08]"
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
            <div className="flex lg:hidden gap-3 overflow-x-auto scrollbar-hide -mx-5 px-5 snap-x snap-mandatory">
              {txns.map((t, i) => (
                <TxnCard key={i} {...t} className="snap-center shrink-0 w-[78vw] max-w-[320px]" />
              ))}
            </div>
            {/* Desktop: stack */}
            <div className="hidden lg:flex flex-col gap-3 w-full max-w-[360px]">
              {txns.map((t, i) => (
                <div
                  key={i}
                  style={{
                    animation: `floatIn 0.7s ${0.15 * i}s both`,
                  }}
                >
                  <TxnCard {...t} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom mini cards */}
        <div className="mt-10 lg:mt-16 border-t border-white/[0.06] pt-8">
          <div className="grid sm:grid-cols-3 gap-5">
            <MiniInfo icon={<Target size={20} />} title="Meta de férias">
              <span className="text-white/80 text-sm">R$ 2.350,00 / R$ 5.000,00</span>
              <div className="mt-2 h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: "47%", background: NEON, boxShadow: `0 0 12px ${NEON}` }} />
              </div>
              <span className="mt-1 inline-block text-xs font-bold" style={{ color: NEON }}>47%</span>
            </MiniInfo>
            <MiniInfo icon={<Bell size={20} />} title="Alerta de gastos">
              <p className="text-white/70 text-sm">
                Você já gastou <span style={{ color: NEON }} className="font-bold">90%</span> do seu limite com <span style={{ color: NEON }}>Lazer</span> neste mês.
              </p>
            </MiniInfo>
            <MiniInfo icon={<Shield size={20} />} title="Radar de risco">
              <p className="text-white/70 text-sm">
                Detectamos aumento de gastos em <span style={{ color: NEON }}>Delivery</span>.
              </p>
            </MiniInfo>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </section>
  );
};

const TxnCard: React.FC<Txn & { className?: string }> = ({ name, time, value, logo, logoBg, highlight, className = "" }) => (
  <div
    className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${className}`}
    style={{
      background: "rgba(17,17,17,0.85)",
      backdropFilter: "blur(14px)",
      border: highlight ? `1.5px solid ${NEON}` : "1px solid rgba(255,255,255,0.07)",
      boxShadow: highlight ? `0 0 24px ${NEON}33` : "0 8px 30px rgba(0,0,0,0.4)",
    }}
  >
    <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${logoBg}`}>{logo}</div>
    <div className="flex-1 min-w-0">
      <p className="text-white font-bold text-sm leading-tight truncate">{name}</p>
      <p className="text-white/50 text-xs mt-0.5">{time}</p>
    </div>
    <p className="font-black text-[#ff5959] tabular-nums" style={{ fontSize: "clamp(0.875rem, 1vw, 1rem)" }}>{value}</p>
  </div>
);

const MiniInfo: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="flex gap-3">
    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(0,230,118,0.1)", color: NEON }}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="font-bold text-white text-sm mb-1">{title}</p>
      {children}
    </div>
  </div>
);
