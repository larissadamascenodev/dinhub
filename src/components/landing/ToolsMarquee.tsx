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

const tools = [
  { icon: <BrainCircuit size={22} />, name: "IA Huby", color: "#00e676" },
  { icon: <Wallet size={22} />, name: "Contas", color: "#3b82f6" },
  { icon: <CreditCard size={22} />, name: "Cartões", color: "#a855f7" },
  { icon: <Target size={22} />, name: "Metas", color: "#f59e0b" },
  { icon: <TrendingUp size={22} />, name: "Investimentos", color: "#10b981" },
  { icon: <BarChart3 size={22} />, name: "Relatórios", color: "#6366f1" },
  { icon: <Bell size={22} />, name: "Alertas", color: "#ef4444" },
  { icon: <ShieldCheck size={22} />, name: "Segurança", color: "#14b8a6" },
  { icon: <Zap size={22} />, name: "Instantâneo", color: "#facc15" },
  { icon: <Search size={22} />, name: "Auditoria", color: "#94a3b8" },
  { icon: <Smartphone size={22} />, name: "App Mobile", color: "#00e676" },
  { icon: <PieChart size={22} />, name: "Categorias", color: "#f472b6" },
  { icon: <ArrowUpRight size={22} />, name: "Cashback", color: "#fbbf24" },
  { icon: <Globe size={22} />, name: "Global", color: "#38bdf8" },
  { icon: <PlusCircle size={22} />, name: "Novo", color: "#00e676" },
  { icon: <History size={22} />, name: "Extrato", color: "#94a3b8" },
  { icon: <Lock size={22} />, name: "Privacidade", color: "#10b981" },
  { icon: <MessageSquare size={22} />, name: "Suporte", color: "#6366f1" },
  { icon: <Sparkles size={22} />, name: "Insights", color: "#a855f7" },
  { icon: <CircleDollarSign size={22} />, name: "Câmbio", color: "#f59e0b" },
  { icon: <PiggyBank size={22} />, name: "Poupança", color: "#f472b6" },
  { icon: <ZapIcon size={22} />, name: "Eficiência", color: "#00e676" },
];

export const ToolsMarquee = () => {
  return (
    <div className="relative w-full py-12 lg:py-24 overflow-hidden bg-[#0a0a0a]">
      {/* Decorative gradient edges - Enhanced for ultra-smooth transition */}
      <div className="absolute inset-y-0 left-0 w-32 lg:w-[400px] bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 lg:w-[400px] bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent z-20 pointer-events-none" />
      
      <div className="flex flex-col gap-8 lg:gap-12">
        {/* Row 1 - Moving Left to Right */}
        <div className="flex whitespace-nowrap gap-6 lg:gap-10 w-max animate-marquee">
          {[...tools, ...tools, ...tools].map((tool, idx) => (
            <div 
              key={`r1-${idx}`}
              className="inline-flex items-center gap-4 px-8 py-4 lg:px-12 lg:py-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.07] backdrop-blur-2xl transition-all duration-500 hover:bg-white/[0.06] hover:border-white/20 group cursor-default"
            >
              <div 
                className="transition-all duration-500 group-hover:scale-125 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                style={{ color: tool.color }}
              >
                {tool.icon}
              </div>
              <span className="text-white/40 font-display font-black text-[12px] lg:text-[16px] uppercase tracking-[0.3em] group-hover:text-white transition-colors duration-500">
                {tool.name}
              </span>
            </div>
          ))}
        </div>

        {/* Row 2 - Moving Right to Left */}
        <div className="flex whitespace-nowrap gap-6 lg:gap-10 w-max animate-marquee-reverse">
          {[...tools, ...tools, ...tools].reverse().map((tool, idx) => (
            <div 
              key={`r2-${idx}`}
              className="inline-flex items-center gap-4 px-8 py-4 lg:px-12 lg:py-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.07] backdrop-blur-2xl transition-all duration-500 hover:bg-white/[0.06] hover:border-white/20 group cursor-default"
            >
              <div 
                className="transition-all duration-500 group-hover:scale-125 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                style={{ color: tool.color }}
              >
                {tool.icon}
              </div>
              <span className="text-white/40 font-display font-black text-[12px] lg:text-[16px] uppercase tracking-[0.3em] group-hover:text-white transition-colors duration-500">
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
          animation: marquee 100s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 100s linear infinite;
        }
        .animate-marquee:hover, .animate-marquee-reverse:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
