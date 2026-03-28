import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Check, User, Wallet, Receipt, X } from "lucide-react";
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
    { id: "name", label: "Adicionar nome", icon: User, done: profile.has_completed_profile, action: () => setEditingName(true) },
    { id: "account", label: "Criar conta", icon: Wallet, done: profile.has_account, action: onGoToAccounts },
    { id: "transaction", label: "Adicionar transação", icon: Receipt, done: profile.has_transactions, action: onCreateTransaction },
  ];

  // Sort: completed first, pending after
  const sortedSteps = [...steps].sort((a, b) => {
    if (a.done && !b.done) return -1;
    if (!a.done && b.done) return 1;
    return 0;
  });

  const completedCount = sortedSteps.filter((s) => s.done).length;
  const allDone = completedCount === sortedSteps.length;

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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card/50 border border-border/10 px-3 py-2"
    >
      {/* Header + progress inline */}
      <div className="flex items-center gap-2 mb-1.5">
        <Rocket className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-[11px] font-semibold text-foreground">Complete sua conta</span>
        <div className="flex-1 h-[3px] rounded-full bg-muted/20 overflow-hidden mx-1">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / sortedSteps.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-[9px] text-muted-foreground">{completedCount}/{sortedSteps.length}</span>
      </div>

      {/* Steps row */}
      <div className="flex gap-1">
        {sortedSteps.map((s) => {
          const StepIcon = s.icon;
          return (
            <button
              key={s.id}
              onClick={s.done ? undefined : s.action}
              disabled={s.done}
              className={cn(
                "flex items-center gap-1.5 flex-1 px-2 py-1.5 rounded-lg text-left transition-all",
                s.done ? "opacity-35 cursor-default" : "hover:bg-primary/5 cursor-pointer"
              )}
            >
              <div className={cn(
                "w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0",
                s.done ? "bg-primary" : "border border-muted-foreground/20"
              )}>
                {s.done ? (
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                ) : (
                  <StepIcon className="w-2.5 h-2.5 text-muted-foreground/60" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                s.done ? "text-muted-foreground line-through" : "text-foreground"
              )}>
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Inline name editor */}
      <AnimatePresence>
        {editingName && !profile.has_completed_profile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-1.5"
          >
            <div className="flex gap-1.5">
              <Input
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-card border-border/20 h-7 text-[11px] rounded-lg flex-1"
                autoFocus
              />
              <Button size="sm" onClick={handleSaveName} disabled={!name.trim() || saving} className="h-7 px-2.5 text-[10px] rounded-lg">
                {saving ? "..." : "Salvar"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditingName(false)} className="h-7 px-1.5 rounded-lg">
                <X className="w-2.5 h-2.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OnboardingCard;
