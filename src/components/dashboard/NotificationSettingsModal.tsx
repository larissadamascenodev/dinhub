import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, CreditCard, Target, Wallet, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrCreateSettings, updateSettings, type NotificationSettings } from "@/services/notificationService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const PERIOD_OPTIONS = [
  { value: 0, label: "No dia" },
  { value: 1, label: "1 dia" },
  { value: 2, label: "2 dias" },
  { value: 3, label: "3 dias" },
  { value: 5, label: "5 dias" },
  { value: 7, label: "7 dias" },
];

export default function NotificationSettingsModal({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    getOrCreateSettings(user.id).then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, [open, user]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    await updateSettings(settings.id, {
      bill_due_reminder: settings.bill_due_reminder,
      bill_due_days_before: settings.bill_due_days_before,
      invoice_reminder: settings.invoice_reminder,
      goal_reminder: settings.goal_reminder,
      low_balance_alert: settings.low_balance_alert,
      low_balance_threshold: settings.low_balance_threshold,
      weekly_summary: settings.weekly_summary,
    });
    setSaving(false);
    toast.success("Configurações salvas!");
    onOpenChange(false);
  };

  const toggle = (key: keyof NotificationSettings) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const setNum = (key: keyof NotificationSettings, val: number) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: val });
  };

  const periodLabel = (days: number) => {
    if (days === 0) return "Avisar no dia";
    return `Avisar ${days} dia${days > 1 ? "s" : ""} antes`;
  };

  const items = settings
    ? [
        {
          icon: Calendar,
          label: "Contas a vencer",
          sub: periodLabel(settings.bill_due_days_before),
          enabled: settings.bill_due_reminder,
          toggle: () => toggle("bill_due_reminder"),
          extra: settings.bill_due_reminder && (
            <div className="mt-2.5 space-y-1.5">
              <span className="text-[10px] text-muted-foreground font-medium">Período de aviso:</span>
              <div className="flex flex-wrap gap-1.5">
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setNum("bill_due_days_before", opt.value)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all",
                      settings.bill_due_days_before === opt.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ),
        },
        {
          icon: CreditCard,
          label: "Faturas de cartão",
          sub: "Lembrete quando a fatura vencer",
          enabled: settings.invoice_reminder,
          toggle: () => toggle("invoice_reminder"),
        },
        {
          icon: Target,
          label: "Metas financeiras",
          sub: "Aviso quando prazo se aproxima",
          enabled: settings.goal_reminder,
          toggle: () => toggle("goal_reminder"),
        },
        {
          icon: Wallet,
          label: "Saldo baixo",
          sub: `Avisar abaixo de R$ ${settings.low_balance_threshold}`,
          enabled: settings.low_balance_alert,
          toggle: () => toggle("low_balance_alert"),
          extra: settings.low_balance_alert && (
            <div className="mt-2.5 space-y-1.5">
              <span className="text-[10px] text-muted-foreground font-medium">Limite mínimo:</span>
              <div className="flex flex-wrap gap-1.5">
                {[50, 100, 200, 500, 1000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setNum("low_balance_threshold", val)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all",
                      settings.low_balance_threshold === val
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    )}
                  >
                    R$ {val}
                  </button>
                ))}
              </div>
            </div>
          ),
        },
        {
          icon: Bell,
          label: "Resumo semanal",
          sub: "Receba um resumo das suas finanças",
          enabled: settings.weekly_summary,
          toggle: () => toggle("weekly_summary"),
        },
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/30 rounded-2xl max-w-sm mx-auto p-0 overflow-hidden">
        <div className="p-6 space-y-5">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-foreground">Lembretes e Alertas</h3>
            <p className="text-xs text-muted-foreground">Configure quais notificações deseja receber</p>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Carregando...</div>
          ) : (
            <div className="space-y-1">
              {items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="p-3 rounded-xl hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                      </div>
                      <Switch checked={item.enabled as boolean} onCheckedChange={item.toggle} />
                    </div>
                    {item.extra}
                  </div>
                );
              })}
            </div>
          )}

          <Button onClick={handleSave} disabled={saving || loading} className="w-full h-11 rounded-xl font-bold">
            {saving ? "Salvando..." : "Salvar configurações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
