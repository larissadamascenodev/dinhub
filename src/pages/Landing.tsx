import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  PiggyBank, 
  ArrowRight, 
  Wallet, 
  Shield, 
  Zap, 
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled ? "bg-background/80 backdrop-blur-md py-3 border-border/50" : "bg-transparent py-5 border-transparent"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/20">
              <PiggyBank className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              Din<span className="text-primary">Hub</span>
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Como funciona</a>
            <a href="#precos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Preços</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button 
                variant="ghost" 
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </Button>
            ) : (
              <>
                <button 
                  onClick={() => openAuth("login")}
                  className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
                >
                  Entrar
                </button>
                <Button 
                  onClick={() => openAuth("signup")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm px-6 rounded-xl shadow-[0_0_20px_rgba(0,230,118,0.2)]"
                >
                  Começar agora
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-6 space-y-4 shadow-2xl"
            >
                <div className="flex flex-col gap-4">
                    <a href="#funcionalidades" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium">Funcionalidades</a>
                    <a href="#como-funciona" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium">Como funciona</a>
                    <a href="#precos" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium">Preços</a>
                </div>
                <div className="pt-4 flex flex-col gap-3">
                    <Button variant="outline" onClick={() => openAuth("login")} className="w-full justify-center rounded-xl border-border/50">
                        Entrar
                    </Button>
                    <Button onClick={() => openAuth("signup")} className="w-full justify-center rounded-xl bg-primary text-primary-foreground">
                        Criar Conta Grátis
                    </Button>
                </div>
            </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-primary/3 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
            {/* Social Proof Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-md"
            >
              <div className="flex -space-x-2">
                {AVATAR_URLS.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-6 h-6 rounded-full border-2 border-[#0a0a0a]" />
                ))}
              </div>
              <span className="text-[11px] md:text-xs font-bold text-primary tracking-tight">
                +2.847 pessoas já assumiram o controle
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl md:text-7xl font-extrabold tracking-tight leading-[1.1]"
            >
              Assuma o controle total da sua <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-primary/80">
                vida financeira.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-muted-foreground text-base md:text-xl max-w-2xl leading-relaxed"
            >
              Organize suas contas, planeje seu futuro e tome decisões mais inteligentes com o assistente financeiro que entende seus hábitos.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Button 
                onClick={() => user ? navigate("/dashboard") : openAuth("signup")}
                size="lg" 
                className="w-full sm:w-auto px-10 py-7 text-base font-bold rounded-2xl bg-primary text-primary-foreground hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(0,230,118,0.3)]"
              >
                {user ? "Acessar Dashboard" : "Começar agora grátis"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto px-10 py-7 text-base font-bold rounded-2xl border-border/60 hover:bg-card/50 transition-all duration-300"
              >
                Ver demonstração
              </Button>
            </motion.div>

            {/* Trusted By / Features Pills */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="pt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-muted-foreground/60"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary/40" />
                <span className="text-xs font-medium">Dados Criptografados</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary/40" />
                <span className="text-xs font-medium">Análise em Tempo Real</span>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary/40" />
                <span className="text-xs font-medium">Gestão Multicontas</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Visual Decoration - App Preview Placeholder */}
        <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 px-6 container mx-auto"
        >
            <div className="relative mx-auto max-w-5xl rounded-3xl border border-border/50 bg-card/30 p-2 backdrop-blur-sm shadow-2xl">
                <div className="aspect-[16/9] bg-gradient-to-br from-[#111] to-[#050505] rounded-2xl overflow-hidden flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611974717483-36009c60a4d7?w=1200&auto=format&fit=crop&q=60')] bg-cover bg-center opacity-20 mix-blend-luminosity" />
                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center animate-pulse">
                            <Zap className="w-10 h-10 text-primary" />
                        </div>
                        <span className="text-primary font-bold tracking-widest uppercase text-xs">Preview do Dashboard</span>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
            </div>
        </motion.div>
      </section>
      
      {/* Basic Footer for now */}
      <footer className="py-12 border-t border-border/30 bg-[#050505]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-primary" />
                <span className="font-display text-lg font-bold">DinHub</span>
            </div>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} DinHub Finance. Todos os direitos reservados.</p>
            <div className="flex gap-6">
                <a href="/termos-de-uso" className="text-xs text-muted-foreground hover:text-primary transition-colors">Termos</a>
                <a href="/politica-privacidade" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacidade</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
