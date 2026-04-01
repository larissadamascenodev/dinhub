
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
  v_installment_amount numeric;
  v_base_date date;
  v_target_date date;
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

  IF v_current IS NULL OR v_current < 1 THEN
    v_current := GREATEST(v_paid_installments + 1, 1);
  END IF;

  FOR i IN (v_current + 1)..v_total LOOP
    v_target_date := v_base_date + ((i - v_current) * INTERVAL '1 month');

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
