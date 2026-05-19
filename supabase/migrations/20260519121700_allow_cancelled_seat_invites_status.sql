-- Allow managers/trainers to cancel unclaimed seat invitations.
-- Existing application code writes status = 'cancelled'; this makes the
-- database constraint match that production behavior.

ALTER TABLE public.seat_invites
  DROP CONSTRAINT IF EXISTS seat_invites_status_check;

ALTER TABLE public.seat_invites
  ADD CONSTRAINT seat_invites_status_check
  CHECK (status IN ('pending', 'sent', 'claimed', 'failed', 'expired', 'cancelled'));
