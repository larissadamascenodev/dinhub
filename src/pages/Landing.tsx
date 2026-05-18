import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PiggyBank, 
  ArrowRight, 
  Shield, 
  Zap, 
  Menu,
  X,
  Star,
  CheckCircle2,
  TrendingUp,
  Target,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Huby Mascot Component Refined
const HubyMascot = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div 
      animate={{ y: [0, -20, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className={`relative w-48 h-48 md:w-64 md:h-64 ${className}`}
    >
      <div className="absolute inset-0 bg-primary/25 blur-[80px] rounded-full animate-pulse" />
      
      <div className="relative w-full h-full perspective-1000">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] rounded-[45%] bg-gradient-to-br from-[#1a1a1a] via-[#050505] to-[#000] border-2 border-primary/50 shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_2px_10px_rgba(0,230,118,0.2)] overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,230,118,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,230,118,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-10" />
          
          <div className="absolute top-[32%] left-1/2 -translate-x-1/2 w-[75%] h-[40%] rounded-[2rem] bg-black/70 backdrop-blur-xl border border-primary/40 flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(0,230,118,0.1)]">
            <div className="flex items-center gap-8 mb-2">
              <div className="relative">
                <motion.div 
                  animate={{ scaleY: [1, 0.1, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 5, repeat: Infinity, times: [0, 0.95, 1] }}
                  className="w-5 h-5 rounded-full bg-primary shadow-[0_0_15px_var(--primary)]" 
                />
              </div>
              <div className="relative">
                <motion.div 
                  animate={{ scaleY: [1, 0.1, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 5, repeat: Infinity, times: [0, 0.95, 1], delay: 0.1 }}
                  className="w-5 h-5 rounded-full bg-primary shadow-[0_0_15px_var(--primary)]" 
                />
              </div>
            </div>
            
            <motion.div 
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-1 rounded-full bg-primary/60 shadow-[0_0_10px_var(--primary)]"
            />
          </div>
          <div className="absolute top-4 left-8 w-1/2 h-1/4 bg-white/5 rounded-full blur-xl rotate-[-35deg]" />
        </div>
        
        <motion.div 
          animate={{ rotate: [12, 18, 12], y: [0, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[5%] left-[10%] w-14 h-14 rounded-2xl bg-[#111] border border-primary/40 shadow-xl flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
          <Zap className="w-6 h-6 text-primary drop-shadow-[0_0_5px_rgba(0,230,118,0.5)]" />
        </motion.div>
        
        <motion.div 
          animate={{ rotate: [-12, -18, -12], y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute -top-[5%] right-[10%] w-14 h-14 rounded-2xl bg-[#111] border border-primary/40 shadow-xl flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
          <Shield className="w-6 h-6 text-primary drop-shadow-[0_0_5px_rgba(0,230,118,0.5)]" />
        </motion.div>
      </div>
    </motion.div>
  );
};

const Landing = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openAuth = (view: "login" | "signup") => {
    setAuthView(view);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const AVATAR_URLS = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground selection:bg-primary/30 font-sans overflow-x-hidden">
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        defaultView={authView} 
      />

      {/* Navbar */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
          scrolled ? "bg-black/80 backdrop-blur-xl py-3 border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]" : "bg-transparent py-6 border-transparent"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="bg-primary p-2 rounded-xl shadow-[0_0_20px_rgba(0,230,118,0.4)] transition-transform group-hover:scale-110">
              <PiggyBank className="w-6 h-6 text-black" />
            </div>
            <span className="font-display text-2xl font-black tracking-tighter">
              Din<span className="text-primary">Hub</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {["Funcionalidades", "Como funciona", "Preços"].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(" ", "-")}`} 
                className="text-[13px] font-bold text-muted-foreground hover:text-primary transition-all duration-300 tracking-wide uppercase"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Button 
                onClick={() => navigate("/dashboard")}
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl px-6 font-bold"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <button 
                  onClick={() => openAuth("login")}
                  className="text-sm font-bold text-muted-foreground hover:text-white transition-colors px-4 py-2"
                >
                  Entrar
                </button>
                <Button 
                  onClick={() => openAuth("signup")}
                  className="bg-primary hover:bg-primary/90 text-black font-extrabold text-sm px-8 h-11 rounded-xl shadow-[0_0_25px_rgba(0,230,118,0.3)] hover:scale-105 transition-all duration-300"
                >
                  CRIAR CONTA GRÁTIS
                </Button>
              </>
            )}
          </div>

          <button className="lg:hidden p-2 text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
              <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-2xl border-b border-white/10 overflow-hidden shadow-2xl"
              >
                  <div className="container mx-auto px-6 py-8 space-y-6">
                      <div className="flex flex-col gap-6">
                          {["Funcionalidades", "Como funciona", "Preços"].map((item) => (
                            <a 
                              key={item} 
                              href={`#${item.toLowerCase().replace(" ", "-")}`} 
                              onClick={() => setMobileMenuOpen(false)} 
                              className="text-lg font-bold text-muted-foreground hover:text-primary transition-colors"
                            >
                              {item}
                            </a>
                          ))}
                      </div>
                      <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                          <Button variant="outline" onClick={() => openAuth("login")} className="w-full justify-center rounded-xl border-white/10 bg-white/5 text-white h-14 font-bold">
                              Entrar
                          </Button>
                          <Button onClick={() => openAuth("signup")} className="w-full justify-center rounded-xl bg-primary text-black h-14 font-extrabold shadow-[0_0_20px_rgba(0,230,118,0.2)]">
                              CRIAR CONTA GRÁTIS
                          </Button>
                      </div>
                  </div>
              </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/10 blur-[200px] rounded-full pointer-events-none opacity-40 animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[900px] h-[900px] bg-primary/10 blur-[250px] rounded-full pointer-events-none opacity-30 animate-pulse" />
        
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_90%)]" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            
            {/* Left Content */}
            <div className="space-y-12 max-w-3xl mx-auto lg:mx-0 text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-4 px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-2xl shadow-2xl"
              >
                <div className="flex -space-x-3">
                  {AVATAR_URLS.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] object-cover ring-2 ring-primary/20" />
                  ))}
                </div>
                <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-primary fill-primary" />)}
                  </div>
                  <span className="text-[12px] font-black text-white/90 tracking-tight uppercase">
                    +4.200 <span className="text-white/50 font-medium tracking-normal">USUÁRIOS ATIVOS</span>
                  </span>
                </div>
              </motion.div>

              <div className="space-y-6">
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="font-display text-6xl md:text-[90px] font-black tracking-[-0.06em] leading-[0.85] text-white"
                >
                  Controle financeiro <br />
                  <span className="text-primary italic">de um jeito que você nunca viu.</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-muted-foreground text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0"
                >
                  A primeira inteligência artificial que organiza suas contas, prevê o futuro do seu dinheiro e te ajuda a economizar de verdade.
                </motion.p>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-12"
              >
                <div className="flex flex-col sm:flex-row items-center gap-8 justify-center lg:justify-start">
                  <Button 
                    onClick={() => user ? navigate("/dashboard") : openAuth("signup")}
                    className="w-full sm:w-auto h-20 px-14 text-xl font-black rounded-[2.5rem] bg-primary text-black hover:scale-105 transition-all duration-500 shadow-[0_25px_60px_rgba(0,230,118,0.5)] group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center">
                      COMEÇAR AGORA GRÁTIS
                      <ArrowRight className="ml-5 w-7 h-7 group-hover:translate-x-3 transition-transform duration-500" />
                    </span>
                  </Button>
                  
                  <button className="flex items-center gap-5 text-white/80 hover:text-white font-black text-lg transition-all duration-300 group">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-primary/50 transition-all duration-500 shadow-2xl">
                      <Zap className="w-7 h-7 text-primary animate-pulse" />
                    </div>
                    VER DEMONSTRAÇÃO
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-12 gap-y-6">
                  {[
                    { icon: CheckCircle2, text: "Sem anuidade" },
                    { icon: Shield, text: "100% Seguro" },
                    { icon: Zap, text: "Instantâneo" }
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <f.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-[13px] font-bold text-white/30 tracking-[0.2em] uppercase">{f.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Content - Visual */}
            <div className="relative flex justify-center lg:justify-end py-20 lg:py-0">
              <motion.div 
                initial={{ opacity: 0, scale: 0.85, rotateY: -10 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-[580px] aspect-[4/5] rounded-[5rem] group shadow-[0_0_120px_rgba(0,0,0,0.6)] border border-white/5 bg-[#050505] overflow-visible"
              >
                <div className="absolute inset-0 rounded-[5rem] overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&auto=format&fit=crop&q=95" 
                    alt="DinHub AI Person" 
                    className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-[1.5s] group-hover:scale-110"
                  />
                  <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent z-10 shadow-[0_0_20px_var(--primary)]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-40" />
                </div>
                
                <HubyMascot className="absolute -top-20 -left-20 md:-left-32 z-40 drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)] scale-110" />

                {/* Floating UI Elements */}
                <motion.div 
                  animate={{ y: [0, -20, 0], x: [0, 5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[10%] -right-16 md:-right-24 bg-black/90 backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-30 group/card hover:border-primary/60 transition-all duration-500"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-primary/20 flex items-center justify-center shadow-lg group-hover/card:scale-110 transition-transform duration-500">
                      <TrendingUp className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-[12px] font-black text-white/40 uppercase tracking-[0.25em] mb-2">Economia Prevista</p>
                      <p className="text-3xl font-black text-white">+R$ 1.240,00</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 20, 0], x: [0, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-[15%] -left-16 md:-left-24 bg-black/90 backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-30 group/card hover:border-primary/60 transition-all duration-500"
                >
                  <div className="flex items-center gap-6">
                    <div className="relative w-20 h-20">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path className="text-white/5 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <motion.path 
                          initial={{ strokeDasharray: "0, 100" }}
                          animate={{ strokeDasharray: "84, 100" }}
                          transition={{ duration: 3, delay: 1.5, ease: "easeOut" }}
                          className="text-primary stroke-current" 
                          strokeWidth="3.5" 
                          strokeLinecap="round" 
                          fill="none" 
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-black text-white">84</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[12px] font-black text-white/40 uppercase tracking-[0.25em] mb-2">Score Financeiro</p>
                      <p className="text-2xl font-black text-primary italic">EXCELENTE</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 2.5 }}
                  className="absolute -bottom-10 right-12 bg-gradient-to-r from-primary via-primary/80 to-primary p-[1.5px] rounded-3xl shadow-[0_20px_50px_rgba(0,230,118,0.4)] z-50 hidden md:block"
                >
                  <div className="bg-black/95 backdrop-blur-3xl px-8 py-5 rounded-[calc(1.5rem-1.5px)] flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-1">Gasto Identificado</p>
                      <p className="text-lg font-black text-white">Mercado: R$ 142,50</p>
                    </div>
                    <ArrowUpRight className="w-6 h-6 text-white/30 ml-4" />
                  </div>
                </motion.div>
              </motion.div>
              
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] bg-primary/5 blur-[150px] rounded-full" />
            </div>

          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 border-y border-white/5 bg-black/40 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <p className="text-center text-[12px] font-black text-white/30 tracking-[0.4em] uppercase mb-16">
            PROTEGIDO PELAS MELHORES TECNOLOGIAS DO MUNDO
          </p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 opacity-25 grayscale hover:opacity-60 transition-opacity duration-500">
            <div className="text-2xl font-black italic tracking-tighter">BITDEFENDER</div>
            <div className="text-2xl font-black tracking-tighter">SUPABASE</div>
            <div className="text-2xl font-black tracking-tighter">LOVABLE</div>
            <div className="text-2xl font-black tracking-tighter">STRIPE</div>
          </div>
        </div>
      </section>
      
      {/* Basic Footer */}
      <footer className="py-24 bg-[#050505] border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-xl">
                  <PiggyBank className="w-6 h-6 text-black" />
                </div>
                <span className="font-display text-2xl font-black tracking-tighter">DinHub</span>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed font-medium">
                Transformando a relação das pessoas com o dinheiro através de tecnologia e inteligência artificial.
              </p>
            </div>
            
            {[
              { title: "Produto", links: ["Funcionalidades", "Segurança", "App Mobile"] },
              { title: "Empresa", links: ["Sobre nós", "Blog", "Carreiras"] },
              { title: "Legal", links: ["Termos de Uso", "Privacidade", "Cookies"] }
            ].map((col) => (
              <div key={col.title} className="space-y-8">
                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/80">{col.title}</h4>
                <ul className="space-y-5">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-[15px] text-muted-foreground hover:text-primary transition-colors font-semibold">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-sm text-muted-foreground font-semibold">
              © {new Date().getFullYear()} DinHub Finance. Todos os direitos reservados.
            </p>
            <div className="flex gap-10">
              <a href="/termos-de-uso" className="text-sm text-muted-foreground hover:text-white transition-colors font-medium">Termos</a>
              <a href="/politica-privacidade" className="text-sm text-muted-foreground hover:text-white transition-colors font-medium">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
