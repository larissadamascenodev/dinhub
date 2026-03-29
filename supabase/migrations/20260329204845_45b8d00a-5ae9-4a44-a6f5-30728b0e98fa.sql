
CREATE TABLE public.recurring_exclusions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  month integer NOT NULL,
  year integer NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (transaction_id, month, year)
);

ALTER TABLE public.recurring_exclusions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own exclusions"
  ON public.recurring_exclusions
  FOR ALL
  TO public
  USING (auth.uid() = user_id);
