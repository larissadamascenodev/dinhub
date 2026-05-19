import React from "react";
import { Sparkles, TrendingUp, DollarSign, Camera, Calendar, AlertCircle, BarChart3, Heart, Radar, Shield, Lock, CheckCircle2 } from "lucide-react";
import { Section, Pill, H2, Sub, Card, Reveal, NEON } from "./shared";
import huby from "@/assets/huby-character.png";

const quickQs = [
  { icon: <TrendingUp size={14} />, label: "Quanto posso investir este mês?" },
  { icon: <DollarSign size={14} />, label: "Onde estou gastando demais?" },
  { icon: <Camera size={14} />, label: "Como sair das dívidas mais rápido?" },
  { icon: <Calendar size={14} />, label: "Quais contas vão vencer?" },
];

const insights = [
  { color: NEON, bg: "rgba(0,230,118,0.12)", icon: <TrendingUp size={16} />, text: <>Você gastou <span style={{ color: NEON }} className="font-bold">18% a mais com delivery</span> do que no mês passado.</>, tag: "Alimentação" },
  { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: <AlertCircle size={16} />, text: <>3 assinaturas somam <span className="text-orange-400 font-bold">R$ 79,90/mês</span> e quase não são usadas.</>, tag: "Assinaturas" },
  { color: "#a855f7", bg: "rgba(168,85,247,0.12)", icon: <BarChart3 size={16} />, text: <>Se investir R$ 300/mês, pode acumular <span style={{ color: NEON }} className="font-bold">R$ 31.723,41</span> em 5 anos.</>, tag: "Investimentos" },
];

const actions = [
  { icon: <Calendar size={16} />, color: NEON, title: "Cancelar assinaturas não utilizadas", sub: "Economize até R$ 79,90/mês", value: "R$ 79,90", valueColor: NEON },
  { icon: <Sparkles size={16} />, color: NEON, title: "Reduzir gastos com delivery", sub: "Meta sugerida: R$ 250,00/mês", value: "R$ 180,00", valueColor: NEON },
  { icon: <Camera size={16} />, color: "#f59e0b", title: "Quitar dívida do cartão", sub: "Reduza juros e libere limite", value: "R$ 1.247,36", valueColor: "#f59e0b" },
  { icon: <BarChart3 size={16} />, color: NEON, title: "Investir com recorrência", sub: "Comece com R$ 300,00/mês", value: "R$ 300,00", valueColor: NEON },
];

