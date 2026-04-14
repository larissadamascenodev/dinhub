import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, MessageCircle, Clock, Headphones, Send } from "lucide-react";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

const ContactModal = ({ open, onClose }: ContactModalProps) => {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl border border-border/20 overflow-hidden"
            style={{
              background: "linear-gradient(175deg, hsl(220 18% 10%) 0%, hsl(220 22% 5%) 100%)",
              boxShadow: "0 -8px 40px -8px rgba(0,0,0,0.6), 0 0 60px -20px hsl(150 100% 45% / 0.06)",
            }}
          >
            {/* Top handle (mobile) */}
            <div className="flex sm:hidden justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Hero section */}
            <div className="relative px-6 pt-5 pb-4 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: "spring", bounce: 0.3 }}
                className="relative mx-auto w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3"
              >
                <Headphones className="w-7 h-7 text-primary" />
              </motion.div>
              <h2 className="relative text-lg font-display font-bold text-foreground">Fale conosco</h2>
              <p className="relative text-xs text-muted-foreground mt-1 max-w-[260px] mx-auto leading-relaxed">
                Escolha o canal que preferir — estamos prontos para te ajudar.
              </p>

              {/* Close btn */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Channel buttons */}
            <div className="px-5 pb-2 space-y-2">
              {/* Email */}
              <motion.a
                href="mailto:suporte@dinhub.com"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="group flex items-center gap-3.5 p-3.5 rounded-xl border border-border/15 bg-card/30 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-4.5 h-4.5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Email</p>
                  <p className="text-[11px] text-muted-foreground truncate">suporte@dinhub.com</p>
                </div>
                <Send className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
              </motion.a>

              {/* WhatsApp */}
              <motion.a
                href="https://wa.me/5500000000000"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="group flex items-center gap-3.5 p-3.5 rounded-xl border border-border/15 bg-card/30 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-4.5 h-4.5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">WhatsApp</p>
                  <p className="text-[11px] text-muted-foreground">Atendimento rápido</p>
                </div>
                <Send className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
              </motion.a>
            </div>

            {/* Schedule info — inline pill */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.36 }}
              className="mx-5 mt-2 mb-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-muted/20 border border-border/10"
            >
              <Clock className="w-3.5 h-3.5 text-warning" />
              <span className="text-[11px] text-muted-foreground">
                Seg a Sex, <span className="text-foreground/70 font-medium">9h às 18h</span> (Brasília)
              </span>
            </motion.div>

            {/* Footer */}
            <div className="px-5 pb-5 pt-1 flex items-center justify-between text-[10px] text-muted-foreground/30">
              <span>DinHub · Brasil</span>
              <span>Desenvolvido por <span className="text-muted-foreground/50 font-medium">Néctar</span></span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal;
