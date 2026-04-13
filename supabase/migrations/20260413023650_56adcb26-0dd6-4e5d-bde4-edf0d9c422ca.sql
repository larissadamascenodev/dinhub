
-- Remove OLD duplicate triggers (keeping only the trg_ prefixed ones from our latest migration)
DROP TRIGGER IF EXISTS trigger_sync_has_account ON public.accounts;
DROP TRIGGER IF EXISTS update_accounts_updated_at ON public.accounts;
DROP TRIGGER IF EXISTS update_category_limits_updated_at ON public.category_limits;
DROP TRIGGER IF EXISTS update_credit_cards_updated_at ON public.credit_cards;
DROP TRIGGER IF EXISTS update_custom_categories_updated_at ON public.custom_categories;
DROP TRIGGER IF EXISTS update_finance_events_updated_at ON public.finance_events;
DROP TRIGGER IF EXISTS trg_update_goal_amount ON public.goal_transactions;
DROP TRIGGER IF EXISTS trg_invoice_payment_update_balance ON public.invoice_payments;
DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON public.notification_settings;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS trg_auto_assign_account ON public.transactions;
DROP TRIGGER IF EXISTS trg_handle_credit_card_invoice ON public.transactions;
DROP TRIGGER IF EXISTS trg_handle_credit_card_invoice_delete ON public.transactions;
DROP TRIGGER IF EXISTS trg_update_account_balance ON public.transactions;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;
DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
