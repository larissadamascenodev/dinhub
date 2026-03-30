import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Landmark, Banknote, PiggyBank, Pencil, Trash2, X, TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useMonth } from "@/contexts/MonthContext";
import { getAccounts, getTransactions, updateAccount, deleteAccount } from "@/services/transactionService";
import { cn } from "@/lib/utils";

interface Account {
  id: string;
  name: string;
  type: string;
  is_default: boolean;
  current_balance: number;
  initial_balance: number;
  color: string | null;
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
}

const ACCOUNT_TYPE_LABELS: Record<string, { label: string; icon: typeof Landmark }> = {
  cash: { label: "Dinheiro", icon: Banknote },
  checking: { label: "Conta corrente", icon: Landmark },
  savings: { label: "Poupança", icon: PiggyBank },
};

const COLOR_OPTIONS = [
  { value: "violet", label: "Roxo", bg: "from-violet-700/80 to-violet-950/90", accent: "bg-violet-500" },
  { value: "emerald", label: "Verde", bg: "from-emerald-700/80 to-emerald-950/90", accent: "bg-emerald-500" },
  { value: "sky", label: "Azul", bg: "from-sky-700/80 to-sky-950/90", accent: "bg-sky-500" },
  { value: "amber", label: "Laranja", bg: "from-amber-700/80 to-amber-950/90", accent: "bg-amber-500" },
  { value: "rose", label: "Rosa", bg: "from-rose-700/80 to-rose-950/90", accent: "bg-rose-500" },
  { value: "cyan", label: "Ciano", bg: "from-cyan-700/80 to-cyan-950/90", accent: "bg-cyan-500" },
  { value: "fuchsia", label: "Fúcsia", bg: "from-fuchsia-700/80 to-fuchsia-950/90", accent: "bg-fuchsia-500" },
  { value: "lime", label: "Lima", bg: "from-lime-700/80 to-lime-950/90", accent: "bg-lime-500" },
];

