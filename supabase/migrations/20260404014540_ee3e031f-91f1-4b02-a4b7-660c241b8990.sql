
-- Create a function to recalculate credit card used_limit from actual unpaid invoice_items
CREATE OR REPLACE FUNCTION public.recalc_credit_card_used_limit(p_credit_card_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total numeric;
BEGIN
  SELECT COALESCE(SUM(ii.amount), 0) INTO v_total
  FROM public.invoice_items ii
  JOIN public.invoices inv ON inv.id = ii.invoice_id
  WHERE inv.credit_card_id = p_credit_card_id
    AND inv.is_paid = false;

  UPDATE public.credit_cards
  SET used_limit = v_total
  WHERE id = p_credit_card_id;
END;
$$;

-- Replace the credit card limit trigger to use recalc
CREATE OR REPLACE FUNCTION public.update_credit_card_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.payment_method = 'cartao' AND OLD.credit_card_id IS NOT NULL THEN
      PERFORM public.recalc_credit_card_used_limit(OLD.credit_card_id);
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.payment_method = 'cartao' AND NEW.credit_card_id IS NOT NULL THEN
      PERFORM public.recalc_credit_card_used_limit(NEW.credit_card_id);
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.payment_method = 'cartao' AND OLD.credit_card_id IS NOT NULL THEN
      PERFORM public.recalc_credit_card_used_limit(OLD.credit_card_id);
    END IF;
    IF NEW.payment_method = 'cartao' AND NEW.credit_card_id IS NOT NULL
       AND (OLD.credit_card_id IS DISTINCT FROM NEW.credit_card_id) THEN
      PERFORM public.recalc_credit_card_used_limit(NEW.credit_card_id);
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

-- Handle DELETE in handle_credit_card_invoice
CREATE OR REPLACE FUNCTION public.handle_credit_card_invoice_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_invoice_ids uuid[];
  i integer;
BEGIN
  IF OLD.payment_method != 'cartao' OR OLD.credit_card_id IS NULL THEN
    RETURN OLD;
  END IF;

  -- Get affected invoices before cascade delete removes items
  SELECT ARRAY_AGG(DISTINCT invoice_id) INTO v_old_invoice_ids
  FROM public.invoice_items WHERE transaction_id = OLD.id;

  -- Manually delete invoice_items before cascade so we can recalc
  DELETE FROM public.invoice_items WHERE transaction_id = OLD.id;

  IF v_old_invoice_ids IS NOT NULL THEN
    FOR i IN 1..array_length(v_old_invoice_ids, 1) LOOP
      PERFORM public.recalc_invoice_total(v_old_invoice_ids[i]);
    END LOOP;
  END IF;

  PERFORM public.recalc_credit_card_used_limit(OLD.credit_card_id);

  RETURN OLD;
END;
$$;

-- Update handle_credit_card_invoice (INSERT/UPDATE only)
CREATE OR REPLACE FUNCTION public.handle_credit_card_invoice()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_closing_day integer;
  v_period RECORD;
  v_invoice_id uuid;
  v_installment_count integer;
  v_paid_installments integer;
  v_installment_amount numeric;
  v_target_month integer;
  v_target_year integer;
  v_old_invoice_ids uuid[];
  i integer;
BEGIN
  IF NEW.payment_method != 'cartao' OR NEW.credit_card_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.parent_transaction_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT closing_day INTO v_closing_day
  FROM public.credit_cards WHERE id = NEW.credit_card_id;

  IF v_closing_day IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    SELECT ARRAY_AGG(DISTINCT invoice_id) INTO v_old_invoice_ids
    FROM public.invoice_items WHERE transaction_id = OLD.id;

    DELETE FROM public.invoice_items WHERE transaction_id = OLD.id;

    IF v_old_invoice_ids IS NOT NULL THEN
      FOR i IN 1..array_length(v_old_invoice_ids, 1) LOOP
        PERFORM public.recalc_invoice_total(v_old_invoice_ids[i]);
      END LOOP;
    END IF;
  END IF;

  v_installment_count := COALESCE(NEW.installments, 1);
  IF v_installment_count < 1 THEN v_installment_count := 1; END IF;

  v_paid_installments := 0;
  IF NEW.observation IS NOT NULL AND NEW.observation LIKE 'paid_installments:%' THEN
    v_paid_installments := COALESCE(
      NULLIF(SPLIT_PART(SPLIT_PART(NEW.observation, ':', 2), ' ', 1), '')::integer, 0
    );
  END IF;

  v_installment_amount := NEW.amount;

  SELECT gip.inv_month, gip.inv_year INTO v_period
  FROM public.get_invoice_period(NEW.date::date, v_closing_day) gip;

  FOR i IN 1..v_installment_count LOOP
    IF i <= v_paid_installments THEN
      CONTINUE;
    END IF;

    v_target_month := v_period.inv_month + (i - 1 - v_paid_installments);
    v_target_year := v_period.inv_year;

    WHILE v_target_month > 12 LOOP
      v_target_month := v_target_month - 12;
      v_target_year := v_target_year + 1;
    END LOOP;

    v_invoice_id := public.get_or_create_invoice(
      NEW.user_id,
      NEW.credit_card_id,
      v_target_month,
      v_target_year
    );

    INSERT INTO public.invoice_items (
      invoice_id, transaction_id, amount, installment_number, total_installments
    ) VALUES (
      v_invoice_id, NEW.id, v_installment_amount, i, v_installment_count
    );

    PERFORM public.recalc_invoice_total(v_invoice_id);
  END LOOP;

  PERFORM public.recalc_credit_card_used_limit(NEW.credit_card_id);

  RETURN NEW;
END;
$$;

-- Drop old trigger and create separate ones
DROP TRIGGER IF EXISTS trigger_handle_credit_card_invoice ON public.transactions;

CREATE TRIGGER trigger_handle_credit_card_invoice
  AFTER INSERT OR UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_credit_card_invoice();

CREATE TRIGGER trigger_handle_credit_card_invoice_delete
  BEFORE DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_credit_card_invoice_delete();

-- Recalculate all existing credit card limits
DO $$
DECLARE
  cc RECORD;
BEGIN
  FOR cc IN SELECT id FROM public.credit_cards LOOP
    PERFORM public.recalc_credit_card_used_limit(cc.id);
  END LOOP;
END;
$$;
