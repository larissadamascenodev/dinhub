import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Check, User, Wallet, Receipt, ChevronRight, ChevronLeft, X } from "lucide-react";
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

  const step = steps[currentStep];

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
      className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-3"
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
          <Rocket className="w-3 h-3 text-primary" />
        </div>
        <p className="text-xs font-bold text-foreground flex-1">Complete sua conta</p>
        <span className="text-[9px] text-muted-foreground">{completedCount}/{steps.length}</span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 mb-2.5">
        {steps.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "h-1 rounded-full flex-1 transition-all",
              s.done ? "bg-primary" : i === currentStep ? "bg-primary/40" : "bg-muted/30"
            )}
          />
        ))}
      </div>

      {/* Current step */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
          disabled={currentStep === 0}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20 transition-all shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <AnimatePresence mode="wait">
          <motion.button
            key={step.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            onClick={step.done ? undefined : step.action}
            disabled={step.done}
            className={cn(
              "flex-1 flex items-center gap-2.5 p-2 rounded-lg transition-all text-left",
              step.done
                ? "bg-primary/5 opacity-60"
                : "bg-card/60 hover:bg-card border border-border/20 cursor-pointer"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
              step.done ? "bg-primary" : "border-2 border-border/40"
            )}>
              {step.done ? (
                <Check className="w-3 h-3 text-primary-foreground" />
              ) : (
                <step.icon className="w-2.5 h-2.5 text-muted-foreground" />
              )}
            </div>
            <span className={cn(
              "text-xs font-medium flex-1",
              step.done ? "text-muted-foreground line-through" : "text-foreground"
            )}>
              {step.label}
            </span>
            {!step.done && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
          </motion.button>
        </AnimatePresence>

        <button
          onClick={() => setCurrentStep((p) => Math.min(steps.length - 1, p + 1))}
          disabled={currentStep === steps.length - 1}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20 transition-all shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Inline name editor */}
      <AnimatePresence>
        {editingName && !profile.has_completed_profile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-2"
          >
            <div className="flex gap-2">
              <Input
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-card border-border/20 h-8 text-xs rounded-lg flex-1"
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleSaveName}
                disabled={!name.trim() || saving}
                className="h-8 px-3 text-[10px] rounded-lg"
              >
                {saving ? "..." : "Salvar"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingName(false)}
                className="h-8 px-2 rounded-lg"
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
