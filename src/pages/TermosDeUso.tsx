import { motion } from "framer-motion";
import {
  FileText, AlertTriangle, CreditCard, RefreshCw, XCircle, RotateCcw,
  ArrowLeft, Scale, Sparkles, Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  icon: React.ElementType;
  title: string;
  highlight?: boolean;
  bullets?: string[];
  paragraphs?: string[];
  note?: string;
}

const sections: Section[] = [
  {
    id: "termos",
    icon: FileText,
    title: "Termos de Uso",
    paragraphs: ["Ao utilizar o DinHub, você concorda que:"],
    bullets: [
      "É responsável pelas informações inseridas",
      "O app não substitui aconselhamento financeiro profissional",
      "Análises e sugestões são apenas informativas",
    ],
  },
  {
    id: "importante",
    icon: AlertTriangle,
    title: "Aviso Importante",
    highlight: true,
    paragraphs: ["O DinHub não realiza:"],
    bullets: [
      "Movimentação de dinheiro",
      "Acesso direto a contas bancárias",
      "Execução de pagamentos",
    ],
    note: "O aplicativo funciona apenas como ferramenta de organização e análise.",
  },
  {
    id: "assinatura",
    icon: CreditCard,
    title: "Assinatura e Pagamentos",
    paragraphs: [
      "O DinHub pode oferecer planos pagos com funcionalidades adicionais. A cobrança é recorrente (mensal ou anual) e o acesso premium depende de uma assinatura ativa.",
    ],
  },
  {
    id: "renovacao",
    icon: RefreshCw,
    title: "Renovação Automática",
    paragraphs: [
      "A assinatura é renovada automaticamente, salvo cancelamento prévio pelo usuário.",
    ],
  },
  {
    id: "cancelamento",
    icon: XCircle,
    title: "Cancelamento",
    paragraphs: ["Você pode cancelar a qualquer momento. Após o cancelamento:"],
    bullets: [
      "O plano permanece ativo até o fim do período pago",
      "Não há cobrança futura",
    ],
  },
  {
    id: "reembolsos",
    icon: RotateCcw,
    title: "Reembolsos",
    paragraphs: [
      "Reembolsos seguem as políticas da plataforma utilizada (App Store ou Google Play).",
    ],
  },
];

const InlineSection = ({ section, index }: { section: Section; index: number }) => {
  const isWarning = !!section.highlight;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 + index * 0.035, ease: "easeOut" }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2.5">
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", isWarning ? "bg-warning/10" : "bg-primary/10")}>
          <section.icon className={cn("w-[15px] h-[15px]", isWarning ? "text-warning" : "text-primary")} />
        </div>
        <span className={cn("text-[13px] font-bold", isWarning ? "text-warning" : "text-foreground")}>{section.title}</span>
      </div>
      {section.paragraphs?.map((p, i) => (
        <p key={i} className="text-[13px] text-muted-foreground leading-relaxed">{p}</p>
      ))}
      {section.bullets && (
        <ul className="space-y-1.5 pl-1">
          {section.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px] text-muted-foreground leading-relaxed">
              <span className={cn("mt-[7px] w-1 h-1 rounded-full shrink-0", isWarning ? "bg-warning/70" : "bg-primary/60")} />
              {b}
            </li>
          ))}
        </ul>
      )}
      {section.note && <p className="text-[11px] text-muted-foreground/50 italic">{section.note}</p>}
    </motion.div>
  );
};

const TermosDeUso = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-1 pb-12 space-y-5">
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="w-8 h-8 rounded-xl bg-card/60 backdrop-blur-xl border border-border/10 flex items-center justify-center hover:bg-card transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
      </motion.button>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-border/10 backdrop-blur-2xl p-6"
        style={{ background: "linear-gradient(145deg, hsl(var(--card) / 0.9) 0%, hsl(var(--background)) 100%)" }}
      >
        <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
        <div className="relative space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Scale className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">Termos de Uso</h1>
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xs">
              Conheça as condições de uso do DinHub e como funciona a sua assinatura.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Sections */}
      <div className="space-y-5 px-1">
        {sections.map((section, i) => (
          <div key={section.id}>
            <InlineSection section={section} index={i} />
            {i < sections.length - 1 && <div className="mt-5 border-t border-border/10" />}
          </div>
        ))}
      </div>

      {/* Commitment */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-primary/15 p-6 text-center"
        style={{ background: "linear-gradient(160deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--card) / 0.8) 100%)" }}
      >
        <div className="relative space-y-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-[13px] text-muted-foreground">Nosso compromisso</p>
            <p className="text-base font-bold text-foreground">Transparência e respeito</p>
            <p className="text-base font-bold text-primary">em cada interação</p>
          </div>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <Heart className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-[11px] text-muted-foreground/60">Feito com carinho pela equipe DinHub</span>
          </div>
        </div>
      </motion.div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center text-[11px] text-muted-foreground/40 pt-2">
        Última atualização: Abril 2026
      </motion.p>
    </div>
  );
};

export default TermosDeUso;
