
-- Fix search_path on get_invoice_period
CREATE OR REPLACE FUNCTION public.get_invoice_period(
  p_purchase_date date,
  p_closing_day integer
)
RETURNS TABLE(inv_month integer, inv_year integer)
LANGUAGE plpgsql IMMUTABLE
SET search_path TO 'public'
AS $function$
DECLARE
  d_day integer;
  d_month integer;
  d_year integer;
BEGIN
  d_day := EXTRACT(DAY FROM p_purchase_date);
  d_month := EXTRACT(MONTH FROM p_purchase_date);
  d_year := EXTRACT(YEAR FROM p_purchase_date);

  IF d_day > p_closing_day THEN
    IF d_month = 12 THEN
      inv_month := 1;
      inv_year := d_year + 1;
    ELSE
      inv_month := d_month + 1;
      inv_year := d_year;
    END IF;
  ELSE
    inv_month := d_month;
    inv_year := d_year;
  END IF;

  RETURN NEXT;
END;
$function$;
