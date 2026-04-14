import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, ArrowRight, Mail, Lock, TrendingUp, Target, Star,
  PiggyBank, MessageCircle, Mic, Image, Zap, Shield
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};

const stats = [
  { icon: <TrendingUp className="w-4 h-4" />, value: "R$ 1.2M", label: "Economizados" },
  { icon: <Target className="w-4 h-4" />, value: "94%", label: "Metas atingidas" },
  { icon: <Star className="w-4 h-4" />, value: "4.9", label: "Avaliação" },
];

const Auth = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary animate-pulse" />
          </div>
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
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    setSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu email para confirmar.");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar sua solicitação");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Reusable sub-sections ── */

  const HeadlineSection = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={mobile ? "text-center" : ""}>
      <h1 className={`font-display font-bold leading-[1.1] text-foreground ${mobile ? "text-2xl" : "text-4xl xl:text-5xl"}`}>
        Assuma o controle{" "}
        {!mobile && <br className="hidden xl:block" />}
        total da sua{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">
          vida financeira.
        </span>
      </h1>
      {!mobile && (
        <p className="mt-5 text-muted-foreground text-base leading-relaxed max-w-md">
          O DinHub transforma gastos, metas, dívidas e investimentos em um sistema inteligente que trabalha por você.
        </p>
      )}
    </div>
  );

  const InputMethodsPill = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex items-center gap-2 sm:gap-3 bg-card/40 border border-border/60 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm text-muted-foreground backdrop-blur-sm ${mobile ? "w-fit mx-auto" : "w-fit"}`}>
      <span>Envie por</span>
      <span className="flex items-center gap-1 text-primary font-medium"><MessageCircle className="w-3.5 h-3.5" /> texto</span>
      <span className="text-border">·</span>
      <span className="flex items-center gap-1"><Mic className="w-3.5 h-3.5" /> áudio</span>
      <span className="text-border">·</span>
      <span className="flex items-center gap-1"><Image className="w-3.5 h-3.5" /> foto</span>
      <Zap className="w-3.5 h-3.5 text-primary" />
    </div>
  );

  const StatsGrid = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`group bg-card/40 border border-border/60 rounded-xl ${mobile ? "p-3" : "p-4"} space-y-1 sm:space-y-1.5 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5 transition-all duration-300`}
        >
          <div className="text-primary group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
          <p className={`font-bold text-foreground ${mobile ? "text-base" : "text-xl"}`}>{s.value}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );

  const TestimonialCard = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`bg-card/40 border border-border/60 rounded-xl ${mobile ? "p-4" : "p-5"} space-y-2 sm:space-y-3 backdrop-blur-sm`}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
          CR
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Carlos R.</p>
          <div className="flex gap-0.5 text-yellow-400 text-xs">★★★★★</div>
        </div>
      </div>
      <p className={`text-muted-foreground italic leading-relaxed ${mobile ? "text-xs" : "text-sm"}`}>
        "Consegui quitar todas as minhas dívidas em 6 meses seguindo o plano do DinHub. Recomendo demais!"
      </p>
    </div>
  );

  /* ── Auth form card ── */
  const AuthFormCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="bg-card/30 border border-border/50 rounded-2xl p-5 sm:p-8 backdrop-blur-md space-y-5 sm:space-y-6"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? "login" : "signup"}
          initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
          transition={{ duration: 0.25 }}
        >
          <h2 className="font-display text-xl font-bold text-foreground">
            {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isLogin ? "Entre para continuar gerenciando suas finanças" : "Comece a controlar suas finanças agora"}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* OAuth */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={async () => {
            const { error } = await lovable.auth.signInWithOAuth("google", {
              redirect_uri: window.location.origin,
            });
            if (error) toast.error("Erro ao entrar com Google");
          }}
          className="flex items-center justify-center h-12 rounded-xl border border-border/60 bg-card/40 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </button>
        <button
          type="button"
          className="flex items-center justify-center h-12 rounded-xl border border-border/60 bg-card/40 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm"
          onClick={() => toast.info("Login com Apple em breve")}
        >
          <svg className="w-5 h-5 text-foreground fill-current" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/40" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background/80 px-3 text-muted-foreground backdrop-blur-sm">ou continue com email</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-11 h-12 bg-card/40 border-border/60 rounded-xl backdrop-blur-sm focus:border-primary/50 focus:bg-card/60 transition-all duration-300"
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
            className="pl-11 pr-11 h-12 bg-card/40 border-border/60 rounded-xl backdrop-blur-sm focus:border-primary/50 focus:bg-card/60 transition-all duration-300"
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
            <button type="button" onClick={handleForgotPassword} className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Esqueceu a senha?
            </button>
          </div>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-12 font-semibold text-sm rounded-xl text-primary-foreground relative overflow-hidden group"
          style={{ background: "var(--gradient-primary)" }}
        >
          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {submitting ? (
            <span className="animate-pulse relative z-10">Processando...</span>
          ) : (
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              {isLogin ? "Entrar" : "Criar conta"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          )}
        </Button>
      </form>

      {/* Toggle */}
      <p className="text-center text-sm text-muted-foreground">
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

      {/* Desktop top bar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex items-center justify-between px-10 py-4 relative z-10"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display text-xl font-bold text-foreground tracking-tight">
            Din<span className="text-primary">Hub</span>
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          Controle Financeiro Inteligente
        </span>
      </motion.header>

      {/* ════════ DESKTOP LAYOUT ════════ */}
      <div className="hidden lg:flex flex-1 items-stretch px-10 xl:px-16 pb-8 gap-16 relative z-10">
        {/* Left — Marketing */}
        <div className="flex flex-col justify-center flex-1 max-w-xl space-y-7">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-4 py-2 rounded-full border border-primary/15 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              +2.847 pessoas controlando suas finanças
            </span>
          </motion.div>
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <HeadlineSection />
          </motion.div>
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
            <InputMethodsPill />
          </motion.div>
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
            <StatsGrid />
          </motion.div>
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
            <TestimonialCard />
          </motion.div>
        </div>

        {/* Right — Form */}
        <div className="w-full max-w-[400px] flex flex-col justify-center">
          <AuthFormCard />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-1.5 mt-4 text-xs text-muted-foreground/50"
          >
            <Shield className="w-3 h-3" />
            <span>Seus dados estão protegidos com criptografia</span>
          </motion.div>
        </div>
      </div>

      {/* ════════ MOBILE LAYOUT ════════ */}
      <div className="flex lg:hidden flex-1 flex-col px-5 py-6 relative z-10 overflow-y-auto gap-5">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-1.5"
        >
          <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display text-xl font-bold text-foreground tracking-tight">
            Din<span className="text-primary">Hub</span>
          </span>
        </motion.div>

        {/* Headline + input methods (above form) */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="space-y-3">
          <HeadlineSection mobile />
          <InputMethodsPill mobile />
        </motion.div>

        {/* Form */}
        <AuthFormCard />

        {/* Stats + Testimonial (below form) */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="space-y-3">
          <StatsGrid mobile />
          <TestimonialCard mobile />
        </motion.div>

        {/* Security badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/50 pb-2"
        >
          <Shield className="w-3 h-3" />
          <span>Seus dados estão protegidos com criptografia</span>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
