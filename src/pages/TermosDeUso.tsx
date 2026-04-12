import { motion } from "framer-motion";
import {
  FileText, ShieldCheck, CreditCard, RotateCcw, XCircle, AlertTriangle,
  ArrowLeft, Lock, CheckCircle2, Brain, Smartphone, Scale, RefreshCw,
  Mail, Sparkles, Heart, Copyright,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── types ─── */
interface Section {
  icon: React.ElementType;
  title: string;
  content: string[];
}

/* ─── content ─── */
const sections: Section[] = [
  {
    icon: CheckCircle2,
    title: "Aceitação dos Termos",
    content: [
      "Ao utilizar o DinHub, você concorda com estes Termos de Uso.",
      "Nosso objetivo é garantir uma **experiência segura e transparente** para você.",
    ],
  },
  {
    icon: Smartphone,
    title: "Sobre o DinHub",
    content: [
      "O DinHub é uma **ferramenta de organização financeira pessoal**.",
      "Permite registrar receitas, despesas, metas e investimentos, tudo em um só lugar.",
      "O app **não realiza movimentações bancárias** nem substitui consultoria financeira profissional.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Cadastro e Responsabilidade",
    content: [
      "Você é responsável por manter suas **credenciais de acesso** seguras.",
      "As informações inseridas no app são de sua **inteira responsabilidade**.",
      "Dados falsos ou uso indevido podem resultar em suspensão da conta.",
    ],
  },
  {
    icon: CreditCard,
    title: "Planos e Acesso",
    content: [
      "O DinHub oferece um **período de teste gratuito** por tempo limitado, permitindo que você explore as funcionalidades da plataforma antes de contratar um plano.",
      "Após o término do período de teste, o acesso completo às funcionalidades depende de uma **assinatura ativa**.",
    ],
  },
  {
    icon: RefreshCw,
    title: "Cobrança e Renovação",
    content: [
      "Após o período gratuito, a assinatura será iniciada automaticamente, conforme as condições informadas no momento da contratação, caso não haja cancelamento prévio.",
      "A cobrança é **recorrente**, conforme o plano escolhido no momento da contratação.",
      "Ao contratar um plano, você concorda com as condições de cobrança, valores e **renovação automática**.",
    ],
  },
  {
    icon: XCircle,
    title: "Cancelamento",
    content: [
      "Você pode cancelar sua assinatura a qualquer momento diretamente pela plataforma.",
      "Após o cancelamento, o acesso permanecerá ativo até o **final do período já pago**.",
      "O não uso do serviço não implica cancelamento automático da assinatura.",
    ],
  },
  {
    icon: RotateCcw,
    title: "Reembolso",
    content: [
      "Você pode solicitar reembolso integral no prazo de até **7 dias corridos** após a contratação, conforme previsto no Código de Defesa do Consumidor.",
      "Após esse prazo, não haverá reembolso de valores já pagos.",
    ],
  },
  {
    icon: Scale,
    title: "Uso Aceitável",
    content: [
      "Use o DinHub apenas para fins pessoais e legítimos.",
      "É proibido tentar **acessar dados de outros usuários**, fazer engenharia reversa ou usar o app para atividades ilícitas.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Limitação de Responsabilidade",
    content: [
      "O DinHub oferece **ferramentas de organização**, não garantias de resultados financeiros.",
      "Decisões financeiras tomadas com base nas análises do app são de **sua responsabilidade**.",
    ],
  },
  {
    icon: Copyright,
    title: "Propriedade Intelectual",
    content: [
      "Todo o conteúdo, design, código e marca do DinHub são de **propriedade exclusiva** da equipe DinHub.",
      "É proibida a reprodução sem autorização prévia.",
    ],
  },
  {
    icon: RefreshCw,
    title: "Alterações nos Termos",
    content: [
      "Podemos atualizar estes termos periodicamente.",
      "Alterações relevantes serão comunicadas dentro do app ou por e-mail.",
    ],
  },
  {
    icon: Mail,
    title: "Contato",
    content: [
      "Dúvidas? Fale conosco pelo **suporte dentro do app**.",
      "Estamos sempre prontos para ajudar.",
    ],
  },
];

/* ─── helpers ─── */
const renderBold = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <span key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
};

/* ─── section card ─── */
const SectionBlock = ({ section, index }: { section: Section; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.08 + index * 0.03, ease: "easeOut" }}
    className="space-y-2"
  >
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <section.icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <span className="text-[13px] font-bold text-foreground">{section.title}</span>
    </div>

    <div className="space-y-1.5">
      {section.content.map((line, i) => (
        <p key={i} className="text-[13px] text-muted-foreground leading-relaxed">
          {renderBold(line)}
        </p>
      ))}
    </div>
  </motion.div>
);

/* ─── page ─── */
const TermosDeUso = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-1 pb-12 space-y-5 w-full max-w-6xl mx-auto px-4 md:px-8">
      {/* Back */}
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
        style={{
          background:
            "linear-gradient(145deg, hsl(var(--card) / 0.9) 0%, hsl(var(--background)) 100%)",
        }}
      >
        <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative space-y-4">
          {/* Icon cluster */}
          <div className="flex items-center gap-1.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="flex -space-x-1">
              {[ShieldCheck, Lock, Brain].map((Icon, i) => (
                <div
                  key={i}
                  className="w-5.5 h-5.5 rounded-full bg-primary/[0.08] border border-primary/15 flex items-center justify-center"
                >
                  <Icon className="w-3 h-3 text-primary/70" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">
              Termos de Uso
            </h1>
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xs">
              Como funciona o uso do DinHub
            </p>
          </div>

          <div className="rounded-xl bg-primary/[0.06] border border-primary/10 p-3.5 space-y-1">
            <p className="text-[13px] font-semibold text-foreground">
              Transparência acima de tudo.
            </p>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Esses termos explicam como você pode usar o DinHub com segurança.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Sections */}
      <div className="space-y-5 px-1">
        {sections.map((section, i) => (
          <div key={i}>
            <SectionBlock section={section} index={i} />
            {i < sections.length - 1 && (
              <div className="mt-5 border-t border-border/10" />
            )}
          </div>
        ))}
      </div>

      {/* Trust badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-primary/15 p-5"
        style={{
          background:
            "linear-gradient(160deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--card) / 0.8) 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Seus dados e sua experiência</span> são
            prioridade no DinHub.
          </p>
        </div>
      </motion.div>

      {/* Commitment */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55 }}
        className="relative overflow-hidden rounded-2xl border border-primary/15 p-6 text-center"
        style={{
          background:
            "linear-gradient(160deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--card) / 0.8) 100%)",
        }}
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
            <span className="text-[11px] text-muted-foreground/60">
              Feito com carinho pela equipe DinHub
            </span>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-[11px] text-muted-foreground/40 pt-2"
      >
        Última atualização: Abril 2026
      </motion.p>
    </div>
  );
};

export default TermosDeUso;
