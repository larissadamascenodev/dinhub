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
import { NEON } from "./shared";

const tools = [
  { icon: <BrainCircuit size={22} />, name: "IA Huby" },
  { icon: <Wallet size={22} />, name: "Contas" },
  { icon: <CreditCard size={22} />, name: "Cartões" },
  { icon: <Target size={22} />, name: "Metas" },
  { icon: <TrendingUp size={22} />, name: "Investimentos" },
  { icon: <BarChart3 size={22} />, name: "Relatórios" },
  { icon: <Bell size={22} />, name: "Alertas" },
  { icon: <ShieldCheck size={22} />, name: "Segurança" },
  { icon: <Zap size={22} />, name: "Instantâneo" },
  { icon: <Search size={22} />, name: "Auditoria" },
  { icon: <Smartphone size={22} />, name: "App Mobile" },
  { icon: <PieChart size={22} />, name: "Categorias" },
  { icon: <ArrowUpRight size={22} />, name: "Cashback" },
  { icon: <Globe size={22} />, name: "Global" },
  { icon: <PlusCircle size={22} />, name: "Novo" },
  { icon: <History size={22} />, name: "Extrato" },
  { icon: <Lock size={22} />, name: "Privacidade" },
  { icon: <MessageSquare size={22} />, name: "Suporte" },
  { icon: <Sparkles size={22} />, name: "Insights" },
  { icon: <CircleDollarSign size={22} />, name: "Câmbio" },
  { icon: <PiggyBank size={22} />, name: "Poupança" },
  { icon: <ZapIcon size={22} />, name: "Eficiência" },
];

export const ToolsMarquee = () => {
  return (
    <div className="relative w-full py-12 lg:py-20 overflow-hidden bg-[#0a0a0a]">
      {/* Decorative gradient edges - Very strong for seamless flow */}
      <div className="absolute inset-y-0 left-0 w-32 lg:w-[450px] bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 lg:w-[450px] bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent z-20 pointer-events-none" />
      
      <div className="flex flex-col gap-6 lg:gap-10">
        {/* Row 1 - Left to Right */}
        <div className="flex whitespace-nowrap gap-5 lg:gap-8 w-max animate-marquee">
          {[...tools, ...tools, ...tools].map((tool, idx) => (
            <div 
              key={`r1-${idx}`}
              className="inline-flex items-center gap-4 px-8 py-4 lg:px-12 lg:py-7 rounded-[2rem] bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl transition-all duration-500 hover:bg-white/[0.07] hover:border-[#00e676]/30 hover:-translate-y-1 group cursor-default"
            >
              <div 
                className="transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(0,230,118,0.7)]"
                style={{ color: NEON }}
              >
                {tool.icon}
              </div>
              <span className="text-white/30 font-display font-black text-[12px] lg:text-[15px] uppercase tracking-[0.25em] group-hover:text-white transition-colors duration-500">
                {tool.name}
              </span>
            </div>
          ))}
        </div>

        {/* Row 2 - Right to Left */}
        <div className="flex whitespace-nowrap gap-5 lg:gap-8 w-max animate-marquee-reverse">
          {[...tools, ...tools, ...tools].reverse().map((tool, idx) => (
            <div 
              key={`r2-${idx}`}
              className="inline-flex items-center gap-4 px-8 py-4 lg:px-12 lg:py-7 rounded-[2rem] bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl transition-all duration-500 hover:bg-white/[0.07] hover:border-[#00e676]/30 hover:-translate-y-1 group cursor-default"
            >
              <div 
                className="transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(0,230,118,0.7)]"
                style={{ color: NEON }}
              >
                {tool.icon}
              </div>
              <span className="text-white/30 font-display font-black text-[12px] lg:text-[15px] uppercase tracking-[0.25em] group-hover:text-white transition-colors duration-500">
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
          animation: marquee 80s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 80s linear infinite;
        }
        .animate-marquee:hover, .animate-marquee-reverse:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
