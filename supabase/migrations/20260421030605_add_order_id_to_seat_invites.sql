-- Add order_id to seat_invites so we can trace invites back to the paying order
-- (also unblocks app/api/trainer/seat-invites/bulk/route.ts which already writes this column)

ALTER TABLE public.seat_invites
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS seat_invites_order_id_idx
  ON public.seat_invites(order_id)
  WHERE order_id IS NOT NULL;

-- No backfill: existing rows retain NULL, which is fine. order_id is nullable so the
-- existing trainer-dashboard manual-invite path (which does NOT set order_id) is unaffected.
