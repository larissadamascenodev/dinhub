import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, AlertTriangle, Info, Target, CreditCard, Wallet, X } from "lucide-react";
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

const CATEGORY_CONFIG: Record<string, { icon: typeof Bell; className: string }> = {
  vencimento: { icon: AlertTriangle, className: "text-warning bg-warning/10" },
  fatura: { icon: CreditCard, className: "text-destructive bg-destructive/10" },
  meta: { icon: Target, className: "text-primary bg-primary/10" },
  saldo: { icon: Wallet, className: "text-orange-400 bg-orange-400/10" },
  geral: { icon: Info, className: "text-blue-400 bg-blue-400/10" },
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

  const handleClickNotification = async (n: AppNotification) => {
    if (!n.is_read) {
      await markAsRead(n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
      );
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed md:absolute right-4 md:right-0 top-16 md:top-full md:mt-2 z-50 w-[calc(100vw-2rem)] md:w-80 max-h-[70vh] bg-card border border-border/20 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/10">
              <h3 className="text-sm font-bold text-foreground">Notificações</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Marcar todas
                  </button>
                )}
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-xs text-muted-foreground">Carregando...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-xs text-muted-foreground">Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const config = CATEGORY_CONFIG[n.category] ?? CATEGORY_CONFIG.geral;
                  const Icon = config.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleClickNotification(n)}
                      className={cn(
                        "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors border-b border-border/5",
                        !n.is_read && "bg-primary/5"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", config.className)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("text-xs font-semibold truncate", n.is_read ? "text-muted-foreground" : "text-foreground")}>
                            {n.title}
                          </p>
                          <span className="text-[9px] text-muted-foreground shrink-0">{timeAgo(n.created_at)}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                      {!n.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
