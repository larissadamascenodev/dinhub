import { memo } from "react";
import { LayoutDashboard, ArrowLeftRight, Wallet, Bot, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Transações", icon: ArrowLeftRight, active: false },
  { label: "Carteira", icon: Wallet, active: false },
  { label: "Bot Finance", icon: Bot, active: false },
  { label: "Perfil", icon: User, active: false },
];

const Navbar = memo(() => (
  <nav className="hidden md:flex items-center justify-center gap-1 mb-6">
    {NAV_ITEMS.map((item) => {
      const Icon = item.icon;
      return (
        <button
          key={item.label}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
            item.active
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Icon className="h-4 w-4" />
          {item.label}
        </button>
      );
    })}
  </nav>
));

Navbar.displayName = "Navbar";
export default Navbar;
