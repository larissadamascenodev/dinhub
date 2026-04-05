import { memo, useMemo, useState, useRef, useEffect } from "react";
import { LayoutDashboard, ArrowLeftRight, Plus, Bot, User, Bell, Flame, PiggyBank, Settings, LogOut, TrendingUp, TrendingDown, Camera, Wallet } from "lucide-react";
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
  { label: "Transações", icon: ArrowLeftRight, path: "/transacoes" },
  { label: "Nova transação", icon: Plus, path: "/nova-transacao", isAction: true },
  { label: "Bot Finance", icon: Bot, path: "/bot-finance" },
  { label: "Perfil", icon: User, path: "/configuracoes" },
];

const DashboardHeader = memo(({ profile, streak = 0, streakDates = [] }: { profile?: { display_name: string | null } | null; streak?: number; streakDates?: string[] }) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initial = (profile?.display_name ?? user?.email ?? "U").charAt(0).toUpperCase();
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Usuário";
  const email = user?.email ?? "";
  const plan = "Free";
  const [menuOpen, setMenuOpen] = useState(false);
  const [transacaoMenuOpen, setTransacaoMenuOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const transacaoRef = useRef<HTMLDivElement>(null);
  const streakRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (transacaoRef.current && !transacaoRef.current.contains(e.target as Node)) setTransacaoMenuOpen(false);
      if (streakRef.current && !streakRef.current.contains(e.target as Node)) setStreakOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleTransacaoOption = (type: "receita" | "despesa" | "scanner") => {
    setTransacaoMenuOpen(false);
    if (type === "scanner") {
      window.dispatchEvent(new CustomEvent("open-scanner"));
    } else {
      window.dispatchEvent(new CustomEvent("open-nova-transacao-direct", { detail: { type } }));
    }
  };

  return (
    <>
      {/* Desktop backdrop for transaction menu */}
      <AnimatePresence>
        {transacaoMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hidden md:block fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setTransacaoMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Top Bar */}
      <div className="hidden md:flex items-center justify-between sticky top-0 z-50 bg-background/70 backdrop-blur-2xl px-6 py-3 border-b border-border/10 -mx-4 md:-mx-6 mb-4">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <PiggyBank className="w-8 h-8 text-primary" />
          <span className="font-display font-bold text-2xl">
            <span className="text-foreground">Din</span>
            <span className="text-primary">Hub</span>
          </span>
        </div>

        {/* Center: Floating nav pill */}
        <nav className="flex items-center gap-1 bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl px-1.5 py-1 shadow-lg shadow-black/10">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isAction = item.isAction;

            if (isAction) {
              return (
                <div key={item.label} className="relative" ref={transacaoRef}>
                  <button
                    onClick={() => setTransacaoMenuOpen((v) => !v)}
                    className="relative -my-1 mx-1 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25"
                    style={{
                      boxShadow: "0 2px 12px -2px hsl(150 100% 45% / 0.3)",
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>

                  {/* Dropdown - vertical card style */}
                  <AnimatePresence>
                    {transacaoMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50 w-44 rounded-2xl bg-card/95 backdrop-blur-2xl border border-border/20 shadow-2xl shadow-black/25 overflow-hidden"
                      >
                        {/* Arrow indicator */}
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-card/95 border-l border-t border-border/20" />

                        <div className="relative flex flex-col p-1.5 gap-0.5">
                          <button
                            onClick={() => handleTransacaoOption("receita")}
                            className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 ease-out hover:bg-primary/10"
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                              <TrendingUp className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="text-xs font-semibold text-foreground">Receita</span>
                              <span className="text-[9px] text-muted-foreground">Adicionar ganho</span>
                            </div>
                          </button>

                          <div className="h-px bg-border/10 mx-2" />

                          <button
                            onClick={() => handleTransacaoOption("despesa")}
                            className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 ease-out hover:bg-destructive/10"
                          >
                            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                              <TrendingDown className="w-4 h-4 text-destructive" />
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="text-xs font-semibold text-foreground">Despesa</span>
                              <span className="text-[9px] text-muted-foreground">Adicionar gasto</span>
                            </div>
                          </button>

                          <div className="h-px bg-border/10 mx-2" />

                          <button
                            onClick={() => handleTransacaoOption("scanner")}
                            className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 ease-out hover:bg-accent/10"
                          >
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                              <Camera className="w-4 h-4 text-accent-foreground" />
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="text-xs font-semibold text-foreground">Scanner</span>
                              <span className="text-[9px] text-muted-foreground">Escanear recibo</span>
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
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
            <span className="text-sm font-bold text-warning">{streak}</span>
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
             <PiggyBank className="w-7 h-7 text-primary" />
            <span className="font-display font-bold text-xl">
              <span className="text-foreground">Din</span>
              <span className="text-primary">Hub</span>
            </span>
          </div>
          <div className="flex items-center gap-1 bg-card/60 backdrop-blur-xl border border-border/20 rounded-full px-1.5 py-1">
            <button
              onClick={() => navigate("/gestao")}
              className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Wallet className="h-3.5 w-3.5" />
            </button>
            <button className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground">
              <Bell className="h-3.5 w-3.5" />
            </button>
            <button className="flex items-center gap-1 px-2 py-1 rounded-full bg-warning/10 border border-warning/20">
              <Flame className="w-3 h-3 text-warning" />
              <span className="text-[11px] font-bold text-warning">{streak}</span>
            </button>
          </div>
        </div>
      </header>

      
    </>
  );
});

DashboardHeader.displayName = "DashboardHeader";
export default DashboardHeader;
