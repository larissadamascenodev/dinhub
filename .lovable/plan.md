

## Plano: Aplicar triggers e reconciliar saldo

### Diagnóstico confirmado
- O saldo R$ 1.592,01 está correto agora (850 inicial + 850 salário - 69,99 academia - 38 vivo)
- Os R$ 107,99 são despesas pagas legítimas, não valores fantasma
- **O problema central**: a migration que cria os triggers não foi aplicada — o banco não tem NENHUM trigger ativo
- Sem triggers, qualquer mudança de status/valor/exclusão futura corromperá o saldo novamente

### O que precisa ser feito

**1. Recriar a migration de triggers para que seja aplicada corretamente**
- A migration anterior (`20260413015927`) foi criada mas não executou. Preciso criar uma nova migration com os mesmos triggers, garantindo que ela seja processada pelo sistema de deploy.
- Triggers essenciais:
  - `transactions` → recalcular `accounts.current_balance` via `update_account_balance()`
  - `invoice_payments` → recalcular `accounts.current_balance` via `update_account_balance()`
  - `transactions` → sincronizar invoice items e credit card limits
  - timestamps `updated_at`

**2. Adicionar reconciliação automática na mesma migration**
- Após criar os triggers, rodar um recálculo de todos os `accounts.current_balance` e `credit_cards.used_limit` para garantir que os dados existentes estejam corretos.

**3. Verificar que o financeEngine.ts usa a fonte correta**
- Confirmar que o saldo disponível no dashboard usa `accounts.current_balance` como fonte de verdade para o mês atual, sem cálculos paralelos que possam divergir.

### Detalhes técnicos
- Uma única migration SQL com: DROP IF EXISTS + CREATE TRIGGER para todos os 14 triggers + UPDATE de reconciliação
- Nenhuma mudança no front-end necessária neste momento — o código já depende de `current_balance`, que passará a ser atualizado automaticamente

