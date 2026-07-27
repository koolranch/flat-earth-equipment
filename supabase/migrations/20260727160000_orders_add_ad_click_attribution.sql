-- Persist Google Ads click ids + safety funnel state on orders for ROAS attribution.
-- Sourced from Stripe Checkout Session metadata (gclid/gbraid/wbraid/funnel_state).
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS gclid text,
  ADD COLUMN IF NOT EXISTS gbraid text,
  ADD COLUMN IF NOT EXISTS wbraid text,
  ADD COLUMN IF NOT EXISTS funnel_state text;

COMMENT ON COLUMN public.orders.gclid IS 'Google Ads gclid from Stripe Checkout Session metadata';
COMMENT ON COLUMN public.orders.gbraid IS 'Google Ads gbraid (iOS) from Stripe Checkout Session metadata';
COMMENT ON COLUMN public.orders.wbraid IS 'Google Ads wbraid (web-to-app) from Stripe Checkout Session metadata';
COMMENT ON COLUMN public.orders.funnel_state IS 'Safety LP state code (e.g. oh, tx) from checkout metadata';

CREATE INDEX IF NOT EXISTS orders_gclid_idx ON public.orders (gclid) WHERE gclid IS NOT NULL;
