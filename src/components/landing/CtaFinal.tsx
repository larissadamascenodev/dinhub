import React from "react";
import { ArrowRight } from "lucide-react";
import { Reveal, NEON } from "./shared";

export const CtaFinal: React.FC<{ onCta: () => void }> = ({ onCta }) => {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ paddingTop: "clamp(3rem, 5vw, 5rem)", paddingBottom: "clamp(3rem, 5vw, 5rem)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 100%, ${NEON}22 0%, transparent 60%)` }}
      />
      <div
        className="relative mx-auto w-full"
        style={{ maxWidth: "920px", paddingLeft: "clamp(1.25rem, 4vw, 3rem)", paddingRight: "clamp(1.25rem, 4vw, 3rem)" }}
      >
        <Reveal>
          <div className="text-center">
            <h2
              className="font-display font-extrabold text-white leading-[1.05]"
              style={{ fontSize: "clamp(1.8rem, 4vw, 3.4rem)" }}
            >
              Controle hoje.
            </h2>
            <p
              className="font-display font-extrabold mt-1"
              style={{ color: NEON, fontSize: "clamp(1.8rem, 4vw, 3.4rem)", lineHeight: 1.05 }}
            >
              Mais liberdade amanhã.
            </p>
            <p
              className="mt-4 text-[#a0a0a0] max-w-[540px] mx-auto"
              style={{ fontSize: "clamp(0.95rem, 1.15vw, 1.05rem)" }}
            >
              No DinHub, você organiza, entende e acompanha seu dinheiro de forma simples, clara e inteligente.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-7 grid grid-cols-3 gap-2 sm:gap-4 max-w-[720px] mx-auto">
            {[
              ["Você registra.", "DinHub organiza."],
              ["Você entende.", "DinHub te mostra."],
              ["Você decide.", "DinHub te acompanha."],
            ].map(([a, b]) => (
              <div
                key={a}
                className="rounded-xl p-3 sm:p-4 text-center"
                style={{ background: "#111111", border: `1px solid ${NEON}22` }}
              >
                <p className="text-white font-bold text-[11px] sm:text-sm leading-tight">{a}</p>
                <p className="font-bold mt-1 text-[11px] sm:text-sm leading-tight" style={{ color: NEON }}>{b}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-8 flex flex-col items-center">
            <button
              onClick={onCta}
              className="inline-flex items-center gap-2 rounded-full font-bold text-black transition-all hover:scale-[1.03]"
              style={{
                background: NEON,
                padding: "clamp(0.95rem, 1.4vw, 1.15rem) clamp(1.6rem, 2.6vw, 2.2rem)",
                fontSize: "clamp(0.95rem, 1.15vw, 1.1rem)",
                boxShadow: `0 0 40px ${NEON}66`,
                animation: "ctaGlow 2.4s ease-in-out infinite",
              }}
            >
              Começar agora — é grátis <ArrowRight size={18} />
            </button>
            <p className="text-white/55 text-xs sm:text-sm mt-3">
              Sem cartão de crédito. 3 dias grátis. Cancele quando quiser.
            </p>
          </div>
        </Reveal>
      </div>

      <style>{`@keyframes ctaGlow { 0%,100%{box-shadow:0 0 30px ${NEON}55} 50%{box-shadow:0 0 60px ${NEON}99} }`}</style>
    </section>
  );
};

export const Footer: React.FC = () => (
  <footer className="border-t border-white/[0.06] py-10">
    <div
      className="mx-auto text-center"
      style={{ maxWidth: "1320px", paddingLeft: "clamp(1.25rem, 4vw, 3rem)", paddingRight: "clamp(1.25rem, 4vw, 3rem)" }}
    >
      <p className="font-display font-extrabold text-white text-2xl">
        Din<span style={{ color: NEON }}>Hub</span>
      </p>
      <p className="text-white/55 text-sm mt-2">Inteligência financeira que trabalha por você.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/70">
        <a href="/termos-de-uso" className="hover:text-white">Termos de Uso</a>
        <a href="/politica-privacidade" className="hover:text-white">Privacidade</a>
        <a href="/suporte" className="hover:text-white">Suporte</a>
      </div>
      <p className="text-white/40 text-xs mt-6">© 2026 DinHub. Todos os direitos reservados.</p>
    </div>
  </footer>
);
