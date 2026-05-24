import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, AlertTriangle, TrendingUp, TrendingDown, Zap,
  ShieldCheck, ChevronRight, ChevronDown, ChevronUp, Bot,
  Sparkles, CreditCard, RefreshCw, Package, Activity, Target,
  Gauge, Scissors, PiggyBank, Flame, BarChart3,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { useRadarFinanceiro } from "@/hooks/useRadarFinanceiro";
import { calculateHealthScore, type HealthScoreV2 } from "@/services/healthScoreService";
import { generateHubyActions, type HubyAction } from "@/services/hubyActionsService";
import { generateHubyMessage } from "@/services/hubyMessageService";
import type { RadarInsight } from "@/services/radarService";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

// ─── Section wrapper ────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
  defaultOpen = true,
  delay = 0,
  badge,
  badgeVariant = "neutral",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  delay?: number;
  badge?: string;
  badgeVariant?: "success" | "warning" | "danger" | "neutral";
}) {
  const [open, setOpen] = useState(defaultOpen);
  const badgeStyles = {
    success: "bg-primary/10 text-primary border border-primary/20",
    warning: "bg-warning/10 text-warning border border-warning/20",
    danger: "bg-destructive/10 text-destructive border border-destructive/20",
    neutral: "bg-white/5 text-muted-foreground border border-white/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="rounded-[28px] border border-white/10 bg-[#111111]/40 backdrop-blur-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/5 transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center flex-shrink-0 border border-white/10 shadow-inner">
            <span className="text-primary/90">{icon}</span>
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="text-[15px] font-bold text-white tracking-tight leading-none">{title}</span>
            {badge && (
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase ${badgeStyles[badgeVariant]}`}>
                {badge}
              </span>
            )}
          </div>
        </div>
        <motion.div 
          animate={{ rotate: open ? 180 : 0, scale: open ? 1.1 : 1 }} 
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5"
        >
          <ChevronDown className="w-4 h-4 text-white/40" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-1 space-y-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Diagnostic pill ────────────────────────────────────────────────

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
    success: "border-primary/12 bg-primary/5",
    warning: "border-warning/12 bg-warning/5",
    danger: "border-destructive/12 bg-destructive/5",
    neutral: "border-border/8 bg-secondary/20",
  };
  const textStyles = {
    success: "text-primary",
    warning: "text-warning",
    danger: "text-destructive",
    neutral: "text-muted-foreground",
  };
  return (
    <div className={`flex items-start gap-2.5 rounded-[14px] border px-3.5 py-3 ${styles[variant]}`}>
      <span className={`flex-shrink-0 mt-0.5 ${textStyles[variant]}`}>{icon}</span>
      <span className={`text-[11px] font-medium leading-[1.6] ${textStyles[variant]}`}>{text}</span>
    </div>
  );
}

// ─── Progress ring ──────────────────────────────────────────────────

function ScoreRing({ value, size = 72, stroke = 6, color }: { value: number; size?: number; stroke?: number; color: string }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border) / 0.1)" strokeWidth={stroke} />
      <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2, ease: "easeOut" }} />
    </svg>
  );
}

// ─── Stat block ─────────────────────────────────────────────────────

function StatBlock({ label, value, sub, color = "text-foreground" }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-[14px] bg-secondary/15 border border-border/5 p-3.5">
      <p className="text-[9px] font-semibold tracking-[0.8px] text-muted-foreground/60 uppercase">{label}</p>
      <p className={`text-[18px] font-extrabold tabular-nums mt-1 tracking-tight ${color}`}>{value}</p>
      {sub && <p className="text-[9px] text-muted-foreground/50 mt-0.5 font-medium">{sub}</p>}
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────

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
    if (topPctVal > 30) diags.push({ text: `${top.name} concentra ${topPctVal}% dos seus gastos — é aqui que mais sai dinheiro.`, variant: "danger" });
    topCats.forEach(c => {
      if (c.prev && c.prev > 0 && c.amount > c.prev * 1.2) {
        const changePct = Math.round(((c.amount - (c.prev ?? 0)) / (c.prev ?? 1)) * 100);
        diags.push({ text: `${c.name} cresceu ${changePct}% vs mês anterior — você está gastando mais nessa área.`, variant: "warning" });
      }
    });
    const highImpact = topCats.filter(c => pct(c.amount, receitas) > 15);
    if (highImpact.length >= 3) {
      const names = highImpact.slice(0, 3).map(c => c.name).join(", ");
      diags.push({ text: `${names} juntas consomem mais de ${pct(highImpact.reduce((s, c) => s + c.amount, 0), receitas)}% da renda.`, variant: "warning" });
    }
    topCats.forEach(c => {
      if (c.prev && c.prev > 0 && c.amount < c.prev * 0.8) {
        const changePct = Math.round(((c.prev - c.amount) / c.prev) * 100);
        diags.push({ text: `${c.name} caiu ${changePct}% — bom controle nessa categoria.`, variant: "success" });
      }
    });
    return diags.slice(0, 4);
  }, [topCats, despesas, receitas]);

  const installmentCount = useMemo(() => (data?.transactions ?? []).filter((t) => t.type === "despesa" && (t as any).recurrence_type === "parcelado").length, [data]);
  const parceladoPct = pct(totalParcelado, receitas);
  const expenseChange = prevDespesas > 0 ? Math.round(((despesas - prevDespesas) / prevDespesas) * 100) : 0;

  const statusConfig = {
    verde: { bg: "bg-primary/5", border: "border-primary/20", text: "text-primary", ringColor: "hsl(var(--primary))", icon: <ShieldCheck className="w-6 h-6" />, label: "Excelência Financeira" },
    amarelo: { bg: "bg-warning/5", border: "border-warning/20", text: "text-warning", ringColor: "hsl(var(--warning))", icon: <AlertTriangle className="w-6 h-6" />, label: "Ajuste de Rota" },
    vermelho: { bg: "bg-destructive/5", border: "border-destructive/20", text: "text-destructive", ringColor: "hsl(var(--destructive))", icon: <Flame className="w-6 h-6" />, label: "Emergência Financeira" },
  };
  const sc = statusConfig[status.level];

  if (loading) {
    return (
      <div className="space-y-4 pb-4">
        <div className="animate-pulse h-12 rounded-xl bg-muted/8" />
        {[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-36 rounded-[20px] bg-muted/8" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* ── Back + Title ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary/50 border border-border/5 flex items-center justify-center hover:bg-secondary/70 active:scale-95 transition-all">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div>
          <h1 className="text-[24px] font-extrabold text-foreground tracking-tight leading-none">Radar Financeiro</h1>
          <p className="text-[11px] text-muted-foreground/60 mt-1 font-medium">Diagnóstico completo da sua vida financeira</p>
        </div>
      </motion.div>

      {/* ── Status + Score ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-[32px] p-7 relative overflow-hidden border ${sc.border} ${sc.bg} backdrop-blur-xl shadow-2xl shadow-black/40`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-[60px] -ml-12 -mb-12 pointer-events-none" />
        
        <div className="flex items-center justify-between relative z-[1]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-2xl ${sc.bg} border ${sc.border}`}>
                <span className={sc.text}>{sc.icon}</span>
              </div>
              <h2 className={`text-[18px] font-black tracking-tight leading-none ${sc.text}`}>{sc.label}</h2>
            </div>
            <p className="text-[13px] text-white/60 leading-relaxed max-w-[240px] font-medium">
              {comprometimentoPct < 60
                ? "Sua saúde financeira está sólida. Você tem autonomia total sobre seus fluxos."
                : comprometimentoPct <= 80
                  ? "Sinal de alerta moderado. Pequenos ajustes agora evitarão problemas futuros."
                  : "Nível crítico de comprometimento. É hora de reestruturar prioridades."}
            </p>
          </div>
          <div className="relative flex-shrink-0 group">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <ScoreRing value={health.score} size={84} stroke={8} color={sc.ringColor} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-[24px] font-black tabular-nums leading-none ${sc.text}`}>{health.score}</span>
              <span className="text-[9px] text-white/30 font-bold mt-1 tracking-widest uppercase">Score</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Huby AI ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-[28px] p-6 relative overflow-hidden border border-white/10 shadow-xl"
        style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)" }}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(74,222,128,0.05),transparent_50%)]" />
        <div className="flex items-start gap-4 relative z-[1]">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10 shadow-lg"
            style={{ background: "linear-gradient(135deg, #10b981, #064e3b)", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}
          >
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h5 className="text-[10px] font-black text-primary tracking-[0.2em] uppercase">Huby AI Intelligence</h5>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <p className="text-[13px] text-white/80 leading-relaxed font-medium italic">"{hubyMsg.main}"</p>
            {hubyMsg.secondary && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-[11px] text-white/40 font-medium italic">{hubyMsg.secondary}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Diagnóstico ── */}
      {(insights.length > 0 || hubyActions.length > 0) && (
        <Section icon={<Activity className="w-4 h-4" />} title="Diagnóstico" delay={0.15}
          badge={insights.length > 0 ? `${insights.length} ponto${insights.length > 1 ? "s" : ""}` : undefined}
          badgeVariant={insights.some(i => i.tipo === "alerta") ? "danger" : "warning"}
        >
          {/* Insight grid */}
          <div className="grid grid-cols-1 gap-3">
            {insights.slice(0, 3).map((insight) => {
              const cm = {
                alerta: { bg: "bg-destructive/6", border: "border-destructive/10", text: "text-destructive", icon: <AlertTriangle className="w-4 h-4" /> },
                atencao: { bg: "bg-warning/6", border: "border-warning/10", text: "text-warning", icon: <Zap className="w-4 h-4" /> },
                oportunidade: { bg: "bg-primary/6", border: "border-primary/10", text: "text-primary", icon: <Sparkles className="w-4 h-4" /> },
              };
              const c = cm[insight.tipo];
              return (
                <div key={insight.id} className={`rounded-[22px] ${c.bg} border ${c.border} p-5 backdrop-blur-md relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300`}>
                  <div className={`absolute top-0 right-0 w-24 h-24 ${c.bg} opacity-50 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none`} />
                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${c.bg} border ${c.border} shadow-sm group-hover:shadow-md transition-shadow`}>
                      <span className={c.text}>{c.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14px] font-bold text-white tracking-tight">{insight.titulo}</h4>
                      <p className="text-[11px] text-white/50 leading-relaxed mt-1 font-medium">{insight.descricao}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className={`text-[13px] font-black tabular-nums ${c.text}`}>
                          {fmt(insight.impacto_valor)}
                        </span>
                        <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Impacto Estimado</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          {hubyActions.length > 0 && (
            <div className="pt-2">
              <p className="text-[9px] font-extrabold tracking-[1.2px] text-muted-foreground/40 uppercase mb-3">O QUE FAZER</p>
              <div className="space-y-2">
                {hubyActions.map((action, i) => {
                  const cm = {
                    economia: { text: "text-primary", icon: <Scissors className="w-4 h-4" /> },
                    ajuste: { text: "text-warning", icon: <Target className="w-4 h-4" /> },
                    oportunidade: { text: "text-primary", icon: <PiggyBank className="w-4 h-4" /> },
                  };
                  const c = cm[action.tipo];
                  return (
                    <button key={`${action.titulo}-${i}`} onClick={() => navigate(action.path)}
                      className="w-full flex items-center gap-4 rounded-[20px] bg-white/5 border border-white/5 p-4 hover:bg-white/10 active:scale-[0.98] transition-all text-left group">
                      <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                        <span className={c.text}>{c.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-bold text-white tracking-tight">{action.titulo}</h4>
                        <p className="text-[11px] text-white/40 leading-relaxed mt-0.5 line-clamp-1 font-medium">{action.descricao}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-[13px] font-black tabular-nums ${c.text}`}>{fmt(action.impacto_estimado)}</span>
                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                          <ChevronRight className="w-3 h-3 text-white/30 group-hover:text-white/80" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* ── Comprometimento da Renda ── */}
      <Section icon={<Gauge className="w-4 h-4" />} title="Comprometimento da Renda" delay={0.2}
        badge={`${comprometimentoPct}%`}
        badgeVariant={comprometimentoPct < 60 ? "success" : comprometimentoPct <= 80 ? "warning" : "danger"}
      >
        <div className="flex items-center gap-6 p-6 rounded-[24px] bg-white/5 border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex-shrink-0">
            <ScoreRing value={comprometimentoPct} size={88} stroke={8} color={comprometimentoRing} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-[22px] font-black tabular-nums leading-none ${comprometimentoColor}`}>{comprometimentoPct}%</span>
              <span className="text-[8px] text-white/20 font-bold mt-1 tracking-widest uppercase">Usage</span>
            </div>
          </div>
          <div className="flex-1 space-y-3 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-white/50 font-semibold tracking-tight">Comprometido</span>
              <span className="text-[15px] font-black text-white tabular-nums">{fmt(despesas)}</span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-white/50 font-semibold tracking-tight">Disponível</span>
              <span className={`text-[15px] font-black tabular-nums ${livre > 0 ? "text-primary" : "text-destructive"}`}>{fmt(livre)}</span>
            </div>
          </div>
        </div>

        {/* Composição */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[20px] bg-white/5 border border-white/5 p-4 group hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-chart-2/10 flex items-center justify-center border border-chart-2/20">
                <RefreshCw className="w-3.5 h-3.5 text-chart-2" />
              </div>
              <span className="text-[11px] text-white/50 font-bold uppercase tracking-wider">Fixos</span>
            </div>
            <p className="text-[22px] font-black tabular-nums text-white leading-none tracking-tight">{fixoPct}%</p>
            <p className="text-[10px] text-white/30 mt-2 font-bold tabular-nums">{fmt(recDespesas)}</p>
          </div>
          <div className="rounded-[20px] bg-white/5 border border-white/5 p-4 group hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-chart-3/10 flex items-center justify-center border border-chart-3/20">
                <Zap className="w-3.5 h-3.5 text-chart-3" />
              </div>
              <span className="text-[11px] text-white/50 font-bold uppercase tracking-wider">Variáveis</span>
            </div>
            <p className="text-[22px] font-black tabular-nums text-white leading-none tracking-tight">{variavelPct}%</p>
            <p className="text-[10px] text-white/30 mt-2 font-bold tabular-nums">{fmt(variavelDespesas)}</p>
          </div>
        </div>

        <DiagPill
          icon={<Gauge className="w-3.5 h-3.5" />}
          text={comprometimentoPct < 60
            ? `Margem de ${100 - comprometimentoPct}% — bom momento para poupar ou investir.`
            : comprometimentoPct <= 80
              ? `Fixos consomem ${fixoPct}% e variáveis ${variavelPct}% — foque nos variáveis para ganhar margem.`
              : `Orçamento apertado. Custos fixos sozinhos já consomem ${fixoPct}% — avalie renegociar.`}
          variant={comprometimentoPct < 60 ? "success" : comprometimentoPct <= 80 ? "warning" : "danger"}
        />

        {prevDespesas > 0 && expenseChange !== 0 && (
          <div className="flex items-center gap-2 text-[10px]">
            {expenseChange > 0 ? <ArrowUpRight className="w-3.5 h-3.5 text-destructive" /> : <ArrowDownRight className="w-3.5 h-3.5 text-primary" />}
            <span className="text-muted-foreground/60 font-medium">
              Gastos {expenseChange > 0 ? "subiram" : "caíram"}{" "}
              <span className={`font-bold ${expenseChange > 0 ? "text-destructive" : "text-primary"}`}>{Math.abs(expenseChange)}%</span> vs anterior
            </span>
          </div>
        )}
      </Section>

      {/* ── Análise do Cartão ── */}
      {cardTotal > 0 && (
        <Section icon={<CreditCard className="w-4 h-4" />} title="Análise do Cartão" delay={0.25}
          badge={`${cardPct}%`}
          badgeVariant={cardPct > 50 ? "warning" : "neutral"}
        >
          {/* Split bar */}
          <div className="space-y-2">
            <div className="h-4 rounded-full bg-border/8 overflow-hidden flex">
              <motion.div initial={{ width: 0 }} animate={{ width: `${cardPct}%` }} transition={{ duration: 0.9 }}
                className="h-full bg-warning/80 rounded-l-full" />
              <motion.div initial={{ width: 0 }} animate={{ width: `${nonCardPct}%` }} transition={{ duration: 0.9, delay: 0.2 }}
                className="h-full bg-primary/30 rounded-r-full" />
            </div>
            <div className="flex justify-between text-[9px] font-medium text-muted-foreground/50">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-warning/80" />
                Cartão {cardPct}%
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary/30" />
                Outros {nonCardPct}%
              </div>
            </div>
          </div>

          {totalParcelado > 0 && (
            <div className="rounded-[20px] bg-white/5 border border-white/5 p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-warning/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center border border-warning/20">
                    <Package className="w-5 h-5 text-warning" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-white/50 font-bold uppercase tracking-wider">Parcelas ativas</span>
                    <p className="text-[10px] text-white/30 font-medium">
                      Comprometem <span className="font-bold text-warning">{parceladoPct}%</span> da renda
                    </p>
                  </div>
                </div>
                <span className="text-[18px] font-black text-warning tabular-nums tracking-tight">{fmt(totalParcelado)}</span>
              </div>
            </div>
          )}

          <DiagPill
            icon={<CreditCard className="w-3.5 h-3.5" />}
            text={cardPct > 60
              ? `Cartão domina ${cardPct}% dos gastos. Alta dependência esconde custos — revise as faturas.`
              : cardPct > 40
                ? `Cartão em ${cardPct}% — moderado. Fique atento às parcelas acumuladas.`
                : `Uso equilibrado do cartão (${cardPct}%). Sem alertas.`}
            variant={cardPct > 60 ? "danger" : cardPct > 40 ? "warning" : "success"}
          />

          <button onClick={() => navigate("/gestao")}
            className="w-full flex items-center justify-between rounded-[20px] bg-primary/10 border border-primary/20 px-5 py-4 hover:bg-primary/20 active:scale-[0.98] transition-all group shadow-lg shadow-primary/5">
            <span className="text-[13px] font-black text-primary tracking-tight">Detalhamento de Faturas</span>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-all">
              <ChevronRight className="w-4 h-4 text-primary" />
            </div>
          </button>
        </Section>
      )}

      {/* ── Análise de Categorias ── */}
      <Section icon={<BarChart3 className="w-4 h-4" />} title="Análise de Categorias" delay={0.3}
        badge={catDiagnostics.length > 0 ? `${catDiagnostics.length} alerta${catDiagnostics.length > 1 ? "s" : ""}` : undefined}
        badgeVariant="warning"
      >
        {/* Category bars */}
        <div className="space-y-3.5">
          {topCats.map((cat) => {
            const catPctVal = pct(cat.amount, despesas);
            const change = cat.prev && cat.prev > 0 ? Math.round(((cat.amount - cat.prev) / cat.prev) * 100) : null;
            return (
              <div key={cat.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-[12px] font-bold text-foreground">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[12px] font-extrabold text-foreground tabular-nums">{fmt(cat.amount)}</span>
                    <span className="text-[10px] text-muted-foreground/40 tabular-nums font-medium">{catPctVal}%</span>
                    {change !== null && change !== 0 && (
                      <span className={`text-[9px] font-bold flex items-center gap-0.5 ${change > 0 ? "text-destructive" : "text-primary"}`}>
                        {change > 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                        {change > 0 ? "+" : ""}{change}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2 rounded-full bg-border/8 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(catPctVal, 100)}%` }} transition={{ duration: 0.7 }}
                    className="h-full rounded-full" style={{ backgroundColor: cat.color, opacity: 0.85 }} />
                </div>
              </div>
            );
          })}
        </div>

        {topCats.length === 0 && <p className="text-[11px] text-muted-foreground/50 text-center py-3">Sem dados de categorias</p>}

        {/* Diagnostics */}
        {catDiagnostics.length > 0 && (
          <div className="pt-1 space-y-2">
            <p className="text-[9px] font-extrabold tracking-[1.2px] text-muted-foreground/40 uppercase mb-1">DIAGNÓSTICO</p>
            {catDiagnostics.map((diag, i) => (
              <DiagPill key={i} icon={
                diag.variant === "success" ? <TrendingDown className="w-3.5 h-3.5" /> :
                diag.variant === "danger" ? <AlertTriangle className="w-3.5 h-3.5" /> :
                <Zap className="w-3.5 h-3.5" />
              } text={diag.text} variant={diag.variant} />
            ))}
          </div>
        )}

        <button onClick={() => navigate("/analytics/categorias")}
          className="w-full flex items-center justify-between rounded-[14px] bg-primary/6 border border-primary/10 px-4 py-3 hover:bg-primary/10 active:scale-[0.98] transition-all">
          <span className="text-[11px] font-bold text-primary">Explorar categorias</span>
          <ChevronRight className="w-4 h-4 text-primary/60" />
        </button>
      </Section>
    </div>
  );
}
