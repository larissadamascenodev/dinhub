import { memo, useMemo } from "react";
import { LayoutDashboard, ArrowLeftRight, Wallet, Bot, User, Bell, Flame } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Transações", icon: ArrowLeftRight, active: false },
  { label: "Carteira", icon: Wallet, active: false },
  { label: "Bot Finance", icon: Bot, active: false },
  { label: "Perfil", icon: User, active: false },
];

const DashboardHeader = memo(() => {
  const { greeting, dateStr } = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    let g = "Bom dia";
    if (hour >= 12 && hour < 18) g = "Boa tarde";
    else if (hour >= 18) g = "Boa noite";
    const days = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    return { greeting: g, dateStr: `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}` };
  }, []);

  return (
    <header className="mb-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🐾</span>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-foreground">Finan</span>
            <span className="fp-text-green">Pro</span>
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 bg-secondary/50 rounded-2xl p-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  item.active
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-sm font-semibold">
            <Flame className="h-4 w-4" />
            <span>0</span>
          </div>
          <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors hover:border-primary/30">
            <Bell className="h-4 w-4" />
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-fp-green/60 flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20">
            U
          </div>
        </div>
      </div>

      {/* Greeting */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold">
          {greeting}, <span className="fp-text-green">Olá</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{dateStr}</p>
      </div>
    </header>
  );
});

DashboardHeader.displayName = "DashboardHeader";
export default DashboardHeader;
