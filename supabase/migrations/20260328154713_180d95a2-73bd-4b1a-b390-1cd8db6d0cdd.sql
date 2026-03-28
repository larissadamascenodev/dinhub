
-- Create credit_cards table
CREATE TABLE public.credit_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  "limit" numeric NOT NULL DEFAULT 0,
  used_limit numeric NOT NULL DEFAULT 0,
  closing_day integer NOT NULL DEFAULT 1 CHECK (closing_day >= 1 AND closing_day <= 31),
  due_day integer NOT NULL DEFAULT 1 CHECK (due_day >= 1 AND due_day <= 31),
  color text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

-- RLS policy
CREATE POLICY "Users can access their own credit cards"
  ON public.credit_cards FOR ALL
  TO public
  USING (auth.uid() = user_id);

-- Add credit_card_id to transactions
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS credit_card_id uuid REFERENCES public.credit_cards(id) ON DELETE SET NULL DEFAULT NULL;

-- Trigger to update used_limit on credit card transactions
CREATE OR REPLACE FUNCTION public.update_credit_card_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- On DELETE, reverse
  IF TG_OP = 'DELETE' THEN
    IF OLD.payment_method = 'cartao' AND OLD.credit_card_id IS NOT NULL AND OLD.status = 'pago' THEN
      UPDATE public.credit_cards SET used_limit = used_limit - OLD.amount WHERE id = OLD.credit_card_id;
    END IF;
    RETURN OLD;
  END IF;

  -- On INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.payment_method = 'cartao' AND NEW.credit_card_id IS NOT NULL AND NEW.status = 'pago' THEN
      UPDATE public.credit_cards SET used_limit = used_limit + NEW.amount WHERE id = NEW.credit_card_id;
    END IF;
    RETURN NEW;
  END IF;

  -- On UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Reverse old
    IF OLD.payment_method = 'cartao' AND OLD.credit_card_id IS NOT NULL AND OLD.status = 'pago' THEN
      UPDATE public.credit_cards SET used_limit = used_limit - OLD.amount WHERE id = OLD.credit_card_id;
    END IF;
    -- Apply new
    IF NEW.payment_method = 'cartao' AND NEW.credit_card_id IS NOT NULL AND NEW.status = 'pago' THEN
      UPDATE public.credit_cards SET used_limit = used_limit + NEW.amount WHERE id = NEW.credit_card_id;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trigger_update_credit_card_limit ON public.transactions;
CREATE TRIGGER trigger_update_credit_card_limit
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_credit_card_limit();

-- Also update the account balance trigger to skip credit card transactions
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- On DELETE, reverse the old transaction effect
  IF TG_OP = 'DELETE' THEN
    IF OLD.payment_method != 'cartao' AND OLD.status = 'pago' AND OLD.account_id IS NOT NULL THEN
      IF OLD.type = 'receita' THEN
        UPDATE public.accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.account_id;
      ELSE
        UPDATE public.accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.account_id;
      END IF;
    END IF;
    RETURN OLD;
  END IF;

  -- On INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.account_id IS NULL AND NEW.payment_method != 'cartao' THEN
      SELECT id INTO NEW.account_id FROM public.accounts WHERE user_id = NEW.user_id AND is_default = true LIMIT 1;
    END IF;

    IF NEW.payment_method != 'cartao' AND NEW.status = 'pago' AND NEW.account_id IS NOT NULL THEN
      IF NEW.type = 'receita' THEN
        UPDATE public.accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.account_id;
      ELSE
        UPDATE public.accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.account_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- On UPDATE
  IF TG_OP = 'UPDATE' THEN
    IF NEW.account_id IS NULL AND NEW.payment_method != 'cartao' THEN
      SELECT id INTO NEW.account_id FROM public.accounts WHERE user_id = NEW.user_id AND is_default = true LIMIT 1;
    END IF;

    -- Reverse old effect
    IF OLD.payment_method != 'cartao' AND OLD.status = 'pago' AND OLD.account_id IS NOT NULL THEN
      IF OLD.type = 'receita' THEN
        UPDATE public.accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.account_id;
      ELSE
        UPDATE public.accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.account_id;
      END IF;
    END IF;

    -- Apply new effect
    IF NEW.payment_method != 'cartao' AND NEW.status = 'pago' AND NEW.account_id IS NOT NULL THEN
      IF NEW.type = 'receita' THEN
        UPDATE public.accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.account_id;
      ELSE
        UPDATE public.accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.account_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$function$;

-- updated_at trigger for credit_cards
CREATE TRIGGER update_credit_cards_updated_at
  BEFORE UPDATE ON public.credit_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for credit_cards
ALTER PUBLICATION supabase_realtime ADD TABLE public.credit_cards;
