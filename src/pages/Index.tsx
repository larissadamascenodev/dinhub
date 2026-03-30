import { useState, useCallback, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, ChevronRight } from "lucide-react";
import { useGreeting } from "@/components/dashboard/DashboardHeader";
import SaldoCard from "@/components/dashboard/SaldoCard";
import ReceitasDespesasCards from "@/components/dashboard/ReceitasDespesasCards";
import BalancoCard from "@/components/dashboard/BalancoCard";
import MicroInteracoesCard from "@/components/dashboard/MicroInteracoesCard";
import TransacoesRecentes from "@/components/dashboard/TransacoesRecentes";
import ProximosEventos from "@/components/dashboard/ProximosEventos";
import GastosPorCategoria from "@/components/dashboard/GastosPorCategoria";
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
                <ReceitasDespesasCards receitas={receitas} receitasRecebidas={data.receitasRecebidas} receitasPendentes={data.receitasPendentes} despesas={despesas} despesasPagas={data.despesasPagas} despesasPendentes={data.despesasPendentes} compact />
              </motion.div>
            </div>
            <BalancoCard balanco={balanco} />
            {isCurrentMonth && <MicroInteracoesCard gastosHoje={data.gastosHoje} mediaGastosDiarios={data.mediaGastosDiarios} />}
            {data.categories.length > 0 && (
              <GastosPorCategoria
                categories={data.categories}
                onVerAnalise={() => navigate("/transacoes")}
              />
            )}
            <TransacoesRecentes transactions={data.transactions} onDelete={refetch} />
          </div>
          <div className="space-y-4">
            {/* Projection summary card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card p-4 space-y-3 group hover:border-primary/20 transition-all cursor-pointer"
              onClick={() => navigate("/bot-finance/projecoes")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-xs font-semibold font-display">Projeções</h3>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-secondary/40 rounded-xl p-2.5 text-center">
                  <p className="text-[9px] text-muted-foreground mb-0.5">Saldo Atual</p>
                  <p className="text-sm font-bold tabular-nums text-foreground">
                    {saldoMes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
                <div className="bg-secondary/40 rounded-xl p-2.5 text-center">
                  <p className="text-[9px] text-muted-foreground mb-0.5">Previsto</p>
                  <p className={`text-sm font-bold tabular-nums ${saldoPrevisto >= 0 ? "text-primary" : "text-destructive"}`}>
                    {saldoPrevisto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                </div>
              </div>

              <div className={`rounded-lg px-3 py-2 text-center text-[11px] font-medium ${
                balanco >= 0 ? "bg-primary/8 text-primary" : "bg-destructive/8 text-destructive"
              }`}>
                {balanco >= 0
                  ? `Balanço positivo de ${balanco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} 👏`
                  : `Balanço negativo de ${Math.abs(balanco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} 😬`
                }
              </div>

              <div className="flex items-center justify-center gap-1.5 pt-1">
                <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">Ver projeção completa</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
            </motion.div>

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
          <ReceitasDespesasCards receitas={receitas} receitasRecebidas={data.receitasRecebidas} receitasPendentes={data.receitasPendentes} despesas={despesas} despesasPagas={data.despesasPagas} despesasPendentes={data.despesasPendentes} compact />
          <BalancoCard balanco={balanco} />
          {isCurrentMonth && <MicroInteracoesCard gastosHoje={data.gastosHoje} mediaGastosDiarios={data.mediaGastosDiarios} />}
          <button onClick={() => navigate("/bot-finance/projecoes")} className="glass-card w-full p-3 flex items-center justify-between group hover:border-primary/20 transition-all">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">Veja suas projeções</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
          </button>
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
            <ReceitasDespesasCards receitas={receitas} receitasRecebidas={data.receitasRecebidas} receitasPendentes={data.receitasPendentes} despesas={despesas} despesasPagas={data.despesasPagas} despesasPendentes={data.despesasPendentes} mobile compact />
          </motion.div>
          <BalancoCard balanco={balanco} />
          {isCurrentMonth && <MicroInteracoesCard gastosHoje={data.gastosHoje} mediaGastosDiarios={data.mediaGastosDiarios} />}
          <button onClick={() => navigate("/bot-finance/projecoes")} className="glass-card w-full p-3 flex items-center justify-between group hover:border-primary/20 transition-all">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">Veja suas projeções</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
          </button>
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
