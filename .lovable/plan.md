## Problema

Ao escanear comprovantes, a edge function `process-invoice` retorna erro 500:

```
TypeError: userClient.auth.getClaims is not a function
```

O método `auth.getClaims` não existe na versão do SDK Supabase usada na função. A autenticação do usuário falha antes mesmo da imagem ser processada, e o frontend mostra "Edge Function returned a non-2xx status code".

## Causa raiz

Em `supabase/functions/process-invoice/index.ts` (linha 174) usamos:

```ts
const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(...)
```

Esse método não está disponível. O padrão correto (e usado nas outras edge functions do projeto) é `auth.getUser()`.

## Correção

Substituir o bloco de validação de auth (linhas 169–180) por:

```ts
const userClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!,
  { global: { headers: { Authorization: authHeader } } }
);
const { data: userData, error: userError } = await userClient.auth.getUser();
if (userError || !userData?.user) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

Se mais abaixo no arquivo o código referenciar `claimsData.claims.sub`, ajustar para `userData.user.id`.

## Validação

1. Edge function é re-deployada automaticamente.
2. Verificar logs de `process-invoice` após novo upload — não deve aparecer mais o `TypeError`.
3. Testar fluxo: subir foto de comprovante → modal de revisão deve abrir com dados extraídos.

## Escopo

Apenas a edge function `process-invoice`. Nenhuma alteração de UI ou de outras funções.
