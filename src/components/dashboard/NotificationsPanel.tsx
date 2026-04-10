import { useState, useEffect, useCallback } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

const CATEGORY_CONFIG: Record<string, { icon: typeof Bell; className: string; bg: string }> = {
  vencimento: { icon: AlertTriangle, className: "text-warning", bg: "bg-warning/10" },
  fatura: { icon: CreditCard, className: "text-destructive", bg: "bg-destructive/10" },
  meta: { icon: Target, className: "text-primary", bg: "bg-primary/10" },
  saldo: { icon: Wallet, className: "text-orange-400", bg: "bg-orange-400/10" },
  geral: { icon: Info, className: "text-muted-foreground", bg: "bg-muted/15" },
};

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

// ── Hook ──
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

  useEffect(() => { refresh(); }, [refresh]);

  return { unreadCount, refresh };
}

// ── Swipeable Row ──
function NotificationRow({
  notification: n,
  onMarkRead,
  onDelete,
}: {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = CATEGORY_CONFIG[n.category] ?? CATEGORY_CONFIG.geral;
  const Icon = config.icon;
  const [dismissed, setDismissed] = useState(false);

  const handleDragEnd = (_: any, info: PanInfo) => {
    // Swipe RIGHT → mark as read
    if (info.offset.x > 80) {
      onMarkRead(n.id);
    }
    // Swipe LEFT → delete
    if (info.offset.x < -80) {
      setDismissed(true);
      setTimeout(() => onDelete(n.id), 250);
    }
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl", dismissed && "opacity-0 scale-95 transition-all duration-200")}>
      {/* Left action (swipe right = mark read) */}
      <div className="absolute inset-y-0 left-0 w-24 flex items-center justify-center bg-primary/15 rounded-l-xl">
        <div className="flex flex-col items-center gap-0.5">
          <Check className="w-5 h-5 text-primary" />
          <span className="text-[8px] text-primary font-bold">Lida</span>
        </div>
      </div>
      {/* Right action (swipe left = delete) */}
      <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-center bg-destructive/15 rounded-r-xl">
        <div className="flex flex-col items-center gap-0.5">
          <Trash2 className="w-5 h-5 text-destructive" />
          <span className="text-[8px] text-destructive font-bold">Apagar</span>
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 0.98 }}
        className={cn(
          "relative flex items-center gap-3 p-3.5 rounded-xl border select-none cursor-grab active:cursor-grabbing",
          n.is_read
            ? "bg-card/60 border-border/10"
            : "bg-card border-border/15 shadow-sm shadow-black/5"
        )}
      >
        {/* Category icon */}
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          config.bg,
          !n.is_read && "ring-1 ring-inset",
          !n.is_read && (n.category === "vencimento" ? "ring-warning/20" : n.category === "fatura" ? "ring-destructive/20" : "ring-primary/20")
        )}>
          <Icon className={cn("w-4.5 h-4.5", config.className)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={cn(
              "text-[13px] font-semibold leading-snug truncate",
              n.is_read ? "text-muted-foreground/60" : "text-foreground"
            )}>
              {n.title}
            </p>
            <span className="text-[9px] text-muted-foreground/40 shrink-0">{timeAgo(n.created_at)}</span>
          </div>
          <p className={cn(
            "text-[11px] mt-0.5 leading-relaxed line-clamp-1",
            n.is_read ? "text-muted-foreground/40" : "text-muted-foreground/70"
          )}>
            {n.message}
          </p>
        </div>

        {/* Unread dot */}
        {!n.is_read && (
          <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 ring-[3px] ring-primary/15" />
        )}
      </motion.div>
    </div>
  );
}


// ── Shared content ──
function NotificationContent({
  notifications,
  loading,
  unreadCount,
  onMarkAllRead,
  onMarkRead,
  onDelete,
  onClose,
  showHeader = true,
}: {
  notifications: AppNotification[];
  loading: boolean;
  unreadCount: number;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  showHeader?: boolean;
}) {
  return (
    <div className="flex flex-col h-full max-h-[80vh] md:max-h-[70vh]">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <button onClick={onClose} className="md:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground">Notificações</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Marcar todas</span>
              </button>
            )}
            <button onClick={onClose} className="hidden md:block text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/20">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-border/5">
        {loading ? (
          <div className="p-10 text-center">
            <div className="w-10 h-10 rounded-2xl bg-muted/15 flex items-center justify-center mx-auto mb-3 animate-pulse">
              <Bell className="w-5 h-5 text-muted-foreground/30" />
            </div>
            <p className="text-xs text-muted-foreground">Carregando...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-muted/10 flex items-center justify-center mx-auto">
              <Bell className="w-7 h-7 text-muted-foreground/20" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tudo em dia!</p>
              <p className="text-[11px] text-muted-foreground/50 mt-1">Nenhuma notificação no momento</p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                layout
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <NotificationRow
                  notification={n}
                  onMarkRead={onMarkRead}
                  onDelete={onDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer hint */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-border/5 shrink-0">
          <p className="text-[9px] text-muted-foreground/40 text-center select-none">
            ← Deslize para marcar como lida ou remover
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main Component ──
interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
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

  const contentProps = {
    notifications,
    loading,
    unreadCount,
    onMarkAllRead: handleMarkAllRead,
    onMarkRead: handleMarkRead,
    onDelete: handleDelete,
    onClose,
  };

  // Mobile: use Drawer (bottom sheet)
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
        <DrawerContent className="bg-card border-border/20 max-h-[85vh]">
          <NotificationContent {...contentProps} />
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: use Dialog
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card/95 backdrop-blur-2xl border-border/20 rounded-2xl p-0 max-w-sm overflow-hidden">
        <NotificationContent {...contentProps} />
      </DialogContent>
    </Dialog>
  );
}
