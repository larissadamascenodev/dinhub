import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MoreVertical, Pencil, Trash2, Bell, CalendarDays, Wallet, Tag, RefreshCw, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { updateTransactionStatus, updateTransaction, deleteTransaction } from "@/services/transactionService";
import { excludeRecurringForMonth, excludeRecurringFromMonthOnward } from "@/services/recurringService";

const CATEGORY_ICONS: Record<string, string> = {
  "Alimentação": "🍽️", "Transporte": "🚗", "Moradia": "🏠",
  "Saúde": "❤️", "Educação": "🎓", "Vestuário": "👔",
  "Salário": "💰", "Freelance": "💼", "Investimentos": "📈",
  "Supermercado": "🛒", "Lazer": "🎮", "Assinaturas": "📦",
  "Pets": "🐾", "Beleza": "💅", "Presentes": "🎁",
  "Viagem": "✈️", "Tecnologia": "💻", "Impostos": "📄",
  "Vendas": "💵", "Aluguéis": "🏘️", "Bônus": "🎉",
  "Comissão": "🤝", "Mesada": "👛", "Plano de Saúde": "❤️",
};

const MONTHS_FULL = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatFullDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${d} de ${MONTHS_FULL[m - 1]} de ${y}`;
};

interface TransactionRow {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  type: string;
  status: string;
  payment_method: string;
  recurrence_type: string;
  installment_current: number | null;
  installments: number | null;
  observation: string | null;
  account_id: string | null;
  credit_card_id: string | null;
}

type ModalStep = "detail" | "pay-confirm" | "delete-confirm" | "edit-scope" | "edit-form" | "menu";

interface Props {
  open: boolean;
  tx: TransactionRow | null;
  accountName: string;
  onClose: () => void;
  onRefresh: () => void;
  userId?: string;
  selectedMonth: number;
  selectedYear: number;
}

const TransactionDetailModal = ({ open, tx, accountName, onClose, onRefresh, userId, selectedMonth, selectedYear }: Props) => {
  const [step, setStep] = useState<ModalStep>("detail");
  const [loading, setLoading] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");

  if (!tx) return null;

  const isReceita = tx.type === "receita";
  const isPaid = tx.status === "pago";
  const isRecurring = tx.recurrence_type === "fixa";
  const icon = CATEGORY_ICONS[tx.category] || "📋";

  const handleClose = () => {
    setStep("detail");
    onClose();
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      await updateTransactionStatus(tx.id, "pago");
      toast.success("Transação marcada como paga");
      onRefresh();
      handleClose();
    } catch {
      toast.error("Erro ao pagar");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteTransaction(tx.id);
      toast.success("Transação excluída");
      onRefresh();
      handleClose();
    } catch {
      toast.error("Erro ao excluir");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFixaThisMonth = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await excludeRecurringForMonth(tx.id, selectedMonth, selectedYear, userId);
      toast.success("Removida deste mês");
      onRefresh();
      handleClose();
    } catch {
      toast.error("Erro ao remover");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFixaAll = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await excludeRecurringFromMonthOnward(tx.id, selectedMonth, selectedYear, userId);
      toast.success("Removida deste e dos próximos meses");
      onRefresh();
      handleClose();
    } catch {
      toast.error("Erro ao remover");
    } finally {
      setLoading(false);
    }
  };

  const openEditForm = () => {
    setEditName(tx.name);
    setEditAmount(tx.amount.toString());
    setEditCategory(tx.category);
    if (isRecurring) {
      setStep("edit-scope");
    } else {
      setStep("edit-form");
    }
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      await updateTransaction(tx.id, {
        name: editName,
        amount: parseFloat(editAmount),
        category: editCategory,
      });
      toast.success("Transação atualizada");
      onRefresh();
      handleClose();
    } catch {
      toast.error("Erro ao atualizar");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case "detail":
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <button onClick={handleClose} className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                {!isPaid && (
                  <button className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <Bell className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setStep("menu")}
                  className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Icon + Name */}
            <div className="text-center space-y-1">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-2xl"
                style={{ background: isReceita ? "hsl(var(--primary) / 0.12)" : "hsl(var(--destructive) / 0.12)" }}
              >
                {icon}
              </div>
              <h2 className="text-lg font-bold text-foreground">{tx.name}</h2>
              <p className="text-xs text-muted-foreground/60">
                {tx.payment_method === "cartao" ? "Cartão" : accountName}
              </p>
            </div>

            {/* Amount */}
            <div className="text-center">
              <p className={`text-3xl font-bold tabular-nums ${isReceita ? "text-primary" : "text-destructive"}`}>
                {fmt(tx.amount)}
              </p>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                {isRecurring && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                    <RefreshCw className="w-3 h-3" /> Fixa
                  </span>
                )}
                {tx.installments && tx.installment_current && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                    <RefreshCw className="w-3 h-3" /> {tx.installment_current}/{tx.installments}x
                  </span>
                )}
                <span
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isPaid
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-warning/10 text-warning border-warning/20"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {isPaid ? "Pago" : "Pendente"}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-0 divide-y divide-border/10">
              <div className="flex items-center gap-3 py-3.5">
                <CalendarDays className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                <div>
                  <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-semibold">Data</p>
                  <p className="text-sm font-semibold text-foreground">{formatFullDate(tx.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3.5">
                <Wallet className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                <div>
                  <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-semibold">Conta</p>
                  <p className="text-sm font-semibold text-foreground">
                    {tx.payment_method === "cartao" ? "Cartão de crédito" : accountName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3.5">
                <Tag className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                <div>
                  <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-semibold">Categoria</p>
                  <p className="text-sm font-semibold text-foreground">{tx.category}</p>
                </div>
              </div>
            </div>

            {/* Pay button */}
            {!isPaid && (
              <button
                onClick={() => setStep("pay-confirm")}
                className="w-full py-3.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                Pagar
              </button>
            )}
          </div>
        );

      case "menu":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Opções</h3>
              <button onClick={() => setStep("detail")} className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={openEditForm}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/20 border border-border/20 hover:bg-muted/40 transition-all text-left"
              >
                <Pencil className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Editar</span>
              </button>
              <button
                onClick={() => setStep("delete-confirm")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/20 border border-border/20 hover:bg-destructive/10 transition-all text-left"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
                <span className="text-sm font-semibold text-foreground">Excluir</span>
              </button>
              <button
                onClick={handleClose}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/20 border border-border/20 hover:bg-muted/40 transition-all text-left"
              >
                <X className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Fechar</span>
              </button>
            </div>
          </div>
        );

      case "pay-confirm":
        return (
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Confirmar pagamento</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Deseja marcar <span className="font-semibold text-foreground">"{tx.name}"</span> como pago?
              </p>
              <p className={`text-xl font-bold mt-2 ${isReceita ? "text-primary" : "text-destructive"}`}>
                {fmt(tx.amount)}
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {loading ? "Pagando..." : "Confirmar"}
              </button>
              <button
                onClick={() => setStep("detail")}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        );

      case "delete-confirm":
        return (
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Excluir transação</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tem certeza que deseja excluir <span className="font-semibold text-foreground">"{tx.name}"</span>? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="space-y-2">
              {isRecurring ? (
                <>
                  <button
                    onClick={handleDeleteFixaThisMonth}
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-bold bg-muted/30 text-foreground border border-border/20 hover:bg-muted/50 transition-all disabled:opacity-50"
                  >
                    Apagar apenas este mês
                  </button>
                  <button
                    onClick={handleDeleteFixaAll}
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-bold bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all disabled:opacity-50"
                  >
                    Apagar este e todos os futuros
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setStep("detail")}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-muted-foreground bg-muted/30 border border-border/20 hover:bg-muted/50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl text-sm font-bold bg-destructive text-white hover:bg-destructive/90 transition-all disabled:opacity-50"
                  >
                    {loading ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              )}
              {isRecurring && (
                <button
                  onClick={() => setStep("detail")}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        );

      case "edit-scope":
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-foreground">Editar despesa fixa</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Esta é uma despesa recorrente. Deseja editar apenas esta ocorrência ou todas as pendentes dos próximos meses?
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setStep("edit-form")}
                className="w-full py-3.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                Apenas esta
              </button>
              <button
                onClick={() => setStep("edit-form")}
                className="w-full py-3 rounded-xl text-sm font-bold text-foreground bg-muted/30 border border-border/20 hover:bg-muted/50 transition-all"
              >
                Todas as pendentes
              </button>
              <button
                onClick={() => setStep("detail")}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        );

      case "edit-form":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Editar Transação</h3>
              <button onClick={() => setStep("detail")} className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-semibold">Nome</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1 h-10 px-3 rounded-xl bg-muted/30 border border-border/20 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-semibold">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full mt-1 h-10 px-3 rounded-xl bg-muted/30 border border-border/20 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-semibold">Categoria</label>
                <input
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full mt-1 h-10 px-3 rounded-xl bg-muted/30 border border-border/20 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep("detail")}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-muted-foreground bg-muted/30 border border-border/20 hover:bg-muted/50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md mx-0 md:mx-4 rounded-t-3xl md:rounded-2xl bg-card border border-border/20 shadow-2xl p-5 pb-24 md:pb-5"
          >
            {renderContent()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransactionDetailModal;
