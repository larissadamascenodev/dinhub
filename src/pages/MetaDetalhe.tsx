import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, TrendingUp, Sparkles, Clock, MoreVertical, Edit2, Trash2, ArrowDownLeft, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchGoalById,
  fetchGoalTransactions,
  createGoalDeposit,
  createGoalWithdraw,
  deleteGoal,
  deleteGoalDepositWithRefund,
  computeGoalInsights,
  type Goal,
  type GoalTransaction,
} from "@/services/goalService";
import GoalDepositModal from "@/components/goals/GoalDepositModal";
import GoalWithdrawModal from "@/components/goals/GoalWithdrawModal";
import GoalEditModal from "@/components/goals/GoalEditModal";
import GoalConfirmModal from "@/components/goals/GoalConfirmModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const MetaDetalhe = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [transactions, setTransactions] = useState<GoalTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteGoal, setShowDeleteGoal] = useState(false);
  const [deletingGoal, setDeletingGoal] = useState(false);
  const [depositToDelete, setDepositToDelete] = useState<GoalTransaction | null>(null);
  const [deletingDeposit, setDeletingDeposit] = useState(false);
  const [accountNames, setAccountNames] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!goalId) return;
    try {
      const [g, txs] = await Promise.all([
        fetchGoalById(goalId),
        fetchGoalTransactions(goalId),
      ]);
      setGoal(g);
      setTransactions(txs);

      // Fetch account names for transactions that have account_id
      const accountIds = [...new Set(txs.filter(t => t.account_id).map(t => t.account_id!))];
      if (accountIds.length > 0) {
        const { data: accs } = await supabase
          .from("accounts")
          .select("id, name")
          .in("id", accountIds);
        if (accs) {
          const map: Record<string, string> = {};
          accs.forEach(a => { map[a.id] = a.name; });
          setAccountNames(map);
        }
      }
    } catch {
      toast.error("Erro ao carregar meta");
      navigate("/metas");
    } finally {
      setLoading(false);
    }
  }, [goalId, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeposit = useCallback(
    async (data: { amount: number; date: string; source?: string; account_id?: string }) => {
      if (!user || !goalId) return;
      try {
        await createGoalDeposit(
          { goal_id: goalId, amount: data.amount, date: data.date, source: data.source, account_id: data.account_id },
          user.id
        );
        toast.success("Depósito realizado! 💰");
        setShowDeposit(false);
        load();
      } catch {
        toast.error("Erro ao depositar");
      }
    },
    [user, goalId, load]
  );

  const handleWithdraw = useCallback(
    async (data: { amount: number; date: string; account_id?: string; destination?: string }) => {
      if (!user || !goalId) return;
      try {
        await createGoalWithdraw(
          { goal_id: goalId, amount: data.amount, date: data.date, account_id: data.account_id, destination: data.destination },
          user.id
        );
        toast.success("Saque realizado! 💸");
        setShowWithdraw(false);
        load();
      } catch {
        toast.error("Erro ao sacar");
      }
    },
    [user, goalId, load]
  );

  const handleDeleteGoal = useCallback(async () => {
    if (!goalId) return;
    setDeletingGoal(true);
    try {
      await deleteGoal(goalId);
      toast.success("Meta excluída");
      navigate("/metas");
    } catch {
      toast.error("Erro ao excluir meta");
    } finally {
      setDeletingGoal(false);
    }
  }, [goalId, navigate]);

  const handleDeleteDeposit = useCallback(async () => {
    if (!depositToDelete || !user || !goal) return;
    setDeletingDeposit(true);
    try {
      await deleteGoalDepositWithRefund(depositToDelete, user.id, goal.name);
      toast.success("Depósito removido");
      setDepositToDelete(null);
      load();
    } catch {
      toast.error("Erro ao remover depósito");
    } finally {
      setDeletingDeposit(false);
    }
  }, [depositToDelete, user, goal, load]);

  if (loading || !goal) {
    return (
      <div className="space-y-4 pb-8">
        <div className="h-8 w-32 bg-card/60 animate-pulse rounded-lg" />
        <div className="h-48 bg-card/60 animate-pulse rounded-2xl" />
        <div className="h-32 bg-card/60 animate-pulse rounded-2xl" />
      </div>
    );
  }

  const progress = Math.min(1, goal.current_amount / goal.target_amount);
  const remaining = goal.target_amount - goal.current_amount;
  const isComplete = progress >= 1;
  const insights = computeGoalInsights(goal, transactions);
  const topInsight = insights.length > 0 ? insights[0] : null;

  let predictionText = "";
  if (!isComplete && goal.monthly_contribution && goal.monthly_contribution > 0) {
    const months = Math.ceil(remaining / goal.monthly_contribution);
    predictionText = `Você conclui em aproximadamente ${months} ${months === 1 ? "mês" : "meses"}`;
  }

  const getDepositDeleteDescription = (tx: GoalTransaction) => {
    const amt = fmt(Math.abs(Number(tx.amount)));
    if (tx.account_id && accountNames[tx.account_id]) {
      return `O valor de ${amt} será devolvido para a conta "${accountNames[tx.account_id]}".`;
    }
    if (tx.source) {
      return `Este depósito de ${amt} veio de "${tx.source}" (conta externa). O valor será removido da meta.`;
    }
    return `O depósito de ${amt} será removido da meta.`;
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/metas")}
            className="p-2 rounded-xl hover:bg-muted/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <div>
            <h1 className="text-lg font-bold text-foreground">{goal.name}</h1>
            <p className="text-[11px] text-muted-foreground">
              {fmt(Number(goal.current_amount))} de {fmt(Number(goal.target_amount))}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {!isComplete && (
            <>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowDeposit(true)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary/15 border border-primary/20 text-primary text-xs font-semibold"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Depositar
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowWithdraw(true)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-orange-500/15 border border-orange-500/20 text-orange-400 text-xs font-semibold"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Sacar
              </motion.button>
            </>
          )}
          {/* Three dots menu */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-xl hover:bg-muted/20 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-foreground" />
            </motion.button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  className="absolute right-0 mt-1 w-40 rounded-xl bg-card border border-border/20 shadow-xl overflow-hidden z-10"
                >
                  <button
                    onClick={() => { setShowEdit(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-muted/10 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => { setShowDeleteGoal(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Excluir
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Close menu overlay */}
      {showMenu && <div className="fixed inset-0 z-[5]" onClick={() => setShowMenu(false)} />}

      {/* Progress section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 bg-card/80 backdrop-blur-xl border border-border/15 shadow-lg"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-foreground">Progresso</p>
          <span className={`text-lg font-bold ${isComplete ? "text-primary" : "text-foreground"}`}>
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div className="relative h-3 w-full rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background: isComplete
                ? "hsl(150 100% 45%)"
                : "linear-gradient(90deg, hsl(150 100% 45% / 0.6), hsl(150 100% 45%))",
              boxShadow: "0 0 12px hsl(150 100% 45% / 0.4)",
            }}
          />
        </div>
        {remaining > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Faltam {fmt(remaining)}
          </p>
        )}
        {isComplete && (
          <p className="text-xs text-primary mt-2 font-semibold">Meta concluída! 🎉</p>
        )}
      </motion.div>

      {/* Prediction */}
      {predictionText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-4 bg-card/80 backdrop-blur-xl border border-border/15"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Previsão</p>
              <p className="text-[11px] text-muted-foreground">{predictionText}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Single insight from BY */}
      {topInsight && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-4 bg-card/80 backdrop-blur-xl border border-border/15"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-xs font-bold text-foreground">Insight da BY</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{topInsight}</p>
        </motion.div>
      )}

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-4 bg-card/80 backdrop-blur-xl border border-border/15"
      >
        <p className="text-xs font-bold text-foreground mb-3">Histórico de movimentações</p>
        {transactions.length === 0 ? (
          <p className="text-[11px] text-muted-foreground text-center py-4">Nenhuma movimentação ainda</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => {
              const isWithdraw = Number(tx.amount) < 0;
              const absAmount = Math.abs(Number(tx.amount));
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-xl p-2.5 bg-muted/5 border border-border/10"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isWithdraw ? "bg-orange-500/10" : "bg-primary/10"
                    }`}>
                      {isWithdraw ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-orange-400" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${isWithdraw ? "text-orange-400" : "text-primary"}`}>
                        {isWithdraw ? "- " : "+ "}{fmt(absAmount)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(tx.date + "T12:00:00"), "dd MMM yyyy", { locale: ptBR })}
                        {tx.source ? ` • ${tx.source}` : ""}
                        {tx.account_id && accountNames[tx.account_id] ? ` • ${accountNames[tx.account_id]}` : ""}
                      </p>
                    </div>
                  </div>
                  {!isWithdraw && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setDepositToDelete(tx)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                    </motion.button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <GoalDepositModal
        open={showDeposit}
        onClose={() => setShowDeposit(false)}
        onSubmit={handleDeposit}
        goalName={goal.name}
      />

      <GoalWithdrawModal
        open={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        onSubmit={handleWithdraw}
        goalName={goal.name}
        maxAmount={goal.current_amount}
      />

      {showEdit && (
        <GoalEditModal
          open={showEdit}
          onClose={() => setShowEdit(false)}
          goal={goal}
          onUpdated={load}
        />
      )}

      <GoalConfirmModal
        open={showDeleteGoal}
        onClose={() => setShowDeleteGoal(false)}
        onConfirm={handleDeleteGoal}
        title="Excluir meta"
        description={`Tem certeza que deseja excluir a meta "${goal.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deletingGoal}
      />

      <GoalConfirmModal
        open={!!depositToDelete}
        onClose={() => setDepositToDelete(null)}
        onConfirm={handleDeleteDeposit}
        title="Remover depósito"
        description={depositToDelete ? getDepositDeleteDescription(depositToDelete) : ""}
        confirmLabel="Remover"
        loading={deletingDeposit}
      />
    </div>
  );
};

export default MetaDetalhe;
