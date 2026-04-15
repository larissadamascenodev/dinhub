import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, AlertTriangle, TrendingUp, TrendingDown, Zap,
  ShieldCheck, ChevronRight, ChevronDown, ChevronUp, Bot,
  Sparkles, CreditCard, RefreshCw, Wallet, Receipt,
  PiggyBank, Scissors, Package, DollarSign, Activity, Target,
  Gauge, Shield, ArrowUpRight, ArrowDownRight, Percent, Ban,
  CircleDollarSign, BarChart3, Flame, Star,
} from "lucide-react";
import { useRadarFinanceiro } from "@/hooks/useRadarFinanceiro";
import { calculateHealthScore, type HealthScoreV2 } from "@/services/healthScoreService";
import { generateRadarInsights, type RadarInsight } from "@/services/radarService";
import { generateHubyActions, type HubyAction } from "@/services/hubyActionsService";
import { generateHubyMessage } from "@/services/hubyMessageService";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

// ─── Expandable section wrapper ─────────────────────────────────────

function Section({
  icon,
  title,
  children,
  defaultOpen = true,
  delay = 0,
  badge,
  badgeColor,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  delay?: number;
  badge?: string;
  badgeColor?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-[18px] border border-border/10 bg-card/60 backdrop-blur-xl overflow-hidden"
      style={{ boxShadow: "0 2px 16px -4px rgba(0,0,0,0.2)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-card/80 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary">{icon}</span>
          </div>
          <span className="text-[13px] font-bold text-foreground">{title}</span>
          {badge && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badgeColor || "bg-primary/10 text-primary"}`}>
              {badge}
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Analysis pill ──────────────────────────────────────────────────

function AnalysisPill({
  icon,
  text,
  variant = "neutral",
}: {
  icon: React.ReactNode;
  text: string;
  variant?: "success" | "warning" | "danger" | "neutral";
}) {
  const styles = {
    success: "bg-primary/8 border-primary/15 text-primary",
    warning: "bg-warning/8 border-warning/15 text-warning",
    danger: "bg-destructive/8 border-destructive/15 text-destructive",
    neutral: "bg-secondary/30 border-border/10 text-muted-foreground",
  };
  return (
    <div className={`flex items-center gap-2 rounded-[12px] border px-3 py-2.5 ${styles[variant]}`}>
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-[11px] font-medium leading-relaxed">{text}</span>
    </div>
  );
}

// ─── Progress ring (mini) ───────────────────────────────────────────

function ProgressRing({ value, size = 48, stroke = 4, color }: { value: number; size?: number; stroke?: number; color: string }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border) / 0.15)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  );
}

// ─── Category analysis row ──────────────────────────────────────────

function CategoryAnalysis({
  name,
  amount,
  pctVal,
  prevAmount,
  totalDespesas,
  color,
}: {
  name: string;
  amount: number;
  pctVal: number;
  prevAmount?: number;
  totalDespesas: number;
  color: string;
}) {
  const change = prevAmount != null && prevAmount > 0 ? Math.round(((amount - prevAmount) / prevAmount) * 100) : null;
  const isHigh = pctVal > 25;
  const isGrowing = change !== null && change > 20;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="text-[12px] font-semibold text-foreground">{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-foreground tabular-nums">{fmt(amount)}</span>
          <span className="text-[10px] text-muted-foreground tabular-nums">{pctVal}%</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-border/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pctVal, 100)}%` }}
          transition={{ duration: 0.6 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      {/* Analysis line */}
      {(isHigh || isGrowing) && (
        <div className="flex items-center gap-1.5">
          {isGrowing && (
            <span className="text-[10px] text-destructive font-medium flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +{change}% vs anterior
            </span>
          )}
          {change !== null && change < 0 && (
            <span className="text-[10px] text-primary font-medium flex items-center gap-0.5">
              <ArrowDownRight className="w-3 h-3" /> {change}% vs anterior
            </span>
          )}
          {isHigh && (
            <span className="text-[10px] text-warning font-medium">
              • Concentra {pctVal}% do orçamento
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────

export default function RadarFinanceiro() {
  const navigate = useNavigate();
  const { insights, status, loading, currentData: data, prevData } = useRadarFinanceiro();

  // Compute health score
  const totalParcelado = useMemo(
    () =>
      (data?.transactions ?? [])
        .filter((t) => t.type === "despesa" && (t as any).recurrence_type === "parcelado")
        .reduce((s, t) => s + t.amount, 0),
    [data]
  );
  const health = useMemo<HealthScoreV2>(
    () => (data ? calculateHealthScore(data, insights, totalParcelado) : { score: 0, label: "Crítico", level: "vermelho", factors: [] }),
    [data, insights, totalParcelado]
  );

  // Huby messages
  const hubyMsg = useMemo(() => generateHubyMessage(insights), [insights]);

  // Huby actions
  const hubyActions = useMemo<HubyAction[]>(
    () => (data && !loading ? generateHubyActions(data, insights, health, prevData ?? undefined) : []),
    [data, insights, health, prevData, loading]
  );

  // Derived stats
  const receitas = data?.receitas ?? 0;
  const despesas = data?.despesas ?? 0;
  const balanco = data?.balanco ?? 0;
  const prevReceitas = prevData?.receitas ?? 0;
  const prevDespesas = prevData?.despesas ?? 0;

  // Credit card totals
  const cardTotal = useMemo(
    () =>
      (data?.transactions ?? [])
        .filter((t) => t.type === "despesa" && t.isFatura)
        .reduce((s, t) => s + t.amount, 0),
    [data]
  );
  const cardPct = pct(cardTotal, despesas);

  // Non-card spending
  const nonCardTotal = despesas - cardTotal;
  const nonCardPct = pct(nonCardTotal, despesas);

  // Recurrent totals
  const recReceitas = useMemo(
    () =>
      (data?.transactions ?? [])
        .filter((t) => t.type === "receita" && (t as any).recurrence_type === "fixa")
        .reduce((s, t) => s + t.amount, 0),
    [data]
  );
  const recDespesas = useMemo(
    () =>
      (data?.transactions ?? [])
        .filter((t) => t.type === "despesa" && (t as any).recurrence_type === "fixa")
        .reduce((s, t) => s + t.amount, 0),
    [data]
  );
  const fixoPct = pct(recDespesas, receitas);
  const variavelDespesas = despesas - recDespesas;
  const variavelPct = pct(variavelDespesas, receitas);

  // Comprometimento
  const comprometimentoPct = pct(despesas, receitas);
  const comprometimentoColor =
    comprometimentoPct < 60 ? "text-primary" : comprometimentoPct <= 80 ? "text-warning" : "text-destructive";
  const comprometimentoBg =
    comprometimentoPct < 60 ? "bg-primary" : comprometimentoPct <= 80 ? "bg-warning" : "bg-destructive";
  const comprometimentoRing =
    comprometimentoPct < 60 ? "hsl(var(--primary))" : comprometimentoPct <= 80 ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  // Top 5 categories with prev comparison
  const topCats = useMemo(() => {
    const cats = (data?.categories ?? []).slice(0, 5);
    const prevMap: Record<string, number> = {};
    (prevData?.categories ?? []).forEach((c) => { prevMap[c.name] = c.amount; });
    return cats.map((c) => ({ ...c, prev: prevMap[c.name] }));
  }, [data, prevData]);

  // Category diagnostics
  const catDiagnostics = useMemo(() => {
    const diags: string[] = [];
    if (topCats.length > 0) {
      const top = topCats[0];
      const topPctVal = pct(top.amount, despesas);
      if (topPctVal > 30) diags.push(`${top.name} concentra ${topPctVal}% dos seus gastos — considere redistribuir`);
    }
    const growing = topCats.filter(c => c.prev && c.prev > 0 && c.amount > c.prev * 1.2);
    growing.forEach(c => {
      const changePct = Math.round(((c.amount - (c.prev ?? 0)) / (c.prev ?? 1)) * 100);
      diags.push(`${c.name} cresceu ${changePct}% vs mês anterior — vale investigar`);
    });
    return diags;
  }, [topCats, despesas]);

  // Installment analysis
  const installmentCount = useMemo(
    () =>
      (data?.transactions ?? [])
        .filter((t) => t.type === "despesa" && (t as any).recurrence_type === "parcelado").length,
    [data]
  );
  const parceladoPct = pct(totalParcelado, receitas);

  // Expense change vs prev
  const expenseChange = prevDespesas > 0 ? Math.round(((despesas - prevDespesas) / prevDespesas) * 100) : 0;
  const revenueChange = prevReceitas > 0 ? Math.round(((receitas - prevReceitas) / prevReceitas) * 100) : 0;

  // Status config
  const statusConfig = {
    verde: { bg: "rgba(74,222,128,0.06)", border: "rgba(74,222,128,0.15)", text: "text-primary", ringColor: "hsl(var(--primary))", icon: <ShieldCheck className="w-4 h-4" />, label: "Sob controle" },
    amarelo: { bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.15)", text: "text-warning", ringColor: "hsl(var(--warning))", icon: <AlertTriangle className="w-4 h-4" />, label: "Atenção" },
    vermelho: { bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.15)", text: "text-destructive", ringColor: "hsl(var(--destructive))", icon: <Flame className="w-4 h-4" />, label: "Crítico" },
  };
  const sc = statusConfig[status.level];

  // Libre amount
  const livre = Math.max(receitas - despesas, 0);

  if (loading) {
    return (
      <div className="space-y-3 pb-4">
        <div className="animate-pulse h-10 rounded-xl bg-muted/10" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse h-32 rounded-[18px] bg-muted/10" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      {/* ── Back ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
      </motion.div>

      {/* ── Header + Status ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
        <h1 className="font-display text-[22px] font-bold text-foreground tracking-tight">Radar Financeiro</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">Diagnóstico completo da sua vida financeira</p>
      </motion.div>

      {/* ── Status Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="rounded-[20px] p-4 relative overflow-hidden"
        style={{ background: sc.bg, border: `1px solid ${sc.border}` }}
      >
        <div className="flex items-center gap-4 relative z-[1]">
          <div className="relative flex-shrink-0">
            <ProgressRing value={health.score} size={60} stroke={5} color={sc.ringColor} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-[15px] font-black tabular-nums ${sc.text}`}>{health.score}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={sc.text}>{sc.icon}</span>
              <h2 className={`text-[14px] font-bold ${sc.text}`}>{sc.label}</h2>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {comprometimentoPct < 60
                ? "Seu financeiro está equilibrado — margem confortável para o mês."
                : comprometimentoPct <= 80
                  ? "Alguns pontos merecem atenção — ajustes preventivos podem ajudar."
                  : "Situação apertada — ações imediatas são recomendadas."}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Huby Message ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[18px] p-4 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f2318 0%, #0a1a0f 60%, hsl(var(--card)) 100%)",
          border: "1px solid rgba(74, 222, 128, 0.15)",
        }}
      >
        <div className="flex items-start gap-3 relative z-[1]">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)), #16a34a)", boxShadow: "0 0 12px rgba(74,222,128,0.2)" }}
          >
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-[11px] font-bold text-primary mb-0.5">Huby diz</h5>
            <p className="text-[12px] text-muted-foreground leading-relaxed italic whitespace-pre-line">{hubyMsg.main}</p>
            {hubyMsg.secondary && (
              <p className="text-[10px] text-muted-foreground/60 mt-1.5 italic">{hubyMsg.secondary}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Diagnóstico: Insights + Ações (priority section) ── */}
      {(insights.length > 0 || hubyActions.length > 0) && (
        <Section icon={<Activity className="w-3.5 h-3.5" />} title="Diagnóstico" delay={0.14}
          badge={insights.length > 0 ? `${insights.length} ponto${insights.length > 1 ? "s" : ""}` : undefined}
          badgeColor={insights.some(i => i.tipo === "alerta") ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}
        >
          <div className="space-y-2.5">
            {insights.slice(0, 3).map((insight) => {
              const colorMap = {
                alerta: { bg: "bg-destructive/8", text: "text-destructive", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
                atencao: { bg: "bg-warning/8", text: "text-warning", icon: <Zap className="w-3.5 h-3.5" /> },
                oportunidade: { bg: "bg-primary/8", text: "text-primary", icon: <Sparkles className="w-3.5 h-3.5" /> },
              };
              const c = colorMap[insight.tipo];
              return (
                <div key={insight.id} className="rounded-[14px] bg-secondary/20 border border-border/5 p-3.5">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                      <span className={c.text}>{c.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[12px] font-bold text-foreground">{insight.titulo}</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{insight.descricao}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-[11px] font-bold tabular-nums ${c.text}`}>
                          Impacto: {fmt(insight.impacto_valor)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Recommended actions inline */}
            {hubyActions.length > 0 && (
              <div className="pt-1">
                <p className="text-[10px] font-semibold tracking-[0.5px] text-muted-foreground/70 uppercase mb-2">O que fazer</p>
                {hubyActions.map((action, i) => {
                  const colorMap = {
                    economia: { bg: "bg-primary/8", text: "text-primary", icon: <Scissors className="w-3.5 h-3.5" /> },
                    ajuste: { bg: "bg-warning/8", text: "text-warning", icon: <Target className="w-3.5 h-3.5" /> },
                    oportunidade: { bg: "bg-primary/8", text: "text-primary", icon: <PiggyBank className="w-3.5 h-3.5" /> },
                  };
                  const c = colorMap[action.tipo];
                  return (
                    <button
                      key={`${action.titulo}-${i}`}
                      onClick={() => navigate(action.path)}
                      className="w-full flex items-center gap-3 rounded-[12px] bg-secondary/15 border border-border/5 p-3 mb-2 hover:bg-secondary/25 active:scale-[0.98] transition-all text-left"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                        <span className={c.text}>{c.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[12px] font-bold text-foreground">{action.titulo}</h4>
                        <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{action.descricao}</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                        <span className={`text-[11px] font-bold tabular-nums ${c.text}`}>
                          {fmt(action.impacto_estimado)}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ── Comprometimento da Renda ── */}
      <Section icon={<Gauge className="w-3.5 h-3.5" />} title="Comprometimento da Renda" delay={0.18}
        badge={`${comprometimentoPct}%`}
        badgeColor={comprometimentoPct < 60 ? "bg-primary/15 text-primary" : comprometimentoPct <= 80 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <ProgressRing value={comprometimentoPct} size={64} stroke={6} color={comprometimentoRing} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-[15px] font-black tabular-nums ${comprometimentoColor}`}>{comprometimentoPct}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">Comprometido</span>
                <span className="text-[11px] font-bold text-destructive tabular-nums">{fmt(despesas)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">Disponível</span>
                <span className={`text-[11px] font-bold tabular-nums ${livre > 0 ? "text-primary" : "text-destructive"}`}>{fmt(livre)}</span>
              </div>
            </div>
          </div>

          {/* Breakdown: fixo vs variável */}
          <div className="rounded-[12px] bg-secondary/15 border border-border/5 p-3 space-y-2">
            <p className="text-[9px] font-semibold tracking-[0.5px] text-muted-foreground/70 uppercase">Composição</p>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <RefreshCw className="w-3 h-3 text-chart-2" />
                  <span className="text-[10px] text-muted-foreground">Fixos</span>
                </div>
                <span className="text-[13px] font-bold text-foreground tabular-nums">{fixoPct}%</span>
                <span className="text-[9px] text-muted-foreground ml-1">{fmt(recDespesas)}</span>
              </div>
              <div className="w-px bg-border/10" />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="w-3 h-3 text-chart-3" />
                  <span className="text-[10px] text-muted-foreground">Variáveis</span>
                </div>
                <span className="text-[13px] font-bold text-foreground tabular-nums">{variavelPct}%</span>
                <span className="text-[9px] text-muted-foreground ml-1">{fmt(variavelDespesas)}</span>
              </div>
            </div>
          </div>

          {/* Analysis */}
          <AnalysisPill
            icon={<Gauge className="w-3.5 h-3.5" />}
            text={comprometimentoPct < 60
              ? `Margem confortável de ${100 - comprometimentoPct}%. Bom momento para poupar.`
              : comprometimentoPct <= 80
                ? `${fixoPct}% são custos fixos e ${variavelPct}% são variáveis — foque nos variáveis para ganhar margem.`
                : `Orçamento apertado. Seus custos fixos sozinhos já consomem ${fixoPct}% — avalie renegociar contratos.`}
            variant={comprometimentoPct < 60 ? "success" : comprometimentoPct <= 80 ? "warning" : "danger"}
          />

          {/* Comparison vs prev */}
          {prevDespesas > 0 && expenseChange !== 0 && (
            <div className="flex items-center gap-2 text-[10px]">
              {expenseChange > 0 ? (
                <ArrowUpRight className="w-3 h-3 text-destructive" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-primary" />
              )}
              <span className="text-muted-foreground">
                Gastos {expenseChange > 0 ? "subiram" : "caíram"} <span className={`font-bold ${expenseChange > 0 ? "text-destructive" : "text-primary"}`}>{Math.abs(expenseChange)}%</span> vs mês anterior
              </span>
            </div>
          )}
        </div>
      </Section>

      {/* ── Análise do Cartão ── */}
      {cardTotal > 0 && (
        <Section icon={<CreditCard className="w-3.5 h-3.5" />} title="Análise do Cartão" delay={0.22}
          badge={`${cardPct}%`}
          badgeColor={cardPct > 50 ? "bg-warning/15 text-warning" : "bg-muted/20 text-muted-foreground"}
        >
          <div className="space-y-3">
            {/* Visual split: card vs others */}
            <div className="space-y-1.5">
              <div className="h-3 rounded-full bg-border/10 overflow-hidden flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cardPct}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-warning rounded-l-full"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${nonCardPct}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full bg-primary/40 rounded-r-full"
                />
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  Cartão {cardPct}%
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/40" />
                  Outros {nonCardPct}%
                </div>
              </div>
            </div>

            {/* Parcelas impact */}
            {totalParcelado > 0 && (
              <div className="rounded-[12px] bg-secondary/15 border border-border/5 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3 h-3 text-warning" />
                    <span className="text-[10px] text-muted-foreground">Parcelas no cartão</span>
                  </div>
                  <span className="text-[12px] font-bold text-warning tabular-nums">{fmt(totalParcelado)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Comprometem <span className="font-semibold text-warning">{parceladoPct}%</span> da renda mensal
                </p>
              </div>
            )}

            <AnalysisPill
              icon={<CreditCard className="w-3.5 h-3.5" />}
              text={cardPct > 60
                ? `Cartão domina ${cardPct}% dos gastos. Alta dependência pode esconder custos — revise as faturas.`
                : cardPct > 40
                  ? `Cartão em ${cardPct}% — moderado. Fique atento às parcelas acumuladas.`
                  : `Uso equilibrado do cartão (${cardPct}%). Sem alertas.`}
              variant={cardPct > 60 ? "danger" : cardPct > 40 ? "warning" : "success"}
            />

            <button
              onClick={() => navigate("/gestao")}
              className="w-full flex items-center justify-between rounded-[12px] bg-secondary/10 border border-border/5 px-3 py-2.5 hover:bg-secondary/20 active:scale-[0.98] transition-all"
            >
              <span className="text-[11px] font-semibold text-primary">Analisar faturas</span>
              <ChevronRight className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
        </Section>
      )}

      {/* ── Impacto dos Parcelamentos ── */}
      {totalParcelado > 0 && (
        <Section icon={<Package className="w-3.5 h-3.5" />} title="Impacto dos Parcelamentos" delay={0.26}
          badge={`${installmentCount} ativo${installmentCount > 1 ? "s" : ""}`}
          badgeColor={parceladoPct > 30 ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-[12px] bg-secondary/15 border border-border/5 p-3 text-center">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Mensal</p>
                <p className="text-[16px] font-bold text-warning tabular-nums mt-1">{fmt(totalParcelado)}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{parceladoPct}% da renda</p>
              </div>
              <div className="rounded-[12px] bg-secondary/15 border border-border/5 p-3 text-center">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Parcelas</p>
                <p className="text-[16px] font-bold text-foreground tabular-nums mt-1">{installmentCount}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">ativas agora</p>
              </div>
            </div>

            <AnalysisPill
              icon={<Package className="w-3.5 h-3.5" />}
              text={parceladoPct > 30
                ? `Parcelas consomem ${parceladoPct}% da renda — evite novas compras parceladas. Cada nova parcela reduz sua margem futura.`
                : `Parcelamentos controlados em ${parceladoPct}% da renda. Mantenha assim.`}
              variant={parceladoPct > 30 ? "danger" : "success"}
            />

            <button
              onClick={() => navigate("/parcelamentos")}
              className="w-full flex items-center justify-between rounded-[12px] bg-secondary/10 border border-border/5 px-3 py-2.5 hover:bg-secondary/20 active:scale-[0.98] transition-all"
            >
              <span className="text-[11px] font-semibold text-primary">Ver detalhes dos parcelamentos</span>
              <ChevronRight className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
        </Section>
      )}

      {/* ── Análise de Custos Fixos ── */}
      <Section icon={<RefreshCw className="w-3.5 h-3.5" />} title="Análise de Custos Fixos" delay={0.3} defaultOpen={false}
        badge={fixoPct > 0 ? `${fixoPct}%` : undefined}
        badgeColor={fixoPct > 60 ? "bg-destructive/15 text-destructive" : fixoPct > 40 ? "bg-warning/15 text-warning" : "bg-primary/15 text-primary"}
      >
        <div className="space-y-3">
          {/* Ratio visualization */}
          <div className="space-y-1.5">
            <div className="h-3 rounded-full bg-border/10 overflow-hidden flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(fixoPct, 100)}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-chart-2 rounded-l-full"
              />
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>Fixos: {fmt(recDespesas)}</span>
              <span>Receita fixa: {fmt(recReceitas)}</span>
            </div>
          </div>

          {/* Margin analysis */}
          {recReceitas > 0 && (
            <div className="rounded-[12px] bg-secondary/15 border border-border/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Margem fixa</span>
                <span className={`text-[13px] font-bold tabular-nums ${recReceitas - recDespesas >= 0 ? "text-primary" : "text-destructive"}`}>
                  {fmt(recReceitas - recDespesas)}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {recReceitas > recDespesas
                  ? `Suas receitas fixas cobrem os custos fixos com folga de ${fmt(recReceitas - recDespesas)}.`
                  : `Suas receitas fixas não cobrem os custos fixos — déficit de ${fmt(recDespesas - recReceitas)}.`}
              </p>
            </div>
          )}

          <AnalysisPill
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            text={fixoPct > 60
              ? `Custos fixos em ${fixoPct}% — muito alto. Renegociar contratos ou cancelar assinaturas pode liberar margem.`
              : fixoPct > 40
                ? `Custos fixos em ${fixoPct}% — aceitável, mas pouco espaço para imprevistos.`
                : `Custos fixos controlados em ${fixoPct}%. Boa estrutura financeira.`}
            variant={fixoPct > 60 ? "danger" : fixoPct > 40 ? "warning" : "success"}
          />
        </div>
      </Section>

      {/* ── Análise de Categorias ── */}
      <Section icon={<BarChart3 className="w-3.5 h-3.5" />} title="Análise de Categorias" delay={0.34}
        badge={catDiagnostics.length > 0 ? `${catDiagnostics.length} alerta${catDiagnostics.length > 1 ? "s" : ""}` : undefined}
        badgeColor="bg-warning/15 text-warning"
        defaultOpen={false}
      >
        <div className="space-y-3">
          {/* Diagnostics first */}
          {catDiagnostics.length > 0 && (
            <div className="space-y-1.5">
              {catDiagnostics.map((diag, i) => (
                <AnalysisPill
                  key={i}
                  icon={<AlertTriangle className="w-3 h-3" />}
                  text={diag}
                  variant="warning"
                />
              ))}
            </div>
          )}

          {/* Top categories */}
          {topCats.map((cat) => (
            <CategoryAnalysis
              key={cat.name}
              name={cat.name}
              amount={cat.amount}
              pctVal={pct(cat.amount, despesas)}
              prevAmount={cat.prev}
              totalDespesas={despesas}
              color={cat.color}
            />
          ))}

          {topCats.length === 0 && (
            <p className="text-[11px] text-muted-foreground text-center py-2">Sem dados de categorias</p>
          )}

          <button
            onClick={() => navigate("/analytics/categorias")}
            className="w-full flex items-center justify-between rounded-[12px] bg-secondary/10 border border-border/5 px-3 py-2.5 hover:bg-secondary/20 active:scale-[0.98] transition-all"
          >
            <span className="text-[11px] font-semibold text-primary">Explorar categorias</span>
            <ChevronRight className="w-3.5 h-3.5 text-primary" />
          </button>
        </div>
      </Section>

      {/* ── Evolução Mensal ── */}
      {prevData && (
        <Section icon={<TrendingUp className="w-3.5 h-3.5" />} title="Evolução Mensal" delay={0.38} defaultOpen={false}
          badge={expenseChange !== 0 ? `${expenseChange > 0 ? "+" : ""}${expenseChange}%` : undefined}
          badgeColor={expenseChange > 0 ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}
        >
          <div className="space-y-3">
            {/* Comparison grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-[12px] bg-secondary/15 border border-border/5 p-3">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Receitas</p>
                <p className="text-[14px] font-bold text-primary tabular-nums mt-1">{fmt(receitas)}</p>
                {revenueChange !== 0 && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {revenueChange > 0 ? <ArrowUpRight className="w-3 h-3 text-primary" /> : <ArrowDownRight className="w-3 h-3 text-destructive" />}
                    <span className={`text-[9px] font-semibold ${revenueChange > 0 ? "text-primary" : "text-destructive"}`}>{Math.abs(revenueChange)}%</span>
                  </div>
                )}
              </div>
              <div className="rounded-[12px] bg-secondary/15 border border-border/5 p-3">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Despesas</p>
                <p className="text-[14px] font-bold text-destructive tabular-nums mt-1">{fmt(despesas)}</p>
                {expenseChange !== 0 && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {expenseChange > 0 ? <ArrowUpRight className="w-3 h-3 text-destructive" /> : <ArrowDownRight className="w-3 h-3 text-primary" />}
                    <span className={`text-[9px] font-semibold ${expenseChange > 0 ? "text-destructive" : "text-primary"}`}>{Math.abs(expenseChange)}%</span>
                  </div>
                )}
              </div>
            </div>

            <AnalysisPill
              icon={<TrendingUp className="w-3.5 h-3.5" />}
              text={expenseChange > 10
                ? `Gastos subiram ${expenseChange}% — se mantiver esse ritmo, o orçamento vai apertar nos próximos meses.`
                : expenseChange < -5
                  ? `Gastos caíram ${Math.abs(expenseChange)}% — ótimo controle! Continue assim.`
                  : "Gastos estáveis em relação ao mês anterior — sem grandes variações."}
              variant={expenseChange > 10 ? "danger" : expenseChange < -5 ? "success" : "neutral"}
            />
          </div>
        </Section>
      )}
    </div>
  );
}
