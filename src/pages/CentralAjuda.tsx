import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, BarChart3, Sparkles, Target, Swords, Radar, HeartPulse, ScanLine, CreditCard, Wallet, Tags, CalendarClock, Bot, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

/* ── helpers ── */
const normalize = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/* ── feature data ── */
interface Feature {
  icon: React.ReactNode;
  label: string;
  color: string;
  soon?: boolean;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Wallet className="w-5 h-5" />,
    label: "Carteira",
    color: "hsl(var(--primary))",
    description:
      "Gerencie todas as suas contas bancárias, carteiras digitais e investimentos em um só lugar. Visualize o saldo consolidado, acompanhe a evolução do patrimônio e faça transferências entre contas de forma rápida.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    label: "Balanço Mensal",
    color: "hsl(215 80% 60%)",
    description:
      "Veja uma visão completa de receitas vs despesas mês a mês. O balanço mostra exatamente quanto você ganhou, quanto gastou e qual foi o saldo líquido do período, ajudando a entender seus hábitos financeiros.",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    label: "Projeções Inteligentes",
    color: "hsl(270 70% 65%)",
    description:
      "Simule cenários futuros para suas finanças. As projeções analisam seus padrões de receita e despesa e estimam como será seu saldo nos próximos meses, considerando contas recorrentes, parcelamentos e metas.",
  },
  {
    icon: <Target className="w-5 h-5" />,
    label: "Metas Financeiras",
    color: "hsl(40 80% 55%)",
    description:
      "Crie metas de economia com valores e prazos definidos. Faça depósitos e saques a qualquer momento, acompanhe o progresso com barras visuais e receba lembretes para manter a consistência nos aportes.",
  },
  {
    icon: <Swords className="w-5 h-5" />,
    label: "Desafios",
    color: "hsl(25 85% 55%)",
    description:
      "Gamifique sua vida financeira! Aceite desafios como '7 dias sem delivery' ou '30 dias economizando', faça check-in diário para registrar seu progresso e veja a economia potencial ao completar cada desafio.",
  },
  {
    icon: <ScanLine className="w-5 h-5" />,
    label: "Scanner de Comprovantes",
    color: "hsl(190 70% 50%)",
    description:
      "Registre transações automaticamente tirando foto ou enviando print de comprovantes de pagamento. O sistema lê os dados do comprovante e preenche valor, data e categoria para você — basta confirmar.",
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    label: "Faturas de Cartão",
    color: "hsl(350 70% 55%)",
    description:
      "Acompanhe em detalhes cada fatura dos seus cartões de crédito. Veja os itens que compõem a fatura, parcelas em andamento, histórico de meses anteriores e registre o pagamento quando realizar.",
  },
  {
    icon: <Tags className="w-5 h-5" />,
    label: "Categorias e Limites",
    color: "hsl(160 60% 45%)",
    description:
      "Organize receitas e despesas por categorias personalizáveis. Defina limites de gasto por categoria e receba alertas quando estiver próximo de ultrapassar, mantendo o controle do orçamento.",
  },
  {
    icon: <CalendarClock className="w-5 h-5" />,
    label: "Parcelamentos",
    color: "hsl(200 70% 55%)",
    description:
      "Acompanhe todas as compras parceladas ativas. Veja quantas parcelas restam, o valor de cada uma, a data de vencimento e o impacto mensal dos parcelamentos no seu orçamento.",
  },
  {
    icon: <Bot className="w-5 h-5" />,
    label: "BotHub (IA)",
    color: "hsl(280 60% 60%)",
    soon: true,
    description:
      "Seu assistente financeiro inteligente. O BotHub irá analisar suas finanças, responder perguntas, sugerir economias e dar dicas personalizadas com base nos seus dados reais — tudo através de conversas naturais.",
  },
  {
    icon: <Radar className="w-5 h-5" />,
    label: "Radar Financeiro",
    color: "hsl(280 60% 60%)",
    soon: true,
    description:
      "Análise automática de padrões nos seus gastos. O Radar identifica tendências, gastos incomuns e oportunidades de economia que podem passar despercebidas no dia a dia.",
  },
  {
    icon: <HeartPulse className="w-5 h-5" />,
    label: "Saúde Financeira",
    color: "hsl(340 70% 55%)",
    soon: true,
    description:
      "Receba um diagnóstico completo da sua saúde financeira com um score de 0 a 100. O sistema avalia diversificação, reserva de emergência, nível de endividamento e consistência nos registros.",
  },
];

