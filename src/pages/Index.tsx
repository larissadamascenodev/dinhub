import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import DashboardHeader, { useGreeting } from "@/components/dashboard/DashboardHeader";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import SaldoCard from "@/components/dashboard/SaldoCard";
import ReceitasDespesasCards from "@/components/dashboard/ReceitasDespesasCards";
import BalancoCard from "@/components/dashboard/BalancoCard";
import MicroInteracoesCard from "@/components/dashboard/MicroInteracoesCard";
import TransacoesRecentes from "@/components/dashboard/TransacoesRecentes";

import ProximosEventos from "@/components/dashboard/ProximosEventos";
import MonthSelector from "@/components/dashboard/MonthSelector";
import { SAMPLE_DATA } from "@/types/finance";

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const data = useMemo(() => SAMPLE_DATA, []);
  const handleNovaTransacao = useCallback(() => {}, []);
  const { greeting, dateStr } = useGreeting();

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const receitas = data.receitas;
  const despesas = data.despesas;
  const balanco = receitas - despesas;
  const saldoMes = data.saldoAtual;

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-0 pb-24 md:pb-8">
        <DashboardHeader />

        {/* ══════════════════════════════════════════════════
            DESKTOP LAYOUT (>= 1024px) — 2 columns
            ══════════════════════════════════════════════════ */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_340px] gap-5">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            {/* Saldo + Receita/Despesa */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h1 className="font-display text-lg font-bold leading-tight">
                    {greeting}, <span className="text-foreground/70">Olá</span>
                  </h1>
                  <p className="text-[10px] text-muted-foreground">{dateStr}</p>
                </div>
                <MonthSelector selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={handleMonthChange} />
              </div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-[1.4fr_1fr] gap-3">
                <SaldoCard saldoAtual={saldoMes} saldoPrevisto={balanco} onNovaTransacao={handleNovaTransacao} />
                <ReceitasDespesasCards receitas={receitas} despesas={despesas} />
              </motion.div>
            </div>

            {/* Balanço */}
            <BalancoCard balanco={balanco} />

            {/* Daily behavior */}
            <MicroInteracoesCard gastosHoje={data.gastosHoje} mediaGastosDiarios={data.mediaGastosDiarios} />

            {/* Transações + Categorias stacked */}
            <TransacoesRecentes transactions={data.transactions} />
          </div>

          {/* RIGHT COLUMN (sidebar) */}
          <div className="space-y-4">
            <ProximosEventos events={data.events} selectedMonth={selectedMonth} selectedYear={selectedYear} />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            TABLET LAYOUT (768px – 1024px)
            ══════════════════════════════════════════════════ */}
        <div className="hidden md:block lg:hidden space-y-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="font-display text-lg font-bold leading-tight">
                {greeting}, <span className="text-foreground/70">Olá</span>
              </h1>
              <p className="text-[10px] text-muted-foreground">{dateStr}</p>
            </div>
            <MonthSelector selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={handleMonthChange} />
          </div>

          <SaldoCard saldoAtual={saldoMes} saldoPrevisto={balanco} onNovaTransacao={handleNovaTransacao} />
          <ReceitasDespesasCards receitas={receitas} despesas={despesas} />
          <BalancoCard balanco={balanco} />
          <MicroInteracoesCard gastosHoje={data.gastosHoje} mediaGastosDiarios={data.mediaGastosDiarios} />

          <TransacoesRecentes transactions={data.transactions} />

          <ProximosEventos events={data.events} selectedMonth={selectedMonth} selectedYear={selectedYear} />
        </div>

        {/* ══════════════════════════════════════════════════
            MOBILE LAYOUT (< 768px)
            ══════════════════════════════════════════════════ */}
        <div className="md:hidden space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-base font-bold leading-tight">
                {greeting}, <span className="text-foreground/70">Olá</span>
              </h1>
              <p className="text-[10px] text-muted-foreground">{dateStr}</p>
            </div>
            <MonthSelector selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={handleMonthChange} />
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <SaldoCard saldoAtual={saldoMes} saldoPrevisto={balanco} onNovaTransacao={handleNovaTransacao} mobile />
            <ReceitasDespesasCards receitas={receitas} despesas={despesas} mobile />
          </motion.div>

          <BalancoCard balanco={balanco} />
          <MicroInteracoesCard gastosHoje={data.gastosHoje} mediaGastosDiarios={data.mediaGastosDiarios} />
          
          <TransacoesRecentes transactions={data.transactions} />
          <ProximosEventos events={data.events} selectedMonth={selectedMonth} selectedYear={selectedYear} />
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Index;
