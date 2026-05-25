import { useState, useCallback, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import BotFinanceTools from "@/components/dashboard/BotFinanceTools";
import WalletSummaryCard from "@/components/dashboard/WalletSummaryCard";
import { useGreeting } from "@/components/dashboard/DashboardHeader";
import SaldoCard from "@/components/dashboard/SaldoCard";
import ReceitasDespesasCards from "@/components/dashboard/ReceitasDespesasCards";
import SaldoWalletCarousel from "@/components/dashboard/SaldoWalletCarousel";
import TransacoesRecentes from "@/components/dashboard/TransacoesRecentes";
import ProximosEventos from "@/components/dashboard/ProximosEventos";
import AssinaturasCard from "@/components/dashboard/AssinaturasCard";
import GastosPorCategoria from "@/components/dashboard/GastosPorCategoria";
import GastosSemanaisCard from "@/components/dashboard/GastosSemanaisCard";

import MetasResumoCard from "@/components/dashboard/MetasResumoCard";
import ParcelamentosAtivosCard from "@/components/dashboard/ParcelamentosAtivosCard";
import MonthSelector from "@/components/dashboard/MonthSelector";
import PagarEditarModal from "@/components/dashboard/PagarEditarModal";
import OnboardingCard from "@/components/dashboard/OnboardingCard";
import { useAuth } from "@/contexts/AuthContext";
import { useMonth } from "@/contexts/MonthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import type { Profile } from "@/hooks/useProfile";
import type { FinanceEvent } from "@/types/finance";

interface IndexOutletContext {
  profile: Profile | null;
  refetch: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  isOnboardingComplete: boolean;
}

const Index = () => {
  const { selectedMonth, selectedYear, setMonth } = useMonth();
  const [selectedEvent, setSelectedEvent] = useState<FinanceEvent | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, refetch } = useFinanceData(selectedMonth, selectedYear, { includeHistorical: false });
  const { profile, refetch: refetchProfile, updateDisplayName, isOnboardingComplete } = useOutletContext<IndexOutletContext>();
  const handleNovaTransacao = useCallback(() => {
    // Dispatch event to open the global type chooser
    window.dispatchEvent(new CustomEvent("open-nova-transacao-direct", { detail: { type: "despesa" } }));
  }, []);

  // Listen for global transaction-created event to refresh data
  useEffect(() => {
    const handleCreated = () => {
      refetch();
      refetchProfile();
    };
    window.addEventListener("transaction-created", handleCreated);
    return () => window.removeEventListener("transaction-created", handleCreated);
  }, [refetch, refetchProfile]);
  const { greeting, dateStr } = useGreeting();
  const userName = profile?.display_name || (user?.email?.split("@")[0] ?? "Usuário");

  const handleMonthChange = (month: number, year: number) => {
    setMonth(month, year);
  };

  const handleEventClick = (event: FinanceEvent) => {
    setSelectedEvent(event);
    setShowPayModal(true);
  };

  const receitas = data.receitas;
  const despesas = data.despesas;
  const balanco = receitas - despesas;
  const saldoMes = data.saldoAtual;
  const saldoPrevisto = data.saldoPrevisto;
  const isFutureMonth = data.isFutureMonth;

  const now = new Date();
  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

  // Only show full loading screen on very first load (no data at all yet)
  const isFirstLoad = loading && data === undefined;
  if (isFirstLoad) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-primary text-lg">Carregando dados...</div>
      </div>
    );
  }

  return (
    <>

        {/* DESKTOP/TABLET LAYOUT - Bento Grid */}
        <div className="hidden md:grid md:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column: Summary & Insights */}
          <div className="md:col-span-12 lg:col-span-8 space-y-6 lg:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="pl-0.5"
              >
                <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                   {greeting}, <span className="text-primary/90">{userName}</span>
                </h1>
                <p className="text-xs lg:text-sm font-medium text-white/30 uppercase tracking-[0.2em] mt-2">{dateStr}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <MonthSelector selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={handleMonthChange} />
              </motion.div>
            </div>

            {profile && !isOnboardingComplete && (
              <OnboardingCard
                profile={profile}
                onUpdateName={updateDisplayName}
                onGoToAccounts={() => navigate("/gestao")}
                onCreateTransaction={handleNovaTransacao}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
               >
                  {data.categories.length > 0 && (
                    <GastosPorCategoria
                      categories={data.categories}
                      selectedMonth={selectedMonth}
                      onVerAnalise={() => navigate("/transacoes")}
                    />
                  )}
               </motion.div>
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
               >
                 <TransacoesRecentes transactions={data.transactions} onDelete={refetch} />
               </motion.div>
            </div>
            
          </div>

          <div className="md:col-span-12 lg:col-span-4 space-y-6 lg:space-y-8">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
              <WalletSummaryCard />
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-6">
              {isCurrentMonth && <GastosSemanaisCard />}
              <ProximosEventos events={data.events} selectedMonth={selectedMonth} selectedYear={selectedYear} onEventClick={handleEventClick} />
            </motion.div>
          </div>
        </div>

        {/* MOBILE LAYOUT */}
        <div className="md:hidden space-y-6">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="pl-0.5"
            >
              <h1 className="font-display text-xl font-extrabold tracking-tight text-white leading-tight">
                {greeting}, <span className="text-primary">{userName}</span>
              </h1>
              <p className="text-[10px] font-medium text-white/30 uppercase tracking-[0.2em] mt-1">{dateStr}</p>
            </motion.div>
            <MonthSelector selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={handleMonthChange} />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <WalletSummaryCard />
          </motion.div>

          {profile && !isOnboardingComplete && (
            <OnboardingCard
              profile={profile}
              onUpdateName={updateDisplayName}
              onGoToAccounts={() => navigate("/gestao")}
              onCreateTransaction={handleNovaTransacao}
            />
          )}
          
          {isCurrentMonth && <GastosSemanaisCard />}
          
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] ml-1">Próximos compromissos</p>
            <ProximosEventos events={data.events} selectedMonth={selectedMonth} selectedYear={selectedYear} onEventClick={handleEventClick} />
          </div>

          {data.categories.length > 0 && (
            <GastosPorCategoria categories={data.categories} selectedMonth={selectedMonth} onVerAnalise={() => navigate("/transacoes")} />
          )}
          
          <TransacoesRecentes transactions={data.transactions} onDelete={refetch} />
        </div>
      <PagarEditarModal
        open={showPayModal}
        event={selectedEvent}
        onClose={() => { setShowPayModal(false); setSelectedEvent(null); }}
        onSuccess={refetch}
      />
    </>
  );
};

export default Index;
