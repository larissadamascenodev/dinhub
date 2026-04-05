
-- Create table to track individual invoice payments
CREATE TABLE public.invoice_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own invoice payments"
ON public.invoice_payments
FOR ALL
USING (auth.uid() = user_id);

-- Backfill existing partial payments
INSERT INTO public.invoice_payments (invoice_id, user_id, account_id, amount, paid_at)
SELECT id, user_id, paid_from_account_id, paid_amount, COALESCE(paid_at, now())
FROM public.invoices
WHERE paid_amount > 0;
