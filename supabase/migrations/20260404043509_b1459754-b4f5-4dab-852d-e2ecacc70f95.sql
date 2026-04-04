CREATE OR REPLACE FUNCTION public.generate_installment_transactions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_total integer;
  v_current integer;
  v_paid_installments integer;
  v_auto_paid integer;
  v_installment_amount numeric;
  v_base_date date;
  v_target_date date;
  v_user_start_date date;
  v_closing_day integer;
  v_period RECORD;
  v_target_month integer;
  v_target_year integer;
  i integer;
BEGIN
  IF TG_OP != 'INSERT' THEN RETURN NULL; END IF;
  IF NEW.recurrence_type != 'parcelado' THEN RETURN NULL; END IF;
  IF NEW.parent_transaction_id IS NOT NULL THEN RETURN NULL; END IF;
  IF NEW.installments IS NULL OR NEW.installments <= 1 THEN RETURN NULL; END IF;

  v_total := NEW.installments;
  v_current := COALESCE(NEW.installment_current, 1);
  v_installment_amount := NEW.amount;
  v_base_date := NEW.date;

  v_paid_installments := 0;
  IF NEW.observation IS NOT NULL AND NEW.observation LIKE 'paid_installments:%' THEN
    v_paid_installments := COALESCE(
      NULLIF(SPLIT_PART(SPLIT_PART(NEW.observation, ':', 2), ' ', 1), '')::integer, 0
    );
  END IF;

  IF v_paid_installments = 0 THEN
    SELECT created_at::date INTO v_user_start_date
    FROM public.profiles WHERE id = NEW.user_id;

    IF v_user_start_date IS NOT NULL AND NEW.payment_method = 'cartao' AND NEW.credit_card_id IS NOT NULL THEN
      SELECT closing_day INTO v_closing_day
      FROM public.credit_cards WHERE id = NEW.credit_card_id;

      IF v_closing_day IS NOT NULL THEN
        SELECT gip.inv_month, gip.inv_year INTO v_period
        FROM public.get_invoice_period(NEW.date::date, v_closing_day) gip;

        v_auto_paid := 0;
        FOR i IN 1..v_total LOOP
          v_target_month := v_period.inv_month + (i - 1);
          v_target_year := v_period.inv_year;
          WHILE v_target_month > 12 LOOP
            v_target_month := v_target_month - 12;
            v_target_year := v_target_year + 1;
          END LOOP;
          IF make_date(v_target_year, v_target_month, 1) < v_user_start_date THEN
            v_auto_paid := v_auto_paid + 1;
          END IF;
        END LOOP;
        v_paid_installments := v_auto_paid;
      END IF;
    END IF;
  END IF;

  IF v_current IS NULL OR v_current < 1 THEN
    v_current := GREATEST(v_paid_installments + 1, 1);
  END IF;

  FOR i IN (v_current + 1)..v_total LOOP
    v_target_date := (v_base_date + ((i - 1) * INTERVAL '1 month'))::date;

    IF v_user_start_date IS NOT NULL AND v_target_date < v_user_start_date THEN
      CONTINUE;
    END IF;

    INSERT INTO public.transactions (
      user_id, name, category, date, amount, type,
      status, payment_method, recurrence_type, installments,
      installment_current, credit_card_id, account_id,
      observation, parent_transaction_id
    ) VALUES (
      NEW.user_id, NEW.name, NEW.category, v_target_date, v_installment_amount, NEW.type,
      'pendente', NEW.payment_method, 'parcelado', v_total,
      i, NEW.credit_card_id, NEW.account_id,
      NULL, NEW.id
    );
  END LOOP;

  RETURN NULL;
END;
$function$;

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
  v_auto_paid integer;
  v_installment_amount numeric;
  v_target_month integer;
  v_target_year integer;
  v_old_invoice_ids uuid[];
  v_user_start_date date;
  v_inst_date date;
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

  SELECT created_at::date INTO v_user_start_date
  FROM public.profiles WHERE id = NEW.user_id;

  v_installment_amount := NEW.amount;

  SELECT gip.inv_month, gip.inv_year INTO v_period
  FROM public.get_invoice_period(NEW.date::date, v_closing_day) gip;

  IF v_paid_installments = 0 AND v_user_start_date IS NOT NULL AND v_installment_count > 1 THEN
    v_auto_paid := 0;
    FOR i IN 1..v_installment_count LOOP
      v_target_month := v_period.inv_month + (i - 1);
      v_target_year := v_period.inv_year;
      WHILE v_target_month > 12 LOOP
        v_target_month := v_target_month - 12;
        v_target_year := v_target_year + 1;
      END LOOP;
      v_inst_date := make_date(v_target_year, v_target_month, 1);
      IF v_inst_date < v_user_start_date THEN
        v_auto_paid := v_auto_paid + 1;
      END IF;
    END LOOP;
    v_paid_installments := v_auto_paid;
  END IF;

  FOR i IN 1..v_installment_count LOOP
    IF i <= v_paid_installments THEN
      CONTINUE;
    END IF;

    v_target_month := v_period.inv_month + (i - 1);
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
$function$;

