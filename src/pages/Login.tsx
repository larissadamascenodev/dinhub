import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Navigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, PiggyBank, ArrowRight, ArrowLeft } from "lucide-react";

const Login = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup";
  const [isSignup, setIsSignup] = useState(initialMode);
  const [name, setName] = useState("");
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
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar sua solicitação");
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
    } catch (error: any) {
      toast.error(error.message || "Erro ao entrar com Google");
    }
  };

  return (
    <div className="dark min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 font-inter selection:bg-[#00e676]/30">
      <Link
        to="/auth"
        className="absolute top-6 left-6 flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center bg-[#00e676]/10 border border-[#00e676]/20">
            <PiggyBank className="w-8 h-8 text-[#00e676]" />
          </div>
          <h1 className="font-sora text-2xl font-bold">DinHub</h1>
          <p className="text-sm text-white/50">
            {isSignup ? "Crie sua conta gratuita" : "Entre na sua conta"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-6 space-y-5"
        >
          {isSignup && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/[0.04] border-white/10"
                autoComplete="name"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/[0.04] border-white/10"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/[0.04] border-white/10 pr-10"
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

        <p className="text-center text-sm text-white/50">
          {isSignup ? "Já tem conta?" : "Não tem conta?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-[#00e676] font-medium hover:underline"
          >
            {isSignup ? "Fazer login" : "Criar conta"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
