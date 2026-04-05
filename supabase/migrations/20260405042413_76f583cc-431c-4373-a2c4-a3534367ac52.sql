
-- Function to materialize recurring (fixa) credit card transaction items
-- into invoices for a given month. Called on-demand when viewing a month.
CREATE OR REPLACE FUNCTION public.materialize_recurring_invoice_items(
  p_user_id uuid,
  p_month integer,  -- 1-based month
  p_year integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tx RECORD;
  v_invoice_id uuid;
  v_exists boolean;
  v_closing_day integer;
  v_period RECORD;
  v_origin_month integer;
  v_origin_year integer;
BEGIN
  -- Find all active fixa credit card transactions for this user
  FOR v_tx IN
    SELECT t.id, t.credit_card_id, t.amount, t.date, t.name, t.category
    FROM public.transactions t
    WHERE t.user_id = p_user_id
      AND t.recurrence_type = 'fixa'
      AND t.payment_method = 'cartao'
      AND t.credit_card_id IS NOT NULL
      AND t.parent_transaction_id IS NULL
  LOOP
    -- Get the closing day for this card
    SELECT closing_day INTO v_closing_day
    FROM public.credit_cards WHERE id = v_tx.credit_card_id;

    IF v_closing_day IS NULL THEN
      CONTINUE;
    END IF;

    -- Determine the original invoice period of this transaction
    SELECT gip.inv_month, gip.inv_year INTO v_period
    FROM public.get_invoice_period(v_tx.date::date, v_closing_day) gip;

    v_origin_month := v_period.inv_month;
    v_origin_year := v_period.inv_year;

    -- Only create items for months AFTER the original invoice month
    -- (the original month is handled by the INSERT trigger)
    IF p_year < v_origin_year OR (p_year = v_origin_year AND p_month <= v_origin_month) THEN
      CONTINUE;
    END IF;

    -- Check if this transaction has been excluded for this month
    -- (recurring_exclusions uses 0-based months)
    IF EXISTS (
      SELECT 1 FROM public.recurring_exclusions
      WHERE transaction_id = v_tx.id
        AND month = p_month - 1
        AND year = p_year
    ) THEN
      CONTINUE;
    END IF;

    -- Get or create the invoice for this card/month
    v_invoice_id := public.get_or_create_invoice(p_user_id, v_tx.credit_card_id, p_month, p_year);

    -- Check if an item already exists for this transaction in this invoice
    SELECT EXISTS (
      SELECT 1 FROM public.invoice_items
      WHERE invoice_id = v_invoice_id AND transaction_id = v_tx.id
    ) INTO v_exists;

    IF NOT v_exists THEN
      INSERT INTO public.invoice_items (invoice_id, transaction_id, amount, installment_number, total_installments)
      VALUES (v_invoice_id, v_tx.id, v_tx.amount, 1, 1);

      PERFORM public.recalc_invoice_total(v_invoice_id);
    END IF;
  END LOOP;

  -- Recalc used limits for all user's cards
  PERFORM public.recalc_credit_card_used_limit(cc.id)
  FROM public.credit_cards cc WHERE cc.user_id = p_user_id;
END;
$$;
