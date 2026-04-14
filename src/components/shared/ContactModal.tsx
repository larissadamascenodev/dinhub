import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, MessageCircle, Clock, MapPin } from "lucide-react";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

const channels = [
  {
    icon: Mail,
    title: "Email",
    subtitle: "suporte@dinhub.com",
    color: "from-blue-500/20 to-blue-600/10",
    iconBg: "bg-blue-500/15 text-blue-400",
    href: "mailto:suporte@dinhub.com",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    subtitle: "Atendimento rápido",
    color: "from-emerald-500/20 to-emerald-600/10",
    iconBg: "bg-emerald-500/15 text-emerald-400",
    href: "https://wa.me/5500000000000",
  },
  {
    icon: Clock,
    title: "Horário de Atendimento",
    subtitle: "Seg a Sex, 9h às 18h (Brasília)",
    color: "from-amber-500/20 to-amber-600/10",
    iconBg: "bg-amber-500/15 text-amber-400",
  },
];

const ContactModal = ({ open, onClose }: ContactModalProps) => {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-border/20 overflow-hidden"
            style={{
              background: "linear-gradient(160deg, hsl(220 18% 10%) 0%, hsl(220 20% 6%) 100%)",
              boxShadow: "0 25px 60px -12px rgba(0,0,0,0.7), 0 0 40px -8px hsl(150 100% 45% / 0.05)",
            }}
          >
            {/* Glow accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/6 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground tracking-tight">Contato</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center hover:bg-muted/60 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Description */}
            <p className="px-5 text-sm text-muted-foreground leading-relaxed">
              Tem alguma dúvida, sugestão ou precisa de ajuda? Entre em contato conosco por um dos canais abaixo.
            </p>

            {/* Channels */}
            <div className="p-5 space-y-3">
              {channels.map((ch, i) => {
                const Wrapper = ch.href ? "a" : "div";
                const wrapperProps = ch.href
                  ? { href: ch.href, target: "_blank", rel: "noopener noreferrer" }
                  : {};

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                  >
                    <Wrapper
                      {...(wrapperProps as any)}
                      className={`flex items-center gap-4 p-4 rounded-xl border border-border/15 bg-gradient-to-r ${ch.color} backdrop-blur-sm ${ch.href ? "cursor-pointer hover:border-border/30 transition-colors" : ""}`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${ch.iconBg} flex items-center justify-center shrink-0`}>
                        <ch.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{ch.title}</p>
                        <p className="text-xs text-muted-foreground">{ch.subtitle}</p>
                      </div>
                    </Wrapper>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 pb-5">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
                <MapPin className="w-3 h-3" />
                <span>DinHub · Brasil</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal;
