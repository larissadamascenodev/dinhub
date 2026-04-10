import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Clock, MessageCircle, Handshake,
  CreditCard, BarChart3, Settings, MessageSquare,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

const WHATSAPP_NUMBER = "5500000000000"; // Replace with real number

const INFO_ITEMS = [
  { icon: Clock, text: "Respondemos o mais rápido possível" },
  { icon: MessageCircle, text: "Atendimento via WhatsApp" },
  { icon: Handshake, text: "Suporte humano" },
];

const REASONS = [
  { icon: CreditCard, label: "Problemas com pagamento", value: "Problemas com pagamento" },
  { icon: BarChart3, label: "Dúvidas sobre o app", value: "Dúvidas sobre o app" },
  { icon: Settings, label: "Algo não está funcionando", value: "Algo não está funcionando" },
  { icon: MessageSquare, label: "Outro", value: "Outro" },
];

const Suporte = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [clicked, setClicked] = useState(false);

  const handleSend = () => {
    setClicked(true);
    const reason = selected || "Não especificado";
    const userMsg = message.trim();
    const text = encodeURIComponent(
      `Olá! Vim pelo suporte do DinHub.\nPreciso de ajuda com: ${reason}${userMsg ? `\n${userMsg}` : ""}`
    );
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

      {/* Info pills */}
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

      {/* Reason selector */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        <p className="text-[13px] font-bold text-foreground">Motivo do contato</p>
        <div className="grid grid-cols-2 gap-2">
          {REASONS.map((reason) => (
            <button
              key={reason.value}
              onClick={() => setSelected(selected === reason.value ? null : reason.value)}
              className={cn(
                "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200",
                "backdrop-blur-xl text-[12px] font-medium",
                selected === reason.value
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border/10 bg-card/50 text-muted-foreground hover:bg-card/70",
              )}
            >
              <reason.icon className="w-4 h-4 shrink-0" />
              {reason.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Message field */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <p className="text-[13px] font-bold text-foreground">
          Mensagem <span className="font-normal text-muted-foreground/60">(opcional)</span>
        </p>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Se quiser, descreva rapidamente o que aconteceu…"
          className="min-h-[100px] bg-card/50 border-border/10 backdrop-blur-xl rounded-xl text-[13px] placeholder:text-muted-foreground/40 resize-none"
        />
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleSend}
        disabled={clicked}
        className={cn(
          "w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-[14px] transition-all duration-200",
          "bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20",
          "hover:brightness-110 active:brightness-95",
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
