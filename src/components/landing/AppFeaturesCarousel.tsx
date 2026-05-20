import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Wallet, BarChart3, Target, Receipt, PieChart, CreditCard, Flame } from "lucide-react";

type TabType = "Dashboard" | "Categorias" | "Transações" | "Parcelamentos" | "Fatura" | "Metas";

const tabs: TabType[] = ["Dashboard", "Categorias", "Transações", "Parcelamentos", "Fatura", "Metas"];

const AppScreen = ({ type }: { type: TabType }) => {
  switch (type) {
    case "Dashboard":
      return (
        <div className="bg-[#0a0a0a] h-full text-white p-4 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[10px] text-gray-500">Bom dia,</p>
              <p className="text-sm font-bold">Larissa</p>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-[#111] flex items-center justify-center border border-[#1a1a1a]">
                <Bell className="w-4 h-4 text-gray-400" />
              </div>
              <div className="px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="text-[10px] font-bold text-orange-500">12</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 text-[10px] text-gray-500 border-b border-[#1a1a1a] pb-2">
            <span>Abr</span>
            <span className="text-primary font-bold border-b border-primary">Mai</span>
            <span>Jun</span>
          </div>

          <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4 space-y-4">
            <div>
              <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-1">SALDO DISPONÍVEL</p>
              <p className="text-xl font-bold">R$ 713,30</p>
              <p className="text-[10px] text-gray-400 mt-1">Previsto fim do mês: <span className="text-white">R$ 341,87</span></p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#1a1a1a] rounded-xl p-2">
                <p className="text-[8px] text-gray-500">Receitas</p>
                <p className="text-xs font-bold text-primary">R$ 1.959,03</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-2">
                <p className="text-[8px] text-gray-500">Despesas</p>
                <p className="text-xs font-bold text-red-500">R$ 1.782,16</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {["Carteira", "Balanço", "Projeção"].map(label => (
              <div key={label} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-2 flex flex-col items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-3 h-3 text-primary" />
                </div>
                <span className="text-[8px] text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "Categorias":
      return (
        <div className="bg-[#0a0a0a] h-full text-white p-4 space-y-4">
          <p className="text-xs font-bold">Gastos por categoria · Maio</p>
          <div className="text-xl font-bold">R$ 3.847,90</div>
          
          <div className="flex h-2 rounded-full overflow-hidden bg-[#1a1a1a]">
            <div className="bg-red-500 w-[22%]" />
            <div className="bg-purple-500 w-[19%]" />
            <div className="bg-blue-500 w-[14%]" />
            <div className="bg-orange-500 w-[11%]" />
            <div className="bg-gray-700 flex-1" />
          </div>

          <div className="space-y-3">
            {[
              { name: "Delivery", val: "R$ 842,90", pct: "21,9%", color: "bg-red-500" },
              { name: "Compras online", val: "R$ 731,20", pct: "19%", color: "bg-purple-500" },
              { name: "Transporte", val: "R$ 518,40", pct: "13,5%", color: "bg-blue-500" },
              { name: "Assinaturas", val: "R$ 184,70", pct: "4,8%", color: "bg-green-500" },
              { name: "Apostas", val: "R$ 427,00", pct: "11,1%", color: "bg-orange-500" },
            ].map(cat => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${cat.color}`} />
                  <span className="text-[10px] text-gray-400">{cat.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold">{cat.val}</p>
                  <p className="text-[8px] text-gray-600">{cat.pct}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-auto bg-primary/10 border border-primary/20 rounded-xl p-3">
            <p className="text-[9px] text-primary leading-tight">Você gastou R$ 180 a mais em delivery comparado ao mês passado.</p>
          </div>
        </div>
      );
    case "Transações":
      return (
        <div className="bg-[#0a0a0a] h-full text-white p-4 space-y-4">
          <p className="text-xs font-bold mb-4">Transações recentes</p>
          <div className="space-y-4">
            {[
              { label: "DAS", time: "Hoje 14:32", val: "-R$ 51,89", type: "neg" },
              { label: "Nubank PJ", time: "Hoje 10:35", val: "+R$ 610,36", type: "pos" },
              { label: "Salário", time: "01 Mai", val: "+R$ 850,00", type: "pos" },
              { label: "iFood", time: "Ontem", val: "-R$ 42,70", type: "neg" },
              { label: "Parcela Auto", time: "05 Mai", val: "-R$ 293,57", type: "neg" },
            ].map((t, i) => (
              <div key={i} className="flex justify-between items-center border-b border-[#111] pb-2">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#111] flex items-center justify-center text-[10px]">
                    {t.label[0]}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold">{t.label}</p>
                    <p className="text-[8px] text-gray-500">{t.time}</p>
                  </div>
                </div>
                <div className={`text-[10px] font-bold ${t.type === "pos" ? "text-primary" : "text-gray-300"}`}>
                  {t.val}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-[#1a1a1a]">
            <p className="text-[8px] text-gray-500 uppercase">Saldo atual</p>
            <p className="text-sm font-bold">R$ 713,30</p>
          </div>
        </div>
      );
    case "Parcelamentos":
      return (
        <div className="bg-[#0a0a0a] h-full text-white p-4 space-y-4">
          <p className="text-xs font-bold">Parcelamentos Ativos — 18</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-[#111] p-2 rounded-xl border border-[#1a1a1a]">
              <p className="text-[7px] text-gray-500 uppercase">Comprometido/mês</p>
              <p className="text-[10px] font-bold">R$ 1.279,47</p>
            </div>
            <div className="bg-[#111] p-2 rounded-xl border border-[#1a1a1a]">
              <p className="text-[7px] text-gray-500 uppercase">Total restante</p>
              <p className="text-[10px] font-bold">R$ 8.594,01</p>
            </div>
          </div>
          <p className="text-[9px] text-gray-500 text-center">Livre em 11 meses (abr/2027)</p>
          <div className="space-y-2">
            {[
              { name: "PS5", val: "R$ 337,67", par: "3/10" },
              { name: "Notebook Dell", val: "R$ 289,90", par: "5/12" },
              { name: "Seguro carro", val: "R$ 189,90", par: "7/12" },
              { name: "Sofá retrátil", val: "R$ 237,45", par: "4/18" },
              { name: "Viagem Nordeste", val: "R$ 255,55", par: "2/8" },
            ].map((p, i) => (
              <div key={i} className="flex justify-between items-center bg-[#111] p-2 rounded-xl">
                <div>
                  <p className="text-[9px] font-bold">{p.name}</p>
                  <p className="text-[8px] text-gray-500">{p.par} parcelas</p>
                </div>
                <div className="text-[9px] font-bold">{p.val}</div>
              </div>
            ))}
          </div>
        </div>
      );
    case "Fatura":
      return (
        <div className="bg-[#0a0a0a] h-full text-white p-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-bold">Nubank PJ ···· 3426</p>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[8px] font-bold">ABERTA</span>
          </div>
          <div className="flex gap-4 text-[10px] text-gray-500 mb-2">
            <span>Mai</span>
            <span className="text-white border-b border-primary">Jun</span>
            <span>Jul</span>
          </div>
          <div className="space-y-1">
            <p className="text-[8px] text-gray-500 uppercase">Fatura de Junho</p>
            <p className="text-xl font-bold">R$ 631,57</p>
            <p className="text-[9px] text-gray-500">Vence em 27 dias</p>
          </div>
          <div className="flex justify-between text-[8px] text-gray-500">
            <span>Fecha dia 6</span>
            <span>Vence dia 13</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[8px]">
              <span>Limite utilizado: 76%</span>
            </div>
            <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[76%]" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[8px]">
              <div>
                <p className="text-gray-500">Usado</p>
                <p className="text-white">R$ 4.113,61</p>
              </div>
              <div>
                <p className="text-gray-500">Disponível</p>
                <p className="text-white">R$ 1.267,02</p>
              </div>
            </div>
          </div>
          <button className="w-full py-2.5 rounded-xl bg-primary text-black text-[10px] font-bold mt-4">
            Pagar Fatura · R$ 631,57
          </button>
        </div>
      );
    case "Metas":
      return (
        <div className="bg-[#0a0a0a] h-full text-white p-4 space-y-4">
          <p className="text-xs font-bold">Metas</p>
          <div className="space-y-4">
            {[
              { name: "Reserva de emergência", current: "2.350", total: "5.000", pct: 47, color: "bg-primary" },
              { name: "Viagem Europa", current: "1.200", total: "8.000", pct: 15, color: "bg-primary/60" },
              { name: "Trocar notebook", current: "800", total: "3.500", pct: 23, color: "bg-primary/60" },
            ].map((meta, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-[9px]">
                  <span className="text-gray-300">{meta.name}</span>
                  <span className="text-white font-bold">{meta.pct}%</span>
                </div>
                <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div className={`h-full ${meta.color}`} style={{ width: `${meta.pct}%` }} />
                </div>
                <p className="text-[8px] text-gray-500">R$ {meta.current} / R$ {meta.total}</p>
              </div>
            ))}
          </div>
          
          <p className="text-[10px] font-bold mt-6">Desafios ativos</p>
          <div className="space-y-2">
            {[
              { name: "30 dias sem delivery", sub: "dia 12/30", pct: 40 },
              { name: "Guardar R$ 500 este mês", sub: "68%", pct: 68 },
            ].map((d, i) => (
              <div key={i} className="bg-[#111] p-2 rounded-xl border border-[#1a1a1a] flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                  {d.pct}%
                </div>
                <div>
                  <p className="text-[9px] font-bold">{d.name}</p>
                  <p className="text-[8px] text-gray-500">{d.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
};

const IPhoneMockup = ({ activeTab }: { activeTab: TabType }) => {
  return (
    <div className="relative mx-auto w-[280px] h-[580px] bg-[#1a1a1a] rounded-[3rem] p-3 shadow-[0_0_50px_rgba(0,230,118,0.1)] border-4 border-[#2a2a2a]">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1a1a1a] rounded-b-2xl z-20 flex items-center justify-center">
        <div className="w-10 h-1 bg-[#222] rounded-full mb-1" />
      </div>
      
      {/* Screen */}
      <div className="w-full h-full bg-black rounded-[2.2rem] overflow-hidden relative border border-white/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <AppScreen type={activeTab} />
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Side buttons */}
      <div className="absolute left-[-6px] top-24 w-1.5 h-12 bg-[#2a2a2a] rounded-l" />
      <div className="absolute left-[-6px] top-40 w-1.5 h-16 bg-[#2a2a2a] rounded-l" />
      <div className="absolute left-[-6px] top-60 w-1.5 h-16 bg-[#2a2a2a] rounded-l" />
      <div className="absolute right-[-6px] top-32 w-1.5 h-20 bg-[#2a2a2a] rounded-r" />
    </div>
  );
};

export const AppFeaturesCarousel = () => {
  const [activeTab, setActiveTab] = useState<TabType>("Dashboard");

  return (
    <section className="w-full bg-[#0a0a0a] py-20 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <span className="text-[10px] md:text-xs font-bold text-primary tracking-widest uppercase">
              FUNCIONALIDADES
            </span>
          </motion.div>
          
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
            Tudo que você precisa em um lugar só.
          </h2>
          <p className="text-gray-400 text-base md:text-lg">
            Veja como o DinHub funciona na prática.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto scrollbar-none gap-3 mb-16 justify-start lg:justify-center px-4 -mx-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full border transition-all duration-300 text-sm font-medium whitespace-nowrap ${
                activeTab === tab
                  ? "bg-primary/5 border-primary text-primary"
                  : "bg-transparent border-[#1a1a1a] text-gray-500 hover:border-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="order-1 lg:order-1"
          >
            <IPhoneMockup activeTab={activeTab} />
          </motion.div>

          {/* Text content */}
          <div className="order-2 lg:order-2 space-y-8">
            <div className="hidden lg:block space-y-8">
               <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-3xl font-bold text-white">{activeTab}</h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      {activeTab === "Dashboard" && "Tenha uma visão clara do seu saldo, previsto e fluxo de caixa mensal em segundos."}
                      {activeTab === "Categorias" && "Descubra exatamente onde seu dinheiro está indo com gráficos intuitivos e insights automáticos."}
                      {activeTab === "Transações" && "Acompanhe cada centavo que entra e sai com uma lista organizada e detalhada."}
                      {activeTab === "Parcelamentos" && "Saiba quando cada parcela termina e quanto do seu orçamento futuro já está comprometido."}
                      {activeTab === "Fatura" && "Gerencie seus cartões de crédito em um só lugar. Visualize limites, gastos e datas de fechamento."}
                      {activeTab === "Metas" && "Crie objetivos financeiros, acompanhe o progresso e participe de desafios para economizar mais."}
                    </p>
                  </motion.div>
               </AnimatePresence>
            </div>
            
            <div className="lg:hidden text-center space-y-4">
               <h3 className="text-2xl font-bold text-white">{activeTab}</h3>
               <p className="text-gray-400 text-sm">
                  {activeTab === "Dashboard" && "Tenha uma visão clara do seu saldo, previsto e fluxo de caixa mensal em segundos."}
                  {activeTab === "Categorias" && "Descubra exatamente onde seu dinheiro está indo com gráficos intuitivos."}
                  {activeTab === "Transações" && "Acompanhe cada centavo que entra e sai com uma lista organizada."}
                  {activeTab === "Parcelamentos" && "Saiba quando cada parcela termina e o comprometimento do seu orçamento."}
                  {activeTab === "Fatura" && "Gerencie seus cartões de crédito em um só lugar."}
                  {activeTab === "Metas" && "Crie objetivos financeiros e acompanhe o progresso."}
               </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppFeaturesCarousel;
