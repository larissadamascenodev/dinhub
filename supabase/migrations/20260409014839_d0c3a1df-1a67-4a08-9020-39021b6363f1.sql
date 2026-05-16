
-- Generate missing installment children for Consórcio (id: 3a444df9-1dee-4ce1-af5d-d55f3df17c3c)
-- Parent: installment 1/12, date 2026-04-10, amount 293.57, category Investimento, payment_method conta
-- Need to create installments 2 through 12

DO $$
DECLARE
  v_parent_id uuid := '3a444df9-1dee-4ce1-af5d-d55f3df17c3c';
  v_user_id uuid := 'bb08db8b-a12c-4097-8c2a-3ce175e58f35';
  v_account_id uuid := '780cc946-44e3-4b20-b616-9303e3727b4b';
  v_base_date date := '2026-04-10';
  i integer;
  v_target_date date;
BEGIN
  -- Temporarily disable the generate_installments trigger to avoid recursion
  ALTER TABLE public.transactions DISABLE TRIGGER trg_generate_installments;
  ALTER TABLE public.transactions DISABLE TRIGGER trg_handle_credit_card_invoice;

  FOR i IN 2..12 LOOP
    v_target_date := (v_base_date + ((i - 1) * INTERVAL '1 month'))::date;

    INSERT INTO public.transactions (
      user_id, name, category, date, amount, type,
      status, payment_method, recurrence_type, installments,
      installment_current, credit_card_id, account_id,
      parent_transaction_id
    ) VALUES (
      v_user_id, 'Consórcio', 'Investimento', v_target_date, 293.57, 'despesa',
      'pendente', 'conta', 'parcelado', 12,
      i, NULL, v_account_id,
      v_parent_id
    );
  END LOOP;

  -- Re-enable triggers
  ALTER TABLE public.transactions ENABLE TRIGGER trg_generate_installments;
  ALTER TABLE public.transactions ENABLE TRIGGER trg_handle_credit_card_invoice;
END $$;
