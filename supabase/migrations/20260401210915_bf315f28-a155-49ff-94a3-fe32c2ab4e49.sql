
ALTER TABLE public.accounts
  ADD COLUMN investment_type text DEFAULT NULL,
  ADD COLUMN annual_rate numeric DEFAULT NULL,
  ADD COLUMN rate_type text DEFAULT NULL;

COMMENT ON COLUMN public.accounts.investment_type IS 'Tipo do investimento: cdb, lci, lca, tesouro_selic, poupanca, fundo, caixinha, outro';
COMMENT ON COLUMN public.accounts.annual_rate IS 'Taxa: ex 115 para 115% CDI, ou 12.5 para 12.5% a.a.';
COMMENT ON COLUMN public.accounts.rate_type IS 'percent_cdi, fixed_annual, cdi_plus';
