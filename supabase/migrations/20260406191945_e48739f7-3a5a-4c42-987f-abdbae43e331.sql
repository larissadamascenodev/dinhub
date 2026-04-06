
-- Replace the balance trigger with a full-recalculation approach
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  affected_account_ids uuid[];
BEGIN
  -- Collect all affected account IDs
  affected_account_ids := ARRAY[]::uuid[];

  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    IF OLD.account_id IS NOT NULL THEN
      affected_account_ids := array_append(affected_account_ids, OLD.account_id);
    END IF;
    IF OLD.to_account_id IS NOT NULL THEN
      affected_account_ids := array_append(affected_account_ids, OLD.to_account_id);
    END IF;
  END IF;

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Auto-assign default account if missing
    IF NEW.account_id IS NULL AND NEW.payment_method != 'cartao' AND NEW.type NOT IN ('transferencia', 'investimento') THEN
      SELECT id INTO NEW.account_id FROM public.accounts WHERE user_id = NEW.user_id AND is_default = true LIMIT 1;
    END IF;

    IF NEW.account_id IS NOT NULL THEN
      affected_account_ids := array_append(affected_account_ids, NEW.account_id);
    END IF;
    IF NEW.to_account_id IS NOT NULL THEN
      affected_account_ids := array_append(affected_account_ids, NEW.to_account_id);
    END IF;
  END IF;

  -- Recalculate balance for each affected account from scratch
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
  ), 0)
  WHERE a.id = ANY(affected_account_ids);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;
