-- Rollback: drop the order_id column and its partial index on seat_invites.
-- Safe because the column was added NULLABLE and has no backfill; dropping it
-- only loses the order linkage on rows that were created after the up migration.

DROP INDEX IF EXISTS public.seat_invites_order_id_idx;

ALTER TABLE public.seat_invites
  DROP COLUMN IF EXISTS order_id;
