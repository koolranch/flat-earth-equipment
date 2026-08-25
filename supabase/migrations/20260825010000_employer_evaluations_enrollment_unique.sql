-- The trainer eval save/upsert APIs use ON CONFLICT (enrollment_id).
-- The table only had non-unique indexes, so every save failed with:
-- "there is no unique or exclusion constraint matching the ON CONFLICT specification".
-- Product model is one practical evaluation per enrollment (Re-evaluate overwrites).

ALTER TABLE public.employer_evaluations
  ADD CONSTRAINT employer_evaluations_enrollment_id_key UNIQUE (enrollment_id);
