import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CreditCard, Plus, X, Landmark, Banknote, PiggyBank, TrendingUp, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  cash: { label: "Carteira", icon: Banknote },
  checking: { label: "Conta corrente", icon: Landmark },
  savings: { label: "Poupança", icon: PiggyBank },
};

const ACCOUNT_GRADIENTS = [
  "from-violet-700/80 via-violet-900/60 to-violet-950/80",
  "from-emerald-700/80 via-emerald-900/60 to-emerald-950/80",
  "from-sky-700/80 via-sky-900/60 to-sky-950/80",
  "from-amber-700/80 via-amber-900/60 to-amber-950/80",
  "from-rose-700/80 via-rose-900/60 to-rose-950/80",
];

const CARD_GRADIENTS = [
  "from-violet-700/90 via-violet-900/70 to-violet-950/90",
  "from-sky-700/90 via-sky-900/70 to-sky-950/90",
  "from-emerald-700/90 via-emerald-900/70 to-emerald-950/90",
  "from-rose-700/90 via-rose-900/70 to-rose-950/90",
  "from-amber-700/90 via-amber-900/70 to-amber-950/90",
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

  return (
    <div className="pt-2 pb-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Carteira</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gerencie suas contas, cartões e assinaturas</p>
      </div>

      {/* ═══════ Contas Bancárias ═══════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Landmark className="w-4 h-4 text-primary" />
            Contas Bancárias
          </h2>
          <button
            onClick={() => setShowAddAccount(true)}
            className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-4 h-4 text-primary" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {accounts.map((acc, idx) => {
              const typeInfo = ACCOUNT_TYPE_LABELS[acc.type] ?? ACCOUNT_TYPE_LABELS.checking;
              const Icon = typeInfo.icon;
              const gradient = ACCOUNT_GRADIENTS[idx % ACCOUNT_GRADIENTS.length];
              const balance = Number(acc.current_balance);
              const isPositive = balance >= 0;

              return (
                <motion.div
                  key={acc.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "relative rounded-2xl p-4 overflow-hidden bg-gradient-to-br cursor-pointer group",
                    "border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300",
                    gradient
                  )}
                >
                  {/* Decorative */}
                  <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/[0.04]" />
                  <div className="absolute -right-2 top-10 w-12 h-12 rounded-full bg-white/[0.03]" />

                  <div className="relative z-10 flex flex-col h-full min-h-[140px]">
                    {/* Top: icon + name + chevron */}
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                          <Icon className="w-4 h-4 text-white/80" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{acc.name}</p>
                          <p className="text-[10px] text-white/40 capitalize">{typeInfo.label}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors mt-1 shrink-0" />
                    </div>

                    {/* Default badge */}
                    {acc.is_default && (
                      <span className="self-start text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold mt-1">
                        Principal
                      </span>
                    )}

                    {/* Bottom: balance */}
                    <div className="mt-auto pt-3">
                      <p className="text-[10px] text-white/40 font-medium uppercase tracking-wide mb-0.5">
                        Saldo disponível
                      </p>
                      <p className="text-lg font-bold text-white">
                        {formatCurrency(balance)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className={cn("w-3 h-3", isPositive ? "text-primary" : "text-destructive")} />
                        <span className={cn("text-[10px] font-medium", isPositive ? "text-primary" : "text-destructive")}>
                          {isPositive ? "Saldo positivo" : "Saldo negativo"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Add account card */}
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: accounts.length * 0.05 }}
              onClick={() => setShowAddAccount(true)}
              className={cn(
                "rounded-2xl p-4 min-h-[140px] flex flex-col items-center justify-center gap-2",
                "border-2 border-dashed border-primary/20 hover:border-primary/40",
                "bg-primary/[0.03] hover:bg-primary/[0.06] transition-all duration-300 cursor-pointer"
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-primary/70 font-medium">Adicionar conta</span>
            </motion.button>
          </div>
        )}

        {/* Add account modal */}
        <AnimatePresence>
          {showAddAccount && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4"
            >
              <div className="rounded-2xl bg-card border border-border/30 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">Nova Conta</p>
                  <button onClick={() => setShowAddAccount(false)} className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <Input
                  placeholder="Nome da conta (ex: Nubank)"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="bg-muted/30 border-border/20 h-11 rounded-xl"
                />
                <Select value={newAccType} onValueChange={(v) => setNewAccType(v as any)}>
                  <SelectTrigger className="bg-muted/30 border-border/20 h-11 rounded-xl">
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
                  className="w-full h-11 rounded-xl text-sm font-semibold"
                >
                  Criar Conta
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ═══════ Cartões de Crédito ═══════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-violet-400" />
            Cartões de Crédito
          </h2>
          <button
            onClick={() => setShowAddCard(true)}
            className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center hover:bg-violet-500/20 transition-colors"
          >
            <Plus className="w-4 h-4 text-violet-400" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {creditCards.map((card, idx) => {
              const usedPct = card.limit > 0 ? Math.min((Number(card.used_limit) / Number(card.limit)) * 100, 100) : 0;
              const available = Math.max(Number(card.limit) - Number(card.used_limit), 0);
              const gradient = CARD_GRADIENTS[idx % CARD_GRADIENTS.length];

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/fatura/${card.id}`)}
                  className={cn(
                    "relative rounded-2xl p-4 overflow-hidden bg-gradient-to-br cursor-pointer group",
                    "border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 active:scale-[0.98]",
                    gradient
                  )}
                >
                  {/* Decorative */}
                  <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/[0.04]" />

                  <div className="relative z-10 flex flex-col h-full min-h-[140px]">
                    {/* Top */}
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{card.name}</p>
                          <p className="text-[10px] text-white/40">•••• {String(card.due_day).padStart(4, '0').slice(-4)}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors mt-1 shrink-0" />
                    </div>

                    {/* Bottom: available */}
                    <div className="mt-auto pt-3">
                      <p className="text-[10px] text-white/40 font-medium uppercase tracking-wide mb-0.5">
                        Disponível
                      </p>
                      <p className="text-lg font-bold text-white">
                        {formatCurrency(available)}
                      </p>

                      {/* Progress */}
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-2 mb-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${usedPct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={cn(
                            "h-full rounded-full",
                            usedPct > 80 ? "bg-red-400" : usedPct > 50 ? "bg-amber-400" : "bg-primary"
                          )}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-[10px] font-medium",
                          usedPct > 80 ? "text-red-400" : usedPct > 50 ? "text-amber-400" : "text-primary"
                        )}>
                          {usedPct.toFixed(0)}% usado
                        </span>
                        <span className="text-[10px] text-white/40">
                          {formatCurrency(Number(card.used_limit))} / {formatCurrency(Number(card.limit))}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/30 mt-1">Dia {card.due_day}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Add card */}
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: creditCards.length * 0.05 }}
              onClick={() => setShowAddCard(true)}
              className={cn(
                "rounded-2xl p-4 min-h-[140px] flex flex-col items-center justify-center gap-2",
                "border-2 border-dashed border-violet-400/20 hover:border-violet-400/40",
                "bg-violet-500/[0.03] hover:bg-violet-500/[0.06] transition-all duration-300 cursor-pointer"
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-xs text-violet-400/70 font-medium">Adicionar cartão</span>
            </motion.button>
          </div>
        )}

        {/* Add card form */}
        <AnimatePresence>
          {showAddCard && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4"
            >
              <div className="rounded-2xl bg-card border border-border/30 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">Novo Cartão</p>
                  <button onClick={() => setShowAddCard(false)} className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <Input
                  placeholder="Nome do cartão (ex: Nubank)"
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  className="bg-muted/30 border-border/20 h-11 rounded-xl"
                />
                <Input
                  placeholder="Limite (ex: 5000)"
                  type="number"
                  value={newCardLimit}
                  onChange={(e) => setNewCardLimit(e.target.value)}
                  className="bg-muted/30 border-border/20 h-11 rounded-xl"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[10px] text-muted-foreground mb-1 block">Dia do fechamento</Label>
                    <Input
                      type="number" min={1} max={31}
                      value={newCardClosing}
                      onChange={(e) => setNewCardClosing(e.target.value)}
                      className="bg-muted/30 border-border/20 h-10 text-sm rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground mb-1 block">Dia do vencimento</Label>
                    <Input
                      type="number" min={1} max={31}
                      value={newCardDue}
                      onChange={(e) => setNewCardDue(e.target.value)}
                      className="bg-muted/30 border-border/20 h-10 text-sm rounded-xl"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddCard}
                  disabled={!newCardName.trim() || !newCardLimit}
                  className="w-full h-11 rounded-xl text-sm font-semibold"
                >
                  Cadastrar Cartão
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

export default GestaoFinanceira;