CREATE OR REPLACE FUNCTION public.rebuild_credit_card_invoice_items()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  tx RECORD;
  v_closing_day integer;
  v_period RECORD;
  v_invoice_id uuid;
  v_installment_count integer;
  v_paid_installments integer;
  v_auto_paid integer;
  v_target_month integer;
  v_target_year integer;
  v_user_start_date date;
  v_inst_date date;
  v_affected_invoice_ids uuid[];
  i integer;
BEGIN
  FOR tx IN
    SELECT *
    FROM public.transactions
    WHERE payment_method = 'cartao'
      AND credit_card_id IS NOT NULL
      AND parent_transaction_id IS NULL
  LOOP
    SELECT closing_day INTO v_closing_day
    FROM public.credit_cards
    WHERE id = tx.credit_card_id;

    IF v_closing_day IS NULL THEN
      CONTINUE;
    END IF;

    SELECT ARRAY_AGG(DISTINCT invoice_id) INTO v_affected_invoice_ids
    FROM public.invoice_items
    WHERE transaction_id = tx.id;

    DELETE FROM public.invoice_items
    WHERE transaction_id = tx.id;

    IF v_affected_invoice_ids IS NOT NULL THEN
      FOR i IN 1..array_length(v_affected_invoice_ids, 1) LOOP
        PERFORM public.recalc_invoice_total(v_affected_invoice_ids[i]);
      END LOOP;
    END IF;

    v_installment_count := COALESCE(tx.installments, 1);
    IF v_installment_count < 1 THEN v_installment_count := 1; END IF;

    v_paid_installments := 0;
    IF tx.observation IS NOT NULL AND tx.observation LIKE 'paid_installments:%' THEN
      v_paid_installments := COALESCE(
        NULLIF(SPLIT_PART(SPLIT_PART(tx.observation, ':', 2), ' ', 1), '')::integer, 0
      );
    END IF;

    SELECT created_at::date INTO v_user_start_date
    FROM public.profiles
    WHERE id = tx.user_id;

    SELECT gip.inv_month, gip.inv_year INTO v_period
    FROM public.get_invoice_period(tx.date::date, v_closing_day) gip;

    IF v_paid_installments = 0 AND v_user_start_date IS NOT NULL AND v_installment_count > 1 THEN
      v_auto_paid := 0;
      FOR i IN 1..v_installment_count LOOP
        v_target_month := v_period.inv_month + (i - 1);
        v_target_year := v_period.inv_year;
        WHILE v_target_month > 12 LOOP
          v_target_month := v_target_month - 12;
          v_target_year := v_target_year + 1;
        END LOOP;
        v_inst_date := make_date(v_target_year, v_target_month, 1);
        IF v_inst_date < v_user_start_date THEN
          v_auto_paid := v_auto_paid + 1;
        END IF;
      END LOOP;
      v_paid_installments := v_auto_paid;
    END IF;

    FOR i IN 1..v_installment_count LOOP
      IF i <= v_paid_installments THEN
        CONTINUE;
      END IF;

      v_target_month := v_period.inv_month + (i - 1);
      v_target_year := v_period.inv_year;

      WHILE v_target_month > 12 LOOP
        v_target_month := v_target_month - 12;
        v_target_year := v_target_year + 1;
      END LOOP;

      v_invoice_id := public.get_or_create_invoice(
        tx.user_id,
        tx.credit_card_id,
        v_target_month,
        v_target_year
      );

      INSERT INTO public.invoice_items (
        invoice_id, transaction_id, amount, installment_number, total_installments
      ) VALUES (
        v_invoice_id, tx.id, tx.amount, i, v_installment_count
      );

      PERFORM public.recalc_invoice_total(v_invoice_id);
    END LOOP;

    PERFORM public.recalc_credit_card_used_limit(tx.credit_card_id);
  END LOOP;
END;
$function$;

SELECT public.rebuild_credit_card_invoice_items();
DROP FUNCTION public.rebuild_credit_card_invoice_items();