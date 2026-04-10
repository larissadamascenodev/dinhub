import { useState, useRef } from "react";
import { useLoginStreak } from "@/hooks/useLoginStreak";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Pencil, Star, Flame, Target, TrendingUp, Swords, Trophy,
  Shield, Crown, Upload, FileText, Smartphone, MessageCircle, Trash2, LogOut,
  Bell, Globe, HelpCircle, Headphones, FileCheck, ChevronRight, Wallet, Settings, Camera,
  MessageSquare, Shuffle, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/* ═══════════════════════════════════════════════ */

const Configuracoes = () => {
  const { user } = useAuth();
  const { profile, updateDisplayName, updateBio, uploadAvatar } = useProfile();
  const navigate = useNavigate();
  const { streak } = useLoginStreak();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [activeTab, setActiveTab] = useState<"conta" | "config">("conta");
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetMode, setResetMode] = useState<"choose" | "confirm-transactions" | "confirm-all">("choose");
  const [resetting, setResetting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editBio, setEditBio] = useState("");
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const BIO_SUGGESTIONS = [
    "Focado em controle financeiro e evolução diária 💪",
    "Cada centavo conta na construção do meu futuro 🚀",
    "Economizando hoje para viver melhor amanhã 🌱",
    "Transformando hábitos financeiros, um dia de cada vez ✨",
    "Menos impulso, mais planejamento 📊",
    "Construindo liberdade financeira com disciplina 💰",
    "Investindo no meu futuro com consistência 📈",
    "Domando os gastos e conquistando objetivos 🎯",
  ];

  const generateRandomBio = () => {
    const current = editBio;
    let newBio = current;
    while (newBio === current) {
      newBio = BIO_SUGGESTIONS[Math.floor(Math.random() * BIO_SUGGESTIONS.length)];
    }
    setEditBio(newBio);
  };

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Usuário";
  const email = user?.email ?? "";

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    await updateDisplayName(editName.trim());
    await updateBio(editBio.trim());
    toast.success("Perfil atualizado!");
    setEditModalOpen(false);
  };

  const handleAvatarInModal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      toast.success("Foto atualizada!");
    } catch {
      toast.error("Erro ao enviar foto");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const openEditModal = () => {
    setEditName(displayName);
    setEditBio(profile?.bio || "");
    setPreviewUrl(profile?.avatar_url || null);
    setEditModalOpen(true);
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error("Digite sua senha atual");
      return;
    }
    if (!newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    setChangingPassword(true);
    try {
      // Verify current password by re-signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email ?? "",
        password: currentPassword,
      });
      if (signInError) {
        toast.error("Senha atual incorreta");
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Senha alterada com sucesso!");
      setPasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Erro ao alterar senha");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!user?.email) return;
    try {
      await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      toast.success("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      setPasswordModalOpen(false);
    } catch {
      toast.error("Erro ao enviar e-mail de recuperação");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const openResetModal = () => {
    setResetMode("choose");
    setResetModalOpen(true);
  };

  const handleResetTransactions = async () => {
    if (!user) return;
    setResetting(true);
    try {
      // Delete invoice_items, invoices, recurring_exclusions, transactions
      // Also reset account balances to initial_balance
      await supabase.from("invoice_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("invoices").delete().eq("user_id", user.id);
      await supabase.from("recurring_exclusions").delete().eq("user_id", user.id);
      await supabase.from("transactions").delete().eq("user_id", user.id);
      await supabase.from("finance_events").delete().eq("user_id", user.id);

      // Reset all account balances to initial_balance
      const { data: accounts } = await supabase.from("accounts").select("id, initial_balance").eq("user_id", user.id);
      if (accounts) {
        for (const acc of accounts) {
          await supabase.from("accounts").update({ current_balance: acc.initial_balance }).eq("id", acc.id);
        }
      }

      // Reset credit card used_limit
      await supabase.from("credit_cards").update({ used_limit: 0 }).eq("user_id", user.id);

      // Update profile flags
      await supabase.from("profiles").update({ has_transactions: false }).eq("id", user.id);

      toast.success("Transações apagadas com sucesso!");
      setResetModalOpen(false);
    } catch {
      toast.error("Erro ao apagar transações");
    } finally {
      setResetting(false);
    }
  };

  const handleResetAll = async () => {
    if (!user) return;
    setResetting(true);
    try {
      await supabase.from("invoice_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("invoices").delete().eq("user_id", user.id);
      await supabase.from("recurring_exclusions").delete().eq("user_id", user.id);
      await supabase.from("transactions").delete().eq("user_id", user.id);
      await supabase.from("finance_events").delete().eq("user_id", user.id);
      await supabase.from("credit_cards").delete().eq("user_id", user.id);
      await supabase.from("accounts").delete().eq("user_id", user.id);

      await supabase.from("profiles").update({
        has_transactions: false,
        has_account: false,
        has_completed_profile: false,
      }).eq("id", user.id);

      toast.success("Todos os dados foram apagados!");
      setResetModalOpen(false);
    } catch {
      toast.error("Erro ao apagar dados");
    } finally {
      setResetting(false);
    }
  };

  /* ── Feature cards ── */
  const featureCards = [
    { icon: Target, label: "Metas", sub: "Objetivos", path: "/metas" },
    { icon: Swords, label: "Desafios", sub: "Competições", path: "/desafios" },
  ];

  /* ── Conta items ── */
  const contaItems = [
    { icon: Shield, label: "Segurança", sub: "Alterar senha de acesso", action: true, onClick: () => setPasswordModalOpen(true) },
    { icon: Crown, label: "Assinatura", sub: "Gerenciar plano e pagamentos", action: true },
  ];
  const dadosItems = [
    { icon: Upload, label: "Importar Dados", sub: "Importe de CSV ou PDF", badge: "EM BREVE" },
    { icon: FileText, label: "Exportar Relatórios", sub: "Baixe seus dados", badge: "EM BREVE" },
  ];
  const integracaoItems = [
    { icon: Smartphone, label: "Instalar App", sub: "Use offline como app nativo", action: true },
    { icon: MessageCircle, label: "Conectar WhatsApp", sub: "Receba alertas no WhatsApp", badge: "EM BREVE" },
  ];
  const perigoItems = [
    { icon: Trash2, label: "Apagar Dados", sub: "Resetar o aplicativo", danger: true, onClick: openResetModal },
    { icon: LogOut, label: "Sair da conta", sub: "Encerrar sessão", danger: true, onClick: handleLogout },
  ];

  /* ── Config items ── */
  const configItems = [
    { icon: Bell, label: "Lembretes e Alertas", sub: "Notificações do app" },
    { icon: Globe, label: "Tipo de Moeda", sub: "Selecione a moeda padrão" },
    { icon: HelpCircle, label: "Central de Ajuda", sub: "Perguntas frequentes" },
    { icon: Headphones, label: "Falar com o Suporte", sub: "Abrir um chamado" },
    { icon: FileCheck, label: "Termos de Privacidade", sub: "Política e termos" },
  ];

  const SettingsRow = ({ icon: Icon, label, sub, badge, danger, action, onClick }: any) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 hover:bg-muted/20 transition-colors first:rounded-t-xl last:rounded-b-xl"
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
        danger ? "bg-destructive/10" : "bg-primary/10"
      )}>
        <Icon className={cn("w-5 h-5", danger ? "text-destructive" : "text-primary")} />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={cn("text-sm font-semibold", danger ? "text-destructive" : "text-foreground")}>{label}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
      {badge ? (
        <span className="text-[10px] font-bold text-primary border border-primary/30 bg-primary/10 px-2.5 py-1 rounded-full shrink-0">
          {badge}
        </span>
      ) : (
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      )}
    </button>
  );

  const SectionGroup = ({ title, items }: { title: string; items: any[] }) => (
    <div>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">{title}</p>
      <div className="rounded-xl bg-card/60 border border-border/20 divide-y divide-border/10">
        {items.map((item, i) => <SettingsRow key={i} {...item} />)}
      </div>
    </div>
  );

  return (
    <div className="pt-1 pb-8 space-y-4">
      {/* ═══ Edit Profile Modal ═══ */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-card border-border/30 rounded-2xl max-w-sm mx-auto p-0 overflow-hidden">
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-bold text-foreground text-center">Editar Perfil</h3>

            {/* Avatar in modal */}
            <div className="flex justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative group/avatar"
                disabled={uploadingAvatar}
              >
                <div className="w-24 h-24 rounded-2xl bg-muted/40 flex items-center justify-center overflow-hidden border-2 border-border/20">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-foreground" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary border-2 border-card flex items-center justify-center">
                  <Camera className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarInModal}
                  className="hidden"
                />
              </button>
            </div>

            {/* Name input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Nome</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-11 bg-muted/30 border-border/20 rounded-xl text-sm"
                placeholder="Seu nome"
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">E-mail</label>
              <Input
                value={email}
                disabled
                className="h-11 bg-muted/20 border-border/10 rounded-xl text-sm text-muted-foreground"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">Mensagem</label>
                <button
                  type="button"
                  onClick={generateRandomBio}
                  className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
                >
                  <Shuffle className="w-3 h-3" /> Gerar aleatória
                </button>
              </div>
              <Input
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="h-11 bg-muted/30 border-border/20 rounded-xl text-sm"
                placeholder="Sua frase de motivação..."
                maxLength={100}
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={!editName.trim() || uploadingAvatar}
              className="w-full h-11 rounded-xl font-bold"
            >
              {uploadingAvatar ? "Enviando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ Password Change Modal ═══ */}
      <Dialog open={passwordModalOpen} onOpenChange={(open) => {
        if (!changingPassword) {
          setPasswordModalOpen(open);
          if (!open) { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
        }
      }}>
        <DialogContent className="bg-card border-border/30 rounded-2xl max-w-sm mx-auto p-0 overflow-hidden">
          <div className="p-6 space-y-5">
            <h3 className="text-lg font-bold text-foreground text-center">Alterar Senha</h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Senha atual</label>
              <div className="relative">
                <Input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-11 bg-muted/30 border-border/20 rounded-xl text-sm pr-10"
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] text-primary hover:text-primary/80 transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Nova senha</label>
              <div className="relative">
                <Input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11 bg-muted/30 border-border/20 rounded-xl text-sm pr-10"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Confirmar nova senha</label>
              <div className="relative">
                <Input
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 bg-muted/30 border-border/20 rounded-xl text-sm pr-10"
                  placeholder="Repita a nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[11px] text-destructive">As senhas não coincidem</p>
            )}

            <Button
              onClick={handleChangePassword}
              disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="w-full h-11 rounded-xl font-bold"
            >
              {changingPassword ? "Alterando..." : "Alterar Senha"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ Reset Modal ═══ */}
      <Dialog open={resetModalOpen} onOpenChange={(open) => { if (!resetting) setResetModalOpen(open); }}>
        <DialogContent className="bg-card border-border/30 rounded-2xl max-w-sm mx-auto p-0 overflow-hidden">
          <div className="p-6 space-y-5">
            <AnimatePresence mode="wait">
              {resetMode === "choose" && (
                <motion.div
                  key="choose"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-5"
                >
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center mx-auto">
                      <Trash2 className="w-6 h-6 text-destructive" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Resetar Aplicativo</h3>
                    <p className="text-xs text-muted-foreground">Escolha o que deseja apagar</p>
                  </div>

                  {/* Option 1: Transactions only */}
                  <button
                    onClick={() => setResetMode("confirm-transactions")}
                    className="w-full rounded-xl border border-border/20 bg-muted/20 p-4 text-left hover:bg-muted/30 transition-colors space-y-2"
                  >
                    <p className="text-sm font-bold text-foreground">Apagar apenas transações</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Remove todas as transações, faturas e saldos. Suas contas, cartões e configurações serão mantidos.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">Transações</span>
                      <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">Faturas</span>
                      <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">Saldos</span>
                      <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">Eventos</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">✓ Contas mantidas</span>
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">✓ Cartões mantidos</span>
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">✓ Configurações</span>
                    </div>
                  </button>

                  {/* Option 2: Everything */}
                  <button
                    onClick={() => setResetMode("confirm-all")}
                    className="w-full rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-left hover:bg-destructive/10 transition-colors space-y-2"
                  >
                    <p className="text-sm font-bold text-destructive">Apagar tudo</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Remove absolutamente todos os dados: transações, contas, cartões e configurações.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">Tudo será removido</span>
                    </div>
                  </button>
                </motion.div>
              )}

              {resetMode === "confirm-transactions" && (
                <motion.div
                  key="confirm-tx"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-5"
                >
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-warning/15 flex items-center justify-center mx-auto">
                      <Trash2 className="w-6 h-6 text-warning" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Confirmar exclusão</h3>
                    <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita</p>
                  </div>

                  <div className="rounded-xl bg-muted/20 border border-border/20 p-4 space-y-2">
                    <p className="text-[11px] font-bold text-foreground">Será excluído:</p>
                    <ul className="space-y-1 text-[11px] text-muted-foreground">
                      <li>• Todas as transações (receitas e despesas)</li>
                      <li>• Faturas de cartão de crédito</li>
                      <li>• Saldos das contas (resetados ao valor inicial)</li>
                      <li>• Limite usado dos cartões (zerado)</li>
                      <li>• Eventos financeiros</li>
                    </ul>
                    <p className="text-[11px] font-bold text-primary mt-3">Será mantido:</p>
                    <ul className="space-y-1 text-[11px] text-muted-foreground">
                      <li>• Contas bancárias e carteiras</li>
                      <li>• Cartões de crédito</li>
                      <li>• Perfil e configurações</li>
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setResetMode("choose")}
                      disabled={resetting}
                      className="flex-1 h-11 rounded-xl text-xs font-bold"
                    >
                      Voltar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleResetTransactions}
                      disabled={resetting}
                      className="flex-1 h-11 rounded-xl text-xs font-bold"
                    >
                      {resetting ? "Apagando..." : "Confirmar exclusão"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {resetMode === "confirm-all" && (
                <motion.div
                  key="confirm-all"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-5"
                >
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center mx-auto">
                      <Trash2 className="w-6 h-6 text-destructive" />
                    </div>
                    <h3 className="text-lg font-bold text-destructive">Atenção!</h3>
                    <p className="text-xs text-muted-foreground">Todos os dados serão permanentemente removidos</p>
                  </div>

                  <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4 space-y-2">
                    <p className="text-[11px] font-bold text-destructive">Será excluído permanentemente:</p>
                    <ul className="space-y-1 text-[11px] text-muted-foreground">
                      <li>• Todas as transações</li>
                      <li>• Todas as contas e carteiras</li>
                      <li>• Todos os cartões de crédito</li>
                      <li>• Todas as faturas</li>
                      <li>• Eventos financeiros</li>
                      <li>• Configurações do perfil</li>
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setResetMode("choose")}
                      disabled={resetting}
                      className="flex-1 h-11 rounded-xl text-xs font-bold"
                    >
                      Voltar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleResetAll}
                      disabled={resetting}
                      className="flex-1 h-11 rounded-xl text-xs font-bold"
                    >
                      {resetting ? "Apagando..." : "Apagar tudo"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ Profile Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card/60 border border-border/20 p-4"
      >
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-muted/40 flex items-center justify-center overflow-hidden border-2 border-border/20">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-muted-foreground" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary border-2 border-card" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-foreground truncate">{displayName}</h2>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-bold bg-primary/15 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" /> Free
              </span>
              <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3" /> {streak} {streak === 1 ? "dia" : "dias"}
              </span>
            </div>
          </div>

          <button
            onClick={openEditModal}
            className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center hover:bg-muted/60 transition-colors shrink-0"
          >
            <Pencil className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Bio */}
        <p className="text-xs text-muted-foreground mt-2">{profile?.bio || "Focado em controle financeiro e evolução diária 💪"}</p>

      </motion.div>

      {/* ═══ Carteira Card ═══ */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onClick={() => navigate("/gestao")}
        className="relative overflow-hidden rounded-2xl border border-primary/20 backdrop-blur-xl shadow-2xl shadow-black/40 p-3.5 w-full flex items-center gap-3 hover:border-primary/30 transition-all text-left group"
        style={{
          background: "linear-gradient(160deg, hsl(150 100% 45% / 0.08) 0%, hsl(150 100% 45% / 0.03) 100%)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Wallet className="w-5 h-5 text-primary" />
        </div>
        <div className="relative z-10 flex-1 min-w-0">
          <p className="text-sm font-bold text-primary">Carteira</p>
          <p className="text-[11px] text-primary/60">Contas e Cartões de Crédito</p>
        </div>
        <ChevronRight className="relative z-10 w-5 h-5 text-primary/50 group-hover:text-primary transition-colors shrink-0" />
      </motion.button>

      {/* ═══ Feature Cards Grid ═══ */}
      <div className="grid grid-cols-2 gap-2">
        {featureCards.map((fc, idx) => (
          <motion.button
            key={fc.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * (idx + 1) }}
            onClick={() => fc.path && navigate(fc.path)}
            className="relative overflow-hidden rounded-xl border border-white/[0.08] backdrop-blur-xl shadow-lg shadow-black/30 px-2.5 py-2.5 flex items-center gap-2 hover:border-white/[0.12] transition-all text-left group"
            style={{
              background: "linear-gradient(160deg, hsl(220 18% 9% / 0.85) 0%, hsl(220 20% 5% / 0.9) 100%)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <fc.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="relative z-10 flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground whitespace-nowrap">{fc.label}</p>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap">{fc.sub}</p>
            </div>
            <ChevronRight className="relative z-10 w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </motion.button>
        ))}
      </div>


      {/* ═══ Tabs: Conta / Configurações ═══ */}
      <div className="relative rounded-xl bg-card/90 backdrop-blur-xl border border-border/30 shadow-lg shadow-black/30 flex overflow-hidden">
        <motion.div
          className="absolute inset-y-0 rounded-xl bg-primary/15 border border-primary/40"
          initial={false}
          animate={{
            left: activeTab === "conta" ? "0px" : "50%",
            width: "50%",
          }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
        <button
          onClick={() => setActiveTab("conta")}
          className={cn(
            "relative z-10 flex-1 h-8 rounded-[10px] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors duration-200",
            activeTab === "conta" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <User className="w-3.5 h-3.5" /> Conta
        </button>
        <button
          onClick={() => setActiveTab("config")}
          className={cn(
            "relative z-10 flex-1 h-8 rounded-[10px] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors duration-200",
            activeTab === "config" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Settings className="w-3.5 h-3.5" /> Configurações
        </button>
      </div>

      {/* ═══ Tab Content ═══ */}
      {activeTab === "conta" ? (
        <motion.div
          key="conta"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-5"
        >
          <SectionGroup title="Conta" items={contaItems} />
          <SectionGroup title="Dados" items={dadosItems} />
          <SectionGroup title="Integrações" items={integracaoItems} />
          <SectionGroup title="Zona de Perigo" items={perigoItems} />
        </motion.div>
      ) : (
        <motion.div
          key="config"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-5"
        >
          <SectionGroup title="Configurações" items={configItems} />
        </motion.div>
      )}
    </div>
  );
};

export default Configuracoes;
