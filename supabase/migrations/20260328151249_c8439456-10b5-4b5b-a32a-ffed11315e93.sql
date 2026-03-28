ALTER TABLE public.transactions ADD COLUMN status text NOT NULL DEFAULT 'pago';

-- Update existing transactions: if date is in the future, mark as pendente
UPDATE public.transactions SET status = 'pendente' WHERE date > CURRENT_DATE;