
-- Goals table
CREATE TABLE public.goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  target_amount numeric NOT NULL,
  current_amount numeric NOT NULL DEFAULT 0,
  monthly_contribution numeric DEFAULT NULL,
  deadline date DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own goals"
ON public.goals FOR ALL
USING (auth.uid() = user_id);

CREATE TRIGGER update_goals_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Goal transactions table
CREATE TABLE public.goal_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  source text DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.goal_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own goal transactions"
ON public.goal_transactions FOR ALL
USING (auth.uid() = user_id);

-- Trigger to auto-update goal current_amount on deposit
CREATE OR REPLACE FUNCTION public.update_goal_current_amount()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_new_total numeric;
  v_target numeric;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_new_total
    FROM public.goal_transactions WHERE goal_id = NEW.goal_id;

    SELECT target_amount INTO v_target FROM public.goals WHERE id = NEW.goal_id;

    UPDATE public.goals
    SET current_amount = LEAST(v_new_total, v_target)
    WHERE id = NEW.goal_id;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_new_total
    FROM public.goal_transactions WHERE goal_id = OLD.goal_id;

    SELECT target_amount INTO v_target FROM public.goals WHERE id = OLD.goal_id;

    UPDATE public.goals
    SET current_amount = LEAST(v_new_total, v_target)
    WHERE id = OLD.goal_id;

    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_update_goal_amount
AFTER INSERT OR DELETE ON public.goal_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_goal_current_amount();
