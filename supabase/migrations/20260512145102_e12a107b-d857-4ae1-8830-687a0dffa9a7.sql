-- Harden search_path
ALTER FUNCTION public.handle_subscription_update() SET search_path = public;

-- Revoke execute from public
REVOKE EXECUTE ON FUNCTION public.handle_subscription_update() FROM PUBLIC, anon;
