import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import GestaoFinanceira from "./pages/GestaoFinanceira.tsx";
import FaturaCartao from "./pages/FaturaCartao.tsx";
import Configuracoes from "./pages/Configuracoes.tsx";
import Transacoes from "./pages/Transacoes.tsx";
import ContaDetalhe from "./pages/ContaDetalhe.tsx";
import InvestimentoDetalhe from "./pages/InvestimentoDetalhe.tsx";
import BotFinance from "./pages/BotFinance.tsx";
import BotFinanceProjecoes from "./pages/BotFinanceProjecoes.tsx";
import BotFinanceSaude from "./pages/BotFinanceSaude.tsx";
import BotFinanceBalanco from "./pages/BotFinanceBalanco.tsx";
import GerenciarCategorias from "./pages/GerenciarCategorias.tsx";
import Metas from "./pages/Metas.tsx";
import MetaDetalhe from "./pages/MetaDetalhe.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary text-lg">Carregando...</div>
      </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/" element={<Index />} />
              <Route path="/transacoes" element={<Transacoes />} />
              <Route path="/gestao" element={<GestaoFinanceira />} />
              <Route path="/fatura/:cardId" element={<FaturaCartao />} />
              <Route path="/conta/:accountId" element={<ContaDetalhe />} />
              <Route path="/investimento/:accountId" element={<InvestimentoDetalhe />} />
              <Route path="/bot-finance" element={<BotFinance />} />
              <Route path="/bot-finance/projecoes" element={<BotFinanceProjecoes />} />
              <Route path="/bot-finance/saude" element={<BotFinanceSaude />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/categorias" element={<GerenciarCategorias />} />
              <Route path="/metas" element={<Metas />} />
              <Route path="/metas/:goalId" element={<MetaDetalhe />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
