# Phase 1 — GREEN Data Quality & View

This phase implements structured data guardrails for GREEN Series chargers and provides a clean view for optimal query performance.

## Overview

- **Database Migration**: Adds constraints and triggers to enforce data quality for GREEN chargers
- **GREEN View**: Creates `public.green_chargers` view with guaranteed structured specs
- **Feature Flag**: `USE_GREEN_VIEW=1` enables the API to use the optimized view
- **Backwards Compatible**: Falls back to `public.parts` table when flag is disabled

## Deploy the Migration

1. Ensure Supabase CLI is installed and linked to your project:
   ```bash
   supabase --version
   supabase status
   ```

2. Apply the migration:
   ```bash
   supabase db push
   ```
   This applies `supabase/migrations/20250812_green_data_quality.sql` to your database.

## Enable API to Use the GREEN View

Set environment variable `USE_GREEN_VIEW=1` (recommended):

**Local Development (.env.local)**:
```
USE_GREEN_VIEW=1
```

**Production (Vercel)**:
- Go to Project → Settings → Environment Variables
- Add `USE_GREEN_VIEW=1`
- Redeploy

If unset or set to `0`, API falls back to `public.parts` table with filtering.

## Quick SQL Sanity Checks

Run these in Supabase SQL editor to verify data quality:

### 1. Any GREEN rows missing specs?
```sql
SELECT slug, name, voltage, amperage, phase
FROM public.parts
WHERE (slug ILIKE 'green%' OR name ILIKE '%green%')
  AND category_slug = 'battery-chargers'
  AND (voltage IS NULL OR amperage IS NULL);
```

### 2. Phase-by-family rules violations?
```sql
SELECT slug, name, phase
FROM public.parts
WHERE slug ILIKE 'green%'
  AND category_slug = 'battery-chargers'
  AND ((slug ~* 'green(2|4)' AND phase <> '1P') 
       OR (slug ~* 'green(6|8|x)' AND phase <> '3P'));
```

### 3. View performance check
```sql
-- Count via view (should be fast)
SELECT COUNT(*) FROM public.green_chargers;

-- Sample data from view
SELECT slug, name, voltage, amperage, phase, specs_complete 
FROM public.green_chargers 
LIMIT 10;
```

### 4. Validate GREEN data helper
```sql
-- Check for any incomplete GREEN chargers
SELECT * FROM public.validate_green_charger_specs();
```

## API Testing

### Health Check (GET)
```bash
curl http://localhost:3000/api/recommend-chargers
```

Expected response includes:
```json
{
  "ok": true,
  "enabled": true,
  "dataSource": "green_chargers",
  "usingGreenView": true
}
```

### Recommendation Test (POST)
```bash
curl -X POST http://localhost:3000/api/recommend-chargers \
  -H "Content-Type: application/json" \
  -d '{"voltage": 36, "amps": 75, "phase": "1P"}'
```

Expected response includes structured voltage/amperage/phase in items.

### Fallback Test
Temporarily set `USE_GREEN_VIEW=0` and test again - should work with `dataSource: "parts"`.

## Data Quality Guarantees

With the migration applied:

1. **GREEN chargers** (slug contains 'green' or name contains 'green') in category 'battery-chargers' **must have**:
   - `voltage` (INTEGER)
   - `amperage` (INTEGER)
   - `phase` ('1P' or '3P')

2. **Phase rules enforced**:
   - GREEN2/4: Must be '1P' (single-phase)
   - GREEN6/8/X: Must be '3P' (three-phase)

3. **Non-GREEN products**: Remain unaffected (can have NULL values)

## Troubleshooting

### Trigger Blocks Updates
If you get an error like "GREEN chargers must have voltage and amperage", fill in the missing specs:

```sql
UPDATE public.parts 
SET voltage = 36, amperage = 75, phase = '1P'
WHERE slug = 'green2-problematic-slug';
```

### Performance Issues
Check if indexes are being used:

```sql
EXPLAIN ANALYZE 
SELECT * FROM public.green_chargers 
WHERE voltage = 36 AND amperage BETWEEN 70 AND 80;
```

### View Permissions
If getting permission errors:

```sql
GRANT SELECT ON public.green_chargers TO anon, authenticated;
```

## Next Steps

This sets the foundation for:
- Phase 2: Enhanced UI with better filtering and display
- Phase 3: Advanced matching algorithms using structured data
- Phase 4: Analytics and reporting on charger usage patterns