/* ── FAQ data ── */
interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    question: "Como adicionar uma nova transação?",
    answer:
      "Na tela inicial, toque no botão '+' na barra inferior. Escolha entre receita, despesa ou transferência, preencha os dados e confirme. Você também pode usar o Scanner para registrar via comprovante.",
  },
  {
    question: "Como criar uma meta financeira?",
    answer:
      "Acesse 'Metas' no menu. Toque em 'Nova Meta', defina o nome, valor alvo, prazo e contribuição mensal desejada. Depois, faça depósitos sempre que quiser para ir acumulando.",
  },
  {
    question: "Posso ter mais de uma conta bancária?",
    answer:
      "Sim! Vá em 'Carteira' e adicione quantas contas quiser — corrente, poupança, carteiras digitais e investimentos. O saldo consolidado aparece na tela inicial.",
  },
  {
    question: "Como funciona o Scanner de comprovantes?",
    answer:
      "Ao criar uma transação, escolha a opção 'Scanner'. Tire uma foto do comprovante ou envie um print da galeria. O sistema extrai automaticamente valor, data e sugere a categoria.",
  },
  {
    question: "Como acompanhar a fatura do cartão de crédito?",
    answer:
      "Cadastre seus cartões em 'Carteira'. Cada compra no cartão é automaticamente vinculada à fatura do mês correto. Acesse a fatura para ver todos os itens, parcelas e registrar o pagamento.",
  },
  {
    question: "O que são transações recorrentes?",
    answer:
      "São receitas ou despesas que se repetem automaticamente — como salário, aluguel ou assinaturas. Ao criar uma transação, marque como 'Mensal', 'Semanal' etc. e ela será lançada em todos os meses futuros.",
  },
  {
    question: "Como definir limites por categoria?",
    answer:
      "Vá em 'Categorias' e selecione a categoria desejada. Defina um valor limite mensal. Você receberá alertas quando estiver próximo de ultrapassar.",
  },
  {
    question: "Como funcionam os desafios?",
    answer:
      "Acesse a seção 'Desafios', escolha um que se encaixe no seu objetivo e aceite. Faça check-in diário para registrar que está cumprindo. Ao completar, veja quanto economizou!",
  },
  {
    question: "Posso fazer transferência entre minhas contas?",
    answer:
      "Sim! Ao criar uma transação, escolha 'Transferência'. Selecione a conta de origem e a conta de destino. O saldo é ajustado automaticamente em ambas.",
  },
  {
    question: "Como alterar ou excluir uma transação?",
    answer:
      "Na lista de transações, toque na transação desejada para abrir os detalhes. Lá você pode editar os dados ou excluir a transação. Para recorrentes, você pode excluir apenas aquela ocorrência ou todas.",
  },
  {
    question: "O que é o Balanço Mensal?",
    answer:
      "É um resumo que compara suas receitas e despesas dentro de um mês específico. Ele mostra o saldo líquido e ajuda a identificar se você está gastando mais do que ganha.",
  },
  {
    question: "Como funcionam as Projeções Inteligentes?",
    answer:
      "As projeções usam seus dados históricos de receitas e despesas para simular cenários futuros. Você pode ver uma estimativa do seu saldo nos próximos meses e simular mudanças.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Sim! Seus dados são armazenados de forma segura na nuvem com criptografia. Apenas você tem acesso às suas informações financeiras através da sua conta autenticada.",
  },
  {
    question: "Como alterar minha senha?",
    answer:
      "Acesse 'Configurações' e vá na seção 'Segurança e Privacidade'. Toque em 'Alterar Senha', informe a nova senha e confirme.",
  },
  {
    question: "Como entrar em contato com o suporte?",
    answer:
      "Vá em 'Configurações' e toque em 'Falar com o Suporte'. Você será direcionado para nossa página de atendimento onde pode abrir um chamado.",
  },
];

/* ── component ── */
const CentralAjuda = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const query = normalize(search.trim());

  const filteredFeatures = useMemo(
    () =>
      query
        ? features.filter(
            (f) =>
              normalize(f.label).includes(query) ||
              normalize(f.description).includes(query)
          )
        : features,
    [query]
  );

  const filteredFaq = useMemo(
    () =>
      query
        ? faqItems.filter(
            (f) =>
              normalize(f.question).includes(query) ||
              normalize(f.answer).includes(query)
          )
        : faqItems,
    [query]
  );

  return (
    <div className="min-h-screen pb-28 px-4 pt-4 max-w-lg mx-auto">
      {/* header */}
      <div className="flex items-center gap-3 mb-1">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-card/60 backdrop-blur border border-border/40 flex items-center justify-center text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Central de Ajuda</h1>
          <p className="text-xs text-muted-foreground">Encontre respostas sobre o app</p>
        </div>
      </div>

      {/* search */}
      <div className="relative mt-4 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar funcionalidade ou dúvida..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card/60 backdrop-blur border-border/40"
        />
      </div>

      {/* features */}
      {filteredFeatures.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            Funcionalidades
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {filteredFeatures.map((f, i) => {
              const isOpen = expandedFeature === f.label;
              return (
                <motion.button
                  key={f.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setExpandedFeature(isOpen ? null : f.label)}
                  className={`relative text-left rounded-2xl p-4 border transition-all duration-200 ${
                    isOpen
                      ? "col-span-2 bg-card/80 backdrop-blur border-primary/30"
                      : "bg-card/60 backdrop-blur border-border/40"
                  }`}
                  style={{ opacity: f.soon ? 0.6 : 1 }}
                  layout
                >
                  <div className="flex items-center gap-2.5 mb-1">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${f.color}18`, color: f.color }}
                    >
                      {f.icon}
                    </div>
                    <span className="text-sm font-semibold text-foreground leading-tight">
                      {f.label}
                    </span>
                    {f.soon && (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 ml-auto">
                        Em breve
                      </Badge>
                    )}
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-muted-foreground leading-relaxed mt-3"
                      >
                        {f.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <ChevronDown
                    className={`absolute top-4 right-3 w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </motion.button>
              );
            })}
          </div>
        </section>
      )}

      {/* FAQ */}
      {filteredFaq.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            Perguntas Frequentes
          </h2>
          <div className="bg-card/60 backdrop-blur rounded-2xl border border-border/40 overflow-hidden">
            <Accordion type="single" collapsible>
              {filteredFaq.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-border/30 last:border-b-0">
                  <AccordionTrigger className="px-4 py-3 text-sm text-foreground hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 text-xs text-muted-foreground leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* empty state */}
      {filteredFeatures.length === 0 && filteredFaq.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhum resultado para "{search}"</p>
        </div>
      )}
    </div>
  );
};

export default CentralAjuda;
