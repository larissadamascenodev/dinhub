import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Clock, MessageCircle, Handshake,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMBER = "5500000000000"; // Replace with real number

const INFO_ITEMS = [
  { icon: Clock, text: "Respondemos o mais rápido possível" },
  { icon: MessageCircle, text: "Atendimento via WhatsApp" },
  { icon: Handshake, text: "Suporte humano" },
];

const Suporte = () => {
  const navigate = useNavigate();
  const [clicked, setClicked] = useState(false);

  const handleSend = () => {
    setClicked(true);
    const text = encodeURIComponent("Olá! Vim pelo suporte do Willo.");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
    setTimeout(() => setClicked(false), 1200);
  };

  return (
    <div className="pt-1 pb-12 space-y-6">
      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="w-8 h-8 rounded-xl bg-card/60 backdrop-blur-xl border border-border/10 flex items-center justify-center hover:bg-card transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-1.5"
      >
        <h1 className="text-xl font-extrabold text-foreground tracking-tight">
          Precisa de ajuda?
        </h1>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Fala com a gente — vamos resolver isso juntos
        </p>
      </motion.div>

      {/* Info items */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col gap-2.5"
      >
        {INFO_ITEMS.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <item.icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[13px] text-muted-foreground">{item.text}</span>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleSend}
        disabled={clicked}
        className={cn(
          "w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-[14px] transition-all duration-200",
          "bg-primary/15 text-primary",
          "hover:bg-primary/20 active:bg-primary/10",
          clicked && "opacity-70 pointer-events-none",
        )}
      >
        <MessageCircle className="w-5 h-5" />
        Falar com o suporte no WhatsApp
        <ExternalLink className="w-3.5 h-3.5 opacity-60" />
      </motion.button>
    </div>
  );
};

export default Suporte;
