import React from "react";
import {
  ArrowRight, Zap, TrendingUp, BarChart3, ShoppingCart, Car, Shield, Bell, Wallet,
  Brain, LayoutGrid, Target, Calendar, CheckCircle2, Gamepad2, FileText, Sofa, Plane, AlertCircle,
  UtensilsCrossed, ShoppingBag, PlaySquare, Dices, FileText as ReceiptIcon, Lightbulb, Lock,
} from "lucide-react";
import { Section, Pill, H2, Sub, Card, Reveal, NEON } from "./shared";

export const FeaturesTabs: React.FC = () => {
  return (
    <Section>
      <Reveal>
        <div className="text-center max-w-[820px] mx-auto">
          <Pill>Funcionalidades</Pill>
          <H2 className="mt-5">Tudo que você precisa em um só lugar.</H2>
        </div>
      </Reveal>

      <div className="mt-12 space-y-16 lg:space-y-24">
        <CategoriasTab />
        <ScannerTab />
        <ParcelamentosTab />
      </div>
    </Section>
  );
};

/* ===================== TAB 1: TRANSAÇÕES ===================== */



/* ===================== TAB 2: CATEGORIAS ===================== */
const CategoriasTab: React.FC = () => {
  const cats = [
    { name: "Delivery", value: "R$ 842,90", pct: 21.9, color: NEON, icon: <UtensilsCrossed size={18} /> },
    { name: "Compras online", value: "R$ 731,20", pct: 19.0, color: "#a855f7", icon: <ShoppingBag size={18} /> },
    { name: "Transporte", value: "R$ 518,40", pct: 13.5, color: "#3b82f6", icon: <Car size={18} /> },
    { name: "Assinaturas", value: "R$ 184,70", pct: 4.8, color: "#f59e0b", icon: <PlaySquare size={18} /> },
    { name: "Apostas", value: "R$ 427,00", pct: 11.1, color: "#ef4444", icon: <Dices size={18} /> },
  ];
  return (
    <div className="grid lg:grid-cols-[1fr_1.15fr] gap-12 items-center min-w-0">
      <div>
        <Pill><BarChart3 size={12} /> Análise inteligente</Pill>
        <H2 className="mt-5">Entenda para onde<br /><span style={{ color: NEON }}>seu dinheiro está indo</span></H2>
        <Sub className="mt-4 max-w-[500px]">O DinHub organiza seus gastos por categoria e revela padrões que passam despercebidos. Mais clareza, menos sustos no fim do mês.</Sub>
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {[
            { icon: <Brain size={16} />, title: "Categorização automática", desc: "Nossa IA identifica e organiza seus gastos sem esforço." },
            { icon: <BarChart3 size={16} />, title: "Visão clara e completa", desc: "Veja quanto cada categoria pesa no seu mês." },
            { icon: <Bell size={16} />, title: "Alertas inteligentes", desc: "Detectamos aumentos e padrões preocupantes." },
            { icon: <Target size={16} />, title: "Decisões melhores", desc: "Informamos o que importa para você economizar de verdade." },
          ].map((f, i) => (
            <div key={i}>
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,230,118,0.1)", color: NEON, border: `1px solid ${NEON}33` }}>{f.icon}</div>
              <h4 className="text-white font-bold mt-3 text-sm">{f.title}</h4>
              <p className="text-white/55 text-xs mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <Card className="p-5 lg:p-6">
        <div className="flex items-center justify-between">
          <p className="text-white/70 text-sm">Gastos por categoria · Maio</p>
          <a href="#" style={{ color: NEON }} className="text-sm font-semibold">Análise completa ›</a>
        </div>
        <p className="text-white font-extrabold mt-3" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2.1rem)" }}>R$ 3.847,90</p>
        <div className="mt-3 flex gap-1.5">
          {cats.map((c, i) => (
            <div key={i} className="h-2 rounded-full" style={{ background: c.color, flex: c.pct }} />
          ))}
        </div>
        <div className="mt-5 space-y-3">
          {cats.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${c.color}22`, color: c.color }}>{c.icon}</div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-white text-sm font-semibold">{c.name}</span>
                  <span className="text-white text-sm font-bold">{c.value}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${c.pct * 3}%`, background: c.color }} />
                  </div>
                  <span className="text-white/50 text-xs w-12 text-right">{c.pct.toString().replace(".", ",")}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-xl p-3.5 flex items-start gap-3" style={{ background: "rgba(0,230,118,0.06)", border: `1px solid ${NEON}33` }}>
          <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(0,230,118,0.18)", color: NEON }}>
            <Lightbulb size={16} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: NEON }}>Insight do mês</p>
            <p className="text-white/80 text-xs mt-1">Você gastou <span style={{ color: NEON }}>R$ 1.574,10</span> com hábitos que podem ser reduzidos. Isso representa <span style={{ color: NEON }}>40,9%</span> do total dos seus gastos.</p>
          </div>
          <ArrowRight size={16} className="text-white/50 shrink-0 mt-1" />
        </div>
      </Card>
    </div>
  );
};

