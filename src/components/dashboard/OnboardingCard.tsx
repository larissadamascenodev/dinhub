import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Check, User, Wallet, Receipt, ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Profile } from "@/hooks/useProfile";

interface Props {
  profile: Profile;
  onUpdateName: (name: string) => Promise<void>;
  onGoToAccounts: () => void;
  onCreateTransaction: () => void;
}

const OnboardingCard = ({ profile, onUpdateName, onGoToAccounts, onCreateTransaction }: Props) => {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(profile.display_name ?? "");
  const [saving, setSaving] = useState(false);

  const steps = [
    {
      id: "name",
      label: "Adicionar nome",
      icon: User,
      done: profile.has_completed_profile,
      action: () => setEditingName(true),
    },
    {
      id: "account",
      label: "Criar conta",
      icon: Wallet,
      done: profile.has_account,
      action: onGoToAccounts,
    },
    {
      id: "transaction",
      label: "Adicionar transação",
      icon: Receipt,
      done: profile.has_transactions,
      action: onCreateTransaction,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;

  if (allDone) return null;

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onUpdateName(name.trim());
    setSaving(false);
    setEditingName(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 mb-4"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Rocket className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">Complete sua conta 🚀</p>
          <p className="text-[10px] text-muted-foreground">{completedCount} de {steps.length} concluídos</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-muted/30 mb-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full bg-primary"
        />
      </div>

      <div className="space-y-1.5">
        {steps.map((step) => (
          <motion.button
            key={step.id}
            onClick={step.done ? undefined : step.action}
            disabled={step.done}
            className={cn(
              "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left",
              step.done
                ? "bg-primary/5 opacity-60"
                : "bg-card/60 hover:bg-card border border-border/20 cursor-pointer"
            )}
          >
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
              step.done ? "bg-primary" : "border-2 border-border/40"
            )}>
              {step.done ? (
                <Check className="w-3.5 h-3.5 text-primary-foreground" />
              ) : (
                <step.icon className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
            <span className={cn(
              "text-xs font-medium flex-1",
              step.done ? "text-muted-foreground line-through" : "text-foreground"
            )}>
              {step.label}
            </span>
            {!step.done && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
          </motion.button>
        ))}
      </div>

      {/* Inline name editor */}
      <AnimatePresence>
        {editingName && !profile.has_completed_profile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-3"
          >
            <div className="flex gap-2">
              <Input
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-card border-border/20 h-9 text-sm rounded-xl flex-1"
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleSaveName}
                disabled={!name.trim() || saving}
                className="h-9 px-3 text-xs rounded-xl"
              >
                {saving ? "..." : "Salvar"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingName(false)}
                className="h-9 px-2 rounded-xl"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OnboardingCard;
