export interface Transaction {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  type: "receita" | "despesa";
  status?: "pago" | "pendente";
}

export interface CategoryExpense {
  name: string;
  amount: number;
  color: string;
  icon: string;
}

export interface FinanceEvent {
  id: string;
  name: string;
  category: string;
  date: string;
  rawDate?: string;
  amount: number;
  status: "pago" | "pendente" | "atrasado" | "recebido";
  type?: "receita" | "despesa";
  isTransaction?: boolean;
}

export interface DailyBehavior {
  today_spent: number;
  average: number;
  status: "controlled" | "normal" | "above_average";
}

export interface DashboardData {
  saldoAtual: number;
  saldoPrevisto: number;
  receitas: number;
  despesas: number;
  balanco: number;
  gastosHoje: number;
  mediaGastosDiarios: number;
  status: "safe" | "warning" | "danger";
  dailyBehavior: DailyBehavior;
  projection: {
    nextMonthBalance: number;
    avgIncome3m: number;
    avgExpense3m: number;
  };
  transactions: Transaction[];
  categories: CategoryExpense[];
  events: FinanceEvent[];
  pendingTransactions: Transaction[];
}

export const SAMPLE_DATA: DashboardData = {
  saldoAtual: 0,
  saldoPrevisto: 0,
  receitas: 0,
  despesas: 0,
  balanco: 0,
  gastosHoje: 0,
  mediaGastosDiarios: 0,
  status: "safe",
  dailyBehavior: { today_spent: 0, average: 0, status: "controlled" },
  projection: {
    nextMonthBalance: 0,
    avgIncome3m: 0,
    avgExpense3m: 0,
  },
  transactions: [],
  categories: [],
  events: [],
  pendingTransactions: [],
};
