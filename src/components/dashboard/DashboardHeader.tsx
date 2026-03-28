import { memo, useMemo } from "react";
import { LayoutDashboard, ArrowLeftRight, Wallet, Bot, User, Bell, Flame, PiggyBank } from "lucide-react";
import { motion } from "framer-motion";

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
    <>
      {/* Desktop Top Bar */}
      <div
        className="hidden md:flex items-center justify-between sticky top-0 z-50 px-6 py-3 -mx-4 md:-mx-6 mb-4"
        style={{
          background: "linear-gradient(180deg, hsl(225 25% 5% / 0.95) 0%, hsl(225 25% 4% / 0.85) 100%)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid hsl(225 14% 14% / 0.4)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(152 50% 48%) 0%, hsl(165 55% 38%) 100%)",
              boxShadow: "0 2px 8px -2px hsl(152 45% 45% / 0.3)",
            }}
          >
            <PiggyBank className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">
            <span className="text-foreground">Finan</span>
            <span className="text-primary">Pro</span>
          </span>
        </div>

        {/* Center: Floating nav pill */}
        <nav
          className="flex items-center gap-1 rounded-2xl px-1.5 py-1"
          style={{
            background: "linear-gradient(145deg, hsl(225 20% 10%) 0%, hsl(225 22% 7%) 100%)",
            border: "1px solid hsl(225 14% 16% / 0.5)",
            boxShadow: "0 4px 20px -4px rgba(0,0,0,0.5)",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                  item.active
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                }`}
                style={item.active ? {
                  background: "linear-gradient(135deg, hsl(152 50% 48%) 0%, hsl(165 55% 38%) 100%)",
                  boxShadow: "0 2px 8px -2px hsl(152 45% 45% / 0.3)",
                } : undefined}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Streak + Bell + Avatar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all"
            style={{
              background: "linear-gradient(135deg, hsl(40 75% 48% / 0.12) 0%, hsl(40 75% 48% / 0.04) 100%)",
              border: "1px solid hsl(40 75% 48% / 0.2)",
            }}
          >
            <Flame className="w-4 h-4 text-warning" />
            <span className="text-sm font-bold text-warning">0</span>
          </button>
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            style={{
              background: "hsl(225 20% 10%)",
              border: "1px solid hsl(225 14% 16% / 0.5)",
            }}
          >
            <Bell className="h-4 w-4" />
          </button>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-foreground text-xs font-bold"
            style={{
              background: "linear-gradient(135deg, hsl(225 18% 14%) 0%, hsl(225 20% 10%) 100%)",
              border: "1px solid hsl(225 14% 16% / 0.5)",
            }}
          >
            U
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <header
        className="sticky top-0 z-40 px-4 py-3 md:hidden -mx-4 mb-2"
        style={{
          background: "linear-gradient(180deg, hsl(225 25% 5% / 0.95) 0%, hsl(225 25% 4% / 0.85) 100%)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid hsl(225 14% 14% / 0.3)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(152 50% 48%) 0%, hsl(165 55% 38%) 100%)",
                boxShadow: "0 2px 6px -2px hsl(152 45% 45% / 0.3)",
              }}
            >
              <PiggyBank className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">
              <span className="text-foreground">Finan</span>
              <span className="text-primary">Pro</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground"
              style={{
                background: "hsl(225 20% 10%)",
                border: "1px solid hsl(225 14% 16% / 0.5)",
              }}
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-1 md:mb-2">
        <h1 className="font-display text-xl md:text-2xl font-bold leading-tight">
          {greeting}, <span className="text-foreground/70">Olá</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">{dateStr}</p>
      </motion.div>
    </>
  );
});

DashboardHeader.displayName = "DashboardHeader";
export default DashboardHeader;
