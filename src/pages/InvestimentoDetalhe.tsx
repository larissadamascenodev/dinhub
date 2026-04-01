import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { ArrowLeft, Briefcase, ArrowDownLeft, ArrowUpRight, TrendingUp, X, Trash2, Info, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

/* ═══════ Types ═══════ */
interface Account {
  id: string;
  name: string;
  type: string;
  is_default: boolean;
  current_balance: number;
  initial_balance: number;
  color: string | null;
  investment_type: string | null;
  annual_rate: number | null;
  rate_type: string | null;
  created_at: string;
}

interface Transaction {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  type: string;
  status: string;
  account_id: string | null;
  to_account_id: string | null;
}

/* ═══════ Constants ═══════ */
const CDI_ANNUAL_DEFAULT = 13.65; // % a.a. — editável
const IPCA_ANNUAL_DEFAULT = 4.5; // % a.a. — referência
const POUPANCA_MONTHLY = 0.5;

const INVESTMENT_TYPE_LABELS: Record<string, string> = {
  cdb: "CDB", lci: "LCI", lca: "LCA", tesouro_selic: "Tesouro Selic",
  poupanca: "Poupança", fundo: "Fundo de Investimento", caixinha: "Caixinha", outro: "Outro",
};

const RATE_TYPE_LABELS: Record<string, string> = {
  percent_cdi: "% do CDI", fixed_annual: "% a.a.", fixed_monthly: "% a.m.",
  ipca_plus: "IPCA +", cdi_plus: "CDI +", custom: "Personalizado",
};

const SIMULATION_PERIODS = [
  { label: "6m", months: 6 },
  { label: "1a", months: 12 },
  { label: "3a", months: 36 },
  { label: "5a", months: 60 },
];

const RECURRING_MESSAGES = [
  "Se você fizer isso todo mês… olha onde você chega 👀",
  "Isso aqui vira uma bola de neve… do bem 😏",
  "Disciplina > sorte. Sempre. 💪",
  "Pequenos aportes, grandes resultados 🚀",
];

const MICRO_MESSAGES = [
  "Dinheiro trabalhando por você… finalmente 😎",
  "Isso aqui no longo prazo vira jogo 👀",
  "Parece pouco agora… mas espera 👀",
  "Juros compostos: a 8ª maravilha do mundo 🌍",
  "Seu futuro eu agradece 🙌",
  "Cada dia conta quando é composto 📈",
];

/* ═══════ Helpers ═══════ */
function getAnnualRate(rateType: string | null, annualRate: number | null, investmentType: string | null): number {
  if (investmentType === "poupanca") return (1 + POUPANCA_MONTHLY / 100) ** 12 * 100 - 100;
  if (!rateType || annualRate == null) return CDI_ANNUAL_DEFAULT;

  switch (rateType) {
    case "percent_cdi":
      return (annualRate / 100) * CDI_ANNUAL_DEFAULT;
    case "fixed_annual":
      return annualRate;
    case "fixed_monthly":
      return ((1 + annualRate / 100) ** 12 - 1) * 100;
    case "ipca_plus":
      return IPCA_ANNUAL_DEFAULT + annualRate;
    case "cdi_plus":
      return CDI_ANNUAL_DEFAULT + annualRate;
    case "custom":
      return annualRate; // user provides annual directly
    default:
      return CDI_ANNUAL_DEFAULT;
  }
}

function simulateInvestment(principal: number, annualRatePct: number, months: number) {
  const monthlyRate = (1 + annualRatePct / 100) ** (1 / 12) - 1;
  const data: { month: number; label: string; value: number }[] = [];
  let current = principal;
  data.push({ month: 0, label: "Hoje", value: current });
  for (let i = 1; i <= months; i++) {
    current *= (1 + monthlyRate);
    const label = i <= 12 ? `${i}m` : `${(i / 12).toFixed(0)}a${i % 12 > 0 ? `${i % 12}m` : ""}`;
    data.push({ month: i, label, value: current });
  }
  return data;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPct(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
}

/* ═══════ Animated Counter ═══════ */
const AnimatedCurrency = ({ value, className }: { value: number; className?: string }) => {
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (v) => formatCurrency(v));
  const [text, setText] = useState(formatCurrency(0));

  useEffect(() => {
    spring.set(value);
    const unsub = display.on("change", (v) => setText(v));
    return unsub;
  }, [value]);

  return <span className={className}>{text}</span>;
};

/* ═══════ Accents ═══════ */
const ACCENT_MAP: Record<string, { iconBg: string; dot: string }> = {
  violet: { iconBg: "bg-violet-500/15", dot: "bg-violet-400" },
  emerald: { iconBg: "bg-emerald-500/15", dot: "bg-emerald-400" },
  sky: { iconBg: "bg-sky-500/15", dot: "bg-sky-400" },
  amber: { iconBg: "bg-amber-500/15", dot: "bg-amber-400" },
  rose: { iconBg: "bg-rose-500/15", dot: "bg-rose-400" },
  cyan: { iconBg: "bg-cyan-500/15", dot: "bg-cyan-400" },
  fuchsia: { iconBg: "bg-fuchsia-500/15", dot: "bg-fuchsia-400" },
  lime: { iconBg: "bg-lime-500/15", dot: "bg-lime-400" },
};

function getAccent(color: string | null) {
  return ACCENT_MAP[color ?? "violet"] ?? ACCENT_MAP.violet;
}

/* ═══════ Modal Overlay ═══════ */
const ModalOverlay = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) => (
  <AnimatePresence>
    {open && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ type: "spring", duration: 0.4 }} className="relative z-10 w-full max-w-md rounded-2xl bg-card border border-border/40 p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ═══════ Custom Tooltip ═══════ */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-card/95 border border-border/30 px-3 py-2 shadow-lg backdrop-blur-sm">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-primary">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

