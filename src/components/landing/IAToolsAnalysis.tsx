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

const RadarAnalysis = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
        <Radar className="w-4 h-4" />
      </div>
      <h4 className="text-white font-bold">🎯 Radar detectou</h4>
    </div>
    
    <div className="grid gap-3">
      <div className="bg-[#1a1a1a] border border-[#222] rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-bold mb-1">Delivery +38% vs mês passado</p>
            <p className="text-gray-500 text-xs">Você gastou R$ 842 — limite era R$ 600</p>
          </div>
        </div>
      </div>
      
      <div className="bg-[#1a1a1a] border border-[#222] rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-bold mb-1">3 assinaturas sem uso</p>
            <p className="text-gray-500 text-xs">R$ 79,90/mês sendo desperdiçados</p>
          </div>
        </div>
      </div>
      
      <div className="bg-[#1a1a1a] border border-[#222] rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-bold mb-1">Contas em dia</p>
            <p className="text-gray-500 text-xs">Nenhuma fatura vencida este mês</p>
          </div>
        </div>
      </div>
    </div>
    
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
      <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Insight</p>
      <p className="text-gray-300 text-sm leading-relaxed">
        O radar identificou R$ 1.574 em gastos que podem ser reduzidos este mês.
      </p>
    </div>
  </div>
);

const ProjectionAnalysis = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
        <Sparkles className="w-4 h-4" />
      </div>
      <h4 className="text-white font-bold">📈 Sua projeção</h4>
    </div>
    
    <div className="bg-[#1a1a1a] border border-[#222] rounded-2xl p-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <p className="text-gray-500 text-xs uppercase mb-1">Saldo projetado</p>
          <p className="text-2xl font-bold text-white">R$ 8.750 em Set</p>
        </div>
        <TrendingUp className="text-primary w-6 h-6" />
      </div>
      
      <div className="h-24 flex items-end gap-1 mb-6">
        {[20, 35, 45, 65, 80, 100].map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: i * 0.1 }}
            className="flex-1 bg-primary/20 rounded-t-sm relative group"
          >
            <div className="absolute top-0 left-0 w-full h-0.5 bg-primary" />
          </motion.div>
        ))}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Ritmo atual</span>
          <span className="text-xs font-bold text-primary">R$ 8.750</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Cortando delivery</span>
          <span className="text-xs font-bold text-primary-foreground bg-primary px-1.5 py-0.5 rounded">R$ 10.200</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Sem cortes</span>
          <span className="text-xs font-bold text-gray-500">R$ 6.100</span>
        </div>
      </div>
    </div>
    
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
      <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Insight</p>
      <p className="text-gray-300 text-sm leading-relaxed">
        Cortando R$ 400 em delivery você chega R$ 1.450 mais longe em 5 meses.
      </p>
    </div>
  </div>
);

const HealthAnalysis = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
        <HeartPulse className="w-4 h-4" />
      </div>
      <h4 className="text-white font-bold">❤️ Seu score</h4>
    </div>
    
    <div className="bg-[#1a1a1a] border border-[#222] rounded-2xl p-8 text-center relative overflow-hidden">
      <div className="relative z-10">
        <div className="text-6xl font-bold text-primary mb-2">82<span className="text-2xl text-primary/50">/100</span></div>
        <p className="text-white font-bold mb-6">Muito boa — Parabéns!</p>
        
        <div className="space-y-3 text-left max-w-xs mx-auto">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-primary" />
            <span className="text-[11px] text-gray-400">Contas em dia <span className="text-primary">+15pts</span></span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3 h-3 text-primary" />
            <span className="text-[11px] text-gray-400">Meta ativa <span className="text-primary">+12pts</span></span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-orange-500" />
            <span className="text-[11px] text-gray-400">Gastos acima da média <span className="text-orange-500">-8pts</span></span>
          </div>
        </div>
      </div>
      
      {/* Gauge Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-8 border-primary/5 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-t-8 border-primary rounded-full rotate-[45deg]" />
    </div>
    
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
      <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Insight</p>
      <p className="text-gray-300 text-sm leading-relaxed">
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
        <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
          {/* Tools Cards */}
          <div className="space-y-4">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`w-full text-left p-6 rounded-3xl border transition-all duration-300 group relative overflow-hidden ${
                  activeTool === tool.id
                    ? "bg-[#111] border-primary shadow-[0_0_30px_rgba(0,230,118,0.05)]"
                    : "bg-transparent border-[#1a1a1a] hover:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-5 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    activeTool === tool.id ? "bg-primary text-black" : "bg-[#1a1a1a] text-gray-400"
                  }`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{tool.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors">
                      {tool.desc}
                    </p>
                  </div>
                </div>
                
                {activeTool === tool.id && (
                  <motion.div
                    layoutId="glow"
                    className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Analysis Panel */}
          <div className="relative">
             <div className="lg:sticky lg:top-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTool}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#111] border border-[#1a1a1a] rounded-3xl p-8"
                  >
                    {activeTool === "Radar" && <RadarAnalysis />}
                    {activeTool === "Projeção" && <ProjectionAnalysis />}
                    {activeTool === "Saúde" && <HealthAnalysis />}
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
