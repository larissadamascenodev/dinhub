import { memo, useMemo, useState, useRef, useEffect } from "react";
import { LayoutDashboard, ArrowLeftRight, Wallet, Bot, User, Bell, Flame, PiggyBank, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Transações", icon: ArrowLeftRight, path: "/" },
  { label: "Carteira", icon: Wallet, path: "/gestao" },
  { label: "Bot Finance", icon: Bot, path: "/" },
  { label: "Perfil", icon: User, path: "/configuracoes" },
];

const DashboardHeader = memo(({ profile }: { profile?: { display_name: string | null } | null }) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initial = (profile?.display_name ?? user?.email ?? "U").charAt(0).toUpperCase();
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Usuário";
  const email = user?.email ?? "";
  const plan = "Free";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
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
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                  isActive
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

        {/* Right: Streak → Bell → Profile */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 border border-warning/20 hover:border-warning/40 transition-all">
            <Flame className="w-4 h-4 text-warning" />
            <span className="text-sm font-bold text-warning">0</span>
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-4 w-4" />
          </button>
          {/* Profile chip + dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 bg-card/80 border border-border/20 rounded-2xl px-2.5 py-1.5 hover:bg-card transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                {initial}
              </div>
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-foreground truncate max-w-[100px]">{displayName}</span>
                  <span className="px-1.5 py-px rounded bg-primary/15 text-primary text-[8px] font-bold uppercase tracking-wide shrink-0">{plan}</span>
                </div>
                <span className="text-[9px] text-muted-foreground truncate max-w-[120px]">{email}</span>
              </div>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-card border border-border/20 rounded-xl shadow-xl shadow-black/20 overflow-hidden z-50"
                >
                  <button
                    onClick={() => { setMenuOpen(false); navigate("/configuracoes"); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-foreground hover:bg-muted/30 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                    Configurações
                  </button>
                  <div className="h-px bg-border/10" />
                  <button
                    onClick={() => { setMenuOpen(false); signOut(); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sair da conta
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
