
-- Drop all existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS trg_update_account_balance_on_transaction ON public.transactions;
DROP TRIGGER IF EXISTS trg_update_account_balance_on_invoice_payment ON public.invoice_payments;
DROP TRIGGER IF EXISTS trg_handle_cc_invoice_delete ON public.transactions;
DROP TRIGGER IF EXISTS trg_handle_cc_invoice ON public.transactions;
DROP TRIGGER IF EXISTS trg_update_credit_card_limit ON public.transactions;
DROP TRIGGER IF EXISTS trg_auto_assign_default_account ON public.transactions;
DROP TRIGGER IF EXISTS trg_generate_installments ON public.transactions;
DROP TRIGGER IF EXISTS trg_sync_profile_has_transactions ON public.transactions;
DROP TRIGGER IF EXISTS trg_sync_profile_has_account ON public.accounts;
DROP TRIGGER IF EXISTS trg_update_goal_current_amount ON public.goal_transactions;
DROP TRIGGER IF EXISTS trg_updated_at_transactions ON public.transactions;
DROP TRIGGER IF EXISTS trg_updated_at_accounts ON public.accounts;
DROP TRIGGER IF EXISTS trg_updated_at_invoices ON public.invoices;
DROP TRIGGER IF EXISTS trg_updated_at_credit_cards ON public.credit_cards;

-- 1. Account balance on transaction changes
CREATE TRIGGER trg_update_account_balance_on_transaction
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_account_balance();

-- 2. Account balance on invoice payment changes
CREATE TRIGGER trg_update_account_balance_on_invoice_payment
AFTER INSERT OR UPDATE OR DELETE ON public.invoice_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_account_balance();

-- 3. Credit card invoice items on DELETE (BEFORE so we can read items)
CREATE TRIGGER trg_handle_cc_invoice_delete
BEFORE DELETE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.handle_credit_card_invoice_delete();

-- 4. Credit card invoice items on INSERT/UPDATE
CREATE TRIGGER trg_handle_cc_invoice
AFTER INSERT OR UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.handle_credit_card_invoice();

-- 5. Credit card used limit
CREATE TRIGGER trg_update_credit_card_limit
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_credit_card_limit();

-- 6. Auto-assign default account
CREATE TRIGGER trg_auto_assign_default_account
BEFORE INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_default_account();

-- 7. Generate installment transactions
CREATE TRIGGER trg_generate_installments
AFTER INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.generate_installment_transactions();

-- 8. Sync profile has_transactions
CREATE TRIGGER trg_sync_profile_has_transactions
AFTER INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_has_transactions();

-- 9. Sync profile has_account
CREATE TRIGGER trg_sync_profile_has_account
AFTER INSERT OR DELETE ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_has_account();

-- 10. Goal current amount
CREATE TRIGGER trg_update_goal_current_amount
AFTER INSERT OR DELETE ON public.goal_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_goal_current_amount();

-- 11. Updated_at timestamps
CREATE TRIGGER trg_updated_at_transactions
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_updated_at_accounts
BEFORE UPDATE ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_updated_at_invoices
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_updated_at_credit_cards
BEFORE UPDATE ON public.credit_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
