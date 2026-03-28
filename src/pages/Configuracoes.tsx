import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Pencil, Star, Flame, Target, TrendingUp, Swords, Trophy,
  Shield, Crown, Upload, FileText, Smartphone, MessageCircle, Trash2, LogOut,
  Bell, Globe, HelpCircle, Headphones, FileCheck, ChevronRight, Wallet, Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/* ═══════════════════════════════════════════════ */

const Configuracoes = () => {
  const { user } = useAuth();
  const { profile, updateDisplayName } = useProfile();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [activeTab, setActiveTab] = useState<"conta" | "config">("conta");

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Usuário";
  const email = user?.email ?? "";

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    await updateDisplayName(editName.trim());
    toast.success("Nome atualizado!");
    setEditing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  /* ── Feature cards ── */
  const featureCards = [
    { icon: Target, label: "Metas", sub: "Objetivos" },
    { icon: TrendingUp, label: "Investimentos", sub: "Portfólio" },
    { icon: Swords, label: "Desafios", sub: "Competições" },
    { icon: Trophy, label: "Conquistas", sub: "Medalhas e XP" },
  ];

  /* ── Conta items ── */
  const contaItems = [
    { icon: Shield, label: "Segurança", sub: "Alterar senha de acesso", action: true },
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
    { icon: Trash2, label: "Apagar Dados", sub: "Resetar o aplicativo", danger: true },
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
    <div className="pt-2 pb-8 space-y-6">
      {/* ═══ Profile Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card/60 border border-border/20 p-5"
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center overflow-hidden border-2 border-border/20">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary border-2 border-card" />
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex gap-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-9 bg-muted/30 border-border/20 rounded-xl text-sm"
                  placeholder="Seu nome"
                  autoFocus
                />
                <Button size="sm" className="rounded-xl h-9 px-3" onClick={handleSaveName}>Salvar</Button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-foreground truncate">{displayName}</h2>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              </>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-bold bg-primary/15 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" /> LV 1
              </span>
              <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3" /> 0 dias
              </span>
            </div>
          </div>

          <button
            onClick={() => { setEditing(!editing); setEditName(displayName); }}
            className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center hover:bg-muted/60 transition-colors shrink-0"
          >
            <Pencil className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Bio placeholder */}
        <p className="text-sm text-muted-foreground mt-3">Focado em controle financeiro e evolução diária 💪</p>

        {/* XP Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">Progresso de nível</span>
            <span className="text-[10px] text-muted-foreground">0 / 200 XP</span>
          </div>
          <Progress value={0} className="h-2" />
        </div>
      </motion.div>

      {/* ═══ Carteira Card ═══ */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onClick={() => navigate("/gestao")}
        className="rounded-2xl bg-card/90 backdrop-blur-xl border border-border/30 shadow-2xl shadow-black/40 p-5 w-full flex items-center gap-4 hover:bg-card/80 transition-all text-left group"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
          <Wallet className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-foreground">Carteira</p>
          <p className="text-xs text-muted-foreground">Contas e Cartões de Crédito</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
      </motion.button>

      {/* ═══ Feature Cards Grid ═══ */}
      <div className="grid grid-cols-2 gap-3">
        {featureCards.map((fc, idx) => (
          <motion.button
            key={fc.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * (idx + 1) }}
            className="rounded-xl bg-card/60 border border-border/20 p-4 flex items-center gap-3 hover:bg-card/80 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <fc.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{fc.label}</p>
              <p className="text-[11px] text-muted-foreground">{fc.sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </motion.button>
        ))}
      </div>

      {/* ═══ Coach bar ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl bg-card/60 border border-border/20 px-4 py-3 flex items-center gap-2"
      >
        <span className="text-lg">🔥</span>
        <span className="text-[10px] font-bold text-primary uppercase">Coach</span>
        <span className="text-sm text-muted-foreground">{displayName}, consistência é a chave do progresso! 🚀</span>
      </motion.div>

      {/* ═══ Tabs: Conta / Configurações ═══ */}
      <div className="relative rounded-2xl bg-card/90 backdrop-blur-xl border border-border/30 shadow-2xl shadow-black/40 p-1 flex">
        <motion.div
          className="absolute top-1 bottom-1 rounded-lg bg-primary"
          initial={false}
          animate={{
            left: activeTab === "conta" ? "4px" : "50%",
            width: "calc(50% - 4px)",
          }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
        <button
          onClick={() => setActiveTab("conta")}
          className={cn(
            "relative z-10 flex-1 h-10 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors duration-200",
            activeTab === "conta" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <User className="w-4 h-4" /> Conta
        </button>
        <button
          onClick={() => setActiveTab("config")}
          className={cn(
            "relative z-10 flex-1 h-10 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors duration-200",
            activeTab === "config" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Settings className="w-4 h-4" /> Configurações
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
