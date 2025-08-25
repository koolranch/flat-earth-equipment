# Seeding Brand Fault Codes

## Prerequisites
- Environment variables set: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Tables exist: `fault_codes` (current structure)
- CSV files prepared in `data/faults/` directory

## Running the Seeder
```bash
npm run seed:faults
# or
tsx scripts/seed-faults.ts
```

This command:
1. **Deletes existing fault codes** per brand (replace-by-brand strategy)
2. **Re-inserts new data** from CSV files 
3. **Processes retrieval steps** (logged for now, will be stored when svc tables exist)

## CSV Format

### Fault Code Files (`data/faults/{brand}.csv`)
```csv
brand,model_pattern,code,title,meaning,severity,likely_causes,checks,fixes,provenance
jlg,E450%,223,Drive Enable Timeout,Controller detected no drive enable,fault,"low battery|loose drive connector","measure pack voltage|inspect drive contactor","charge battery|replace contactor","Starter set; verify with manual"
```

**Field Descriptions:**
- `brand` - Brand slug (jlg, genie, toyota, jcb, hyster)
- `model_pattern` - SQL LIKE pattern for model matching (can be blank for generic)
- `code` - Fault/error code as displayed on machine
- `title` - Short descriptive name
- `meaning` - What the fault indicates
- `severity` - fault, warn, stop, info
- `likely_causes` - Pipe-separated list of potential causes
- `checks` - Pipe-separated list of diagnostic steps
- `fixes` - Pipe-separated list of resolution steps
- `provenance` - Source attribution

### Retrieval Steps (`data/faults/retrieval.csv`)
```csv
brand,model_pattern,steps
jlg,,Key ON (no start), hold UP+DOWN 3s on platform; use DATA/ENTER to scroll codes.
jlg,E450%,From ground, press MENU then DIAG; read last 5 codes; note hours.
```

## Database Mapping

CSV fields map to `fault_codes` table as follows:
- `brand` → `brand_slug`
- `model_pattern` → `model_pattern`
- `code` → `code`
- `title` → `description`
- `meaning` → `solution`
- `severity` → `severity`
- `provenance` → `manual_reference`

## Verification

After seeding, verify the data:

```sql
-- Count by brand
SELECT brand_slug, COUNT(*) 
FROM fault_codes 
GROUP BY brand_slug 
ORDER BY brand_slug;

-- Sample records
SELECT brand_slug, code, description, severity 
FROM fault_codes 
LIMIT 10;

-- Check model patterns
SELECT DISTINCT brand_slug, model_pattern 
FROM fault_codes 
WHERE model_pattern IS NOT NULL 
ORDER BY brand_slug, model_pattern;
```

## Expected Results

The seeder should insert:
- **JLG**: 3 fault codes (E450%, ES%, generic)
- **Genie**: 3 fault codes (GS%, S%, generic)  
- **Toyota**: 3 fault codes (8F%, 7F%, generic)
- **JCB**: 3 fault codes (535%, 540%, generic)
- **Hyster**: 3 fault codes (H50%, J%N%, generic)

**Total**: 15 fault code records across 5 brands

## Troubleshooting

### Missing Environment Variables
```
Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY
```
**Fix**: Set variables in `.env.local`

### Table Does Not Exist
```
Error inserting fault codes: relation "fault_codes" does not exist
```
**Fix**: Run database migrations to create the `fault_codes` table

### Permission Denied
```
Error: insufficient permissions
```
**Fix**: Ensure `SUPABASE_SERVICE_ROLE_KEY` has write access to the `fault_codes` table

## Data Expansion

To add more fault codes:
1. **Edit existing CSV files** in `data/faults/`
2. **Add new brand files** following the naming convention
3. **Update retrieval steps** in `retrieval.csv`
4. **Re-run seeder**: `npm run seed:faults`

The replace-by-brand strategy ensures clean updates without duplicate data.
