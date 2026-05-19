import React from "react";
import { ArrowRight, PieChart, LayoutGrid, Target, Bell, TrendingUp, Wallet, Bell as BellIcon, Flame } from "lucide-react";
import { Section, Pill, H2, Sub, Card, Reveal, NEON } from "./shared";

const bullets = [
  { icon: <PieChart size={18} />, title: "Visão geral em tempo real", desc: "Receitas, despesas e saldo sempre atualizados." },
  { icon: <LayoutGrid size={18} />, title: "Gastos por categoria", desc: "Entenda para onde seu dinheiro vai e encontre oportunidades." },
  { icon: <Target size={18} />, title: "Metas e desafios", desc: "Acompanhe seu progresso e mantenha o foco no que realmente importa." },
  { icon: <Bell size={18} />, title: "Alertas inteligentes", desc: "Receba avisos personalizados e evite surpresas no final do mês." },
];

const categories = [
  { name: "Eletrônicos", value: "R$ 442,49", pct: "27%", color: "#a855f7" },
  { name: "Consórcio", value: "R$ 293,57", pct: "18%", color: "#f59e0b" },
  { name: "Delivery", value: "R$ 245,90", pct: "15%", color: "#ef4444" },
  { name: "Supermercado", value: "R$ 211,30", pct: "13%", color: "#3b82f6" },
];

