import React from "react";
import { ArrowRight, Search, Bell, MoveRight, CreditCard, Sparkles } from "lucide-react";
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
    <section className="relative w-full overflow-hidden bg-[#0a0a0a]" style={{ paddingTop: "clamp(6rem, 10vw, 8rem)", paddingBottom: "clamp(3rem, 6vw, 5rem)" }}>
      {/* Background with glow and image */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-0 right-0 h-full w-full lg:w-[70%] opacity-40 mix-blend-screen"
          style={{
            background: `radial-gradient(circle at 70% 30%, ${NEON}33 0%, transparent 70%)`
          }}
        />
        <img
          src={heroWoman}
          alt=""
          className="absolute right-0 top-0 h-full w-full lg:w-[60%] object-cover object-center opacity-40"
          style={{ 
            maskImage: "linear-gradient(to left, black 20%, transparent 90%), linear-gradient(to bottom, black 80%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to left, black 20%, transparent 90%), linear-gradient(to bottom, black 80%, transparent 100%)"
          }}
        />
      </div>

      <div className="relative mx-auto w-full hero-container" style={{ maxWidth: "1320px" }}>
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center w-full min-w-0">
          {/* LEFT: Content */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left min-w-0 w-full z-10">
            
            <div
              className="inline-flex items-center gap-2 rounded-full border mb-6 px-4 py-1.5"
              style={{ background: "rgba(0,230,118,0.08)", borderColor: `${NEON}33` }}
            >
              <div className="flex -space-x-2 shrink-0">
                {avatars.map((src, i) => (
                  <img key={i} src={src} alt="" className="rounded-full border-2 w-6 h-6 border-[#0a0a0a]" />
                ))}
              </div>
              <span className="font-bold text-xs uppercase tracking-wider" style={{ color: NEON }}>
                +2.847 pessoas no controle
              </span>
            </div>

            <h1
              className="font-display font-black text-white tracking-tight w-full mb-6 leading-[1.05]"
              style={{ fontSize: "clamp(2.4rem, 7vw, 4.8rem)" }}
            >
              Seu dinheiro some e você <br className="hidden lg:block" />
              <span style={{ color: NEON }} className="relative">
                não sabe por quê.
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#00e676]/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </span>
            </h1>

            <p
              className="text-white/70 w-full mb-8 max-w-[580px]"
              style={{ fontSize: "clamp(1rem, 1.2vw, 1.25rem)", lineHeight: 1.6 }}
            >
              O DinHub analisa cada centavo das suas contas, te avisa antes de virar problema e te mostra exatamente o que fazer. Sem planilhas, sem esforço.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={onCta}
                className="inline-flex items-center justify-center gap-3 rounded-full font-black text-black transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                style={{
                  background: NEON,
                  padding: "1.1rem 2.2rem",
                  fontSize: "1.05rem",
                  boxShadow: `0 10px 40px ${NEON}44`,
                }}
              >
                COMEÇAR AGORA <ArrowRight size={20} strokeWidth={3} />
              </button>
              
              <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white/5 border border-white/10">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className="text-[#f59e0b] text-sm">★</span>
                  ))}
                </div>
                <span className="text-white/80 text-xs font-bold uppercase tracking-widest">Nota 4.9 na Store</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Visual */}
          <div className="relative w-full flex justify-center lg:justify-end z-10">
            <div className="relative w-full max-w-[420px]">
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px]" style={{ background: NEON }} />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-[60px]" style={{ background: "#a855f7" }} />

              {/* Transaction stack */}
              <div className="flex flex-col gap-4 w-full">
                {txns.map((t, i) => (
                  <div 
                    key={i} 
                    className="transform transition-all duration-500"
                    style={{ 
                      animation: `floatIn 0.8s ${0.1 * i}s both`,
                      transform: `perspective(1000px) rotateX(10deg) rotateY(-5deg)`
                    }}
                  >
                    <TxnCard {...t} />
                  </div>
                ))}
              </div>

              {/* Floating notification */}
              <div 
                className="absolute -right-4 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-[#111] border border-[#00e676]/30 shadow-2xl z-20 hidden sm:block animate-bounce"
                style={{ animationDuration: '3s' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00e676]/10 flex items-center justify-center text-[#00e676]">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Huby detectou!</p>
                    <p className="text-white/50 text-xs">Você pode economizar R$ 120 hoje.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom trust indicators */}
        <div className="mt-16 lg:mt-24 pt-10 border-t border-white/5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-12">
            <Feature icon={<Search size={22} />} title="Analisa cada centavo" desc="Visão automática de tudo que entra e sai da sua conta." />
            <Feature icon={<Bell size={22} />} title="Alertas de impacto" desc="Te avisamos sobre gastos atípicos antes de doer no bolso." />
            <Feature icon={<MoveRight size={22} />} title="Ação inteligente" desc="Sugestões práticas do que fazer para economizar mais." />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatIn { 
          from { opacity: 0; transform: translateY(30px) perspective(1000px) rotateX(10deg) rotateY(-5deg); } 
          to { opacity: 1; transform: translateY(0) perspective(1000px) rotateX(10deg) rotateY(-5deg); } 
        }
        .hero-container { padding-left: 20px; padding-right: 20px; }
        @media (min-width: 640px) {
          .hero-container { padding-left: clamp(1.5rem, 4vw, 3rem); padding-right: clamp(1.5rem, 4vw, 3rem); }
        }
      `}</style>
    </section>
  );
};

const TxnCard: React.FC<Txn> = ({ name, time, value, logo, logoBg, highlight }) => (
  <div
    className="flex items-center gap-4 rounded-2xl p-4 transition-all hover:scale-[1.02] cursor-default"
    style={{
      background: "rgba(20,20,20,0.85)",
      backdropFilter: "blur(20px)",
      border: highlight ? `2px solid ${NEON}` : "1px solid rgba(255,255,255,0.08)",
      boxShadow: highlight ? `0 0 30px ${NEON}33` : "0 10px 40px rgba(0,0,0,0.5)",
    }}
  >
    <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${logoBg}`}>{logo}</div>
    <div className="flex-1 min-w-0">
      <p className="text-white font-bold leading-tight truncate text-base">{name}</p>
      <p className="text-white/40 mt-1 text-xs">{time}</p>
    </div>
    <div className="text-right">
      <p className="font-black text-[#ff5959] text-base tabular-nums">{value}</p>
      {highlight && <p className="text-[10px] font-bold tracking-widest uppercase mt-0.5" style={{ color: NEON }}>Urgente</p>}
    </div>
  </div>
);

const Feature: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex gap-4 items-start group">
    <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110" style={{ background: "rgba(0,230,118,0.06)", color: NEON, border: `1px solid ${NEON}22` }}>
      {icon}
    </div>
    <div>
      <h3 className="text-white font-bold text-sm lg:text-base leading-tight">{title}</h3>
      <p className="text-white/50 text-xs lg:text-sm mt-1.5 leading-relaxed">{desc}</p>
    </div>
  </div>
);
