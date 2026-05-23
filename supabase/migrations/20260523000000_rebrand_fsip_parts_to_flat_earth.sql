-- Customer-facing rebrand only: parts catalog rows previously labeled FSIP.
-- Does not touch training, enrollments, orders, or any OSHA tables.

UPDATE parts
SET
  brand = 'Flat Earth Equipment',
  description = regexp_replace(
    description,
    '\s*GREEN Series by FSIP\.?',
    '.',
    'gi'
  ),
  updated_at = NOW()
WHERE brand ILIKE 'FSIP';
