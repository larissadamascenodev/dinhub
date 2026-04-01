
-- Add paid_amount column to track cumulative payments
ALTER TABLE public.invoices ADD COLUMN paid_amount numeric NOT NULL DEFAULT 0;

-- Update existing paid invoices to set paid_amount = total_amount
UPDATE public.invoices SET paid_amount = total_amount WHERE is_paid = true;

-- Create/replace recalc function to also reopen invoice if needed
CREATE OR REPLACE FUNCTION public.recalc_invoice_total(p_invoice_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_new_total numeric;
  v_paid_amount numeric;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_new_total
  FROM public.invoice_items WHERE invoice_id = p_invoice_id;

  SELECT paid_amount INTO v_paid_amount
  FROM public.invoices WHERE id = p_invoice_id;

  UPDATE public.invoices
  SET total_amount = v_new_total,
      is_paid = CASE WHEN v_new_total <= COALESCE(v_paid_amount, 0) THEN true ELSE false END
  WHERE id = p_invoice_id;
END;
$function$;
