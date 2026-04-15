import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, AlertTriangle, TrendingUp, TrendingDown, Zap,
  ShieldCheck, ChevronRight, ChevronDown, ChevronUp, Bot, BarChart3,
  Settings2, List, Sparkles, CreditCard, RefreshCw, Wallet, Receipt,
  PiggyBank, Scissors, Package, DollarSign, Activity, Target,
} from "lucide-react";
import { useRadarFinanceiro } from "@/hooks/useRadarFinanceiro";
import { calculateHealthScore, type HealthScoreV2 } from "@/services/healthScoreService";
import { generateHubyScoreMessage } from "@/services/hubyMessageService";
import { generateRadarInsights, type RadarInsight } from "@/services/radarService";
import { generateHubyActions, type HubyAction } from "@/services/hubyActionsService";
import { generateHubyMessage } from "@/services/hubyMessageService";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

// ─── Expandable section wrapper ─────────────────────────────────────

function Section({
  title,
  emoji,
  children,
  defaultOpen = true,
  delay = 0,
  badge,
  badgeColor,
}: {
  title: string;
  emoji?: string;
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
      style={{ boxShadow: "0 2px 12px -4px rgba(0,0,0,0.15)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-card/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          {emoji && <span className="text-sm">{emoji}</span>}
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

// ─── Stat cell (compact) ────────────────────────────────────────────

function StatCell({
  icon,
  label,
  value,
  color = "text-foreground",
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-[14px] bg-secondary/30 border border-border/5 px-3 py-2.5">
      <div className="text-primary/70 flex-shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <p className={`text-[13px] font-bold tabular-nums ${color}`}>{value}</p>
        {sub && <p className="text-[8px] text-muted-foreground/60 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Insight card (compact) ─────────────────────────────────────────

function InsightCard({ insight, navigate }: { insight: RadarInsight; navigate: (p: string) => void }) {
  const colorMap = {
    alerta: { bg: "bg-destructive/10", text: "text-destructive", icon: <AlertTriangle className="w-4 h-4" /> },
    atencao: { bg: "bg-warning/10", text: "text-warning", icon: <Zap className="w-4 h-4" /> },
    oportunidade: { bg: "bg-primary/10", text: "text-primary", icon: <Sparkles className="w-4 h-4" /> },
  };
  const c = colorMap[insight.tipo];
  const path = insight.acao.tipo === "ver_categoria" ? "/analytics/categorias" : insight.acao.referencia === "parcelamentos" ? "/parcelamentos" : "/transacoes";

  return (
    <div className="flex items-start gap-3 rounded-[14px] bg-secondary/20 border border-border/5 p-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg}`}>
        <span className={c.text}>{c.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[12px] font-bold text-foreground truncate">{insight.titulo}</h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{insight.descricao}</p>
        <div className="flex items-center justify-between mt-2">
          <span className={`text-[12px] font-bold tabular-nums ${c.text}`}>{fmt(insight.impacto_valor)}</span>
          <button onClick={() => navigate(path)} className={`text-[10px] font-semibold ${c.text} flex items-center gap-0.5`}>
            Ver <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Category bar ───────────────────────────────────────────────────

function CategoryBar({
  name,
  icon,
  color,
  amount,
  pctVal,
  prevAmount,
  isDominant,
}: {
  name: string;
  icon: string;
  color: string;
  amount: number;
  pctVal: number;
  prevAmount?: number;
  isDominant?: boolean;
}) {
  const change = prevAmount != null && prevAmount > 0 ? Math.round(((amount - prevAmount) / prevAmount) * 100) : null;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]">{icon}</span>
          <span className="text-[11px] font-semibold text-foreground">{name}</span>
          {isDominant && (
            <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-warning/15 text-warning">TOP</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-foreground tabular-nums">{fmt(amount)}</span>
          <span className="text-[9px] text-muted-foreground tabular-nums">{pctVal}%</span>
          {change !== null && change !== 0 && (
            <span className={`text-[9px] font-semibold flex items-center gap-0.5 ${change > 0 ? "text-destructive" : "text-primary"}`}>
              {change > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {change > 0 ? "+" : ""}{change}%
            </span>
          )}
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
    </div>
  );
}

// ─── Comparison row ─────────────────────────────────────────────────

function CompareRow({ label, current, prev, invertColor }: { label: string; current: number; prev: number; invertColor?: boolean }) {
  const change = prev > 0 ? Math.round(((current - prev) / prev) * 100) : 0;
  const up = current > prev;
  const isGood = invertColor ? !up : up;
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-muted-foreground/50 line-through tabular-nums">{fmt(prev)}</span>
        <span className="text-[12px] font-bold text-foreground tabular-nums">{fmt(current)}</span>
        {change !== 0 && (
          <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${isGood ? "text-destructive" : "text-primary"}`}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {up ? "+" : ""}{change}%
          </span>
        )}
      </div>
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
  const saldoAtual = data?.saldoAtual ?? 0;
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
    return cats.map((c, i) => ({ ...c, prev: prevMap[c.name], isDominant: i === 0 }));
  }, [data, prevData]);

  // Category alerts
  const catAlerts = useMemo(() => {
    const alerts: string[] = [];
    if (topCats.length > 0) {
      const top = topCats[0];
      const topPct = pct(top.amount, despesas);
      if (topPct > 30) alerts.push(`${top.name} domina ${topPct}% dos gastos`);
    }
    const growing = topCats.filter(c => c.prev && c.prev > 0 && c.amount > c.prev * 1.2);
    if (growing.length > 0) alerts.push(`${growing.length} categoria${growing.length > 1 ? 's' : ''} em crescimento`);
    return alerts;
  }, [topCats, despesas]);

  // Installment count
  const installmentCount = useMemo(
    () =>
      (data?.transactions ?? [])
        .filter((t) => t.type === "despesa" && (t as any).recurrence_type === "parcelado").length,
    [data]
  );

  // Expense change vs prev
  const expenseChange = prevDespesas > 0 ? Math.round(((despesas - prevDespesas) / prevDespesas) * 100) : 0;

  // Status config
  const statusConfig = {
    verde: { bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.2)", text: "text-primary", ringColor: "hsl(var(--primary))", emoji: "🟢", label: "Sob controle" },
    amarelo: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", text: "text-warning", ringColor: "hsl(var(--warning))", emoji: "🟡", label: "Atenção" },
    vermelho: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", text: "text-destructive", ringColor: "hsl(var(--destructive))", emoji: "🔴", label: "Crítico" },
  };
  const sc = statusConfig[status.level];

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

      {/* ── 1. Header + Status ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
        <h1 className="font-display text-[22px] font-bold text-foreground tracking-tight">Radar Financeiro</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">Visão 360° da sua vida financeira</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="rounded-[20px] p-4 relative overflow-hidden"
        style={{ background: sc.bg, border: `1px solid ${sc.border}` }}
      >
        <div className="flex items-center gap-4 relative z-[1]">
          <div className="relative flex-shrink-0">
            <ProgressRing value={health.score} size={56} stroke={5} color={sc.ringColor} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-[14px] font-black tabular-nums ${sc.text}`}>{health.score}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm">{sc.emoji}</span>
              <h2 className={`text-[14px] font-bold ${sc.text}`}>{sc.label}</h2>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {comprometimentoPct < 60
                ? "Seu financeiro está equilibrado este mês."
                : comprometimentoPct <= 80
                  ? "Pontos de atenção detectados — ajustes podem ajudar."
                  : "Situação crítica — ação necessária para equilibrar."}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── 2. Huby (destaque) ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[18px] p-4 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f2318 0%, #0a1a0f 60%, hsl(var(--card)) 100%)",
          border: "1px solid rgba(74, 222, 128, 0.2)",
        }}
      >
        <div className="flex items-start gap-3 relative z-[1]">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)), #16a34a)", boxShadow: "0 0 12px rgba(74,222,128,0.25)" }}
          >
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-[11px] font-bold text-primary mb-0.5">Huby diz</h5>
            <p className="text-[12px] text-muted-foreground leading-relaxed italic whitespace-pre-line">{hubyMsg.main}</p>
            {hubyMsg.secondary && (
              <p className="text-[10px] text-muted-foreground/60 mt-1 italic">💬 {hubyMsg.secondary}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── 3. Snapshot (6 indicadores) ── */}
      <Section title="Visão Rápida" emoji="📊" delay={0.14}>
        <div className="grid grid-cols-2 gap-2">
          <StatCell icon={<DollarSign className="w-4 h-4" />} label="Receita" value={fmt(receitas)} color="text-primary" />
          <StatCell icon={<TrendingDown className="w-4 h-4" />} label="Despesas" value={fmt(despesas)} color="text-destructive" sub={expenseChange !== 0 ? `${expenseChange > 0 ? "+" : ""}${expenseChange}% vs anterior` : undefined} />
          <StatCell icon={<Wallet className="w-4 h-4" />} label="Saldo atual" value={fmt(saldoAtual)} color={saldoAtual >= 0 ? "text-primary" : "text-destructive"} />
          <StatCell icon={<CreditCard className="w-4 h-4" />} label="Total cartão" value={fmt(cardTotal)} sub={cardTotal > 0 ? `${cardPct}% dos gastos` : undefined} />
          <StatCell icon={<RefreshCw className="w-4 h-4" />} label="Custos fixos" value={fmt(recDespesas)} sub={fixoPct > 0 ? `${fixoPct}% da renda` : undefined} />
          <StatCell icon={<Package className="w-4 h-4" />} label="Parcelamentos" value={fmt(totalParcelado)} sub={installmentCount > 0 ? `${installmentCount} ativo${installmentCount > 1 ? "s" : ""}` : undefined} />
        </div>
      </Section>

      {/* ── 4. Comprometimento da Renda ── */}
      <Section title="Comprometimento da Renda" emoji="📉" delay={0.18}
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
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Receita</span>
                <span className="font-bold text-primary tabular-nums">{fmt(receitas)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Despesas</span>
                <span className="font-bold text-destructive tabular-nums">{fmt(despesas)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">Livre</span>
                <span className={`font-bold tabular-nums ${balanco >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(Math.max(receitas - despesas, 0))}</span>
              </div>
            </div>
          </div>
          <div className="h-2.5 rounded-full bg-border/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(comprometimentoPct, 100)}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full rounded-full ${comprometimentoBg}`}
            />
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            💡 {comprometimentoPct < 60
              ? "Boa! Você ainda tem margem confortável."
              : comprometimentoPct <= 80
                ? `Você já comprometeu ${comprometimentoPct}% da sua renda — atenção aos próximos gastos.`
                : `Você já comprometeu ${comprometimentoPct}% da sua renda — o orçamento está muito apertado.`}
          </p>
        </div>
      </Section>

      {/* ── 5. Cartão de Crédito ── */}
      {cardTotal > 0 && (
        <Section title="Análise de Cartão" emoji="💳" delay={0.22}
          badge={`${cardPct}% dos gastos`}
          badgeColor={cardPct > 50 ? "bg-warning/15 text-warning" : "bg-muted/20 text-muted-foreground"}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-[12px] bg-secondary/20 border border-border/5 p-2.5">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Total no cartão</p>
                <p className="text-[14px] font-bold text-foreground tabular-nums mt-0.5">{fmt(cardTotal)}</p>
              </div>
              <div className="rounded-[12px] bg-secondary/20 border border-border/5 p-2.5">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">% dos gastos</p>
                <p className={`text-[14px] font-bold tabular-nums mt-0.5 ${cardPct > 50 ? "text-warning" : "text-foreground"}`}>{cardPct}%</p>
              </div>
            </div>
            {totalParcelado > 0 && (
              <div className="rounded-[12px] bg-warning/5 border border-warning/10 p-2.5">
                <p className="text-[10px] text-warning font-semibold">⚠️ Parcelas no cartão: {fmt(totalParcelado)}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">Comprometendo {pct(totalParcelado, receitas)}% da renda</p>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              💡 {cardPct > 50
                ? `Seu cartão representa ${cardPct}% dos seus gastos — cuidado com o acúmulo.`
                : `Cartão representa ${cardPct}% dos gastos — sob controle.`}
            </p>
            <button
              onClick={() => navigate("/gestao")}
              className="text-[11px] font-semibold text-primary flex items-center gap-0.5 hover:underline"
            >
              Ver faturas <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </Section>
      )}

      {/* ── 6. Parcelamentos (Impacto Futuro) ── */}
      {totalParcelado > 0 && (
        <Section title="Parcelamentos" emoji="📦" delay={0.26}
          badge={`${installmentCount} ativo${installmentCount > 1 ? "s" : ""}`}
          badgeColor="bg-warning/15 text-warning"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-[12px] bg-secondary/20 border border-border/5 p-2.5">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Mensal comprometido</p>
                <p className="text-[14px] font-bold text-warning tabular-nums mt-0.5">{fmt(totalParcelado)}</p>
              </div>
              <div className="rounded-[12px] bg-secondary/20 border border-border/5 p-2.5">
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">% da renda</p>
                <p className={`text-[14px] font-bold tabular-nums mt-0.5 ${pct(totalParcelado, receitas) > 30 ? "text-destructive" : "text-warning"}`}>
                  {pct(totalParcelado, receitas)}%
                </p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              ⚠️ Você tem <span className="font-semibold text-warning">{fmt(totalParcelado)}</span> comprometidos em parcelas este mês.
            </p>
            <button
              onClick={() => navigate("/parcelamentos")}
              className="text-[11px] font-semibold text-primary flex items-center gap-0.5 hover:underline"
            >
              Ver parcelamentos <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </Section>
      )}

      {/* ── 7. Receitas e Despesas Fixas ── */}
      <Section title="Receitas e Despesas Fixas" emoji="🔁" delay={0.3} defaultOpen={false}
        badge={fixoPct > 0 ? `${fixoPct}% da renda` : undefined}
        badgeColor={fixoPct > 60 ? "bg-destructive/15 text-destructive" : fixoPct > 40 ? "bg-warning/15 text-warning" : "bg-muted/20 text-muted-foreground"}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-[12px] bg-primary/5 border border-primary/10 p-2.5">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Receitas fixas</p>
              <p className="text-[14px] font-bold text-primary tabular-nums mt-0.5">{fmt(recReceitas)}</p>
            </div>
            <div className="rounded-[12px] bg-destructive/5 border border-destructive/10 p-2.5">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Despesas fixas</p>
              <p className="text-[14px] font-bold text-destructive tabular-nums mt-0.5">{fmt(recDespesas)}</p>
            </div>
          </div>
          {receitas > 0 && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              💡 {fixoPct > 60
                ? `Seus custos fixos consomem ${fixoPct}% da renda — é bastante.`
                : fixoPct > 40
                  ? `Custos fixos em ${fixoPct}% da renda — dentro do aceitável.`
                  : `Custos fixos controlados em ${fixoPct}% da renda.`}
            </p>
          )}
        </div>
      </Section>

      {/* ── 8. Gastos por Categoria (Core do Radar) ── */}
      <Section title="Gastos por Categoria" emoji="📊" delay={0.34}
        badge={catAlerts.length > 0 ? `${catAlerts.length} alerta${catAlerts.length > 1 ? "s" : ""}` : undefined}
        badgeColor="bg-warning/15 text-warning"
      >
        <div className="space-y-3">
          {catAlerts.length > 0 && (
            <div className="space-y-1">
              {catAlerts.map((alert, i) => (
                <div key={i} className="flex items-center gap-2 rounded-[10px] bg-warning/5 border border-warning/10 px-2.5 py-1.5">
                  <AlertTriangle className="w-3 h-3 text-warning flex-shrink-0" />
                  <span className="text-[10px] text-warning font-medium">{alert}</span>
                </div>
              ))}
            </div>
          )}
          {topCats.map((cat) => (
            <CategoryBar
              key={cat.name}
              name={cat.name}
              icon={cat.icon}
              color={cat.color}
              amount={cat.amount}
              pctVal={pct(cat.amount, despesas)}
              prevAmount={cat.prev}
              isDominant={cat.isDominant}
            />
          ))}
          {topCats.length === 0 && <p className="text-[11px] text-muted-foreground text-center py-2">Sem dados de categorias</p>}
          <button
            onClick={() => navigate("/analytics/categorias")}
            className="text-[11px] font-semibold text-primary flex items-center gap-0.5 hover:underline"
          >
            Ver todas <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </Section>

      {/* ── 9. Comparação Mensal ── */}
      {prevData && (
        <Section title="Comparação Mensal" emoji="📈" delay={0.38} defaultOpen={false}
          badge={expenseChange !== 0 ? `${expenseChange > 0 ? "+" : ""}${expenseChange}% gastos` : undefined}
          badgeColor={expenseChange > 0 ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}
        >
          <div className="space-y-1">
            <CompareRow label="Receitas" current={receitas} prev={prevReceitas} invertColor />
            <CompareRow label="Despesas" current={despesas} prev={prevDespesas} />
            <CompareRow label="Saldo" current={balanco} prev={prevData.balanco} invertColor />
          </div>
          {expenseChange !== 0 && (
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-2">
              💡 {expenseChange > 0
                ? `Seus gastos aumentaram ${expenseChange}% em relação ao mês anterior.`
                : `Seus gastos diminuíram ${Math.abs(expenseChange)}% — bom trabalho!`}
            </p>
          )}
        </Section>
      )}

      {/* ── 10. Insights Inteligentes ── */}
      {insights.length > 0 && (
        <Section title="Insights Inteligentes" emoji="🧠" delay={0.42}
          badge={`${insights.length} detectado${insights.length > 1 ? "s" : ""}`}
          badgeColor={insights.some(i => i.tipo === "alerta") ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}
        >
          <div className="space-y-2">
            {insights.slice(0, 3).map((insight) => (
              <InsightCard key={insight.id} insight={insight} navigate={navigate} />
            ))}
          </div>
        </Section>
      )}

      {/* ── 11. Ações Recomendadas ── */}
      {hubyActions.length > 0 && (
        <Section title="Ações Recomendadas" emoji="🎯" delay={0.46}>
          <div className="space-y-2">
            {hubyActions.map((action, i) => {
              const colorMap = {
                economia: { bg: "bg-destructive/10", text: "text-destructive", icon: <Scissors className="w-4 h-4" /> },
                ajuste: { bg: "bg-warning/10", text: "text-warning", icon: <Zap className="w-4 h-4" /> },
                oportunidade: { bg: "bg-primary/10", text: "text-primary", icon: <PiggyBank className="w-4 h-4" /> },
              };
              const c = colorMap[action.tipo];
              return (
                <div key={`${action.titulo}-${i}`} className="flex items-start gap-3 rounded-[14px] bg-secondary/20 border border-border/5 p-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                    <span className={c.text}>{c.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[12px] font-bold text-foreground">{action.titulo}</h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{action.descricao}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold ${c.text}`}>
                          💰 R${action.impacto_estimado.toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <button onClick={() => navigate(action.path)} className={`text-[10px] font-semibold ${c.text} flex items-center gap-0.5`}>
                        {action.acao} <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Ações rápidas ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <p className="text-[10px] font-semibold tracking-[1px] text-muted-foreground/70 uppercase mb-2">Ações rápidas</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <BarChart3 className="w-4 h-4" />, label: "Categorias", path: "/analytics/categorias" },
            { icon: <Settings2 className="w-4 h-4" />, label: "Limites", path: "/categorias" },
            { icon: <List className="w-4 h-4" />, label: "Transações", path: "/transacoes" },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className="rounded-[14px] p-3 flex flex-col items-center gap-1.5 border border-border/10 bg-card/40 backdrop-blur-xl hover:bg-card/60 active:scale-[0.97] transition-all"
            >
              <div className="text-primary">{a.icon}</div>
              <span className="text-[10px] font-semibold text-muted-foreground">{a.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
