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
      <section className="relative min-h-screen pt-[30px] px-4 md:px-[60px] overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00ff7b]/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />
          <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-[#00ff7b]/3 blur-[80px] rounded-full" />
        </div>

        {/* Navbar */}
        <header className="flex justify-between items-center mb-10 md:mb-[60px] relative z-50 max-w-[1440px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[28px] md:text-[34px] font-display font-extrabold tracking-tighter cursor-pointer group" 
            onClick={() => navigate("/")}
          >
            Din<span className="text-[#00ff7b] group-hover:drop-shadow-[0_0_8px_rgba(0,255,123,0.5)] transition-all">Hub</span>
          </motion.div>

          <motion.nav 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden lg:flex gap-1 bg-white/[0.03] backdrop-blur-xl px-2 py-1.5 rounded-full border border-white/[0.08] shadow-2xl"
          >
            {['Funcionalidades', 'Como Funciona', 'Preços'].map((item) => (
              <a 
                key={item}
                href="#" 
                className="px-6 py-2.5 rounded-full text-white/60 hover:text-white hover:bg-white/5 font-medium transition-all text-sm tracking-tight"
              >
                {item}
              </a>
            ))}
          </motion.nav>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="hidden md:flex gap-4">
              <button 
                onClick={() => openAuth("login")}
                className="h-12 px-6 rounded-xl bg-transparent border border-white/10 text-white/80 text-sm font-semibold hover:bg-white/5 hover:border-white/20 transition-all active:scale-95"
              >
                Entrar
              </button>
              <button 
                onClick={() => openAuth("signup")}
                className="h-12 px-7 rounded-xl bg-[#00ff7b] text-black font-bold text-sm shadow-[0_8px_24px_rgba(0,255,123,0.2)] hover:shadow-[0_12px_32px_rgba(0,255,123,0.3)] hover:-translate-y-0.5 transition-all active:scale-95"
              >
                Começar grátis
              </button>
            </div>
            <button className="lg:hidden p-2 text-white/70" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </motion.div>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="lg:hidden fixed top-24 left-4 right-4 z-[100] bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  {['Funcionalidades', 'Como Funciona', 'Preços'].map((item) => (
                    <a key={item} href="#" className="text-xl font-semibold text-white/60 hover:text-[#00ff7b] transition-colors">{item}</a>
                  ))}
                </div>
                <div className="pt-8 border-t border-white/10 flex flex-col gap-4">
                  <Button variant="outline" onClick={() => openAuth("login")} className="h-14 rounded-2xl border-white/10 bg-transparent text-white hover:bg-white/5">Entrar</Button>
                  <Button onClick={() => openAuth("signup")} className="h-14 rounded-2xl bg-[#00ff7b] text-black font-bold">Começar grátis</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center relative z-10">
          {/* Left Content */}
          <div className="relative pt-8 lg:pt-0">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-10 w-fit px-4 py-2 rounded-full border border-white/5 bg-white/[0.03] backdrop-blur-md"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/80">
                    <div className="w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage: `url('https://i.pravatar.cc/100?u=${i}')` }} />
                  </div>
                ))}
              </div>
              <p className="text-white/60 font-medium text-xs md:text-sm tracking-tight">
                <span className="text-[#00ff7b] font-bold">+2.847 pessoas</span> no controle total
              </p>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-5xl md:text-7xl lg:text-[88px] leading-[0.92] font-extrabold mb-8 tracking-[-0.04em]"
            >
              Seu dinheiro <span className="text-white/40">some</span> e você <span className="relative inline-block">
                não sabe por quê.
                <motion.span 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="absolute bottom-4 left-0 h-[6px] md:h-[10px] bg-[#00ff7b]/20 -z-10 rounded-full"
                />
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-lg md:text-xl leading-relaxed text-white/50 max-w-[580px] mb-12 font-medium"
            >
              O DinHub analisa cada centavo em tempo real, antecipa problemas financeiros e desenha o caminho para sua liberdade. Simples, direto e inteligente.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-5 mb-16"
            >
              <button 
                onClick={() => user ? navigate("/dashboard") : openAuth("signup")}
                className="h-[68px] px-8 rounded-[22px] bg-[#00ff7b] text-black font-extrabold text-base md:text-lg shadow-[0_20px_40px_-10px_rgba(0,255,123,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(0,255,123,0.4)] hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]"
              >
                Parar de perder dinheiro hoje
              </button>
              <button className="h-[68px] px-8 rounded-[22px] bg-white/[0.03] border border-white/5 text-white font-semibold text-base md:text-lg hover:bg-white/5 transition-all flex items-center justify-center gap-3 backdrop-blur-sm group active:scale-[0.98]">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#00ff7b]/20 group-hover:text-[#00ff7b] transition-colors">
                  <Play className="fill-current w-4 h-4 ml-1" />
                </div>
                Assista o tour
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                { icon: <Target className="w-5 h-5" />, label: "Meta de Férias", status: "R$ 2.350 / 5.000", progress: 47, color: "#00ff7b" },
                { icon: <Bell className="w-5 h-5" />, label: "Gastos", status: "Alerta de Limite", sub: "90% utilizado", color: "#f97316" },
                { icon: <Shield className="w-5 h-5" />, label: "Segurança", status: "Radar Ativo", sub: "Risco detectado", color: "#ef4444" }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-[28px] bg-white/[0.02] border border-white/[0.04] backdrop-blur-3xl group hover:border-white/10 hover:bg-white/[0.04] transition-all duration-500">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-white/[0.05] flex items-center justify-center group-hover:scale-110 transition-transform duration-500" style={{ color: item.color }}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-white/90 font-bold text-sm tracking-tight">{item.label}</h4>
                      <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest">{item.status}</p>
                    </div>
                  </div>
                  {item.progress ? (
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 1.5, delay: 1, ease: "circOut" }}
                        className="h-full rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  ) : (
                    <p className="text-white/50 text-[13px] font-medium leading-tight">{item.sub}</p>
                  )}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Content - Visual Background Integration */}
          <div className="relative h-full flex items-center justify-center lg:justify-end min-h-[600px] lg:min-h-[850px]">
            {/* Background Blended Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute right-[-15%] lg:right-[-25%] top-1/2 -translate-y-1/2 w-[150%] lg:w-[140%] h-[140%] pointer-events-none z-0"
              style={{
                maskImage: 'radial-gradient(ellipse at 70% 50%, black 20%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(ellipse at 70% 50%, black 20%, transparent 80%)'
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1573163715152-498477dffa85?q=80&w=2069&auto=format&fit=crop" 
                alt="Finanças Premium" 
                className="w-full h-full object-cover grayscale opacity-20 mix-blend-screen brightness-75 contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent" />
            </motion.div>

            {/* Visual Canvas */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[600px] aspect-[4/5] flex items-center justify-center"
            >
              {/* Floating Decorative Elements */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <motion.div 
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[10%] left-[-10%] w-24 h-24 bg-[#00ff7b]/10 blur-[40px] rounded-full"
                />
                <motion.div 
                  animate={{ 
                    y: [0, 30, 0],
                    rotate: [0, -10, 0]
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-[20%] right-[-10%] w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full"
                />
              </div>

              {/* Scan Line Effect */}
              <div className="absolute top-[10%] bottom-[10%] left-0 right-0 z-30 overflow-hidden pointer-events-none opacity-40">
                <motion.div 
                  animate={{ top: ["-10%", "110%", "-10%"] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute left-[-20%] right-[-20%] h-[2px] bg-gradient-to-r from-transparent via-[#00ff7b]/60 to-transparent shadow-[0_0_25px_rgba(0,255,123,0.8)]"
                />
              </div>

              {/* Floating Transaction Cards - Bento Style Stack */}
              <div className="relative w-full h-full z-20 flex flex-col items-end gap-6 pr-4 lg:pr-0">
                {[
                  { logo: "https://logodownload.org/wp-content/uploads/2017/05/ifood-logo-0.png", color: "#EA1D2C", name: "iFood", time: "13:42", amount: "- R$ 45,90", delay: 0 },
                  { logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Uber_logo_2018.svg/512px-Uber_logo_2018.svg.png", color: "#000", name: "Uber", time: "12:18", amount: "- R$ 28,40", delay: 0.1, invert: true },
                  { logo: "https://logodownload.org/wp-content/uploads/2014/10/mercado-livre-logo-11.png", color: "#FFE600", name: "M. Livre", time: "10:37", amount: "- R$ 199,90", delay: 0.2 },
                  { logo: "https://upload.wikimedia.org/wikipedia/commons/7/75/Netflix_icon.svg", color: "#000", name: "Netflix", time: "21:34", amount: "- R$ 55,90", delay: 0.3 },
                  { emoji: "💳", color: "#1a1a1a", name: "Nubank", time: "18:20", amount: "- R$ 1.254,80", delay: 0.4 }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + item.delay, duration: 0.8 }}
                    whileHover={{ scale: 1.02, x: -10 }}
                    className="w-[290px] md:w-[350px] p-5 rounded-[28px] bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex justify-between items-center group cursor-default transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-[18px] flex items-center justify-center p-3 shadow-inner overflow-hidden relative" style={{ backgroundColor: item.color }}>
                        {item.logo ? (
                          <img src={item.logo} className={`w-full h-full object-contain ${item.invert ? 'invert' : ''}`} alt={item.name} />
                        ) : (
                          <span className="text-2xl">{item.emoji}</span>
                        )}
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div>
                        <strong className="text-white/90 text-lg md:text-xl block tracking-tight">{item.name}</strong>
                        <p className="text-white/30 text-xs font-bold uppercase tracking-wider">{item.time}</p>
                      </div>
                    </div>
                    <span className="text-[#ff4f4f] font-extrabold text-lg md:text-xl tracking-tight group-hover:drop-shadow-[0_0_8px_rgba(255,79,79,0.3)] transition-all">{item.amount}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Grid Pattern Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>
    </div>
  );
};

export default Landing;