/* ===================== TAB 3: PARCELAMENTOS ===================== */
const ParcelamentosTab: React.FC = () => {
  const items = [
    { icon: <Gamepad2 size={18} />, color: "#a855f7", name: "PlayStation 5", value: "R$ 337,67", progress: 30, parcels: "3/10" },
    { icon: <FileText size={18} />, color: "#94a3b8", name: "Notebook Dell Inspiron", value: "R$ 289,90", progress: 42, parcels: "5/12" },
    { icon: <Car size={18} />, color: "#f59e0b", name: "Seguro do carro", value: "R$ 189,90", progress: 58, parcels: "7/12" },
    { icon: <Sofa size={18} />, color: NEON, name: "Sofá retrátil", value: "R$ 237,45", progress: 22, parcels: "4/18" },
    { icon: <Plane size={18} />, color: "#ec4899", name: "Viagem p/ Nordeste", value: "R$ 255,55", progress: 25, parcels: "2/8" },
  ];
  return (
    <div className="grid lg:grid-cols-[1fr_1.15fr] gap-12 items-center min-w-0">
      <div>
        <Pill tone="orange"><Calendar size={12} /> Acompanhamento de parcelamentos</Pill>
        <h2 className="mt-5 font-display font-bold text-white leading-[1.05] tracking-tight" style={{ fontSize: "clamp(2rem, 3.8vw, 3.4rem)", fontWeight: 700 }}>Todas as suas <span style={{ color: NEON }}>parcelas organizadas</span> em um só lugar.</h2>
        <Sub className="mt-4 max-w-[500px]">O DinHub acompanha cada parcelamento, mostra o que já foi pago, o que falta e o impacto no seu orçamento. Mais controle, menos surpresas.</Sub>
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {[
            { icon: <Calendar size={16} />, color: "#f59e0b", title: "Visão completa", desc: "Veja todos os parcelamentos ativos e futuros." },
            { icon: <BarChart3 size={16} />, color: "#f59e0b", title: "Impacto no orçamento", desc: "Entenda quanto das suas rendas já estão comprometidas." },
            { icon: <CheckCircle2 size={16} />, color: NEON, title: "Acompanhamento real", desc: "Saiba quanto já foi pago e quanto ainda falta." },
            { icon: <Bell size={16} />, color: NEON, title: "Alertas inteligentes", desc: "Receba avisos antes das próximas cobranças." },
          ].map((f, i) => (
            <div key={i}>
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${f.color}1a`, color: f.color, border: `1px solid ${f.color}33` }}>{f.icon}</div>
              <h4 className="text-white font-bold mt-3 text-sm">{f.title}</h4>
              <p className="text-white/55 text-xs mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl px-4 py-3 flex gap-3" style={{ background: "#0e0e0e", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}><BarChart3 size={16} /></div>
          <p className="text-white/75 text-xs">Parcelas comprometem <span style={{ color: NEON }} className="font-bold">R$ 1.279,47</span> do seu orçamento mensal, representando <span className="text-orange-400 font-bold">32%</span> da sua renda.</p>
        </div>
      </div>
      <Card className="p-5 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}><Calendar size={16} /></div>
            <h3 className="text-white font-bold">Parcelamentos Ativos</h3>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/70">18 itens</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3" style={{ background: "#0e0e0e", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-white/50 text-xs">Comprometido/mês</p>
            <p className="font-extrabold mt-1 text-lg" style={{ color: "#f59e0b" }}>R$ 1.279,47</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: "#0e0e0e", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-white/50 text-xs">Total restante</p>
            <p className="text-white font-extrabold mt-1 text-lg">R$ 8.594,01</p>
          </div>
        </div>
        <p className="text-white/60 text-xs mt-3 flex items-center gap-2">
          <span style={{ color: NEON }}>↙</span> Livre em <span style={{ color: NEON }} className="font-bold">11 meses</span> (abr. de 2027)
        </p>
        <div className="mt-4 space-y-2.5">
          {items.map((it, i) => (
            <div key={i} className="rounded-xl p-3 flex items-center gap-3" style={{ background: "#0e0e0e", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${it.color}22`, color: it.color }}>{it.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="text-white font-semibold text-sm truncate">{it.name}</p>
                  <p className="text-white font-bold text-sm whitespace-nowrap">{it.value}</p>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${it.progress}%`, background: NEON }} />
                  </div>
                  <span className="text-white/50 text-[10px] flex items-center gap-1"><Calendar size={9} /> {it.parcels}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl p-3 flex items-center justify-between" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.18)", color: "#f59e0b" }}><Wallet size={16} /></div>
            <div>
              <p className="text-white font-bold text-sm">Próximas cobranças</p>
              <p className="text-white/55 text-xs">3 cobranças nos próximos 7 dias</p>
            </div>
          </div>
          <p className="font-bold text-orange-400 text-sm whitespace-nowrap">R$ 623,82 ›</p>
        </div>
      </Card>
    </div>
  );
};

/* ===================== TAB 4: SCANNER ===================== */
const ScannerTab: React.FC = () => {
  return (
    <div className="grid lg:grid-cols-[1fr_1.05fr] gap-12 items-center min-w-0">
      <div>
        <Pill>Escaneie. Automatize. Economize.</Pill>
        <H2 className="mt-5">Escaneie seus comprovantes e deixe a IA <span style={{ color: NEON }}>fazer o resto.</span></H2>
        <Sub className="mt-4 max-w-[520px]">Diga adeus à digitação manual. Escaneie qualquer comprovante e o DinHub identifica, organiza e categoriza automaticamente cada gasto para você ter total controle do seu dinheiro.</Sub>
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          {[
            { icon: <FileText size={18} />, title: "Leitura inteligente", desc: "A IA extrai todas as informações importantes do seu comprovante." },
            { icon: <LayoutGrid size={18} />, title: "Categorização automática", desc: "Cada gasto é classificado na categoria correta sem você precisar fazer nada." },
            { icon: <CheckCircle2 size={18} />, title: "Organização imediata", desc: "Tudo é salvo e organizado na hora, pronto para você analisar e tomar decisões." },
          ].map((f, i) => (
            <div key={i}>
              <div className="h-11 w-11 rounded-full flex items-center justify-center" style={{ background: "rgba(0,230,118,0.1)", color: NEON, border: `1px solid ${NEON}33` }}>{f.icon}</div>
              <h4 className="text-white font-bold mt-3 text-sm">{f.title}</h4>
              <p className="text-white/55 text-xs mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl px-4 py-3.5 flex items-center gap-3" style={{ background: "rgba(0,230,118,0.05)", border: `1px solid ${NEON}33` }}>
          <span style={{ color: NEON }} className="text-lg">✦</span>
          <div>
            <p style={{ color: NEON }} className="font-bold text-sm">Mais tempo para o que importa</p>
            <p className="text-white/70 text-xs mt-0.5">Menos burocracia, mais clareza e controle total das suas finanças.</p>
          </div>
        </div>
      </div>
      <ScannerVisual />
    </div>
  );
};

const ScannerVisual: React.FC = () => {
  return (
    <div className="relative mx-auto" style={{ maxWidth: "min(85vw, 480px)" }}>
      {/* Phone */}
      <div
        className="relative mx-auto rounded-[44px] p-3"
        style={{ background: "linear-gradient(145deg,#1c1c1c,#0a0a0a)", border: "1px solid #2a2a2a", boxShadow: `0 40px 80px -20px rgba(0,0,0,0.7), 0 0 60px ${NEON}22`, maxWidth: "300px" }}
      >
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 h-6 w-28 rounded-full bg-black" />
        <div className="rounded-[34px] bg-[#1a1410] overflow-hidden p-3 pt-9 relative" style={{ aspectRatio: "9/19" }}>
          <div className="flex justify-between text-white/70 text-xs">
            <span>✕</span>
            <span style={{ color: NEON }}>⚡</span>
          </div>
          {/* Receipt */}
          <div className="relative mx-auto mt-4 rounded-md p-4 text-[10px] leading-tight font-mono" style={{ background: "#f4ead3", color: "#1a1410", maxWidth: "220px" }}>
            <p className="text-center font-bold">SUPERMERCADO<br />ALVORADA</p>
            <p className="text-center text-[8px] mt-1">CNPJ: 12.345.678/0001-99<br />AV. DAS FLORES, 123<br />SÃO PAULO - SP</p>
            <p className="text-center text-[8px] mt-1">12/05/2024 - 18:42:31</p>
            <p className="text-center font-bold mt-1">CUPOM FISCAL</p>
            <div className="mt-2 space-y-0.5 text-[8px]">
              <p>ARROZ 5KG ........ R$ 23,90</p>
              <p>FEIJÃO 1KG ....... R$ 8,49</p>
              <p>ÓLEO DE SOJA ..... R$ 6,49</p>
              <p>LEITE INTEGRAL 1L. R$ 9,18</p>
              <p>PÃO DE FORMA ..... R$ 5,49</p>
            </div>
            <div className="mt-2 border-t border-dashed border-black/40 pt-1 text-[9px]">
              <p className="font-bold">TOTAL R$ ......... 53,55</p>
              <p>Dinheiro .......... 60,00</p>
              <p>TROCO R$ ......... 6,45</p>
            </div>
            <p className="text-center text-[8px] mt-1">Obrigado e volte sempre!</p>
            {/* Scanning line */}
            <div className="absolute inset-x-2 top-0 h-[2px] pointer-events-none" style={{ background: `linear-gradient(90deg, transparent, ${NEON}, transparent)`, boxShadow: `0 0 12px ${NEON}, 0 0 24px ${NEON}`, animation: "scanLine 3s ease-in-out infinite" }} />
          </div>
          {/* Corner brackets blinking */}
          {[
            { top: "20px", left: "10px", rotate: "0deg" },
            { top: "20px", right: "10px", rotate: "90deg" },
            { bottom: "60px", left: "10px", rotate: "-90deg" },
            { bottom: "60px", right: "10px", rotate: "180deg" },
          ].map((c, i) => (
            <div key={i} className="absolute h-6 w-6 pointer-events-none" style={{ ...c, animation: "blink 1.5s ease-in-out infinite" } as React.CSSProperties}>
              <div className="absolute top-0 left-0 h-full w-[2px]" style={{ background: NEON, boxShadow: `0 0 6px ${NEON}` }} />
              <div className="absolute top-0 left-0 h-[2px] w-full" style={{ background: NEON, boxShadow: `0 0 6px ${NEON}` }} />
            </div>
          ))}
          <div className="absolute bottom-3 left-0 right-0 text-center">
            <p className="text-white/70 text-[10px] mb-2">Capturando...</p>
            <div className="mx-auto h-12 w-12 rounded-full border-4 border-white/80 flex items-center justify-center">
              <div className="h-9 w-9 rounded-full" style={{ background: NEON, boxShadow: `0 0 16px ${NEON}` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating confirmation cards */}
      <ConfirmCard
        className="absolute -left-4 sm:-left-16 top-20 max-w-[180px]"
        delay={0.9}
        icon={<FileText size={14} />}
        title="Comprovante escaneado com sucesso!"
      />
      <ConfirmCard
        className="absolute -left-2 sm:-left-12 top-[55%] max-w-[170px]"
        delay={1.6}
        icon={<ShoppingCart size={14} />}
        iconColor="#a855f7"
        title="Categoria definida"
        subtitle="Alimentação"
        iconBg="rgba(168,85,247,0.15)"
      />
      <ConfirmCard
        className="absolute -right-2 sm:-right-12 bottom-10 max-w-[170px]"
        delay={2.3}
        icon={<CheckCircle2 size={14} />}
        title="Lançamento salvo"
        subtitle="Gasto adicionado com sucesso!"
      />
      <ConfirmCard
        className="absolute -right-4 sm:-right-16 top-16 max-w-[200px]"
        delay={0.3}
        icon={<ReceiptIcon size={14} />}
        title="Gasto identificado"
        subtitle={<><span className="text-white/80">Supermercado Alvorada</span><br /><span style={{ color: NEON }} className="font-bold">R$ 53,55</span></>}
        footer="12/05/2024 - 18:42"
      />

      <style>{`
        @keyframes scanLine { 0%{top:0;opacity:0} 10%{opacity:1} 50%{top:100%;opacity:1} 60%{opacity:0} 100%{top:0;opacity:0} }
        @keyframes blink { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes confirmIn { 0%,15%{opacity:0;transform:translateY(10px)} 25%,90%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-10px)} }
      `}</style>
    </div>
  );
};

const ConfirmCard: React.FC<{ className?: string; delay: number; icon: React.ReactNode; title: string; subtitle?: React.ReactNode; footer?: string; iconColor?: string; iconBg?: string }> = ({ className = "", delay, icon, title, subtitle, footer, iconColor = NEON, iconBg = "rgba(0,230,118,0.15)" }) => (
  <div
    className={`rounded-xl p-3 backdrop-blur-md ${className}`}
    style={{
      background: "rgba(17,17,17,0.92)",
      border: `1px solid ${NEON}33`,
      boxShadow: `0 0 20px ${NEON}22`,
      animation: `confirmIn 4s ${delay}s ease-in-out infinite`,
    }}
  >
    <div className="flex items-center justify-between">
      <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: iconBg, color: iconColor }}>{icon}</div>
      <CheckCircle2 size={14} style={{ color: NEON }} />
    </div>
    <p className="text-white text-xs font-bold mt-2 leading-tight">{title}</p>
    {subtitle && <p className="text-white/60 text-[11px] mt-1">{subtitle}</p>}
    {footer && <p className="text-white/40 text-[10px] mt-1">{footer}</p>}
  </div>
);
