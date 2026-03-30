
-- Add to_account_id column for transfers
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS to_account_id uuid REFERENCES public.accounts(id);

-- Update the balance trigger to handle transfer and investment types
CREATE OR REPLACE FUNCTION public.update_account_balance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- On DELETE, reverse the old transaction effect
  IF TG_OP = 'DELETE' THEN
    IF OLD.payment_method != 'cartao' AND OLD.status = 'pago' THEN
      -- Handle transfer/investment: reverse both sides
      IF OLD.type IN ('transferencia', 'investimento') THEN
        IF OLD.account_id IS NOT NULL THEN
          UPDATE public.accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.account_id;
        END IF;
        IF OLD.to_account_id IS NOT NULL THEN
          UPDATE public.accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.to_account_id;
        END IF;
      ELSIF OLD.account_id IS NOT NULL THEN
        IF OLD.type = 'receita' THEN
          UPDATE public.accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.account_id;
        ELSE
          UPDATE public.accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.account_id;
        END IF;
      END IF;
    END IF;
    RETURN OLD;
  END IF;

  -- On INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.account_id IS NULL AND NEW.payment_method != 'cartao' AND NEW.type NOT IN ('transferencia', 'investimento') THEN
      SELECT id INTO NEW.account_id FROM public.accounts WHERE user_id = NEW.user_id AND is_default = true LIMIT 1;
    END IF;

    IF NEW.payment_method != 'cartao' AND NEW.status = 'pago' THEN
      IF NEW.type IN ('transferencia', 'investimento') THEN
        IF NEW.account_id IS NOT NULL THEN
          UPDATE public.accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.account_id;
        END IF;
        IF NEW.to_account_id IS NOT NULL THEN
          UPDATE public.accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.to_account_id;
        END IF;
      ELSIF NEW.account_id IS NOT NULL THEN
        IF NEW.type = 'receita' THEN
          UPDATE public.accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.account_id;
        ELSE
          UPDATE public.accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.account_id;
        END IF;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- On UPDATE
  IF TG_OP = 'UPDATE' THEN
    IF NEW.account_id IS NULL AND NEW.payment_method != 'cartao' AND NEW.type NOT IN ('transferencia', 'investimento') THEN
      SELECT id INTO NEW.account_id FROM public.accounts WHERE user_id = NEW.user_id AND is_default = true LIMIT 1;
    END IF;

    -- Reverse old effect
    IF OLD.payment_method != 'cartao' AND OLD.status = 'pago' THEN
      IF OLD.type IN ('transferencia', 'investimento') THEN
        IF OLD.account_id IS NOT NULL THEN
          UPDATE public.accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.account_id;
        END IF;
        IF OLD.to_account_id IS NOT NULL THEN
          UPDATE public.accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.to_account_id;
        END IF;
      ELSIF OLD.account_id IS NOT NULL THEN
        IF OLD.type = 'receita' THEN
          UPDATE public.accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.account_id;
        ELSE
          UPDATE public.accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.account_id;
        END IF;
      END IF;
    END IF;

    -- Apply new effect
    IF NEW.payment_method != 'cartao' AND NEW.status = 'pago' THEN
      IF NEW.type IN ('transferencia', 'investimento') THEN
        IF NEW.account_id IS NOT NULL THEN
          UPDATE public.accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.account_id;
        END IF;
        IF NEW.to_account_id IS NOT NULL THEN
          UPDATE public.accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.to_account_id;
        END IF;
      ELSIF NEW.account_id IS NOT NULL THEN
        IF NEW.type = 'receita' THEN
          UPDATE public.accounts SET current_balance = current_balance + NEW.amount WHERE id = NEW.account_id;
        ELSE
          UPDATE public.accounts SET current_balance = current_balance - NEW.amount WHERE id = NEW.account_id;
        END IF;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$function$;
