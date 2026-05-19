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
  History
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
];

export const ToolsMarquee = () => {
  return (
    <div className="relative w-full py-10 lg:py-16 overflow-hidden bg-[#0a0a0a] border-y border-white/[0.03]">
      {/* Decorative gradient edges */}
      <div className="absolute inset-y-0 left-0 w-32 lg:w-64 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 lg:w-64 bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-10 pointer-events-none" />
      
      <div className="flex flex-col gap-5 lg:gap-8">
        {/* First Row - Moving Left to Right */}
        <div className="flex animate-marquee whitespace-nowrap gap-4 lg:gap-6">
          {[...tools, ...tools].map((tool, idx) => (
            <div 
              key={idx}
              className="inline-flex items-center gap-3 px-6 py-3.5 lg:px-10 lg:py-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm transition-all hover:bg-white/[0.05] hover:border-white/10 group"
            >
              <div 
                className="transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,230,118,0.5)]"
                style={{ color: NEON }}
              >
                {tool.icon}
              </div>
              <span className="text-white/40 font-bold text-[10px] lg:text-xs uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                {tool.name}
              </span>
            </div>
          ))}
        </div>

        {/* Second Row - Moving Right to Left */}
        <div className="flex animate-marquee-reverse whitespace-nowrap gap-4 lg:gap-6">
          {[...[...tools].reverse(), ...[...tools].reverse()].map((tool, idx) => (
            <div 
              key={idx}
              className="inline-flex items-center gap-3 px-6 py-3.5 lg:px-10 lg:py-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm transition-all hover:bg-white/[0.05] hover:border-white/10 group"
            >
              <div 
                className="transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,230,118,0.5)]"
                style={{ color: NEON }}
              >
                {tool.icon}
              </div>
              <span className="text-white/40 font-bold text-[10px] lg:text-xs uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                {tool.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
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
