ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_paid_from_account_id_fkey;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_paid_from_account_id_fkey
  FOREIGN KEY (paid_from_account_id) REFERENCES public.accounts(id) ON DELETE SET NULL;

ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_to_account_id_fkey;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_to_account_id_fkey
  FOREIGN KEY (to_account_id) REFERENCES public.accounts(id) ON DELETE SET NULL;