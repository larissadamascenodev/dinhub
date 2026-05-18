import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { 
  Play, 
  Target, 
  Bell, 
  Shield, 
  Menu,
  X,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { CustomCursor } from "@/components/ui/CustomCursor";

const Grain = () => (
  <div className="fixed inset-0 pointer-events-none z-[60] opacity-[0.03] contrast-150 brightness-100">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  </div>
);

const Landing = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Parallax Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) / 25;
    const moveY = (clientY - window.innerHeight / 2) / 25;
    mouseX.set(moveX);
    mouseY.set(moveY);
  };

  const openAuth = (view: "login" | "signup") => {
    setAuthView(view);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#00ff7b]/30 overflow-x-hidden"
    >
      <CustomCursor />
      <Grain />
      
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        defaultView={authView} 
      />

      {/* Premium Navbar */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[1200px] z-[100]">
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-between items-center px-6 py-3 rounded-full bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ff7b] to-[#00cc62] flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <TrendingUp size={18} className="text-black" />
            </div>
            <span className="text-xl font-display font-black tracking-tighter">
              Din<span className="text-[#00ff7b]">Hub</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {['Funcionalidades', 'Metodologia', 'Preços'].map((item) => (
              <a 
                key={item}
                href="#" 
                className="text-sm font-medium text-white/40 hover:text-[#00ff7b] transition-colors tracking-tight"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => openAuth("login")}
              className="hidden md:block px-5 py-2 text-sm font-bold text-white/60 hover:text-white transition-colors"
            >
              Entrar
            </button>
            <button 
              onClick={() => openAuth("signup")}
              className="px-6 py-2.5 rounded-full bg-[#00ff7b] text-black font-black text-sm shadow-[0_4px_20px_rgba(0,255,123,0.3)] hover:shadow-[0_8px_30px_rgba(0,255,123,0.5)] transition-all hover:scale-105 active:scale-95"
            >
              Começar
            </button>
            <button className="lg:hidden p-2 text-white/70" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu size={20} />
            </button>
          </div>
        </motion.nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 px-6 lg:px-[80px]">
        {/* Abstract Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            style={{ x: mouseX, y: mouseY }}
            className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] bg-[#00ff7b]/10 blur-[150px] rounded-full opacity-40" 
          />
          <motion.div 
            style={{ x: useMotionValue(0), y: useMotionValue(0) }} // Static for contrast
            className="absolute bottom-[0%] right-[0%] w-[50vw] h-[50vw] bg-blue-600/5 blur-[180px] rounded-full opacity-30" 
          />
        </div>

        <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Typographic Column */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] backdrop-blur-md mb-8"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff7b] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Liderando a Revolução Financeira</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[14vw] md:text-[9vw] lg:text-[110px] font-display font-black leading-[0.85] tracking-[-0.06em] mb-10"
            >
              Onde seu <br />
              <span className="text-[#00ff7b] italic font-serif relative">
                dinheiro
                <motion.span 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1, duration: 1.5 }}
                  className="absolute -bottom-2 left-0 h-1 bg-white/10"
                />
              </span> <br />
              faz sentido.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-lg md:text-xl text-white/40 max-w-[500px] leading-relaxed mb-12 font-medium tracking-tight"
            >
              DinHub não é um app de finanças. É a inteligência artificial que protege seu futuro, integrando cada transação em uma narrativa de liberdade.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-6 items-start sm:items-center"
            >
              <button 
                onClick={() => user ? navigate("/dashboard") : openAuth("signup")}
                className="group relative h-[72px] px-10 rounded-2xl bg-[#00ff7b] text-black font-black text-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Comece a jornada <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
              </button>
              
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center group-hover:bg-[#00ff7b]/10 transition-colors">
                  <Play size={18} className="text-white group-hover:text-[#00ff7b] fill-current" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white group-hover:text-[#00ff7b] transition-colors">Ver demo</p>
                  <p className="text-xs text-white/30 font-medium">2 minutos de tour</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Visual Showcase Column */}
          <div className="lg:col-span-5 relative h-[500px] lg:h-[700px] flex items-center justify-center">
            {/* Integrated Image Background */}
            <motion.div 
              style={{ x: useMotionValue(0), y: useMotionValue(0) }}
              className="absolute inset-0 z-0 scale-110 opacity-30 pointer-events-none"
            >
              <div 
                className="w-full h-full bg-cover bg-center grayscale mix-blend-luminosity brightness-50"
                style={{ 
                  backgroundImage: "url('https://images.unsplash.com/photo-1573163715152-498477dffa85?q=80&w=2069')",
                  maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
                  WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                }}
              />
            </motion.div>

            {/* Floating Bento Stack */}
            <div className="relative w-full max-w-[450px] z-10 flex flex-col gap-5">
              {[
                { label: 'Saldo Total', value: 'R$ 12.450,00', trend: '+12%', icon: <TrendingUp size={20} />, color: '#00ff7b', delay: 0 },
                { label: 'Gastos Fixos', value: 'R$ 4.200', trend: '-2%', icon: <CreditCard size={20} />, color: '#3b82f6', delay: 0.1 },
                { label: 'Reserva de Emergência', value: 'R$ 2.000', trend: 'Em progresso', icon: <Shield size={20} />, color: '#f59e0b', delay: 0.2 }
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.5 + card.delay, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ x: -10, scale: 1.02 }}
                  className="p-6 rounded-[32px] bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.4)] group transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${card.color}15`, color: card.color }}
                    >
                      {card.icon}
                    </div>
                    <span className="text-[10px] font-black px-2 py-1 rounded-full bg-white/5 text-white/40 uppercase tracking-widest group-hover:text-white transition-colors">
                      {card.trend}
                    </span>
                  </div>
                  <p className="text-white/30 text-xs font-bold uppercase tracking-wider mb-1">{card.label}</p>
                  <h3 className="text-2xl font-black tracking-tight">{card.value}</h3>
                </motion.div>
              ))}

              {/* Security Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="absolute -bottom-10 -left-10 p-5 rounded-3xl bg-white/[0.02] border border-white/[0.1] backdrop-blur-xl flex items-center gap-4 hidden lg:flex"
              >
                <div className="w-10 h-10 rounded-full bg-[#00ff7b]/20 flex items-center justify-center text-[#00ff7b]">
                  <Lock size={18} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white/50">Criptografia</p>
                  <p className="text-sm font-bold text-white">Nível Bancário 256-bit</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust/Social Proof */}
      <section className="py-20 px-6 border-t border-white/[0.03]">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-12">Empoderando o futuro financeiro de:</p>
          <div className="flex flex-wrap justify-center gap-x-16 gap-y-10 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
            {['Apple', 'Stripe', 'Revolut', 'Wise', 'Nubank'].map((brand) => (
              <span key={brand} className="text-2xl font-display font-black tracking-tighter cursor-default">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Styles for Serif font in italic */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital@1&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
};

export default Landing;
