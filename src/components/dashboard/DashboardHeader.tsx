import { memo, useMemo } from "react";
import { LayoutDashboard, ArrowLeftRight, Wallet, Bot, User, Bell, Flame, PiggyBank, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export const useGreeting = () => {
  return useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    let g = "Bom dia";
    if (hour >= 12 && hour < 18) g = "Boa tarde";
    else if (hour >= 18) g = "Boa noite";
    const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    return { greeting: g, dateStr: `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}` };
  }, []);
};

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Transações", icon: ArrowLeftRight, active: false },
  { label: "Carteira", icon: Wallet, active: false },
  { label: "Bot Finance", icon: Bot, active: false },
  { label: "Perfil", icon: User, active: false },
];

const DashboardHeader = memo(() => {
  const { signOut, user } = useAuth();
  const initials = user?.email?.substring(0, 2).toUpperCase() ?? "U";
  return (
    <>
      {/* Desktop Top Bar */}
      <div className="hidden md:flex items-center justify-between sticky top-0 z-50 bg-background/70 backdrop-blur-2xl px-6 py-3 border-b border-border/10 -mx-4 md:-mx-6 mb-4">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <PiggyBank className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-lg">
            <span className="text-foreground">Finan</span>
            <span className="text-primary">Pro</span>
          </span>
        </div>

        {/* Center: Floating nav pill */}
        <nav className="flex items-center gap-1 bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl px-1.5 py-1 shadow-lg shadow-black/10">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                  item.active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Streak + Bell + Avatar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/20 hover:border-warning/40 transition-all">
            <Flame className="w-4 h-4 text-warning" />
            <span className="text-sm font-bold text-warning">0</span>
          </button>
          <button className="w-9 h-9 rounded-full border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-4 w-4" />
          </button>
          <div className="w-8 h-8 rounded-lg border border-border/30 bg-muted/30 flex items-center justify-center text-foreground text-xs font-bold">
            {initials}
          </div>
          <button
            onClick={signOut}
            className="w-9 h-9 rounded-full border border-border/30 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl px-4 py-3 md:hidden -mx-4 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <PiggyBank className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg">
              <span className="text-foreground">Finan</span>
              <span className="text-primary">Pro</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-full border border-border/30 flex items-center justify-center text-muted-foreground">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      
    </>
  );
});

DashboardHeader.displayName = "DashboardHeader";
export default DashboardHeader;
