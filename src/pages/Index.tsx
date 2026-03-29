import { useState, useCallback, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { useGreeting } from "@/components/dashboard/DashboardHeader";
import SaldoCard from "@/components/dashboard/SaldoCard";
import ReceitasDespesasCards from "@/components/dashboard/ReceitasDespesasCards";
import BalancoCard from "@/components/dashboard/BalancoCard";
import MicroInteracoesCard from "@/components/dashboard/MicroInteracoesCard";
import TransacoesRecentes from "@/components/dashboard/TransacoesRecentes";
import ProximosEventos from "@/components/dashboard/ProximosEventos";
import MonthSelector from "@/components/dashboard/MonthSelector";
import PagarEditarModal from "@/components/dashboard/PagarEditarModal";
import OnboardingCard from "@/components/dashboard/OnboardingCard";
import { useAuth } from "@/contexts/AuthContext";
import { useMonth } from "@/contexts/MonthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useProfile } from "@/hooks/useProfile";
import type { FinanceEvent } from "@/types/finance";

const Index = () => {
  const { selectedMonth, selectedYear, setMonth } = useMonth();
  const [selectedEvent, setSelectedEvent] = useState<FinanceEvent | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, refetch } = useFinanceData(selectedMonth, selectedYear);
  const { profile, refetch: refetchProfile, updateDisplayName, isOnboardingComplete } = useProfile();
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

  if (loading && data.transactions.length === 0 && data.receitas === 0 && data.despesas === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-primary text-lg">Carregando dados...</div>
      </div>
    );
  }

  return (
    <>

        {/* DESKTOP LAYOUT */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_340px] gap-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-3">
              <div className="pl-0.5">
                <h1 className="font-display text-lg font-bold leading-tight">
                   {greeting}, <span className="text-primary">{userName}</span>
                </h1>
                <p className="text-[10px] text-muted-foreground">{dateStr}</p>
              </div>
              <MonthSelector selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={handleMonthChange} />
            </div>
            {profile && !isOnboardingComplete && (
              <OnboardingCard
                profile={profile}
                onUpdateName={updateDisplayName}
                onGoToAccounts={() => navigate("/gestao")}
                onCreateTransaction={handleNovaTransacao}
              />
            )}
            <div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-[1.4fr_1fr] gap-3">
                <SaldoCard saldoAtual={saldoMes} saldoPrevisto={saldoPrevisto} isFutureMonth={isFutureMonth} />
                <ReceitasDespesasCards receitas={receitas} despesas={despesas} />
              </motion.div>
            </div>
            <BalancoCard balanco={balanco} />
            <MicroInteracoesCard gastosHoje={data.gastosHoje} mediaGastosDiarios={data.mediaGastosDiarios} />
            <TransacoesRecentes transactions={data.transactions} onDelete={refetch} />
          </div>
          <div className="space-y-4">
            <ProximosEventos events={data.events} selectedMonth={selectedMonth} selectedYear={selectedYear} onEventClick={handleEventClick} />
          </div>
        </div>

        {/* TABLET LAYOUT */}
        <div className="hidden md:block lg:hidden space-y-4">
          <div className="flex items-center justify-between mb-3">
            <div className="pl-0.5">
              <h1 className="font-display text-lg font-bold leading-tight">
                {greeting}, <span className="text-primary">{userName}</span>
              </h1>
              <p className="text-[10px] text-muted-foreground">{dateStr}</p>
            </div>
            <MonthSelector selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={handleMonthChange} />
          </div>
          {profile && !isOnboardingComplete && (
            <OnboardingCard
              profile={profile}
              onUpdateName={updateDisplayName}
              onGoToAccounts={() => navigate("/gestao")}
              onCreateTransaction={handleNovaTransacao}
            />
          )}
          <SaldoCard saldoAtual={saldoMes} saldoPrevisto={saldoPrevisto} isFutureMonth={isFutureMonth} />
          <ReceitasDespesasCards receitas={receitas} despesas={despesas} />
          <BalancoCard balanco={balanco} />
          <MicroInteracoesCard gastosHoje={data.gastosHoje} mediaGastosDiarios={data.mediaGastosDiarios} />
          <TransacoesRecentes transactions={data.transactions} onDelete={refetch} />
          <ProximosEventos events={data.events} selectedMonth={selectedMonth} selectedYear={selectedYear} onEventClick={handleEventClick} />
        </div>

        {/* MOBILE LAYOUT */}
        <div className="md:hidden space-y-3">
          <div className="flex items-center justify-between">
            <div className="pl-0.5">
              <h1 className="font-display text-base font-bold leading-tight mx-[2px]">
                {greeting}, <span className="text-primary">{userName}</span>
              </h1>
              <p className="text-[10px] text-muted-foreground my-0 mx-[2px]">{dateStr}</p>
            </div>
            <MonthSelector selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={handleMonthChange} />
          </div>
          {profile && !isOnboardingComplete && (
            <OnboardingCard
              profile={profile}
              onUpdateName={updateDisplayName}
              onGoToAccounts={() => navigate("/gestao")}
              onCreateTransaction={handleNovaTransacao}
            />
          )}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <SaldoCard saldoAtual={saldoMes} saldoPrevisto={saldoPrevisto} isFutureMonth={isFutureMonth} mobile />
            <ReceitasDespesasCards receitas={receitas} despesas={despesas} mobile />
          </motion.div>
          <BalancoCard balanco={balanco} />
          <MicroInteracoesCard gastosHoje={data.gastosHoje} mediaGastosDiarios={data.mediaGastosDiarios} />
          <TransacoesRecentes transactions={data.transactions} onDelete={refetch} />
          <div className="-mt-3">
            <ProximosEventos events={data.events} selectedMonth={selectedMonth} selectedYear={selectedYear} onEventClick={handleEventClick} />
          </div>
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
