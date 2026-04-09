CREATE TABLE public.category_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  category text NOT NULL,
  limit_amount numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, category)
);

ALTER TABLE public.category_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own category limits"
ON public.category_limits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own category limits"
ON public.category_limits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own category limits"
ON public.category_limits FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own category limits"
ON public.category_limits FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_category_limits_updated_at
BEFORE UPDATE ON public.category_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();