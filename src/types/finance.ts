export interface Transaction {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  type: "receita" | "despesa";
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
  date: string;
  amount: number;
  status: "pago" | "pendente" | "atrasado" | "recebido";
}

export interface DashboardData {
  saldoAtual: number;
  saldoPrevisto: number;
  receitas: number;
  despesas: number;
  balanco: number;
  gastosHoje: number;
  mediaGastosDiarios: number;
  transactions: Transaction[];
  categories: CategoryExpense[];
  events: FinanceEvent[];
}

export const SAMPLE_DATA: DashboardData = {
  saldoAtual: 0,
  saldoPrevisto: 0,
  receitas: 0,
  despesas: 0,
  balanco: 0,
  gastosHoje: 0,
  mediaGastosDiarios: 0,
  transactions: [
    { id: "1", name: "Salário", category: "Salário", date: "27 de mar.", amount: 5500, type: "receita" },
    { id: "2", name: "Supermercado Extra", category: "Alimentação", date: "27 de mar.", amount: 342.5, type: "despesa" },
    { id: "3", name: "Uber", category: "Transporte", date: "27 de mar.", amount: 28.9, type: "despesa" },
    { id: "4", name: "Farmácia", category: "Saúde", date: "27 de mar.", amount: 89, type: "despesa" },
    { id: "5", name: "Netflix", category: "Assinaturas", date: "27 de mar.", amount: 55.9, type: "despesa" },
  ],
  categories: [
    { name: "Alimentação", amount: 1450, color: "hsl(0 84% 60%)", icon: "🍽️" },
    { name: "Transporte", amount: 580, color: "hsl(25 95% 53%)", icon: "🚗" },
    { name: "Saúde", amount: 320, color: "hsl(340 75% 55%)", icon: "❤️" },
    { name: "Assinaturas", amount: 210, color: "hsl(270 60% 55%)", icon: "📦" },
    { name: "Lazer", amount: 180, color: "hsl(210 90% 55%)", icon: "🎮" },
  ],
  events: [
    { id: "1", name: "Aluguel", date: "24 de mar", amount: 1800, status: "pago" },
    { id: "2", name: "Salário", date: "25 de mar", amount: 5500, status: "recebido" },
    { id: "3", name: "Netflix", date: "26 de mar", amount: 55.9, status: "atrasado" },
    { id: "4", name: "Internet", date: "28 de mar", amount: 120, status: "pendente" },
    { id: "5", name: "Fatura Nubank", date: "30 de mar", amount: 2340, status: "pendente" },
  ],
};
