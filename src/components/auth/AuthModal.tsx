import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, ArrowRight, Mail, Lock,
  PiggyBank, User, Check
} from "lucide-react";
import LegalModal from "@/components/shared/LegalModal";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: "login" | "signup";
}

export const AuthModal = ({ open, onOpenChange, defaultView = "login" }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(defaultView === "login");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);

  // Sync isLogin with defaultView when modal opens
  React.useEffect(() => {
    if (open) {
      setIsLogin(defaultView === "login");
    }
  }, [open, defaultView]);

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
        
        if (data.session?.user) {
          const now = new Date();
          const { prefetchDashboardData } = await import("@/services/dashboardData");
          void prefetchDashboardData(now.getMonth(), now.getFullYear(), {
            userId: data.session.user.id,
            includeHistorical: false,
          }).catch(() => {});
        }
        toast.success("Login realizado com sucesso!");
        onOpenChange(false);
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
        if (!isLogin) {
            // If signup, maybe stay in login view or just close if auto-login works
            // Supabase often auto-logs in after signup depending on config
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar sua solicitação");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[420px] p-0 bg-transparent border-none shadow-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card/90 border border-border/50 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5"
          >
            <div className="flex flex-col items-center text-center space-y-2">
                <div className="bg-primary/10 p-2.5 rounded-2xl border border-primary/20 mb-2">
                    <PiggyBank className="w-6 h-6 text-primary" />
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isLogin ? "login" : "signup"}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h2 className="text-xl font-bold text-foreground tracking-tight">
                            {isLogin ? "Bem-vindo de volta" : "Crie sua conta no DinHub"}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1 px-4">
                            {isLogin ? "Entre para continuar gerenciando suas finanças" : "Comece a controlar suas finanças de forma inteligente agora mesmo"}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Google OAuth */}
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
                className="flex items-center justify-center gap-3 w-full h-12 rounded-2xl border border-border/60 bg-card/40 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm text-sm text-muted-foreground font-medium"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuar com Google
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/40" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                    <span className="bg-card/90 px-3 text-muted-foreground/60 backdrop-blur-sm">ou continue com email</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            type="text"
                            placeholder="Seu nome completo"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-12 h-12 bg-card/40 border-border/60 rounded-2xl backdrop-blur-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 text-sm"
                            autoComplete="name"
                        />
                    </div>
                )}
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-12 bg-card/40 border-border/60 rounded-2xl backdrop-blur-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 text-sm"
                        autoComplete="email"
                    />
                </div>

                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-12 bg-card/40 border-border/60 rounded-2xl backdrop-blur-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 text-sm"
                        autoComplete={isLogin ? "current-password" : "new-password"}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                {isLogin && (
                    <div className="text-right">
                        <button type="button" onClick={handleForgotPassword} className="text-[10px] text-muted-foreground hover:text-primary transition-colors font-medium">
                            Esqueceu sua senha?
                        </button>
                    </div>
                )}

                {!isLogin && (
                    <label className="flex items-start gap-3 cursor-pointer select-none group">
                        <button
                            type="button"
                            onClick={() => setAcceptedTerms(!acceptedTerms)}
                            className={`mt-0.5 w-4 h-4 rounded-md border flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                                acceptedTerms
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "border-border/60 bg-card/40 group-hover:border-primary/40"
                            }`}
                        >
                            {acceptedTerms && <Check className="w-3 h-3" />}
                        </button>
                        <span className="text-[10px] text-muted-foreground leading-snug">
                            Ao se cadastrar, você concorda com nossos{" "}
                            <button type="button" onClick={() => setLegalModal("terms")} className="text-primary hover:underline underline-offset-2 font-medium">
                                Termos de Uso
                            </button>{" "}
                            e nossa{" "}
                            <button type="button" onClick={() => setLegalModal("privacy")} className="text-primary hover:underline underline-offset-2 font-medium">
                                Política de Privacidade
                            </button>
                        </span>
                    </label>
                )}

                <Button
                    type="submit"
                    disabled={submitting || (!isLogin && !acceptedTerms)}
                    className="w-full h-12 font-bold text-sm rounded-2xl bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_20px_rgba(0,230,118,0.3)] relative overflow-hidden group transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {submitting ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            Processando...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            {isLogin ? "Entrar na conta" : "Criar minha conta"}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    )}
                </Button>
            </form>

            <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                    {isLogin ? "Ainda não tem uma conta?" : "Já possui uma conta?"}{" "}
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary font-bold hover:underline underline-offset-4"
                    >
                        {isLogin ? "Cadastre-se grátis" : "Faça login"}
                    </button>
                </p>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
      <LegalModal open={!!legalModal} onClose={() => setLegalModal(null)} type={legalModal || "terms"} />
    </>
  );
};