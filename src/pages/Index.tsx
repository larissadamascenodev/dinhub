import { useState, useCallback, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import SaldoCard from "@/components/dashboard/SaldoCard";
import ReceitasDespesasCards from "@/components/dashboard/ReceitasDespesasCards";
import BalancoCard from "@/components/dashboard/BalancoCard";
import MicroInteracoesCard from "@/components/dashboard/MicroInteracoesCard";
import TransacoesRecentes from "@/components/dashboard/TransacoesRecentes";
import GastosPorCategoria from "@/components/dashboard/GastosPorCategoria";
import ProximosEventos from "@/components/dashboard/ProximosEventos";
import MobileToggle from "@/components/dashboard/MobileToggle";
import { SAMPLE_DATA } from "@/types/finance";

const MonthTabs = () => {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai"];
  const active = "Mar";
  return (
    <div className="hidden md:flex items-center gap-1 mb-5">
      {months.map((m) => (
        <button
          key={m}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            m === active
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
};

const Index = () => {
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<"transacoes" | "eventos">("transacoes");
  const data = useMemo(() => SAMPLE_DATA, []);
  const handleNovaTransacao = useCallback(() => {}, []);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 md:pt-5 pb-24 md:pb-8">
        <DashboardHeader />
        <MonthTabs />

        {/* Main grid: left content + right sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
              <div className="flex flex-col gap-4">
                <SaldoCard
                  saldoAtual={data.saldoAtual}
                  saldoPrevisto={data.saldoPrevisto}
                  onNovaTransacao={handleNovaTransacao}
                />
              </div>
              <div className="hidden md:flex flex-col gap-3 w-[220px]">
                <ReceitasDespesasCards receitas={data.receitas} despesas={data.despesas} />
              </div>
            </div>

            {/* Mobile: receitas/despesas inline */}
            <div className="md:hidden">
              <ReceitasDespesasCards receitas={data.receitas} despesas={data.despesas} />
            </div>

            <BalancoCard balanco={data.balanco} />
            <MicroInteracoesCard
              gastosHoje={data.gastosHoje}
              mediaGastosDiarios={data.mediaGastosDiarios}
            />

            {/* Mobile toggle */}
            {isMobile && (
              <MobileToggle activeTab={mobileTab} onTabChange={setMobileTab} />
            )}

            {/* Desktop: always show */}
            {!isMobile && (
              <>
                <TransacoesRecentes transactions={data.transactions} />
                <GastosPorCategoria categories={data.categories} />
              </>
            )}

            {/* Mobile: conditional */}
            {isMobile && mobileTab === "transacoes" && (
              <>
                <TransacoesRecentes transactions={data.transactions} />
                <GastosPorCategoria categories={data.categories} />
              </>
            )}

            {isMobile && mobileTab === "eventos" && (
              <ProximosEventos events={data.events} />
            )}
          </div>

          {/* Right sidebar (desktop) */}
          {!isMobile && (
            <div>
              <ProximosEventos events={data.events} />
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Index;
