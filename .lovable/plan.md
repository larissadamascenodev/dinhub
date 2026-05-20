As mudanças solicitadas na landing page foram implementadas com foco em interatividade e design responsivo.

### 1. Seção Huby Reformulada
- **Esfera 3D de Partículas**: Desenvolvida em Canvas para performance, com rotação suave e conexões dinâmicas entre as partículas verdes (#00e676). A esfera pulsa ao interagir com as perguntas.
- **Carrossel de Perguntas**: 4 perguntas clicáveis em formato de pill, com scroll horizontal no mobile.
- **Respostas Interativas**: Ao clicar em uma pergunta, um card detalhado surge abaixo da esfera com animações de fade e slide, apresentando dados financeiros (saldo, parcelas, projeção e análise de gastos) e insights personalizados da Huby.

### 2. Funcionalidades do App
- **Carrossel de Mockup**: Um iPhone realista centralizado que alterna entre 6 telas do aplicativo (Dashboard, Categorias, Transações, Parcelamentos, Fatura e Metas).
- **Abas Navegáveis**: Sistema de abas horizontais com scroll lateral no mobile para alternar as visualizações do mockup.
- **Telas Dinâmicas**: Cada tela do app foi recriada fielmente em HTML/CSS para garantir nitidez e transições suaves.

### 3. Ferramentas IA com Análise
- **Painel de Análise Lateral**: Os cards de Radar, Projeção e Saúde agora possuem um painel dinâmico ao lado (no desktop) ou abaixo (no mobile).
- **Conteúdo Dinâmico**: 
  - **Radar**: Exibe alertas de gastos e insights de economia.
  - **Projeção**: Gráfico animado com diferentes cenários financeiros.
  - **Saúde**: Medidor de score (82/100) com detalhamento dos fatores que influenciam a saúde financeira.

### Detalhes Técnicos
- **Fundo**: #0a0a0a para todas as novas seções.
- **Tipografia**: Mantido o uso de Sora e Inter.
- **Responsividade**: Layouts otimizados para telas de 390px até desktops grandes, garantindo que nenhum conteúdo seja cortado.
- **Animações**: Uso de Framer Motion para transições suaves de 0.3s.

As seções foram integradas na `src/pages/Auth.tsx` respeitando o posicionamento original e a identidade visual da marca.