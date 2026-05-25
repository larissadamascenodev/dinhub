import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, PiggyBank, ArrowRight } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  mode: "login" | "signup";
  onOpenChange: (open: boolean) => void;
  onModeChange: (mode: "login" | "signup") => void;
}

const AuthModal = ({ open, mode, onOpenChange, onModeChange }: AuthModalProps) => {
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setPassword("");
      setShowPassword(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (isSignup && !name.trim())) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    setSubmitting(true);
    try {
      if (!isSignup) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu email para confirmar.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar sua solicitação");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Erro ao entrar com Google");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark p-0 border-white/[0.08] bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_80px_-10px_rgba(0,230,118,0.15)] w-[calc(100%-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8 text-white font-inter">
          <div className="text-center space-y-3 mb-6">
            <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center bg-[#00e676]/10 border border-[#00e676]/20">
              <PiggyBank className="w-7 h-7 text-[#00e676]" />
            </div>
            <h2 className="font-sora text-xl font-bold">DinHub</h2>
            <p className="text-sm text-white/50">
              {isSignup ? "Crie sua conta gratuita" : "Entre na sua conta"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="auth-name" className="text-sm">Nome</Label>
                <Input
                  id="auth-name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/[0.04] border-white/10 h-11"
                  autoComplete="name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="auth-email" className="text-sm">Email</Label>
              <Input
                id="auth-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/[0.04] border-white/10 h-11"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-password" className="text-sm">Senha</Label>
              <div className="relative">
                <Input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/[0.04] border-white/10 pr-10 h-11"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 font-bold text-sm bg-[#00e676] hover:bg-[#00ff88] text-[#0a0a0a]"
            >
              {submitting ? (
                <span className="animate-pulse">Processando...</span>
              ) : (
                <span className="flex items-center gap-1">
                  {isSignup ? "Criar conta" : "Entrar"}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/30">
              <div className="flex-1 h-px bg-white/10" />
              ou
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogle}
              className="w-full h-11 bg-white/[0.04] border-white/10 hover:bg-white/[0.08] text-white"
            >
              Continuar com Google
            </Button>
          </form>

          <p className="text-center text-sm text-white/50 mt-6">
            {isSignup ? "Já tem conta?" : "Não tem conta?"}{" "}
            <button
              type="button"
              onClick={() => onModeChange(isSignup ? "login" : "signup")}
              className="text-[#00e676] font-medium hover:underline"
            >
              {isSignup ? "Fazer login" : "Criar conta"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
