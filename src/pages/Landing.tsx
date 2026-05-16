import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Play, Menu, X, Zap, MessageCircle, Mic, Camera,
  Brain, PiggyBank, Check, Shield,
} from "lucide-react";

import screenHome from "@/assets/landing/screen-home.jpeg";
import screenBot from "@/assets/landing/screen-bot.jpeg";

const G = "#00e87a";
const RED = "#ef4444";

function AnimatedCounter({
  to, prefix = "", suffix = "", decimal = false,
}: { to: number; prefix?: string; suffix?: string; decimal?: boolean }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const steps = 72;
    let i = 0;
    const t = setInterval(() => {
      i++;
      const cur = to * i / steps;
      setVal(decimal ? Math.round(cur * 10) / 10 : Math.round(cur));
      if (i >= steps) { setVal(to); clearInterval(t); }
    }, 1200 / steps);
    return () => clearInterval(t);
  }, [inView, to, decimal]);
  return (
    <span ref={ref}>
      {prefix}{decimal ? val.toFixed(1) : val.toLocaleString("pt-BR")}{suffix}
    </span>
  );
}

const PAIN = [
  { emoji: "😰", text: "Chega no fim do mês sem entender onde foi o salário" },
  { emoji: "😓", text: "Sabe que tem parcelamentos mas não sabe o total exato" },
  { emoji: "😬", text: "Fica com medo de ver o extrato do cartão" },
  { emoji: "😤", text: "Já tentou planilha mas abandonou em 2 semanas" },
];

const PILLARS = [
  { icon: "🎯", title: "Diagnóstico em tempo real", color: G, desc: "Saúde Financeira com score de 0 a 100. O Huby te avisa quando algo sai do controle antes de virar problema." },
  { icon: "🤖", title: "IA que conversa com você", color: "#7c3aed", desc: "Não só gráficos. O Bot Huby analisa seus padrões e fala em português exatamente o que você precisa fazer." },
  { icon: "📊", title: "Visão do futuro", color: "#ff8c00", desc: "Projeções de 12 meses para você tomar decisões com antecedência e não ser pego de surpresa." },
];

const FEATURES = [
  { icon: "🎯", title: "Radar Financeiro", desc: "Alertas e padrões detectados antes de virarem problema", color: G },
  { icon: "❤️", title: "Saúde Financeira", desc: "Score geral do seu dinheiro de 0 a 100", color: RED },
  { icon: "📈", title: "Projeções", desc: "Veja como seu dinheiro evolui nos próximos 12 meses", color: "#ff8c00" },
  { icon: "🔍", title: "Análise IA", desc: "Insights personalizados baseados no seu comportamento", color: "#7c3aed" },
  { icon: "📅", title: "Parcelamentos", desc: "Controle total de todas as suas parcelas ativas", color: "#06b6d4" },
  { icon: "📊", title: "Timeline de Saldo", desc: "Evolução mês a mês do seu patrimônio", color: "#f59e0b" },
];

const STEPS = [
  { n: "1", title: "Crie sua conta grátis", desc: "Em 2 minutos, sem cartão de crédito. É grátis para começar.", icon: PiggyBank },
  { n: "2", title: "Lance suas transações", desc: "Por texto, áudio, foto ou deixa a IA detectar automaticamente.", icon: Zap },
  { n: "3", title: "O Huby cuida do resto", desc: "Análises, alertas e insights automáticos todo dia para você.", icon: Brain },
];

