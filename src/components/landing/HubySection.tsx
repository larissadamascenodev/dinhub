import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain } from "lucide-react";

interface Question {
  id: number;
  text: string;
  response: {
    header: string;
    value: string;
    sub: string;
    progress?: number;
    progressColor?: string;
    insight: string;
    list?: { label: string; value: string; sub: string }[];
    chart?: boolean;
    categories?: { name: string; percentage: string; color: string; value: string }[];
  };
}

const questions: Question[] = [
  {
    id: 1,
    text: "💰 Quanto ainda posso gastar esse mês?",
    response: {
      header: "💰 Saldo disponível para gastar",
      value: "R$ 847,30",
      sub: "Você já usou 73% do seu orçamento de maio.",
      progress: 73,
      progressColor: "bg-[#00e676]",
      insight: "Se mantiver o ritmo atual, vai estourar o orçamento em 6 dias. Recomendo cortar R$ 200 em delivery esta semana.",
    },
  },
  {
    id: 2,
    text: "📅 Quando fico livre de parcelas?",
    response: {
      header: "📅 Previsão de quitação",
      value: "Abril de 2027",
      sub: "Você tem R$ 8.594,01 em parcelas ativas.",
      list: [
        { label: "PS5", value: "3/10", sub: "livre em Jul/26" },
        { label: "Notebook", value: "5/12", sub: "livre em Dez/26" },
        { label: "Seguro", value: "7/12", sub: "livre em Mai/26" },
      ],
      insight: "Quitando o PS5 antecipado você economiza R$ 180 em juros.",
    },
  },
  {
    id: 3,
    text: "📈 Qual minha projeção para os próximos meses?",
    response: {
      header: "📈 Projeção financeira",
      value: "R$ 8.750,00",
      sub: "Saldo projetado para Setembro mantendo o ritmo atual.",
      chart: true,
      insight: "Você está economizando 23% a mais que no mês passado. Continue assim e atinge sua meta de reserva em 4 meses.",
    },
  },
  {
    id: 4,
    text: "$ Onde estou gastando demais?",
    response: {
      header: "$ Análise de gastos",
      value: "Delivery representa 21,9% dos seus gastos",
      sub: "R$ 842,90 este mês",
      categories: [
        { name: "Delivery", percentage: "21.9%", color: "bg-red-500", value: "R$ 842,90" },
        { name: "Compras online", percentage: "19%", color: "bg-purple-500", value: "R$ 731,20" },
        { name: "Apostas", percentage: "11.1%", color: "bg-orange-500", value: "R$ 427,00" },
      ],
      insight: "Você gastou R$ 180 a mais com delivery do que em abril. Reduzindo para R$ 400/mês, sobram R$ 440 extras todo mês.",
    },
  },
];

