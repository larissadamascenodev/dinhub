import { motion } from "framer-motion";
import {
  Shield, Lock, Brain, BarChart3, Users, Cookie, Megaphone,
  ShieldCheck, UserCheck, Clock, RefreshCw, Mail, ArrowLeft,
  Fingerprint, Sparkles, Heart, Eye, Settings2, Database,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── types ─── */
interface Section {
  icon: React.ElementType;
  title: string;
  content: string[];
  warning?: string;
}

/* ─── content ─── */
const sections: Section[] = [
  {
    icon: Database,
    title: "Quais dados coletamos",
    content: [
      "**Dados de cadastro:** nome, e-mail e senha.",
      "**Dados financeiros:** receitas, despesas, metas e contas que **você mesmo insere**.",
      "**Dados de uso:** como navegação, frequência de acesso e funcionalidades utilizadas.",
    ],
    warning: "O DinHub não acessa contas bancárias nem dados externos automaticamente.",
  },
  {
    icon: BarChart3,
    title: "Como usamos seus dados",
    content: [
      "**Funcionamento do app:** para exibir seus registros e gerar relatórios.",
      "**Personalização:** adaptar a experiência ao seu perfil financeiro.",
      "**Insights e análises:** gerar gráficos, projeções e alertas inteligentes.",
      "**Comunicação:** enviar notificações relevantes e avisos importantes.",
    ],
  },
  {
    icon: Brain,
    title: "Uso de Inteligência Artificial",
    content: [
      "Utilizamos IA para analisar **padrões de gastos** e gerar insights personalizados.",
      "Todas as análises são **automáticas e informativas**. Nunca tomamos decisões por você.",
      "Seus dados alimentam apenas a **sua própria experiência**, não modelos compartilhados.",
    ],
  },
  {
    icon: Users,
    title: "Compartilhamento de dados",
    content: [
      "**Pagamentos:** processadores de pagamento para assinaturas.",
      "**Infraestrutura:** servidores seguros para armazenamento e funcionamento.",
      "**Comunicação:** serviços de e-mail para notificações essenciais.",
    ],
    warning: "Nunca vendemos seus dados. Ponto final.",
  },
  {
    icon: Cookie,
    title: "Cookies e tecnologias",
    content: [
      "Usamos cookies e tecnologias semelhantes para **melhorar sua experiência**.",
      "Ferramentas de analytics nos ajudam a entender como o app é utilizado.",
      "Você pode gerenciar cookies nas **configurações do seu navegador**.",
    ],
  },
  {
    icon: Megaphone,
    title: "Marketing e comunicação",
    content: [
      "Podemos enviar comunicações sobre **novidades e melhorias** do DinHub.",
      "Toda comunicação é baseada em dados de uso para ser **relevante** a você.",
      "Você pode **desativar notificações** a qualquer momento nas configurações.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Segurança",
    content: [
      "**Criptografia:** seus dados são protegidos em trânsito e em repouso.",
      "**Controle de acesso:** apenas sistemas autorizados acessam informações.",
      "**Monitoramento:** detectamos e respondemos a atividades suspeitas.",
    ],
  },
  {
    icon: UserCheck,
    title: "Seus direitos (LGPD)",
    content: [
      "**Acessar:** consultar quais dados armazenamos sobre você.",
      "**Corrigir:** atualizar informações incorretas ou incompletas.",
      "**Excluir:** solicitar a remoção dos seus dados pessoais.",
      "**Revogar consentimento:** retirar permissões a qualquer momento.",
    ],
  },
  {
    icon: Clock,
    title: "Retenção de dados",
    content: [
      "Seus dados são mantidos **enquanto sua conta estiver ativa**.",
      "Após cancelamento, os dados são retidos por até **90 dias** para eventual recuperação e depois **removidos permanentemente**.",
    ],
  },
  {
    icon: RefreshCw,
    title: "Alterações nesta política",
    content: [
      "Podemos atualizar esta política periodicamente.",
      "Alterações relevantes serão comunicadas **dentro do app** ou por e-mail.",
    ],
  },
  {
    icon: Mail,
    title: "Contato",
    content: [
      "Dúvidas sobre privacidade? Fale conosco pelo **suporte dentro do app**.",
      "Estamos sempre prontos para esclarecer qualquer questão.",
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

/* ─── section block ─── */
const SectionBlock = ({ section, index }: { section: Section; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.08 + index * 0.03, ease: "easeOut" }}
    className="space-y-2.5"
  >
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <section.icon className="w-[15px] h-[15px] text-primary" />
      </div>
      <span className="text-[13px] font-bold text-foreground">{section.title}</span>
    </div>

    <div className="space-y-1.5 pl-[38px]">
      {section.content.map((line, i) => (
        <p key={i} className="text-[13px] text-muted-foreground leading-relaxed">
          {renderBold(line)}
        </p>
      ))}
    </div>

    {section.warning && (
      <div className="ml-[38px] mt-2 rounded-lg bg-warning/[0.06] border border-warning/15 px-3 py-2">
        <p className="text-[12px] text-warning font-medium leading-relaxed">
          ⚠️ {section.warning}
        </p>
      </div>
    )}
  </motion.div>
);

/* ─── page ─── */
const PoliticaPrivacidade = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-1 pb-12 space-y-5">
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
          background: "linear-gradient(145deg, hsl(var(--card) / 0.9) 0%, hsl(var(--background)) 100%)",
        }}
      >
        <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Fingerprint className="w-6 h-6 text-primary" />
            </div>
            <div className="flex -space-x-1.5">
              {[Shield, Lock, Eye].map((Icon, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-primary/[0.08] border border-primary/15 flex items-center justify-center"
                >
                  <Icon className="w-3.5 h-3.5 text-primary/70" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">
              Política de Privacidade
            </h1>
            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xs">
              Como cuidamos dos seus dados
            </p>
          </div>

          <div className="rounded-xl bg-primary/[0.06] border border-primary/10 p-3.5 space-y-1">
            <p className="text-[13px] font-semibold text-foreground">
              Seus dados são seus. E a gente leva isso a sério.
            </p>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Tudo o que você registra no DinHub é protegido e usado apenas para melhorar sua experiência.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick summary */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-border/10 bg-card/60 backdrop-blur-xl p-5 space-y-3"
      >
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          Resumo rápido
        </p>
        {[
          { icon: Lock, text: "Não vendemos seus dados" },
          { icon: BarChart3, text: "Usamos dados apenas para melhorar o app" },
          { icon: Settings2, text: "Você pode controlar suas informações" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <item.icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-[13px] font-medium text-foreground">{item.text}</p>
          </div>
        ))}
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

      {/* Transparency block */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-primary/15 p-5"
        style={{
          background: "linear-gradient(160deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--card) / 0.8) 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-foreground">Transparência total</p>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Você sempre terá controle sobre seus dados dentro do DinHub.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Commitment */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55 }}
        className="relative overflow-hidden rounded-2xl border border-primary/15 p-6 text-center"
        style={{
          background: "linear-gradient(160deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--card) / 0.8) 100%)",
        }}
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

export default PoliticaPrivacidade;