function getGradient(color: string | null): string {
  const found = COLOR_OPTIONS.find((c) => c.value === color);
  return found?.bg ?? COLOR_OPTIONS[0].bg;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const ContaDetalhe = () => {
  const navigate = useNavigate();
  const { accountId } = useParams<{ accountId: string }>();
  const { user } = useAuth();
  const { selectedMonth, selectedYear } = useMonth();

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Edit state
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<string>("checking");
  const [editColor, setEditColor] = useState("violet");

  useEffect(() => {
    if (!user || !accountId) return;
    const load = async () => {
      setLoading(true);
      try {
        const accs = await getAccounts();
        const acc = (accs as unknown as Account[]).find((a) => a.id === accountId);
        if (!acc) {
          toast.error("Conta não encontrada");
          navigate("/gestao");
          return;
        }
        setAccount(acc);
        setEditName(acc.name);
        setEditType(acc.type);
        setEditColor(acc.color || "violet");

        const txs = await getTransactions({ month: selectedMonth, year: selectedYear });
        setTransactions((txs as unknown as Transaction[]).filter((t) => t.account_id === accountId));
      } catch {
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, accountId, selectedMonth, selectedYear]);

  const handleSaveEdit = async () => {
    if (!accountId || !editName.trim()) return;
    try {
      const updated = await updateAccount(accountId, {
        name: editName.trim(),
        type: editType,
        color: editColor,
      });
      setAccount((prev) => prev ? { ...prev, ...updated } : prev);
      setEditing(false);
      toast.success("Conta atualizada!");
    } catch {
      toast.error("Erro ao atualizar conta");
    }
  };

  const handleDelete = async () => {
    if (!accountId) return;
    if (!confirm("Tem certeza que deseja excluir esta conta? As transações associadas não serão excluídas.")) return;
    try {
      await deleteAccount(accountId);
      toast.success("Conta excluída!");
      navigate("/gestao");
    } catch {
      toast.error("Erro ao excluir conta");
    }
  };

  // Category aggregation
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "despesa" && t.status === "pago")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + Number(t.amount);
      });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({ name, amount }));
  }, [transactions]);

  const totalDespesas = categoryData.reduce((s, c) => s + c.amount, 0);
  const totalReceitas = transactions
    .filter((t) => t.type === "receita" && t.status === "pago")
    .reduce((s, t) => s + Number(t.amount), 0);

  if (loading) {
    return (
      <div className="pt-2 pb-8 space-y-4">
        <div className="h-40 rounded-2xl bg-card animate-pulse" />
        <div className="h-24 rounded-2xl bg-card animate-pulse" />
      </div>
    );
  }

  if (!account) return null;

  const typeInfo = ACCOUNT_TYPE_LABELS[account.type] ?? ACCOUNT_TYPE_LABELS.checking;
  const Icon = typeInfo.icon;
  const gradient = getGradient(account.color);

  return (
    <div className="pt-2 pb-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/gestao")} className="w-9 h-9 rounded-xl bg-card border border-border/20 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground flex-1">{account.name}</h1>
        <button onClick={() => setEditing(true)} className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Pencil className="w-4 h-4 text-primary" />
        </button>
        <button onClick={handleDelete} className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
          <Trash2 className="w-4 h-4 text-destructive" />
        </button>
      </div>

      {/* Account card */}
      <div className={cn("rounded-2xl p-5 bg-gradient-to-br border border-white/[0.06]", gradient)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white/80" />
          </div>
          <div>
            <p className="text-base font-bold text-white">{account.name}</p>
            <p className="text-[11px] text-white/50">{typeInfo.label}</p>
          </div>
        </div>
        <p className="text-[10px] text-white/40 uppercase tracking-wide mb-0.5">Saldo disponível</p>
        <p className="text-2xl font-bold text-white">{formatCurrency(Number(account.current_balance))}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-card/60 border border-border/20 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-[10px] text-muted-foreground uppercase">Receitas</span>
          </div>
          <p className="text-lg font-bold text-primary">{formatCurrency(totalReceitas)}</p>
        </div>
        <div className="rounded-xl bg-card/60 border border-border/20 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-destructive" />
            <span className="text-[10px] text-muted-foreground uppercase">Despesas</span>
          </div>
          <p className="text-lg font-bold text-destructive">{formatCurrency(totalDespesas)}</p>
        </div>
      </div>

      {/* Categories */}
      {categoryData.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3">Gastos por Categoria</h2>
          <div className="space-y-2">
            {categoryData.map((cat) => {
              const pct = totalDespesas > 0 ? (cat.amount / totalDespesas) * 100 : 0;
              return (
                <div key={cat.name} className="rounded-xl bg-card/60 border border-border/20 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-foreground">{cat.name}</span>
                    <span className="text-xs font-bold text-foreground">{formatCurrency(cat.amount)}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Transactions */}
      <section>
        <h2 className="text-sm font-bold text-foreground mb-3">Transações</h2>
        {transactions.length === 0 ? (
          <div className="rounded-xl bg-card/60 border border-border/20 p-6 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma transação neste mês</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 rounded-xl bg-card/60 border border-border/20 p-3">
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center",
                  tx.type === "receita" ? "bg-primary/10" : "bg-destructive/10"
                )}>
                  {tx.type === "receita"
                    ? <TrendingUp className="w-4 h-4 text-primary" />
                    : <TrendingDown className="w-4 h-4 text-destructive" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{tx.name}</p>
                  <p className="text-[10px] text-muted-foreground">{tx.category} · {new Date(tx.date + "T12:00:00").toLocaleDateString("pt-BR")}</p>
                </div>
                <p className={cn("text-sm font-bold", tx.type === "receita" ? "text-primary" : "text-destructive")}>
                  {tx.type === "receita" ? "+" : "-"}{formatCurrency(Number(tx.amount))}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Edit modal */}
      {editing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditing(false)} />
          <motion.div
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            className="relative z-10 w-full max-w-md rounded-2xl bg-card border border-border/40 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-foreground">Editar Conta</p>
              <button onClick={() => setEditing(false)} className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <Input
              placeholder="Nome da conta"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="bg-muted/30 border-border/20 h-11 rounded-xl"
            />
            <Select value={editType} onValueChange={setEditType}>
              <SelectTrigger className="bg-muted/30 border-border/20 h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Conta Corrente</SelectItem>
                <SelectItem value="savings">Poupança</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Cor</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setEditColor(c.value)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      c.accent,
                      editColor === c.value
                        ? "ring-2 ring-white ring-offset-2 ring-offset-card scale-110"
                        : "opacity-60 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleSaveEdit} disabled={!editName.trim()} className="w-full h-11 rounded-xl">
              Salvar
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ContaDetalhe;
