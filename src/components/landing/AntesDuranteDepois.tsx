import React from "react";
import { X, Zap, CheckCircle2, Rocket, TrendingUp } from "lucide-react";
import { Section, H2, Sub, Card, Reveal, NEON } from "./shared";
import huby from "@/assets/huby-character.png";

export const AntesDuranteDepois: React.FC = () => {
  return (
    <Section>
      <Reveal>
        <div className="text-center">
          <p className="font-display font-extrabold text-white" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.8rem)", letterSpacing: "0.02em" }}>
            ANTES, DURANTE E DEPOIS.
          </p>
          <p className="font-display font-extrabold" style={{ color: NEON, fontSize: "clamp(1.6rem, 3.2vw, 2.8rem)", letterSpacing: "0.02em" }}>
            O CONTROLE QUE MUDA TUDO.
          </p>
          <Sub className="mt-4 max-w-[640px] mx-auto">Do caos à clareza financeira com a inteligência da Huby.</Sub>
        </div>
      </Reveal>

      <div className="mt-12 grid lg:grid-cols-3 gap-5">
        {/* ANTES */}
        <Reveal>
          <Card className="p-6 h-full flex flex-col" style={{ borderColor: "rgba(239,68,68,0.35)" }}>
            <div className="inline-flex self-start items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-red-400">
              <X size={14} /> Antes
            </div>
            <h3 className="text-white font-bold mt-4" style={{ fontSize: "clamp(1.1rem, 1.4vw, 1.4rem)" }}>Desorganização que pesa.</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {["Contas misturadas", "Gastos sem controle", "Surpresas no fim do mês", "Sensação de estar perdido"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-white/75">
                  <X size={14} className="text-red-400 shrink-0" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2">
              {[
                { name: "Cartão de crédito", value: "-R$ 1.324,50" },
                { name: "Compras online", value: "-R$ 238,90" },
                { name: "Delivery", value: "-R$ 67,80" },
                { name: "Conta de luz", value: "-R$ 189,60" },
              ].map((t) => (
                <div key={t.name} className="flex justify-between text-xs rounded-lg px-3 py-2" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <span className="text-white/75">{t.name}</span>
                  <span className="text-red-400 font-bold">{t.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        {/* DURANTE */}
        <Reveal delay={0.1}>
          <Card className="p-6 h-full flex flex-col relative" style={{ borderColor: `${NEON}66`, boxShadow: `0 0 40px ${NEON}22` }}>
            <div className="inline-flex self-start items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider" style={{ background: "rgba(0,230,118,0.12)", color: NEON, border: `1px solid ${NEON}55` }}>
              <Zap size={14} /> Durante
            </div>
            <h3 className="text-white font-bold mt-4" style={{ fontSize: "clamp(1.1rem, 1.4vw, 1.4rem)" }}>Inteligência que coloca tudo no lugar.</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {["Conecta todas as suas contas", "Categoriza e organiza por você", "Mostra para onde seu dinheiro vai", "Gera insights e te orienta"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-white/85">
                  <CheckCircle2 size={14} style={{ color: NEON }} className="shrink-0" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-xl p-3 text-xs" style={{ background: "#0e0e0e", border: `1px solid ${NEON}33` }}>
              <p className="text-white/60 text-[10px] uppercase tracking-wider">Visão geral</p>
              <p className="text-white/50 text-[10px] mt-2">Saldo disponível</p>
              <p className="text-white font-extrabold">R$ 7.892,41</p>
              <p style={{ color: NEON }} className="text-[10px] font-bold">+ R$ 1.257,30 este mês</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
                <div><p className="text-white/50">Receitas</p><p style={{ color: NEON }} className="font-bold">R$ 9.150,00</p></div>
                <div><p className="text-white/50">Despesas</p><p className="text-red-400 font-bold">R$ 6.233,59</p></div>
              </div>
              <div className="mt-2 pt-2 border-t border-white/5">
                <p style={{ color: NEON }} className="text-[10px] font-bold">Insights da Huby:</p>
                <p className="text-white/70 text-[10px] mt-0.5">Você gastou 23% a menos com delivery este mês. Continue assim!</p>
              </div>
            </div>
          </Card>
        </Reveal>

        {/* DEPOIS */}
        <Reveal delay={0.2}>
          <Card className="p-6 h-full flex flex-col" style={{ borderColor: `${NEON}33` }}>
            <div className="inline-flex self-start items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider" style={{ background: "rgba(0,230,118,0.08)", color: NEON, border: `1px solid ${NEON}33` }}>
              <CheckCircle2 size={14} /> Depois
            </div>
            <h3 className="text-white font-bold mt-4" style={{ fontSize: "clamp(1.1rem, 1.4vw, 1.4rem)" }}>Clareza que traz liberdade.</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {["Visão completa das finanças", "Decisões melhores todos os dias", "Mais economia e tranquilidade", "Liberdade para viver o que importa"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-white/85">
                  <CheckCircle2 size={14} style={{ color: NEON }} className="shrink-0" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-xl p-4" style={{ background: "rgba(0,230,118,0.06)", border: `1px solid ${NEON}33` }}>
              <p className="text-white/70 text-xs">Economia este mês</p>
              <p className="font-extrabold mt-1" style={{ color: NEON, fontSize: "clamp(1.3rem, 2vw, 1.7rem)" }}>R$ 1.257,30</p>
              <p className="text-white/55 text-[11px] mt-1">+ controle, + liberdade</p>
              <div className="mt-3 flex items-end gap-1 h-12">
                {[30, 45, 35, 60, 50, 75, 90].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: NEON, opacity: 0.4 + (i / 7) * 0.6 }} />
                ))}
              </div>
            </div>
            <div className="depois-bg-man mt-5 rounded-xl flex-1 min-h-[100px] relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0e2a18 0%, #0a0a0a 100%)" }}>
              <p className="absolute top-2 left-2 text-[10px] text-white/40">{/* SUBSTITUIR pelo asset do homem feliz */}</p>
            </div>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.3}>
        <div className="mt-10 grid sm:grid-cols-2 gap-5">
          <p className="text-white/75 flex items-start gap-2" style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)" }}>
            <Rocket size={20} style={{ color: NEON }} className="shrink-0 mt-1" />
            O futuro das suas finanças começa com uma decisão. <strong className="text-white">DinHub: inteligência financeira que trabalha por você.</strong>
          </p>
          <p className="text-right text-white/75" style={{ fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)" }}>
            Mais controle. Menos preocupação. <span style={{ color: NEON }} className="font-bold">Mais você.</span>
          </p>
        </div>
      </Reveal>
    </Section>
  );
};
