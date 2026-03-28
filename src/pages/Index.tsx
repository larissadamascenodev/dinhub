import { useState, useCallback, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Navbar from "@/components/dashboard/Navbar";
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

const Index = () => {
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<"transacoes" | "eventos">("transacoes");

  const data = useMemo(() => SAMPLE_DATA, []);

  const handleNovaTransacao = useCallback(() => {
    // placeholder for future integration
  }, []);

  return (
    <div className="dark min-h-screen bg-background pb-20 md:pb-6">
      <div className="container max-w-7xl mx-auto px-4 pt-4 md:pt-6">
        {/* Desktop top nav */}
        <div className="hidden md:flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="text-lg font-bold text-foreground">
              Finan<span className="text-primary">Pro</span>
            </span>
          </div>
        </div>

        {/* Mobile header with logo */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span className="text-base font-bold text-foreground">
              Finan<span className="text-primary">Pro</span>
            </span>
          </div>
        </div>

        <Navbar />
        <DashboardHeader />

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
          {/* Left column */}
          <div className="flex flex-col gap-4">
            <SaldoCard
              saldoAtual={data.saldoAtual}
              saldoPrevisto={data.saldoPrevisto}
              onNovaTransacao={handleNovaTransacao}
            />
            <ReceitasDespesasCards receitas={data.receitas} despesas={data.despesas} />
            <BalancoCard balanco={data.balanco} />
            <MicroInteracoesCard
              gastosHoje={data.gastosHoje}
              mediaGastosDiarios={data.mediaGastosDiarios}
            />

            {/* Mobile toggle */}
            {isMobile && (
              <MobileToggle activeTab={mobileTab} onTabChange={setMobileTab} />
            )}

            {/* Desktop: always show transactions + categories */}
            {!isMobile && (
              <>
                <TransacoesRecentes transactions={data.transactions} />
                <GastosPorCategoria categories={data.categories} />
              </>
            )}

            {/* Mobile: conditional content */}
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

          {/* Right column - sidebar (desktop only) */}
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
