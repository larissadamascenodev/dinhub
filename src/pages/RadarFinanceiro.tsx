import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, AlertTriangle, TrendingUp, TrendingDown, Zap,
  ShieldCheck, ChevronRight, ChevronDown, ChevronUp, Bot, BarChart3,
  Settings2, List, Sparkles, CreditCard, RefreshCw, Wallet, Receipt,
  PiggyBank, Scissors, Package,
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
}: {
  title: string;
  emoji?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  delay?: number;
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
        <span className="text-[13px] font-bold text-foreground flex items-center gap-2">
          {emoji && <span className="text-sm">{emoji}</span>}
          {title}
        </span>
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

// ─── Stat cell ──────────────────────────────────────────────────────

function StatCell({
  icon,
  label,
  value,
  color = "text-foreground",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-[14px] bg-secondary/30 border border-border/5 px-3 py-2.5">
      <div className="text-primary/70 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <p className={`text-[13px] font-bold tabular-nums ${color}`}>{value}</p>
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
}: {
  name: string;
  icon: string;
  color: string;
  amount: number;
  pctVal: number;
  prevAmount?: number;
}) {
  const change = prevAmount != null && prevAmount > 0 ? Math.round(((amount - prevAmount) / prevAmount) * 100) : null;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]">{icon}</span>
          <span className="text-[11px] font-semibold text-foreground">{name}</span>
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

function CompareRow({ label, current, prev }: { label: string; current: number; prev: number }) {
  const change = prev > 0 ? Math.round(((current - prev) / prev) * 100) : 0;
  const up = current > prev;
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-muted-foreground/50 line-through tabular-nums">{fmt(prev)}</span>
        <span className="text-[12px] font-bold text-foreground tabular-nums">{fmt(current)}</span>
        {change !== 0 && (
          <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${up ? "text-destructive" : "text-primary"}`}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {up ? "+" : ""}{change}%
          </span>
        )}
      </div>
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
    comprometimentoPct <= 50 ? "text-primary" : comprometimentoPct <= 80 ? "text-warning" : "text-destructive";
  const comprometimentoBg =
    comprometimentoPct <= 50 ? "bg-primary" : comprometimentoPct <= 80 ? "bg-warning" : "bg-destructive";

  // Top 5 categories with prev comparison
  const topCats = useMemo(() => {
    const cats = (data?.categories ?? []).slice(0, 5);
    const prevMap: Record<string, number> = {};
    (prevData?.categories ?? []).forEach((c) => { prevMap[c.name] = c.amount; });
    return cats.map((c) => ({ ...c, prev: prevMap[c.name] }));
  }, [data, prevData]);

  // Status config
  const statusConfig = {
    verde: { bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.2)", text: "text-primary", emoji: "🟢", label: "Sob controle" },
    amarelo: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", text: "text-warning", emoji: "🟡", label: "Atenção" },
    vermelho: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", text: "text-destructive", emoji: "🔴", label: "Crítico" },
  };
  const sc = statusConfig[status.level];

  // Summary text
  const summaryText = useMemo(() => {
    if (!data) return "";
    const parts: string[] = [];
    if (comprometimentoPct > 80) parts.push("renda muito comprometida");
    else if (comprometimentoPct > 50) parts.push("renda parcialmente comprometida");
    if (totalParcelado > 0) parts.push("parcelamentos ativos");
    const alertas = insights.filter((i) => i.tipo === "alerta").length;
    if (alertas > 0) parts.push(`${alertas} alerta${alertas > 1 ? "s" : ""}`);
    if (parts.length === 0) return "Seu financeiro está estável este mês.";
    return `Seu financeiro está ${status.level === "verde" ? "estável" : "em atenção"}, com ${parts.join(", ")}.`;
  }, [data, insights, comprometimentoPct, totalParcelado, status.level]);

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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="rounded-[20px] p-4 relative overflow-hidden"
        style={{ background: sc.bg, border: `1px solid ${sc.border}` }}
      >
        <div className="flex items-center gap-3 relative z-[1]">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: sc.bg }}>
            <ShieldCheck className={`w-5 h-5 ${sc.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm">{sc.emoji}</span>
              <h2 className={`text-[14px] font-bold ${sc.text}`}>{sc.label}</h2>
              <span className={`text-[11px] font-bold ${sc.text} tabular-nums`}>({health.score}pts)</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{summaryText}</p>
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
          <div>
            <h5 className="text-[11px] font-bold text-primary mb-0.5">Huby diz</h5>
            <p className="text-[12px] text-muted-foreground leading-relaxed italic whitespace-pre-line">{hubyMsg.main}</p>
            {hubyMsg.secondary && (
              <p className="text-[10px] text-muted-foreground/60 mt-1 italic">💬 {hubyMsg.secondary}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── 3. Visão geral (grid) ── */}
      <Section title="Visão Geral" emoji="📊" delay={0.14}>
        <div className="grid grid-cols-2 gap-2">
          <StatCell icon={<TrendingUp className="w-4 h-4" />} label="Receita" value={fmt(receitas)} color="text-primary" />
          <StatCell icon={<TrendingDown className="w-4 h-4" />} label="Despesa" value={fmt(despesas)} color="text-destructive" />
          <StatCell icon={<Wallet className="w-4 h-4" />} label="Saldo do mês" value={fmt(balanco)} color={balanco >= 0 ? "text-primary" : "text-destructive"} />
          <StatCell icon={<CreditCard className="w-4 h-4" />} label="Cartão" value={fmt(cardTotal)} />
          <StatCell icon={<RefreshCw className="w-4 h-4" />} label="Recorrentes" value={fmt(recDespesas)} />
          <StatCell icon={<Package className="w-4 h-4" />} label="Parcelamentos" value={fmt(totalParcelado)} />
        </div>
      </Section>

      {/* ── 4. Comprometimento ── */}
      <Section title="Comprometimento da Renda" emoji="📉" delay={0.18}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Renda comprometida</span>
            <span className={`text-[16px] font-bold tabular-nums ${comprometimentoColor}`}>{comprometimentoPct}%</span>
          </div>
          <div className="h-3 rounded-full bg-border/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(comprometimentoPct, 100)}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full rounded-full ${comprometimentoBg}`}
            />
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground/50">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </Section>

      {/* ── 5. Cartão de crédito ── */}
      {cardTotal > 0 && (
        <Section title="Cartão de Crédito" emoji="💳" delay={0.22}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Total no cartão este mês</span>
              <span className="text-[14px] font-bold text-foreground tabular-nums">{fmt(cardTotal)}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              💡 O cartão representa <span className="font-semibold text-warning">{cardPct}%</span> dos seus gastos esse mês
            </p>
            <button
              onClick={() => navigate("/fatura")}
              className="text-[11px] font-semibold text-primary flex items-center gap-0.5 hover:underline"
            >
              Ver faturas <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </Section>
      )}

      {/* ── 6. Recorrentes ── */}
      <Section title="Receitas e Despesas Fixas" emoji="🔁" delay={0.26} defaultOpen={false}>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1">
            <span className="text-[11px] text-muted-foreground">Receitas recorrentes</span>
            <span className="text-[12px] font-bold text-primary tabular-nums">{fmt(recReceitas)}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-[11px] text-muted-foreground">Despesas recorrentes</span>
            <span className="text-[12px] font-bold text-destructive tabular-nums">{fmt(recDespesas)}</span>
          </div>
          {receitas > 0 && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              💡 Seus custos fixos consomem <span className="font-semibold text-warning">{fixoPct}%</span> da sua renda
            </p>
          )}
        </div>
      </Section>

      {/* ── 7. Gastos por categoria ── */}
      <Section title="Gastos por Categoria" emoji="📊" delay={0.3}>
        <div className="space-y-3">
          {topCats.map((cat) => (
            <CategoryBar
              key={cat.name}
              name={cat.name}
              icon={cat.icon}
              color={cat.color}
              amount={cat.amount}
              pctVal={pct(cat.amount, despesas)}
              prevAmount={cat.prev}
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

      {/* ── 8. Insights inteligentes ── */}
      {insights.length > 0 && (
        <Section title="Análise Inteligente" emoji="🧠" delay={0.34}>
          <div className="space-y-2">
            {insights.slice(0, 3).map((insight) => (
              <InsightCard key={insight.id} insight={insight} navigate={navigate} />
            ))}
            {insights.length > 3 && (
              <p className="text-[10px] text-muted-foreground text-center">+{insights.length - 3} insights</p>
            )}
          </div>
        </Section>
      )}

      {/* ── 9. Parcelamentos (impacto futuro) ── */}
      {totalParcelado > 0 && (
        <Section title="Impacto dos Parcelamentos" emoji="📦" delay={0.38} defaultOpen={false}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Valor mensal comprometido</span>
              <span className="text-[14px] font-bold text-warning tabular-nums">{fmt(totalParcelado)}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              ⚠️ Você tem <span className="font-semibold text-warning">{fmt(totalParcelado)}</span> em parcelas comprometidas este mês
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

      {/* ── 10. Comparação mensal ── */}
      {prevData && (
        <Section title="Comparação Mensal" emoji="📈" delay={0.42} defaultOpen={false}>
          <div className="space-y-1">
            <CompareRow label="Receitas" current={receitas} prev={prevReceitas} />
            <CompareRow label="Despesas" current={despesas} prev={prevDespesas} />
            <CompareRow label="Saldo" current={balanco} prev={prevData.balanco} />
          </div>
        </Section>
      )}

      {/* ── 11. Bloco de ações (Huby) ── */}
      {hubyActions.length > 0 && (
        <Section title="Sugestões de Ação" emoji="🎯" delay={0.46}>
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
                      <span className={`text-[11px] font-bold ${c.text}`}>
                        Economia: R${action.impacto_estimado.toLocaleString("pt-BR")}
                      </span>
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
