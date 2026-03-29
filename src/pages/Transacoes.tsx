import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import {
  SlidersHorizontal, ShoppingCart, Heart, Car, Utensils, Home as HomeIcon,
  Briefcase, GraduationCap, Shirt, TrendingUp, DollarSign, MoreHorizontal,
  Trash2, RefreshCw, Layers, X, Search, Plus, Pencil, CreditCard, Wallet,
  Sparkles, Calendar as CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMonth } from "@/contexts/MonthContext";
import { deleteTransaction, getAccounts, updateTransaction } from "@/services/transactionService";
import { getRecurringForMonth, excludeRecurringForMonth, excludeRecurringFromMonthOnward } from "@/services/recurringService";
import MonthSelector from "@/components/dashboard/MonthSelector";
import SaldoCard from "@/components/dashboard/SaldoCard";
import ReceitasDespesasCards from "@/components/dashboard/ReceitasDespesasCards";
import NovaTransacaoModal from "@/components/dashboard/NovaTransacaoModal";
import TransactionTypeChooser from "@/components/dashboard/TransactionTypeChooser";

// ── Types ──────────────────────────────────────────────
type TransactionRow = {
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
};

type AccountRow = { id: string; name: string; type: string; is_default: boolean; color: string | null };

// ── Helpers ────────────────────────────────────────────
const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const WEEKDAYS = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"];
const MONTHS_FULL = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const CATEGORY_ICONS: Record<string, typeof ShoppingCart> = {
  "Alimentação": Utensils, "Transporte": Car, "Moradia": HomeIcon,
  "Saúde": Heart, "Educação": GraduationCap, "Vestuário": Shirt,
  "Salário": DollarSign, "Freelance": Briefcase, "Investimentos": TrendingUp,
  "Supermercado": ShoppingCart, "Lazer": Sparkles, "Assinaturas": CreditCard,
  "Pets": Heart, "Beleza": Sparkles, "Presentes": Sparkles,
  "Viagem": Car, "Tecnologia": Sparkles, "Impostos": Wallet,
  "Vendas": DollarSign, "Aluguéis": HomeIcon, "Bônus": DollarSign,
  "Comissão": DollarSign, "Mesada": Wallet,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Alimentação": "0 60% 50%", "Transporte": "199 70% 48%", "Moradia": "150 100% 45%",
  "Saúde": "150 100% 45%", "Educação": "40 80% 50%", "Vestuário": "280 60% 55%",
  "Salário": "150 100% 45%", "Freelance": "199 70% 48%", "Investimentos": "150 100% 45%",
  "Supermercado": "150 100% 45%", "Lazer": "40 80% 50%", "Assinaturas": "280 60% 55%",
  "Pets": "30 80% 55%", "Beleza": "320 60% 55%", "Presentes": "340 60% 55%",
  "Viagem": "199 70% 48%", "Tecnologia": "220 70% 55%", "Impostos": "0 60% 50%",
  "Vendas": "150 100% 45%", "Aluguéis": "40 80% 50%", "Bônus": "150 100% 45%",
  "Comissão": "199 70% 48%", "Mesada": "150 100% 45%",
};

const getCategoryIcon = (category: string) => CATEGORY_ICONS[category] || MoreHorizontal;
const getCategoryColor = (category: string) => CATEGORY_COLORS[category] || "220 10% 55%";

const formatDateHeader = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const weekday = WEEKDAYS[date.getDay()];
  const month = MONTHS_FULL[date.getMonth()];
  const label = `${weekday}, ${d} De ${month}`;
  return { label, isToday };
};

type TabFilter = "todos" | "receita" | "despesa";

