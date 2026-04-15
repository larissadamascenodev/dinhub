
-- Table to persist monthly health scores for historical tracking
CREATE TABLE public.health_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  month integer NOT NULL,
  year integer NOT NULL,
  score integer NOT NULL DEFAULT 0,
  level text NOT NULL DEFAULT 'amarelo',
  factors jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, month, year)
);

-- Enable RLS
ALTER TABLE public.health_scores ENABLE ROW LEVEL SECURITY;

-- Users can only access their own scores
CREATE POLICY "Users can view their own health scores"
  ON public.health_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health scores"
  ON public.health_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health scores"
  ON public.health_scores FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-update timestamp
CREATE TRIGGER update_health_scores_updated_at
  BEFORE UPDATE ON public.health_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookups
CREATE INDEX idx_health_scores_user_month ON public.health_scores (user_id, year, month);
