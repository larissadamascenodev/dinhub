import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, TrendingUp, Clock, Shield, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { fetchGoals, createGoal, createGoalDeposit, type Goal } from "@/services/goalService";
import GoalCreateModal from "@/components/goals/GoalCreateModal";
import GoalDepositModal from "@/components/goals/GoalDepositModal";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Palette for goal dots in donut chart
const GOAL_COLORS = [
  "hsl(40 90% 55%)",   // amber
  "hsl(150 100% 45%)", // green (primary)
  "hsl(210 80% 55%)",  // blue
  "hsl(330 80% 55%)",  // pink
  "hsl(270 70% 60%)",  // purple
  "hsl(180 70% 50%)",  // teal
];

const DonutChart = ({ goals, avgProgress }: { goals: Goal[]; avgProgress: number }) => {
  const size = 80;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  // Build segments for each goal
  const segments = goals.map((g, i) => ({
    progress: Math.min(1, g.current_amount / g.target_amount),
    color: GOAL_COLORS[i % GOAL_COLORS.length],
  }));

  // Each segment gets equal arc portion
  const arcPer = 1 / (segments.length || 1);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border) / 0.15)"
          strokeWidth={stroke}
        />
        {/* Goal segments */}
        {segments.map((seg, i) => {
          const segLength = circumference * arcPer;
          const gap = circumference * 0.01;
          const fillLength = (segLength - gap) * seg.progress;
          const offset = -circumference * arcPer * i;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${fillLength} ${circumference - fillLength}`}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dasharray 0.8s ease-out" }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-primary tabular-nums">{Math.round(avgProgress * 100)}%</span>
        <span className="text-[7px] text-muted-foreground">guardado</span>
      </div>
    </div>
  );
};

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
  const totalGuardado = goals.reduce((s, g) => s + g.current_amount, 0);
  const totalObjetivo = goals.reduce((s, g) => s + g.target_amount, 0);
  const avgProgress =
    goals.length > 0
      ? goals.reduce((s, g) => s + Math.min(1, g.current_amount / g.target_amount), 0) / goals.length
      : 0;

  // Próxima conquista = goal closest to completion (but not complete)
  const nextGoal = goals
    .filter((g) => g.current_amount < g.target_amount)
    .sort((a, b) => (b.current_amount / b.target_amount) - (a.current_amount / a.target_amount))[0] ?? null;

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-display text-foreground">Suas Metas</h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">Acompanhe seu progresso financeiro</p>
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

      {/* Summary card with donut chart */}
      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl overflow-hidden relative"
        >
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(160deg, hsl(220 15% 14% / 0.6) 0%, hsl(220 18% 8% / 0.75) 50%, hsl(220 20% 4% / 0.9) 100%)",
            }}
          />
          <div className="absolute inset-0 border border-border/10 rounded-xl" />

          <div className="relative px-4 py-4">
            <div className="flex items-center gap-4">
              <DonutChart goals={goals} avgProgress={avgProgress} />
              <div className="flex-1 min-w-0">
                <p className="text-[8px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">Total Guardado</p>
                <p className="text-xl font-bold font-display text-foreground tabular-nums mt-0.5">
                  {fmt(totalGuardado)}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">de {fmt(totalObjetivo)}</p>

                {/* Goal list inside summary */}
                <div className="mt-2.5 space-y-1">
                  {goals.map((g, i) => {
                    const pct = Math.round(Math.min(1, g.current_amount / g.target_amount) * 100);
                    return (
                      <div key={g.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: GOAL_COLORS[i % GOAL_COLORS.length] }}
                          />
                          <span className="text-[10px] text-foreground/80 truncate">{g.name}</span>
                        </div>
                        <span className={`text-[10px] font-bold tabular-nums ${pct >= 100 ? "text-primary" : "text-foreground/70"}`}>
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Próxima Conquista */}
      {nextGoal && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl overflow-hidden relative"
        >
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(160deg, hsl(220 15% 14% / 0.6) 0%, hsl(220 18% 8% / 0.75) 50%, hsl(220 20% 4% / 0.9) 100%)",
            }}
          />
          <div className="absolute inset-0 border border-border/10 rounded-xl" />

          <div className="relative px-4 py-3.5 space-y-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px]">✨</span>
              <p className="text-[8px] text-primary uppercase tracking-[0.15em] font-bold">Próxima Conquista</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground">{nextGoal.name}</p>
              </div>
              <span className="text-base font-bold text-primary tabular-nums">
                {Math.round(Math.min(1, nextGoal.current_amount / nextGoal.target_amount) * 100)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 w-full rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(1, nextGoal.current_amount / nextGoal.target_amount) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, hsl(150 100% 45% / 0.6), hsl(150 100% 45%))",
                  boxShadow: "0 0 8px hsl(150 100% 45% / 0.3)",
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="text-foreground/70 tabular-nums">{fmt(nextGoal.current_amount)}</span>
              <span className="text-muted-foreground/60 tabular-nums">faltam {fmt(nextGoal.target_amount - nextGoal.current_amount)}</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setDepositGoal(nextGoal);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/15 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                <Wallet className="w-3.5 h-3.5" />
                Depositar
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/metas/${nextGoal.id}`)}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-muted/10 border border-border/15 text-foreground/80 text-xs font-semibold hover:bg-muted/15 transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                Histórico
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Goals grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-card/60 animate-pulse" />
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
            className="mt-4 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25 text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            Criar meta
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          <AnimatePresence>
            {goals.map((goal, idx) => {
              const progress = Math.min(1, goal.current_amount / goal.target_amount);
              const remaining = goal.target_amount - goal.current_amount;
              const isComplete = progress >= 1;

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/metas/${goal.id}`)}
                  className="rounded-xl p-3 bg-card/80 backdrop-blur-xl border border-border/15 shadow-lg shadow-black/10 cursor-pointer hover:border-primary/20 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isComplete ? "bg-primary/20 border-primary/30" : "bg-secondary border-border/20"
                      } border`}
                    >
                      <Target className={`w-3.5 h-3.5 ${isComplete ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <span className={`text-xs font-bold tabular-nums ${isComplete ? "text-primary" : "text-foreground/80"}`}>
                      {Math.round(progress * 100)}%
                    </span>
                  </div>

                  <p className="text-[11px] font-bold text-foreground truncate mb-0.5">{goal.name}</p>

                  {/* Progress bar */}
                  <div className="relative h-1.5 w-full rounded-full bg-secondary overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.08 }}
                      className="h-full rounded-full"
                      style={{
                        background: isComplete
                          ? "hsl(150 100% 45%)"
                          : "linear-gradient(90deg, hsl(150 100% 45% / 0.6), hsl(150 100% 45%))",
                        boxShadow: "0 0 6px hsl(150 100% 45% / 0.3)",
                      }}
                    />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] text-muted-foreground/60 uppercase tracking-wider">Guardado</span>
                      <span className="text-[9px] font-semibold text-primary tabular-nums">{fmt(goal.current_amount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] text-muted-foreground/60 uppercase tracking-wider">Faltam</span>
                      <span className="text-[9px] font-semibold text-muted-foreground tabular-nums">
                        {isComplete ? "—" : fmt(remaining)}
                      </span>
                    </div>
                  </div>

                  {!isComplete && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDepositGoal(goal);
                      }}
                      className="w-full mt-2 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-semibold hover:bg-primary/15 transition-colors"
                    >
                      <TrendingUp className="w-3 h-3" />
                      Depositar
                    </motion.button>
                  )}
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
