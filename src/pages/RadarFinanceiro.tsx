import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, AlertTriangle, TrendingUp, TrendingDown, Zap,
  ShieldCheck, ChevronRight, ChevronDown, ChevronUp, Bot,
  Sparkles, CreditCard, RefreshCw, Package, Activity, Target,
  Gauge, Scissors, PiggyBank, Flame, BarChart3,
  ArrowUpRight, ArrowDownRight, ScanText, Info, Radar,
} from "lucide-react";
import { useRadarFinanceiro } from "@/hooks/useRadarFinanceiro";
import { calculateHealthScore, type HealthScoreV2 } from "@/services/healthScoreService";
import { generateHubyActions, type HubyAction } from "@/services/hubyActionsService";
import { generateHubyMessage } from "@/services/hubyMessageService";
import { getCategoryIcon, getCategoryColor } from "@/lib/categoryUtils";
import { getCustomCategories, type CustomCategory } from "@/services/categoryService";
import type { RadarInsight } from "@/services/radarService";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

// --- Componente: Premium Bento Card ---
function BentoCard({ 
  children, 
  className = "", 
  title, 
  icon, 
  badge,
  badgeVariant = "neutral" 
}: { 
  children: React.ReactNode; 
  className?: string; 
  title?: string; 
  icon?: React.ReactNode;
  badge?: string;
  badgeVariant?: "success" | "warning" | "danger" | "neutral";
}) {
  const badgeStyles = {
    success: "bg-primary/10 text-primary border-primary/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-destructive/10 text-destructive border-destructive/20",
    neutral: "bg-white/5 text-muted-foreground border-white/10",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`glass-card p-6 flex flex-col h-full ${className}`}
    >
      {(title || icon) && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-inner">
                {icon}
              </div>
            )}
            {title && (
              <h3 className="text-[15px] font-display font-extrabold text-white tracking-tight uppercase tracking-[0.05em]">
                {title}
              </h3>
            )}
          </div>
          {badge && (
            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border ${badgeStyles[badgeVariant]}`}>
              {badge}
            </span>
          )}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </motion.div>
  );
}

// --- Diagnostic pill ---
function DiagPill({
  icon,
  text,
  variant = "neutral",
}: {
  icon: React.ReactNode;
  text: string;
  variant?: "success" | "warning" | "danger" | "neutral";
}) {
  const styles = {
    success: "border-primary/10 bg-primary/5",
    warning: "border-warning/10 bg-warning/5",
    danger: "border-destructive/10 bg-destructive/5",
    neutral: "border-white/5 bg-white/[0.02]",
  };
  const textStyles = {
    success: "text-primary/90",
    warning: "text-warning/90",
    danger: "text-destructive/90",
    neutral: "text-white/40",
  };
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 ${styles[variant]} backdrop-blur-md`}>
      <span className={`flex-shrink-0 mt-0.5 ${textStyles[variant]}`}>{icon}</span>
      <span className={`text-[11px] font-medium leading-[1.6] ${textStyles[variant]}`}>{text}</span>
    </div>
  );
}

// --- Progress ring ---
function ScoreRing({ value, size = 80, stroke = 8, color }: { value: number; size?: number; stroke?: number; color: string }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" className="text-white/5" strokeWidth={stroke} />
      <motion.circle 
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} 
        animate={{ strokeDashoffset: offset }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} 
      />
    </svg>
  );
}