/* ═══════ Main Component ═══════ */
const InvestimentoDetalhe = () => {
  const navigate = useNavigate();
  const { accountId } = useParams<{ accountId: string }>();
  const { user } = useAuth();

  const [account, setAccount] = useState<Account | null>(null);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalMode, setModalMode] = useState<"deposit" | "withdraw" | null>(null);
  const [modalFromId, setModalFromId] = useState("");
  const [modalCents, setModalCents] = useState(0);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Simulation
  const [simPeriodIdx, setSimPeriodIdx] = useState(3); // default 1 year
  const [customMonths, setCustomMonths] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  // Micro-interaction
  const [microMsg] = useState(() => MICRO_MESSAGES[Math.floor(Math.random() * MICRO_MESSAGES.length)]);

  const fetchData = async () => {
    if (!user || !accountId) return;
    setLoading(true);
    try {
      const [{ data: accs }, { data: txs }] = await Promise.all([
        supabase.from("accounts").select("*").eq("user_id", user.id),
        supabase.from("transactions").select("*").or(`account_id.eq.${accountId},to_account_id.eq.${accountId}`).order("date", { ascending: false }),
      ]);

      const acc = (accs as any[])?.find((a: any) => a.id === accountId);
      if (!acc) {
        toast.error("Carteira não encontrada");
        navigate("/gestao");
        return;
      }
      setAccount(acc);
      setAllAccounts((accs as any[]) ?? []);
      const investTxs = (txs as any[] ?? []).filter(
        (t: any) => t.type === "investimento" && (t.account_id === accountId || t.to_account_id === accountId)
      );
      setTransactions(investTxs);
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user, accountId]);

  // Yields computation
  const yieldData = useMemo(() => {
    if (!account) return { annualRate: 0, dailyRate: 0, monthlyRate: 0, dailyYield: 0, monthlyYield: 0, yearlyYield: 0, totalDeposits: 0, totalWithdrawals: 0, estimatedProfit: 0 };

    const annualRate = getAnnualRate(account.rate_type, account.annual_rate, account.investment_type);
    const dailyRate = (1 + annualRate / 100) ** (1 / 365) - 1;
    const monthlyRate = (1 + annualRate / 100) ** (1 / 12) - 1;

    const balance = Number(account.current_balance);
    const dailyYield = balance * dailyRate;
    const monthlyYield = balance * monthlyRate;
    const yearlyYield = balance * (annualRate / 100);

    const totalDeposits = transactions.filter(t => t.to_account_id === accountId).reduce((s, t) => s + Number(t.amount), 0);
    const totalWithdrawals = transactions.filter(t => t.account_id === accountId).reduce((s, t) => s + Number(t.amount), 0);
    const totalInvested = Number(account.initial_balance) + totalDeposits - totalWithdrawals;
    const estimatedProfit = balance - totalInvested;

    return { annualRate, dailyRate: dailyRate * 100, monthlyRate: monthlyRate * 100, dailyYield, monthlyYield, yearlyYield, totalDeposits, totalWithdrawals, estimatedProfit };
  }, [account, transactions, accountId]);

  // Simulation data
  const simData = useMemo(() => {
    if (!account) return { chartData: [], finalValue: 0, totalYield: 0, avgMonthly: 0, months: 0 };
    const balance = Number(account.current_balance);
    const annualRate = yieldData.annualRate;
    const months = showCustom ? Math.min(Math.max(parseInt(customMonths) || 1, 1), 360) : SIMULATION_PERIODS[simPeriodIdx].months;
    const chartData = simulateInvestment(balance, annualRate, months);
    const finalValue = chartData[chartData.length - 1]?.value ?? balance;
    const totalYield = finalValue - balance;
    const avgMonthly = months > 0 ? totalYield / months : 0;
    return { chartData, finalValue, totalYield, avgMonthly, months };
  }, [account, yieldData.annualRate, simPeriodIdx, showCustom, customMonths]);

  const openModal = (mode: "deposit" | "withdraw") => {
    setModalMode(mode);
    setModalCents(0);
    const bankAccs = allAccounts.filter(a => a.type !== "investment");
    const def = bankAccs.find(a => a.is_default) || bankAccs[0];
    setModalFromId(def?.id || "");
  };

  const handleModalSubmit = async () => {
    if (!user || !account || !modalFromId || modalCents === 0) return;
    const realAmount = modalCents / 100;
    if (realAmount <= 0) { toast.error("Valor inválido"); return; }

    setModalSubmitting(true);
    try {
      if (modalMode === "deposit") {
        const fromAcc = allAccounts.find(a => a.id === modalFromId);
        if (fromAcc && realAmount > Number(fromAcc.current_balance)) {
          toast.error("Saldo insuficiente na conta de origem");
          setModalSubmitting(false);
          return;
        }
        const { error } = await supabase.from("transactions").insert({
          user_id: user.id, name: `Depósito: ${fromAcc?.name} → ${account.name}`,
          type: "investimento", amount: realAmount, category: "Investimentos",
          date: new Date().toISOString().split("T")[0], status: "pago",
          account_id: modalFromId, to_account_id: account.id,
          payment_method: "conta", recurrence_type: "unica",
        } as any);
        if (error) throw error;
        toast.success("Depósito realizado! 💰");
      } else {
        if (realAmount > Number(account.current_balance)) {
          toast.error("Saldo insuficiente na carteira");
          setModalSubmitting(false);
          return;
        }
        const toAcc = allAccounts.find(a => a.id === modalFromId);
        const { error } = await supabase.from("transactions").insert({
          user_id: user.id, name: `Resgate: ${account.name} → ${toAcc?.name}`,
          type: "investimento", amount: realAmount, category: "Investimentos",
          date: new Date().toISOString().split("T")[0], status: "pago",
          account_id: account.id, to_account_id: modalFromId,
          payment_method: "conta", recurrence_type: "unica",
        } as any);
        if (error) throw error;
        toast.success("Resgate realizado! 💸");
      }
      setModalMode(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Erro na operação");
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!accountId) return;
    if (!confirm("Tem certeza que deseja excluir esta carteira?")) return;
    try {
      await supabase.from("accounts").update({ is_active: false } as any).eq("id", accountId);
      toast.success("Carteira excluída!");
      navigate("/gestao");
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  if (loading) {
    return (
      <div className="pt-2 pb-8 space-y-4">
        <div className="h-40 rounded-2xl bg-card animate-pulse" />
        <div className="h-24 rounded-2xl bg-card animate-pulse" />
      </div>
    );
  }

  if (!account) return null;

  const accent = getAccent(account.color);
  const balance = Number(account.current_balance);
  const investLabel = INVESTMENT_TYPE_LABELS[account.investment_type ?? ""] ?? "Investimento";
  const rateLabel = account.rate_type && account.annual_rate != null
    ? `${account.annual_rate}${RATE_TYPE_LABELS[account.rate_type] ?? ""}`
    : null;

  return (
    <div className="pt-2 pb-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/gestao")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <button onClick={handleDelete} className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors">
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </button>
      </div>

      {/* Main Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-2xl overflow-hidden border border-border/10" style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", accent.iconBg)}>
                <Briefcase className={cn("w-5 h-5", accent.dot.replace("bg-", "text-"))} />
              </div>
              <div>
                <p className="text-base font-bold text-foreground leading-tight">{account.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{investLabel}</span>
                  {rateLabel && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-medium">{rateLabel}</span>}
                </div>
              </div>
            </div>
          </div>
          <div className="h-px bg-border/10" />
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">Saldo atual</p>
            </div>
            <AnimatedCurrency value={balance} className="text-3xl font-extrabold tabular-nums tracking-tight text-foreground block" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => openModal("deposit")} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/10 text-primary text-[11px] font-semibold hover:bg-primary/20 transition-colors border border-primary/20">
              <ArrowDownLeft className="w-3.5 h-3.5" /> Depósito
            </button>
            <button onClick={() => openModal("withdraw")} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-destructive/10 text-destructive text-[11px] font-semibold hover:bg-destructive/20 transition-colors border border-destructive/20">
              <ArrowUpRight className="w-3.5 h-3.5" /> Resgate
            </button>
          </div>
        </div>
      </motion.div>

      {/* Micro-interaction */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="flex items-start gap-2.5 rounded-2xl border border-primary/10 bg-primary/[0.04] p-3.5">
          <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">{microMsg}</p>
        </div>
      </motion.div>

      {/* Profit Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="rounded-2xl border border-border/10 p-4" style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-primary" />
            </div>
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">Rendimento estimado</span>
          </div>
          <AnimatedCurrency
            value={yieldData.estimatedProfit}
            className={cn("text-2xl font-extrabold tabular-nums mb-3 block", yieldData.estimatedProfit >= 0 ? "text-primary" : "text-destructive")}
          />
          <div className="h-px bg-border/10 mb-3" />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Por dia</p>
              <p className="text-sm font-bold text-primary tabular-nums">+{formatCurrency(yieldData.dailyYield)}</p>
              <p className="text-[10px] text-muted-foreground">{formatPct(yieldData.dailyRate)}</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Por mês</p>
              <p className="text-sm font-bold text-primary tabular-nums">+{formatCurrency(yieldData.monthlyYield)}</p>
              <p className="text-[10px] text-muted-foreground">{formatPct(yieldData.monthlyRate)}</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Por ano</p>
              <p className="text-sm font-bold text-primary tabular-nums">+{formatCurrency(yieldData.yearlyYield)}</p>
              <p className="text-[10px] text-muted-foreground">{formatPct(yieldData.annualRate)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border/10 p-3" style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Saldo inicial</p>
          <p className="text-sm font-bold text-foreground tabular-nums">{formatCurrency(Number(account.initial_balance))}</p>
        </div>
        <div className="rounded-2xl border border-border/10 p-3" style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Depósitos</p>
          <p className="text-sm font-bold text-primary tabular-nums">{formatCurrency(yieldData.totalDeposits)}</p>
        </div>
        <div className="rounded-2xl border border-border/10 p-3" style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Resgates</p>
          <p className="text-sm font-bold text-destructive tabular-nums">{formatCurrency(yieldData.totalWithdrawals)}</p>
        </div>
      </motion.div>

      {/* ═══════ Simulação de Investimento ═══════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="rounded-2xl border border-border/10 p-4 space-y-4" style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-primary" />
              </div>
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">Simulação</span>
            </div>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {SIMULATION_PERIODS.map((p, idx) => (
              <button
                key={p.label}
                onClick={() => { setSimPeriodIdx(idx); setShowCustom(false); }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
                  !showCustom && simPeriodIdx === idx
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                )}
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => setShowCustom(true)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
                showCustom ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              )}
            >
              Outro
            </button>
          </div>

          {showCustom && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={360}
                placeholder="Meses"
                value={customMonths}
                onChange={(e) => setCustomMonths(e.target.value)}
                className="bg-muted/30 border-border/20 h-9 rounded-xl text-sm w-24"
              />
              <span className="text-xs text-muted-foreground">meses (máx 360)</span>
            </div>
          )}

          {/* Chart */}
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simData.chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  width={40}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorValue)"
                  dot={false}
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Simulation results */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/10 p-3 bg-muted/[0.03]">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Valor final</p>
              <AnimatedCurrency value={simData.finalValue} className="text-base font-bold text-foreground tabular-nums block" />
            </div>
            <div className="rounded-xl border border-border/10 p-3 bg-muted/[0.03]">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Rendimento total</p>
              <AnimatedCurrency value={simData.totalYield} className="text-base font-bold text-primary tabular-nums block" />
            </div>
            <div className="rounded-xl border border-border/10 p-3 bg-muted/[0.03]">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Média mensal</p>
              <p className="text-base font-bold text-primary tabular-nums">{formatCurrency(simData.avgMonthly)}</p>
            </div>
            <div className="rounded-xl border border-border/10 p-3 bg-muted/[0.03]">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Período</p>
              <p className="text-base font-bold text-foreground tabular-nums">{simData.months} {simData.months === 1 ? "mês" : "meses"}</p>
            </div>
          </div>

          {/* Projection callout */}
          {balance > 0 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-primary/10 bg-primary/[0.04] p-3">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Se continuar assim, seu investimento vira{" "}
                <span className="font-bold text-primary">{formatCurrency(simData.finalValue)}</span>{" "}
                em {simData.months} {simData.months === 1 ? "mês" : "meses"} 🚀
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Rate info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="rounded-2xl border border-border/10 p-4" style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium mb-3">Informações da taxa</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Tipo</span>
              <span className="text-xs font-semibold text-foreground">{investLabel}</span>
            </div>
            {rateLabel && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Taxa configurada</span>
                <span className="text-xs font-semibold text-foreground">{rateLabel}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">CDI referência</span>
              <span className="text-xs font-semibold text-foreground">{formatPct(CDI_ANNUAL_DEFAULT)} a.a.</span>
            </div>
            {account.rate_type === "ipca_plus" && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">IPCA referência</span>
                <span className="text-xs font-semibold text-foreground">{formatPct(IPCA_ANNUAL_DEFAULT)} a.a.</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Taxa efetiva anual</span>
              <span className="text-xs font-semibold text-primary">{formatPct(yieldData.annualRate)} a.a.</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Transaction History */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <h2 className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium px-1 mb-3">Histórico de movimentações</h2>
        {transactions.length === 0 ? (
          <div className="rounded-2xl border border-border/10 p-8 text-center" style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}>
            <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/10 overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)" }}>
            {transactions.map((tx, idx) => {
              const isDeposit = tx.to_account_id === accountId;
              return (
                <div key={tx.id} className={cn("flex items-center gap-3 p-4", idx < transactions.length - 1 && "border-b border-border/10")}>
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", isDeposit ? "bg-primary/15" : "bg-destructive/15")}>
                    {isDeposit ? <ArrowDownLeft className="w-4 h-4 text-primary" /> : <ArrowUpRight className="w-4 h-4 text-destructive" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{tx.name}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(tx.date + "T12:00:00").toLocaleDateString("pt-BR")}</p>
                  </div>
                  <p className={cn("text-sm font-bold tabular-nums", isDeposit ? "text-primary" : "text-destructive")}>
                    {isDeposit ? "+" : "-"}{formatCurrency(Number(tx.amount))}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </motion.section>

      {/* Deposit/Withdraw Modal */}
      <ModalOverlay open={modalMode !== null} onClose={() => setModalMode(null)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-foreground">
              {modalMode === "deposit" ? `Depósito em ${account.name}` : `Resgate de ${account.name}`}
            </p>
            <button onClick={() => setModalMode(null)} className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <Select value={modalFromId} onValueChange={setModalFromId}>
            <SelectTrigger className="bg-muted/30 border-border/20 h-11 rounded-xl">
              <SelectValue placeholder={modalMode === "deposit" ? "Conta de origem" : "Conta de destino"} />
            </SelectTrigger>
            <SelectContent>
              {allAccounts.filter(a => a.type !== "investment").map(a => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name} · {formatCurrency(Number(a.current_balance))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Valor</Label>
            <Input
              placeholder="0,00"
              inputMode="numeric"
              value={modalCents > 0 ? (modalCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ""}
              onKeyDown={(e) => {
                if (e.key === "Backspace") {
                  e.preventDefault();
                  setModalCents(prev => Math.floor(prev / 10));
                } else if (e.key >= "0" && e.key <= "9") {
                  e.preventDefault();
                  setModalCents(prev => {
                    const next = prev * 10 + parseInt(e.key);
                    return next > 99999999 ? prev : next;
                  });
                }
              }}
              readOnly
              className="bg-muted/30 border-border/20 h-11 rounded-xl text-lg font-bold text-center"
            />
          </div>

          <Button
            onClick={handleModalSubmit}
            disabled={modalCents === 0 || !modalFromId || modalSubmitting}
            className={cn(
              "w-full h-11 rounded-xl text-sm font-semibold border",
              modalMode === "deposit"
                ? "bg-primary/15 text-primary hover:bg-primary/25 border-primary/30"
                : "bg-destructive/15 text-destructive hover:bg-destructive/25 border-destructive/30"
            )}
          >
            {modalSubmitting ? "Processando..." : `${modalMode === "deposit" ? "Depositar" : "Resgatar"} R$ ${(modalCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          </Button>
        </div>
      </ModalOverlay>
    </div>
  );
};

export default InvestimentoDetalhe;
