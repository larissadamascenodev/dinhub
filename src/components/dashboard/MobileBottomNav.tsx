import { memo, useState } from "react";
import { Home, ArrowLeftRight, Wallet, MoreHorizontal, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { icon: Home, label: "Início", active: true },
  { icon: ArrowLeftRight, label: "Transações", active: false },
  { icon: null, label: "", isCenter: true },
  { icon: Wallet, label: "Carteira", active: false },
  { icon: MoreHorizontal, label: "Mais", active: false },
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
        <nav
          className="w-full max-w-[300px] rounded-2xl backdrop-blur-xl"
          style={{
            background: "linear-gradient(145deg, hsl(225 20% 10% / 0.95) 0%, hsl(225 22% 6% / 0.95) 100%)",
            border: "1px solid hsl(225 14% 16% / 0.5)",
            boxShadow: "0 -4px 30px -4px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(255,255,255,0.05)",
          }}
        >
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
                      className="w-[42px] h-[42px] rounded-xl flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, hsl(152 50% 48%) 0%, hsl(165 55% 38%) 100%)",
                        boxShadow: "0 4px 16px -2px hsl(152 45% 45% / 0.35)",
                      }}
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
