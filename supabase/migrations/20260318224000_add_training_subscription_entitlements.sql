-- Add additive subscription lifecycle fields for annual training plans.
-- Safe: only adds columns/indexes and a nullable order reference on seat_invites.

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS is_unlimited BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS subscription_status TEXT;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_subscription_id_unique
ON public.orders (stripe_subscription_id)
WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_unlimited_current_period_end
ON public.orders (is_unlimited, current_period_end);

ALTER TABLE public.seat_invites
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_seat_invites_order_id
ON public.seat_invites(order_id)
WHERE order_id IS NOT NULL;

-- Backfill only rows already linked to a Stripe subscription.
UPDATE public.orders
SET is_unlimited = TRUE
WHERE stripe_subscription_id IS NOT NULL
  AND is_unlimited = FALSE;
