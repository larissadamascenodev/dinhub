
-- Add type column to accounts
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'checking';

-- Update the default Carteira accounts to 'cash' type
UPDATE public.accounts SET type = 'cash' WHERE name = 'Carteira' AND is_default = true;

-- Update handle_new_user to include type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.accounts (user_id, name, type, is_default, initial_balance, current_balance)
  VALUES (NEW.id, 'Carteira', 'cash', true, 0, 0);
  RETURN NEW;
END;
$function$;

-- Function to update account balance when transactions change
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_amount numeric;
  v_type text;
  v_status text;
  v_account_id uuid;
  v_old_amount numeric;
  v_old_type text;
  v_old_status text;
  v_old_account_id uuid;
BEGIN
  -- On DELETE, reverse the old transaction effect
  IF TG_OP = 'DELETE' THEN
    IF OLD.status = 'pago' AND OLD.account_id IS NOT NULL THEN
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
    -- Auto-assign default account if not provided
    IF NEW.account_id IS NULL THEN
      SELECT id INTO NEW.account_id FROM public.accounts WHERE user_id = NEW.user_id AND is_default = true LIMIT 1;
    END IF;

    IF NEW.status = 'pago' AND NEW.account_id IS NOT NULL THEN
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
    -- Auto-assign default account if not provided
    IF NEW.account_id IS NULL THEN
      SELECT id INTO NEW.account_id FROM public.accounts WHERE user_id = NEW.user_id AND is_default = true LIMIT 1;
    END IF;

    -- Reverse old effect
    IF OLD.status = 'pago' AND OLD.account_id IS NOT NULL THEN
      IF OLD.type = 'receita' THEN
        UPDATE public.accounts SET current_balance = current_balance - OLD.amount WHERE id = OLD.account_id;
      ELSE
        UPDATE public.accounts SET current_balance = current_balance + OLD.amount WHERE id = OLD.account_id;
      END IF;
    END IF;

    -- Apply new effect
    IF NEW.status = 'pago' AND NEW.account_id IS NOT NULL THEN
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

-- Create trigger on transactions table
DROP TRIGGER IF EXISTS trigger_update_account_balance ON public.transactions;
CREATE TRIGGER trigger_update_account_balance
  BEFORE INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_account_balance();
