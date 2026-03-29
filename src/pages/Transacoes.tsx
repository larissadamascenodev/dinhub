import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ArrowUpRight, ArrowDownRight, Trash2, Calendar, ChevronDown, X, Layers } from "lucide-react";
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
};

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${d} ${months[m - 1]} ${y}`;
};

const CATEGORIES = [
  "Alimentação", "Transporte", "Moradia", "Lazer", "Saúde", "Educação",
  "Vestuário", "Salário", "Freelance", "Investimentos", "Outros",
];

type FilterType = "todos" | "receita" | "despesa";
type FilterStatus = "todos" | "pago" | "pendente";

const Transacoes = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("todos");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("todos");
  const [filterCategory, setFilterCategory] = useState<string>("todos");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterType !== "todos" && tx.type !== filterType) return false;
      if (filterStatus !== "todos" && tx.status !== filterStatus) return false;
      if (filterCategory !== "todos" && tx.category !== filterCategory) return false;
      if (search && !tx.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, filterType, filterStatus, filterCategory, search]);

  const totals = useMemo(() => {
    const receitas = filtered.filter(t => t.type === "receita").reduce((s, t) => s + t.amount, 0);
    const despesas = filtered.filter(t => t.type === "despesa").reduce((s, t) => s + t.amount, 0);
    return { receitas, despesas, saldo: receitas - despesas };
  }, [filtered]);

  const grouped = useMemo(() => {
    const groups: Record<string, TransactionRow[]> = {};
    filtered.forEach((tx) => {
      const key = tx.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
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

  const activeFiltersCount = [filterType !== "todos", filterStatus !== "todos", filterCategory !== "todos"].filter(Boolean).length;

  const clearFilters = () => {
    setFilterType("todos");
    setFilterStatus("todos");
    setFilterCategory("todos");
    setSearch("");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold text-foreground">Transações</h1>
          <p className="text-[10px] text-muted-foreground">{filtered.length} transações encontradas</p>
        </div>
        <MonthSelector selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card p-3">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Receitas</p>
          <p className="text-sm font-bold text-primary mt-0.5">{fmt(totals.receitas)}</p>
        </div>
        <div className="glass-card p-3">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Despesas</p>
          <p className="text-sm font-bold text-destructive mt-0.5">{fmt(totals.despesas)}</p>
        </div>
        <div className="glass-card p-3">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Saldo</p>
          <p className={`text-sm font-bold mt-0.5 ${totals.saldo >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(totals.saldo)}</p>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
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
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`h-9 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-medium transition-all ${
            activeFiltersCount > 0
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-card border-border/30 text-muted-foreground/60 hover:text-foreground"
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
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

              {/* Type filter */}
              <div>
                <p className="text-[10px] text-muted-foreground/50 mb-1.5">Tipo</p>
                <div className="flex gap-1.5">
                  {(["todos", "receita", "despesa"] as FilterType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        filterType === t
                          ? t === "receita" ? "bg-primary/15 text-primary border border-primary/30"
                          : t === "despesa" ? "bg-destructive/15 text-destructive border border-destructive/30"
                          : "bg-accent text-foreground border border-border/30"
                          : "bg-transparent text-muted-foreground/50 border border-border/20 hover:border-border/40"
                      }`}
                    >
                      {t === "todos" ? "Todos" : t === "receita" ? "Receitas" : "Despesas"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status filter */}
              <div>
                <p className="text-[10px] text-muted-foreground/50 mb-1.5">Status</p>
                <div className="flex gap-1.5">
                  {(["todos", "pago", "pendente"] as FilterStatus[]).map((s) => (
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

              {/* Category filter */}
              <div>
                <p className="text-[10px] text-muted-foreground/50 mb-1.5">Categoria</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setFilterCategory("todos")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                      filterCategory === "todos"
                        ? "bg-accent text-foreground border border-border/30"
                        : "bg-transparent text-muted-foreground/50 border border-border/20 hover:border-border/40"
                    }`}
                  >
                    Todas
                  </button>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setFilterCategory(c)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                        filterCategory === c
                          ? "bg-accent text-foreground border border-border/30"
                          : "bg-transparent text-muted-foreground/50 border border-border/20 hover:border-border/40"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-pulse text-primary text-sm">Carregando...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Layers className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground/40">Nenhuma transação encontrada</p>
          {activeFiltersCount > 0 && (
            <button onClick={clearFilters} className="text-[11px] text-primary mt-2 hover:underline">
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([date, txs]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-3 h-3 text-muted-foreground/30" />
                <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
                  {formatDate(date)}
                </span>
                <div className="flex-1 h-px bg-border/20" />
              </div>
              <div className="space-y-1.5">
                {txs.map((tx, i) => {
                  const isReceita = tx.type === "receita";
                  const Icon = isReceita ? ArrowUpRight : ArrowDownRight;
                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group flex items-center gap-3 px-4 py-3 rounded-[14px] bg-card/90 backdrop-blur-xl border border-border/30 shadow-lg shadow-black/20 hover:border-border/50 transition-all"
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: isReceita ? "hsl(var(--primary) / 0.1)" : "hsl(var(--destructive) / 0.1)" }}
                      >
                        <Icon className="w-4 h-4" style={{ color: isReceita ? "hsl(var(--primary))" : "hsl(var(--destructive))" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[13px] font-semibold text-foreground truncate">{tx.name}</p>
                          {tx.status === "pendente" && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-warning/15 text-warning border border-warning/20">
                              Pendente
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground/40 mt-px">
                          {tx.category}
                          {tx.installments && tx.installment_current
                            ? ` · ${tx.installment_current}/${tx.installments}x`
                            : ""}
                        </p>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-2">
                        <p className="text-[13px] font-bold tabular-nums" style={{ color: isReceita ? "hsl(var(--primary))" : "hsl(var(--destructive))" }}>
                          {isReceita ? "+" : "−"}{fmt(tx.amount)}
                        </p>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Transacoes;
