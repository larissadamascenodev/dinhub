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
  ZapIcon,
  CircleDollarSign,
  PiggyBank
} from "lucide-react";
import { NEON, CARD_BG, CARD_BORDER } from "./shared";

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
  { icon: <PlusCircle size={20} />, name: "Novo" },
  { icon: <History size={20} />, name: "Extrato" },
  { icon: <Lock size={20} />, name: "Privacidade" },
  { icon: <MessageSquare size={20} />, name: "Suporte" },
  { icon: <Sparkles size={20} />, name: "Insights" },
  { icon: <CircleDollarSign size={20} />, name: "Câmbio" },
  { icon: <PiggyBank size={20} />, name: "Poupança" },
  { icon: <ZapIcon size={20} />, name: "Eficiência" },
];

export const ToolsMarquee = () => {
  return (
    <div className="relative w-full py-10 lg:py-16 overflow-hidden bg-[#0a0a0a]">
      {/* Subtle background glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full opacity-[0.03] blur-[100px] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${NEON} 0%, transparent 70%)` }}
      />

      {/* Decorative gradient edges - Very strong for seamless flow */}
      <div className="absolute inset-y-0 left-0 w-32 lg:w-[350px] bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 lg:w-[350px] bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent z-20 pointer-events-none" />
      
      <div className="flex flex-col gap-4 lg:gap-6">
        {/* Row 1 - Left to Right */}
        <div className="flex whitespace-nowrap gap-4 lg:gap-6 w-max animate-marquee">
          {[...tools, ...tools, ...tools].map((tool, idx) => (
            <div 
              key={`r1-${idx}`}
              className="inline-flex items-center gap-3 px-5 py-3 lg:px-8 lg:py-4 rounded-[18px] transition-all duration-300 hover:border-[#00e676]/40 hover:-translate-y-1 group cursor-default"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            >
              <div 
                className="transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,230,118,0.5)]"
                style={{ color: NEON }}
              >
                {tool.icon}
              </div>
              <span className="text-[#a0a0a0] font-sans font-semibold text-[10px] lg:text-[12px] uppercase tracking-[0.2em] group-hover:text-white transition-colors duration-300">
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
              className="inline-flex items-center gap-3 px-5 py-3 lg:px-8 lg:py-4 rounded-[18px] transition-all duration-300 hover:border-[#00e676]/40 hover:-translate-y-1 group cursor-default"
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
            >
              <div 
                className="transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,230,118,0.5)]"
                style={{ color: NEON }}
              >
                {tool.icon}
              </div>
              <span className="text-[#a0a0a0] font-sans font-semibold text-[10px] lg:text-[12px] uppercase tracking-[0.2em] group-hover:text-white transition-colors duration-300">
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
          animation: marquee 50s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 50s linear infinite;
        }
        .animate-marquee:hover, .animate-marquee-reverse:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
