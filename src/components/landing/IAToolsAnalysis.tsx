import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, Sparkles, HeartPulse, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

type ToolType = "Radar" | "Projeção" | "Saúde";

interface Tool {
  id: ToolType;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

const tools: Tool[] = [
  {
    id: "Radar",
    title: "Radar Financeiro",
    desc: "Identificação automática de gastos excessivos e assinaturas esquecidas.",
    icon: <Radar className="w-6 h-6" />,
  },
  {
    id: "Projeção",
    title: "Projeção Financeira",
    desc: "Simule seu saldo futuro com base no seu comportamento atual.",
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    id: "Saúde",
    title: "Saúde Financeira",
    desc: "Um score completo da sua vida financeira com dicas para melhorar.",
    icon: <HeartPulse className="w-6 h-6" />,
  },
];

const AnalysisGlass = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
    <div className="relative z-10">{children}</div>
  </div>
);

const RadarAnalysis = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
        <Radar className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-white font-bold tracking-tight">Radar detectou</h4>
        <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">Análise em tempo real</p>
      </div>
    </div>
    
    <div className="grid gap-3">
      {[
        { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", title: "Delivery +38% vs mês passado", desc: "Você gastou R$ 842 — limite era R$ 600" },
        { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", title: "3 assinaturas sem uso", desc: "R$ 79,90/mês sendo desperdiçados" },
        { icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", title: "Contas em dia", desc: "Nenhuma fatura vencida este mês" },
      ].map((item, i) => (
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          key={i} 
          className={`bg-white/5 border border-white/5 rounded-2xl p-4 flex items-start gap-4 hover:bg-white/10 transition-colors group`}
        >
          <div className={`w-8 h-8 rounded-xl ${item.bg} ${item.border} flex items-center justify-center ${item.color} shrink-0`}>
            <item.icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-white text-sm font-bold mb-1 tracking-tight">{item.title}</p>
            <p className="text-gray-500 text-xs font-medium">{item.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
    
    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 mt-4">
      <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Insight Huby</p>
      <p className="text-white/90 text-sm leading-relaxed font-medium">
        O radar identificou R$ 1.574 em gastos que podem ser reduzidos este mês.
      </p>
    </div>
  </div>
);

const ProjectionAnalysis = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
        <Sparkles className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-white font-bold tracking-tight">Sua projeção</h4>
        <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">Previsão algorítmica</p>
      </div>
    </div>
    
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex justify-between items-end mb-8">
        <div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Saldo projetado</p>
          <p className="text-3xl font-bold text-white tracking-tight">R$ 8.750 <span className="text-primary/60 text-lg">em Set</span></p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <TrendingUp className="text-primary w-5 h-5" />
        </div>
      </div>
      
      <div className="h-28 flex items-end gap-2 mb-8 px-2">
        {[20, 35, 45, 65, 80, 100].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.1, duration: 1 }}
              className="w-full bg-primary/10 rounded-t-lg relative group-hover:bg-primary/20 transition-colors"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(0,230,118,0.6)]" />
            </motion.div>
          </div>
        ))}
      </div>
      
      <div className="space-y-3">
        {[
          { label: "Ritmo atual", val: "R$ 8.750", color: "text-primary/60", bg: "bg-white/5" },
          { label: "Cortando delivery", val: "R$ 10.200", color: "text-black", bg: "bg-primary shadow-[0_0_20px_rgba(0,230,118,0.3)]" },
          { label: "Sem cortes", val: "R$ 6.100", color: "text-gray-500", bg: "bg-white/5" },
        ].map((row, i) => (
          <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${row.bg} border border-white/5`}>
            <span className={`text-xs font-bold ${row.color === "text-black" ? "text-black" : "text-gray-400"}`}>{row.label}</span>
            <span className={`text-xs font-black ${row.color}`}>{row.val}</span>
          </div>
        ))}
      </div>
    </div>
    
    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5">
      <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Insight Huby</p>
      <p className="text-white/90 text-sm leading-relaxed font-medium">
        Cortando R$ 400 em delivery você chega R$ 1.450 mais longe em 5 meses.
      </p>
    </div>
  </div>
);

const HealthAnalysis = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
        <HeartPulse className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-white font-bold tracking-tight">Seu score</h4>
        <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">Saúde financeira</p>
      </div>
    </div>
    
    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 text-center relative overflow-hidden shadow-2xl backdrop-blur-md">
      <div className="relative z-10">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-7xl font-black text-primary mb-2 tracking-tighter"
        >
          82<span className="text-3xl text-primary/30 tracking-normal">/100</span>
        </motion.div>
        <p className="text-white font-bold text-lg mb-8 tracking-tight">Muito boa — Parabéns!</p>
        
        <div className="space-y-4 text-left max-w-[240px] mx-auto">
          {[
            { icon: CheckCircle2, text: "Contas em dia", pts: "+15pts", color: "text-primary" },
            { icon: CheckCircle2, text: "Meta ativa", pts: "+12pts", color: "text-primary" },
            { icon: AlertTriangle, text: "Gastos elevados", pts: "-8pts", color: "text-orange-500" },
          ].map((fact, i) => (
            <div key={i} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <fact.icon className={`w-4 h-4 ${fact.color}`} />
                <span className="text-xs text-gray-400 font-bold">{fact.text}</span>
              </div>
              <span className={`text-[10px] font-black ${fact.color} bg-white/5 px-2 py-0.5 rounded-full`}>{fact.pts}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-[12px] border-white/5 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-t-[12px] border-primary rounded-full rotate-[45deg] opacity-40 shadow-[0_0_40px_rgba(0,230,118,0.2)]" />
    </div>
    
    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5">
      <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Insight Huby</p>
      <p className="text-white/90 text-sm leading-relaxed font-medium">
        Seu score subiu 6 pontos este mês. Reduza gastos variáveis para chegar em 90+ em junho.
      </p>
    </div>
  </div>
);

export const IAToolsAnalysis = () => {
  const [activeTool, setActiveTool] = useState<ToolType>("Radar");

  return (
    <section className="w-full bg-[#0a0a0a] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_420px] gap-12 items-start">
          <div className="space-y-4">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`w-full text-left p-8 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden ${
                  activeTool === tool.id
                    ? "bg-white/5 border-primary/50 shadow-[0_0_50px_rgba(0,230,118,0.05)]"
                    : "bg-transparent border-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-6 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    activeTool === tool.id ? "bg-primary text-black shadow-[0_0_20px_rgba(0,230,118,0.4)]" : "bg-white/5 text-gray-500 border border-white/5"
                  }`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-primary transition-colors">{tool.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors font-medium">
                      {tool.desc}
                    </p>
                  </div>
                </div>
                
                {activeTool === tool.id && (
                  <motion.div
                    layoutId="toolGlow"
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="relative">
             <div className="lg:sticky lg:top-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTool}
                    initial={{ opacity: 0, scale: 0.95, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <AnalysisGlass>
                      {activeTool === "Radar" && <RadarAnalysis />}
                      {activeTool === "Projeção" && <ProjectionAnalysis />}
                      {activeTool === "Saúde" && <HealthAnalysis />}
                    </AnalysisGlass>
                  </motion.div>
                </AnimatePresence>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IAToolsAnalysis;
