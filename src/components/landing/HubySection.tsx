import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

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
      progressColor: "bg-orange-500",
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
    text: "Onde estou gastando demais?",
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

      // Draw connections first
      ctx.strokeStyle = "rgba(0, 230, 118, 0.15)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          // Rotate p1
          const x1 = p1.x * cos - p1.z * sin;
          const z1 = p1.z * cos + p1.x * sin;
          // Rotate p2
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

      // Sort by Z for depth
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

        // Glow
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
      animate={{
        scale: pulse ? [1, 1.1, 1] : [1, 1.04, 1],
      }}
      transition={{
        duration: pulse ? 0.4 : 4,
        repeat: pulse ? 0 : Infinity,
        ease: "easeInOut",
      }}
      className="relative flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="w-[220px] h-[220px] md:w-[280px] md:h-[280px]"
      />
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
    <section className="w-full bg-[#0a0a0a] py-20 px-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Label Pill */}
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

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display text-3xl md:text-5xl font-bold text-white mb-6 leading-tight"
        >
          Sua IA financeira que fala a verdade sobre o seu dinheiro.
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-base md:text-lg max-w-2xl mb-12"
        >
          Pergunte qualquer coisa sobre suas finanças. A Huby analisa seus dados, responde em segundos e te diz exatamente o que fazer.
        </motion.p>

        {/* Questions Carousel */}
        <div className="w-full relative mb-12 group">
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-4 px-4 -mx-4 snap-x">
            {questions.map((q) => (
              <button
                key={q.id}
                onClick={() => handleQuestionClick(q)}
                className={`flex-shrink-0 snap-center px-5 py-3 rounded-full border transition-all duration-300 text-sm md:text-base ${
                  activeQuestion?.id === q.id
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-[#111111] border-[#1a1a1a] text-gray-400 hover:border-gray-700"
                }`}
              >
                {q.text}
              </button>
            ))}
          </div>
        </div>

        {/* Sphere Area */}
        <div className="relative py-10">
          <Sphere3D pulse={pulse} />
        </div>

        {/* Response Card */}
        <div className="w-full mt-8 min-h-[200px]">
          <AnimatePresence mode="wait">
            {activeQuestion && (
              <motion.div
                key={activeQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="w-full bg-[#111111] border border-[#1a1a1a] rounded-3xl p-6 md:p-8 text-left"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h4 className="text-primary font-bold text-sm mb-1 uppercase tracking-wider">
                      {activeQuestion.response.header}
                    </h4>
                    <div className="text-3xl md:text-4xl font-bold text-white">
                      {activeQuestion.response.value}
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm md:text-right max-w-[200px]">
                    {activeQuestion.response.sub}
                  </div>
                </div>

                {activeQuestion.response.progress !== undefined && (
                  <div className="mb-8">
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${activeQuestion.response.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${activeQuestion.response.progressColor || "bg-primary"}`}
                      />
                    </div>
                  </div>
                )}

                {activeQuestion.response.list && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {activeQuestion.response.list.map((item, i) => (
                      <div key={i} className="bg-[#161616] border border-[#1a1a1a] rounded-2xl p-4">
                        <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                        <div className="text-lg font-bold text-white">{item.value}</div>
                        <div className="text-[10px] text-gray-500">{item.sub}</div>
                      </div>
                    ))}
                  </div>
                )}

                {activeQuestion.response.chart && (
                  <div className="h-32 w-full mb-8 flex items-end gap-1 px-2">
                    {[30, 45, 60, 85, 100].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: i * 0.1, duration: 0.8 }}
                          className="w-full bg-primary/20 rounded-t-lg relative group"
                        >
                          <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                        <span className="text-[10px] text-gray-600">
                          {["Mai", "Jun", "Jul", "Ago", "Set"][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeQuestion.response.categories && (
                  <div className="space-y-4 mb-8">
                    {activeQuestion.response.categories.map((cat, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-white font-medium">{cat.name}</span>
                          <span className="text-gray-400">{cat.value} ({cat.percentage})</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: cat.percentage }}
                            transition={{ delay: i * 0.1, duration: 0.8 }}
                            className={`h-full ${cat.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Insight Card */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                    ✨
                  </div>
                  <div>
                    <h5 className="text-primary font-bold text-xs mb-1 uppercase tracking-widest">
                      Insight Huby
                    </h5>
                    <p className="text-white text-sm leading-relaxed">
                      {activeQuestion.response.insight}
                    </p>
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
