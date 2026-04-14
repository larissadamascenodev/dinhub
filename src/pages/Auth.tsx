import { useState } from "react";
import ContactModal from "@/components/shared/ContactModal";
import LegalModal from "@/components/shared/LegalModal";
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
  PiggyBank, MessageCircle, Mic, Image, Zap, Shield, User, Check
} from "lucide-react";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};

const stats = [
  { icon: <TrendingUp className="w-3.5 h-3.5" />, value: "R$ 1.2M", label: "Economizados" },
  { icon: <Target className="w-3.5 h-3.5" />, value: "94%", label: "Metas atingidas" },
  { icon: <Star className="w-3.5 h-3.5" />, value: "4.9", label: "Avaliação" },
];

const AVATAR_URLS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
];

const Auth = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);

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
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
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
        toast.success("Conta criada! Verifique seu email para confirmar.");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar sua solicitação");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Reusable sub-sections ── */

  const SocialProofBadge = ({ className = "" }: { className?: string }) => (
    <span className={`inline-flex items-center gap-2 bg-primary/10 text-primary text-[10px] font-medium px-3 py-1.5 rounded-full border border-primary/15 backdrop-blur-sm ${className}`}>
      <span className="flex -space-x-1.5">
        {AVATAR_URLS.map((url, i) => (
          <img
            key={i}
            src={url}
            alt=""
            className="w-4 h-4 rounded-full border border-background object-cover"
          />
        ))}
      </span>
      +2.847 pessoas controlando suas finanças
    </span>
  );

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
          O DinHub reúne seus gastos, metas e investimentos em um único painel inteligente — para você ter clareza total das suas finanças.
        </p>
      )}
    </div>
  );

  const InputMethodsPill = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-primary/10 via-card/50 to-primary/5 border border-primary/15 rounded-full px-3 py-1.5 text-[10px] text-muted-foreground backdrop-blur-sm ${mobile ? "mx-auto" : ""}`}>
      <span className="text-foreground/70 font-medium">Registre via</span>
      <span className="flex items-center gap-0.5 text-primary font-semibold"><MessageCircle className="w-2.5 h-2.5" /> texto</span>
      <span className="text-primary/30">|</span>
      <span className="flex items-center gap-0.5 text-primary/80"><Mic className="w-2.5 h-2.5" /> áudio</span>
      <span className="text-primary/30">|</span>
      <span className="flex items-center gap-0.5 text-primary/80"><Image className="w-2.5 h-2.5" /> foto</span>
      <Zap className="w-2.5 h-2.5 text-primary ml-0.5" />
    </div>
  );

  const StatsGrid = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((s) => (
        <div
          key={s.label}
          className="group bg-card/40 border border-border/60 rounded-lg p-2.5 space-y-0.5 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
        >
          <div className="text-primary">{s.icon}</div>
          <p className={`font-bold text-foreground ${mobile ? "text-sm" : "text-lg"}`}>{s.value}</p>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );

  const TestimonialCard = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`bg-card/40 border border-border/60 rounded-xl ${mobile ? "p-3.5" : "p-5"} space-y-2 backdrop-blur-sm`}>
      <div className="flex items-center gap-2.5">
        <img
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
          alt=""
          className="w-8 h-8 rounded-full object-cover border border-primary/20"
        />
        <div>
          <p className="text-xs font-semibold text-foreground">Rafael M.</p>
          <div className="flex gap-0.5 text-yellow-400 text-[10px]">★★★★★</div>
        </div>
      </div>
      <p className={`text-muted-foreground italic leading-relaxed ${mobile ? "text-[11px]" : "text-xs"}`}>
        "Finalmente consigo enxergar para onde meu dinheiro vai. O DinHub me deu o controle que eu precisava para organizar minha vida financeira."
      </p>
    </div>
  );

  /* ── Auth form card ── */
  const AuthFormCard = () => (
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
              <Link to="/termos-de-uso" target="_blank" className="text-primary hover:underline underline-offset-2">
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link to="/politica-de-privacidade" target="_blank" className="text-primary hover:underline underline-offset-2">
                Política de Privacidade
              </Link>
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

      {/* Desktop top bar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex items-center justify-between px-10 py-4 relative z-10"
      >
        <div className="flex items-center gap-2">
          <PiggyBank className="w-6 h-6 text-primary" />
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
            <SocialProofBadge />
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
            className="flex items-center justify-between mt-6 pt-4 border-t border-border/10 text-xs text-muted-foreground/50"
          >
            <span className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-primary/60" />
              <span>DinHub © {new Date().getFullYear()}</span>
            </span>
            <span className="flex items-center gap-4">
              <button onClick={() => setLegalModal("terms")} className="hover:text-primary transition-colors">Termos de Uso</button>
              <button onClick={() => setLegalModal("privacy")} className="hover:text-primary transition-colors">Política de Privacidade</button>
              <button onClick={() => setShowContact(true)} className="hover:text-primary transition-colors">Contato</button>
            </span>
          </motion.div>
        </div>
      </div>

      {/* ════════ MOBILE LAYOUT ════════ */}
      <div className="flex lg:hidden flex-1 flex-col px-5 py-5 relative z-10 overflow-y-auto gap-4">
        {/* Logo — top left like inside the app */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <PiggyBank className="w-6 h-6 text-primary" />
          <span className="font-display text-lg font-bold text-foreground tracking-tight">
            Din<span className="text-primary">Hub</span>
          </span>
        </motion.div>

        {/* Social proof badge */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <SocialProofBadge className="text-[10px]" />
        </motion.div>

        {/* Headline + input methods (above form) */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2.5">
          <HeadlineSection mobile />
          <InputMethodsPill mobile />
        </motion.div>

        {/* Form */}
        <AuthFormCard />

        {/* Stats + Testimonial (below form) */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="space-y-2.5">
          <StatsGrid mobile />
          <TestimonialCard mobile />
        </motion.div>

        {/* Security badge + legal links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-between pt-3 border-t border-border/10 text-[10px] text-muted-foreground/50 pb-2"
        >
          <span className="flex items-center gap-1.5">
            <PiggyBank className="w-3.5 h-3.5 text-primary/60" />
            <span>DinHub © {new Date().getFullYear()}</span>
          </span>
          <span className="flex items-center gap-3">
            <button onClick={() => setLegalModal("terms")} className="hover:text-primary transition-colors">Termos de Uso</button>
            <button onClick={() => setLegalModal("privacy")} className="hover:text-primary transition-colors">Política de Privacidade</button>
            <button onClick={() => setShowContact(true)} className="hover:text-primary transition-colors">Contato</button>
          </span>
        </motion.div>
      </div>
      <ContactModal open={showContact} onClose={() => setShowContact(false)} />
      <LegalModal open={!!legalModal} onClose={() => setLegalModal(null)} type={legalModal || "terms"} />
    </div>
  );
};

export default Auth;
