
-- Drop duplicate triggers (keep the trigger_* variants)
DROP TRIGGER IF EXISTS trg_generate_installments ON public.transactions;
DROP TRIGGER IF EXISTS trg_handle_credit_card_invoice ON public.transactions;
DROP TRIGGER IF EXISTS trg_sync_profile_has_transactions ON public.transactions;
DROP TRIGGER IF EXISTS trg_update_account_balance ON public.transactions;
DROP TRIGGER IF EXISTS trg_update_credit_card_limit ON public.transactions;

-- Clean up duplicate invoice_items: keep only the first entry per (invoice_id, transaction_id, installment_number)
DELETE FROM public.invoice_items
WHERE id NOT IN (
  SELECT DISTINCT ON (invoice_id, transaction_id, installment_number) id
  FROM public.invoice_items
  ORDER BY invoice_id, transaction_id, installment_number, created_at ASC
);

-- Recalculate all invoice totals
DO $$
DECLARE
  inv RECORD;
BEGIN
  FOR inv IN SELECT id FROM public.invoices LOOP
    PERFORM public.recalc_invoice_total(inv.id);
  END LOOP;
END;
$$;

-- Fix credit card used_limit by recalculating from actual invoice_items
UPDATE public.credit_cards cc
SET used_limit = COALESCE(sub.total, 0)
FROM (
  SELECT t.credit_card_id, SUM(ii.amount) as total
  FROM public.invoice_items ii
  JOIN public.transactions t ON t.id = ii.transaction_id
  WHERE t.credit_card_id IS NOT NULL
  GROUP BY t.credit_card_id
) sub
WHERE cc.id = sub.credit_card_id;
