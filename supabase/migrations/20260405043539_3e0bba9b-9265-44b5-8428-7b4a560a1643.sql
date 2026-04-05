CREATE OR REPLACE FUNCTION public.recalc_credit_card_used_limit(p_credit_card_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_total numeric;
BEGIN
  SELECT COALESCE(
    SUM(GREATEST(inv.total_amount - COALESCE(inv.paid_amount, 0), 0)),
    0
  ) INTO v_total
  FROM public.invoices inv
  WHERE inv.credit_card_id = p_credit_card_id
    AND inv.is_paid = false;

  UPDATE public.credit_cards
  SET used_limit = v_total
  WHERE id = p_credit_card_id;
END;
$function$;