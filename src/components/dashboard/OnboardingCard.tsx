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
  const [currentStep, setCurrentStep] = useState(0);

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

  const firstPendingIndex = sortedSteps.findIndex((s) => !s.done);
  const activeStep = Math.max(0, Math.min(currentStep, sortedSteps.length - 1));
  const step = sortedSteps[activeStep >= 0 ? activeStep : firstPendingIndex];

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
      className="rounded-xl bg-gradient-to-br from-primary/8 to-primary/3 border border-primary/15 p-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
          <Rocket className="w-3 h-3 text-primary" />
        </div>
        <p className="text-xs font-bold text-foreground flex-1">Complete sua conta</p>
        <span className="text-[9px] text-muted-foreground">{completedCount}/{sortedSteps.length}</span>
      </div>

      {/* Steps as dots - clickable */}
      <div className="flex justify-center gap-3 mb-2.5">
        {sortedSteps.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrentStep(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              i === activeStep
                ? "bg-primary scale-125 shadow-[0_0_6px_hsl(150_100%_45%/0.5)]"
                : s.done
                  ? "bg-primary/40"
                  : "bg-muted/30 hover:bg-muted/50"
            )}
          />
        ))}
      </div>

      {/* Current step - centered, clean */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15 }}
          className="flex justify-center"
        >
          <button
            onClick={step.done ? undefined : step.action}
            disabled={step.done}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all",
              step.done
                ? "opacity-50 cursor-default"
                : "bg-card/50 hover:bg-card/80 cursor-pointer"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
              step.done ? "bg-primary" : "border-2 border-primary/30"
            )}>
              {step.done ? (
                <Check className="w-3 h-3 text-primary-foreground" />
              ) : (
                <step.icon className="w-2.5 h-2.5 text-primary/60" />
              )}
            </div>
            <span className={cn(
              "text-xs font-medium",
              step.done ? "text-muted-foreground line-through" : "text-foreground"
            )}>
              {step.label}
            </span>
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Inline name editor */}
      <AnimatePresence>
        {editingName && !profile.has_completed_profile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-2"
          >
            <div className="flex gap-2 justify-center">
              <Input
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-card border-border/20 h-8 text-xs rounded-lg max-w-[180px]"
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
