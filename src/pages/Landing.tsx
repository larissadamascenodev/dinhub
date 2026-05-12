import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, Plus, ArrowRight, Play, ShieldCheck, Lock, MessageCircle, Mic, Camera, Zap } from "lucide-react";

import screenHome from "@/assets/landing/screen-home.jpeg";
import screenBot from "@/assets/landing/screen-bot.jpeg";
import screenRadar from "@/assets/landing/screen-radar.jpeg";
import screenProjecoes from "@/assets/landing/screen-projecoes.jpeg";
import screenParcelas from "@/assets/landing/screen-parcelas.jpeg";

/* =============================================================================
   DinHub — Landing Page de Vendas
   Design system: dark exclusivo, verde neon, Sora + DM Sans
   ============================================================================= */

// Reusable phone mockup
const PhoneMockup = ({ src, label, className = "", style = {} }: { src: string; label: string; className?: string; style?: React.CSSProperties }) => (
  <div
    className={`relative rounded-[40px] overflow-hidden ${className}`}
    style={{
      background: "#0A0F0C",
      border: "1px solid rgba(61,255,143,0.18)",
      boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(61,255,143,0.08)",
      ...style,
    }}
  >
    {/* Notch */}
    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-black z-10" />
    <img src={src} alt={label} className="w-full h-full object-cover object-top" loading="lazy" />
  </div>
);

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export default function Landing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"texto" | "audio" | "foto" | "ia">("texto");
  const [activeFeature, setActiveFeature] = useState(0);
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const goToAuth = (mode: "login" | "signup" = "signup") => {
    navigate(`/auth${mode === "login" ? "?mode=login" : ""}`);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  /* ─── Features data ─── */
  const features = [
    {
      tab: "🏠 Início",
      chip: "✦ Visão Geral",
      title: "Tudo que importa\numa tela só.",
      desc: "Saldo disponível, receitas, despesas, gastos por categoria e parcelamentos ativos — seu dia financeiro completo assim que você abre o app.",
      points: [
        "Saldo disponível com projeção do fim do mês",
        "Receitas vs Despesas em destaque",
        "Gastos por categoria com barra visual",
        "Parcelamentos ativos com valor comprometido/mês",
      ],
      stats: [
        { v: "R$713", l: "Saldo visível" },
        { v: "22 itens", l: "Parcelamentos" },
        { v: "12 dias", l: "Progresso do mês" },
      ],
      img: screenHome,
    },
    {
      tab: "🤖 Bot Huby",
      chip: "✦ Inteligência Artificial",
      title: "Seu copiloto\nfinanceiro pessoal.",
      desc: "O Bot Huby não espera você perguntar — ele te avisa proativamente sobre padrões, gastos anormais e oportunidades de economia.",
      points: [
        "Detecta comportamentos incomuns automaticamente",
        "Conversa em linguagem simples, sem jargão",
        "Sugere melhorias baseadas no SEU histórico",
        "Disponível via texto, foto ou áudio",
      ],
      stats: [
        { v: "24/7", l: "Disponível" },
        { v: "100%", l: "Personalizado" },
        { v: "Proativo", l: "Sem perguntar" },
      ],
      img: screenBot,
    },
    {
      tab: "📊 Radar",
      chip: "✦ Radar Financeiro",
      title: "Diagnóstico\ncompleto da sua vida.",
      desc: "O Radar detecta padrões suspeitos, gastos excessivos e te dá um score financeiro em tempo real com recomendações do que fazer agora.",
      points: [
        "Score de saúde financeira de 0 a 100",
        "Alertas de padrões anormais por categoria",
        "Diagnóstico com pontos de atenção",
        "Recomendações específicas: O que fazer",
      ],
      stats: [
        { v: "Score", l: "0 a 100" },
        { v: "Alertas", l: "Em tempo real" },
        { v: "IA", l: "Diagnóstico auto" },
      ],
      img: screenRadar,
    },
    {
      tab: "📈 Projeções",
      chip: "✦ Projeções Inteligentes",
      title: "Veja o futuro\ndo seu dinheiro.",
      desc: "Timeline de saldo com projeção para 6 meses com base nos seus hábitos reais — sem chute, com dado.",
      points: [
        "Timeline de saldo acumulado mês a mês",
        "Previsão baseada no histórico real",
        "Balanço mensal com receitas vs despesas",
        "Visão de até 12 meses à frente",
      ],
      stats: [
        { v: "+91%", l: "Crescimento Junho" },
        { v: "6 meses", l: "Projeção" },
        { v: "R$3.075", l: "Saldo previsto Out" },
      ],
      img: screenProjecoes,
    },
    {
      tab: "💳 Parcelas",
      chip: "✦ Controle de Parcelamentos",
      title: "Saiba exatamente\nonde está seu dinheiro.",
      desc: "Visualize todos os parcelamentos ativos, o quanto está comprometido por mês e quando cada um termina. Sem surpresa no bolso.",
      points: [
        "22 parcelamentos ativos em um só lugar",
        "Valor comprometido por mês em destaque",
        "Data prevista de liberdade financeira",
        "Progresso visual de cada parcela",
      ],
      stats: [
        { v: "R$1.428", l: "Comprometido/mês" },
        { v: "11 meses", l: "Para liberdade" },
        { v: "R$9.569", l: "Total restante" },
      ],
      img: screenParcelas,
    },
  ];

  const tickerItems = [
    "Controle total", "Bot Huby IA", "Projeções 12 meses", "Radar Financeiro",
    "Score em tempo real", "Parcelamentos", "3 dias grátis", "Sem planilha",
  ];

  const faqs = [
    { q: "Preciso de cartão de crédito para o trial?", a: "Não. Os 3 dias são 100% gratuitos sem pedir nenhum dado de pagamento." },
    { q: "O que acontece depois dos 3 dias?", a: "Você recebe uma notificação e escolhe assinar. Se não assinar, o acesso é pausado — sem cobrança surpresa." },
    { q: "O Bot Huby realmente funciona?", a: "É o coração do DinHub. Analisa gastos, detecta padrões anormais, responde em linguagem humana e dá sugestões personalizadas. Não é enfeite." },
    { q: "O DinHub acessa minha conta bancária?", a: "Não acessamos sua conta diretamente. Você registra via texto, foto do comprovante ou áudio. Sua segurança está acima de tudo." },
    { q: "Posso cancelar quando quiser?", a: "Sim, a qualquer momento. Sem multa, sem carência. 1 toque no app e pronto." },
    { q: "Vale a pena o plano anual?", a: "O anual equivale a 2 meses grátis e sai por menos que um jantar por mês." },
    { q: "E se eu quiser reembolso?", a: "Garantimos reembolso total nos primeiros 7 dias após assinar. Sem perguntas, sem drama." },
  ];

  const monthlyPrice = 19.9;
  const annualMonthly = 12.42;
  const annualTotal = 149;

  return (
    <div className="min-h-screen text-foreground antialiased" style={{ background: "#080C09", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap');
        html { scroll-behavior: smooth; }
        .display { font-family: 'Sora', sans-serif; letter-spacing: -0.04em; }
        @keyframes gradMove { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes floatAlt { 0%, 100% { transform: translateY(-4px) rotate(-4deg); } 50% { transform: translateY(8px) rotate(-4deg); } }
        @keyframes floatAlt2 { 0%, 100% { transform: translateY(6px) rotate(4deg); } 50% { transform: translateY(-6px) rotate(4deg); } }
        @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(61,255,143,0.5), 0 8px 24px rgba(61,255,143,0.25); } 50% { box-shadow: 0 0 0 10px rgba(61,255,143,0), 0 12px 32px rgba(61,255,143,0.4); } }
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes pulseDot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.85); } }
        .anim-grad { background-size: 200% 200%; animation: gradMove 8s ease-in-out infinite; }
        .anim-float { animation: float 4.5s ease-in-out infinite; }
        .anim-float-l { animation: floatAlt 5.2s ease-in-out infinite; }
        .anim-float-r { animation: floatAlt2 5.8s ease-in-out infinite; }
        .anim-glow { animation: glowPulse 2.4s ease-in-out infinite; }
        .anim-ticker { animation: ticker 28s linear infinite; }
        .anim-dot { animation: pulseDot 1.6s ease-in-out infinite; }
        .scanline { position: absolute; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(61,255,143,0.4), transparent); animation: scanline 7s linear infinite; pointer-events: none; }
        .grid-bg {
          background-image:
            linear-gradient(rgba(61,255,143,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(61,255,143,0.04) 1px, transparent 1px);
          background-size: 56px 56px;
        }
        .green-glow { text-shadow: 0 0 30px rgba(61,255,143,0.55), 0 0 60px rgba(61,255,143,0.25); }
        .feature-tab-active { background: #1A241D; color: #EDF5EF; }
        .feature-tab { background: #141C16; color: #5C7A62; }
      `}</style>

      {/* ── 1. TOPBAR ── */}
      <div
        className="anim-grad text-center text-[12px] sm:text-[13px] py-2 px-4 flex items-center justify-center gap-3 flex-wrap"
        style={{
          background: "linear-gradient(90deg, rgba(61,255,143,0.10), rgba(61,255,143,0.18), rgba(61,255,143,0.10))",
          color: "#EDF5EF",
          borderBottom: "1px solid rgba(61,255,143,0.14)",
        }}
      >
        <span>⚡ Lançamento — <strong>3 dias grátis</strong>, sem cartão, sem compromisso</span>
        <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full" style={{ background: "rgba(61,255,143,0.12)", border: "1px solid rgba(61,255,143,0.22)" }}>
          <span className="w-1.5 h-1.5 rounded-full anim-dot" style={{ background: "#3DFF8F" }} />
          <span className="text-[11px] font-medium" style={{ color: "#3DFF8F" }}>Vagas abertas</span>
        </span>
      </div>

      {/* ── 2. NAVBAR ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: "rgba(8,12,9,0.78)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "rgba(61,255,143,0.12)", border: "1px solid rgba(61,255,143,0.22)" }}>
              🐷
            </div>
            <span className="display text-xl font-extrabold">
              <span style={{ color: "#EDF5EF" }}>Din</span>
              <span style={{ color: "#3DFF8F" }}>Hub</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: "#5C7A62" }}>
            <button onClick={() => scrollTo("funcionalidades")} className="hover:text-white transition-colors">Funcionalidades</button>
            <button onClick={() => scrollTo("como-funciona")} className="hover:text-white transition-colors">Como funciona</button>
            <button onClick={() => scrollTo("depoimentos")} className="hover:text-white transition-colors">Depoimentos</button>
            <button onClick={() => scrollTo("pricing")} className="hover:text-white transition-colors">Preços</button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToAuth("login")}
              className="hidden sm:inline-flex text-sm font-medium px-3 py-2 rounded-lg transition-colors"
              style={{ color: "#EDF5EF" }}
            >
              Entrar
            </button>
            <button
              onClick={() => goToAuth("signup")}
              className="display font-bold text-sm px-4 sm:px-5 py-2.5 rounded-xl transition-transform hover:scale-[1.02]"
              style={{ background: "#3DFF8F", color: "#08120B" }}
            >
              Testar grátis →
            </button>
          </div>
        </div>
      </nav>

      {/* ── 3. HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-100 pointer-events-none" />
        <div
          className="absolute inset-x-0 top-0 h-[600px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(61,255,143,0.12), transparent 60%)" }}
        />
        <div className="scanline" style={{ top: 0 }} />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-12 text-center">
          {/* Social proof */}
          <motion.div {...fadeUp} transition={{ delay: 0.0, duration: 0.6 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full text-[12px] sm:text-[13px]"
            style={{ background: "#141C16", border: "1px solid rgba(255,255,255,0.07)", color: "#EDF5EF" }}
          >
            <span className="flex -space-x-2">
              {["👩🏻", "🧑🏽", "👨🏿", "🧔🏻", "👩🏼"].map((e, i) => (
                <span key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-[12px]"
                  style={{ background: "#1A241D", border: "1.5px solid #080C09" }}>
                  {e}
                </span>
              ))}
            </span>
            <span><strong>+2.847</strong> pessoas assumindo o controle</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 {...fadeUp} transition={{ delay: 0.08, duration: 0.7 }}
            className="display font-extrabold mt-7 leading-[1.02]"
            style={{ fontSize: "clamp(42px, 8vw, 88px)", color: "#EDF5EF" }}
          >
            Chega de viver no
            <br />
            <span className="green-glow" style={{ color: "#3DFF8F" }}>automático.</span>
          </motion.h1>

          <motion.h2 {...fadeUp} transition={{ delay: 0.16, duration: 0.7 }}
            className="display font-bold mt-4"
            style={{ fontSize: "clamp(28px, 5vw, 56px)", color: "#EDF5EF", letterSpacing: "-0.03em" }}
          >
            Assuma o controle.
          </motion.h2>

          <motion.p {...fadeUp} transition={{ delay: 0.24, duration: 0.7 }}
            className="mt-6 max-w-2xl mx-auto text-[15px] sm:text-[17px] leading-relaxed"
            style={{ color: "#9BB0A0" }}
          >
            Seu dinheiro some e você nem sabe como? O DinHub é seu copiloto financeiro com IA — que analisa, conversa e te mostra o caminho.
          </motion.p>

          {/* Input methods tabs */}
          <motion.div {...fadeUp} transition={{ delay: 0.32, duration: 0.7 }}
            className="mt-7 inline-flex items-center gap-1 p-1 rounded-2xl"
            style={{ background: "#0D1410", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {([
              { k: "texto", icon: <MessageCircle className="w-3.5 h-3.5" />, l: "texto" },
              { k: "audio", icon: <Mic className="w-3.5 h-3.5" />, l: "áudio" },
              { k: "foto", icon: <Camera className="w-3.5 h-3.5" />, l: "foto" },
              { k: "ia", icon: <Zap className="w-3.5 h-3.5" />, l: "IA" },
            ] as const).map(t => (
              <button key={t.k} onClick={() => setActiveTab(t.k)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[12px] sm:text-[13px] font-medium transition-all"
                style={{
                  background: activeTab === t.k ? "#1A241D" : "transparent",
                  color: activeTab === t.k ? "#EDF5EF" : "#5C7A62",
                  border: activeTab === t.k ? "1px solid rgba(61,255,143,0.22)" : "1px solid transparent",
                }}
              >
                {t.icon}
                <span className="capitalize">{t.l}</span>
              </button>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div {...fadeUp} transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={() => goToAuth("signup")}
              className="display font-extrabold text-[15px] sm:text-[17px] px-9 py-4 rounded-xl anim-glow transition-transform hover:scale-[1.02]"
              style={{ background: "#3DFF8F", color: "#08120B" }}
            >
              Assumir o controle agora →
            </button>
            <button
              onClick={() => scrollTo("como-funciona")}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl text-[14px] font-medium transition-colors"
              style={{ background: "transparent", color: "#EDF5EF", border: "1px solid rgba(255,255,255,0.10)" }}
            >
              <Play className="w-4 h-4" fill="currentColor" /> Ver como funciona
            </button>
          </motion.div>

          <motion.p {...fadeUp} transition={{ delay: 0.48, duration: 0.7 }}
            className="mt-4 text-[12px] sm:text-[13px]" style={{ color: "#5C7A62" }}
          >
            <strong style={{ color: "#3DFF8F" }}>3 dias grátis.</strong> Sem cartão. Sem desculpa.
          </motion.p>

          {/* iPhones */}
          <div className="mt-16 sm:mt-20 relative h-[480px] sm:h-[560px] flex items-end justify-center">
            <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.9 }}
              className="hidden sm:block absolute left-1/2 -translate-x-[200px] bottom-0 anim-float-l"
              style={{ width: 180, height: 380 }}
            >
              <PhoneMockup src={screenRadar} label="Radar Financeiro" className="w-full h-full" style={{ opacity: 0.92 }} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9 }}
              className="relative anim-float z-10"
              style={{ width: 240, height: 500 }}
            >
              <PhoneMockup src={screenHome} label="Home" className="w-full h-full" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.9 }}
              className="hidden sm:block absolute left-1/2 translate-x-[20px] bottom-0 anim-float-r"
              style={{ width: 180, height: 380 }}
            >
              <PhoneMockup src={screenBot} label="Bot Huby" className="w-full h-full" style={{ opacity: 0.92 }} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4. TICKER ── */}
      <div className="overflow-hidden py-4" style={{ background: "#0D1410", borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex anim-ticker whitespace-nowrap">
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 px-6 text-sm" style={{ color: "#9BB0A0" }}>
              <span style={{ color: "#3DFF8F" }}>✦</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── 5. SEÇÃO DOR ── */}
      <section className="py-20 sm:py-28 px-5" style={{ background: "#111A13" }}>
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#3DFF8F" }}>
            A realidade brasileira
          </span>
          <h2 className="display font-extrabold mt-4 leading-[1.05]" style={{ fontSize: "clamp(28px, 5vw, 48px)", color: "#EDF5EF" }}>
            Seu dinheiro some e você <span style={{ color: "#3DFF8F" }} className="green-glow">nem sabe como?</span>
          </h2>
          <p className="mt-5 text-[15px] sm:text-[17px] leading-relaxed" style={{ color: "#9BB0A0" }}>
            A maioria das pessoas termina o mês sem conseguir explicar o porquê. Não é falta de dinheiro — é falta de visibilidade.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { v: "67%", t: "dos brasileiros não sabem quanto gastam por mês" },
              { v: "R$580", t: "perdidos em média em gastos invisíveis todo mês" },
              { v: "1 em 3", t: "jovens termina o mês sem saber onde foi o salário" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl text-left"
                style={{ background: "#141C16", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="display font-extrabold green-glow" style={{ fontSize: 34, color: "#3DFF8F" }}>{s.v}</div>
                <p className="mt-2 text-[13px] leading-snug" style={{ color: "#9BB0A0" }}>{s.t}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. FEATURES SHOWCASE ── */}
      <section id="funcionalidades" className="py-20 sm:py-28 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#3DFF8F" }}>
              Funcionalidades reais
            </span>
            <h2 className="display font-extrabold mt-4 leading-[1.05] whitespace-pre-line"
              style={{ fontSize: "clamp(28px, 5vw, 48px)", color: "#EDF5EF" }}
            >
              {"Tudo que você precisa.\nNada que você não quer."}
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto sm:flex-wrap sm:justify-center pb-2 -mx-5 px-5 sm:mx-0 sm:px-0">
            {features.map((f, i) => (
              <button key={i} onClick={() => setActiveFeature(i)}
                className={`shrink-0 px-4 sm:px-5 py-2.5 rounded-xl text-[13px] sm:text-[14px] font-semibold transition-all ${activeFeature === i ? "feature-tab-active" : "feature-tab"}`}
                style={{ border: activeFeature === i ? "1px solid rgba(61,255,143,0.22)" : "1px solid rgba(255,255,255,0.07)" }}
              >
                {f.tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="mt-10 grid lg:grid-cols-[300px_1fr] gap-12 lg:gap-16 items-center">
            <div className="flex justify-center">
              <AnimatePresence mode="wait">
                <motion.div key={activeFeature}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  style={{ width: 240, height: 500 }}
                >
                  <PhoneMockup src={features[activeFeature].img} label={features[activeFeature].tab} className="w-full h-full" />
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeFeature}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: "rgba(61,255,143,0.12)", color: "#3DFF8F", border: "1px solid rgba(61,255,143,0.22)" }}
                >
                  {features[activeFeature].chip}
                </span>
                <h3 className="display font-extrabold mt-4 leading-[1.05] whitespace-pre-line"
                  style={{ fontSize: "clamp(28px, 4vw, 42px)", color: "#EDF5EF" }}
                >
                  {features[activeFeature].title}
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "#9BB0A0" }}>
                  {features[activeFeature].desc}
                </p>
                <ul className="mt-6 space-y-3">
                  {features[activeFeature].points.map((p, i) => (
                    <li key={i} className="flex items-start gap-3 text-[14px]" style={{ color: "#EDF5EF" }}>
                      <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                        style={{ background: "rgba(61,255,143,0.12)", border: "1px solid rgba(61,255,143,0.22)" }}>
                        <Check className="w-3 h-3" style={{ color: "#3DFF8F" }} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 grid grid-cols-3 gap-3">
                  {features[activeFeature].stats.map((s, i) => (
                    <div key={i} className="p-3.5 rounded-xl text-center"
                      style={{ background: "#141C16", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="display font-extrabold text-[15px] sm:text-[17px]" style={{ color: "#3DFF8F" }}>{s.v}</div>
                      <div className="text-[10px] mt-1 leading-tight" style={{ color: "#5C7A62" }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── 7. COMO FUNCIONA ── */}
      <section id="como-funciona" className="py-20 sm:py-28 px-5" style={{ background: "#0D1410" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#3DFF8F" }}>
              Simples assim
            </span>
            <h2 className="display font-extrabold mt-4 leading-[1.05]"
              style={{ fontSize: "clamp(28px, 5vw, 48px)", color: "#EDF5EF" }}
            >
              3 passos para assumir o controle.
            </h2>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-5 relative">
            {[
              { n: "01", icon: "📲", t: "Cria sua conta", d: "Menos de 2 minutos. Sem burocracia, sem cartão nos 3 dias de trial." },
              { n: "02", icon: "🧠", t: "A IA analisa", d: "O Bot Huby lê seus gastos, detecta padrões e gera insights personalizados imediatamente." },
              { n: "03", icon: "🎯", t: "Você decide", d: "Com visibilidade real, você toma decisões melhores. O Huby fica do seu lado no caminho." },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative p-7 rounded-2xl"
                style={{ background: "#141C16", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <span className="display absolute top-4 right-5 font-extrabold pointer-events-none"
                  style={{ fontSize: 64, color: "rgba(61,255,143,0.08)", lineHeight: 1 }}>
                  {s.n}
                </span>
                <div className="text-3xl">{s.icon}</div>
                <h3 className="display font-bold text-xl mt-4" style={{ color: "#EDF5EF" }}>{s.t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "#9BB0A0" }}>{s.d}</p>
              </motion.div>
            ))}
            {/* Arrows desktop */}
            <div className="hidden md:flex absolute top-1/2 left-[33%] -translate-y-1/2 items-center justify-center" style={{ color: "#3DFF8F" }}>
              <ArrowRight className="w-6 h-6" />
            </div>
            <div className="hidden md:flex absolute top-1/2 left-[66%] -translate-y-1/2 items-center justify-center" style={{ color: "#3DFF8F" }}>
              <ArrowRight className="w-6 h-6" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. DEPOIMENTOS ── */}
      <section id="depoimentos" className="py-20 sm:py-28 px-5" style={{ background: "#111A13" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#3DFF8F" }}>
              Quem já assumiu o controle
            </span>
            <h2 className="display font-extrabold mt-4 leading-[1.05]"
              style={{ fontSize: "clamp(28px, 5vw, 48px)", color: "#EDF5EF" }}
            >
              Resultados reais. Pessoas reais.
            </h2>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-5">
            {[
              { avatar: "🧑", name: "Rafael M.", role: "Designer, 26 anos", quote: "Em 3 semanas o Huby me mostrou que eu gastava R$400/mês em coisas que nem lembrava. Cancelei metade e não sinto falta nenhuma.", result: "R$400 economizados/mês", featured: true },
              { avatar: "👩", name: "Larissa T.", role: "Analista, 24 anos", quote: "Finalmente entendi pra onde meu salário ia. O Bot Huby conversa de um jeito que planilha nenhuma conseguia. Mudou minha relação com dinheiro.", result: "Controle total em 1 semana" },
              { avatar: "🧔", name: "Bruno K.", role: "Freelancer, 29 anos", quote: "Como autônomo minha renda varia muito. O DinHub me ajudou a criar reservas nos meses bons. Hoje tenho 4 meses guardados pela primeira vez na vida.", result: "4 meses de reserva criados" },
            ].map((d, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="p-7 rounded-2xl flex flex-col"
                style={{
                  background: d.featured
                    ? "linear-gradient(180deg, rgba(61,255,143,0.06), #141C16)"
                    : "#141C16",
                  border: d.featured ? "1px solid rgba(61,255,143,0.30)" : "1px solid rgba(255,255,255,0.07)",
                  transition: "border-color 0.2s ease",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ background: "#1A241D", border: "1px solid rgba(255,255,255,0.07)" }}>
                    {d.avatar}
                  </div>
                  <div>
                    <div className="display font-bold text-[15px]" style={{ color: "#EDF5EF" }}>{d.name}</div>
                    <div className="text-[12px]" style={{ color: "#5C7A62" }}>{d.role}</div>
                  </div>
                </div>
                <div className="flex gap-0.5 mt-3" style={{ color: "#F5A623" }}>★★★★★</div>
                <p className="mt-4 text-[14px] leading-relaxed flex-1" style={{ color: "#9BB0A0" }}>"{d.quote}"</p>
                <div className="mt-5 inline-flex self-start items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold"
                  style={{ background: "rgba(61,255,143,0.12)", color: "#3DFF8F", border: "1px solid rgba(61,255,143,0.22)" }}>
                  ✦ {d.result}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. PRICING ── */}
      <section id="pricing" className="py-20 sm:py-28 px-5" style={{ background: "#0D1410" }}>
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#3DFF8F" }}>
            Sem enrolação
          </span>
          <h2 className="display font-extrabold mt-4 leading-[1.05]"
            style={{ fontSize: "clamp(28px, 5vw, 48px)", color: "#EDF5EF" }}
          >
            Um plano. Tudo incluído.
          </h2>
          <p className="mt-4 text-[15px]" style={{ color: "#9BB0A0" }}>
            Menos que uma pizza por mês. E o retorno é muito maior.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex p-1 rounded-2xl" style={{ background: "#141C16", border: "1px solid rgba(255,255,255,0.07)" }}>
            {(["monthly", "annual"] as const).map(b => (
              <button key={b} onClick={() => setBilling(b)}
                className="px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all"
                style={{
                  background: billing === b ? "#3DFF8F" : "transparent",
                  color: billing === b ? "#08120B" : "#9BB0A0",
                }}
              >
                {b === "monthly" ? "Mensal" : "Anual"}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {billing === "annual" && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                style={{ background: "rgba(61,255,143,0.12)", color: "#3DFF8F", border: "1px solid rgba(61,255,143,0.22)" }}
              >
                🎉 Você economiza R$88 por ano
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="max-w-[480px] mx-auto mt-12 relative">
          <div className="absolute left-1/2 -top-3 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider z-10"
            style={{ background: "#3DFF8F", color: "#08120B" }}>
            ACESSO COMPLETO
          </div>
          <div className="p-8 sm:p-10 rounded-[28px] relative"
            style={{
              background: "#141C16",
              border: "2px solid rgba(61,255,143,0.22)",
              boxShadow: "0 0 80px rgba(61,255,143,0.07)",
            }}
          >
            <div className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "#5C7A62" }}>
              DinHub Pro
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={billing} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25 }}
                className="mt-3 flex items-baseline gap-2"
              >
                <span className="display font-extrabold" style={{ fontSize: 60, color: "#EDF5EF", lineHeight: 1 }}>
                  R$ {(billing === "annual" ? annualMonthly : monthlyPrice).toFixed(2).replace(".", ",")}
                </span>
                <span className="text-[13px]" style={{ color: "#5C7A62" }}>
                  /mês
                </span>
              </motion.div>
            </AnimatePresence>
            <div className="text-[12px] mt-1" style={{ color: "#5C7A62" }}>
              {billing === "annual" ? "cobrado R$149/ano" : "cobrado mensalmente"}
            </div>

            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] display font-bold"
              style={{ background: "rgba(61,255,143,0.12)", color: "#3DFF8F", border: "1px solid rgba(61,255,143,0.22)" }}>
              🎁 3 dias grátis para testar — sem cartão
            </div>

            <ul className="mt-7 space-y-3">
              {[
                "Bot Huby ilimitado — IA que conversa com você",
                "Radar Financeiro com alertas automáticos",
                "Score de saúde financeira em tempo real",
                "Projeções inteligentes para 12 meses",
                "Controle completo de parcelamentos",
                "Balanço mensal com previsão de meses futuros",
                "Registre via texto, áudio ou foto",
                "Relatórios financeiros em PDF",
                "Suporte prioritário em português",
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-[14px]" style={{ color: "#EDF5EF" }}>
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                    style={{ background: "rgba(61,255,143,0.12)", border: "1px solid rgba(61,255,143,0.22)" }}>
                    <Check className="w-3 h-3" style={{ color: "#3DFF8F" }} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => goToAuth("signup")}
              className="display mt-8 w-full py-4 rounded-xl font-extrabold text-[17px] transition-colors"
              style={{ background: "#3DFF8F", color: "#08120B" }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#EDF5EF")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#3DFF8F")}
            >
              Começar meus 3 dias grátis →
            </button>

            <div className="mt-5 p-4 rounded-xl text-center"
              style={{ background: "#0D1410", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-[13px] font-bold flex items-center justify-center gap-2" style={{ color: "#EDF5EF" }}>
                <ShieldCheck className="w-4 h-4" style={{ color: "#3DFF8F" }} /> Garantia de 7 dias após assinar
              </div>
              <p className="text-[12px] mt-1" style={{ color: "#5C7A62" }}>
                Se não gostar, devolvemos 100% do valor sem perguntas.
              </p>
            </div>

            <div className="mt-3 p-3 rounded-xl text-center"
              style={{ background: "#0D1410", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-[12px] font-semibold flex items-center justify-center gap-2" style={{ color: "#EDF5EF" }}>
                <Lock className="w-3.5 h-3.5" /> Pagamento 100% seguro via Stripe
              </div>
              <p className="text-[10.5px] mt-1" style={{ color: "#5C7A62" }}>
                Criptografia SSL · Sem armazenar dados do cartão · PCI DSS
              </p>
            </div>

            <p className="text-[11px] text-center mt-5" style={{ color: "#5C7A62" }}>
              Sem cartão no trial · Cancele quando quiser · Reembolso em 7 dias
            </p>
          </div>
        </div>
      </section>

      {/* ── 10. FAQ ── */}
      <section id="faq" className="py-20 sm:py-28 px-5" style={{ background: "#111A13" }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#3DFF8F" }}>
              Dúvidas frequentes
            </span>
            <h2 className="display font-extrabold mt-4 leading-[1.05]"
              style={{ fontSize: "clamp(28px, 5vw, 48px)", color: "#EDF5EF" }}
            >
              Sem pergunta boba.
            </h2>
          </div>

          <div className="mt-12 space-y-3">
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="rounded-2xl overflow-hidden transition-colors"
                  style={{
                    background: "#141C16",
                    border: isOpen ? "1px solid rgba(61,255,143,0.30)" : "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <button onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  >
                    <span className="display font-bold text-[15px]" style={{ color: "#EDF5EF" }}>{f.q}</span>
                    <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-transform"
                      style={{
                        background: "rgba(61,255,143,0.12)",
                        border: "1px solid rgba(61,255,143,0.22)",
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      }}
                    >
                      <Plus className="w-4 h-4" style={{ color: "#3DFF8F" }} />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 text-[14px] leading-relaxed" style={{ color: "#9BB0A0" }}>
                          {f.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 11. CTA FINAL ── */}
      <section className="relative py-24 sm:py-32 px-5 overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(61,255,143,0.18), transparent 60%)" }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="display font-extrabold leading-[1.05]"
            style={{ fontSize: "clamp(34px, 5vw, 60px)", color: "#EDF5EF" }}
          >
            O futuro da sua vida<br />financeira <span className="green-glow" style={{ color: "#3DFF8F" }}>começa aqui.</span>
          </h2>
          <p className="mt-6 text-[15px] sm:text-[17px]" style={{ color: "#9BB0A0" }}>
            Mais de <strong>2.847 pessoas</strong> já pararam de adivinhar pra onde o dinheiro vai. Agora é a sua vez.
          </p>
          <button
            onClick={() => scrollTo("pricing")}
            className="display mt-9 font-extrabold text-[16px] sm:text-[18px] px-10 py-5 rounded-xl anim-glow transition-transform hover:scale-[1.02]"
            style={{ background: "#3DFF8F", color: "#08120B" }}
          >
            Assumir o controle agora →
          </button>
          <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[12px]" style={{ color: "#5C7A62" }}>
            {["3 dias grátis", "Sem cartão", "Cancele quando quiser", "Garantia 7 dias", "Suporte em português"].map(t => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check className="w-3 h-3" style={{ color: "#3DFF8F" }} /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. FOOTER ── */}
      <footer className="px-5 py-8" style={{ background: "#0D1410", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(61,255,143,0.12)", border: "1px solid rgba(61,255,143,0.22)" }}>
              🐷
            </div>
            <span className="display font-extrabold text-lg">
              <span style={{ color: "#EDF5EF" }}>Din</span><span style={{ color: "#3DFF8F" }}>Hub</span>
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px]" style={{ color: "#9BB0A0" }}>
            <a href="/termos-de-uso" className="hover:text-white transition-colors">Termos</a>
            <a href="/politica-privacidade" className="hover:text-white transition-colors">Privacidade</a>
            <a href="/suporte" className="hover:text-white transition-colors">Contato</a>
            <button onClick={() => scrollTo("faq")} className="hover:text-white transition-colors">FAQ</button>
          </div>
          <p className="text-[12px]" style={{ color: "#5C7A62" }}>
            © 2026 DinHub · Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}
