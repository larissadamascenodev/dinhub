import { motion } from "framer-motion";
import { Shield, Lock, Brain, FileText, AlertTriangle, CreditCard, RefreshCw, XCircle, RotateCcw, Phone, Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    id: "privacidade",
    icon: Shield,
    title: "Privacidade",
    content: (
      <>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Sua privacidade é prioridade aqui no DinHub. Nós coletamos apenas as informações necessárias para que o aplicativo funcione corretamente:
        </p>
        <ul className="space-y-2 mb-4">
          {["Dados de transações (receitas e despesas)", "Informações de contas e cartões cadastrados", "Dados básicos de uso do app"].map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {t}
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">Esses dados são utilizados para:</p>
        <ul className="space-y-2">
          {["Organizar sua vida financeira", "Gerar análises e insights inteligentes", "Melhorar sua experiência dentro do aplicativo"].map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "seguranca",
    icon: Lock,
    title: "Segurança",
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Seus dados são protegidos e <span className="text-foreground font-semibold">não são vendidos para terceiros</span>. Utilizamos boas práticas de segurança para garantir que suas informações estejam protegidas.
      </p>
    ),
  },
  {
    id: "ia",
    icon: Brain,
    title: "Uso de Inteligência Artificial",
    content: (
      <>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">O DinHub utiliza inteligência artificial para:</p>
        <ul className="space-y-2">
          {["Analisar seus padrões de gasto", "Gerar recomendações e insights", "Sugerir melhorias no seu controle financeiro"].map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {t}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground/60 mt-3 italic">
          Essas análises são automáticas e têm como objetivo apenas melhorar sua experiência.
        </p>
      </>
    ),
  },
  {
    id: "termos",
    icon: FileText,
    title: "Termos de Uso",
    content: (
      <>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">Ao utilizar o DinHub, você concorda que:</p>
        <ul className="space-y-2">
          {[
            "É responsável pelas informações que insere no aplicativo",
            "O app não substitui aconselhamento financeiro profissional",
            "As análises e sugestões são apenas informativas",
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "importante",
    icon: AlertTriangle,
    title: "Importante",
    highlight: true,
    content: (
      <>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">O DinHub <span className="text-foreground font-semibold">não realiza</span>:</p>
        <ul className="space-y-2">
          {["Movimentação de dinheiro", "Acesso direto a contas bancárias", "Execução de pagamentos"].map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500/80 shrink-0" />
              {t}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground/60 mt-3 italic">
          O aplicativo funciona apenas como ferramenta de organização e análise.
        </p>
      </>
    ),
  },
  {
    id: "assinatura",
    icon: CreditCard,
    title: "Assinatura e Pagamentos",
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        O DinHub pode oferecer planos pagos com funcionalidades adicionais. A cobrança é feita de forma recorrente (mensal ou anual) e o acesso às funcionalidades premium depende de uma assinatura ativa.
      </p>
    ),
  },
  {
    id: "renovacao",
    icon: RefreshCw,
    title: "Renovação",
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        A assinatura será renovada automaticamente, salvo cancelamento prévio pelo usuário.
      </p>
    ),
  },
  {
    id: "cancelamento",
    icon: XCircle,
    title: "Cancelamento",
    content: (
      <>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">Você pode cancelar a qualquer momento. Após o cancelamento:</p>
        <ul className="space-y-2">
          {["O plano permanece ativo até o fim do período pago", "Não há cobrança futura"].map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {t}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "reembolsos",
    icon: RotateCcw,
    title: "Reembolsos",
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Reembolsos podem seguir as políticas da plataforma utilizada (App Store ou Google Play).
      </p>
    ),
  },
  {
    id: "suporte",
    icon: Phone,
    title: "Suporte",
    content: (
      <p className="text-sm text-muted-foreground leading-relaxed">
        Se precisar de ajuda, você pode entrar em contato com nosso suporte diretamente pelo aplicativo.
      </p>
    ),
  },
  {
    id: "compromisso",
    icon: Heart,
    title: "Nosso Compromisso",
    content: (
      <div className="text-center py-2">
        <p className="text-sm text-muted-foreground leading-relaxed mb-1">Nosso objetivo é simples:</p>
        <p className="text-base font-bold text-foreground leading-relaxed">
          Te ajudar a entender melhor seu dinheiro
        </p>
        <p className="text-base font-bold text-primary leading-relaxed">
          e tomar decisões mais inteligentes
        </p>
      </div>
    ),
  },
];

const TermosPrivacidade = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-1 pb-8 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center hover:bg-muted/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Termos e Privacidade</h1>
          <p className="text-[11px] text-muted-foreground">DinHub — Controle total do seu dinheiro</p>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section, index) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className={`rounded-xl border backdrop-blur-sm p-4 ${
            section.highlight
              ? "border-amber-500/30 bg-amber-500/[0.04]"
              : "border-border/20 bg-card/60"
          }`}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              section.highlight ? "bg-amber-500/15" : "bg-primary/10"
            }`}>
              <section.icon className={`w-4 h-4 ${section.highlight ? "text-amber-400" : "text-primary"}`} />
            </div>
            <h2 className="text-sm font-bold text-foreground">{section.title}</h2>
          </div>
          {section.content}
        </motion.div>
      ))}

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center pt-4 pb-2"
      >
        <p className="text-xs text-muted-foreground/50">
          Última atualização: Abril 2026
        </p>
      </motion.div>
    </div>
  );
};

export default TermosPrivacidade;
