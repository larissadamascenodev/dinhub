-- Table to track daily login records for streak calculation
CREATE TABLE public.login_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  login_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, login_date)
);

ALTER TABLE public.login_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own login days"
  ON public.login_days FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own login days"
  ON public.login_days FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_login_days_user_date ON public.login_days (user_id, login_date DESC);