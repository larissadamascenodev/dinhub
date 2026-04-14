import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, ArrowRight, Mail, Lock, TrendingUp, Target, Star, Wallet, MessageCircle, Mic, Image, Zap } from "lucide-react";

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
        <div className="animate-pulse text-primary text-lg">Carregando...</div>
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

  return (
    <div className="dark min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 lg:px-10">
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary" />
          <span className="font-display text-lg font-bold text-foreground">FinanPro</span>
        </div>
        <span className="hidden sm:block text-sm text-muted-foreground">Controle Financeiro Inteligente</span>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-stretch px-4 lg:px-10 pb-8 gap-8 lg:gap-12">
        
        {/* LEFT — Marketing */}
        <div className="hidden lg:flex flex-col justify-center flex-1 max-w-xl space-y-8">
          {/* Social proof badge */}
          <div className="flex items-center gap-2">
            <span className="bg-primary/15 text-primary text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
              👥 +2.847 pessoas controlando suas finanças
            </span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="font-display text-4xl xl:text-5xl font-bold leading-tight text-foreground">
              Assuma o controle total da sua{" "}
              <span className="text-primary">vida financeira.</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-base leading-relaxed max-w-md">
              O FinanPro transforma gastos, metas, dívidas e investimentos em um sistema inteligente que trabalha por você.
            </p>
          </div>

          {/* Input methods pill */}
          <div className="flex items-center gap-3 bg-card/60 border border-border rounded-full px-4 py-2.5 w-fit text-sm text-muted-foreground">
            <span>Envie por</span>
            <span className="flex items-center gap-1 text-primary"><MessageCircle className="w-3.5 h-3.5" /> texto</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-muted-foreground"><Mic className="w-3.5 h-3.5" /> áudio</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-muted-foreground"><Image className="w-3.5 h-3.5" /> foto</span>
            <Zap className="w-3.5 h-3.5 text-primary" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <TrendingUp className="w-4 h-4 text-primary" />, value: "R$ 1.2M", label: "Economizados" },
              { icon: <Target className="w-4 h-4 text-primary" />, value: "94%", label: "Metas atingidas" },
              { icon: <Star className="w-4 h-4 text-primary" />, value: "4.9", label: "Avaliação" },
            ].map((s) => (
              <div key={s.label} className="bg-card/60 border border-border rounded-xl p-4 space-y-1">
                {s.icon}
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-card/60 border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">CR</div>
              <div>
                <p className="text-sm font-semibold text-foreground">Carlos R.</p>
                <div className="flex gap-0.5 text-yellow-400 text-xs">★★★★★</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic">
              "Consegui quitar todas as minhas dívidas em 6 meses seguindo o plano do FinanPro. Recomendo demais!"
            </p>
            {/* Dots */}
            <div className="flex gap-1.5 justify-center pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              <span className="w-4 h-1.5 rounded-full bg-primary" />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            </div>
          </div>
        </div>

        {/* RIGHT — Auth form */}
        <div className="w-full max-w-md lg:max-w-sm flex flex-col justify-center">
          <div className="space-y-6">
            {/* Heading */}
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isLogin ? "Entre para continuar gerenciando suas finanças" : "Comece a controlar suas finanças agora"}
              </p>
            </div>

            {/* OAuth buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={async () => {
                  const { error } = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin,
                  });
                  if (error) toast.error("Erro ao entrar com Google");
                }}
                className="flex items-center justify-center h-12 rounded-lg border border-border bg-card/60 hover:bg-card transition-colors"
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
                className="flex items-center justify-center h-12 rounded-lg border border-border bg-card/60 hover:bg-card transition-colors"
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
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground">ou continue com email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-card/60 border-border rounded-lg"
                  autoComplete="email"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-card/60 border-border rounded-lg"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                className="w-full h-12 font-semibold text-sm rounded-lg text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                {submitting ? (
                  <span className="animate-pulse">Processando...</span>
                ) : (
                  <>
                    {isLogin ? "Entrar" : "Criar conta"}
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </form>

            {/* Toggle */}
            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-medium hover:underline"
              >
                {isLogin ? "Criar conta" : "Fazer login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
