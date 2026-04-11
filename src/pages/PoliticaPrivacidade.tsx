import { motion } from "framer-motion";
import {
  Shield, Lock, Brain, Phone, ArrowLeft, Fingerprint,
  Sparkles, Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  icon: React.ElementType;
  title: string;
  bullets?: string[];
  paragraphs?: string[];
  note?: string;
}

const HERO_PILLS = [
  { icon: Shield, label: "Privacidade" },
  { icon: Lock, label: "Segurança" },
  { icon: Brain, label: "IA Ética" },
];

const sections: Section[] = [
  {
    id: "privacidade",
    icon: Shield,
    title: "Privacidade",
    paragraphs: [
      "Sua privacidade é prioridade no DinHub. Coletamos apenas as informações estritamente necessárias para o funcionamento do aplicativo.",
    ],
    bullets: [
      "Dados de transações (receitas e despesas)",
      "Informações de contas e cartões cadastrados",
      "Dados básicos de uso do app",
      "Organizar sua vida financeira",
      "Gerar análises e insights inteligentes",
      "Melhorar sua experiência dentro do aplicativo",
    ],
  },
  {
    id: "seguranca",
    icon: Lock,
    title: "Segurança dos Dados",
    paragraphs: [
      "Seus dados são protegidos com criptografia e boas práticas de segurança. Eles nunca são vendidos para terceiros.",
    ],
  },
  {
    id: "ia",
    icon: Brain,
    title: "Inteligência Artificial",
    paragraphs: [
      "Utilizamos IA para potencializar sua experiência financeira de forma transparente e automática.",
    ],
    bullets: [
      "Análise de padrões de gasto",
      "Recomendações e insights personalizados",
      "Sugestões de melhorias no controle financeiro",
    ],
    note: "As análises são automáticas e visam apenas melhorar sua experiência.",
  },
  {
    id: "suporte",
    icon: Phone,
    title: "Suporte",
    paragraphs: [
      "Precisa de ajuda? Entre em contato com nosso suporte diretamente pelo aplicativo.",
    ],
  },
];

const InlineSection = ({ section, index }: { section: Section; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.06 + index * 0.035, ease: "easeOut" }}
    className="space-y-2"
  >
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
        <section.icon className="w-[15px] h-[15px] text-primary" />
      </div>
      <span className="text-[13px] font-bold text-foreground">{section.title}</span>
    </div>
    {section.paragraphs?.map((p, i) => (
      <p key={i} className="text-[13px] text-muted-foreground leading-relaxed">{p}</p>
    ))}
    {section.bullets && (
      <ul className="space-y-1.5 pl-1">
        {section.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[13px] text-muted-foreground leading-relaxed">
            <span className="mt-[7px] w-1 h-1 rounded-full shrink-0 bg-primary/60" />
            {b}
          </li>
        ))}
      </ul>
    )}
    {section.note && <p className="text-[11px] text-muted-foreground/50 italic">{section.note}</p>}
  </motion.div>
);

const PoliticaPrivacidade = () => {
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
        <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="relative space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Fingerprint className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">Política de Privacidade</h1>
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xs">
              Transparência total sobre como o DinHub cuida dos seus dados.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {HERO_PILLS.map((pill) => (
              <span key={pill.label} className="flex items-center gap-1.5 text-[11px] font-semibold text-primary/80 bg-primary/[0.08] border border-primary/15 rounded-full px-3 py-1">
                <pill.icon className="w-3 h-3" />
                {pill.label}
              </span>
            ))}
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
            <p className="text-base font-bold text-foreground">Seus dados protegidos</p>
            <p className="text-base font-bold text-primary">com total transparência</p>
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

export default PoliticaPrivacidade;
