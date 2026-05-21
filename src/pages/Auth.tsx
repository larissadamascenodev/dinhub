import React, { useState, useEffect } from "react";
import ContactModal from "@/components/shared/ContactModal";
import LegalModal from "@/components/shared/LegalModal";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Eye, EyeOff, ArrowRight, Mail, Lock,
  PiggyBank, MessageCircle, Mic, Image, Zap, Shield, User, Check,
  Wallet, BarChart3, Bell, Brain
} from "lucide-react";
import { Link } from "react-router-dom";

// ── ÍCONES SVG PREMIUM ──────────────────────────────────────
const ClockIcon = ({ size = 20, color = "#00e676" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const GridIcon = ({ size = 20, color = "#00e676" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const TargetIcon = ({ size = 20, color = "#00e676" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const BellIconSvg = ({ size = 20, color = "#00e676" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const TrendUpIcon = ({ size = 20, color = "#00e676" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);
const CardIcon = ({ size = 20, color = "#00e676" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const ZapIconSvg = ({ size = 16, color = "#ffa726" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const HomeIcon = ({ size = 18, color = "#00e676" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const ShuffleIcon = ({ size = 18, color = "#555" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 3 21 8"/>
    <line x1="4" y1="20" x2="21" y2="3"/>
    <polyline points="21 16 21 21 16 21"/>
    <line x1="15" y1="15" x2="21" y2="21"/>
    <line x1="4" y1="4" x2="9" y2="9"/>
  </svg>
);
const BotIcon = ({ size = 18, color = "#555" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/>
    <line x1="8" y1="16" x2="8" y2="16"/>
    <line x1="16" y1="16" x2="16" y2="16"/>
  </svg>
);
const UserIconSvg = ({ size = 18, color = "#555" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const PigIcon = ({ size = 22, color = "#00e676" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 10c0 4.4-3.1 8-7 8s-7-3.6-7-8 3.1-8 7-8 7 3.6 7 8z"/>
    <path d="M19 10h2l1 3h-3"/>
    <path d="M9 18l-1 2M15 18l1 2"/>
    <circle cx="9" cy="9" r="1" fill={color}/>
  </svg>
);
const ScaleIcon = ({ size = 11, color = "#555" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>
  </svg>
);
// Ícones de categoria exatos
const GamepadIcon = ({ size = 14, color = "#9b6bff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/>
    <circle cx="15" cy="12" r="1" fill={color}/>
    <path d="M6 5h12a2 2 0 0 1 2 2l1 8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2l1-8a2 2 0 0 1 2-2z"/>
  </svg>
);
const FileTextIcon = ({ size = 14, color = "#6b9fff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="16" y2="17"/>
  </svg>
);
const HeartIcon = ({ size = 14, color = "#ff5252" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const ForkKnifeIcon = ({ size = 14, color = "#ffa726" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="3" x2="8" y2="8"/><line x1="16" y1="3" x2="16" y2="8"/>
    <path d="M8 8c0 4 8 4 8 0"/><line x1="12" y1="8" x2="12" y2="21"/>
  </svg>
);
const DollarIcon = ({ size = 14, color = "#00e676" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const BarChartIconSvg = ({ size = 16, color = "#4d9fff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const SparkleIcon = ({ size = 16, color = "#9b6bff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>
  </svg>
);
const CrosshairIcon = ({ size = 16, color = "#ffd700" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="22" y1="12" x2="18" y2="12"/>
    <line x1="6" y1="12" x2="2" y2="12"/>
    <line x1="12" y1="6" x2="12" y2="2"/>
    <line x1="12" y1="22" x2="12" y2="18"/>
  </svg>
);
const SwordsIcon = ({ size = 16, color = "#ff8c42" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
    <line x1="13" y1="19" x2="19" y2="13"/>
    <line x1="16" y1="16" x2="20" y2="20"/>
    <line x1="19" y1="21" x2="21" y2="19"/>
    <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/>
    <line x1="5" y1="14" x2="9" y2="18"/>
    <line x1="7" y1="17" x2="3" y2="21"/>
  </svg>
);
const WalletIconSvg = ({ size = 16, color = "#00e676" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h14v4"/>
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
    <circle cx="18" cy="12" r="2" fill={color}/>
  </svg>
);

// ── DADOS ───────────────────────────────────────────────────
const bullets = [
  { Icon: ClockIcon, title: "Saldo atualizado em tempo real", sub: "Sem precisar abrir o banco. Você sabe exatamente quanto tem agora." },
  { Icon: GridIcon, title: "Cada real no lugar certo", sub: "Delivery, assinatura, mercado — tudo categorizado automaticamente." },
  { Icon: TargetIcon, title: "Metas que você realmente segue", sub: "Acompanhe o progresso e saiba se está no caminho antes do fim do mês." },
  { Icon: BellIconSvg, title: "Alerta antes de virar problema", sub: "A Huby te avisa quando algo sai do padrão. Não depois que já foi." },
];

const categories = [
  { name: "Eletrônicos", value: "R$ 442,49", pct: "24%", barW: "60%", color: "#9b6bff", Icon: GamepadIcon },
  { name: "Consórcio",   value: "R$ 293,57", pct: "16%", barW: "40%", color: "#6b9fff", Icon: FileTextIcon },
  { name: "Saúde",       value: "R$ 223,00", pct: "12%", barW: "30%", color: "#ff5252", Icon: HeartIcon },
  { name: "Alimentação", value: "R$ 197,98", pct: "11%", barW: "28%", color: "#ffa726", Icon: ForkKnifeIcon },
  { name: "Apostas",     value: "R$ 128,64", pct: "7%",  barW: "18%", color: "#00e676", Icon: DollarIcon },
];

const appNavItems = [
  { label: "Carteira",  Icon: WalletIconSvg,   bg: "#0d2b1a", iconColor: "#00e676" },
  { label: "Balanço",   Icon: BarChartIconSvg, bg: "#0d1a2b", iconColor: "#4d9fff" },
  { label: "Projeções", Icon: SparkleIcon,  bg: "#1a0d2b", iconColor: "#9b6bff" },
  { label: "Metas",     Icon: CrosshairIcon,bg: "#2b2a0d", iconColor: "#ffd700" },
  { label: "Desafios",  Icon: SwordsIcon,   bg: "#2b1a0d", iconColor: "#ff8c42" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};

const features = [
  { icon: <Wallet className="w-4 h-4" />, title: "Controle total", desc: "Receitas, despesas e cartões reunidos em um só lugar" },
  { icon: <Brain className="w-4 h-4" />, title: "Assistente financeiro", desc: "Analisa seus hábitos e sugere melhorias personalizadas" },
  { icon: <BarChart3 className="w-4 h-4" />, title: "Projeções inteligentes", desc: "Acompanhe projeções do seu dinheiro para o futuro" },
  { icon: <Shield className="w-4 h-4" />, title: "Radar financeiro", desc: "Entenda para onde seu dinheiro está indo de verdade" },
];

const AVATAR_URLS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
];


// ── COMPONENTE ───────────────────────────────────────────────
const VisaoGeral = () => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const floatCard = (delay: string, pos: React.CSSProperties = {}) => ({
    position: "absolute" as const,
    background: "#111111",
    border: "1px solid #1f1f1f",
    borderRadius: 16,
    padding: "13px 15px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)",
    zIndex: 3,
    minWidth: 158,
    maxWidth: 192,
    opacity: animated ? 1 : 0,
    transform: animated ? "translateY(0)" : "translateY(14px)",
    transition: `opacity 0.9s ease ${delay}, transform 0.9s ease ${delay}`,
    ...pos,
  });

  const iconBox = (bg: string) => ({
    width: 30, height: 30, borderRadius: 9,
    background: bg,
    display: "flex", alignItems: "center" as const, justifyContent: "center" as const,
    flexShrink: 0,
  });

  return (
    <section style={{
      background: "#0a0a0a",
      padding: "clamp(4.5rem,9vw,8rem) 0",
      position: "relative",
      overflow: "hidden",
      textAlign: "left" as const,
    }}>
      {/* Glow fundo */}
      <div style={{
        position: "absolute", top: "50%", right: 0,
        transform: "translateY(-50%)",
        width: "55vw", height: "55vw",
        background: "radial-gradient(ellipse,rgba(0,230,118,0.07),transparent 65%)",
        pointerEvents: "none",
      }} />

      <div style={{
        width: "min(92vw,1320px)", margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
        gap: "clamp(2.5rem,5vw,5rem)",
        alignItems: "center",
      }}>

        {/* ── COPY ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(0,230,118,0.07)",
            border: "1px solid rgba(0,230,118,0.22)",
            borderRadius: 999, padding: "0.45rem 1rem",
            fontSize: "clamp(0.65rem,0.8vw,0.75rem)",
            fontWeight: 700, letterSpacing: "0.16em",
            textTransform: "uppercase", color: "#00e676",
            width: "fit-content", fontFamily: "'Inter',sans-serif",
          }}>
            <ClockIcon size={13} />
            Sua Central Financeira
          </span>

          <h2 style={{
            fontFamily: "'Sora',sans-serif", fontWeight: 800,
            fontSize: "clamp(1.9rem,3.5vw,3.2rem)",
            lineHeight: 1.08, letterSpacing: "-0.02em",
            color: "#fff", margin: 0,
          }}>
            Tudo que acontece com seu dinheiro,{" "}
            <span style={{ color: "#00e676" }}>em um lugar só.</span>
          </h2>

          <p style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: "clamp(1rem,1.2vw,1.15rem)",
            color: "#a0a0a0", lineHeight: 1.65,
            margin: 0, maxWidth: "44ch",
          }}>
            Chega de abrir mil apps, planilha e extrato do banco. O DinHub reúne tudo e te entrega uma visão clara do que está acontecendo — e do que você precisa fazer agora.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", marginTop: "0.3rem" }}>
            {bullets.map(({ Icon, title, sub }, i) => (
              <div key={i} style={{ display: "flex", gap: "0.9rem", alignItems: "flex-start" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: "rgba(0,230,118,0.07)",
                  border: "1px solid rgba(0,230,118,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={20} />
                </div>
                <div>
                  <b style={{ fontFamily: "'Sora',sans-serif", fontSize: "0.98rem", fontWeight: 600, color: "#fff", display: "block", marginBottom: "0.15rem" }}>{title}</b>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.86rem", color: "#a0a0a0", lineHeight: 1.5 }}>{sub}</span>
                </div>
              </div>
            ))}
          </div>

          <a href="#signup"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              color: "#00e676", fontFamily: "'Sora',sans-serif",
              fontWeight: 600, fontSize: "1rem",
              textDecoration: "none", marginTop: "0.5rem",
              transition: "gap 0.2s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.gap = "0.9rem"}
            onMouseLeave={e => e.currentTarget.style.gap = "0.5rem"}
          >
            Ver o DinHub funcionando
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>

        {/* ── MOCKUP IPHONE ── */}
        <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", minHeight: 640 }}>

          {/* Card flutuante 1 — Receita */}
          <div style={floatCard("0.2s", { top: "4%", left: "-2%" })}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
              <div style={iconBox("rgba(0,230,118,0.12)")}><TrendUpIcon size={14} /></div>
              <span style={{ fontSize: "0.7rem", color: "#777", fontFamily: "'Inter',sans-serif" }}>Receita no mês</span>
            </div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#00e676" }}>R$ 2.131,02</div>
            <div style={{ fontSize: "0.62rem", color: "#555", marginTop: 3, fontFamily: "'Inter',sans-serif" }}>+9% vs. Abril</div>
          </div>

          {/* Card flutuante 2 — Meta */}
          <div style={floatCard("0.4s", { bottom: "28%", left: "-4%" })}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
              <div style={iconBox("rgba(155,107,255,0.15)")}><TargetIcon size={14} color="#9b6bff" /></div>
              <span style={{ fontSize: "0.7rem", color: "#777", fontFamily: "'Inter',sans-serif" }}>Meta de economia</span>
            </div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#fff", marginBottom: 7 }}>R$ 2.000,00</div>
            <div style={{ height: 5, background: "#1c1c1c", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: "68%", height: "100%", background: "linear-gradient(90deg,#00e676,#00ff88)", borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: "0.62rem", color: "#00e676", marginTop: 4, fontFamily: "'Inter',sans-serif" }}>68% concluído</div>
          </div>

          {/* Card flutuante 3 — Alerta */}
          <div style={floatCard("0.6s", { top: "14%", right: "-2%" })}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
              <div style={iconBox("rgba(0,230,118,0.12)")}><BellIconSvg size={14} /></div>
              <span style={{ fontSize: "0.7rem", color: "#00e676", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>Alerta de gasto</span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "#bbb", fontFamily: "'Inter',sans-serif", lineHeight: 1.45, margin: 0 }}>
              Você ultrapassou o limite de <span style={{ color: "#00e676" }}>delivery</span> este mês.
            </p>
          </div>

          {/* Card flutuante 4 — Saldo */}
          <div style={floatCard("0.8s", { bottom: "8%", right: "-2%" })}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
              <div style={iconBox("rgba(0,230,118,0.12)")}><CardIcon size={14} /></div>
              <span style={{ fontSize: "0.7rem", color: "#777", fontFamily: "'Inter',sans-serif" }}>Saldo atual</span>
            </div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#00e676" }}>R$ 494,76</div>
            <div style={{ fontSize: "0.62rem", color: "#555", marginTop: 3, fontFamily: "'Inter',sans-serif" }}>Atualizado agora</div>
          </div>

          {/* ── IPHONE ── */}
          <div style={{
            width: "clamp(248px,21vw,292px)",
            background: "#050505",
            border: "9px solid #181818",
            borderRadius: 48,
            boxShadow: "0 0 0 1px #222, 0 40px 100px rgba(0,0,0,0.7), 0 0 70px rgba(0,230,118,0.12)",
            position: "relative", overflow: "hidden", zIndex: 2,
          }}>
            {/* Notch */}
            <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 90, height: 22, background: "#000", borderRadius: 99, zIndex: 5 }} />

            <div style={{ background: "#090909", padding: "2.5rem 0.75rem 0.75rem" }}>

              {/* Status bar */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", color: "#444", padding: "0 0.25rem 0.5rem", fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>
                <span>02:08</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {/* Signal */}
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 1.5 }}>
                    {[3,5,7,9].map((h,i) => <div key={i} style={{ width: 3, height: h, background: i < 3 ? "#555" : "#333", borderRadius: 1 }} />)}
                  </div>
                  {/* Wifi */}
                  <svg width="13" height="9" viewBox="0 0 20 14" fill="none">
                    <path d="M1 4C4.5 1 15.5 1 19 4" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M4 7.5C6.5 5.5 13.5 5.5 16 7.5" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M7 11C8.5 9.5 11.5 9.5 13 11" stroke="#555" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="10" cy="13" r="1.5" fill="#555"/>
                  </svg>
                  {/* Battery */}
                  <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <div style={{ width: 20, height: 10, border: "1.5px solid #555", borderRadius: 3, position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", left: 1.5, top: 1.5, bottom: 1.5, width: "70%", background: "#555", borderRadius: 1.5 }} />
                    </div>
                    <div style={{ width: 2, height: 5, background: "#555", borderRadius: 1 }} />
                  </div>
                </div>
              </div>

              {/* App Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <PigIcon size={20} color="#00e676" />
                  <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "0.88rem", color: "#fff", letterSpacing: "-0.01em" }}>
                    Din<span style={{ color: "#00e676" }}>Hub</span>
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {/* Bell badge */}
                  <div style={{ position: "relative" }}>
                    <BellIconSvg size={15} color="#666" />
                    <div style={{ position: "absolute", top: -5, right: -5, width: 14, height: 14, background: "#00e676", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.44rem", color: "#000", fontWeight: 800, fontFamily: "'Sora',sans-serif" }}>4</div>
                  </div>
                  {/* Streak badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: 3, background: "#1a1200", border: "1px solid #3a2a00", borderRadius: 99, padding: "3px 7px" }}>
                    <ZapIconSvg size={11} color="#ffa726" />
                    <span style={{ fontSize: "0.55rem", color: "#ffa726", fontWeight: 700, fontFamily: "'Sora',sans-serif" }}>2</span>
                  </div>
                </div>
              </div>

              {/* Greeting + Tabs */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.6rem" }}>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#fff" }}>
                    Bom dia, <span style={{ color: "#00e676" }}>Elisa</span>
                  </div>
                  <div style={{ fontSize: "0.6rem", color: "#444", fontFamily: "'Inter',sans-serif", marginTop: 1 }}>Quarta-feira, 20 de maio</div>
                </div>
                <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                  {["Abr", "Mai", "Jun"].map((tab, i) => (
                    <span key={i} style={{
                      padding: "4px 10px", borderRadius: 99,
                      fontSize: "0.58rem", fontFamily: "'Inter',sans-serif", fontWeight: 600,
                      background: i === 1 ? "#00e676" : "transparent",
                      color: i === 1 ? "#000" : "#444",
                    }}>{tab}</span>
                  ))}
                </div>
              </div>

              {/* Saldo card */}
              <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, padding: "11px 12px", marginBottom: "0.5rem", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                  <ScaleIcon size={11} />
                  <span style={{ fontSize: "0.5rem", color: "#444", fontFamily: "'Inter',sans-serif", letterSpacing: "0.12em", textTransform: "uppercase" }}>Saldo Disponível</span>
                </div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#fff", letterSpacing: "-0.02em" }}>R$ 494,76</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e676", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.58rem", color: "#555", fontFamily: "'Inter',sans-serif" }}>
                    Previsto no final do mês{" "}
                    <span style={{ color: "#00e676", fontWeight: 600 }}>R$ 334,88</span>
                  </span>
                </div>
              </div>

              {/* Dots indicator */}
              <div style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: "0.5rem" }}>
                <div style={{ width: 20, height: 4, borderRadius: 99, background: "#00e676" }} />
                <div style={{ width: 4, height: 4, borderRadius: 99, background: "#333" }} />
              </div>

              {/* Receitas / Despesas */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: "0.55rem", textAlign: "left" }}>
                <div style={{ background: "rgba(0,230,118,0.08)", border: "1px solid rgba(0,230,118,0.15)", borderRadius: 12, padding: "9px 10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 4 }}>
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 8L8 2M8 2H3M8 2V7" stroke="#00e676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize: "0.48rem", color: "#00e676", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Inter',sans-serif" }}>Receitas</span>
                  </div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "0.82rem", color: "#00e676" }}>R$ 2.131,02</div>
                </div>
                <div style={{ background: "rgba(220,53,69,0.08)", border: "1px solid rgba(220,53,69,0.15)", borderRadius: 12, padding: "9px 10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 4 }}>
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 2L8 8M8 8H3M8 8V3" stroke="#ff5252" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize: "0.48rem", color: "#ff5252", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Inter',sans-serif" }}>Despesas</span>
                  </div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "0.82rem", color: "#ff5252" }}>R$ 1.961,14</div>
                </div>
              </div>

              {/* Nav ícones circulares */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.55rem", overflowX: "auto" }}>
                {appNavItems.map(({ label, Icon, bg, iconColor }, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0, minWidth: 44 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={16} color={iconColor} />
                    </div>
                    <span style={{ fontSize: "0.46rem", color: "#555", fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Gastos por categoria */}
              <div style={{ background: "#0d0d0d", borderRadius: 12, padding: "9px 10px", textAlign: "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.55rem", color: "#444", fontFamily: "'Inter',sans-serif" }}>Gastos por categoria · Maio</span>
                  <span style={{ fontSize: "0.53rem", color: "#00e676", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>Análise completa ›</span>
                </div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#fff", marginBottom: 6 }}>R$ 1.833,60</div>

                {/* Barra proporcional */}
                <div style={{ display: "flex", gap: 3, marginBottom: 8, height: 5, borderRadius: 99, overflow: "hidden" }}>
                  {[{ w: "34%", c: "#9b6bff" }, { w: "23%", c: "#6b9fff" }, { w: "16%", c: "#ff5252" }, { w: "14%", c: "#ffa726" }, { w: "13%", c: "#00e676" }]
                    .map((b, i) => <div key={i} style={{ width: b.w, background: b.c, flexShrink: 0 }} />)}
                </div>

                {categories.map(({ name, value, pct, barW, color, Icon: CatIcon }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: i < 4 ? 7 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <CatIcon size={13} color={color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.63rem", color: "#ddd", fontFamily: "'Inter',sans-serif", fontWeight: 500, marginBottom: 2 }}>{name}</div>
                        <div style={{ height: 3, background: "#1a1a1a", borderRadius: 99, overflow: "hidden", width: "80%" }}>
                          <div style={{ width: barW, height: "100%", background: color, borderRadius: 99 }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "0.62rem", color: "#fff", fontFamily: "'Sora',sans-serif", fontWeight: 600 }}>{value}</div>
                      <div style={{ fontSize: "0.5rem", color: "#444", fontFamily: "'Inter',sans-serif" }}>{pct}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Nav */}
              <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", marginTop: "0.7rem", paddingTop: "0.6rem", borderTop: "1px solid #111" }}>
                {[
                  { label: "Início",     I: HomeIcon,    active: true },
                  { label: "Transações", I: ShuffleIcon, active: false },
                  { plus: true },
                  { label: "Bot Huby",   I: BotIcon,     active: false },
                  { label: "Perfil",     I: UserIconSvg, active: false },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    {(item as any).plus ? (
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#00e676", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </div>
                    ) : (
                      <>
                        <item.I size={17} color={item.active ? "#00e676" : "#444"} />
                        <span style={{ fontSize: "0.44rem", color: item.active ? "#00e676" : "#444", fontFamily: "'Inter',sans-serif", fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);

  const openAuthModal = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setIsAuthModalOpen(true);
  };

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <PiggyBank className="w-8 h-8 text-primary animate-pulse" />
          <span className="text-muted-foreground text-sm">Carregando...</span>
        </motion.div>
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error("Digite seu email primeiro");
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar email de recuperação");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (!isLogin && !fullName.trim()) {
      toast.error("Preencha seu nome completo");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (!isLogin && !acceptedTerms) {
      toast.error("Você precisa aceitar os termos para continuar");
      return;
    }
    setSubmitting(true);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Kick off data prefetch immediately so dashboard is ready by the time we navigate
        if (data.session?.user) {
          const now = new Date();
          const { prefetchDashboardData } = await import("@/services/dashboardData");
          void prefetchDashboardData(now.getMonth(), now.getFullYear(), {
            userId: data.session.user.id,
            includeHistorical: false,
          }).catch(() => {});
        }
        toast.success("Login realizado com sucesso!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: fullName.trim() },
          },
        });
        if (error) throw error;
        toast.success("Conta criada com sucesso!");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar sua solicitação");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Reusable sub-sections ── */




  const SocialProofBadge = ({ className = "", mobile = false }: { className?: string; mobile?: boolean }) => (
    <span className={`inline-flex items-center gap-1.5 bg-primary/10 text-primary font-medium rounded-full border border-primary/15 backdrop-blur-sm ${mobile ? "text-[8px] px-2.5 py-1 mx-auto" : "text-[10px] px-3 py-1.5 mx-auto"} ${className}`}>
      <span className="flex -space-x-1.5">
        {AVATAR_URLS.map((url, i) => (
          <img
            key={i}
            src={url}
            alt=""
            className={`rounded-full border border-background object-cover ${mobile ? "w-3.5 h-3.5" : "w-4 h-4"}`}
          />
        ))}
      </span>
      +2.847 pessoas controlando suas finanças
    </span>
  );

  const HeadlineSection = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="text-center">
      <h1 className={`font-display font-bold leading-[1.1] text-foreground ${mobile ? "text-2xl" : "text-4xl xl:text-6xl"}`}>
        Assuma o controle{" "}
        total da sua{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">
          vida financeira.
        </span>
      </h1>
      <p className={`text-muted-foreground leading-relaxed mx-auto ${mobile ? "mt-1.5 text-[11px]" : "mt-6 text-lg max-w-2xl"}`}>
        Organize suas finanças, entenda para onde seu dinheiro vai e acompanhe a evolução do seu patrimônio em tempo real.
      </p>
    </div>
  );

  const InputMethodsPill = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`inline-flex items-center gap-1 bg-gradient-to-r from-primary/10 via-card/50 to-primary/5 border border-primary/15 rounded-full text-muted-foreground backdrop-blur-sm mx-auto ${mobile ? "text-[8px] px-2.5 py-1" : "text-[10px] px-4 py-2 gap-2"}`}>
      <span className="text-foreground/70 font-medium">Registre via</span>
      <span className="flex items-center gap-0.5 text-primary font-semibold"><MessageCircle className={mobile ? "w-2 h-2" : "w-3 h-3"} /> texto</span>
      <span className="text-primary/30">|</span>
      <span className="flex items-center gap-0.5 text-primary/80"><Mic className={mobile ? "w-2 h-2" : "w-3 h-3"} /> áudio</span>
      <span className="text-primary/30">|</span>
      <span className="flex items-center gap-0.5 text-primary/80"><Image className={mobile ? "w-2 h-2" : "w-3 h-3"} /> foto</span>
      <Zap className={`${mobile ? "w-2 h-2" : "w-3 h-3"} text-primary ml-0.5`} />
    </div>
  );

  const FeaturesGrid = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`grid ${mobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"} gap-3 w-full`}>
      {features.map((f) => (
        <div
          key={f.title}
          className={`flex items-center gap-3 bg-card/40 border border-border/40 rounded-2xl backdrop-blur-sm ${mobile ? "px-3 py-2.5" : "p-4"}`}
        >
          <div className={`${mobile ? "w-8 h-8 rounded-lg" : "w-10 h-10 rounded-xl"} bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0`}>
            {React.cloneElement(f.icon, { className: mobile ? "w-4 h-4" : "w-5 h-5" })}
          </div>
          <div className="text-left min-w-0">
            <p className={`font-bold text-foreground leading-none ${mobile ? "text-[11px]" : "text-sm"}`}>{f.title}</p>
            <p className={`text-muted-foreground leading-tight mt-1.5 ${mobile ? "text-[9px]" : "text-xs"}`}>{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const testimonials = [
    {
      name: "Rafael M.",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      text: "Finalmente consigo enxergar para onde meu dinheiro vai. O DinHub me deu o controle que eu precisava para organizar minha vida financeira.",
    },
    {
      name: "Camila S.",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
      text: "Nunca fui de anotar gastos, mas com o DinHub virou hábito. Em 2 meses já consegui juntar minha primeira reserva de emergência!",
    },
    {
      name: "Lucas P.",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
      text: "O melhor app financeiro que já usei. As projeções inteligentes me ajudaram a planejar uma viagem sem apertar o orçamento.",
    },
    {
      name: "Fernanda R.",
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
      text: "Uso todos os dias! As metas visuais me motivam demais. Já alcancei 3 objetivos financeiros em menos de 6 meses.",
    },
    {
      name: "João V.",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
      text: "Simples, bonito e funcional. Recomendo para qualquer pessoa que quer ter mais controle sobre as finanças pessoais.",
    },
  ];

  const TestimonialCard = ({ mobile = false }: { mobile?: boolean }) => {
    const [activeIdx, setActiveIdx] = React.useState(0);

    React.useEffect(() => {
      const interval = setInterval(() => {
        setActiveIdx((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }, []);

    const t = testimonials[activeIdx];

    return (
      <div className={`bg-card/40 border border-border/60 rounded-xl ${mobile ? "p-3.5" : "p-5"} backdrop-blur-sm space-y-2 overflow-hidden`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2.5">
              <img
                src={t.photo}
                alt=""
                className="w-8 h-8 rounded-full object-cover border border-primary/20"
              />
              <div>
                <p className="text-xs font-semibold text-foreground">{t.name}</p>
                <div className="flex gap-0.5 text-yellow-400 text-[10px]">★★★★★</div>
              </div>
            </div>
            <p className={`text-muted-foreground italic leading-relaxed ${mobile ? "text-[11px]" : "text-xs"}`}>
              "{t.text}"
            </p>
          </motion.div>
        </AnimatePresence>
        {/* Dots */}
        <div className="flex justify-center gap-1.5 pt-1">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === activeIdx ? "bg-primary w-4" : "bg-muted-foreground/30"}`}
            />
          ))}
        </div>
      </div>
    );
  };

  /* ── Auth form card ── */
  const renderAuthFormCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="bg-card/30 border border-border/50 rounded-2xl p-5 sm:p-7 backdrop-blur-md space-y-4 sm:space-y-5"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? "login" : "signup"}
          initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
          transition={{ duration: 0.25 }}
        >
          <h2 className="text-lg font-semibold text-foreground">
            {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isLogin ? "Entre para continuar gerenciando suas finanças" : "Comece a controlar suas finanças agora"}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Google OAuth only — signup requires terms */}
      <button
        type="button"
        onClick={async () => {
          if (!isLogin && !acceptedTerms) {
            toast.error("Você precisa aceitar os termos para continuar");
            return;
          }
          const { error } = await lovable.auth.signInWithOAuth("google", {
            redirect_uri: window.location.origin,
          });
          if (error) toast.error("Erro ao entrar com Google");
        }}
        className="flex items-center justify-center gap-2.5 w-full h-10 rounded-xl border border-border/60 bg-card/40 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm text-xs text-muted-foreground"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuar com Google
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/40" />
        </div>
        <div className="relative flex justify-center text-[10px]">
          <span className="bg-background/80 px-3 text-muted-foreground backdrop-blur-sm">ou continue com email</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {!isLogin && (
          <div className="relative group">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-11 h-11 bg-card/40 border-border/60 rounded-xl backdrop-blur-sm focus:border-primary/50 focus:bg-card/60 transition-all duration-300 text-sm"
              autoComplete="name"
            />
          </div>
        )}
        <div className="relative group">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-11 h-11 bg-card/40 border-border/60 rounded-xl backdrop-blur-sm focus:border-primary/50 focus:bg-card/60 transition-all duration-300 text-sm"
            autoComplete="email"
          />
        </div>

        <div className="relative group">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-11 pr-11 h-11 bg-card/40 border-border/60 rounded-xl backdrop-blur-sm focus:border-primary/50 focus:bg-card/60 transition-all duration-300 text-sm"
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {isLogin && (
          <div className="text-right">
            <button type="button" onClick={handleForgotPassword} className="text-[10px] text-muted-foreground hover:text-primary transition-colors">
              Esqueceu a senha?
            </button>
          </div>
        )}

        {/* Terms checkbox — only for signup */}
        {!isLogin && (
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <button
              type="button"
              onClick={() => setAcceptedTerms(!acceptedTerms)}
              className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                acceptedTerms
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "border-border/60 bg-card/40"
              }`}
            >
              {acceptedTerms && <Check className="w-3 h-3" />}
            </button>
            <span className="text-[10px] text-muted-foreground leading-relaxed">
              Li e concordo com os{" "}
              <button type="button" onClick={() => setLegalModal("terms")} className="text-primary hover:underline underline-offset-2">
                Termos de Uso
              </button>{" "}
              e a{" "}
              <button type="button" onClick={() => setLegalModal("privacy")} className="text-primary hover:underline underline-offset-2">
                Política de Privacidade
              </button>
            </span>
          </label>
        )}

        <Button
          type="submit"
          disabled={submitting || (!isLogin && !acceptedTerms)}
          className="w-full h-11 font-semibold text-sm rounded-xl bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20 relative overflow-hidden group transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="animate-pulse">Processando...</span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              {isLogin ? "Entrar" : "Criar conta"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          )}
        </Button>
      </form>

      {/* Toggle */}
      <p className="text-center text-xs text-muted-foreground">
        {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-primary font-medium hover:underline underline-offset-2"
        >
          {isLogin ? "Criar conta" : "Fazer login"}
        </button>
      </p>
    </motion.div>
  );

  return (
    <div className="dark min-h-screen bg-background flex flex-col relative overflow-hidden">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px]" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-6 lg:px-10 py-4 relative z-30"
      >
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-foreground tracking-tight">
            Din<span className="text-primary">Hub</span>
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openAuthModal(true)}
            className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:flex"
          >
            Entrar
          </Button>
          <Button 
            size="sm" 
            onClick={() => openAuthModal(false)}
            className="text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-full px-5"
          >
            Cadastre-se
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openAuthModal(true)}
            className="text-xs font-medium text-muted-foreground sm:hidden"
          >
            Entrar
          </Button>
        </div>
      </motion.header>

      {/* Main content - Centered marketing */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-20 relative z-10 max-w-4xl mx-auto text-center space-y-8 lg:space-y-10">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <SocialProofBadge />
        </motion.div>
        
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <HeadlineSection />
        </motion.div>

        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <InputMethodsPill />
        </motion.div>

        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="w-full">
          <VisaoGeral />
        </motion.div>

        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="pt-6">

          <Button 
            size="lg" 
            onClick={() => openAuthModal(false)}
            className="h-14 px-10 text-base font-bold rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-300 group"
          >
            Começar Agora Grátis
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="w-full max-w-lg">
          <TestimonialCard />
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-8 border-t border-border/10 text-[10px] sm:text-xs text-muted-foreground/50 relative z-10"
      >
        <span className="flex items-center gap-2">
          <PiggyBank className="w-4 h-4 text-primary/60" />
          <span>DinHub © {new Date().getFullYear()}</span>
        </span>
        <div className="flex items-center gap-4 sm:gap-6">
          <button onClick={() => setLegalModal("terms")} className="hover:text-primary transition-colors">Termos de Uso</button>
          <button onClick={() => setLegalModal("privacy")} className="hover:text-primary transition-colors">Política de Privacidade</button>
          <button onClick={() => setShowContact(true)} className="hover:text-primary transition-colors">Contato</button>
        </div>
      </motion.footer>

      {/* Auth Modal */}
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="sm:max-w-[440px] p-0 border-none bg-transparent overflow-hidden shadow-none">
          <div className="relative z-50">
            {renderAuthFormCard()}
          </div>
        </DialogContent>
      </Dialog>

      <ContactModal open={showContact} onClose={() => setShowContact(false)} />
      <LegalModal open={!!legalModal} onClose={() => setLegalModal(null)} type={legalModal || "terms"} />
    </div>
  );
};

export default Auth;
