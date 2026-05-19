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
  Globe
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
];

export const ToolsMarquee = () => {
  return (
    <div className="relative w-full py-12 lg:py-16 overflow-hidden bg-[#0a0a0a]">
      {/* Decorative gradient edges */}
      <div className="absolute inset-y-0 left-0 w-24 lg:w-48 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 lg:w-48 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
      
      <div className="flex flex-col gap-6 lg:gap-8">
        {/* First Row - Moving Right to Left */}
        <div className="flex animate-marquee whitespace-nowrap gap-4 lg:gap-6">
          {[...tools, ...tools].map((tool, idx) => (
            <div 
              key={idx}
              className="inline-flex items-center gap-3 px-5 py-3 lg:px-8 lg:py-4 rounded-2xl bg-white/[0.03] border border-white/5 transition-all hover:bg-white/[0.06] hover:border-white/10 group"
            >
              <div 
                className="transition-colors group-hover:text-white"
                style={{ color: NEON }}
              >
                {tool.icon}
              </div>
              <span className="text-white/60 font-bold text-sm lg:text-base uppercase tracking-wider group-hover:text-white transition-colors">
                {tool.name}
              </span>
            </div>
          ))}
        </div>

        {/* Second Row - Moving Left to Right (Reverse) */}
        <div className="flex animate-marquee-reverse whitespace-nowrap gap-4 lg:gap-6">
          {[...tools.reverse(), ...tools].map((tool, idx) => (
            <div 
              key={idx}
              className="inline-flex items-center gap-3 px-5 py-3 lg:px-8 lg:py-4 rounded-2xl bg-white/[0.03] border border-white/5 transition-all hover:bg-white/[0.06] hover:border-white/10 group"
            >
              <div 
                className="transition-colors group-hover:text-white"
                style={{ color: NEON }}
              >
                {tool.icon}
              </div>
              <span className="text-white/60 font-bold text-sm lg:text-base uppercase tracking-wider group-hover:text-white transition-colors">
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
          animation: marquee 40s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 40s linear infinite;
        }
        .animate-marquee:hover, .animate-marquee-reverse:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
