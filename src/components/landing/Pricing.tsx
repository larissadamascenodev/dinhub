import React from "react";
import { Check, Lock } from "lucide-react";
import { Section, Pill, H2, Sub, Card, Reveal, NEON } from "./shared";

const FEATURES = [
  "Dashboard completo",
  "Controle de transações",
  "Categorização automática com IA",
  "Scanner de recibos",
  "Radar Financeiro 24h",
  "Projeção de 12 meses",
  "Saúde Financeira com score",
  "Assistente Huby com IA",
  "Controle de faturas e parcelas",
  "Alertas inteligentes",
  "Suporte prioritário",
  "Cancelamento quando quiser",
  "3 dias grátis para experimentar",
];

type Plan = "mensal" | "anual";

export const Pricing: React.FC<{ onCta: () => void }> = ({ onCta }) => {
  const [plan, setPlan] = React.useState<Plan>("anual");

  return (
    <Section id="precos">
      <Reveal>
        <div className="text-center mx-auto max-w-[820px]">
          <Pill>Planos</Pill>
          <H2 className="mt-5">
            Tudo que você precisa para <span style={{ color: NEON }}>ter controle total.</span>
          </H2>
          <Sub className="mt-4">Um único lugar para organizar suas finanças, tomar melhores decisões e conquistar seus objetivos.</Sub>
        </div>
      </Reveal>

      {/* Mobile toggle */}
      <div className="mt-10 flex lg:hidden justify-center">
        <div className="inline-flex rounded-full p-1 border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          {(["mensal", "anual"] as Plan[]).map((p) => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className="rounded-full px-5 py-2 text-sm font-bold capitalize transition-all"
              style={{
                background: plan === p ? NEON : "transparent",
                color: plan === p ? "#000" : "rgba(255,255,255,0.7)",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <Reveal delay={0.1}>
        {/* Desktop: both side by side */}
        <div className="mt-10 hidden lg:grid grid-cols-2 gap-6">
          <PlanCard kind="mensal" onCta={onCta} />
          <PlanCard kind="anual" onCta={onCta} highlight />
        </div>
        {/* Mobile: one at a time */}
        <div className="mt-8 lg:hidden">
          <PlanCard kind={plan} onCta={onCta} highlight={plan === "anual"} />
        </div>
      </Reveal>
    </Section>
  );
};

const PlanCard: React.FC<{ kind: Plan; onCta: () => void; highlight?: boolean }> = ({ kind, onCta, highlight }) => {
  const isAnual = kind === "anual";
  return (
    <Card
      className="p-6 lg:p-7 relative"
      style={highlight ? { borderColor: `${NEON}66`, boxShadow: `0 0 40px ${NEON}22` } : undefined}
    >
      {isAnual && (
        <span className="absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-bold" style={{ background: NEON, color: "#000" }}>
          + Mais econômico
        </span>
      )}
      <p className="text-white/50 text-xs uppercase tracking-[0.18em] font-bold">Plano</p>
      <h3 className="font-display font-extrabold mt-2 capitalize" style={{ color: isAnual ? NEON : "#fff", fontSize: "clamp(1.6rem, 2.2vw, 2rem)" }}>
        {kind}
      </h3>
      <p className="font-display font-extrabold mt-2" style={{ color: isAnual ? NEON : "#fff", fontSize: "clamp(1.7rem, 2.4vw, 2.2rem)" }}>
        R$ {isAnual ? "14,90" : "24,90"} <span className="text-white/40 text-base font-normal">/mês</span>
      </p>
      {isAnual && (
        <>
          <p className="text-white/40 text-sm line-through mt-1">R$ 298,80/ano</p>
          <div className="mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: "rgba(0,230,118,0.12)", color: NEON, border: `1px solid ${NEON}33` }}>
            Você economiza R$ 120,00 por ano
          </div>
        </>
      )}

      <div className="my-5 h-px bg-white/8" />

      <ul className="grid gap-2.5 text-sm">
        {FEATURES.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-white/85">
            <span className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(0,230,118,0.12)", color: NEON, border: `1px solid ${NEON}44` }}>
              <Check size={12} strokeWidth={3} />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onCta}
        className={`mt-7 w-full rounded-full py-3.5 font-bold transition-all ${isAnual ? "text-black hover:scale-[1.02]" : "text-white border border-white/20 bg-white/[0.03] hover:bg-white/[0.08]"}`}
        style={isAnual ? { background: NEON, boxShadow: `0 0 30px ${NEON}55` } : undefined}
      >
        Começar grátis
      </button>
      <p className="text-white/50 text-xs text-center mt-3 flex items-center justify-center gap-1.5">
        {isAnual ? <><Lock size={11} /> Cobrança anual de R$ 178,80</> : "Sem cobrança nos primeiros 3 dias."}
      </p>
    </Card>
  );
};
