import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wallet, CreditCard, Plus, X, Landmark, Banknote, PiggyBank, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getAccounts, createAccount, getCreditCards, createCreditCard } from "@/services/transactionService";
import { cn } from "@/lib/utils";

interface Account {
  id: string;
  name: string;
  type: string;
  is_default: boolean;
  current_balance: number;
  initial_balance: number;
}

interface CreditCardItem {
  id: string;
  name: string;
  limit: number;
  used_limit: number;
  closing_day: number;
  due_day: number;
  color: string | null;
}

const ACCOUNT_TYPE_LABELS: Record<string, { label: string; icon: typeof Wallet }> = {
  cash: { label: "Dinheiro", icon: Banknote },
  checking: { label: "Conta Corrente", icon: Landmark },
  savings: { label: "Poupança", icon: PiggyBank },
};

const CARD_COLORS = [
  "from-violet-600 to-violet-900",
  "from-rose-600 to-rose-900",
  "from-amber-600 to-amber-900",
  "from-sky-600 to-sky-900",
  "from-emerald-600 to-emerald-900",
];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const GestaoFinanceira = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCardItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add account state
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccName, setNewAccName] = useState("");
  const [newAccType, setNewAccType] = useState<"checking" | "cash" | "savings">("checking");

  // Add card state
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardName, setNewCardName] = useState("");
  const [newCardLimit, setNewCardLimit] = useState("");
  const [newCardClosing, setNewCardClosing] = useState("10");
  const [newCardDue, setNewCardDue] = useState("20");

  const fetchData = async () => {
    if (!user) return;
    try {
      const [accs, cards] = await Promise.all([
        getAccounts(),
        getCreditCards(),
      ]);
      setAccounts(accs as unknown as Account[]);
      setCreditCards(cards as unknown as CreditCardItem[]);
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAddAccount = async () => {
    if (!user || !newAccName.trim()) return;
    try {
      await createAccount(newAccName.trim(), user.id, newAccType);
      toast.success("Conta criada!");
      setShowAddAccount(false);
      setNewAccName("");
      setNewAccType("checking");
      fetchData();
    } catch {
      toast.error("Erro ao criar conta");
    }
  };

  const handleAddCard = async () => {
    if (!user || !newCardName.trim() || !newCardLimit) return;
    try {
      await createCreditCard(
        {
          name: newCardName.trim(),
          limit: parseFloat(newCardLimit),
          closing_day: parseInt(newCardClosing),
          due_day: parseInt(newCardDue),
        },
        user.id
      );
      toast.success("Cartão cadastrado!");
      setShowAddCard(false);
      setNewCardName("");
      setNewCardLimit("");
      fetchData();
    } catch {
      toast.error("Erro ao criar cartão");
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.current_balance), 0);
  const totalLimit = creditCards.reduce((sum, c) => sum + Number(c.limit), 0);
  const totalUsed = creditCards.reduce((sum, c) => sum + Number(c.used_limit), 0);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-32">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-xl bg-card border border-border/30 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Gestão Financeira</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card border border-border/30 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Saldo Total</span>
            </div>
            <p className={cn("text-lg font-bold", totalBalance >= 0 ? "text-primary" : "text-destructive")}>
              {formatCurrency(totalBalance)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl bg-card border border-border/30 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-violet-400" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Limite Usado</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(totalUsed)}<span className="text-xs text-muted-foreground font-normal"> / {formatCurrency(totalLimit)}</span>
            </p>
          </motion.div>
        </div>

        {/* Accounts Section */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              Contas
            </h2>
            <button
              onClick={() => setShowAddAccount(true)}
              className="flex items-center gap-1 text-xs text-primary font-semibold hover:opacity-80"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-card animate-pulse" />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="rounded-xl bg-card border border-border/30 p-6 text-center">
              <Wallet className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma conta cadastrada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {accounts.map((acc, idx) => {
                const typeInfo = ACCOUNT_TYPE_LABELS[acc.type] ?? ACCOUNT_TYPE_LABELS.checking;
                const Icon = typeInfo.icon;
                return (
                  <motion.div
                    key={acc.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-center gap-3 rounded-xl bg-card border border-border/30 p-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground truncate">{acc.name}</p>
                        {acc.is_default && (
                          <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                            Padrão
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{typeInfo.label}</p>
                    </div>
                    <p className={cn("text-sm font-bold", Number(acc.current_balance) >= 0 ? "text-primary" : "text-destructive")}>
                      {formatCurrency(Number(acc.current_balance))}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Add account form */}
          <AnimatePresence>
            {showAddAccount && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="rounded-xl bg-card border border-border/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Nova Conta</p>
                    <button onClick={() => setShowAddAccount(false)}>
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <Input
                    placeholder="Nome da conta (ex: Nubank)"
                    value={newAccName}
                    onChange={(e) => setNewAccName(e.target.value)}
                    className="bg-muted/30 border-border/20 h-10 rounded-xl"
                  />
                  <Select value={newAccType} onValueChange={(v) => setNewAccType(v as any)}>
                    <SelectTrigger className="bg-muted/30 border-border/20 h-10 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Conta Corrente</SelectItem>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="savings">Poupança</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAddAccount}
                    disabled={!newAccName.trim()}
                    className="w-full h-10 rounded-xl text-sm font-semibold"
                  >
                    Criar Conta
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Credit Cards Section */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-violet-400" />
              Cartões de Crédito
            </h2>
            <button
              onClick={() => setShowAddCard(true)}
              className="flex items-center gap-1 text-xs text-primary font-semibold hover:opacity-80"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-card animate-pulse" />
              ))}
            </div>
          ) : creditCards.length === 0 ? (
            <div className="rounded-xl bg-card border border-border/30 p-6 text-center">
              <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum cartão cadastrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {creditCards.map((card, idx) => {
                const usedPct = card.limit > 0 ? Math.min((Number(card.used_limit) / Number(card.limit)) * 100, 100) : 0;
                const available = Math.max(Number(card.limit) - Number(card.used_limit), 0);
                const colorClass = CARD_COLORS[idx % CARD_COLORS.length];

                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    onClick={() => navigate(`/fatura/${card.id}`)}
                    className={cn(
                      "relative rounded-2xl p-5 overflow-hidden bg-gradient-to-br cursor-pointer active:scale-[0.98] transition-transform",
                      colorClass
                    )}
                  >
                    {/* Decorative circles */}
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5" />
                    <div className="absolute -right-2 top-8 w-16 h-16 rounded-full bg-white/5" />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-white/80" />
                          <span className="text-sm font-bold text-white">{card.name}</span>
                        </div>
                        <span className="text-[10px] text-white/50 font-medium">
                          Fecha dia {card.closing_day} · Vence dia {card.due_day}
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="text-[11px] text-white/50 font-medium mb-0.5">Limite Usado</p>
                        <p className="text-lg font-bold text-white">
                          {formatCurrency(Number(card.used_limit))}
                          <span className="text-xs text-white/40 font-normal"> / {formatCurrency(Number(card.limit))}</span>
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${usedPct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={cn(
                            "h-full rounded-full",
                            usedPct > 80 ? "bg-red-400" : usedPct > 50 ? "bg-amber-400" : "bg-emerald-400"
                          )}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/40">{usedPct.toFixed(0)}% utilizado</span>
                        <span className="text-[10px] text-white/60 font-medium">
                          Disponível: {formatCurrency(available)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Add card form */}
          <AnimatePresence>
            {showAddCard && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="rounded-xl bg-card border border-border/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Novo Cartão</p>
                    <button onClick={() => setShowAddCard(false)}>
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <Input
                    placeholder="Nome do cartão (ex: Nubank)"
                    value={newCardName}
                    onChange={(e) => setNewCardName(e.target.value)}
                    className="bg-muted/30 border-border/20 h-10 rounded-xl"
                  />
                  <Input
                    placeholder="Limite (ex: 5000)"
                    type="number"
                    value={newCardLimit}
                    onChange={(e) => setNewCardLimit(e.target.value)}
                    className="bg-muted/30 border-border/20 h-10 rounded-xl"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Dia do fechamento</Label>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        value={newCardClosing}
                        onChange={(e) => setNewCardClosing(e.target.value)}
                        className="bg-muted/30 border-border/20 h-9 text-sm rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Dia do vencimento</Label>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        value={newCardDue}
                        onChange={(e) => setNewCardDue(e.target.value)}
                        className="bg-muted/30 border-border/20 h-9 text-sm rounded-xl"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAddCard}
                    disabled={!newCardName.trim() || !newCardLimit}
                    className="w-full h-10 rounded-xl text-sm font-semibold"
                  >
                    Cadastrar Cartão
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>
    </div>
  );
};

export default GestaoFinanceira;
