# Seeding Fault Codes

## Commands
- Full refresh (all brands):
```bash
pnpm seed:faults
```
- Single brand (example JLG):
```bash
pnpm seed:faults --brand=jlg
```
- Dry run (no DB writes):
```bash
pnpm seed:faults --dry-run
```

## Requirements
- Env vars set: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
- Tables exist: public.svc_fault_codes, public.svc_code_retrieval
- CSVs present in data/faults (e.g., jlg.csv, genie.csv, retrieval.csv)

## Behavior
- Replace-by-brand: deletes existing rows for the target brand(s) then inserts.
- Accepts '|' or ';' delimiters for list fields (likely_causes, checks, fixes).
- Skips missing files gracefully.
