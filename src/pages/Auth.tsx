import React, { useState, useEffect } from "react";
import ContactModal from "@/components/shared/ContactModal";
import LegalModal from "@/components/shared/LegalModal";
import VisaoGeral from "@/components/landing/VisaoGeral";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Eye, EyeOff, ArrowRight, Mail, Lock,
  PiggyBank, MessageCircle, Mic, Image, Zap, Shield, User, Check,
  Wallet, BarChart3, Bell, Brain
} from "lucide-react";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};

const features = [
  { icon: <Wallet className="w-4 h-4" />, title: "Controle total", desc: "Receitas, despesas e cartões reunidos em um só lugar" },
  { icon: <Brain className="w-4 h-4" />, title: "Assistente financeiro", desc: "Analisa seus hábitos e sugere melhorias personalizadas" },
  { icon: <BarChart3 className="w-4 h-4" />, title: "Projeções inteligentes", desc: "Acompanhe projeções do seu dinheiro para o futuro" },
  { icon: <Shield className="w-4 h-4" />, title: "Radar financeiro", desc: "Entenda para onde seu dinheiro está indo de verdade" },
];

const AVATAR_URLS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
];

const Auth = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);

  const openAuthModal = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setIsAuthModalOpen(true);
  };

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <PiggyBank className="w-8 h-8 text-primary animate-pulse" />
          <span className="text-muted-foreground text-sm">Carregando...</span>
        </motion.div>
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error("Digite seu email primeiro");
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar email de recuperação");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (!isLogin && !fullName.trim()) {
      toast.error("Preencha seu nome completo");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (!isLogin && !acceptedTerms) {
      toast.error("Você precisa aceitar os termos para continuar");
      return;
    }
    setSubmitting(true);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Kick off data prefetch immediately so dashboard is ready by the time we navigate
        if (data.session?.user) {
          const now = new Date();
          const { prefetchDashboardData } = await import("@/services/dashboardData");
          void prefetchDashboardData(now.getMonth(), now.getFullYear(), {
            userId: data.session.user.id,
            includeHistorical: false,
          }).catch(() => {});
        }
        toast.success("Login realizado com sucesso!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: fullName.trim() },
          },
        });
        if (error) throw error;
        toast.success("Conta criada com sucesso!");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar sua solicitação");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Reusable sub-sections ── */




  const SocialProofBadge = ({ className = "", mobile = false }: { className?: string; mobile?: boolean }) => (
    <span className={`inline-flex items-center gap-1.5 bg-primary/10 text-primary font-medium rounded-full border border-primary/15 backdrop-blur-sm ${mobile ? "text-[8px] px-2.5 py-1 mx-auto" : "text-[10px] px-3 py-1.5 mx-auto"} ${className}`}>
      <span className="flex -space-x-1.5">
        {AVATAR_URLS.map((url, i) => (
          <img
            key={i}
            src={url}
            alt=""
            className={`rounded-full border border-background object-cover ${mobile ? "w-3.5 h-3.5" : "w-4 h-4"}`}
          />
        ))}
      </span>
      +2.847 pessoas controlando suas finanças
    </span>
  );

  const HeadlineSection = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="text-center">
      <h1 className={`font-display font-bold leading-[1.1] text-foreground ${mobile ? "text-2xl" : "text-4xl xl:text-6xl"}`}>
        Assuma o controle{" "}
        total da sua{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">
          vida financeira.
        </span>
      </h1>
      <p className={`text-muted-foreground leading-relaxed mx-auto ${mobile ? "mt-1.5 text-[11px]" : "mt-6 text-lg max-w-2xl"}`}>
        Organize suas finanças, entenda para onde seu dinheiro vai e acompanhe a evolução do seu patrimônio em tempo real.
      </p>
    </div>
  );

  const InputMethodsPill = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`inline-flex items-center gap-1 bg-gradient-to-r from-primary/10 via-card/50 to-primary/5 border border-primary/15 rounded-full text-muted-foreground backdrop-blur-sm mx-auto ${mobile ? "text-[8px] px-2.5 py-1" : "text-[10px] px-4 py-2 gap-2"}`}>
      <span className="text-foreground/70 font-medium">Registre via</span>
      <span className="flex items-center gap-0.5 text-primary font-semibold"><MessageCircle className={mobile ? "w-2 h-2" : "w-3 h-3"} /> texto</span>
      <span className="text-primary/30">|</span>
      <span className="flex items-center gap-0.5 text-primary/80"><Mic className={mobile ? "w-2 h-2" : "w-3 h-3"} /> áudio</span>
      <span className="text-primary/30">|</span>
      <span className="flex items-center gap-0.5 text-primary/80"><Image className={mobile ? "w-2 h-2" : "w-3 h-3"} /> foto</span>
      <Zap className={`${mobile ? "w-2 h-2" : "w-3 h-3"} text-primary ml-0.5`} />
    </div>
  );

  const FeaturesGrid = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`grid ${mobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"} gap-3 w-full`}>
      {features.map((f) => (
        <div
          key={f.title}
          className={`flex items-center gap-3 bg-card/40 border border-border/40 rounded-2xl backdrop-blur-sm ${mobile ? "px-3 py-2.5" : "p-4"}`}
        >
          <div className={`${mobile ? "w-8 h-8 rounded-lg" : "w-10 h-10 rounded-xl"} bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0`}>
            {React.cloneElement(f.icon, { className: mobile ? "w-4 h-4" : "w-5 h-5" })}
          </div>
          <div className="text-left min-w-0">
            <p className={`font-bold text-foreground leading-none ${mobile ? "text-[11px]" : "text-sm"}`}>{f.title}</p>
            <p className={`text-muted-foreground leading-tight mt-1.5 ${mobile ? "text-[9px]" : "text-xs"}`}>{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const testimonials = [
    {
      name: "Rafael M.",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      text: "Finalmente consigo enxergar para onde meu dinheiro vai. O DinHub me deu o controle que eu precisava para organizar minha vida financeira.",
    },
    {
      name: "Camila S.",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
      text: "Nunca fui de anotar gastos, mas com o DinHub virou hábito. Em 2 meses já consegui juntar minha primeira reserva de emergência!",
    },
    {
      name: "Lucas P.",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
      text: "O melhor app financeiro que já usei. As projeções inteligentes me ajudaram a planejar uma viagem sem apertar o orçamento.",
    },
    {
      name: "Fernanda R.",
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
      text: "Uso todos os dias! As metas visuais me motivam demais. Já alcancei 3 objetivos financeiros em menos de 6 meses.",
    },
    {
      name: "João V.",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
      text: "Simples, bonito e funcional. Recomendo para qualquer pessoa que quer ter mais controle sobre as finanças pessoais.",
    },
  ];

  const TestimonialCard = ({ mobile = false }: { mobile?: boolean }) => {
    const [activeIdx, setActiveIdx] = React.useState(0);

    React.useEffect(() => {
      const interval = setInterval(() => {
        setActiveIdx((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }, []);

    const t = testimonials[activeIdx];

    return (
      <div className={`bg-card/40 border border-border/60 rounded-xl ${mobile ? "p-3.5" : "p-5"} backdrop-blur-sm space-y-2 overflow-hidden`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2.5">
              <img
                src={t.photo}
                alt=""
                className="w-8 h-8 rounded-full object-cover border border-primary/20"
              />
              <div>
                <p className="text-xs font-semibold text-foreground">{t.name}</p>
                <div className="flex gap-0.5 text-yellow-400 text-[10px]">★★★★★</div>
              </div>
            </div>
            <p className={`text-muted-foreground italic leading-relaxed ${mobile ? "text-[11px]" : "text-xs"}`}>
              "{t.text}"
            </p>
          </motion.div>
        </AnimatePresence>
        {/* Dots */}
        <div className="flex justify-center gap-1.5 pt-1">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === activeIdx ? "bg-primary w-4" : "bg-muted-foreground/30"}`}
            />
          ))}
        </div>
      </div>
    );
  };

  /* ── Auth form card ── */
  const renderAuthFormCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="bg-card/30 border border-border/50 rounded-2xl p-5 sm:p-7 backdrop-blur-md space-y-4 sm:space-y-5"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? "login" : "signup"}
          initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
          transition={{ duration: 0.25 }}
        >
          <h2 className="text-lg font-semibold text-foreground">
            {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isLogin ? "Entre para continuar gerenciando suas finanças" : "Comece a controlar suas finanças agora"}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Google OAuth only — signup requires terms */}
      <button
        type="button"
        onClick={async () => {
          if (!isLogin && !acceptedTerms) {
            toast.error("Você precisa aceitar os termos para continuar");
            return;
          }
          const { error } = await lovable.auth.signInWithOAuth("google", {
            redirect_uri: window.location.origin,
          });
          if (error) toast.error("Erro ao entrar com Google");
        }}
        className="flex items-center justify-center gap-2.5 w-full h-10 rounded-xl border border-border/60 bg-card/40 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm text-xs text-muted-foreground"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuar com Google
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/40" />
        </div>
        <div className="relative flex justify-center text-[10px]">
          <span className="bg-background/80 px-3 text-muted-foreground backdrop-blur-sm">ou continue com email</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {!isLogin && (
          <div className="relative group">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-11 h-11 bg-card/40 border-border/60 rounded-xl backdrop-blur-sm focus:border-primary/50 focus:bg-card/60 transition-all duration-300 text-sm"
              autoComplete="name"
            />
          </div>
        )}
        <div className="relative group">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-11 h-11 bg-card/40 border-border/60 rounded-xl backdrop-blur-sm focus:border-primary/50 focus:bg-card/60 transition-all duration-300 text-sm"
            autoComplete="email"
          />
        </div>

        <div className="relative group">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-11 pr-11 h-11 bg-card/40 border-border/60 rounded-xl backdrop-blur-sm focus:border-primary/50 focus:bg-card/60 transition-all duration-300 text-sm"
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {isLogin && (
          <div className="text-right">
            <button type="button" onClick={handleForgotPassword} className="text-[10px] text-muted-foreground hover:text-primary transition-colors">
              Esqueceu a senha?
            </button>
          </div>
        )}

        {/* Terms checkbox — only for signup */}
        {!isLogin && (
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <button
              type="button"
              onClick={() => setAcceptedTerms(!acceptedTerms)}
              className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                acceptedTerms
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "border-border/60 bg-card/40"
              }`}
            >
              {acceptedTerms && <Check className="w-3 h-3" />}
            </button>
            <span className="text-[10px] text-muted-foreground leading-relaxed">
              Li e concordo com os{" "}
              <button type="button" onClick={() => setLegalModal("terms")} className="text-primary hover:underline underline-offset-2">
                Termos de Uso
              </button>{" "}
              e a{" "}
              <button type="button" onClick={() => setLegalModal("privacy")} className="text-primary hover:underline underline-offset-2">
                Política de Privacidade
              </button>
            </span>
          </label>
        )}

        <Button
          type="submit"
          disabled={submitting || (!isLogin && !acceptedTerms)}
          className="w-full h-11 font-semibold text-sm rounded-xl bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20 relative overflow-hidden group transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="animate-pulse">Processando...</span>
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              {isLogin ? "Entrar" : "Criar conta"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          )}
        </Button>
      </form>

      {/* Toggle */}
      <p className="text-center text-xs text-muted-foreground">
        {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-primary font-medium hover:underline underline-offset-2"
        >
          {isLogin ? "Criar conta" : "Fazer login"}
        </button>
      </p>
    </motion.div>
  );

  return (
    <div className="dark min-h-screen bg-background flex flex-col relative overflow-hidden">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px]" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-6 lg:px-10 py-4 relative z-30"
      >
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-foreground tracking-tight">
            Din<span className="text-primary">Hub</span>
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openAuthModal(true)}
            className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:flex"
          >
            Entrar
          </Button>
          <Button 
            size="sm" 
            onClick={() => openAuthModal(false)}
            className="text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-full px-5"
          >
            Cadastre-se
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openAuthModal(true)}
            className="text-xs font-medium text-muted-foreground sm:hidden"
          >
            Entrar
          </Button>
        </div>
      </motion.header>

      {/* Main content - Centered marketing */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-20 relative z-10 max-w-4xl mx-auto text-center space-y-8 lg:space-y-10">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <SocialProofBadge />
        </motion.div>
        
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <HeadlineSection />
        </motion.div>

        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <InputMethodsPill />
        </motion.div>




        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="pt-6">
          <Button 
            size="lg" 
            onClick={() => openAuthModal(false)}
            className="h-14 px-10 text-base font-bold rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-300 group"
          >
            Começar Agora Grátis
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className="w-full max-w-lg">
          <TestimonialCard />
        </motion.div>
      </main>

      <VisaoGeral />

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-8 border-t border-border/10 text-[10px] sm:text-xs text-muted-foreground/50 relative z-10"
      >
        <span className="flex items-center gap-2">
          <span>DinHub © {new Date().getFullYear()}</span>
        </span>
        <div className="flex items-center gap-4 sm:gap-6">
          <button onClick={() => setLegalModal("terms")} className="hover:text-primary transition-colors">Termos de Uso</button>
          <button onClick={() => setLegalModal("privacy")} className="hover:text-primary transition-colors">Política de Privacidade</button>
          <button onClick={() => setShowContact(true)} className="hover:text-primary transition-colors">Contato</button>
        </div>
      </motion.footer>

      {/* Auth Modal */}
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="sm:max-w-[440px] p-0 border-none bg-transparent overflow-hidden shadow-none">
          <div className="relative z-50">
            {renderAuthFormCard()}
          </div>
        </DialogContent>
      </Dialog>

      <ContactModal open={showContact} onClose={() => setShowContact(false)} />
      <LegalModal open={!!legalModal} onClose={() => setLegalModal(null)} type={legalModal || "terms"} />
    </div>
  );
};

export default Auth;
