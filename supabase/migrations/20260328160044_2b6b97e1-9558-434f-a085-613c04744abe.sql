
-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text DEFAULT NULL,
  has_completed_profile boolean NOT NULL DEFAULT false,
  has_account boolean NOT NULL DEFAULT false,
  has_transactions boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT TO public
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO public
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO public
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create default account
  INSERT INTO public.accounts (user_id, name, type, is_default, initial_balance, current_balance)
  VALUES (NEW.id, 'Carteira', 'cash', true, 0, 0);

  -- Create profile
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$function$;

-- Trigger to update has_account when accounts change
CREATE OR REPLACE FUNCTION public.sync_profile_has_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET has_account = true WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE user_id = OLD.user_id) THEN
      UPDATE public.profiles SET has_account = false WHERE id = OLD.user_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

DROP TRIGGER IF EXISTS trigger_sync_has_account ON public.accounts;
CREATE TRIGGER trigger_sync_has_account
  AFTER INSERT OR DELETE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_has_account();

-- Trigger to update has_transactions when transactions change
CREATE OR REPLACE FUNCTION public.sync_profile_has_transactions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET has_transactions = true WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

DROP TRIGGER IF EXISTS trigger_sync_has_transactions ON public.transactions;
CREATE TRIGGER trigger_sync_has_transactions
  AFTER INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_has_transactions();

-- updated_at trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert profiles for existing users who don't have one
INSERT INTO public.profiles (id, has_account, has_transactions)
SELECT 
  u.id,
  EXISTS (SELECT 1 FROM public.accounts a WHERE a.user_id = u.id),
  EXISTS (SELECT 1 FROM public.transactions t WHERE t.user_id = u.id)
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);
