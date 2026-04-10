import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Bell, CheckCheck, AlertTriangle, Info, Target, CreditCard, Wallet, X, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchNotifications,
  countUnread,
  markAsRead,
  markAllAsRead,
  generateNotifications,
  type AppNotification,
} from "@/services/notificationService";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const CATEGORY_CONFIG: Record<string, { icon: typeof Bell; className: string; accent: string }> = {
  vencimento: { icon: AlertTriangle, className: "text-warning", accent: "bg-warning/15 border-warning/20" },
  fatura: { icon: CreditCard, className: "text-destructive", accent: "bg-destructive/10 border-destructive/20" },
  meta: { icon: Target, className: "text-primary", accent: "bg-primary/10 border-primary/20" },
  saldo: { icon: Wallet, className: "text-orange-400", accent: "bg-orange-400/10 border-orange-400/20" },
  geral: { icon: Info, className: "text-muted-foreground", accent: "bg-muted/20 border-border/20" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function useNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [generated, setGenerated] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    const count = await countUnread(user.id);
    setUnreadCount(count);
  }, [user]);

  useEffect(() => {
    if (!user || generated) return;
    setGenerated(true);
    generateNotifications(user.id).then(() => refresh());
  }, [user, generated, refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { unreadCount, refresh };
}

// ── Swipeable notification row ──
function SwipeableNotification({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const x = useMotionValue(0);
  const bg = useTransform(x, [-120, -60, 0], [
    "hsl(var(--destructive) / 0.2)",
    "hsl(var(--primary) / 0.15)",
    "transparent",
  ]);

  const config = CATEGORY_CONFIG[notification.category] ?? CATEGORY_CONFIG.geral;
  const Icon = config.icon;

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -100) {
      onDelete(notification.id);
    } else if (info.offset.x < -50) {
      onMarkRead(notification.id);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background actions revealed on swipe */}
      <div className="absolute inset-0 flex items-center justify-end gap-2 pr-4">
        <div className="flex items-center gap-1 text-[10px] text-primary font-medium">
          <Check className="w-3 h-3" />
          Lida
        </div>
        <div className="flex items-center gap-1 text-[10px] text-destructive font-medium ml-3">
          <X className="w-3 h-3" />
          Remover
        </div>
      </div>

      <motion.div
        style={{ x, backgroundColor: bg }}
        drag="x"
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className="relative flex items-start gap-3 px-4 py-3 cursor-grab active:cursor-grabbing"
      >
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border", config.accent)}>
          <Icon className={cn("w-3.5 h-3.5", config.className)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn(
              "text-xs font-semibold leading-tight",
              notification.is_read ? "text-muted-foreground" : "text-foreground"
            )}>
              {notification.title}
            </p>
            <span className="text-[9px] text-muted-foreground/60 shrink-0 mt-0.5">{timeAgo(notification.created_at)}</span>
          </div>
          <p className="text-[11px] text-muted-foreground/80 mt-0.5 line-clamp-2 leading-relaxed">{notification.message}</p>
        </div>
        {!notification.is_read && (
          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2 ring-2 ring-primary/20" />
        )}
      </motion.div>
    </div>
  );
}

export default function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await fetchNotifications(user.id);
    setNotifications(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
    );
  };

  const handleDelete = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={cn(
              "fixed z-50 bg-card/95 backdrop-blur-2xl border border-border/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col",
              // Mobile: full-width centered
              "inset-x-3 top-16 max-h-[75vh]",
              // Desktop: positioned relative
              "md:inset-auto md:absolute md:right-0 md:top-full md:mt-2 md:w-80 md:max-h-[70vh]"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/10">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">Notificações</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {unreadCount} nova{unreadCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Todas lidas
                  </button>
                )}
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/20">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Swipe hint */}
            {notifications.length > 0 && (
              <div className="px-4 py-1.5 bg-muted/10 border-b border-border/5">
                <p className="text-[9px] text-muted-foreground/50 text-center">← Arraste para marcar como lida ou remover</p>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/5">
              {loading ? (
                <div className="p-8 text-center text-xs text-muted-foreground">Carregando...</div>
              ) : notifications.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto">
                    <Bell className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Tudo em dia!</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">Nenhuma notificação no momento</p>
                  </div>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map((n) => (
                    <motion.div
                      key={n.id}
                      layout
                      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SwipeableNotification
                        notification={n}
                        onMarkRead={handleMarkRead}
                        onDelete={handleDelete}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
