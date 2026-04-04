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
  i integer;
BEGIN
  -- Only process credit card transactions
  IF NEW.payment_method != 'cartao' OR NEW.credit_card_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  -- SKIP child transactions — they should not create invoice items
  -- Only the parent transaction handles all installments
  IF NEW.parent_transaction_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Get card closing day
  SELECT closing_day INTO v_closing_day
  FROM public.credit_cards WHERE id = NEW.credit_card_id;

  IF v_closing_day IS NULL THEN
    RETURN NEW;
  END IF;

  -- For UPDATE: remove old items first
  IF TG_OP = 'UPDATE' THEN
    DECLARE
      v_old_invoice_ids uuid[];
    BEGIN
      SELECT ARRAY_AGG(DISTINCT invoice_id) INTO v_old_invoice_ids
      FROM public.invoice_items WHERE transaction_id = OLD.id;

      DELETE FROM public.invoice_items WHERE transaction_id = OLD.id;

      IF v_old_invoice_ids IS NOT NULL THEN
        FOR i IN 1..array_length(v_old_invoice_ids, 1) LOOP
          PERFORM public.recalc_invoice_total(v_old_invoice_ids[i]);
        END LOOP;
      END IF;
    END;
  END IF;

  -- Determine installments
  v_installment_count := COALESCE(NEW.installments, 1);
  IF v_installment_count < 1 THEN v_installment_count := 1; END IF;

  -- Determine paid installments
  v_paid_installments := 0;
  IF NEW.observation IS NOT NULL AND NEW.observation LIKE 'paid_installments:%' THEN
    v_paid_installments := COALESCE(
      NULLIF(SPLIT_PART(SPLIT_PART(NEW.observation, ':', 2), ' ', 1), '')::integer, 0
    );
  END IF;

  -- The transaction amount is ALREADY per-installment
  v_installment_amount := NEW.amount;

  -- Get base invoice period
  SELECT gip.inv_month, gip.inv_year INTO v_period
  FROM public.get_invoice_period(NEW.date::date, v_closing_day) gip;

  -- Create invoice items for remaining installments
  -- FIX: offset months by paid_installments so the first unpaid installment
  -- maps to the current invoice period, not a future one
  FOR i IN 1..v_installment_count LOOP
    IF i <= v_paid_installments THEN
      CONTINUE;
    END IF;

    -- The key fix: subtract v_paid_installments from the offset
    -- so installment (paid+1) goes to base period, (paid+2) to base+1, etc.
    v_target_month := v_period.inv_month + (i - 1 - v_paid_installments);
    v_target_year := v_period.inv_year;

    WHILE v_target_month > 12 LOOP
      v_target_month := v_target_month - 12;
      v_target_year := v_target_year + 1;
    END LOOP;

    -- Get or create invoice for target period
    v_invoice_id := public.get_or_create_invoice(
      NEW.credit_card_id,
      v_target_month,
      v_target_year,
      NEW.user_id
    );

    -- Insert invoice item
    INSERT INTO public.invoice_items (
      invoice_id, transaction_id, amount, installment_number, total_installments
    ) VALUES (
      v_invoice_id, NEW.id, v_installment_amount, i, v_installment_count
    );

    -- Recalculate invoice total
    PERFORM public.recalc_invoice_total(v_invoice_id);
  END LOOP;

  -- Update credit card used_limit (full amount across ALL installments, including paid ones)
  UPDATE public.credit_cards
  SET used_limit = used_limit + (v_installment_amount * v_installment_count)
  WHERE id = NEW.credit_card_id;

  RETURN NEW;
END;
$$;