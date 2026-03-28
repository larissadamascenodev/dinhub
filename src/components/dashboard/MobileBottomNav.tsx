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
  <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md px-4 py-2 flex items-center justify-around">
    {ITEMS.map((item) => {
      const Icon = item.icon;
      if (item.isCenter) {
        return (
          <button
            key="center"
            className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg -mt-5"
          >
            <Icon className="h-6 w-6" />
          </button>
        );
      }
      return (
        <button
          key={item.label}
          className={`flex flex-col items-center gap-0.5 text-[10px] py-1 ${
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
