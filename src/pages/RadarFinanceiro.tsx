import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, AlertTriangle, TrendingUp, TrendingDown, Zap,
  ShieldCheck, ChevronRight, ChevronDown, ChevronUp, Bot,
  Sparkles, CreditCard, RefreshCw, Package, Activity, Target,
  Gauge, Scissors, PiggyBank, Flame, BarChart3,
  ArrowUpRight, ArrowDownRight, ScanText, Info,
} from "lucide-react";
import { useRadarFinanceiro } from "@/hooks/useRadarFinanceiro";
import { calculateHealthScore, type HealthScoreV2 } from "@/services/healthScoreService";
import { generateHubyActions, type HubyAction } from "@/services/hubyActionsService";
import { generateHubyMessage } from "@/services/hubyMessageService";
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

export default function RadarFinanceiro() {
  const navigate = useNavigate();
  const { insights, status, loading, currentData: data, prevData } = useRadarFinanceiro();

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

  const receitas = data?.receitas ?? 0;
  const despesas = data?.despesas ?? 0;
  const prevDespesas = prevData?.despesas ?? 0;

  const cardTotal = useMemo(() => (data?.transactions ?? []).filter((t) => t.type === "despesa" && t.isFatura).reduce((s, t) => s + t.amount, 0), [data]);
  const cardPct = pct(cardTotal, despesas);
  const nonCardPct = 100 - cardPct;

  const recDespesas = useMemo(() => (data?.transactions ?? []).filter((t) => t.type === "despesa" && (t as any).recurrence_type === "fixa").reduce((s, t) => s + t.amount, 0), [data]);
  const fixoPct = pct(recDespesas, receitas);
  const variavelDespesas = despesas - recDespesas;
  const variavelPct = pct(variavelDespesas, receitas);

  const comprometimentoPct = pct(despesas, receitas);
  const comprometimentoColor = comprometimentoPct < 60 ? "text-primary" : comprometimentoPct <= 80 ? "text-warning" : "text-destructive";
  const comprometimentoRing = comprometimentoPct < 60 ? "hsl(var(--primary))" : comprometimentoPct <= 80 ? "hsl(var(--warning))" : "hsl(var(--destructive))";
  const livre = Math.max(receitas - despesas, 0);

  const topCats = useMemo(() => {
    const cats = (data?.categories ?? []).slice(0, 5);
    const prevMap: Record<string, number> = {};
    (prevData?.categories ?? []).forEach((c) => { prevMap[c.name] = c.amount; });
    return cats.map((c) => ({ ...c, prev: prevMap[c.name] }));
  }, [data, prevData]);

  const catDiagnostics = useMemo(() => {
    const diags: { text: string; variant: "warning" | "danger" | "success" }[] = [];
    if (topCats.length === 0) return diags;
    const top = topCats[0];
    const topPctVal = pct(top.amount, despesas);
    if (topPctVal > 30) diags.push({ text: `${top.name} concentra ${topPctVal}% dos seus gastos — ponto de atenção principal.`, variant: "danger" });
    topCats.forEach(c => {
      if (c.prev && c.prev > 0 && c.amount > c.prev * 1.2) {
        const changePct = Math.round(((c.amount - c.prev) / c.prev) * 100);
        diags.push({ text: `${c.name} cresceu ${changePct}% vs mês anterior.`, variant: "warning" });
      }
    });
    return diags.slice(0, 3);
  }, [topCats, despesas, receitas]);

  const installmentCount = useMemo(() => (data?.transactions ?? []).filter((t) => t.type === "despesa" && (t as any).recurrence_type === "parcelado").length, [data]);
  const parceladoPct = pct(totalParcelado, receitas);
  const expenseChange = prevDespesas > 0 ? Math.round(((despesas - prevDespesas) / prevDespesas) * 100) : 0;

  const statusConfig = {
    verde: { bg: "bg-primary/5", border: "border-primary/20", text: "text-primary", ringColor: "hsl(var(--primary))", icon: <ShieldCheck className="w-6 h-6" />, label: "Consistência de Elite" },
    amarelo: { bg: "bg-warning/5", border: "border-warning/20", text: "text-warning", ringColor: "hsl(var(--warning))", icon: <AlertTriangle className="w-6 h-6" />, label: "Ajuste de Rota" },
    vermelho: { bg: "bg-destructive/5", border: "border-destructive/20", text: "text-destructive", ringColor: "hsl(var(--destructive))", icon: <Flame className="w-6 h-6" />, label: "Alerta de Risco" },
  };
  const sc = statusConfig[status.level];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-primary text-lg">Processando diagnóstico...</div>
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 auto-rows-fr">
        
        {/* Huby AI Recommendation - Main Highlight */}
        <div className="md:col-span-8">
          <BentoCard 
            title="Huby AI Intelligence" 
            icon={<Bot className="w-5 h-5" />}
            badge="Premium Insight"
            badgeVariant="success"
            className="relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col justify-between h-full pt-2">
              <div className="space-y-6">
                <p className="text-2xl lg:text-3xl font-display font-medium text-white/90 leading-snug">
                  "{hubyMsg.main}"
                </p>
                {hubyMsg.secondary && (
                  <p className="text-sm text-white/40 font-medium leading-relaxed italic">
                    {hubyMsg.secondary}
                  </p>
                )}
              </div>

              {hubyActions.length > 0 && (
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hubyActions.slice(0, 2).map((action, i) => (
                    <button 
                      key={i}
                      onClick={() => navigate(action.path)}
                      className="group flex flex-col gap-3 p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Zap className="w-4 h-4" />
                        </div>
                        <span className="text-[13px] font-black text-primary tabular-nums tracking-tight">
                          +{fmt(action.impacto_estimado)}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-white">{action.titulo}</h4>
                        <p className="text-[11px] text-white/30 font-medium mt-1 line-clamp-1">{action.descricao}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </BentoCard>
        </div>

        {/* Health Score - Vertical Highlight */}
        <div className="md:col-span-4">
          <BentoCard 
            title="Score Huby" 
            icon={<Activity className="w-5 h-5" />}
            className={`border-${status.level === 'vermelho' ? 'destructive' : status.level === 'amarelo' ? 'warning' : 'primary'}/20`}
          >
            <div className="flex flex-col items-center justify-center h-full py-4">
              <div className="relative mb-8">
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 bg-${status.level === 'vermelho' ? 'destructive' : status.level === 'amarelo' ? 'warning' : 'primary'}`} />
                <ScoreRing value={health.score} size={160} stroke={12} color={sc.ringColor} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-5xl font-display font-black tracking-tighter tabular-nums ${sc.text}`}>{health.score}</span>
                  <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mt-2">Saúde Financeira</span>
                </div>
              </div>
              <div className="text-center">
                <h3 className={`text-xl font-display font-extrabold mb-2 ${sc.text}`}>{sc.label}</h3>
                <p className="text-xs text-white/40 font-medium px-4">
                  {health.factors.length > 0 ? health.factors[0].description : "Seu desempenho financeiro está sendo analisado."}
                </p>
              </div>
            </div>
          </BentoCard>
        </div>

        {/* Projeções e Comprometimento */}
        <div className="md:col-span-6 lg:col-span-4">
          <BentoCard title="Comprometimento" icon={<Gauge className="w-5 h-5" />} badge={`${comprometimentoPct}%`}>
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Renda Comprometida</p>
                  <p className={`text-3xl font-display font-black ${comprometimentoColor}`}>{fmt(despesas)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Disponível</p>
                  <p className="text-xl font-display font-black text-white/80">{fmt(livre)}</p>
                </div>
              </div>
              
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${Math.min(comprometimentoPct, 100)}%` }}
                  className={`h-full rounded-full bg-gradient-to-r ${comprometimentoPct > 80 ? 'from-destructive to-destructive/60' : 'from-primary to-primary/60'}`}
                />
              </div>

              <DiagPill 
                icon={<Info className="w-4 h-4" />} 
                text={comprometimentoPct < 60 ? "Margem de segurança ideal para investimentos." : "Atenção ao limite de comprometimento recomendado."}
                variant={comprometimentoPct < 60 ? "success" : "warning"}
              />
            </div>
          </BentoCard>
        </div>

        {/* Scanner Mágico - Cards Analysis */}
        <div className="md:col-span-6 lg:col-span-4">
          <BentoCard title="Scanner Cartões" icon={<CreditCard className="w-5 h-5" />} badge={`${cardPct}% uso`}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[9px] text-white/30 font-black uppercase mb-1">Total Fatura</p>
                  <p className="text-lg font-display font-black text-white">{fmt(cardTotal)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[9px] text-white/30 font-black uppercase mb-1">Parcelados</p>
                  <p className="text-lg font-display font-black text-warning">{fmt(totalParcelado)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <p className="text-[11px] font-medium text-primary/80 leading-snug">
                  Você economizaria <span className="font-bold underline">R$ 42,00</span> em juros este mês antecipando parcelas.
                </p>
              </div>

              <button 
                onClick={() => navigate("/gestao")}
                className="w-full flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors group"
              >
                <span>Analisar faturas</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </BentoCard>
        </div>

        {/* Faturas em Tempo Real - Recent Trends */}
        <div className="md:col-span-12 lg:col-span-4">
          <BentoCard title="Top Gastos" icon={<BarChart3 className="w-5 h-5" />}>
            <div className="space-y-4">
              {topCats.map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-[13px] font-bold text-white/80">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[13px] font-black text-white tabular-nums">{fmt(cat.amount)}</span>
                    <span className="text-[10px] font-medium text-white/20 tabular-nums w-8 text-right">{pct(cat.amount, despesas)}%</span>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t border-white/5">
                {catDiagnostics.length > 0 && (
                  <div className="flex items-start gap-3 text-[11px] text-warning/60 italic leading-relaxed">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{catDiagnostics[0].text}</span>
                  </div>
                )}
              </div>
            </div>
          </BentoCard>
        </div>

      </div>
    </div>
  );
}

