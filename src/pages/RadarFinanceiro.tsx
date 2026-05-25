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
    <div className="relative group w-full aspect-square max-w-[420px] mx-auto">
      {/* Decorative Outer Rings */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute -inset-12 border border-white/[0.02] rounded-full"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute -inset-6 border border-white/[0.04] rounded-full"
      />
      
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Main Radar Background - More Transparent */}
        <div className="absolute inset-0 rounded-full bg-white/[0.005] border border-white/5 backdrop-blur-[1px]" />
        
        {/* Radar concentric circles */}
        {[20, 40, 60, 80].map((inset) => (
          <div key={inset} className="absolute rounded-full border border-white/[0.03]" style={{ inset: `${inset}%` }} />
        ))}
        
        {/* Central Icon */}
        <div className="absolute inset-[42%] rounded-full border border-white/[0.05] flex items-center justify-center bg-black/20">
          <Radar className="w-8 h-8 text-white/5" />
        </div>
        
        {/* Modern Radar Sweeper - Subtle Green Detail */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
          style={{ 
            background: 'conic-gradient(from 0deg, transparent 0%, rgba(34, 197, 94, 0.12) 50%, transparent 100%)',
          }}
        >
          {/* Subtle Green Line at the edge of the sweep */}
          <div className="absolute top-1/2 left-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent to-primary/40 origin-left" style={{ transform: 'rotate(180deg)' }} />
        </motion.div>

        {/* Category Icons as "Blips" */}
        {topCats.map((cat, i) => {
          const Icon = getCategoryIcon(cat.name, customCats);
          const color = getCategoryColor(cat.name, customCats);
          // Distribute icons around the radar
          const angle = (i * (360 / Math.max(topCats.length, 1))) + 25;
          const distance = 35 + (i * 3); // distance from center in %
          
          return (
            <motion.div
              key={cat.name}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0.95, 1.1, 0.95],
                opacity: [0.4, 0.8, 0.4],
                boxShadow: [
                  `0 0 0px hsl(${color} / 0)`,
                  `0 0 25px hsl(${color} / 0.15)`,
                  `0 0 0px hsl(${color} / 0)`
                ]
              }}
              transition={{ 
                duration: 4 + i, 
                repeat: Infinity,
                delay: i * 0.4
              }}
              className="absolute w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center backdrop-blur-xl shadow-2xl z-20 group/blip"
              style={{
                top: `${50 + Math.sin(angle * Math.PI / 180) * distance}%`,
                left: `${50 + Math.cos(angle * Math.PI / 180) * distance}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <Icon className="w-7 h-7" style={{ color: `hsl(${color})` }} />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/blip:opacity-100 transition-opacity whitespace-nowrap bg-black/80 px-2 py-1 rounded border border-white/10 pointer-events-none">
                <span className="text-[9px] font-bold text-white uppercase tracking-widest">{cat.name}</span>
              </div>
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

      {/* REFORMULATED BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Expanded Main Intelligence Card */}
        <div className="md:col-span-12">
          <BentoCard 
            title="Sua Inteligência Huby" 
            icon={<Bot className="w-5 h-5 text-primary" />}
            badge="Scanner Ativo"
            badgeVariant="success"
            className="relative overflow-hidden min-h-[750px] border-white/5"
          >
            {/* Artistic Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] -mr-48 -mt-48 pointer-events-none opacity-40" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] -ml-24 -mb-24 pointer-events-none opacity-20" />
            
            <div className="relative z-10 flex flex-col lg:flex-row gap-16 h-full">
              {/* Left Column: Messages & Actions */}
              <div className="flex-1 flex flex-col justify-between py-4">
                <div className="space-y-12">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Insight do Momento</span>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-3xl lg:text-5xl font-display font-medium text-white leading-[1.1] tracking-tight whitespace-pre-line">
                        {hubyMsg.main.split('\n')[0]}
                      </p>
                      <p className="text-lg lg:text-xl text-white/50 font-medium leading-relaxed max-w-2xl">
                        {hubyMsg.main.split('\n').slice(1).join(' ') || hubyMsg.secondary}
                      </p>
                    </div>

                    {/* Descontraída / Informal Add-on */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="p-7 rounded-[40px] bg-white/[0.03] border border-white/5 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-warning/20 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-warning" />
                        </div>
                        <span className="text-[11px] font-black text-warning uppercase tracking-[0.2em]">Papo de Elite</span>
                      </div>
                      <p className="text-[15px] text-white/80 font-medium italic leading-relaxed">
                        "Parece que o delivery virou seu melhor amigo esse mês, né? 🍕 Gastar {pct(topCats[0]?.amount || 0, data?.despesas || 1)}% do seu orçamento nisso é puxado. Que tal um desafio de cozinhar em casa esse final de semana e blindar esse patrimônio?"
                      </p>
                    </motion.div>
                  </div>
                  
                  {/* Suggested Actions Section */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <h5 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] whitespace-nowrap">Ações Sugeridas</h5>
                      <div className="h-px w-full bg-white/5" />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {hubyActions.length > 0 ? (
                        hubyActions.slice(0, 2).map((action, i) => (
                          <motion.button 
                            key={i}
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.06)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(action.path)}
                            className="group flex flex-col gap-5 p-8 rounded-[40px] bg-white/[0.03] border border-white/5 transition-all text-left"
                          >
                            <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                              {action.titulo.toLowerCase().includes('meta') ? <Target className="w-7 h-7" /> : <Zap className="w-7 h-7" />}
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{action.titulo}</h4>
                              <p className="text-[13px] text-white/40 font-medium leading-relaxed mb-6 line-clamp-2">{action.descricao}</p>
                              <div className="flex items-center justify-between mt-auto">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                                  Impacto: +{fmt(action.impacto_estimado)}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        ))
                      ) : (
                        <div className="col-span-2 py-16 text-center border border-dashed border-white/10 rounded-[40px] bg-white/[0.01]">
                          <p className="text-sm text-white/20 font-medium uppercase tracking-widest">Radar limpo. Sua rota está impecável.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Info */}
                <div className="mt-12 flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {topCats.map((cat, i) => {
                      const Icon = getCategoryIcon(cat.name, customCats);
                      const color = getCategoryColor(cat.name, customCats);
                      return (
                        <div 
                          key={i} 
                          className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-900 flex items-center justify-center text-white/60 shadow-xl" 
                          title={cat.name}
                          style={{ borderColor: i === 0 ? `hsl(${color} / 0.5)` : undefined }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-white/30 font-bold uppercase tracking-[0.2em]">
                    Scanner monitorando <span className="text-primary">{topCats.length} categorias</span> críticas
                  </p>
                </div>
              </div>

              {/* Right Column: Radar Visual & Health Score Floating */}
              <div className="lg:w-[480px] flex flex-col items-center justify-center relative py-12">
                <RadarVisual topCats={topCats} customCats={customCats} />
                
                {/* Floating Health Score Card - Integrated & Premium */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
                  className="absolute bottom-6 right-6 lg:-right-4 lg:bottom-12 p-10 rounded-[48px] glass-card border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] z-30 min-w-[280px]"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 bg-${status.level === 'vermelho' ? 'destructive' : status.level === 'amarelo' ? 'warning' : 'primary'}`} />
                      <ScoreRing value={health.score} size={130} stroke={12} color={sc.ringColor} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-display font-black tracking-tighter tabular-nums ${sc.text}`}>{health.score}</span>
                      </div>
                    </div>
                    <h3 className={`text-xl font-display font-black uppercase tracking-widest mb-2 ${sc.text}`}>{sc.label}</h3>
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] mb-8">Saúde Financeira</p>
                    
                    <div className="w-full space-y-3">
                      {health.factors.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-4 text-[11px] text-left p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${f.status === 'saudavel' ? 'bg-primary shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`} />
                          <span className="text-white/60 font-semibold truncate">{f.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
