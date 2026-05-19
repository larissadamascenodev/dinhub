import React from "react";
import { 
  BarChart3, 
  Wallet, 
  CreditCard, 
  PieChart, 
  ShieldCheck, 
  Zap, 
  Bell, 
  Search, 
  Smartphone,
  Target,
  ArrowUpRight,
  TrendingUp,
  BrainCircuit,
  Globe,
  PlusCircle,
  History,
  Lock,
  MessageSquare,
  Sparkles,
  ZapIcon
} from "lucide-react";
import { NEON } from "./shared";

const tools = [
  { icon: <BrainCircuit size={20} />, name: "IA Huby" },
  { icon: <Wallet size={20} />, name: "Contas" },
  { icon: <CreditCard size={20} />, name: "Cartões" },
  { icon: <Target size={20} />, name: "Metas" },
  { icon: <TrendingUp size={20} />, name: "Investimentos" },
  { icon: <BarChart3 size={20} />, name: "Relatórios" },
  { icon: <Bell size={20} />, name: "Alertas" },
  { icon: <ShieldCheck size={20} />, name: "Segurança" },
  { icon: <Zap size={20} />, name: "Instantâneo" },
  { icon: <Search size={20} />, name: "Auditoria" },
  { icon: <Smartphone size={20} />, name: "App Mobile" },
  { icon: <PieChart size={20} />, name: "Categorias" },
  { icon: <ArrowUpRight size={20} />, name: "Cashback" },
  { icon: <Globe size={20} />, name: "Global" },
  { icon: <PlusCircle size={20} />, name: "Nova Transação" },
  { icon: <History size={20} />, name: "Extrato" },
  { icon: <Lock size={20} />, name: "Privacidade" },
  { icon: <MessageSquare size={20} />, name: "Suporte" },
  { icon: <Sparkles size={20} />, name: "Insights" },
  { icon: <ZapIcon size={20} />, name: "Velocidade" },
];

export const ToolsMarquee = () => {
  return (
    <div className="relative w-full py-8 lg:py-12 overflow-hidden bg-[#0a0a0a] border-y border-white/[0.05]">
      {/* Decorative gradient edges - stronger for better fade */}
      <div className="absolute inset-y-0 left-0 w-32 lg:w-96 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 lg:w-96 bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent z-10 pointer-events-none" />
      
      <div className="flex flex-col gap-4 lg:gap-6">
        {/* Row 1 - Left to Right */}
        <div className="flex whitespace-nowrap gap-4 lg:gap-6 w-max animate-marquee">
          {[...tools, ...tools, ...tools].map((tool, idx) => (
            <div 
              key={`r1-${idx}`}
              className="inline-flex items-center gap-3 px-6 py-3 lg:px-10 lg:py-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md transition-all hover:bg-white/[0.08] hover:border-white/20 group cursor-default"
            >
              <div 
                className="transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(0,230,118,0.6)]"
                style={{ color: NEON }}
              >
                {tool.icon}
              </div>
              <span className="text-white/40 font-bold text-[11px] lg:text-[13px] uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                {tool.name}
              </span>
            </div>
          ))}
        </div>

        {/* Row 2 - Right to Left */}
        <div className="flex whitespace-nowrap gap-4 lg:gap-6 w-max animate-marquee-reverse">
          {[...tools, ...tools, ...tools].reverse().map((tool, idx) => (
            <div 
              key={`r2-${idx}`}
              className="inline-flex items-center gap-3 px-6 py-3 lg:px-10 lg:py-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md transition-all hover:bg-white/[0.08] hover:border-white/20 group cursor-default"
            >
              <div 
                className="transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(0,230,118,0.6)]"
                style={{ color: NEON }}
              >
                {tool.icon}
              </div>
              <span className="text-white/40 font-bold text-[11px] lg:text-[13px] uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                {tool.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-33.33%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 60s linear infinite;
        }
        .animate-marquee:hover, .animate-marquee-reverse:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
