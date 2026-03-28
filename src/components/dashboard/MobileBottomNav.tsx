import { memo, useState } from "react";
import { Home, ArrowLeftRight, Bot, User, Plus, X, TrendingUp, TrendingDown, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: ArrowLeftRight, label: "Transações", path: "/transacoes" },
  { icon: null, label: "", isCenter: true, path: "" },
  { icon: Bot, label: "Bot Finance", path: "/bot" },
  { icon: User, label: "Perfil", path: "/configuracoes" },
];

const MobileBottomNav = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleOption = (type: "receita" | "despesa" | "scanner") => {
    setIsOpen(false);
    if (type === "scanner") {
      window.dispatchEvent(new CustomEvent("open-scanner"));
    } else {
      window.dispatchEvent(new CustomEvent("open-nova-transacao-direct", { detail: { type } }));
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Floating action options */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed bottom-[90px] left-0 right-0 z-50 flex justify-center md:hidden">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.15 }}
              className="flex gap-1.5 p-1.5 rounded-xl bg-card/95 backdrop-blur-2xl border border-border/15 shadow-2xl shadow-black/40"
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOption("receita")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-medium text-foreground whitespace-nowrap">Receita</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOption("despesa")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                <span className="text-[11px] font-medium text-foreground whitespace-nowrap">Despesa</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOption("scanner")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-blue-500/10 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] font-medium text-foreground whitespace-nowrap">Scanner</span>
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-8 pb-4 md:hidden">
        <nav className="w-full max-w-[340px] rounded-2xl bg-card/90 backdrop-blur-xl border border-border/30 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-around h-[58px] px-2">
            {navItems.map((item) => {
              if (item.isCenter) {
                return (
                  <button
                    key="add-center"
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative -mt-3"
                  >
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
                      className="w-[44px] h-[44px] rounded-full flex items-center justify-center backdrop-blur-sm border border-primary/30"
                      style={{
                        background: "linear-gradient(160deg, hsl(150 100% 45% / 0.15) 0%, hsl(150 100% 45% / 0.08) 100%)",
                        boxShadow: "0 4px 16px -4px hsl(150 100% 45% / 0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
                      }}
                    >
                      {isOpen ? (
                        <X className="w-5 h-5 text-primary drop-shadow-[0_0_6px_hsl(150_100%_45%/0.6)]" />
                      ) : (
                        <Plus className="w-5 h-5 text-primary drop-shadow-[0_0_6px_hsl(150_100%_45%/0.6)]" />
                      )}
                    </motion.div>
                  </button>
                );
              }

              const Icon = item.icon!;
              const isActive = location.pathname === item.path;
              return (
                <button key={item.label} onClick={() => navigate(item.path)} className="flex flex-col items-center gap-0.5 min-w-[44px]">
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground/60"}`} />
                  </motion.div>
                  <span className={`text-[9px] font-medium ${isActive ? "text-primary" : "text-muted-foreground/50"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
});

MobileBottomNav.displayName = "MobileBottomNav";
export default MobileBottomNav;
