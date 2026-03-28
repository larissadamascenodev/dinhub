
-- Add installment_current to track which installment this transaction represents
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS installment_current integer DEFAULT NULL;

-- Add parent_transaction_id to link auto-generated installments back to the original
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS parent_transaction_id uuid REFERENCES public.transactions(id) ON DELETE CASCADE DEFAULT NULL;

-- Trigger to auto-generate future installment transactions
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
  -- Only on INSERT, only for parcelado transactions, only for the original (not auto-generated)
  IF TG_OP != 'INSERT' THEN RETURN NEW; END IF;
  IF NEW.recurrence_type != 'parcelado' THEN RETURN NEW; END IF;
  IF NEW.parent_transaction_id IS NOT NULL THEN RETURN NEW; END IF;
  IF NEW.installments IS NULL OR NEW.installments <= 1 THEN RETURN NEW; END IF;

  v_total := NEW.installments;
  v_current := COALESCE(NEW.installment_current, 1);
  v_installment_amount := NEW.amount; -- Each installment already has the per-installment amount
  v_base_date := NEW.date;

  -- Determine how many paid installments to skip (from observation encoding)
  v_paid_installments := 0;
  IF NEW.observation IS NOT NULL AND NEW.observation LIKE 'paid_installments:%' THEN
    v_paid_installments := COALESCE(
      NULLIF(SPLIT_PART(SPLIT_PART(NEW.observation, ':', 2), ' ', 1), '')::integer, 0
    );
  END IF;

  -- Set installment_current on the original transaction if not set
  IF NEW.installment_current IS NULL THEN
    NEW.installment_current := GREATEST(v_paid_installments + 1, 1);
  END IF;

  -- Generate future installment transactions (starting from current+1)
  FOR i IN (NEW.installment_current + 1)..v_total LOOP
    -- Calculate future date (add months)
    v_target_date := v_base_date + ((i - NEW.installment_current) * INTERVAL '1 month');

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

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trigger_generate_installments ON public.transactions;
CREATE TRIGGER trigger_generate_installments
  BEFORE INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.generate_installment_transactions();
