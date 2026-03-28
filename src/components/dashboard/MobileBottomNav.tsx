import { memo, useState } from "react";
import { Home, ArrowLeftRight, Wallet, User, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { icon: Home, label: "Início", active: true },
  { icon: ArrowLeftRight, label: "Transações", active: false },
  { icon: null, label: "", isCenter: true },
  { icon: Wallet, label: "Carteira", active: false },
  { icon: User, label: "Perfil", active: false },
];

const MobileBottomNav = memo(() => {
  const [isOpen, setIsOpen] = useState(false);

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

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-8 pb-4 md:hidden">
        <nav className="w-full max-w-[300px] rounded-2xl bg-card/90 backdrop-blur-xl border border-border/30 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-around h-[52px] px-1">
            {navItems.map((item, idx) => {
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
                      className="w-[42px] h-[42px] rounded-xl bg-primary shadow-lg shadow-primary/30 flex items-center justify-center"
                    >
                      {isOpen ? (
                        <X className="w-5 h-5 text-primary-foreground" />
                      ) : (
                        <Plus className="w-5 h-5 text-primary-foreground" />
                      )}
                    </motion.div>
                  </button>
                );
              }

              const Icon = item.icon!;
              return (
                <button key={item.label} className="flex flex-col items-center gap-0 min-w-[40px]">
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Icon className={`w-4 h-4 ${item.active ? "text-primary" : "text-muted-foreground/60"}`} />
                  </motion.div>
                  <span className={`text-[8px] font-medium ${item.active ? "text-primary" : "text-muted-foreground/50"}`}>
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