export const DashboardOverview: React.FC = () => {
  return (
    <Section id="como-funciona">
      <div className="grid lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-16 items-center">
        <Reveal>
          <Pill>Sua central financeira</Pill>
          <H2 className="mt-5">
            Uma visão completa do que importa:<br />
            <span style={{ color: NEON }}>o seu dinheiro.</span>
          </H2>
          <Sub className="mt-4 max-w-[520px]">
            A Dashboard do DinHub reúne tudo que você precisa em um só lugar para entender, controlar e evoluir suas finanças todos os dias.
          </Sub>
          <div className="mt-7 grid gap-5">
            {bullets.map((b, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-11 w-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(0,230,118,0.1)", color: NEON, border: "1px solid rgba(0,230,118,0.25)" }}>
                  {b.icon}
                </div>
                <div>
                  <h3 className="text-white font-bold" style={{ fontSize: "clamp(1rem, 1.15vw, 1.1rem)" }}>{b.title}</h3>
                  <p className="text-[#a0a0a0] text-sm mt-1 max-w-[420px]">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <a href="#" className="mt-8 inline-flex items-center gap-2 font-bold" style={{ color: NEON, fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)" }}>
            Conheça o DinHub <ArrowRight size={18} />
          </a>
        </Reveal>

        <Reveal delay={0.1}>
          <PhoneMockup />
        </Reveal>
      </div>
    </Section>
  );
};

const PhoneMockup: React.FC = () => (
  <div className="relative mx-auto" style={{ maxWidth: "min(85vw, 380px)" }}>
    {/* Floating cards (desktop only positioned around) */}
    <FloatCard className="hidden lg:flex absolute -left-8 top-16 w-[200px]" delay={0.2}>
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,230,118,0.12)", color: NEON }}>
          <TrendingUp size={18} />
        </div>
        <div>
          <p className="text-white/60 text-[11px]">Receita no mês</p>
          <p className="text-white font-bold text-sm">R$ 1.460,36</p>
        </div>
      </div>
      <p className="mt-2 text-[10px]" style={{ color: NEON }}>+18% vs. Abril</p>
    </FloatCard>

    <FloatCard className="hidden lg:flex absolute -left-12 bottom-32 w-[220px]" delay={0.3}>
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}>
          <Target size={18} />
        </div>
        <div>
          <p className="text-white/60 text-[11px]">Meta de economia</p>
          <p className="text-white font-bold text-sm">R$ 2.000,00</p>
        </div>
      </div>
      <div className="mt-2 h-1 rounded-full bg-white/8 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: "68%", background: NEON }} />
      </div>
      <p className="mt-1 text-[10px]" style={{ color: NEON }}>68%</p>
    </FloatCard>

    <FloatCard className="hidden lg:flex absolute -right-10 top-24 w-[210px]" delay={0.4}>
      <div className="flex items-start gap-2">
        <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(0,230,118,0.12)", color: NEON }}>
          <BellIcon size={16} />
        </div>
        <div>
          <p className="text-white font-bold text-xs">Alerta de gasto</p>
          <p className="text-white/60 text-[11px] mt-1">Você ultrapassou o limite de <span style={{ color: NEON }}>delivery</span> este mês.</p>
        </div>
      </div>
    </FloatCard>

    <FloatCard className="hidden lg:flex absolute -right-8 bottom-24 w-[200px]" delay={0.5}>
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,230,118,0.12)", color: NEON }}>
          <Wallet size={18} />
        </div>
        <div>
          <p className="text-white/60 text-[11px]">Saldo atual</p>
          <p className="text-white font-bold text-sm">R$ 713,30</p>
        </div>
      </div>
      <p className="mt-2 text-[10px]" style={{ color: NEON }}>Atualizado agora</p>
    </FloatCard>

    {/* Phone */}
    <div
      className="relative mx-auto rounded-[44px] p-3"
      style={{
        background: "linear-gradient(145deg,#1c1c1c,#0a0a0a)",
        border: "1px solid #2a2a2a",
        boxShadow: `0 40px 80px -20px rgba(0,0,0,0.7), 0 0 60px ${NEON}22`,
      }}
    >
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 h-6 w-28 rounded-full bg-black" />
      <div className="rounded-[34px] bg-[#0a0a0a] overflow-hidden p-4 pt-9" style={{ aspectRatio: "9/19" }}>
        {/* App content */}
        <div className="flex items-center justify-between">
          <span className="font-display font-extrabold text-white text-lg">Din<span style={{ color: NEON }}>Hub</span></span>
          <div className="flex gap-1.5 items-center">
            <div className="relative">
              <BellIcon size={16} className="text-white/70" />
              <span className="absolute -top-1 -right-1 text-[8px] font-bold rounded-full px-1" style={{ background: NEON, color: "#000" }}>1</span>
            </div>
            <Flame size={16} className="text-orange-400" />
            <span className="text-orange-400 text-[10px] font-bold">2</span>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-white text-sm font-bold">Bom dia, Larissa</p>
          <p className="text-white/40 text-[10px]">Terça-feira, 12 de maio</p>
        </div>
        <div className="mt-2 flex gap-1.5 text-[10px]">
          {["Abr", "Mai", "Jun"].map((m) => (
            <span key={m} className={`px-2.5 py-1 rounded-full ${m === "Mai" ? "bg-white/10 text-white font-bold" : "text-white/40"}`}>{m}</span>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.02] p-3">
          <p className="text-white/50 text-[9px] uppercase tracking-wider">⚖ Saldo Disponível</p>
          <p className="text-white font-extrabold mt-1" style={{ fontSize: "clamp(1.3rem, 2vw, 1.7rem)" }}>R$ 713,30</p>
          <p className="text-[9px] mt-1"><span className="text-white/50">• Previsto no final do mês</span> <span style={{ color: NEON }} className="font-bold">R$ 341,87</span></p>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-[#00e676]/30 bg-[#00e676]/5 p-2">
            <p className="text-[9px]" style={{ color: NEON }}>↗ RECEITAS</p>
            <p className="text-white font-bold text-xs mt-0.5">R$ 1.959,03</p>
          </div>
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-2">
            <p className="text-[9px] text-red-400">↘ DESPESAS</p>
            <p className="text-white font-bold text-xs mt-0.5">R$ 1.782,16</p>
          </div>
        </div>
        <div className="mt-2 flex justify-around text-[8px] text-white/60">
          {["Carteira","Balanço","Projeções","Metas","Desafios"].map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-white/8 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-[9px]">Gastos por categoria · Maio</span>
            <span className="text-[9px]" style={{ color: NEON }}>Análise completa ›</span>
          </div>
          <p className="text-white font-bold text-sm mt-1">R$ 1.654,62</p>
          <div className="mt-2 flex gap-1">
            {["#a855f7","#a855f7","#ef4444","#3b82f6","#3b82f6"].map((c,i)=>(<div key={i} className="h-1.5 flex-1 rounded-full" style={{background:c}}/>))}
          </div>
          <div className="mt-2 space-y-1.5">
            {categories.map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
                  <span className="text-white text-[10px]">{c.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-white text-[10px] font-bold">{c.value}</p>
                  <p className="text-white/40 text-[8px]">{c.pct}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Mobile floating cards grid */}
    <div className="lg:hidden mt-6 grid grid-cols-2 gap-3">
      <SmallStat icon={<TrendingUp size={16} />} label="Receita no mês" value="R$ 1.460,36" hint="+18%" />
      <SmallStat icon={<Target size={16} />} label="Meta" value="R$ 2.000,00" hint="68%" />
      <SmallStat icon={<BellIcon size={16} />} label="Alerta" value="Delivery" hint="Limite" />
      <SmallStat icon={<Wallet size={16} />} label="Saldo atual" value="R$ 713,30" hint="Agora" />
    </div>
  </div>
);

const FloatCard: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = "", delay = 0 }) => (
  <div
    className={`flex flex-col rounded-2xl p-3 ${className}`}
    style={{
      background: "rgba(17,17,17,0.9)",
      backdropFilter: "blur(14px)",
      border: `1px solid ${NEON}33`,
      boxShadow: `0 0 20px ${NEON}22`,
      animation: `floatY 4s ${delay}s ease-in-out infinite`,
    }}
  >
    {children}
    <style>{`@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
  </div>
);

const SmallStat: React.FC<{ icon: React.ReactNode; label: string; value: string; hint: string }> = ({ icon, label, value, hint }) => (
  <div className="rounded-xl p-3" style={{ background: "rgba(17,17,17,0.9)", border: `1px solid ${NEON}22` }}>
    <div className="flex items-center gap-2">
      <span style={{ color: NEON }}>{icon}</span>
      <span className="text-white/60 text-[11px]">{label}</span>
    </div>
    <p className="text-white font-bold text-sm mt-1">{value}</p>
    <p className="text-[10px]" style={{ color: NEON }}>{hint}</p>
  </div>
);
