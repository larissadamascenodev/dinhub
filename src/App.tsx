import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Index from "./pages/Index.tsx";
import Landing from "./pages/Landing.tsx";
import Success from "./pages/Success.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Upgrade from "./pages/Upgrade.tsx";
import GestaoFinanceira from "./pages/GestaoFinanceira.tsx";
import FaturaCartao from "./pages/FaturaCartao.tsx";
import Configuracoes from "./pages/Configuracoes.tsx";
import Transacoes from "./pages/Transacoes.tsx";
import ContaDetalhe from "./pages/ContaDetalhe.tsx";

import BotFinance from "./pages/BotFinance.tsx";
import BotFinanceProjecoes from "./pages/BotFinanceProjecoes.tsx";
import BotFinanceSaude from "./pages/BotFinanceSaude.tsx";
import BotFinanceBalanco from "./pages/BotFinanceBalanco.tsx";
import RadarFinanceiro from "./pages/RadarFinanceiro.tsx";
import GerenciarCategorias from "./pages/GerenciarCategorias.tsx";
import Metas from "./pages/Metas.tsx";
import MetaDetalhe from "./pages/MetaDetalhe.tsx";
import AnalyticsCategorias from "./pages/AnalyticsCategorias.tsx";
import Desafios from "./pages/Desafios.tsx";
import TermosDeUso from "./pages/TermosDeUso.tsx";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade.tsx";
import Suporte from "./pages/Suporte.tsx";
import ReceitasDespesasDetalhe from "./pages/ReceitasDespesasDetalhe.tsx";
import ParcelamentosDetalhe from "./pages/ParcelamentosDetalhe.tsx";
import CentralAjuda from "./pages/CentralAjuda.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

import { useSubscription } from "@/hooks/useSubscription";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { isSubscribed, loading: subLoading, status } = useSubscription();

  if (authLoading || subLoading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // If not subscribed and not trialing, redirect to upgrade page unless already there
  if (!isSubscribed && window.location.pathname !== "/upgrade") {
     return <Navigate to="/upgrade" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/obrigado" element={<Success />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/termos-de-uso" element={<TermosDeUso />} />
            <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Index />} />
              <Route path="/transacoes" element={<Transacoes />} />
              <Route path="/detalhe/:tipo" element={<ReceitasDespesasDetalhe />} />
              <Route path="/gestao" element={<GestaoFinanceira />} />
              <Route path="/fatura/:cardId" element={<FaturaCartao />} />
              <Route path="/conta/:accountId" element={<ContaDetalhe />} />
              
              <Route path="/bot-finance" element={<BotFinance />} />
              <Route path="/bot-finance/projecoes" element={<BotFinanceProjecoes />} />
              <Route path="/bot-finance/saude" element={<BotFinanceSaude />} />
              <Route path="/bot-finance/balanco" element={<BotFinanceBalanco />} />
              <Route path="/bot-finance/radar" element={<RadarFinanceiro />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/categorias" element={<GerenciarCategorias />} />
              <Route path="/metas" element={<Metas />} />
              <Route path="/metas/:goalId" element={<MetaDetalhe />} />
              <Route path="/analytics/categorias" element={<AnalyticsCategorias />} />
              <Route path="/desafios" element={<Desafios />} />
              <Route path="/parcelamentos" element={<ParcelamentosDetalhe />} />
              <Route path="/suporte" element={<Suporte />} />
              <Route path="/ajuda" element={<CentralAjuda />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
