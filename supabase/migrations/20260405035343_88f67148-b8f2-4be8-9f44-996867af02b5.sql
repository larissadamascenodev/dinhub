-- Drop all existing triggers first to avoid conflicts
DROP TRIGGER IF EXISTS trg_update_account_balance ON public.transactions;
DROP TRIGGER IF EXISTS trg_handle_credit_card_invoice ON public.transactions;
DROP TRIGGER IF EXISTS trg_handle_credit_card_invoice_delete ON public.transactions;
DROP TRIGGER IF EXISTS trg_generate_installments ON public.transactions;
DROP TRIGGER IF EXISTS trg_sync_profile_has_transactions ON public.transactions;
DROP TRIGGER IF EXISTS trg_sync_profile_has_account ON public.accounts;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
DROP TRIGGER IF EXISTS update_accounts_updated_at ON public.accounts;
DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
DROP TRIGGER IF EXISTS update_credit_cards_updated_at ON public.credit_cards;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_custom_categories_updated_at ON public.custom_categories;

-- Re-create all triggers
CREATE TRIGGER trg_update_account_balance
BEFORE INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_account_balance();

CREATE TRIGGER trg_handle_credit_card_invoice
AFTER INSERT OR UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.handle_credit_card_invoice();

CREATE TRIGGER trg_handle_credit_card_invoice_delete
BEFORE DELETE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.handle_credit_card_invoice_delete();

CREATE TRIGGER trg_generate_installments
AFTER INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.generate_installment_transactions();

CREATE TRIGGER trg_sync_profile_has_transactions
AFTER INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_has_transactions();

CREATE TRIGGER trg_sync_profile_has_account
AFTER INSERT OR DELETE ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_has_account();

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credit_cards_updated_at
BEFORE UPDATE ON public.credit_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_categories_updated_at
BEFORE UPDATE ON public.custom_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();