export const HubySection: React.FC = () => {
  return (
    <Section id="funcionalidades">
      {/* PART A — Huby */}
      <div className="grid lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-14 items-start">
        <Reveal>
          <Pill><Sparkles size={12} /> Huby · Sua assistente financeira</Pill>
          <H2 className="mt-5">
            Pergunte. Entenda.<br />
            <span style={{ color: NEON }}>E tome decisões melhores.</span>
          </H2>
          <Sub className="mt-4 max-w-[520px]">
            A Huby transforma dados em clareza. Faça perguntas sobre seu dinheiro, receba respostas práticas e descubra o que realmente importa.
          </Sub>

          <div className="mt-6 grid sm:grid-cols-2 gap-2.5">
            {quickQs.map((q, i) => (
              <button
                key={i}
                className="text-left rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-white/85 text-sm transition-all hover:border-[#00e676]/40 hover:bg-[#00e676]/5 flex items-center gap-2"
              >
                <span style={{ color: NEON }}>{q.icon}</span> {q.label}
              </button>
            ))}
          </div>

          {/* Mascot + speech */}
          <div className="mt-10 flex items-end gap-4 justify-center sm:justify-start">
            <div className="relative">
              <img
                src={huby}
                alt="Huby"
                className="relative z-10 object-contain"
                style={{ width: "clamp(180px, 22vw, 260px)", height: "auto", animation: "hubyFloat 4s ease-in-out infinite" }}
              />
              <div
                className="absolute left-1/2 -translate-x-1/2 -bottom-2 rounded-full"
                style={{
                  width: "70%",
                  height: "30px",
                  background: `radial-gradient(ellipse, ${NEON}66 0%, transparent 70%)`,
                  filter: "blur(12px)",
                  animation: "hubyGlow 3s ease-in-out infinite",
                }}
              />
            </div>
            <div
              className="relative rounded-2xl px-4 py-3 max-w-[240px] mb-8"
              style={{ background: "rgba(17,17,17,0.95)", border: `1px solid ${NEON}55`, boxShadow: `0 0 24px ${NEON}22` }}
            >
              <p className="text-white text-sm leading-relaxed">
                Olá! Eu sou a <span style={{ color: NEON }} className="font-bold">Huby, sua assistente financeira</span>.
              </p>
              <p className="text-white/60 text-xs mt-2">Em que posso te ajudar?</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="p-5 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,230,118,0.15)", color: NEON }}>
                <Sparkles size={16} />
              </div>
              <h3 className="text-white font-bold">Insights da Huby</h3>
            </div>
            <div className="space-y-2.5">
              {insights.map((ins, i) => (
                <div key={i} className="rounded-xl p-3.5 flex items-start gap-3" style={{ background: "#0e0e0e", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: ins.bg, color: ins.color }}>
                    {ins.icon}
                  </div>
                  <p className="text-white/85 text-sm flex-1 leading-snug">{ins.text}</p>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/60 font-semibold whitespace-nowrap">{ins.tag}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-white/5 flex items-center justify-between">
              <h4 className="text-white font-bold">Ações sugeridas pela Huby</h4>
              <a href="#" className="text-sm font-semibold" style={{ color: NEON }}>Ver todas</a>
            </div>
            <div className="mt-3 space-y-2">
              {actions.map((a, i) => (
                <div key={i} className="rounded-xl px-3.5 py-3 flex items-center gap-3 hover:bg-white/[0.03] transition-colors cursor-pointer" style={{ background: "#0e0e0e", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${a.color}1a`, color: a.color }}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{a.title}</p>
                    <p className="text-white/50 text-xs">{a.sub}</p>
                  </div>
                  <span className="font-bold text-sm whitespace-nowrap" style={{ color: a.valueColor }}>{a.value} ›</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <p className="text-white/60 text-xs flex items-center gap-2"><Sparkles size={12} style={{ color: NEON }} /> Huby aprende com você e melhora a cada dia.</p>
              <a href="#" className="text-xs font-semibold text-white/70">Como funciona</a>
            </div>
          </Card>
        </Reveal>
      </div>

      {/* PART B — 3 IA Tools */}
      <div className="mt-24 lg:mt-32">
        <Reveal>
          <div className="text-center max-w-[820px] mx-auto">
            <Pill>3 Ferramentas, controle total</Pill>
            <H2 className="mt-5">
              Tudo o que você precisa para tomar<br />
              <span style={{ color: NEON }}>decisões melhores.</span>
            </H2>
            <Sub className="mt-4">
              O DinHub reúne inteligência e praticidade em três ferramentas poderosas que trabalham juntas para transformar sua vida financeira.
            </Sub>
          </div>
        </Reveal>

        <div className="mt-12 grid lg:grid-cols-3 gap-5">
          <ToolCard
            icon={<Radar size={22} />}
            title="Radar Financeiro"
            highlight="oportunidades"
            description="evite desperdícios."
            longText="A IA monitora suas finanças 24h por dia e te alerta sobre riscos e oportunidades."
            mockup={<RadarMockup />}
            alertTitle="Alerta detectado"
            alertText="Gastos com delivery acima do normal"
            footer="Detectamos aumento de gastos em Delivery nos últimos 7 dias."
          />
          <ToolCard
            icon={<BarChart3 size={22} />}
            title="Projeção Financeira"
            highlight="futuro"
            description="planeje hoje, realize amanhã."
            longText="Simule cenários, visualize seu futuro financeiro e planeje com confiança."
            mockup={<ProjectionMockup />}
            alertTitle="Projeção positiva"
            alertText="Mantendo o ritmo atual, você pode chegar a R$ 8.750 em Setembro."
            green
          />
          <ToolCard
            icon={<Heart size={22} />}
            title="Saúde Financeira"
            highlight="melhore"
            description="seus resultados."
            longText="Acompanhe seu score financeiro e receba dicas personalizadas para evoluir sempre."
            mockup={<HealthMockup />}
            alertTitle="Dica personalizada"
            alertText="Reduza gastos com lazer para aumentar sua poupança mensal."
            green
            checkAlert
          />
        </div>

        <Reveal delay={0.2}>
          <div className="mt-8 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ background: "#0e0e0e", border: `1px solid ${NEON}22` }}>
            <div className="flex items-center gap-3">
              <Shield size={18} style={{ color: NEON }} />
              <div>
                <p className="text-white font-bold text-sm">Seus dados 100% protegidos</p>
                <p className="text-white/50 text-xs">Sincronização segura e automática com as principais instituições financeiras.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm"><Lock size={14} /> Criptografia de ponta a ponta</div>
          </div>
        </Reveal>
      </div>

      <style>{`
        @keyframes hubyFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes hubyGlow { 0%,100%{opacity:.6;transform:translateX(-50%) scale(1)} 50%{opacity:1;transform:translateX(-50%) scale(1.15)} }
      `}</style>
    </Section>
  );
};

const ToolCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  highlight: string;
  description: string;
  longText: string;
  mockup: React.ReactNode;
  alertTitle: string;
  alertText: string;
  green?: boolean;
  checkAlert?: boolean;
}> = ({ icon, title, highlight, description, longText, mockup, alertTitle, alertText, green, checkAlert }) => (
  <Card className="p-6 flex flex-col" style={{ borderColor: `${NEON}22` }}>
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ background: "rgba(0,230,118,0.12)", color: NEON, border: `1px solid ${NEON}33` }}>
        {icon}
      </div>
      <h3 className="text-white font-bold" style={{ fontSize: "clamp(1.1rem, 1.3vw, 1.3rem)" }}>{title}</h3>
    </div>
    <p className="mt-3 text-white/85" style={{ fontSize: "clamp(0.95rem, 1.05vw, 1.05rem)" }}>
      Encontre <span style={{ color: NEON }}>{highlight}</span>, {description}
    </p>
    <div className="mt-5 flex-1">{mockup}</div>
    <p className="mt-5 text-[#a0a0a0] text-sm">{longText}</p>
    <div className="mt-4 rounded-xl p-3 flex items-start gap-2.5" style={{ background: green ? "rgba(0,230,118,0.05)" : "rgba(255,255,255,0.02)", border: `1px solid ${green ? NEON+"33" : "rgba(255,255,255,0.06)"}` }}>
      {checkAlert ? <CheckCircle2 size={16} style={{ color: NEON }} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} style={{ color: NEON }} className="shrink-0 mt-0.5" />}
      <div>
        <p className="text-white font-bold text-xs" style={{ color: NEON }}>{alertTitle}</p>
        <p className="text-white/70 text-xs mt-0.5">{alertText}</p>
      </div>
    </div>
  </Card>
);

const RadarMockup: React.FC = () => (
  <div className="relative mx-auto rounded-2xl overflow-hidden flex items-center justify-center" style={{ background: "#000", border: "1px solid #1a1a1a", aspectRatio: "1/0.85", maxWidth: "300px" }}>
    <p className="absolute top-3 left-1/2 -translate-x-1/2 text-white/70 text-xs font-bold">Radar de risco</p>
    <div className="relative w-[180px] h-[180px]">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border"
          style={{
            borderColor: `${NEON}${i === 3 ? "55" : "33"}`,
            transform: `scale(${1 - i * 0.22})`,
            animation: `radarPulse 2.5s ${i * 0.4}s ease-out infinite`,
          }}
        />
      ))}
      <div className="absolute inset-0 m-auto h-2 w-2 rounded-full" style={{ background: NEON, boxShadow: `0 0 12px ${NEON}` }} />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, transparent 70%, ${NEON}66 100%)`,
          animation: "radarSweep 3s linear infinite",
          maskImage: "radial-gradient(circle, black 100%, transparent 100%)",
        }}
      />
    </div>
    <style>{`
      @keyframes radarPulse { 0%{opacity:.8} 100%{transform:scale(1.4);opacity:0} }
      @keyframes radarSweep { from{transform:rotate(0)} to{transform:rotate(360deg)} }
    `}</style>
  </div>
);

const ProjectionMockup: React.FC = () => {
  const pts = [{ m: "Mai", v: 30 }, { m: "Jun", v: 40 }, { m: "Jul", v: 55 }, { m: "Ago", v: 70 }, { m: "Set", v: 88 }];
  const w = 280, h = 140;
  const max = 100;
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${(i / (pts.length - 1)) * w} ${h - (p.v / max) * h}`).join(" ");
  return (
    <div className="relative mx-auto rounded-2xl p-3" style={{ background: "#000", border: "1px solid #1a1a1a", maxWidth: "300px" }}>
      <p className="text-white text-xs font-bold">Projeção</p>
      <p className="text-white/50 text-[10px]">Saldo projetado</p>
      <p className="font-extrabold" style={{ color: NEON, fontSize: "1.15rem" }}>R$ 8.750,00</p>
      <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full mt-2">
        <defs>
          <linearGradient id="pgrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={NEON} stopOpacity="0.4" />
            <stop offset="100%" stopColor={NEON} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill="url(#pgrad)" />
        <path d={path} fill="none" stroke={NEON} strokeWidth="2" />
        {pts.map((p, i) => (
          <circle key={i} cx={(i / (pts.length - 1)) * w} cy={h - (p.v / max) * h} r="3" fill={NEON} />
        ))}
        {pts.map((p, i) => (
          <text key={i} x={(i / (pts.length - 1)) * w} y={h + 14} fill="#666" fontSize="9" textAnchor="middle">{p.m}</text>
        ))}
      </svg>
    </div>
  );
};

const HealthMockup: React.FC = () => {
  const score = 82;
  const angle = (score / 100) * 180 - 90;
  return (
    <div className="relative mx-auto rounded-2xl p-4 flex flex-col items-center" style={{ background: "#000", border: "1px solid #1a1a1a", maxWidth: "300px" }}>
      <p className="text-white text-xs font-bold mb-2">Saúde Financeira</p>
      <svg viewBox="0 0 200 120" className="w-[200px]">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#222" strokeWidth="12" strokeLinecap="round" />
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={NEON} strokeWidth="12" strokeLinecap="round" strokeDasharray="251" strokeDashoffset={251 - (251 * score) / 100} />
        <g transform={`rotate(${angle} 100 100)`}>
          <line x1="100" y1="100" x2="100" y2="35" stroke="white" strokeWidth="2" />
          <circle cx="100" cy="100" r="6" fill="white" />
        </g>
      </svg>
      <p className="text-white font-extrabold text-3xl mt-1">82<span className="text-white/40 text-sm font-normal"> de 100</span></p>
      <p style={{ color: NEON }} className="font-bold text-sm">Muito boa</p>
      <p className="text-white/50 text-[10px] mt-1 text-center">Parabéns! Você está no caminho certo.</p>
    </div>
  );
};
