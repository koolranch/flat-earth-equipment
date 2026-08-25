-- trg_employer_evals_touch calls tg_touch_updated_at() on UPDATE,
-- but employer_evaluations never had an updated_at column. Re-evaluate
-- (upsert conflict) would fail after the unique constraint was added.

ALTER TABLE public.employer_evaluations
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
