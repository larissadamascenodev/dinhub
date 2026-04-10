import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, CreditCard, Target, Wallet, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrCreateSettings, updateSettings, type NotificationSettings } from "@/services/notificationService";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

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

  const items = settings
    ? [
        {
          icon: Calendar,
          label: "Contas a vencer",
          sub: `Avisar ${settings.bill_due_days_before} dias antes`,
          enabled: settings.bill_due_reminder,
          toggle: () => toggle("bill_due_reminder"),
          extra: settings.bill_due_reminder && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-muted-foreground">Dias antes:</span>
              <Input
                type="number"
                min={1}
                max={15}
                value={settings.bill_due_days_before}
                onChange={(e) => setNum("bill_due_days_before", Math.max(1, Math.min(15, parseInt(e.target.value) || 1)))}
                className="w-16 h-7 text-xs text-center bg-muted/30 border-border/20 rounded-lg"
              />
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
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-muted-foreground">Limite R$:</span>
              <Input
                type="number"
                min={0}
                value={settings.low_balance_threshold}
                onChange={(e) => setNum("low_balance_threshold", Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-24 h-7 text-xs text-center bg-muted/30 border-border/20 rounded-lg"
              />
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