// ── Swipeable Transaction Item ─────────────────────────
const SwipeableItem = ({
  tx,
  accountName,
  onDelete,
  onEdit,
}: {
  tx: TransactionRow;
  accountName: string;
  onDelete: (id: string) => void;
  onEdit: (tx: TransactionRow) => void;
}) => {
  const x = useMotionValue(0);
  const editOpacity = useTransform(x, [0, 60, 120], [0, 0.5, 1]);
  const deleteOpacity = useTransform(x, [-120, -60, 0], [1, 0.5, 0]);
  const isReceita = tx.type === "receita";
  const catColor = getCategoryColor(tx.category);
  const CatIcon = getCategoryIcon(tx.category);
  const isRecurring = tx.recurrence_type === "fixa" || (tx.installments && tx.installments > 1);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onEdit(tx);
    } else if (info.offset.x < -100) {
      onDelete(tx.id);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Background actions */}
      <div className="absolute inset-0 flex">
        <motion.div
          style={{ opacity: editOpacity }}
          className="flex items-center justify-start pl-4 w-1/2 bg-primary/20"
        >
          <Pencil className="w-4 h-4 text-primary" />
        </motion.div>
        <motion.div
          style={{ opacity: deleteOpacity }}
          className="flex items-center justify-end pr-4 w-1/2 ml-auto bg-destructive/20"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </motion.div>
      </div>

      {/* Draggable card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative flex items-center gap-3 px-4 py-3.5 bg-card/95 backdrop-blur-xl cursor-grab active:cursor-grabbing"
        onClick={() => onEdit(tx)}
        whileTap={{ scale: 0.99 }}
      >
        {/* Category icon */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `hsl(${catColor} / 0.12)` }}
        >
          <CatIcon className="w-[18px] h-[18px]" style={{ color: `hsl(${catColor})` }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-bold text-foreground truncate">{tx.name}</p>
            <span
              className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${
                tx.status === "pago"
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-warning/10 text-warning border-warning/20"
              }`}
            >
              {tx.status === "pago" ? "Pago" : "Pendente"}
            </span>
            {isRecurring && <RefreshCw className="w-3 h-3 text-muted-foreground/30" />}
          </div>
          <p className="text-[10px] text-muted-foreground/40 mt-0.5">
            {tx.category}
            {tx.installments && tx.installment_current ? ` · ${tx.installment_current}/${tx.installments}x` : ""}
            {" · "}
            {accountName}
          </p>
        </div>

        {/* Amount */}
        <p
          className="text-sm font-bold tabular-nums shrink-0"
          style={{ color: isReceita ? "hsl(var(--primary))" : "hsl(var(--destructive))" }}
        >
          {fmt(tx.amount)}
        </p>
      </motion.div>
    </div>
  );
};

// ── Edit Modal ─────────────────────────────────────────
const EditTransactionModal = ({
  open,
  tx,
  onClose,
  onSave,
}: {
  open: boolean;
  tx: TransactionRow | null;
  onClose: () => void;
  onSave: () => void;
}) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tx) {
      setName(tx.name);
      setAmount(tx.amount.toString());
      setCategory(tx.category);
      setStatus(tx.status);
    }
  }, [tx]);

  const handleSave = async () => {
    if (!tx) return;
    setSaving(true);
    try {
      await updateTransaction(tx.id, {
        name,
        amount: parseFloat(amount),
        category,
        status: status as "pago" | "pendente",
      });
      toast.success("Transação atualizada");
      onSave();
      onClose();
    } catch {
      toast.error("Erro ao atualizar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && tx && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md mx-0 md:mx-4 rounded-t-3xl md:rounded-2xl bg-card border border-border/20 shadow-2xl p-5 pb-24 md:pb-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Editar Transação</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-semibold">Nome</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 h-10 px-3 rounded-xl bg-muted/30 border border-border/20 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-semibold">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full mt-1 h-10 px-3 rounded-xl bg-muted/30 border border-border/20 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-semibold">Categoria</label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 h-10 px-3 rounded-xl bg-muted/30 border border-border/20 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-semibold">Status</label>
                <div className="flex gap-2 mt-1">
                  {["pago", "pendente"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        status === s
                          ? s === "pago"
                            ? "bg-primary/15 text-primary border-primary/30"
                            : "bg-warning/15 text-warning border-warning/30"
                          : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"
                      }`}
                    >
                      {s === "pago" ? "Pago" : "Pendente"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-muted-foreground bg-muted/30 border border-border/20 hover:bg-muted/50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Main Page ──────────────────────────────────────────
const Transacoes = () => {
  const { user } = useAuth();
  const { selectedMonth, selectedYear, setMonth } = useMonth();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("todos");
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterAccount, setFilterAccount] = useState("todos");

  // Modals
  const [showTypeChooser, setShowTypeChooser] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newModalType, setNewModalType] = useState<"receita" | "despesa">("despesa");
  const [editTx, setEditTx] = useState<TransactionRow | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TransactionRow | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const accountMap = useMemo(() => {
    const map: Record<string, string> = {};
    accounts.forEach((a) => (map[a.id] = a.name));
    return map;
  }, [accounts]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const start = new Date(selectedYear, selectedMonth, 1).toISOString().split("T")[0];
    const end = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split("T")[0];

    const [txRes, accRes, recurringTxs] = await Promise.all([
      supabase.from("transactions").select("*").eq("user_id", user.id).gte("date", start).lte("date", end).order("date", { ascending: false }),
      getAccounts(),
      getRecurringForMonth(selectedMonth, selectedYear),
    ]);

    if (txRes.error) toast.error("Erro ao carregar transações");
    else {
      const baseTxs = (txRes.data as TransactionRow[]) ?? [];
      // Materialize recurring with adjusted date
      const materializedRecurring = recurringTxs.map((t: any) => ({
        ...t,
        date: `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(new Date(t.date).getDate()).padStart(2, "0")}`,
        _isRecurringMaterialized: true,
      })) as TransactionRow[];
      setTransactions([...baseTxs, ...materializedRecurring]);
    }
    setAccounts(accRes as AccountRow[]);
    setLoading(false);
  }, [user, selectedMonth, selectedYear]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Refresh when a transaction is created globally
  useEffect(() => {
    const handler = () => fetchData();
    window.addEventListener("transaction-created", handler);
    return () => window.removeEventListener("transaction-created", handler);
  }, [fetchData]);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (activeTab !== "todos" && tx.type !== activeTab) return false;
      if (filterCategory !== "todos" && tx.category !== filterCategory) return false;
      if (filterStatus !== "todos" && tx.status !== filterStatus) return false;
      if (filterAccount !== "todos" && tx.account_id !== filterAccount) return false;
      if (search && !tx.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, activeTab, filterCategory, filterStatus, filterAccount, search]);

  const totals = useMemo(() => {
    const receitas = filtered.filter((t) => t.type === "receita").reduce((s, t) => s + t.amount, 0);
    const despesas = filtered.filter((t) => t.type === "despesa").reduce((s, t) => s + t.amount, 0);
    const receitasRecebidas = filtered.filter((t) => t.type === "receita" && t.status === "pago").reduce((s, t) => s + t.amount, 0);
    const despesasPagas = filtered.filter((t) => t.type === "despesa" && t.status === "pago").reduce((s, t) => s + t.amount, 0);
    return {
      receitas,
      despesas,
      receitasRecebidas,
      receitasPendentes: receitas - receitasRecebidas,
      despesasPagas,
      despesasPendentes: despesas - despesasPagas,
      saldo: receitasRecebidas - despesasPagas,
    };
  }, [filtered]);

  const grouped = useMemo(() => {
    const groups: Record<string, TransactionRow[]> = {};
    filtered.forEach((tx) => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const categories = useMemo(() => {
    return [...new Set(transactions.map((t) => t.category))].sort();
  }, [transactions]);

  const handleDelete = async (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (tx && tx.recurrence_type === "fixa") {
      setDeleteTarget(tx);
      setShowDeleteDialog(true);
      return;
    }
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success("Transação removida");
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const handleDeleteFixaThisMonth = async () => {
    if (!deleteTarget || !user) return;
    try {
      await excludeRecurringForMonth(deleteTarget.id, selectedMonth, selectedYear, user.id);
      toast.success("Receita fixa removida deste mês");
      setShowDeleteDialog(false);
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const handleDeleteFixaAllFuture = async () => {
    if (!deleteTarget || !user) return;
    try {
      await excludeRecurringFromMonthOnward(deleteTarget.id, selectedMonth, selectedYear, user.id);
      toast.success("Receita fixa removida deste mês e de todos os futuros");
      setShowDeleteDialog(false);
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const handleTypeSelected = (type: "receita" | "despesa") => {
    setNewModalType(type);
    setShowTypeChooser(false);
    setShowNewModal(true);
  };

  const activeFiltersCount = [filterCategory !== "todos", filterStatus !== "todos", filterAccount !== "todos"].filter(Boolean).length;

  const clearFilters = () => {
    setFilterCategory("todos");
    setFilterStatus("todos");
    setFilterAccount("todos");
    setSearch("");
  };

  const getDayTotal = (txs: TransactionRow[]) => {
    const rec = txs.filter((t) => t.type === "receita").reduce((s, t) => s + t.amount, 0);
    const desp = txs.filter((t) => t.type === "despesa").reduce((s, t) => s + t.amount, 0);
    return { rec, desp, net: rec - desp };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-lg font-bold text-foreground">Transações</h1>
        <MonthSelector selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={(m, y) => setMonth(m, y)} />
      </div>

      {/* Summary - desktop */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hidden md:grid grid-cols-[1.4fr_1fr] gap-3">
        <SaldoCard saldoAtual={totals.saldo} saldoPrevisto={totals.saldo} />
        <ReceitasDespesasCards receitas={totals.receitas} receitasRecebidas={totals.receitasRecebidas} receitasPendentes={totals.receitasPendentes} despesas={totals.despesas} despesasPagas={totals.despesasPagas} despesasPendentes={totals.despesasPendentes} />
      </motion.div>
      {/* Summary - mobile */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden space-y-2">
        <SaldoCard saldoAtual={totals.saldo} saldoPrevisto={totals.saldo} mobile />
        <ReceitasDespesasCards receitas={totals.receitas} receitasRecebidas={totals.receitasRecebidas} receitasPendentes={totals.receitasPendentes} despesas={totals.despesas} despesasPagas={totals.despesasPagas} despesasPendentes={totals.despesasPendentes} mobile />
      </motion.div>

      {/* Tabs + Search + Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {([
              { key: "todos" as TabFilter, label: "Todos" },
              { key: "receita" as TabFilter, label: "Receitas" },
              { key: "despesa" as TabFilter, label: "Despesas" },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-semibold transition-colors relative ${
                  activeTab === tab.key ? "text-foreground" : "text-muted-foreground/50 hover:text-muted-foreground/70"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="tx-tab-underline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              activeFiltersCount > 0 || showFilters
                ? "text-primary bg-primary/10"
                : "text-muted-foreground/40 hover:text-muted-foreground/60"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
          <input
            type="text"
            placeholder="Buscar transação..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-8 pr-3 rounded-xl bg-card border border-border/30 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3 h-3 text-muted-foreground/40" />
            </button>
          )}
        </div>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Filtros</span>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-[10px] text-primary hover:underline">Limpar</button>
                )}
              </div>

              {/* Status */}
              <div>
                <p className="text-[10px] text-muted-foreground/50 mb-1.5">Status</p>
                <div className="flex gap-1.5">
                  {["todos", "pago", "pendente"].map((s) => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        filterStatus === s ? "bg-accent text-foreground border border-border/30" : "bg-transparent text-muted-foreground/50 border border-border/20 hover:border-border/40"
                      }`}
                    >
                      {s === "todos" ? "Todos" : s === "pago" ? "Pago" : "Pendente"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account */}
              {accounts.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground/50 mb-1.5">Conta</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => setFilterAccount("todos")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                        filterAccount === "todos" ? "bg-accent text-foreground border border-border/30" : "bg-transparent text-muted-foreground/50 border border-border/20 hover:border-border/40"
                      }`}
                    >Todas</button>
                    {accounts.map((a) => (
                      <button key={a.id} onClick={() => setFilterAccount(a.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                          filterAccount === a.id ? "bg-accent text-foreground border border-border/30" : "bg-transparent text-muted-foreground/50 border border-border/20 hover:border-border/40"
                        }`}
                      >{a.name}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category */}
              {categories.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground/50 mb-1.5">Categoria</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => setFilterCategory("todos")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                        filterCategory === "todos" ? "bg-accent text-foreground border border-border/30" : "bg-transparent text-muted-foreground/50 border border-border/20 hover:border-border/40"
                      }`}
                    >Todas</button>
                    {categories.map((c) => (
                      <button key={c} onClick={() => setFilterCategory(c)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                          filterCategory === c ? "bg-accent text-foreground border border-border/30" : "bg-transparent text-muted-foreground/50 border border-border/20 hover:border-border/40"
                        }`}
                      >{c}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-pulse text-primary text-sm">Carregando...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Layers className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground/40">Nenhuma transação encontrada</p>
          {activeFiltersCount > 0 && (
            <button onClick={clearFilters} className="text-[11px] text-primary mt-2 hover:underline">Limpar filtros</button>
          )}
        </div>
      ) : (
        <div className="relative pl-6">
          {/* Timeline line */}
          <div className="absolute left-[7px] top-3 bottom-0 w-px bg-border/30" />

          {grouped.map(([date, txs], gi) => {
            const { label, isToday } = formatDateHeader(date);
            const dayTotal = getDayTotal(txs);

            return (
              <div key={date} className={gi > 0 ? "mt-5" : ""}>
                {/* Date header */}
                <div className="relative flex items-center mb-3">
                  <div
                    className="absolute -left-6 w-3.5 h-3.5 rounded-full border-2 z-10"
                    style={{
                      borderColor: "hsl(var(--primary))",
                      background: isToday ? "hsl(var(--primary))" : "hsl(var(--background))",
                    }}
                  />
                  {isToday ? (
                    <div className="flex-1 flex items-center justify-between py-2 px-4 rounded-xl border border-primary/30" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.12) 0%, hsl(var(--primary) / 0.04) 100%)" }}>
                      <span className="text-sm font-bold text-primary">Hoje, {label}</span>
                      <span className="text-[10px] font-semibold text-muted-foreground/50">
                        {dayTotal.desp > 0 && <span className="text-destructive">−{fmt(dayTotal.desp)}</span>}
                        {dayTotal.rec > 0 && dayTotal.desp > 0 && " · "}
                        {dayTotal.rec > 0 && <span className="text-primary">+{fmt(dayTotal.rec)}</span>}
                      </span>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-muted-foreground/70">{label}</span>
                      <span className="text-[10px] font-semibold text-muted-foreground/40">
                        {dayTotal.desp > 0 && <span className="text-destructive/60">−{fmt(dayTotal.desp)}</span>}
                        {dayTotal.rec > 0 && dayTotal.desp > 0 && " · "}
                        {dayTotal.rec > 0 && <span className="text-primary/60">+{fmt(dayTotal.rec)}</span>}
                      </span>
                    </div>
                  )}
                </div>

                {/* Transactions */}
                <div className="space-y-1.5 ml-2">
                  {txs.map((tx, i) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <SwipeableItem
                        tx={tx}
                        accountName={tx.account_id ? (accountMap[tx.account_id] || "Conta") : tx.payment_method === "cartao" ? "Cartão" : "Sem conta"}
                        onDelete={handleDelete}
                        onEdit={(t) => { setEditTx(t); setShowEditModal(true); }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Count */}
      {!loading && filtered.length > 0 && (
        <p className="text-center text-[10px] text-muted-foreground/30 pt-2 pb-4">
          {filtered.length} transaç{filtered.length === 1 ? "ão" : "ões"} · {grouped.length} dia{grouped.length !== 1 && "s"}
        </p>
      )}

      {/* Modals */}
      <EditTransactionModal open={showEditModal} tx={editTx} onClose={() => { setShowEditModal(false); setEditTx(null); }} onSave={fetchData} />

      {/* Delete Fixa Dialog */}
      <AnimatePresence>
        {showDeleteDialog && deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => { setShowDeleteDialog(false); setDeleteTarget(null); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm mx-4 rounded-2xl bg-card border border-border/20 shadow-2xl p-5 space-y-4"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="text-base font-bold text-foreground">Remover transação fixa</h3>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{deleteTarget.name}</span> é uma transação fixa. Como deseja removê-la?
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleDeleteFixaThisMonth}
                  className="w-full py-3 rounded-xl text-sm font-bold text-foreground bg-muted/40 border border-border/20 hover:bg-muted/60 transition-all"
                >
                  Apagar apenas este mês
                </button>
                <button
                  onClick={handleDeleteFixaAllFuture}
                  className="w-full py-3 rounded-xl text-sm font-bold text-destructive bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-all"
                >
                  Apagar este e todos os meses futuros
                </button>
                <button
                  onClick={() => { setShowDeleteDialog(false); setDeleteTarget(null); }}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transacoes;
