

## Plan: Remover confirmação de email no cadastro

A tela de consentimento OAuth (screenshot) é do Google e não pode ser removida. Porém, o que podemos fazer é **ativar o auto-confirm de email** no backend, para que ao criar conta com email/senha o usuário entre direto no app sem precisar confirmar por email.

### O que será feito

1. **Ativar auto-confirm de email** no backend usando a ferramenta de configuração de autenticação (`configure_auth` com `double_confirm_email_changes: false` e auto-confirm habilitado)

2. **Atualizar a mensagem de sucesso** no cadastro — trocar "Conta criada! Verifique seu email para confirmar." por "Conta criada com sucesso!" já que o usuário será logado automaticamente

### Observação

A tela de permissão do Google (da screenshot) é parte do fluxo OAuth do Google e não pode ser removida — ela aparece sempre que o usuário escolhe login com Google. O auto-confirm afeta apenas o cadastro por email/senha.

### Detalhes técnicos

- Arquivo editado: `src/pages/Auth.tsx` (linha 116 — mensagem de toast)
- Configuração de backend: habilitar auto-confirm para signups de email

