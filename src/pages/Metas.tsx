import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { fetchGoals, createGoal, createGoalDeposit, type Goal } from "@/services/goalService";
import GoalCreateModal from "@/components/goals/GoalCreateModal";
import GoalDepositModal from "@/components/goals/GoalDepositModal";

const Metas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [depositGoal, setDepositGoal] = useState<Goal | null>(null);

  const loadGoals = useCallback(async () => {
    try {
      const data = await fetchGoals();
      setGoals(data);
    } catch {
      toast.error("Erro ao carregar metas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleCreateGoal = useCallback(
    async (data: { name: string; target_amount: number; monthly_contribution?: number | null; deadline?: string | null }) => {
      if (!user) return;
      try {
        await createGoal(data, user.id);
        toast.success("Meta criada com sucesso! 🎯");
        setShowCreateModal(false);
        loadGoals();
      } catch {
        toast.error("Erro ao criar meta");
      }
    },
    [user, loadGoals]
  );

  const handleDeposit = useCallback(
    async (data: { amount: number; date: string; source?: string }) => {
      if (!user || !depositGoal) return;
      try {
        await createGoalDeposit(
          { goal_id: depositGoal.id, amount: data.amount, date: data.date, source: data.source },
          user.id
        );
        toast.success("Depósito realizado! 💰");
        setDepositGoal(null);
        loadGoals();
      } catch {
        toast.error("Erro ao depositar");
      }
    },
    [user, depositGoal, loadGoals]
  );

  // Summary
  const avgProgress =
    goals.length > 0
      ? goals.reduce((s, g) => s + Math.min(1, g.current_amount / g.target_amount), 0) / goals.length
      : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Suas Metas</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Acompanhe seu progresso financeiro</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/15 border border-primary/20 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Meta
        </motion.button>
      </div>

      {/* Summary card */}
      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 border border-primary/15 backdrop-blur-xl"
          style={{
            background: "linear-gradient(135deg, hsl(150 100% 45% / 0.08) 0%, hsl(150 100% 45% / 0.03) 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {Math.round(avgProgress * 100)}% concluído 💪
              </p>
              <p className="text-xs text-muted-foreground">
                {goals.length} {goals.length === 1 ? "meta ativa" : "metas ativas"}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Goals list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-card/60 animate-pulse" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">Nenhuma meta criada</h3>
          <p className="text-xs text-muted-foreground max-w-[240px]">
            Crie sua primeira meta e comece a acompanhar seu progresso financeiro
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="mt-4 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            Criar meta
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {goals.map((goal, idx) => {
              const progress = Math.min(1, goal.current_amount / goal.target_amount);
              const remaining = goal.target_amount - goal.current_amount;
              const isComplete = progress >= 1;

              let prediction = "";
              if (!isComplete && goal.monthly_contribution && goal.monthly_contribution > 0) {
                const months = Math.ceil(remaining / goal.monthly_contribution);
                prediction = `previsão: ${months} ${months === 1 ? "mês" : "meses"}`;
              }

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/metas/${goal.id}`)}
                  className="rounded-2xl p-4 bg-card/80 backdrop-blur-xl border border-border/15 shadow-lg shadow-black/10 cursor-pointer hover:border-primary/20 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isComplete ? "bg-primary/20 border-primary/30" : "bg-secondary border-border/20"
                        } border`}
                      >
                        <Target className={`w-4.5 h-4.5 ${isComplete ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{goal.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          R$ {Number(goal.current_amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} de R${" "}
                          {Number(goal.target_amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold ${isComplete ? "text-primary" : "text-foreground"}`}
                    >
                      {Math.round(progress * 100)}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-2 w-full rounded-full bg-secondary overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                      className="h-full rounded-full"
                      style={{
                        background: isComplete
                          ? "hsl(150 100% 45%)"
                          : "linear-gradient(90deg, hsl(150 100% 45% / 0.7), hsl(150 100% 45%))",
                        boxShadow: "0 0 8px hsl(150 100% 45% / 0.4)",
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground">
                      {isComplete
                        ? "Meta concluída! 🎉"
                        : `Faltam R$ ${remaining.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}${prediction ? ` • ${prediction}` : ""}`}
                    </p>
                    {!isComplete && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDepositGoal(goal);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold hover:bg-primary/15 transition-colors"
                      >
                        <TrendingUp className="w-3 h-3" />
                        Depositar
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <GoalCreateModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={handleCreateGoal} />
      <GoalDepositModal open={!!depositGoal} onClose={() => setDepositGoal(null)} onSubmit={handleDeposit} goalName={depositGoal?.name ?? ""} />
    </div>
  );
};

export default Metas;
