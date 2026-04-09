import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, TrendingUp, Sparkles, Clock, MoreVertical, Pencil, Trash2, ArrowDownLeft, Target } from "lucide-react";
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

const CARD_BG = "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)";

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

  useEffect(() => { load(); }, [load]);

  const handleDeposit = useCallback(
    async (data: { amount: number; date: string; source?: string; account_id?: string }) => {
      if (!user || !goalId) return;
      try {
        await createGoalDeposit({ goal_id: goalId, amount: data.amount, date: data.date, source: data.source, account_id: data.account_id }, user.id);
        toast.success("Depósito realizado! 💰");
        setShowDeposit(false);
        load();
      } catch { toast.error("Erro ao depositar"); }
    },
    [user, goalId, load]
  );

  const handleWithdraw = useCallback(
    async (data: { amount: number; date: string; account_id?: string; destination?: string }) => {
      if (!user || !goalId) return;
      try {
        await createGoalWithdraw({ goal_id: goalId, amount: data.amount, date: data.date, account_id: data.account_id, destination: data.destination }, user.id);
        toast.success("Saque realizado! 💸");
        setShowWithdraw(false);
        load();
      } catch { toast.error("Erro ao sacar"); }
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
    } catch { toast.error("Erro ao excluir meta"); }
    finally { setDeletingGoal(false); }
  }, [goalId, navigate]);

  const handleDeleteDeposit = useCallback(async () => {
    if (!depositToDelete || !user || !goal) return;
    setDeletingDeposit(true);
    try {
      await deleteGoalDepositWithRefund(depositToDelete, user.id, goal.name);
      toast.success("Depósito removido");
      setDepositToDelete(null);
      load();
    } catch { toast.error("Erro ao remover depósito"); }
    finally { setDeletingDeposit(false); }
  }, [depositToDelete, user, goal, load]);

  if (loading || !goal) {
    return (
      <div className="pt-2 pb-8 space-y-4">
        <div className="h-40 rounded-2xl bg-card animate-pulse" />
        <div className="h-24 rounded-2xl bg-card animate-pulse" />
      </div>
    );
  }

  const progress = Math.min(1, goal.current_amount / goal.target_amount);
  const remaining = goal.target_amount - goal.current_amount;
  const isComplete = progress >= 1;
  const insights = computeGoalInsights(goal, transactions);
  const topInsight = insights.length > 0 ? insights[0] : null;

  let predictionText = "";
  let predictionMonths = 0;
  if (!isComplete && goal.monthly_contribution && goal.monthly_contribution > 0) {
    predictionMonths = Math.ceil(remaining / goal.monthly_contribution);
    predictionText = `~${predictionMonths} ${predictionMonths === 1 ? "mês" : "meses"}`;
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

  const totalDeposits = transactions.filter(t => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0);
  const totalWithdrawals = transactions.filter(t => Number(t.amount) < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);

  return (
    <div className="pt-2 pb-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/metas")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="relative">
          <button onClick={() => setShowMenu(v => !v)} className="w-8 h-8 rounded-xl bg-muted/20 flex items-center justify-center hover:bg-muted/30 transition-colors">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 z-50 w-40 rounded-xl border border-border/30 bg-card shadow-xl overflow-hidden"
              >
                <button onClick={() => { setShowEdit(true); setShowMenu(false); }} className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-foreground hover:bg-muted/30 transition-colors">
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" /> Editar
                </button>
                <div className="h-px bg-border/20" />
                <button onClick={() => { setShowDeleteGoal(true); setShowMenu(false); }} className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Excluir
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />}

      {/* ═══ Main Card ═══ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-2xl overflow-hidden border border-border/10" style={{ background: CARD_BG }}>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-foreground leading-tight truncate">{goal.name}</p>
              {goal.deadline && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Prazo: {format(new Date(goal.deadline + "T12:00:00"), "dd MMM yyyy", { locale: ptBR })}
                </p>
              )}
            </div>
          </div>

          <div className="h-px bg-border/10" />

          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium">Acumulado</p>
            </div>
            <p className="text-3xl font-extrabold tabular-nums tracking-tight text-foreground">
              {fmt(Number(goal.current_amount))}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              de {fmt(Number(goal.target_amount))}
            </p>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] text-muted-foreground">Progresso</p>
              <span className={`text-xs font-bold tabular-nums ${isComplete ? "text-primary" : "text-foreground"}`}>
                {Math.round(progress * 100)}%
              </span>
            </div>
            <div className="relative h-2.5 w-full rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: isComplete
                    ? "hsl(var(--primary))"
                    : "linear-gradient(90deg, hsl(var(--primary) / 0.6), hsl(var(--primary)))",
                  boxShadow: "0 0 12px hsl(var(--primary) / 0.4)",
                }}
              />
            </div>
            {remaining > 0 && !isComplete && (
              <p className="text-[10px] text-muted-foreground mt-1.5">Faltam {fmt(remaining)}</p>
            )}
            {isComplete && (
              <p className="text-[10px] text-primary mt-1.5 font-semibold">Meta concluída! 🎉</p>
            )}
          </div>

          {/* Action buttons */}
          {!isComplete && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowDeposit(true)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/10 text-primary text-[11px] font-semibold hover:bg-primary/20 transition-colors border border-primary/20"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" /> Depósito
              </button>
              <button
                onClick={() => setShowWithdraw(true)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-destructive/10 text-destructive text-[11px] font-semibold hover:bg-destructive/20 transition-colors border border-destructive/20"
              >
                <TrendingUp className="w-3.5 h-3.5" /> Saque
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* ═══ Insight ═══ */}
      {topInsight && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-start gap-2.5 rounded-2xl border border-primary/10 bg-primary/[0.04] p-3.5">
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">{topInsight}</p>
          </div>
        </motion.div>
      )}

      {/* ═══ Compact info row: Previsão + Objetivo + Depósitos + Saques ═══ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="rounded-2xl border border-border/10 p-3.5" style={{ background: CARD_BG }}>
          <div className={`grid gap-3 ${predictionText ? "grid-cols-4" : "grid-cols-3"}`}>
            {predictionText && (
              <div className="text-center">
                <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center mx-auto mb-1">
                  <Clock className="w-3 h-3 text-primary" />
                </div>
                <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Previsão</p>
                <p className="text-xs font-bold text-foreground tabular-nums mt-0.5">{predictionText}</p>
              </div>
            )}
            <div className="text-center">
              <div className="w-6 h-6 rounded-lg bg-muted/20 flex items-center justify-center mx-auto mb-1">
                <Target className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Objetivo</p>
              <p className="text-xs font-bold text-foreground tabular-nums mt-0.5">{fmt(Number(goal.target_amount))}</p>
            </div>
            <div className="text-center">
              <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center mx-auto mb-1">
                <ArrowDownLeft className="w-3 h-3 text-primary" />
              </div>
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Depósitos</p>
              <p className="text-xs font-bold text-primary tabular-nums mt-0.5">{fmt(totalDeposits)}</p>
            </div>
            <div className="text-center">
              <div className="w-6 h-6 rounded-lg bg-destructive/15 flex items-center justify-center mx-auto mb-1">
                <TrendingUp className="w-3 h-3 text-destructive" />
              </div>
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Saques</p>
              <p className="text-xs font-bold text-destructive tabular-nums mt-0.5">{fmt(totalWithdrawals)}</p>
            </div>
          </div>
          {goal.monthly_contribution && goal.monthly_contribution > 0 && (
            <p className="text-[10px] text-muted-foreground text-center mt-2.5 pt-2.5 border-t border-border/10">
              Contribuição mensal: {fmt(goal.monthly_contribution)}
            </p>
          )}
        </div>
      </motion.div>

      {/* ═══ History ═══ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="rounded-2xl border border-border/10 p-4" style={{ background: CARD_BG }}>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium mb-3">Histórico de movimentações</p>
          {transactions.length === 0 ? (
            <p className="text-[11px] text-muted-foreground text-center py-6">Nenhuma movimentação ainda</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const isWithdraw = Number(tx.amount) < 0;
                const absAmount = Math.abs(Number(tx.amount));
                return (
                  <div key={tx.id} className="flex items-center justify-between rounded-xl p-3 bg-muted/5 border border-border/10 hover:border-border/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isWithdraw ? "bg-destructive/10" : "bg-primary/10"}`}>
                        {isWithdraw ? (
                          <TrendingUp className="w-4 h-4 text-destructive" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${isWithdraw ? "text-destructive" : "text-primary"}`}>
                          {isWithdraw ? "- " : "+ "}{fmt(absAmount)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(tx.date + "T12:00:00"), "dd MMM yyyy", { locale: ptBR })}
                          {tx.source ? ` · ${tx.source}` : ""}
                          {tx.account_id && accountNames[tx.account_id] ? ` · ${accountNames[tx.account_id]}` : ""}
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
        </div>
      </motion.div>

      {/* ═══ Modals ═══ */}
      <GoalDepositModal open={showDeposit} onClose={() => setShowDeposit(false)} onSubmit={handleDeposit} goalName={goal.name} />
      <GoalWithdrawModal open={showWithdraw} onClose={() => setShowWithdraw(false)} onSubmit={handleWithdraw} goalName={goal.name} maxAmount={goal.current_amount} />
      {showEdit && <GoalEditModal open={showEdit} onClose={() => setShowEdit(false)} goal={goal} onUpdated={load} />}
      <GoalConfirmModal open={showDeleteGoal} onClose={() => setShowDeleteGoal(false)} onConfirm={handleDeleteGoal} title="Excluir meta" description={`Tem certeza que deseja excluir a meta "${goal.name}"? Esta ação não pode ser desfeita.`} confirmLabel="Excluir" loading={deletingGoal} />
      <GoalConfirmModal open={!!depositToDelete} onClose={() => setDepositToDelete(null)} onConfirm={handleDeleteDeposit} title="Remover depósito" description={depositToDelete ? getDepositDeleteDescription(depositToDelete) : ""} confirmLabel="Remover" loading={deletingDeposit} />
    </div>
  );
};

export default MetaDetalhe;