function RadarVisual({ topCats, customCats }: { topCats: any[], customCats: CustomCategory[] }) {
  return (
    <div className="relative group w-full aspect-square max-w-[320px] mx-auto">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute -inset-8 border border-white/[0.03] rounded-full"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        className="absolute -inset-4 border border-white/[0.05] rounded-full"
      />
      
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-white/[0.01] border border-white/5 backdrop-blur-[2px]" />
        
        {/* Radar concentric circles */}
        <div className="absolute inset-[20%] rounded-full border border-white/[0.03]" />
        <div className="absolute inset-[40%] rounded-full border border-white/[0.03]" />
        <div className="absolute inset-[60%] rounded-full border border-white/[0.03]" />
        
        <div className="absolute inset-[15%] rounded-full border border-white/[0.05] flex items-center justify-center">
          <Radar className="w-10 h-10 text-white/10" />
        </div>
        
        {/* Minimalist Radar Sweeper - Transparent with subtle green */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full"
          style={{ 
            background: 'conic-gradient(from 0deg, transparent 0%, rgba(34, 197, 94, 0.08) 50%, transparent 100%)',
          }}
        />

        {/* Category Icons as "Blips" */}
        {topCats.map((cat, i) => {
          const Icon = getCategoryIcon(cat.name, customCats);
          const color = getCategoryColor(cat.name, customCats);
          // Distribute icons around the radar
          const angle = (i * 72) + 20; // 5 icons, roughly 72 deg apart
          const distance = 35 + (i * 5); // varies between 35% and 55% from center
          
          return (
            <motion.div
              key={cat.name}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0.9, 1.1, 0.9],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{ 
                duration: 3 + i, 
                repeat: Infinity,
                delay: i * 0.4
              }}
              className="absolute w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.05)]"
              style={{
                top: `${50 + Math.sin(angle * Math.PI / 180) * distance}%`,
                left: `${50 + Math.cos(angle * Math.PI / 180) * distance}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <Icon className="w-5 h-5" style={{ color: `hsl(${color})` }} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function RadarFinanceiro() {
  const navigate = useNavigate();
  const { insights, status, loading, currentData: data, prevData } = useRadarFinanceiro();
  const [customCats, setCustomCats] = useState<CustomCategory[]>([]);

  useEffect(() => {
    getCustomCategories().then(setCustomCats).catch(() => {});
  }, []);

  const totalParcelado = useMemo(
    () => (data?.transactions ?? []).filter((t) => t.type === "despesa" && (t as any).recurrence_type === "parcelado").reduce((s, t) => s + t.amount, 0),
    [data]
  );
  const health = useMemo<HealthScoreV2>(
    () => (data ? calculateHealthScore(data, insights, totalParcelado) : { score: 0, label: "Crítico", level: "vermelho", factors: [] }),
    [data, insights, totalParcelado]
  );
  const hubyMsg = useMemo(() => generateHubyMessage(insights), [insights]);
  const hubyActions = useMemo<HubyAction[]>(
    () => (data && !loading ? generateHubyActions(data, insights, health, prevData ?? undefined) : []),
    [data, insights, health, prevData, loading]
  );

  const despesas = data?.despesas ?? 0;

  const topCats = useMemo(() => {
    const cats = (data?.categories ?? []).slice(0, 5);
    const prevMap: Record<string, number> = {};
    (prevData?.categories ?? []).forEach((c) => { prevMap[c.name] = c.amount; });
    return cats.map((c) => ({ ...c, prev: prevMap[c.name] }));
  }, [data, prevData]);

  const statusConfig = {
    verde: { bg: "bg-primary/5", border: "border-primary/20", text: "text-primary", ringColor: "hsl(var(--primary))", icon: <ShieldCheck className="w-6 h-6" />, label: "Consistência de Elite" },
    amarelo: { bg: "bg-warning/5", border: "border-warning/20", text: "text-warning", ringColor: "hsl(var(--warning))", icon: <AlertTriangle className="w-6 h-6" />, label: "Ajuste de Rota" },
    vermelho: { bg: "bg-destructive/5", border: "border-destructive/20", text: "text-destructive", ringColor: "hsl(var(--destructive))", icon: <Flame className="w-6 h-6" />, label: "Alerta de Risco" },
  };
  const sc = statusConfig[status.level];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-primary text-lg font-display uppercase tracking-widest">Sincronizando Radar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Voltar</span>
          </button>
          <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tighter leading-tight">
            Radar <span className="text-primary italic">Financeiro</span>
          </h1>
          <p className="text-[12px] text-white/20 font-bold uppercase tracking-[0.3em] mt-2">Inteligência Estratégica em Tempo Real</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-6 py-3"
        >
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-white/60 tracking-widest uppercase">Scanner Ativo</span>
        </motion.div>
      </header>

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Main Highlight Card - Expanded Height and Radar Visual */}
        <div className="md:col-span-8">
          <BentoCard 
            title="Huby AI Intelligence" 
            icon={<Bot className="w-5 h-5" />}
            badge="Premium Insight"
            badgeVariant="success"
            className="relative overflow-hidden min-h-[580px]"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row gap-12 h-full pt-4">
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <span className="inline-block px-3 py-1 rounded-md bg-primary/5 text-[10px] font-black text-primary uppercase tracking-[0.3em] border border-primary/10">
                      Insight de Hoje
                    </span>
                    <p className="text-2xl lg:text-4xl font-display font-medium text-white/95 leading-[1.2] tracking-tight">
                      "{hubyMsg.main}"
                    </p>
                  </div>
                  
                  {hubyMsg.secondary && (
                    <div className="flex items-start gap-4 p-5 rounded-[32px] bg-white/[0.02] border border-white/5">
                      <Sparkles className="w-5 h-5 text-primary shrink-0" />
                      <p className="text-[13px] text-white/50 font-medium leading-relaxed italic">
                        {hubyMsg.secondary}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-1 bg-white/5" />
                    <h5 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Ações Sugeridas</h5>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {hubyActions.length > 0 ? (
                      hubyActions.slice(0, 2).map((action, i) => (
                        <button 
                          key={i}
                          onClick={() => navigate(action.path)}
                          className="group flex items-center gap-5 p-6 rounded-[32px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-primary/20 transition-all text-left"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                            <Zap className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-[14px] font-bold text-white group-hover:text-primary transition-colors">{action.titulo}</h4>
                            <p className="text-[11px] text-white/30 font-medium mt-1 line-clamp-1">{action.descricao}</p>
                            <span className="text-[11px] font-black text-primary tabular-nums tracking-tight mt-1 inline-block">
                              Impacto: +{fmt(action.impacto_estimado)}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="col-span-2 py-8 text-center border border-white/5 rounded-[32px] bg-white/[0.01]">
                        <p className="text-xs text-white/20 font-medium uppercase tracking-widest">Nenhuma ação crítica necessária hoje</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RADAR VISUAL COMPONENT */}
              <div className="lg:w-[320px] flex items-center justify-center">
                <RadarVisual topCats={topCats} customCats={customCats} />
              </div>
            </div>
          </BentoCard>
        </div>

        {/* Health Score - Vertical Highlight */}
        <div className="md:col-span-4">
          <BentoCard 
            title="Score Huby" 
            icon={<Activity className="w-5 h-5" />}
            className={`border-${status.level === 'vermelho' ? 'destructive' : status.level === 'amarelo' ? 'warning' : 'primary'}/20 h-full`}
          >
            <div className="flex flex-col items-center justify-center h-full py-8">
              <div className="relative mb-10">
                <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 bg-${status.level === 'vermelho' ? 'destructive' : status.level === 'amarelo' ? 'warning' : 'primary'}`} />
                <ScoreRing value={health.score} size={180} stroke={14} color={sc.ringColor} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-6xl font-display font-black tracking-tighter tabular-nums ${sc.text}`}>{health.score}</span>
                  <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mt-2">Saúde Financeira</span>
                </div>
              </div>
              <div className="text-center px-4">
                <h3 className={`text-2xl font-display font-extrabold mb-3 ${sc.text}`}>{sc.label}</h3>
                <div className="space-y-4">
                  <p className="text-sm text-white/40 font-medium leading-relaxed">
                    {health.factors.length > 0 ? health.factors[0].description : "Seu desempenho financeiro está sendo analisado."}
                  </p>
                  
                  <div className="pt-6 grid grid-cols-1 gap-3">
                    {health.factors.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-center gap-3 text-[11px] text-left p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${f.impact === 'positivo' ? 'bg-primary' : 'bg-destructive'}`} />
                        <span className="text-white/60 font-medium">{f.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>
        </div>

      </div>
    </div>
  );
}