const TESTIMONIALS = [
  { text: "Descobri que gastava R$ 400 por mês sem perceber. O Huby me mostrou em 5 minutos o que eu não via há anos.", name: "João M.", age: "34 anos, São Paulo", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" },
  { text: "Finalmente entendo para onde vai meu dinheiro. As projeções me ajudaram a planejar a troca de carro.", name: "Ana R.", age: "28 anos, Belo Horizonte", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face" },
  { text: "Tentei 3 apps antes do DinHub. Nenhum tinha uma IA que realmente conversasse e entendesse minha situação.", name: "Carlos F.", age: "41 anos, Rio de Janeiro", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
];

const FREE_FEATURES = ["Lançamento de transações", "Categorização automática", "Saldo e extrato", "Bot Huby (limitado)"];
const PRO_FEATURES = ["Tudo do gratuito", "Bot Huby ilimitado", "Radar Financeiro completo", "Saúde Financeira com score", "Projeções 12 meses", "Análise IA avançada", "Relatórios detalhados"];

const CHAT = [
  { from: "huby", text: "💡 Olá, Larissa! Você tem usado bastante Apostas ultimamente... talvez sem perceber. Vale revisar isso?" },
  { from: "user", text: "Como assim?" },
  { from: "huby", text: "Você fez 7 transações em Apostas esse mês — acima da média de 3. Impacto: R$ 128,64. Quer ver o que fazer?" },
  { from: "user", text: "Sim, me mostra!" },
];

const AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
];

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");
  const [chatStep, setChatStep] = useState(0);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    let idx = 0;
    const t = setInterval(() => {
      idx = (idx + 1) % CHAT.length;
      setChatStep(idx);
    }, 2400);
    return () => clearInterval(t);
  }, []);

  const go = () => navigate("/auth");

  return (
    <div style={{ background: "#0a0a0a", color: "#fff", fontFamily: "DM Sans, sans-serif", overflowX: "hidden" }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes float2 { 0%,100%{transform:translateY(-7px)} 50%{transform:translateY(7px)} }
        @keyframes glowpulse { 0%,100%{box-shadow:0 0 24px rgba(0,232,122,.35)} 50%{box-shadow:0 0 48px rgba(0,232,122,.65)} }
        .float{animation:float 4.5s ease-in-out infinite}
        .float2{animation:float2 4.5s ease-in-out infinite 1.2s}
        .glow-btn{animation:glowpulse 2.2s ease-in-out infinite}
        .nav-link{color:rgba(255,255,255,.55);font-size:14px;text-decoration:none;transition:color .2s}
        .nav-link:hover{color:#00e87a}
        .card-hover{transition:transform .3s,box-shadow .3s}
        .card-hover:hover{transform:translateY(-5px);box-shadow:0 24px 60px rgba(0,232,122,.08)}
        .outline-btn{background:transparent;border:1px solid rgba(255,255,255,.18);color:#fff;border-radius:12px;cursor:pointer;font-family:DM Sans,sans-serif;transition:all .2s}
        .outline-btn:hover{border-color:#00e87a;color:#00e87a}
        .solid-btn{background:#00e87a;color:#000;border:none;border-radius:12px;cursor:pointer;font-family:DM Sans,sans-serif;font-weight:700;transition:all .2s}
        .solid-btn:hover{background:#00cc6a}
      `}</style>

      {/* ── NAVBAR ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 max(24px, calc((100vw - 1280px) / 2 + 24px))",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        background: scrolled ? "rgba(10,10,10,.88)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,.07)" : "none",
        transition: "all .3s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 32, height: 32, background: `${G}1a`, border: `1px solid ${G}35`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PiggyBank size={17} color={G} />
          </div>
          <span style={{ fontFamily: "Sora,sans-serif", fontSize: 20, fontWeight: 800, letterSpacing: "-.5px" }}>
            Din<span style={{ color: G }}>Hub</span>
          </span>
        </div>

        <nav className="hidden md:flex" style={{ display: "flex", gap: 32 }}>
          <a href="#funcionalidades" className="nav-link">Funcionalidades</a>
          <a href="#como-funciona" className="nav-link">Como funciona</a>
          <a href="#precos" className="nav-link">Preços</a>
        </nav>

        <div className="hidden md:flex" style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={go} className="outline-btn" style={{ padding: "8px 18px", fontSize: 14 }}>Entrar</button>
          <button onClick={go} className="solid-btn" style={{ padding: "8px 20px", fontSize: 14 }}>Começar grátis</button>
        </div>

        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ position: "fixed", top: 64, left: 0, right: 0, zIndex: 99, background: "rgba(10,10,10,.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.07)", padding: "20px 24px 28px" }}
          >
            <nav style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 20 }}>
              {["Funcionalidades", "Como funciona", "Preços"].map(l => (
                <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} className="nav-link" onClick={() => setMenuOpen(false)} style={{ fontSize: 16 }}>{l}</a>
              ))}
            </nav>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={go} className="outline-btn" style={{ padding: 13, fontSize: 15, fontWeight: 600 }}>Entrar</button>
              <button onClick={go} className="solid-btn glow-btn" style={{ padding: 13, fontSize: 15 }}>Começar grátis →</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "96px max(24px, calc((100vw - 1280px) / 2 + 24px)) 64px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 60, width: "100%", maxWidth: 1280, margin: "0 auto" }}>
          {/* Left */}
          <div style={{ flex: 1, maxWidth: 580 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${G}12`, border: `1px solid ${G}28`, borderRadius: 100, padding: "6px 14px", marginBottom: 28 }}>
              <span>🔥</span>
              <span style={{ display: "flex" }}>
                {AVATARS.map((u, i) => <img key={i} src={u} alt="" style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #0a0a0a", marginLeft: i ? -8 : 0, objectFit: "cover" }} />)}
              </span>
              <span style={{ fontSize: 13, color: G, fontWeight: 600 }}>+2.847 pessoas já assumiram o controle</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2, duration: .7, ease: [.22,1,.36,1] }}
              style={{ fontFamily: "Sora,sans-serif", fontSize: "clamp(36px,5.5vw,64px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-2px", margin: "0 0 20px" }}>
              Seu dinheiro some todo mês e você não sabe{" "}
              <span style={{ color: G }}>por quê.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .32 }}
              style={{ fontSize: 18, color: "rgba(255,255,255,.6)", lineHeight: 1.72, marginBottom: 36 }}>
              O DinHub analisa cada centavo, te avisa antes de virar problema e te mostra exatamente o que fazer. Em português, sem enrolação.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .42 }}
              style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
              <button onClick={go} className="solid-btn glow-btn"
                style={{ padding: "15px 28px", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                Descobrir para onde vai meu dinheiro <ArrowRight size={18} />
              </button>
              <button onClick={() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })}
                className="outline-btn" style={{ padding: "15px 24px", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                <Play size={15} fill="currentColor" /> Ver como funciona em 2 min
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .52 }}
              style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>Registre via</span>
              {[
                { icon: <MessageCircle size={12} />, label: "Texto", c: G },
                { icon: <Mic size={12} />, label: "Áudio", c: "#ff8c00" },
                { icon: <Camera size={12} />, label: "Foto", c: "#7c3aed" },
                { icon: <Zap size={12} />, label: "IA", c: "#f59e0b" },
              ].map(m => (
                <span key={m.label} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 100, padding: "4px 11px", fontSize: 12, color: m.c }}>
                  {m.icon} {m.label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right — mockups */}
          <motion.div initial={{ opacity: 0, x: 36 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .38, duration: .8, ease: [.22,1,.36,1] }}
            className="hidden lg:flex" style={{ flex: 1, position: "relative", justifyContent: "center", alignItems: "center", minHeight: 440 }}>
            <div className="float" style={{ position: "relative", width: "100%", maxWidth: 520 }}>
              {/* Laptop */}
              <div style={{ background: "#1c1c1e", borderRadius: "14px 14px 0 0", padding: "10px 10px 0", border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 40px 80px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.04)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3a3a3c", margin: "0 auto 8px" }} />
                <div style={{ borderRadius: 8, overflow: "hidden", aspectRatio: "16/10" }}>
                  <img src={screenHome} alt="DinHub Dashboard" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                </div>
              </div>
              <div style={{ height: 13, background: "linear-gradient(180deg,#2a2a2e,#1c1c1e)", borderRadius: "0 0 6px 6px", border: "1px solid rgba(255,255,255,.07)", borderTop: "none" }} />
              <div style={{ height: 5, background: "#111", borderRadius: "0 0 10px 10px", width: "76%", margin: "0 auto" }} />

              {/* Floating phone */}
              <div className="float2" style={{ position: "absolute", bottom: 24, right: -52, width: 148, background: "#1c1c1e", borderRadius: 32, padding: 10, border: "1px solid rgba(255,255,255,.13)", boxShadow: `0 24px 60px rgba(0,0,0,.72), 0 0 40px ${G}18` }}>
                <div style={{ width: 46, height: 13, background: "#0a0a0a", borderRadius: 7, margin: "0 auto 6px" }} />
                <div style={{ borderRadius: 20, overflow: "hidden", aspectRatio: "9/18" }}>
                  <img src={screenBot} alt="Bot Huby" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                </div>
              </div>

              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "80%", height: "70%", background: `radial-gradient(circle, ${G}07 0%, transparent 70%)`, pointerEvents: "none" }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── DOR / AGITAÇÃO ── */}
      <section style={{ padding: "80px max(24px, calc((100vw - 1100px) / 2 + 24px))" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontFamily: "Sora,sans-serif", fontSize: "clamp(26px,4vw,44px)", fontWeight: 800, letterSpacing: "-1px" }}>
            Você reconhece alguma dessas <span style={{ color: RED }}>situações?</span>
          </motion.h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 16 }}>
          {PAIN.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .1, duration: .5 }}
              className="card-hover" style={{ background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.16)", borderRadius: 18, padding: "26px 22px" }}>
              <span style={{ fontSize: 34, display: "block", marginBottom: 14 }}>{c.emoji}</span>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,.8)", lineHeight: 1.58 }}>{c.text}</p>
            </motion.div>
          ))}
        </div>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: .45 }}
          style={{ textAlign: "center", marginTop: 36, fontSize: 17, color: "rgba(255,255,255,.5)" }}>
          Se você se identificou com qualquer uma dessas situações,{" "}
          <span style={{ color: G, fontWeight: 600 }}>o DinHub foi feito para você.</span>
        </motion.p>
      </section>

      {/* ── SOLUÇÃO ── */}
      <section style={{ padding: "80px max(24px, calc((100vw - 1100px) / 2 + 24px))", background: "rgba(255,255,255,.018)", borderTop: "1px solid rgba(255,255,255,.07)", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 12 }}>A solução</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontFamily: "Sora,sans-serif", fontSize: "clamp(24px,4vw,42px)", fontWeight: 800, letterSpacing: "-1px" }}>
            O DinHub não é mais um app de finanças.<br />
            <span style={{ color: G }}>É o seu copiloto financeiro.</span>
          </motion.h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 18 }}>
          {PILLARS.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .12 }}
              className="card-hover" style={{ background: "rgba(255,255,255,.04)", border: `1px solid ${p.color}28`, borderRadius: 22, padding: "30px 26px" }}>
              <span style={{ fontSize: 38, display: "block", marginBottom: 16 }}>{p.icon}</span>
              <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 18, fontWeight: 700, color: p.color, marginBottom: 10 }}>{p.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.58)", lineHeight: 1.68 }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── BOT HUBY ── */}
      <section style={{ padding: "100px max(24px, calc((100vw - 1100px) / 2 + 24px))" }}>
        <div className="grid md:grid-cols-2 grid-cols-1" style={{ display: "grid", gap: 56, alignItems: "center" }}>
          {/* Chat mockup */}
          <motion.div initial={{ opacity: 0, x: -28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: .7, ease: [.22,1,.36,1] }}>
            <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 26, padding: 26, maxWidth: 420 }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,.07)" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${G}1e`, border: `1px solid ${G}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤖</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: G }}>Huby</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>Assistente financeiro IA • Online</p>
                </div>
                <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: G, boxShadow: `0 0 10px ${G}` }} />
              </div>
              {/* Messages */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 190 }}>
                <AnimatePresence>
                  {CHAT.slice(0, chatStep + 1).map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .3 }}
                      style={{ display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "82%",
                        background: msg.from === "huby" ? `${G}13` : "rgba(255,255,255,.08)",
                        border: msg.from === "huby" ? `1px solid ${G}30` : "1px solid rgba(255,255,255,.1)",
                        borderRadius: msg.from === "huby" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                        padding: "10px 14px", fontSize: 13, color: "rgba(255,255,255,.9)", lineHeight: 1.55,
                      }}>{msg.text}</div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {chatStep < CHAT.length - 1 && (
                  <div style={{ display: "flex", gap: 4, padding: "9px 14px", background: `${G}10`, border: `1px solid ${G}22`, borderRadius: "4px 16px 16px 16px", width: "fit-content" }}>
                    {[0,1,2].map(i => (
                      <motion.div key={i} animate={{ y: [0,-4,0] }} transition={{ repeat: Infinity, duration: .8, delay: i * .15 }}
                        style={{ width: 6, height: 6, borderRadius: "50%", background: G }} />
                    ))}
                  </div>
                )}
              </div>
              {/* Input modes */}
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.07)", display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {[["💬","Texto"],["🎤","Áudio"],["📷","Foto"],["⚡","IA"]].map(([icon,label]) => (
                  <span key={label} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: "5px 10px", fontSize: 12, color: "rgba(255,255,255,.55)", display: "flex", alignItems: "center", gap: 4 }}>
                    {icon} {label}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: .7, delay: .1, ease: [.22,1,.36,1] }}>
            <p style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 12 }}>Bot Huby</p>
            <h2 style={{ fontFamily: "Sora,sans-serif", fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 16, lineHeight: 1.15 }}>
              Conheça o Huby. Seu assistente financeiro pessoal.
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.58)", lineHeight: 1.72, marginBottom: 28 }}>
              Diferente de qualquer chatbot, o Huby conhece cada transação sua e fala exatamente o que você precisa ouvir — não só gráficos sem contexto.
            </p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {["Analisa seus padrões em tempo real","Envia alertas antes de virar problema","Responde perguntas sobre suas finanças","Sugere o que fazer com seu dinheiro"].map(item => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,.75)" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${G}20`, border: `1px solid ${G}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={12} color={G} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={go} className="solid-btn glow-btn" style={{ padding: "13px 26px", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
              Conversar com o Huby <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="funcionalidades" style={{ padding: "80px max(24px, calc((100vw - 1100px) / 2 + 24px))", background: "rgba(255,255,255,.018)", borderTop: "1px solid rgba(255,255,255,.07)", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontFamily: "Sora,sans-serif", fontSize: "clamp(24px,4vw,42px)", fontWeight: 800, letterSpacing: "-1px" }}>
            Tudo que você precisa para ter <span style={{ color: G }}>controle de verdade</span>
          </motion.h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .08 }}
              className="card-hover" style={{ background: "rgba(255,255,255,.04)", border: `1px solid ${f.color}22`, borderRadius: 18, padding: "22px 20px" }}>
              <span style={{ fontSize: 30, display: "block", marginBottom: 12 }}>{f.icon}</span>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: f.color, marginBottom: 7 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.52)", lineHeight: 1.62 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" style={{ padding: "100px max(24px, calc((100vw - 860px) / 2 + 24px))" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            style={{ fontSize: 12, color: G, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 12 }}>Como funciona</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontFamily: "Sora,sans-serif", fontSize: "clamp(24px,4vw,42px)", fontWeight: 800, letterSpacing: "-1px" }}>
            Começar é simples. <span style={{ color: G }}>Continuar é automático.</span>
          </motion.h2>
        </div>
        <div>
          {STEPS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * .15 }}
              style={{ display: "flex", alignItems: "flex-start", gap: 24, padding: "28px 0", borderBottom: i < STEPS.length - 1 ? "1px solid rgba(255,255,255,.06)" : "none" }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: `${G}18`, border: `1px solid ${G}38`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "Sora,sans-serif", fontSize: 22, fontWeight: 800, color: G }}>{s.n}</span>
              </div>
              <div>
                <h3 style={{ fontFamily: "Sora,sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,.52)", lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PROVA SOCIAL ── */}
      <section style={{ padding: "80px max(24px, calc((100vw - 1100px) / 2 + 24px))", background: "rgba(255,255,255,.018)", borderTop: "1px solid rgba(255,255,255,.07)", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontFamily: "Sora,sans-serif", fontSize: "clamp(24px,4vw,42px)", fontWeight: 800, letterSpacing: "-1px" }}>
            O que estão <span style={{ color: G }}>dizendo</span>
          </motion.h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(275px,1fr))", gap: 16, marginBottom: 48 }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .1 }}
              className="card-hover" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 22, padding: 26 }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                {"★★★★★".split("").map((s,j) => <span key={j} style={{ color: "#f59e0b", fontSize: 14 }}>{s}</span>)}
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.74)", lineHeight: 1.72, marginBottom: 18, fontStyle: "italic" }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img src={t.photo} alt={t.name} style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: `2px solid ${G}35` }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700 }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{t.age}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            { to: 2847, prefix: "+", suffix: "", label: "usuários ativos" },
            { to: 4.9, prefix: "", suffix: "★", label: "avaliação média", decimal: true },
            { to: 2.1, prefix: "R$ ", suffix: "M", label: "analisados", decimal: true },
          ].map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: .92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * .1 }}
              style={{ textAlign: "center", padding: "26px 16px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 20 }}>
              <p style={{ fontFamily: "Sora,sans-serif", fontSize: "clamp(28px,4vw,46px)", fontWeight: 800, color: G, lineHeight: 1 }}>
                <AnimatedCounter to={m.to} prefix={m.prefix} suffix={m.suffix} decimal={m.decimal} />
              </p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.45)", marginTop: 6 }}>{m.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PREÇOS ── */}
      <section id="precos" style={{ padding: "100px max(24px, calc((100vw - 880px) / 2 + 24px))" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontFamily: "Sora,sans-serif", fontSize: "clamp(24px,4vw,42px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 24 }}>
            Comece grátis. <span style={{ color: G }}>Evolua quando quiser.</span>
          </motion.h2>
          {/* Toggle */}
          <div style={{ display: "inline-flex", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 13, padding: 4, gap: 4 }}>
            {(["monthly","annual"] as const).map(p => (
              <button key={p} onClick={() => setPlan(p)} style={{ borderRadius: 10, padding: "8px 22px", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "DM Sans,sans-serif", transition: "all .2s", background: plan === p ? G : "transparent", color: plan === p ? "#000" : "rgba(255,255,255,.5)" }}>
                {p === "monthly" ? "Mensal" : <>Anual <span style={{ marginLeft: 4, fontSize: 11, background: plan === "annual" ? "rgba(0,0,0,.2)" : `${G}22`, color: plan === "annual" ? "#000" : G, padding: "2px 7px", borderRadius: 6, fontWeight: 700 }}>-40%</span></>}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          {/* Free */}
          <motion.div initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 26, padding: 34 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,.45)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Gratuito</p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 5, marginBottom: 28 }}>
              <span style={{ fontFamily: "Sora,sans-serif", fontSize: 46, fontWeight: 800, lineHeight: 1 }}>R$ 0</span>
              <span style={{ color: "rgba(255,255,255,.38)", fontSize: 14, marginBottom: 5 }}>/sempre</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12, marginBottom: 30 }}>
              {FREE_FEATURES.map(f => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,.68)" }}>
                  <Check size={15} color={G} /> {f}
                </li>
              ))}
            </ul>
            <button onClick={go} className="outline-btn" style={{ width: "100%", padding: 14, fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              Começar grátis <ArrowRight size={16} />
            </button>
          </motion.div>

          {/* Pro */}
          <motion.div initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            style={{ background: `linear-gradient(135deg,${G}13 0%,rgba(124,58,237,.09) 100%)`, border: `1px solid ${G}38`, borderRadius: 26, padding: 34, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 22, right: 22, background: G, color: "#000", fontSize: 11, fontWeight: 800, padding: "4px 11px", borderRadius: 100, letterSpacing: .5 }}>Mais popular</div>
            <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, background: `radial-gradient(circle,${G}18 0%,transparent 70%)`, pointerEvents: "none" }} />
            <p style={{ fontSize: 12, color: G, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Pro</p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 5, marginBottom: 4 }}>
              <span style={{ fontFamily: "Sora,sans-serif", fontSize: 46, fontWeight: 800, lineHeight: 1, color: G }}>
                {plan === "annual" ? "R$ 14,90" : "R$ 24,90"}
              </span>
              <span style={{ color: "rgba(255,255,255,.38)", fontSize: 14, marginBottom: 5 }}>/mês</span>
            </div>
            {plan === "annual"
              ? <p style={{ fontSize: 12, color: "rgba(255,255,255,.38)", marginBottom: 22 }}>R$ 178,80/ano · economize R$ 120</p>
              : <div style={{ marginBottom: 22 }} />}
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12, marginBottom: 30 }}>
              {PRO_FEATURES.map(f => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,.84)" }}>
                  <div style={{ width: 19, height: 19, borderRadius: "50%", background: `${G}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={11} color={G} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={go} className="solid-btn glow-btn" style={{ width: "100%", padding: 15, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              Começar Pro <ArrowRight size={16} />
            </button>
            <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,.32)", marginTop: 12 }}>3 dias grátis · sem cartão de crédito</p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: "100px max(24px, calc((100vw - 700px) / 2 + 24px))", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 60%,${G}12 0%,transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, borderTop: `1px solid ${G}14`, borderBottom: `1px solid ${G}14`, background: `${G}03`, pointerEvents: "none" }} />
        {[...Array(5)].map((_,i) => (
          <div key={i} style={{ position: "absolute", width: 250, height: 250, borderRadius: "50%", background: `radial-gradient(circle,${G}05 0%,transparent 70%)`, left: `${8+i*20}%`, top: `${15+(i%3)*28}%`, pointerEvents: "none" }} />
        ))}
        <div style={{ textAlign: "center", position: "relative" }}>
          <motion.h2 initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontFamily: "Sora,sans-serif", fontSize: "clamp(28px,5vw,54px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 20 }}>
            Chega de descobrir que ficou{" "}
            <span style={{ color: RED }}>no vermelho</span>{" "}
            só no fim do mês.
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: .1 }}
            style={{ fontSize: 18, color: "rgba(255,255,255,.56)", lineHeight: 1.72, marginBottom: 40 }}>
            Junte-se a +2.847 pessoas que já têm clareza total sobre seu dinheiro.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: .2 }}>
            <button onClick={go} className="solid-btn glow-btn"
              style={{ padding: "18px 44px", fontSize: 18, fontWeight: 800, letterSpacing: "-.3px", display: "inline-flex", alignItems: "center", gap: 10 }}>
              Começar agora — é grátis <ArrowRight size={20} />
            </button>
            <p style={{ marginTop: 14, fontSize: 13, color: "rgba(255,255,255,.32)" }}>
              Sem cartão de crédito. Cancele quando quiser.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "52px max(24px, calc((100vw - 1100px) / 2 + 24px)) 32px", borderTop: "1px solid rgba(255,255,255,.07)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: `${G}1e`, border: `1px solid ${G}32`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PiggyBank size={15} color={G} />
              </div>
              <span style={{ fontFamily: "Sora,sans-serif", fontSize: 18, fontWeight: 800 }}>Din<span style={{ color: G }}>Hub</span></span>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.38)", lineHeight: 1.62 }}>O copiloto financeiro inteligente para brasileiros.</p>
          </div>
          {[
            { title: "Produto", links: [["Funcionalidades","#funcionalidades"],["Como funciona","#como-funciona"],["Preços","#precos"]] },
            { title: "Legal", links: [["Política de Privacidade","/politica-privacidade"],["Termos de Uso","/termos-de-uso"]] },
            { title: "Suporte", links: [["Contato","#"],["Central de Ajuda","#"]] },
          ].map(g => (
            <div key={g.title}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>{g.title}</p>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {g.links.map(([label,href]) => (
                  <li key={label}>
                    <Link to={href} style={{ fontSize: 14, color: "rgba(255,255,255,.48)", textDecoration: "none" }}
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = G)}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = "rgba(255,255,255,.48)")}
                    >{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.07)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.28)" }}>© 2026 DinHub. Todos os direitos reservados.</p>
          <div style={{ display: "flex", gap: 20 }}>
            <Link to="/politica-privacidade" style={{ fontSize: 13, color: "rgba(255,255,255,.28)", textDecoration: "none" }}>Política de Privacidade</Link>
            <Link to="/termos-de-uso" style={{ fontSize: 13, color: "rgba(255,255,255,.28)", textDecoration: "none" }}>Termos de Uso</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
