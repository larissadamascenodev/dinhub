# Ícone do app (iOS) — especificação

> Não gerado ainda. Este arquivo documenta o padrão a seguir quando formos
> exportar o ícone final, perto da publicação na App Store.

## Especificação

- **Fundo**: verde-willo `#C8F36D` (sólido, sem gradiente)
- **Símbolo**: "W" preto `#0B0B0B`, centralizado
- **Cantos**: **retos** no arquivo-fonte — não arredondar manualmente. O iOS
  aplica a máscara de "squircle" automaticamente a partir de um PNG quadrado.
  Um ícone com cantos já arredondados no arquivo fica com borda dupla/serrilhada
  quando o sistema aplica a própria máscara por cima.

## Referência

A referência visual veio das imagens de marca anexadas na conversa (monograma
"W" preto sobre fundo verde-willo, cantos arredondados só na composição de
apresentação — não no arquivo-fonte real).

Existe também uma variante inversa nas mesmas referências (fundo preto,
"W" verde-willo) — mantê-la disponível como ícone alternativo/dark, já que o
iOS (17+) suporta variantes de ícone "escuras" e "tintadas" (`Dark Icon` /
`Tinted Icon`) registradas junto com o ícone padrão no `Assets.xcassets`.

## Quando gerar o ícone final

Vamos precisar exportar o PNG-fonte em 1024×1024 (sem cantos arredondados, sem
alpha) e gerar o conjunto de tamanhos via Xcode (`Assets.xcassets` já aceita
um único 1024×1024 desde iOS 14+ e gera os demais tamanhos automaticamente) ou
via uma ferramenta como o `App Icon Generator`. Isso entra no fluxo do
[README.md](../README.md#plataforma-ios), quando o projeto `ios/` for aberto
no Xcode.
