-- Add new columns to transactions for payment method, recurrence, and installments
ALTER TABLE public.transactions ADD COLUMN payment_method text NOT NULL DEFAULT 'conta';
ALTER TABLE public.transactions ADD COLUMN recurrence_type text NOT NULL DEFAULT 'unica';
ALTER TABLE public.transactions ADD COLUMN installments integer;
ALTER TABLE public.transactions ADD COLUMN observation text;