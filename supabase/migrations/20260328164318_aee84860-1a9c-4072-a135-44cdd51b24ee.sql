
-- Add color column to accounts
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS color text DEFAULT NULL;

-- Add last_four_digits column to credit_cards
ALTER TABLE public.credit_cards ADD COLUMN IF NOT EXISTS last_four_digits text DEFAULT NULL;

-- Update handle_new_user to NOT create a default "Carteira" account anymore
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile only, no default account
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$function$;
