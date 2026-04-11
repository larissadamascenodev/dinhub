import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Bell, CheckCheck, AlertTriangle, Info, Target, CreditCard, Wallet, X, Check, ChevronLeft } from "lucide-react";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

const CATEGORY_CONFIG: Record<string, { icon: typeof Bell; className: string; bg: string }> = {
  vencimento: { icon: AlertTriangle, className: "text-warning", bg: "bg-warning/10" },
  fatura: { icon: CreditCard, className: "text-destructive", bg: "bg-destructive/10" },
  meta: { icon: Target, className: "text-primary", bg: "bg-primary/10" },
  saldo: { icon: Wallet, className: "text-orange-400", bg: "bg-orange-400/10" },
  geral: { icon: Info, className: "text-muted-foreground", bg: "bg-muted/15" },
};

const NOTIFICATION_LIMIT = 30;
const notificationCache = new Map<string, AppNotification[]>();
const notificationRequests = new Map<string, Promise<AppNotification[]>>();

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}sem`;
}

function getUnreadTotal(items: AppNotification[]) {
  return items.filter((item) => !item.is_read).length;
}

function updateNotificationCache(userId: string, items: AppNotification[]) {
  notificationCache.set(userId, items);
}

function clearNotificationCache(userId: string) {
  notificationCache.delete(userId);
  notificationRequests.delete(userId);
}

async function ensureNotificationsLoaded(userId: string, force = false) {
  if (!force) {
    const cached = notificationCache.get(userId);
    if (cached) return cached;
  }

  const inFlight = notificationRequests.get(userId);
  if (inFlight) return inFlight;

  const request = fetchNotifications(userId, NOTIFICATION_LIMIT)
    .then((data) => {
      updateNotificationCache(userId, data);
      return data;
    })
    .finally(() => {
      notificationRequests.delete(userId);
    });

  notificationRequests.set(userId, request);
  return request;
}

export function useNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [generated, setGenerated] = useState(false);

  const refresh = useCallback(async (force = false) => {
    if (!user) return;

    if (!force) {
      const cached = notificationCache.get(user.id);
      if (cached) {
        setUnreadCount(getUnreadTotal(cached));
        return;
      }
    }

    const count = await countUnread(user.id);
    setUnreadCount(count);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setGenerated(false);
      setUnreadCount(0);
      return;
    }

    setGenerated(false);

    const cached = notificationCache.get(user.id);
    if (cached) {
      setUnreadCount(getUnreadTotal(cached));
    }

    void ensureNotificationsLoaded(user.id)
      .then((data) => setUnreadCount(getUnreadTotal(data)))
      .catch(() => {
        void refresh(true);
      });
  }, [user, refresh]);

  useEffect(() => {
    if (!user || generated) return;

    setGenerated(true);
    void generateNotifications(user.id)
      .then(async () => {
        clearNotificationCache(user.id);
        const data = await ensureNotificationsLoaded(user.id, true);
        setUnreadCount(getUnreadTotal(data));
      })
      .catch(() => {
        void refresh(true);
      });
  }, [user, generated, refresh]);

  return { unreadCount, refresh };
}

function NotificationRow({
  notification: n,
  onMarkRead,
}: {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
}) {
  const config = CATEGORY_CONFIG[n.category] ?? CATEGORY_CONFIG.geral;
  const Icon = config.icon;

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80) {
      onMarkRead(n.id);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-y-0 right-0 flex w-24 items-center justify-center rounded-r-xl bg-primary/15">
        <div className="flex flex-col items-center gap-0.5">
          <Check className="h-5 w-5 text-primary" />
          <span className="text-[8px] font-bold text-primary">Lida</span>
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 0.98 }}
        className={cn(
          "relative flex cursor-grab select-none items-center gap-3 rounded-xl border p-3.5 active:cursor-grabbing",
          n.is_read
            ? "border-border/10 bg-card/60"
            : "border-border/15 bg-card shadow-sm shadow-black/5"
        )}
      >
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            config.bg,
            !n.is_read && "ring-1 ring-inset",
            !n.is_read && (n.category === "vencimento" ? "ring-warning/20" : n.category === "fatura" ? "ring-destructive/20" : "ring-primary/20")
          )}
        >
          <Icon className={cn("h-4.5 w-4.5", config.className)} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p
              className={cn(
                "truncate text-[13px] font-semibold leading-snug",
                n.is_read ? "text-muted-foreground/60" : "text-foreground"
              )}
            >
              {n.title}
            </p>
            <span className="shrink-0 text-[9px] text-muted-foreground/40">{timeAgo(n.created_at)}</span>
          </div>
          <p
            className={cn(
              "mt-0.5 line-clamp-1 text-[11px] leading-relaxed",
              n.is_read ? "text-muted-foreground/40" : "text-muted-foreground/70"
            )}
          >
            {n.message}
          </p>
        </div>

        {!n.is_read && <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary ring-[3px] ring-primary/15" />}
      </motion.div>
    </div>
  );
}

function NotificationContent({
  notifications,
  loading,
  unreadCount,
  onMarkAllRead,
  onMarkRead,
  onClose,
  showHeader = true,
}: {
  notifications: AppNotification[];
  loading: boolean;
  unreadCount: number;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onClose: () => void;
  showHeader?: boolean;
}) {
  return (
    <div className="flex h-full max-h-[80vh] flex-col md:max-h-[70vh]">
      {showHeader && (
        <div className="flex shrink-0 items-center justify-between border-b border-border/10 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <button onClick={onClose} className="p-1 -ml-1 text-muted-foreground hover:text-foreground md:hidden">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">Notificações</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-medium text-primary transition-colors hover:text-primary/80"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Marcar todas</span>
              </button>
            )}
            <button onClick={onClose} className="hidden rounded-lg p-1 text-muted-foreground hover:bg-muted/20 hover:text-foreground md:block">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-2 overflow-y-auto overscroll-contain p-3">
        {loading ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 animate-pulse items-center justify-center rounded-2xl bg-muted/15">
              <Bell className="h-5 w-5 text-muted-foreground/30" />
            </div>
            <p className="text-xs text-muted-foreground">Carregando...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="space-y-3 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/10">
              <Bell className="h-7 w-7 text-muted-foreground/20" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tudo em dia!</p>
              <p className="mt-1 text-[11px] text-muted-foreground/50">Nenhuma notificação no momento</p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                layout
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
              >
                <NotificationRow notification={n} onMarkRead={onMarkRead} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="shrink-0 border-t border-border/5 px-4 py-2">
          <p className="select-none text-center text-[9px] text-muted-foreground/40">← Deslize para a esquerda para marcar como lida</p>
        </div>
      )}
    </div>
  );
}

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (force = false) => {
    if (!user) return;

    const cached = notificationCache.get(user.id);
    if (cached) {
      setNotifications(cached);
      setLoading(false);
      if (!force) return;
    } else {
      setLoading(true);
    }

    try {
      const data = await ensureNotificationsLoaded(user.id, force);
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const cached = notificationCache.get(user.id);
    if (cached) {
      setNotifications(cached);
    }
  }, [user]);

  useEffect(() => {
    if (!open || !user) return;

    const cached = notificationCache.get(user.id);
    if (cached) {
      setNotifications(cached);
      setLoading(false);
      void load(true);
      return;
    }

    void load(true);
  }, [open, load, user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllAsRead(user.id);
    updateNotificationCache(user.id, []);
    setNotifications([]);
  };

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) => {
      const next = prev.filter((item) => item.id !== id);
      if (user) {
        updateNotificationCache(user.id, next);
      }
      return next;
    });
  };

  const unreadCount = getUnreadTotal(notifications);

  const contentProps = {
    notifications,
    loading,
    unreadCount,
    onMarkAllRead: handleMarkAllRead,
    onMarkRead: handleMarkRead,
    onClose,
  };

  if (isMobile) {
    const mobilePanel = (
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="notif-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />
            <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center p-3">
              <motion.div
                key="notif-panel"
                initial={{ opacity: 0, y: 64, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.96 }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border border-border/20 bg-card/95 shadow-2xl backdrop-blur-2xl"
              >
                <NotificationContent {...contentProps} />
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    );

    return typeof document !== "undefined" ? createPortal(mobilePanel, document.body) : null;
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm overflow-hidden rounded-2xl border-border/20 bg-card/95 p-0 backdrop-blur-2xl">
        <NotificationContent {...contentProps} />
      </DialogContent>
    </Dialog>
  );
}
