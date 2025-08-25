# Fault CSV format

Create two CSVs per brand in this folder:

- `<brand>.csv` — fault codes
- `retrieval-<brand>.csv` — how to retrieve/read codes

## faults CSV headers
brand,code,title,description,common_causes,steps,system,controller,models,severity,source,last_verified

- common_causes: pipe- or semicolon-separated list
- steps: pipe- or semicolon-separated list
- models: pipe- or semicolon-separated list
- severity: info|warning|critical
- last_verified: YYYY-MM-DD

## retrieval CSV headers
brand,method,steps,notes,source,last_verified

Run seeder:

```bash
pnpm tsx scripts/seedFaultCodes.ts --brand=jlg
# or replace all brands found in data/faults
pnpm tsx scripts/seedFaultCodes.ts --brand=all
# validate without writing
pnpm tsx scripts/seedFaultCodes.ts --brand=genie --validate-only
```
