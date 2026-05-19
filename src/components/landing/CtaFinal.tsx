import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Section, Pill, Reveal, NEON } from "./shared";
import huby from "@/assets/huby-character.png";

export const CtaFinal: React.FC<{ onCta: () => void }> = ({ onCta }) => {
  return (
    <Section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 100%, ${NEON}33 0%, transparent 60%)` }} />
      <div className="relative">
        <Reveal>
          <div className="text-center">
            <Pill><Sparkles size={12} /> Huby · Sua assistente financeira</Pill>
            <h2 className="font-display font-extrabold text-white mt-6 leading-[1.05]" style={{ fontSize: "clamp(2rem, 5vw, 4.2rem)" }}>
              Controle hoje.<br />
              <span style={{ color: NEON }}>Mais liberdade amanhã.</span>
            </h2>
            <p className="mt-5 text-[#a0a0a0] max-w-[640px] mx-auto" style={{ fontSize: "clamp(1rem, 1.3vw, 1.18rem)" }}>
              No DinHub, você organiza, entende e acompanha seu dinheiro de forma simples, clara e inteligente.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-10 grid sm:grid-cols-3 gap-4 max-w-[820px] mx-auto">
            {[
              ["Você registra.", "O DinHub organiza."],
              ["Você entende.", "O DinHub te mostra."],
              ["Você decide.", "O DinHub te acompanha."],
            ].map(([a, b]) => (
              <div key={a} className="rounded-2xl p-5 text-center" style={{ background: "#111111", border: `1px solid ${NEON}22` }}>
                <p className="text-white font-bold">{a}</p>
                <p className="font-bold mt-1" style={{ color: NEON }}>{b}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mt-10 flex flex-col items-center">
            <button
              onClick={onCta}
              className="inline-flex items-center gap-2 rounded-full font-bold text-black transition-all hover:scale-[1.03]"
              style={{
                background: NEON,
                padding: "clamp(1rem, 1.6vw, 1.3rem) clamp(1.8rem, 3vw, 2.6rem)",
                fontSize: "clamp(1rem, 1.3vw, 1.2rem)",
                boxShadow: `0 0 40px ${NEON}66`,
                animation: "ctaGlow 2.4s ease-in-out infinite",
              }}
            >
              Começar agora — é grátis <ArrowRight size={20} />
            </button>
            <p className="text-white/55 text-sm mt-4">Sem cartão de crédito. 3 dias grátis. Cancele quando quiser.</p>

            <div className="relative mt-10">
              <img src={huby} alt="Huby" style={{ width: "clamp(180px, 24vw, 280px)", animation: "hubyFloat 4s ease-in-out infinite" }} />
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 rounded-full" style={{ width: "75%", height: "28px", background: `radial-gradient(ellipse, ${NEON}88, transparent 70%)`, filter: "blur(14px)" }} />
            </div>
          </div>
        </Reveal>
      </div>

      <style>{`@keyframes ctaGlow { 0%,100%{box-shadow:0 0 30px ${NEON}55} 50%{box-shadow:0 0 60px ${NEON}99} }`}</style>
    </Section>
  );
};

export const Footer: React.FC = () => (
  <footer className="border-t border-white/[0.06] py-10">
    <div className="mx-auto text-center" style={{ maxWidth: "1320px", paddingLeft: "clamp(1.25rem, 4vw, 3rem)", paddingRight: "clamp(1.25rem, 4vw, 3rem)" }}>
      <p className="font-display font-extrabold text-white text-2xl">Din<span style={{ color: NEON }}>Hub</span></p>
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
