
-- Update the account balance function to also subtract invoice_payments
CREATE OR REPLACE FUNCTION public.update_account_balance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  affected_account_ids uuid[];
BEGIN
  affected_account_ids := ARRAY[]::uuid[];

  IF TG_TABLE_NAME = 'invoice_payments' THEN
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
      IF OLD.account_id IS NOT NULL THEN
        affected_account_ids := array_append(affected_account_ids, OLD.account_id);
      END IF;
    END IF;
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
      IF NEW.account_id IS NOT NULL THEN
        affected_account_ids := array_append(affected_account_ids, NEW.account_id);
      END IF;
    END IF;
  ELSE
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
      IF OLD.account_id IS NOT NULL THEN
        affected_account_ids := array_append(affected_account_ids, OLD.account_id);
      END IF;
      IF OLD.to_account_id IS NOT NULL THEN
        affected_account_ids := array_append(affected_account_ids, OLD.to_account_id);
      END IF;
    END IF;

    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
      IF NEW.account_id IS NOT NULL THEN
        affected_account_ids := array_append(affected_account_ids, NEW.account_id);
      END IF;
      IF NEW.to_account_id IS NOT NULL THEN
        affected_account_ids := array_append(affected_account_ids, NEW.to_account_id);
      END IF;
    END IF;
  END IF;

  -- Recalculate from scratch for each affected account
  UPDATE public.accounts a
  SET current_balance = a.initial_balance
    + COALESCE((
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
    ), 0)
    - COALESCE((
      SELECT SUM(ip.amount)
      FROM public.invoice_payments ip
      WHERE ip.account_id = a.id
    ), 0)
  WHERE a.id = ANY(affected_account_ids);

  RETURN NULL; -- AFTER trigger returns NULL
END;
$function$;

-- Add trigger on invoice_payments to recalculate account balance
CREATE TRIGGER trg_invoice_payment_update_balance
AFTER INSERT OR UPDATE OR DELETE ON public.invoice_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_account_balance();
