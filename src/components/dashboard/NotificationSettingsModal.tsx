import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Calendar, Target, Flame, Bot, BarChart3, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrCreateSettings, updateSettings, type NotificationSettings } from "@/services/notificationService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const PERIOD_OPTIONS = [
  { value: 0, label: "Somente na data" },
  { value: 1, label: "1 dia antes" },
  { value: 3, label: "3 dias antes" },
] as const;

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
      invoice_reminder: settings.bill_due_reminder,
      goal_reminder: settings.goal_reminder,
      challenge_reminder: settings.challenge_reminder,
      low_balance_alert: false,
      low_balance_threshold: settings.low_balance_threshold,
      weekly_summary: false,
    });
    setSaving(false);
    toast.success("Configurações salvas!");
    onOpenChange(false);
  };

  const toggle = (key: keyof NotificationSettings) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const periodLabel = (days: number) => {
    if (days === 0) return "Aviso somente no dia";
    return `Aviso ${days} dia${days > 1 ? "s" : ""} antes`;
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
                    onClick={() => setSettings({ ...settings, bill_due_days_before: opt.value })}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all",
                      settings.bill_due_days_before === opt.value
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-muted/20 text-muted-foreground hover:bg-muted/40 border border-transparent"
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
          icon: Target,
          label: "Metas financeiras",
          sub: "Aviso quando prazo se aproxima",
          enabled: settings.goal_reminder,
          toggle: () => toggle("goal_reminder"),
        },
        {
          icon: Flame,
          label: "Desafios",
          sub: "Lembrete de check-in diário",
          enabled: settings.challenge_reminder,
          toggle: () => toggle("challenge_reminder"),
        },
      ]
    : [];

  const comingSoonItems = [
    {
      icon: Bot,
      label: "Notificações da Iara",
      sub: "Dicas e alertas inteligentes",
    },
    {
      icon: BarChart3,
      label: "Limite de categoria",
      sub: "Aviso ao se aproximar do limite",
    },
    {
      icon: AlertCircle,
      label: "Contas atrasadas",
      sub: "Alerta quando uma conta vencer sem pagar",
    },
  ];

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
            <>
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

              <div className="space-y-1 pt-2 border-t border-border/10">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 pb-1">Em breve</p>
                {comingSoonItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="p-3 rounded-xl opacity-50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-muted/15 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{item.label}</p>
                          <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                        </div>
                        <span className="text-[9px] font-bold text-primary border border-primary/30 bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                          BREVE
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full h-11 rounded-xl font-bold bg-primary/15 text-primary hover:bg-primary/25 border border-primary/30"
          >
            {saving ? "Salvando..." : "Salvar configurações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
