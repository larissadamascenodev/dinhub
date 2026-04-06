
-- Remove duplicate triggers (keep only the trg_ prefixed ones)
DROP TRIGGER IF EXISTS trigger_generate_installments ON public.transactions;
DROP TRIGGER IF EXISTS trigger_handle_credit_card_invoice ON public.transactions;
DROP TRIGGER IF EXISTS trigger_handle_credit_card_invoice_delete ON public.transactions;
DROP TRIGGER IF EXISTS trigger_sync_has_transactions ON public.transactions;
DROP TRIGGER IF EXISTS trigger_update_account_balance ON public.transactions;
DROP TRIGGER IF EXISTS trigger_update_credit_card_limit ON public.transactions;

-- Recalculate all account balances from scratch
UPDATE public.accounts a
SET current_balance = a.initial_balance + COALESCE((
  SELECT SUM(
    CASE
      WHEN t.type = 'receita' AND t.account_id = a.id THEN t.amount
      WHEN t.type = 'despesa' AND t.account_id = a.id THEN -t.amount
      WHEN t.type IN ('transferencia', 'investimento') AND t.account_id = a.id THEN -t.amount
      WHEN t.type IN ('transferencia', 'investimento') AND t.to_account_id = a.id THEN t.amount
      ELSE 0
    END
  )
  FROM public.transactions t
  WHERE (t.account_id = a.id OR t.to_account_id = a.id)
    AND t.status = 'pago'
    AND t.payment_method != 'cartao'
), 0);
