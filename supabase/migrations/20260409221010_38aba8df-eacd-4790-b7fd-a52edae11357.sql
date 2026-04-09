
-- Challenges catalog (system suggestions + user-created)
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_days INT NOT NULL DEFAULT 7,
  difficulty TEXT NOT NULL DEFAULT 'facil',
  potential_savings NUMERIC NOT NULL DEFAULT 0,
  cover_image TEXT,
  icon TEXT DEFAULT '🎯',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view system challenges and their own"
ON public.challenges FOR SELECT TO authenticated
USING (is_system = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own challenges"
ON public.challenges FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges"
ON public.challenges FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenges"
ON public.challenges FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- User accepted challenges
CREATE TABLE public.user_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  progress INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accepted challenges"
ON public.user_challenges FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can accept challenges"
ON public.user_challenges FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accepted challenges"
ON public.user_challenges FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accepted challenges"
ON public.user_challenges FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Daily check-ins
CREATE TABLE public.challenge_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_challenge_id UUID NOT NULL REFERENCES public.user_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_challenge_id, checkin_date)
);

ALTER TABLE public.challenge_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own checkins"
ON public.challenge_checkins FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checkins"
ON public.challenge_checkins FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checkins"
ON public.challenge_checkins FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Seed system challenges
INSERT INTO public.challenges (name, description, duration_days, difficulty, potential_savings, icon, is_system, cover_image) VALUES
('Semana Sem Delivery', 'Passe 7 dias sem pedir comida por aplicativos. Cozinhe em casa e economize!', 7, 'facil', 150, '🍔', true, null),
('30 Dias Sem Compras por Impulso', 'Espere 48h antes de qualquer compra não essencial acima de R$50.', 30, 'medio', 300, '🛍️', true, null),
('Café de Casa por 15 Dias', 'Prepare seu café em casa ao invés de comprar na rua. Pequenos gastos somam!', 15, 'facil', 120, '☕', true, null),
('Transporte Consciente por 15 Dias', 'Prefira transporte público, bicicleta ou caminhada sempre que possível.', 15, 'medio', 180, '🚌', true, null),
('Semana Sem Streaming Extra', 'Cancele ou pause assinaturas de streaming que você não usa todos os dias.', 7, 'facil', 80, '📺', true, null),
('30 Dias de Almoço em Casa', 'Leve marmita ou almoce em casa durante 30 dias seguidos.', 30, 'dificil', 450, '🍱', true, null);