const Sphere3D = ({ pulse }: { pulse: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    const particleCount = 40;
    const radius = 100;
    let rotation = 0;

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const theta = Math.acos(Math.random() * 2 - 1);
        const phi = Math.random() * Math.PI * 2;
        particles.push({
          x: radius * Math.sin(theta) * Math.cos(phi),
          y: radius * Math.sin(theta) * Math.sin(phi),
          z: radius * Math.cos(theta),
          size: Math.random() * 2 + 1,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      rotation += 0.005;

      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);

      ctx.strokeStyle = "rgba(0, 230, 118, 0.15)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const x1 = p1.x * cos - p1.z * sin;
          const z1 = p1.z * cos + p1.x * sin;
          const x2 = p2.x * cos - p2.z * sin;
          const z2 = p2.z * cos + p2.x * sin;
          const dist = Math.sqrt((x1 - x2) ** 2 + (p1.y - p2.y) ** 2 + (z1 - z2) ** 2);
          if (dist < 80) {
            const opacity = (1 - dist / 80) * 0.3;
            ctx.strokeStyle = `rgba(0, 230, 118, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(centerX + x1, centerY + p1.y);
            ctx.lineTo(centerX + x2, centerY + p2.y);
            ctx.stroke();
          }
        }
      }

      const sortedParticles = particles.map(p => {
        const x = p.x * cos - p.z * sin;
        const z = p.z * cos + p.x * sin;
        return { ...p, rotatedX: x, rotatedZ: z };
      }).sort((a, b) => a.rotatedZ - b.rotatedZ);

      sortedParticles.forEach((p) => {
        const scale = (p.rotatedZ + radius) / (radius * 2);
        const opacity = 0.4 + scale * 0.6;
        const size = p.size * (1 + scale);
        ctx.fillStyle = `rgba(0, 230, 118, ${opacity})`;
        ctx.beginPath();
        ctx.arc(centerX + p.rotatedX, centerY + p.y, size, 0, Math.PI * 2);
        ctx.fill();
        if (scale > 0.7) {
          ctx.shadowBlur = 10 * scale;
          ctx.shadowColor = "#00e676";
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
      animationFrameId = requestAnimationFrame(draw);
    };
    init();
    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <motion.div
      animate={{ scale: pulse ? [1, 1.1, 1] : [1, 1.04, 1] }}
      transition={{ duration: pulse ? 0.4 : 4, repeat: pulse ? 0 : Infinity, ease: "easeInOut" }}
      className="relative flex items-center justify-center"
    >
      <canvas ref={canvasRef} width={400} height={400} className="w-[200px] h-[200px] md:w-[260px] md:h-[260px]" />
      <div className="absolute inset-0 rounded-full bg-primary/5 blur-[40px] -z-10" />
    </motion.div>
  );
};

export const HubySection = () => {
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [pulse, setPulse] = useState(false);

  const handleQuestionClick = (q: Question) => {
    setPulse(true);
    setActiveQuestion(q);
    setTimeout(() => setPulse(false), 400);
  };

  return (
    <section className="w-full bg-[#0a0a0a] pt-20 pb-10 px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6"
        >
          <span className="text-[10px] md:text-xs font-bold text-primary tracking-widest uppercase">
            HUBY · SUA ASSISTENTE FINANCEIRA
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl md:text-5xl font-bold text-white mb-6 leading-tight"
        >
          Sua IA financeira que fala a verdade sobre o seu dinheiro.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-gray-400 text-base md:text-lg max-w-2xl mb-10"
        >
          Pergunte qualquer coisa sobre suas finanças. A Huby analisa seus dados e responde em segundos.
        </motion.p>

        <div className="w-full relative mb-10">
          <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-2 px-4 -mx-4 snap-x">
            {questions.map((q) => (
              <button
                key={q.id}
                onClick={() => handleQuestionClick(q)}
                className={`flex-shrink-0 snap-center px-5 py-3 rounded-full border transition-all duration-300 text-sm font-medium ${
                  activeQuestion?.id === q.id
                    ? "bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(0,230,118,0.1)]"
                    : "bg-[#111] border-[#1a1a1a] text-gray-500 hover:border-gray-700"
                }`}
              >
                {q.text}
              </button>
            ))}
          </div>
        </div>

        <div className="relative py-4">
          <Sphere3D pulse={pulse} />
        </div>

        <div className="w-full">
          <AnimatePresence mode="wait">
            {activeQuestion && (
              <motion.div
                key={activeQuestion.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="w-full bg-[#111]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 md:p-8 text-left shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Brain className="w-32 h-32 text-primary" />
                </div>

                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                      <div className="inline-flex items-center gap-2 text-primary/80 font-bold text-[10px] mb-2 uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                        <Sparkles className="w-3 h-3" />
                        {activeQuestion.response.header}
                      </div>
                      <div className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        {activeQuestion.response.value}
                      </div>
                    </div>
                    <div className="text-gray-400 text-sm md:text-right max-w-[200px] leading-relaxed">
                      {activeQuestion.response.sub}
                    </div>
                  </div>

                  {activeQuestion.response.progress !== undefined && (
                    <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex justify-between text-xs text-gray-400 mb-2 font-medium">
                         <span>Progresso do orçamento</span>
                         <span className="text-white font-bold">{activeQuestion.response.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${activeQuestion.response.progress}%` }}
                          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                          className={`h-full ${activeQuestion.response.progressColor || "bg-primary"} shadow-[0_0_10px_rgba(0,230,118,0.4)]`}
                        />
                      </div>
                    </div>
                  )}

                  {activeQuestion.response.list && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      {activeQuestion.response.list.map((item, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors group">
                          <div className="text-[10px] text-gray-500 mb-2 font-bold uppercase tracking-wider">{item.label}</div>
                          <div className="text-xl font-bold text-white mb-1">{item.value}</div>
                          <div className="text-[10px] text-primary/60 font-medium">{item.sub}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeQuestion.response.chart && (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 mb-8">
                       <div className="h-32 w-full flex items-end gap-2 px-2">
                        {[30, 45, 60, 85, 100].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                            <div className="w-full relative h-32 flex items-end">
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: i * 0.1, duration: 1, ease: "easeOut" }}
                                className="w-full bg-primary/20 rounded-t-lg relative group-hover:bg-primary/30 transition-colors"
                              >
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_10px_rgba(0,230,118,0.5)]" />
                              </motion.div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-600 group-hover:text-primary/60 transition-colors">
                              {["Mai", "Jun", "Jul", "Ago", "Set"][i]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeQuestion.response.categories && (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 mb-8 space-y-5">
                      {activeQuestion.response.categories.map((cat, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-white">{cat.name}</span>
                            <span className="text-gray-400">{cat.value} <span className="text-primary/60 ml-2">{cat.percentage}</span></span>
                          </div>
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: cat.percentage }}
                              transition={{ delay: i * 0.1, duration: 1 }}
                              className={`h-full ${cat.color} opacity-80`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-primary/10 border border-primary/20 rounded-[1.5rem] p-6 flex gap-4 shadow-[inset_0_0_20px_rgba(0,230,118,0.05)]">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center flex-shrink-0 text-xl">
                      ✨
                    </div>
                    <div>
                      <h5 className="text-primary font-bold text-[10px] mb-1.5 uppercase tracking-[0.2em]">
                        Insight da Huby
                      </h5>
                      <p className="text-white/90 text-sm leading-relaxed font-medium">
                        {activeQuestion.response.insight}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default HubySection;
