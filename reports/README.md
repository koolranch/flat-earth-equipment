# Recommendation Audit — How to Run

**Note: The audits now run GREEN Series only by default (GREEN2/4/6/8/X). Non-GREEN chargers are filtered out.**

## 1) Coverage audit (catalog sanity)
```bash
TS_NODE_TRANSPILE_ONLY=1 ts-node scripts/audit/recs_coverage.ts
```
- See console for bucket counts and anomalies.
- Open `reports/recs_coverage.csv` and scan for missing voltage/current/phase.

## 2) Scenario batch test (user inputs → recs)
```bash
BASE_URL=https://YOUR_DOMAIN TS_NODE_TRANSPILE_ONLY=1 ts-node scripts/audit/recs_scenarios.ts
```
- Produces `reports/recs_scenarios.csv` with Best/Alt counts and top reasons.

## 3) One‑click export (browser)
- Visit: `/api/debug/recs/export` (downloads `recs_export.csv`).

## What to share back for review
- Paste the *first 20 lines* of each CSV, + the **bucket histogram** from step 1.
- Note any rows where Best=0 but Alt>0 for common cases (36V/48V overnight, 1P).
- Flag anomalies (e.g., GREEN2 showing 3P).

## Quick Local Test
```bash
# Test locally first
RECS_ENABLED=1 RECS_AMP_TOLERANCE_PCT=15 npm run dev

# Then run coverage audit
TS_NODE_TRANSPILE_ONLY=1 ts-node scripts/audit/recs_coverage.ts

# Then run scenarios (make sure dev server is running)
BASE_URL=http://localhost:3000 TS_NODE_TRANSPILE_ONLY=1 ts-node scripts/audit/recs_scenarios.ts
```

## Expected Outputs
- `reports/recs_coverage.csv` - GREEN Series products only with parsed specs and bucket analysis
- `reports/recs_scenarios.csv` - Test results for all voltage/speed/phase combinations (GREEN Series only)
- Console output with bucket histogram and anomaly counts for GREEN Series chargers

## GREEN Series Filtering
All audit tools now automatically filter to show only FSIP GREEN Series chargers:
- GREEN2 (1P low-current chargers)
- GREEN4 (1P mid-current chargers) 
- GREEN6 (3P high-current chargers)
- GREEN8 (3P industrial chargers)
- GREENX (3P maximum-power chargers)

This excludes PowerWise, Hyster, EZGO, Club Car, and other brand-specific chargers.

## Structured Fields Rollout (GREEN Series Only)

The recommendation system now uses structured database fields instead of regex parsing for better performance and accuracy.

### Migration Steps

1. **Run SQL Migration**
   Execute `sql/parts_add_charger_specs.sql` in Supabase SQL editor to add voltage, amperage, and phase columns.

2. **Backfill GREEN Series Specs**
   ```bash
   TS_NODE_TRANSPILE_ONLY=1 ts-node scripts/backfill/specs_backfill_green.ts
   ```
   This parses specs from text fields and populates the structured columns for GREEN chargers only.

3. **Verify Results**
   ```bash
   TS_NODE_TRANSPILE_ONLY=1 ts-node scripts/audit/recs_verify_after_backfill.ts
   ```
   Shows completion stats and any items needing manual attention.

4. **Re-run Audits**
   ```bash
   # Coverage audit (now uses structured fields)
   TS_NODE_TRANSPILE_ONLY=1 ts-node scripts/audit/recs_coverage.ts
   
   # Scenarios test (should see improved accuracy)
   BASE_URL=http://localhost:3000 TS_NODE_TRANSPILE_ONLY=1 ts-node scripts/audit/recs_scenarios.ts
   ```

### Benefits

- **Performance**: No regex parsing for products with structured specs
- **Accuracy**: Explicit voltage/amperage/phase values vs text parsing
- **Maintainability**: Easy to update specs via database instead of slug changes
- **Backwards Compatible**: Falls back to parsing for missing structured fields

### Database Schema

```sql
ALTER TABLE public.parts
  ADD COLUMN voltage INTEGER NULL,
  ADD COLUMN amperage INTEGER NULL,
  ADD COLUMN phase TEXT NULL CHECK (phase IN ('1P','3P') OR phase IS NULL);
```

Non-charger products remain unaffected (NULL values).
