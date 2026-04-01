-- Fix: credit card used_limit should update for ALL credit card transactions,
-- not just those with status = 'pago'. Credit card purchases consume limit regardless of payment status.
CREATE OR REPLACE FUNCTION public.update_credit_card_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.payment_method = 'cartao' AND OLD.credit_card_id IS NOT NULL THEN
      UPDATE public.credit_cards SET used_limit = used_limit - OLD.amount WHERE id = OLD.credit_card_id;
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.payment_method = 'cartao' AND NEW.credit_card_id IS NOT NULL THEN
      UPDATE public.credit_cards SET used_limit = used_limit + NEW.amount WHERE id = NEW.credit_card_id;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Reverse old
    IF OLD.payment_method = 'cartao' AND OLD.credit_card_id IS NOT NULL THEN
      UPDATE public.credit_cards SET used_limit = used_limit - OLD.amount WHERE id = OLD.credit_card_id;
    END IF;
    -- Apply new
    IF NEW.payment_method = 'cartao' AND NEW.credit_card_id IS NOT NULL THEN
      UPDATE public.credit_cards SET used_limit = used_limit + NEW.amount WHERE id = NEW.credit_card_id;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;