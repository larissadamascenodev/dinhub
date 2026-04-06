
-- Step 1: Drop the old BEFORE trigger
DROP TRIGGER IF EXISTS trg_update_account_balance ON public.transactions;

-- Step 2: Create a BEFORE trigger ONLY for auto-assigning default account
CREATE OR REPLACE FUNCTION public.auto_assign_default_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.account_id IS NULL AND NEW.payment_method != 'cartao' AND NEW.type NOT IN ('transferencia', 'investimento') THEN
    SELECT id INTO NEW.account_id FROM public.accounts WHERE user_id = NEW.user_id AND is_default = true LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_assign_account
  BEFORE INSERT OR UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_default_account();

-- Step 3: Rewrite the balance function to work as AFTER trigger
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  affected_account_ids uuid[];
BEGIN
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
    IF NEW.account_id IS NOT NULL THEN
      affected_account_ids := array_append(affected_account_ids, NEW.account_id);
    END IF;
    IF NEW.to_account_id IS NOT NULL THEN
      affected_account_ids := array_append(affected_account_ids, NEW.to_account_id);
    END IF;
  END IF;

  -- Recalculate from scratch for each affected account
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

  RETURN NULL; -- AFTER trigger returns NULL
END;
$$;

-- Step 4: Create the AFTER trigger for balance recalculation
CREATE TRIGGER trg_update_account_balance
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_account_balance();

-- Step 5: Delete the ghost recurring exclusions
DELETE FROM public.recurring_exclusions
WHERE transaction_id IN (
  'fdaff224-e1c8-458c-9e12-d1ed1f80089d',
  'ccb85fad-f7be-41e8-a374-4bbe3830329b'
);

-- Step 6: Delete the ghost transactions (trigger will recalculate balance)
DELETE FROM public.transactions
WHERE id IN (
  'fdaff224-e1c8-458c-9e12-d1ed1f80089d',
  'ccb85fad-f7be-41e8-a374-4bbe3830329b'
);

-- Step 7: Safety net — recalculate all account balances
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
