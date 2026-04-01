-- Drop existing triggers if any (to avoid conflicts)
DROP TRIGGER IF EXISTS trg_update_credit_card_limit ON public.transactions;
DROP TRIGGER IF EXISTS trg_generate_installments ON public.transactions;
DROP TRIGGER IF EXISTS trg_handle_credit_card_invoice ON public.transactions;
DROP TRIGGER IF EXISTS trg_update_account_balance ON public.transactions;
DROP TRIGGER IF EXISTS trg_sync_profile_has_transactions ON public.transactions;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;

-- 1. Credit card used_limit trigger
CREATE TRIGGER trg_update_credit_card_limit
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_credit_card_limit();

-- 2. Generate installment transactions trigger (AFTER INSERT only)
CREATE TRIGGER trg_generate_installments
AFTER INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.generate_installment_transactions();

-- 3. Handle credit card invoice items trigger
CREATE TRIGGER trg_handle_credit_card_invoice
AFTER INSERT OR UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.handle_credit_card_invoice();

-- 4. Update account balance trigger
CREATE TRIGGER trg_update_account_balance
BEFORE INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_account_balance();

-- 5. Sync profile has_transactions trigger
CREATE TRIGGER trg_sync_profile_has_transactions
AFTER INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_has_transactions();

-- 6. Updated_at trigger
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();