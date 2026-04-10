import { supabase } from "@/integrations/supabase/client";

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  is_read: boolean;
  related_id: string | null;
  created_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  bill_due_reminder: boolean;
  bill_due_days_before: number;
  invoice_reminder: boolean;
  goal_reminder: boolean;
  low_balance_alert: boolean;
  low_balance_threshold: number;
  weekly_summary: boolean;
}

const DEFAULT_SETTINGS: Omit<NotificationSettings, "id" | "user_id"> = {
  bill_due_reminder: true,
  bill_due_days_before: 3,
  invoice_reminder: true,
  goal_reminder: true,
  low_balance_alert: true,
  low_balance_threshold: 100,
  weekly_summary: true,
};

// ── Fetch notifications ──
export async function fetchNotifications(userId: string, limit = 30): Promise<AppNotification[]> {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as AppNotification[] | null) ?? [];
}

export async function countUnread(userId: string): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  return count ?? 0;
}

export async function markAsRead(notificationId: string) {
  await supabase.from("notifications").update({ is_read: true } as any).eq("id", notificationId);
}

export async function markAllAsRead(userId: string) {
  await supabase.from("notifications").update({ is_read: true } as any).eq("user_id", userId).eq("is_read", false);
}

// ── Settings ──
export async function getOrCreateSettings(userId: string): Promise<NotificationSettings> {
  const { data } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) return data as unknown as NotificationSettings;

  const { data: created } = await supabase
    .from("notification_settings")
    .insert({ user_id: userId, ...DEFAULT_SETTINGS } as any)
    .select()
    .single();

  return (created as unknown as NotificationSettings) ?? { id: "", user_id: userId, ...DEFAULT_SETTINGS };
}

export async function updateSettings(id: string, updates: Partial<Omit<NotificationSettings, "id" | "user_id">>) {
  await supabase.from("notification_settings").update(updates as any).eq("id", id);
}

// ── Generate notifications (runs on dashboard load) ──
export async function generateNotifications(userId: string) {
  const settings = await getOrCreateSettings(userId);
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Helper: check if notification already exists for this related_id today
  const exists = async (relatedId: string, category: string) => {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("related_id", relatedId)
      .eq("category", category)
      .gte("created_at", `${todayStr}T00:00:00`);
    return (count ?? 0) > 0;
  };

  const notifications: Array<{
    user_id: string;
    title: string;
    message: string;
    type: string;
    category: string;
    related_id: string;
  }> = [];

  // 1. Bill due reminders (transactions with status=pendente and date near)
  if (settings.bill_due_reminder) {
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + settings.bill_due_days_before);
    const futureDateStr = futureDate.toISOString().split("T")[0];

    const { data: pendingBills } = await supabase
      .from("transactions")
      .select("id, name, date, amount")
      .eq("user_id", userId)
      .eq("status", "pendente")
      .eq("type", "despesa")
      .gte("date", todayStr)
      .lte("date", futureDateStr)
      .limit(20);

    if (pendingBills) {
      for (const bill of pendingBills) {
        if (!(await exists(bill.id, "vencimento"))) {
          const daysUntil = Math.ceil((new Date(bill.date).getTime() - today.getTime()) / 86400000);
          notifications.push({
            user_id: userId,
            title: daysUntil === 0 ? "Conta vence hoje!" : `Conta vence em ${daysUntil} dia${daysUntil > 1 ? "s" : ""}`,
            message: `${bill.name} — R$ ${Number(bill.amount).toFixed(2).replace(".", ",")}`,
            type: daysUntil === 0 ? "alert" : "warning",
            category: "vencimento",
            related_id: bill.id,
          });
        }
      }
    }
  }

  // 2. Invoice reminders (unpaid invoices for current month)
  if (settings.invoice_reminder) {
    const { data: invoices } = await supabase
      .from("invoices")
      .select("id, month, year, total_amount, credit_card_id")
      .eq("user_id", userId)
      .eq("is_paid", false)
      .eq("month", today.getMonth() + 1)
      .eq("year", today.getFullYear())
      .gt("total_amount", 0)
      .limit(10);

    if (invoices) {
      for (const inv of invoices) {
        // Get due_day from credit card
        const { data: card } = await supabase
          .from("credit_cards")
          .select("due_day, name")
          .eq("id", inv.credit_card_id)
          .single();

        if (card) {
          const dueDate = new Date(inv.year, inv.month - 1, card.due_day);
          const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);

          if (daysUntil >= 0 && daysUntil <= settings.bill_due_days_before) {
            if (!(await exists(inv.id, "fatura"))) {
              notifications.push({
                user_id: userId,
                title: daysUntil === 0 ? "Fatura vence hoje!" : `Fatura vence em ${daysUntil} dia${daysUntil > 1 ? "s" : ""}`,
                message: `${card.name} — R$ ${Number(inv.total_amount).toFixed(2).replace(".", ",")}`,
                type: daysUntil <= 1 ? "alert" : "warning",
                category: "fatura",
                related_id: inv.id,
              });
            }
          }
        }
      }
    }
  }

  // 3. Goal deadline reminders
  if (settings.goal_reminder) {
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 7);
    const futureDateStr = futureDate.toISOString().split("T")[0];

    const { data: goals } = await supabase
      .from("goals")
      .select("id, name, deadline, current_amount, target_amount")
      .eq("user_id", userId)
      .not("deadline", "is", null)
      .gte("deadline", todayStr)
      .lte("deadline", futureDateStr)
      .limit(10);

    if (goals) {
      for (const goal of goals) {
        if (goal.current_amount < goal.target_amount && !(await exists(goal.id, "meta"))) {
          const daysLeft = Math.ceil((new Date(goal.deadline!).getTime() - today.getTime()) / 86400000);
          const pct = Math.round((goal.current_amount / goal.target_amount) * 100);
          notifications.push({
            user_id: userId,
            title: `Meta "${goal.name}" vence em ${daysLeft} dias`,
            message: `Progresso: ${pct}% — faltam R$ ${(goal.target_amount - goal.current_amount).toFixed(2).replace(".", ",")}`,
            type: "info",
            category: "meta",
            related_id: goal.id,
          });
        }
      }
    }
  }

  // 4. Low balance alert
  if (settings.low_balance_alert) {
    const { data: accounts } = await supabase
      .from("accounts")
      .select("id, name, current_balance, type")
      .eq("user_id", userId)
      .eq("is_active", true)
      .neq("type", "investimento")
      .lt("current_balance", settings.low_balance_threshold);

    if (accounts) {
      for (const acc of accounts) {
        if (!(await exists(acc.id, "saldo"))) {
          notifications.push({
            user_id: userId,
            title: "Saldo baixo",
            message: `${acc.name} está com R$ ${Number(acc.current_balance).toFixed(2).replace(".", ",")}`,
            type: "warning",
            category: "saldo",
            related_id: acc.id,
          });
        }
      }
    }
  }

  // Insert all new notifications
  if (notifications.length > 0) {
    await supabase.from("notifications").insert(notifications as any);
  }
}
