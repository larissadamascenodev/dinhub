import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PiggyBank, 
  ArrowRight, 
  Wallet, 
  Shield, 
  Zap, 
  Menu,
  X,
  Star,
  CheckCircle2,
  TrendingUp,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Huby Mascot Component
const HubyMascot = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div 
      animate={{ y: [0, -15, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className={`relative w-40 h-40 md:w-56 md:h-56 ${className}`}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
      
      {/* 3D Mascot CSS Construction */}
      <div className="relative w-full h-full">
        {/* Main Body */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-[40%] bg-gradient-to-br from-[#1a1a1a] to-[#000] border-2 border-primary/40 shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden">
          {/* Inner details / circuitry */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)]" />
          <div className="absolute top-[20%] left-0 right-0 h-px bg-primary/20" />
          <div className="absolute bottom-[20%] left-0 right-0 h-px bg-primary/20" />
          
          {/* Face Area */}
          <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[70%] h-[35%] rounded-full bg-black/60 backdrop-blur-md border border-primary/30 flex items-center justify-center gap-6">
            {/* Eyes */}
            <motion.div 
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.95, 1] }}
              className="w-4 h-4 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" 
            />
            <motion.div 
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, times: [0, 0.95, 1] }}
              className="w-4 h-4 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" 
            />
          </div>
          
          {/* Interactive Mouth/Status */}
          <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary/40" />
        </div>
        
        {/* Floating Ears/Antennas */}
        <motion.div 
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-[5%] left-[20%] w-10 h-10 rounded-xl bg-gradient-to-br from-primary/80 to-primary/20 border border-primary/40 rotate-12 flex items-center justify-center"
        >
          <div className="w-4 h-4 bg-white/20 rounded-sm" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="absolute -top-[5%] right-[20%] w-10 h-10 rounded-xl bg-gradient-to-br from-primary/80 to-primary/20 border border-primary/40 -rotate-12 flex items-center justify-center"
        >
          <div className="w-4 h-4 bg-white/20 rounded-sm" />
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

          {/* Desktop Links */}
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

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden p-2 text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
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
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-12 overflow-hidden">
        {/* Ambient Gradients */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none opacity-40" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 blur-[180px] rounded-full pointer-events-none opacity-30" />
        
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="space-y-10 max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
              {/* Social Proof Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-xl shadow-xl"
              >
                <div className="flex -space-x-2.5">
                  {AVATAR_URLS.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-7 h-7 rounded-full border-2 border-[#0a0a0a] object-cover" />
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-primary fill-primary" />)}
                  </div>
                  <span className="text-[11px] font-bold text-white/80 tracking-wide uppercase">
                    +4.200 USUÁRIOS ATIVOS
                  </span>
                </div>
              </motion.div>

              {/* Headline */}
              <div className="space-y-4">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="font-display text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95] text-white"
                >
                  Controle total da sua vida <br />
                  <span className="text-primary italic">financeira.</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed max-w-lg mx-auto lg:mx-0"
                >
                  Organize suas contas, planeje seu futuro e tome decisões inteligentes com o assistente que entende seus hábitos.
                </motion.p>
              </div>

              {/* CTA & Features */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-8"
              >
                <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
                  <Button 
                    onClick={() => user ? navigate("/dashboard") : openAuth("signup")}
                    className="w-full sm:w-auto h-16 px-10 text-base font-black rounded-2xl bg-primary text-black hover:scale-105 transition-all duration-300 shadow-[0_15px_40px_rgba(0,230,118,0.3)] group"
                  >
                    COMEÇAR AGORA GRÁTIS
                    <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  <button className="flex items-center gap-2.5 text-white/60 hover:text-white font-bold text-sm transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    VER DEMONSTRAÇÃO
                  </button>
                </div>

                {/* Features Row */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3">
                  {[
                    { icon: CheckCircle2, text: "Sem anuidade" },
                    { icon: Shield, text: "100% Seguro" },
                    { icon: Zap, text: "Instantâneo" }
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <f.icon className="w-4 h-4 text-primary" />
                      <span className="text-[11px] font-bold text-white/40 tracking-widest uppercase">{f.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Content - Person & Mascot & Floating UI */}
            <div className="relative flex justify-center lg:justify-end">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative w-full max-w-[500px] aspect-[4/5] rounded-[3rem] overflow-hidden group shadow-2xl border border-white/5"
              >
                {/* Main AI Person Image */}
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1000&auto=format&fit=crop&q=80" 
                  alt="Person checking finance" 
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                
                {/* Floating Huby Mascot */}
                <HubyMascot className="absolute -top-10 -left-10 md:-left-20 scale-75 md:scale-100 z-20" />

                {/* Floating UI Elements */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[20%] right-[-5%] bg-black/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl z-10 hidden sm:block"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Economia este mês</p>
                      <p className="text-xl font-black text-white">+R$ 1.240,00</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-[15%] left-[-10%] bg-black/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl z-10 hidden sm:block"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Meta: Viagem Japão</p>
                      <div className="w-32 h-2 bg-white/5 rounded-full mt-2 overflow-hidden">
                        <div className="w-[75%] h-full bg-primary" />
                      </div>
                      <p className="text-[10px] font-black text-white mt-1">75% CONCLUÍDO</p>
                    </div>
                  </div>
                </motion.div>
                
                {/* Mobile Mascot positioning */}
                <div className="sm:hidden absolute bottom-4 right-4 scale-50 opacity-80">
                  <HubyMascot />
                </div>
              </motion.div>
              
              {/* Decorative elements behind the image */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 blur-[100px] rounded-full" />
            </div>

          </div>
        </div>
      </section>

      {/* Trust Section / Logos */}
      <section className="py-16 border-y border-white/5 bg-black/40">
        <div className="container mx-auto px-6">
          <p className="text-center text-[10px] font-black text-white/20 tracking-[0.3em] uppercase mb-10">
            PROTEGIDO PELAS MELHORES TECNOLOGIAS DE SEGURANÇA
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale">
            <div className="text-xl font-bold italic tracking-tighter">BITDEFENDER</div>
            <div className="text-xl font-bold tracking-tighter">SUPABASE</div>
            <div className="text-xl font-bold tracking-tighter">LOVABLE</div>
            <div className="text-xl font-bold tracking-tighter">STRIPE</div>
          </div>
        </div>
      </section>
      
      {/* Basic Footer for now */}
      <footer className="py-20 bg-[#050505] border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg">
                  <PiggyBank className="w-5 h-5 text-black" />
                </div>
                <span className="font-display text-xl font-black tracking-tighter">DinHub</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Transformando a relação das pessoas com o dinheiro através de tecnologia e inteligência artificial.
              </p>
            </div>
            
            {[
              { title: "Produto", links: ["Funcionalidades", "Segurança", "App Mobile"] },
              { title: "Empresa", links: ["Sobre nós", "Blog", "Carreiras"] },
              { title: "Legal", links: ["Termos de Uso", "Privacidade", "Cookies"] }
            ].map((col) => (
              <div key={col.title} className="space-y-6">
                <h4 className="text-sm font-black uppercase tracking-widest text-white/80">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map(link => (
                    <li key={link}><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-muted-foreground font-medium">
              © {new Date().getFullYear()} DinHub Finance. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <a href="/termos-de-uso" className="text-xs text-muted-foreground hover:text-white transition-colors">Termos</a>
              <a href="/politica-privacidade" className="text-xs text-muted-foreground hover:text-white transition-colors">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
