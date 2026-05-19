import React from "react";
import { Bot, CreditCard, Target, Heart, TrendingUp, FileText, Bell, Calendar, Check, Lock } from "lucide-react";
import { Section, Pill, H2, Sub, Card, Reveal, NEON } from "./shared";

const features = [
  { icon: <Bot size={18} />, title: "IA Financeira", desc: "Assistente inteligente que analisa seus dados e te ajuda a tomar melhores decisões." },
  { icon: <CreditCard size={18} />, title: "Parcelamentos Inteligentes", desc: "Acompanhe todas as suas parcelas em um só lugar e saiba o impacto no seu orçamento." },
  { icon: <Target size={18} />, title: "Radar de Gastos", desc: "Identifique para onde seu dinheiro vai e descubra oportunidades para economizar mais." },
  { icon: <Heart size={18} />, title: "Saúde Financeira", desc: "Score personalizado e insights práticos para melhorar sua vida financeira." },
  { icon: <TrendingUp size={18} />, title: "Projeções de Saldo", desc: "Veja para frente e planeje seu futuro com cenários e projeções inteligentes." },
  { icon: <FileText size={18} />, title: "OCR de Recibos", desc: "Digitalize recibos e extratos para manter tudo organizado automaticamente." },
  { icon: <Bell size={18} />, title: "Alertas Inteligentes", desc: "Receba avisos importantes antes que virem problemas no seu bolso." },
  { icon: <Calendar size={18} />, title: "Planejamento Mensal", desc: "Crie orçamentos, defina metas e acompanhe seu progresso mês a mês." },
];

const benefits = [
  "Acesso completo a todas as funcionalidades",
  "Atualizações constantes e novos recursos",
  "Suporte prioritário",
  "Cancelamento quando quiser, sem burocracia",
  "Comece grátis por 3 dias",
];

export const Pricing: React.FC<{ onCta: () => void }> = ({ onCta }) => {
  return (
    <Section id="precos">
      <Reveal>
        <Pill>Planos</Pill>
        <H2 className="mt-5 max-w-[820px]">
          Tudo que você precisa para <span style={{ color: NEON }}>ter controle total.</span>
        </H2>
        <Sub className="mt-4 max-w-[640px]">Um único lugar para organizar suas finanças, tomar melhores decisões e conquistar seus objetivos.</Sub>
      </Reveal>

      <div className="mt-12 grid lg:grid-cols-[1fr_1fr] gap-10">
        <Reveal delay={0.1}>
          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(0,230,118,0.1)", color: NEON, border: `1px solid ${NEON}33` }}>{f.icon}</div>
                <div>
                  <h4 className="text-white font-bold text-sm">{f.title}</h4>
                  <p className="text-white/55 text-xs mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl px-4 py-3 flex items-center gap-3 text-xs" style={{ background: "#0e0e0e", border: `1px solid ${NEON}22` }}>
            <Lock size={14} style={{ color: NEON }} />
            <span className="text-white/70">Seus dados protegidos com criptografia de nível bancário.</span>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="grid gap-5">
            {/* Monthly */}
            <Card className="p-7">
              <p className="text-white/50 text-xs uppercase tracking-[0.18em] font-bold">Plano</p>
              <h3 className="font-display font-extrabold text-white mt-2" style={{ fontSize: "clamp(1.6rem, 2.2vw, 2rem)" }}>Mensal</h3>
              <p className="font-display font-extrabold text-white mt-2" style={{ fontSize: "clamp(1.7rem, 2.4vw, 2.2rem)" }}>
                R$ 24,90 <span className="text-white/40 text-base font-normal">/mês</span>
              </p>
              <div className="my-5 h-px bg-white/8" />
              <ul className="space-y-2.5 text-sm">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-white/85">
                    <Check size={16} style={{ color: NEON }} className="shrink-0 mt-0.5" /> {b}
                  </li>
                ))}
              </ul>
              <button
                onClick={onCta}
                className="mt-6 w-full rounded-full border border-white/20 bg-white/[0.03] py-3.5 font-semibold text-white hover:bg-white/[0.08] transition-colors"
              >
                Começar grátis
              </button>
              <p className="text-white/50 text-xs text-center mt-3">Sem cobrança nos primeiros 3 dias.</p>
            </Card>

            {/* Annual */}
            <Card className="p-7 relative" style={{ borderColor: `${NEON}66`, boxShadow: `0 0 40px ${NEON}22` }}>
              <span className="absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-bold" style={{ background: NEON, color: "#000" }}>+ Mais econômico</span>
              <p className="text-white/50 text-xs uppercase tracking-[0.18em] font-bold">Plano</p>
              <h3 className="font-display font-extrabold mt-2" style={{ color: NEON, fontSize: "clamp(1.6rem, 2.2vw, 2rem)" }}>Anual</h3>
              <p className="font-display font-extrabold mt-2" style={{ color: NEON, fontSize: "clamp(1.7rem, 2.4vw, 2.2rem)" }}>
                R$ 14,90 <span className="text-white/50 text-base font-normal">/mês</span>
              </p>
              <p className="text-white/40 text-sm line-through mt-1">R$ 298,80/ano</p>
              <div className="mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: "rgba(0,230,118,0.12)", color: NEON, border: `1px solid ${NEON}33` }}>
                Você economiza R$ 120,00 por ano
              </div>
              <div className="my-5 h-px bg-white/8" />
              <ul className="space-y-2.5 text-sm">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-white/85">
                    <Check size={16} style={{ color: NEON }} className="shrink-0 mt-0.5" /> {b}
                  </li>
                ))}
              </ul>
              <button
                onClick={onCta}
                className="mt-6 w-full rounded-full py-4 font-bold text-black transition-all hover:scale-[1.02]"
                style={{ background: NEON, fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)", boxShadow: `0 0 30px ${NEON}55` }}
              >
                Começar grátis
              </button>
              <p className="text-white/50 text-xs text-center mt-3 flex items-center justify-center gap-1.5"><Lock size={11} /> Cobrança anual de R$ 178,80</p>
            </Card>
          </div>
        </Reveal>
      </div>
    </Section>
  );
};
