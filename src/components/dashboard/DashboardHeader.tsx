import { memo, useMemo, useState, useRef, useEffect } from "react";
import { LayoutDashboard, ArrowLeftRight, Plus, Bot, User, Bell, Flame, PiggyBank, Settings, LogOut, TrendingUp, TrendingDown, Camera } from "lucide-react";
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
  { label: "Bot Finance", icon: Bot, path: "/bot" },
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
  const [transacaoMenuOpen, setTransacaoMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const transacaoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (transacaoRef.current && !transacaoRef.current.contains(e.target as Node)) setTransacaoMenuOpen(false);
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

                  {/* Dropdown */}
                  <AnimatePresence>
                    {transacaoMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50 flex gap-2.5 p-2 rounded-2xl bg-card/90 backdrop-blur-2xl border border-border/20 shadow-2xl shadow-black/40"
                      >
                        <button
                          onClick={() => handleTransacaoOption("receita")}
                          className="flex flex-col items-center gap-1.5 w-[72px] py-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-all group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center group-hover:shadow-[0_0_12px_hsl(150_100%_45%/0.3)] transition-shadow">
                            <TrendingUp className="w-4.5 h-4.5 text-primary" />
                          </div>
                          <span className="text-[10px] font-bold text-primary">Receita</span>
                        </button>
                        <button
                          onClick={() => handleTransacaoOption("despesa")}
                          className="flex flex-col items-center gap-1.5 w-[72px] py-3 rounded-xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 hover:border-destructive/40 transition-all group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-destructive/15 flex items-center justify-center group-hover:shadow-[0_0_12px_hsl(0_84%_60%/0.3)] transition-shadow">
                            <TrendingDown className="w-4.5 h-4.5 text-destructive" />
                          </div>
                          <span className="text-[10px] font-bold text-destructive">Despesa</span>
                        </button>
                        <button
                          onClick={() => handleTransacaoOption("scanner")}
                          className="flex flex-col items-center gap-1.5 w-[72px] py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center group-hover:shadow-[0_0_12px_hsl(217_91%_60%/0.3)] transition-shadow">
                            <Camera className="w-4.5 h-4.5 text-blue-400" />
                          </div>
                          <span className="text-[10px] font-bold text-blue-400">Scanner</span>
                        </button>
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
