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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/15 p-4"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">Complete sua conta</span>
        </div>
        <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          {completedCount}/{sortedSteps.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-muted/20 mb-3 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / sortedSteps.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* All steps inline */}
      <div className="space-y-1.5">
        {sortedSteps.map((s) => {
          const StepIcon = s.icon;
          return (
            <button
              key={s.id}
              onClick={s.done ? undefined : s.action}
              disabled={s.done}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-left transition-all",
                s.done
                  ? "opacity-40 cursor-default"
                  : "hover:bg-primary/5 cursor-pointer"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all",
                s.done
                  ? "bg-primary"
                  : "border-2 border-muted-foreground/20"
              )}>
                {s.done ? (
                  <Check className="w-3 h-3 text-primary-foreground" />
                ) : (
                  <StepIcon className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              <span className={cn(
                "text-xs font-medium flex-1",
                s.done ? "text-muted-foreground line-through" : "text-foreground"
              )}>
                {s.label}
              </span>
              {!s.done && (
                <span className="text-[9px] text-primary font-semibold">→</span>
              )}
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
            className="overflow-hidden mt-3"
          >
            <div className="flex gap-2">
              <Input
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-card border-border/20 h-8 text-xs rounded-lg flex-1"
                autoFocus
              />
              <Button size="sm" onClick={handleSaveName} disabled={!name.trim() || saving} className="h-8 px-3 text-[10px] rounded-lg">
                {saving ? "..." : "Salvar"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditingName(false)} className="h-8 px-2 rounded-lg">
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
