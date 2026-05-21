import { useState, useEffect, useRef } from "react";

// ── ÍCONES ──────────────────────────────────────────────────
const SparkleIcon = ({ size = 14, color = "#00e676" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>
  </svg>
);
const TrendUpIcon = ({ size = 14, color = "#00e676" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);
const CalendarIcon = ({ size = 14, color = "#00e676" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const DollarIcon = ({ size = 14, color = "#00e676" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const AlertIcon = ({ size = 14, color = "#00e676" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const SendIcon = ({ size = 14, color = "#000" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

// ── ESFERA DE PARTÍCULAS ─────────────────────────────────────
const ParticleSphere = ({ active, responding }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const rotSpeedRef = useRef(0.003);
  const pulseRef = useRef(1);
  const pulsePhaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const R = size * 0.34;
    const N = 130;

    const particles = Array.from({ length: N }, () => {
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = Math.random() * 2 * Math.PI;
      return { theta, phi, size: Math.random() * 2.4 + 0.5 };
    });

    let rot = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      if (responding) {
        rotSpeedRef.current += (0.018 - rotSpeedRef.current) * 0.08;
        pulsePhaseRef.current += 0.12;
        pulseRef.current = 1 + Math.sin(pulsePhaseRef.current) * 0.06;
      } else if (active) {
        rotSpeedRef.current += (0.007 - rotSpeedRef.current) * 0.05;
        pulsePhaseRef.current += 0.04;
        pulseRef.current = 1 + Math.sin(pulsePhaseRef.current) * 0.025;
      } else {
        rotSpeedRef.current += (0.003 - rotSpeedRef.current) * 0.05;
        pulsePhaseRef.current += 0.015;
        pulseRef.current = 1 + Math.sin(pulsePhaseRef.current) * 0.012;
      }

      rot += rotSpeedRef.current;
      const pulse = pulseRef.current;
      const cx = size / 2;
      const cy = size / 2;

      const glowAlpha = responding ? 0.18 : active ? 0.1 : 0.05;
      const glowR = R * pulse * 1.3;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      grd.addColorStop(0, `rgba(0,230,118,${glowAlpha})`);
      grd.addColorStop(1, "rgba(0,230,118,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      const projected = particles.map(p => {
        const x0 = R * Math.sin(p.theta) * Math.cos(p.phi);
        const y0 = R * Math.sin(p.theta) * Math.sin(p.phi);
        const z0 = R * Math.cos(p.theta);
        const x1 = x0 * Math.cos(rot) - z0 * Math.sin(rot);
        const z1 = x0 * Math.sin(rot) + z0 * Math.cos(rot);
        const y1 = y0 * Math.cos(0.25) - z1 * Math.sin(0.25);
        const z2 = y0 * Math.sin(0.25) + z1 * Math.cos(0.25);
        const depth = (z2 + R) / (2 * R);
        return {
          sx: cx + x1 * pulse,
          sy: cy + y1 * pulse,
          depth,
          size: p.size,
        };
      });

      projected.sort((a, b) => a.depth - b.depth);

      const connDist = responding ? size * 0.2 : size * 0.15;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].sx - projected[j].sx;
          const dy = projected[i].sy - projected[j].sy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connDist) {
            const alpha = (1 - dist / connDist) * 0.22 * projected[i].depth;
            ctx.beginPath();
            ctx.moveTo(projected[i].sx, projected[i].sy);
            ctx.lineTo(projected[j].sx, projected[j].sy);
            ctx.strokeStyle = `rgba(0,230,118,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      projected.forEach(p => {
        const alpha = 0.25 + p.depth * 0.75;
        const r = p.size * (0.4 + p.depth * 0.6);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,230,118,${alpha})`;
        ctx.fill();
        if (p.depth > 0.65 && (responding || active)) {
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,255,136,${(p.depth - 0.65) * 0.1})`;
          ctx.fill();
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [active, responding]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={320}
      style={{
        width: "clamp(220px,28vw,320px)",
        height: "clamp(220px,28vw,320px)",
        display: "block",
      }}
    />
  );
};

// ── CONVERSAS ────────────────────────────────────────────────
const conversations = [
  {
    id: 0,
    Icon: DollarIcon,
    question: "Quanto posso gastar?",
    messages: [
      { type: "user", text: "Quanto ainda posso gastar esse mês?" },
      { type: "huby", text: "Analisando seu orçamento de maio...", loading: true },
      { type: "huby", text: "Você tem R$ 847,30 disponíveis.", highlight: true },
      {
        type: "card",
        label: "ORÇAMENTO DE MAIO",
        items: [
          { name: "Usado", value: "R$ 2.302", color: "#ff5252" },
          { name: "Disponível", value: "R$ 847", color: "#00e676" },
        ],
        progress: 73,
        progressColor: "#ffa726",
        progressLabel: "73% utilizado",
      },
      { type: "huby", text: "No ritmo atual, vai estourar em 6 dias. Corta R$ 200 em delivery e sobra fôlego." },
    ],
  },
  {
    id: 1,
    Icon: CalendarIcon,
    question: "Quando fico livre?",
    messages: [
      { type: "user", text: "Quando fico livre de parcelas?" },
      { type: "huby", text: "Consultando seus parcelamentos...", loading: true },
      { type: "huby", text: "Você fica livre em abril de 2027.", highlight: true },
    ],
  },
  {
    id: 2,
    Icon: TrendUpIcon,
    question: "Qual minha projeção?",
    messages: [
      { type: "user", text: "Qual minha projeção para os próximos meses?" },
      { type: "huby", text: "Calculando histórico...", loading: true },
      { type: "huby", text: "Mantendo o ritmo, você chega a R$ 8.750 em setembro.", highlight: true },
    ],
  },
];

const MessageBubble = ({ msg }) => {
  if (msg.type === "user") {
    return (
      <div className="flex justify-end mb-2">
        <div className="bg-[#1a1a1a] border border-[#252525] rounded-[18px_18px_4px_18px] p-3 text-sm text-white max-w-[80%] font-sans">
          {msg.text}
        </div>
      </div>
    );
  }

  if (msg.type === "huby") {
    return (
      <div className="flex gap-2 mb-2 items-start">
        <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
          <SparkleIcon size={12} />
        </div>
        <div className={`rounded-[4px_18px_18px_18px] p-3 text-sm max-w-[80%] font-sans ${msg.highlight ? "bg-primary/10 border border-primary/20 text-white" : "bg-[#111] border border-[#1a1a1a] text-gray-300"}`}>
          {msg.loading ? (
            <div className="flex gap-1 items-center">
              {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />)}
            </div>
          ) : msg.text}
        </div>
      </div>
    );
  }

  if (msg.type === "card") {
    return (
      <div className="ml-8 mb-2">
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-3 max-w-[90%]">
          <div className="text-[10px] text-primary font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <SparkleIcon size={9} />{msg.label}
          </div>
          {msg.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#151515] last:border-0">
              <span className="text-xs text-gray-400">{item.name}</span>
              <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

const Huby = () => {
  const [activeConv, setActiveConv] = useState(null);
  const [visibleMsgs, setVisibleMsgs] = useState([]);
  const [responding, setResponding] = useState(false);
  const chatRef = useRef(null);

  const handleQuestion = (conv) => {
    if (activeConv?.id === conv.id) return;
    setActiveConv(conv);
    setVisibleMsgs([]);
    setResponding(true);

    conv.messages.forEach((msg, i) => {
      setTimeout(() => {
        setVisibleMsgs(prev => [...prev, i]);
        if (i === conv.messages.length - 1) setResponding(false);
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }, i * 600);
    });
  };

  return (
    <section className="relative py-20 bg-neutral-950 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-radial-gradient(ellipse,rgba(0,230,118,0.04),transparent 65%) pointer-events-none" />
      
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Huby · Sua Assistente IA</h2>
          <p className="text-gray-400 text-lg max-w-lg mx-auto">Pergunte, simule e entenda seu dinheiro de um jeito simples e inteligente.</p>
        </div>

        <div className="flex flex-col items-center gap-8">
          <ParticleSphere active={!!activeConv} responding={responding} />
          
          <div className="flex gap-2 flex-wrap justify-center">
            {conversations.map(conv => (
              <button key={conv.id} onClick={() => handleQuestion(conv)} className="px-4 py-2 rounded-full border border-neutral-800 bg-neutral-900 text-sm hover:border-primary/50 transition-all">
                {conv.question}
              </button>
            ))}
          </div>

          <div className="w-full max-w-lg bg-black border border-neutral-900 rounded-2xl p-4">
            <div ref={chatRef} className="h-64 overflow-y-auto space-y-2 pr-2 scrollbar-none">
              {!activeConv ? <div className="text-center text-neutral-700 py-20">Escolha uma pergunta</div> : activeConv.messages.map((msg, i) => visibleMsgs.includes(i) ? <MessageBubble key={i} msg={msg} /> : null)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Huby;
