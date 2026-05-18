import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Target, 
  Bell, 
  Shield, 
  Menu,
  X,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const openAuth = (view: "login" | "signup") => {
    setAuthView(view);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-[#00ff7b]/30">
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        defaultView={authView} 
      />

      {/* Hero Section */}
      <section className="relative min-h-screen pt-[30px] px-4 md:px-[60px] overflow-hidden bg-[radial-gradient(circle_at_center,rgba(0,255,120,0.08)_0%,transparent_40%)]">
        {/* Navbar */}
        <header className="flex justify-between items-center mb-10 md:mb-[60px] relative z-50">
          <div className="text-[32px] md:text-[42px] font-extrabold tracking-tighter cursor-pointer" onClick={() => navigate("/")}>
            Din<span className="text-[#00ff7b]">Hub</span>
          </div>

          <nav className="hidden lg:flex gap-10 bg-white/5 backdrop-blur-md px-7 py-[18px] rounded-full border border-white/5">
            <a href="#" className="text-white/70 hover:text-white font-medium transition-colors">Funcionalidades</a>
            <a href="#" className="text-white/70 hover:text-white font-medium transition-colors">Como Funciona</a>
            <a href="#" className="text-white/70 hover:text-white font-medium transition-colors">Preços</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-4">
              <button 
                onClick={() => openAuth("login")}
                className="h-14 px-7 rounded-[18px] bg-transparent border border-white/15 text-white text-base hover:bg-white/5 transition-colors"
              >
                Entrar
              </button>
              <button 
                onClick={() => openAuth("signup")}
                className="h-14 px-8 rounded-[18px] bg-[#00ff7b] text-black font-bold text-base shadow-[0_0_30px_rgba(0,255,123,0.25)] hover:scale-105 transition-all"
              >
                Começar grátis
              </button>
            </div>
            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-24 left-4 right-4 z-40 bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex flex-col gap-6">
                <a href="#" className="text-lg font-medium text-white/70 hover:text-white transition-colors">Funcionalidades</a>
                <a href="#" className="text-lg font-medium text-white/70 hover:text-white transition-colors">Como Funciona</a>
                <a href="#" className="text-lg font-medium text-white/70 hover:text-white transition-colors">Preços</a>
                <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                  <Button variant="outline" onClick={() => openAuth("login")} className="h-14 rounded-2xl border-white/15 bg-transparent">Entrar</Button>
                  <Button onClick={() => openAuth("signup")} className="h-14 rounded-2xl bg-[#00ff7b] text-black font-bold">Começar grátis</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left Content */}
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-8 w-fit px-[18px] py-3 rounded-full border border-[#00ff7b]/20 bg-[#00ff7b]/5"
            >
              <div className="flex -space-x-2">
                {['J', 'A', 'C', 'M', 'R'].map((initial, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-[#1a1a1a] border-2 border-[#020202] flex items-center justify-center text-[10px] font-bold text-white/80">
                    {initial}
                  </div>
                ))}
              </div>
              <p className="text-[#00ff7b] font-bold text-sm md:text-base">+2.847 pessoas assumindo o controle</p>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-[86px] leading-[0.95] font-extrabold mb-8 tracking-tight"
            >
              Seu dinheiro some todo mês e você <span className="text-[#00ff7b]">não sabe por quê.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl leading-relaxed text-white/70 max-w-[650px] mb-10"
            >
              O DinHub analisa cada centavo, te avisa antes de virar problema e te mostra o que fazer. Em português, sem enrolação.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-[18px] mb-14"
            >
              <button 
                onClick={() => user ? navigate("/dashboard") : openAuth("signup")}
                className="h-[72px] px-9 rounded-[20px] bg-[#00ff7b] text-black font-extrabold text-lg shadow-[0_0_40px_rgba(0,255,123,0.3)] hover:scale-105 transition-all"
              >
                Descobrir para onde vai meu dinheiro
              </button>
              <button className="h-[72px] px-8 rounded-[20px] bg-transparent border border-white/12 text-white font-semibold text-lg hover:bg-white/5 transition-colors flex items-center justify-center gap-3">
                <Play className="fill-white w-5 h-5" />
                Ver como funciona
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-[18px]"
            >
              <div className="p-5 rounded-[22px] bg-white/[0.03] border border-white/5 group hover:border-[#00ff7b]/30 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#00ff7b]/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#00ff7b]" />
                  </div>
                  <strong className="text-lg">Meta de férias</strong>
                </div>
                <p className="text-white/60 mb-4 text-sm font-medium">R$ 2.350 / R$ 5.000</p>
                <div className="w-full h-[10px] bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "47%" }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="h-full bg-[#00ff7b]" 
                  />
                </div>
              </div>

              <div className="p-5 rounded-[22px] bg-white/[0.03] border border-white/5 group hover:border-[#00ff7b]/30 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-orange-500" />
                  </div>
                  <strong className="text-lg">Alerta de gastos</strong>
                </div>
                <p className="text-white/60 text-sm font-medium">Você gastou 90% do limite.</p>
              </div>

              <div className="p-5 rounded-[22px] bg-white/[0.03] border border-white/5 group hover:border-[#00ff7b]/30 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-500" />
                  </div>
                  <strong className="text-lg">Radar de risco</strong>
                </div>
                <p className="text-white/60 text-sm font-medium">Aumento de gastos detectado.</p>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Visual Background Integration */}
          <div className="relative h-full flex items-center justify-center lg:justify-end min-h-[500px] lg:min-h-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="absolute right-[-10%] lg:right-[-15%] top-1/2 -translate-y-1/2 w-[140%] lg:w-[130%] h-[130%] pointer-events-none z-0 overflow-hidden"
              style={{
                maskImage: 'linear-gradient(to left, black 40%, transparent 95%), linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
                WebkitMaskImage: 'linear-gradient(to left, black 40%, transparent 95%), linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1000" 
                alt="Pessoa real integrada no cenário" 
                className="w-full h-full object-cover grayscale-[0.2] opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#020202]/40 to-[#020202]" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-[650px] min-h-[600px] lg:min-h-[700px]"
            >
              {/* Scan Effect Overlaying the blended image area */}
              <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
                <motion.div 
                  animate={{ top: ["-10%", "110%", "-10%"] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute left-[-20%] right-[-20%] h-[1px] bg-gradient-to-r from-transparent via-[#00ff7b]/50 to-transparent shadow-[0_0_20px_#00ff7b]"
                />
              </div>

              {/* Floating Cards */}
              <div className="absolute inset-0 z-20 pointer-events-none">
                {/* iFood Card */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[10%] -right-4 md:-right-8 w-[280px] md:w-[340px] p-5 rounded-[24px] bg-[#0f0f0f]/90 backdrop-blur-xl border border-white/10 shadow-2xl flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <img src="https://logodownload.org/wp-content/uploads/2017/05/ifood-logo-0.png" className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#EA1D2C] p-2 object-contain" />
                    <div>
                      <strong className="text-lg md:text-2xl block">iFood</strong>
                      <p className="text-white/55 text-sm">Hoje, 13:42</p>
                    </div>
                  </div>
                  <span className="text-[#ff4f4f] font-bold text-xl md:text-2xl">- R$ 45,90</span>
                </motion.div>

                {/* Uber Card */}
                <motion.div 
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  className="absolute top-[28%] -right-2 md:right-0 w-[280px] md:w-[340px] p-5 rounded-[24px] bg-[#0f0f0f]/90 backdrop-blur-xl border border-white/10 shadow-2xl flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Uber_logo_2018.svg/512px-Uber_logo_2018.svg.png" className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-black p-3 object-contain invert" />
                    <div>
                      <strong className="text-lg md:text-2xl block">Uber</strong>
                      <p className="text-white/55 text-sm">Hoje, 12:18</p>
                    </div>
                  </div>
                  <span className="text-[#ff4f4f] font-bold text-xl md:text-2xl">- R$ 28,40</span>
                </motion.div>

                {/* Mercado Livre Card */}
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  className="absolute top-[46%] -right-4 md:-right-4 w-[280px] md:w-[340px] p-5 rounded-[24px] bg-[#0f0f0f]/90 backdrop-blur-xl border border-white/10 shadow-2xl flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <img src="https://logodownload.org/wp-content/uploads/2014/10/mercado-livre-logo-11.png" className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#FFE600] p-2 object-contain" />
                    <div>
                      <strong className="text-lg md:text-2xl block">M. Livre</strong>
                      <p className="text-white/55 text-sm">Hoje, 10:37</p>
                    </div>
                  </div>
                  <span className="text-[#ff4f4f] font-bold text-xl md:text-2xl">- R$ 199,90</span>
                </motion.div>

                {/* Netflix Card */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                  className="absolute top-[64%] -right-2 md:right-4 w-[280px] md:w-[340px] p-5 rounded-[24px] bg-[#0f0f0f]/90 backdrop-blur-xl border border-white/10 shadow-2xl flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/75/Netflix_icon.svg" className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-black p-2 object-contain" />
                    <div>
                      <strong className="text-lg md:text-2xl block">Netflix</strong>
                      <p className="text-white/55 text-sm">Ontem, 21:34</p>
                    </div>
                  </div>
                  <span className="text-[#ff4f4f] font-bold text-xl md:text-2xl">- R$ 55,90</span>
                </motion.div>

                {/* Credit Card Card */}
                <motion.div 
                  animate={{ y: [0, -14, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  className="absolute top-[82%] -right-4 md:-right-6 w-[280px] md:w-[340px] p-5 rounded-[24px] bg-[#0f0f0f]/90 backdrop-blur-xl border border-white/10 shadow-2xl flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#222] flex items-center justify-center text-2xl">💳</div>
                    <div>
                      <strong className="text-lg md:text-2xl block">Fatura</strong>
                      <p className="text-white/55 text-sm">Ontem, 18:20</p>
                    </div>
                  </div>
                  <span className="text-[#ff4f4f] font-bold text-xl md:text-2xl">- R$ 1.254,80</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Grid Pattern Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>
    </div>
  );
};

export default Landing;
