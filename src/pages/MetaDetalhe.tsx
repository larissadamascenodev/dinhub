import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Target, TrendingUp, Sparkles, Calendar, Trash2, Edit2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchGoalById,
  fetchGoalTransactions,
  createGoalDeposit,
  deleteGoal,
  deleteGoalDeposit,
  computeGoalInsights,
  type Goal,
  type GoalTransaction,
} from "@/services/goalService";
import GoalDepositModal from "@/components/goals/GoalDepositModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const MetaDetalhe = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [transactions, setTransactions] = useState<GoalTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);

  const load = useCallback(async () => {
    if (!goalId) return;
    try {
      const [g, txs] = await Promise.all([
        fetchGoalById(goalId),
        fetchGoalTransactions(goalId),
      ]);
      setGoal(g);
      setTransactions(txs);
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
    async (data: { amount: number; date: string; source?: string }) => {
      if (!user || !goalId) return;
      try {
        await createGoalDeposit(
          { goal_id: goalId, amount: data.amount, date: data.date, source: data.source },
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

  const handleDeleteGoal = useCallback(async () => {
    if (!goalId) return;
    if (!confirm("Tem certeza que deseja excluir esta meta?")) return;
    try {
      await deleteGoal(goalId);
      toast.success("Meta excluída");
      navigate("/metas");
    } catch {
      toast.error("Erro ao excluir meta");
    }
  }, [goalId, navigate]);

  const handleDeleteDeposit = useCallback(
    async (id: string) => {
      try {
        await deleteGoalDeposit(id);
        toast.success("Depósito removido");
        load();
      } catch {
        toast.error("Erro ao remover depósito");
      }
    },
    [load]
  );

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

  // Prediction
  let predictionText = "";
  if (!isComplete) {
    if (goal.monthly_contribution && goal.monthly_contribution > 0) {
      const months = Math.ceil(remaining / goal.monthly_contribution);
      predictionText = `Você conclui em aproximadamente ${months} ${months === 1 ? "mês" : "meses"}`;
    }
  }

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
              R$ {Number(goal.current_amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} de R${" "}
              {Number(goal.target_amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {!isComplete && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowDeposit(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary/15 border border-primary/20 text-primary text-xs font-semibold"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Depositar
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleDeleteGoal}
            className="p-2 rounded-xl hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </motion.button>
        </div>
      </div>

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
            Faltam R$ {remaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Previsão</p>
              <p className="text-[11px] text-muted-foreground">{predictionText}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-4 bg-card/80 backdrop-blur-xl border border-border/15 space-y-2.5"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-xs font-bold text-foreground">Insights da Nexia</p>
          </div>
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="rounded-xl p-3 bg-muted/10 border border-border/10"
            >
              <p className="text-xs text-muted-foreground leading-relaxed">{insight}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-4 bg-card/80 backdrop-blur-xl border border-border/15"
      >
        <p className="text-xs font-bold text-foreground mb-3">Histórico de depósitos</p>
        {transactions.length === 0 ? (
          <p className="text-[11px] text-muted-foreground text-center py-4">Nenhum depósito ainda</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl p-2.5 bg-muted/5 border border-border/10"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary">
                      + R$ {Number(tx.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(tx.date + "T12:00:00"), "dd MMM yyyy", { locale: ptBR })}
                      {tx.source ? ` • ${tx.source}` : ""}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteDeposit(tx.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                </motion.button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <GoalDepositModal
        open={showDeposit}
        onClose={() => setShowDeposit(false)}
        onSubmit={handleDeposit}
        goalName={goal.name}
      />
    </div>
  );
};

export default MetaDetalhe;
