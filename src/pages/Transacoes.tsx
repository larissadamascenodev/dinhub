import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal, ShoppingCart, Heart, Car, Utensils, Home as HomeIcon,
  Briefcase, GraduationCap, Shirt, TrendingUp, DollarSign, MoreHorizontal,
  Trash2, RefreshCw, Layers, X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { deleteTransaction } from "@/services/transactionService";
import MonthSelector from "@/components/dashboard/MonthSelector";

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
};

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const WEEKDAYS = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"];
const MONTHS_FULL = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const CATEGORY_ICONS: Record<string, typeof ShoppingCart> = {
  "Alimentação": Utensils,
  "Transporte": Car,
  "Moradia": HomeIcon,
  "Saúde": Heart,
  "Educação": GraduationCap,
  "Vestuário": Shirt,
  "Salário": DollarSign,
  "Freelance": Briefcase,
  "Investimentos": TrendingUp,
  "Supermercado": ShoppingCart,
  "Lazer": MoreHorizontal,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Alimentação": "0 60% 50%",
  "Transporte": "199 70% 48%",
  "Moradia": "150 100% 45%",
  "Saúde": "150 100% 45%",
  "Educação": "40 80% 50%",
  "Vestuário": "280 60% 55%",
  "Salário": "150 100% 45%",
  "Freelance": "199 70% 48%",
  "Investimentos": "150 100% 45%",
  "Supermercado": "150 100% 45%",
  "Lazer": "40 80% 50%",
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

const Transacoes = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>("todos");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const start = new Date(selectedYear, selectedMonth, 1).toISOString().split("T")[0];
    const end = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar transações");
    } else {
      setTransactions((data as TransactionRow[]) ?? []);
    }
    setLoading(false);
  }, [user, selectedMonth, selectedYear]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (activeTab !== "todos" && tx.type !== activeTab) return false;
      if (filterCategory !== "todos" && tx.category !== filterCategory) return false;
      if (filterStatus !== "todos" && tx.status !== filterStatus) return false;
      return true;
    });
  }, [transactions, activeTab, filterCategory, filterStatus]);

  const grouped = useMemo(() => {
    const groups: Record<string, TransactionRow[]> = {};
    filtered.forEach((tx) => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success("Transação removida");
    } catch {
      toast.error("Erro ao remover");
    }
  };

  const activeFiltersCount = [filterCategory !== "todos", filterStatus !== "todos"].filter(Boolean).length;

  return (
    <div className="space-y-0">
      {/* Top bar: tabs + month + filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-0">
          {([
            { key: "todos", label: "Todos" },
            { key: "receita", label: "Receitas" },
            { key: "despesa", label: "Despesas" },
          ] as { key: TabFilter; label: string }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-semibold transition-colors relative ${
                activeTab === tab.key
                  ? "text-foreground"
                  : "text-muted-foreground/50 hover:text-muted-foreground/70"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <MonthSelector selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }} />
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
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="overflow-hidden mb-4"
          >
            <div className="glass-card p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Filtros</span>
                {activeFiltersCount > 0 && (
                  <button onClick={() => { setFilterCategory("todos"); setFilterStatus("todos"); }} className="text-[10px] text-primary hover:underline">Limpar</button>
                )}
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground/50 mb-1.5">Status</p>
                <div className="flex gap-1.5">
                  {["todos", "pago", "pendente"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        filterStatus === s
                          ? "bg-accent text-foreground border border-border/30"
                          : "bg-transparent text-muted-foreground/50 border border-border/20 hover:border-border/40"
                      }`}
                    >
                      {s === "todos" ? "Todos" : s === "pago" ? "Pago" : "Pendente"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground/50 mb-1.5">Categoria</p>
                <div className="flex flex-wrap gap-1.5">
                  {["todos", "Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Vestuário", "Salário", "Freelance", "Investimentos", "Outros"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setFilterCategory(c)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                        filterCategory === c
                          ? "bg-accent text-foreground border border-border/30"
                          : "bg-transparent text-muted-foreground/50 border border-border/20 hover:border-border/40"
                      }`}
                    >
                      {c === "todos" ? "Todas" : c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-pulse text-primary text-sm">Carregando...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-8 text-center mt-4">
          <Layers className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground/40">Nenhuma transação encontrada</p>
        </div>
      ) : (
        <div className="relative pl-6">
          {/* Timeline line */}
          <div className="absolute left-[7px] top-3 bottom-0 w-px bg-border/30" />

          {grouped.map(([date, txs], gi) => {
            const { label, isToday } = formatDateHeader(date);
            return (
              <div key={date} className={gi > 0 ? "mt-5" : ""}>
                {/* Date header with dot */}
                <div className="relative flex items-center mb-3">
                  <div
                    className="absolute -left-6 w-3.5 h-3.5 rounded-full border-2 z-10"
                    style={{
                      borderColor: "hsl(var(--primary))",
                      background: isToday ? "hsl(var(--primary))" : "hsl(var(--background))",
                    }}
                  />
                  {isToday ? (
                    <div className="flex-1 py-2 px-4 rounded-xl border border-primary/30" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.12) 0%, hsl(var(--primary) / 0.04) 100%)" }}>
                      <span className="text-sm font-bold text-primary">Hoje, {label}</span>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-muted-foreground/70">{label}</span>
                  )}
                </div>

                {/* Transactions */}
                <div className="space-y-2 ml-2">
                  {txs.map((tx, i) => {
                    const isReceita = tx.type === "receita";
                    const catColor = getCategoryColor(tx.category);
                    const CatIcon = getCategoryIcon(tx.category);
                    const isRecurring = tx.recurrence_type === "fixa" || (tx.installments && tx.installments > 1);

                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="group flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-card/60 transition-all cursor-default"
                      >
                        {/* Category icon */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: `hsl(${catColor} / 0.12)` }}
                        >
                          <CatIcon className="w-4.5 h-4.5" style={{ color: `hsl(${catColor})` }} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-foreground truncate">{tx.name}</p>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                tx.status === "pago"
                                  ? "bg-primary/10 text-primary border-primary/20"
                                  : "bg-warning/10 text-warning border-warning/20"
                              }`}
                            >
                              {tx.status === "pago" ? "Pago" : "Pendente"}
                            </span>
                            {isRecurring && (
                              <RefreshCw className="w-3 h-3 text-muted-foreground/30" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                            {tx.category}
                            {tx.installments && tx.installment_current ? ` · ${tx.installment_current}/${tx.installments}x` : ""}
                            {" · "}
                            {tx.payment_method === "cartao" ? "Cartão" : "Sem conta"}
                          </p>
                        </div>

                        {/* Amount + delete */}
                        <div className="flex items-center gap-2 shrink-0">
                          <p
                            className="text-sm font-bold tabular-nums"
                            style={{ color: isReceita ? "hsl(var(--primary))" : "hsl(var(--destructive))" }}
                          >
                            {fmt(tx.amount)}
                          </p>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/30 hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Transacoes;
