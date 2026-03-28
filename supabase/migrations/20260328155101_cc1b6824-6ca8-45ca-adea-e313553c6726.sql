
-- Create invoices table
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  credit_card_id uuid NOT NULL REFERENCES public.credit_cards(id) ON DELETE CASCADE,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  total_amount numeric NOT NULL DEFAULT 0,
  is_paid boolean NOT NULL DEFAULT false,
  paid_at timestamptz DEFAULT NULL,
  paid_from_account_id uuid REFERENCES public.accounts(id) DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (credit_card_id, month, year)
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own invoices"
  ON public.invoices FOR ALL TO public
  USING (auth.uid() = user_id);

-- Create invoice_items table
CREATE TABLE public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  transaction_id uuid NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  installment_number integer NOT NULL DEFAULT 1,
  total_installments integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own invoice items"
  ON public.invoice_items FOR ALL TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND i.user_id = auth.uid()
    )
  );

-- updated_at triggers
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to determine which invoice month/year a purchase date falls into
-- based on the card's closing_day
CREATE OR REPLACE FUNCTION public.get_invoice_period(
  p_purchase_date date,
  p_closing_day integer
)
RETURNS TABLE(inv_month integer, inv_year integer)
LANGUAGE plpgsql IMMUTABLE
AS $function$
DECLARE
  d_day integer;
  d_month integer;
  d_year integer;
BEGIN
  d_day := EXTRACT(DAY FROM p_purchase_date);
  d_month := EXTRACT(MONTH FROM p_purchase_date);
  d_year := EXTRACT(YEAR FROM p_purchase_date);

  -- If purchase is AFTER closing day, it goes to NEXT month's invoice
  IF d_day > p_closing_day THEN
    IF d_month = 12 THEN
      inv_month := 1;
      inv_year := d_year + 1;
    ELSE
      inv_month := d_month + 1;
      inv_year := d_year;
    END IF;
  ELSE
    -- Purchase on or before closing day → current month's invoice
    inv_month := d_month;
    inv_year := d_year;
  END IF;

  RETURN NEXT;
END;
$function$;

-- Function to get or create an invoice for a given card/month/year
CREATE OR REPLACE FUNCTION public.get_or_create_invoice(
  p_user_id uuid,
  p_credit_card_id uuid,
  p_month integer,
  p_year integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_invoice_id uuid;
BEGIN
  SELECT id INTO v_invoice_id
  FROM public.invoices
  WHERE credit_card_id = p_credit_card_id AND month = p_month AND year = p_year;

  IF v_invoice_id IS NULL THEN
    INSERT INTO public.invoices (user_id, credit_card_id, month, year, total_amount)
    VALUES (p_user_id, p_credit_card_id, p_month, p_year, 0)
    RETURNING id INTO v_invoice_id;
  END IF;

  RETURN v_invoice_id;
END;
$function$;

-- Function to recalculate invoice total from its items
CREATE OR REPLACE FUNCTION public.recalc_invoice_total(p_invoice_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.invoices
  SET total_amount = COALESCE((
    SELECT SUM(amount) FROM public.invoice_items WHERE invoice_id = p_invoice_id
  ), 0)
  WHERE id = p_invoice_id;
END;
$function$;

-- Main trigger: auto-create invoice items when credit card transaction is inserted
CREATE OR REPLACE FUNCTION public.handle_credit_card_invoice()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  -- On DELETE: handled by CASCADE on invoice_items.transaction_id
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  -- Get card closing day
  SELECT closing_day INTO v_closing_day
  FROM public.credit_cards WHERE id = NEW.credit_card_id;

  IF v_closing_day IS NULL THEN
    RETURN NEW;
  END IF;

  -- For UPDATE: remove old items first, they'll be recreated
  IF TG_OP = 'UPDATE' THEN
    -- Get affected invoice IDs before deleting items
    DECLARE
      v_old_invoice_ids uuid[];
    BEGIN
      SELECT ARRAY_AGG(DISTINCT invoice_id) INTO v_old_invoice_ids
      FROM public.invoice_items WHERE transaction_id = OLD.id;

      DELETE FROM public.invoice_items WHERE transaction_id = OLD.id;

      -- Recalculate old invoices
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

  -- Determine paid installments (stored in observation as "paid:N" pattern or from recurrence)
  v_paid_installments := 0;
  IF NEW.observation IS NOT NULL AND NEW.observation LIKE 'paid_installments:%' THEN
    v_paid_installments := COALESCE(
      NULLIF(SPLIT_PART(NEW.observation, ':', 2), '')::integer, 0
    );
  END IF;

  v_installment_amount := ROUND(NEW.amount / v_installment_count, 2);

  -- Get base invoice period
  SELECT gip.inv_month, gip.inv_year INTO v_period
  FROM public.get_invoice_period(NEW.date::date, v_closing_day) gip;

  -- Create invoice items for remaining installments
  FOR i IN 1..v_installment_count LOOP
    -- Skip already-paid installments
    IF i <= v_paid_installments THEN
      CONTINUE;
    END IF;

    -- Calculate target month: base period + offset for each installment
    v_target_month := v_period.inv_month + (i - 1);
    v_target_year := v_period.inv_year;

    -- Normalize month overflow
    WHILE v_target_month > 12 LOOP
      v_target_month := v_target_month - 12;
      v_target_year := v_target_year + 1;
    END LOOP;

    -- Get or create the invoice
    v_invoice_id := public.get_or_create_invoice(
      NEW.user_id, NEW.credit_card_id, v_target_month, v_target_year
    );

    -- Insert invoice item
    INSERT INTO public.invoice_items (invoice_id, transaction_id, amount, installment_number, total_installments)
    VALUES (v_invoice_id, NEW.id, v_installment_amount, i, v_installment_count);

    -- Recalculate invoice total
    PERFORM public.recalc_invoice_total(v_invoice_id);
  END LOOP;

  RETURN NEW;
END;
$function$;

-- Attach trigger AFTER insert/update on transactions
DROP TRIGGER IF EXISTS trigger_handle_credit_card_invoice ON public.transactions;
CREATE TRIGGER trigger_handle_credit_card_invoice
  AFTER INSERT OR UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_credit_card_invoice();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoice_items;
