
DROP TRIGGER IF EXISTS trigger_generate_installments ON public.transactions;
CREATE TRIGGER trigger_generate_installments
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION generate_installment_transactions();
