-- Soft-release for seat claims: when an operator leaves the company, the
-- trainer frees the seat (released_at set) without deleting any training
-- records (enrollments, certificates, evaluations all survive for OSHA
-- retention). Rehires re-activate the same row via the existing
-- UNIQUE(order_id, user_id) upsert in the claim flow.

ALTER TABLE public.seat_claims
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS released_by UUID;

COMMENT ON COLUMN public.seat_claims.released_at IS 'When the trainer freed this seat (operator departed). NULL = seat actively consumed.';
COMMENT ON COLUMN public.seat_claims.released_by IS 'Trainer user id who released the seat.';

CREATE INDEX IF NOT EXISTS idx_seat_claims_active
  ON public.seat_claims(order_id)
  WHERE released_at IS NULL;

-- Recreate the usage view so released seats no longer count against capacity.
DROP VIEW IF EXISTS public.v_order_seat_usage;

CREATE VIEW public.v_order_seat_usage AS
SELECT
  o.id as order_id,
  o.user_id as trainer_id,
  o.course_id,
  o.seats as total_seats,
  COALESCE(COUNT(sc.id) FILTER (WHERE sc.released_at IS NULL), 0)::INTEGER as claimed,
  (o.seats - COALESCE(COUNT(sc.id) FILTER (WHERE sc.released_at IS NULL), 0))::INTEGER as remaining
FROM public.orders o
LEFT JOIN public.seat_claims sc ON sc.order_id = o.id
GROUP BY o.id, o.user_id, o.course_id, o.seats;

COMMENT ON VIEW public.v_order_seat_usage IS 'Seat usage per order for the trainer dashboard; released (freed) seats do not count against capacity';

GRANT SELECT ON public.v_order_seat_usage TO authenticated, service_role;
