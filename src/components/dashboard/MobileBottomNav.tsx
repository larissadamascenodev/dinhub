import { memo } from "react";
import { Home, ArrowLeftRight, Plus, Wallet, MoreHorizontal } from "lucide-react";

const ITEMS = [
  { label: "Início", icon: Home, active: true },
  { label: "Transações", icon: ArrowLeftRight, active: false },
  { label: "", icon: Plus, isCenter: true },
  { label: "Carteira", icon: Wallet, active: false },
  { label: "Mais", icon: MoreHorizontal, active: false },
];

const MobileBottomNav = memo(() => (
  <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl px-2 pb-[env(safe-area-inset-bottom)] flex items-end justify-around">
    {ITEMS.map((item) => {
      const Icon = item.icon;
      if (item.isCenter) {
        return (
          <button
            key="center"
            className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/30 -mt-5 transition-transform active:scale-95"
          >
            <Icon className="h-6 w-6" />
          </button>
        );
      }
      return (
        <button
          key={item.label}
          className={`flex flex-col items-center gap-0.5 py-2 px-3 text-[10px] ${
            item.active ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Icon className="h-5 w-5" />
          <span>{item.label}</span>
        </button>
      );
    })}
  </div>
));

MobileBottomNav.displayName = "MobileBottomNav";
export default MobileBottomNav;
