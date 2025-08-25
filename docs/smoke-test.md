# Brand Hub Smoke Test

## Prerequisites
- Environment variables set: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SITE_URL` (optional)
- App running locally (`pnpm dev`) or deployed (set SITE_URL to Vercel domain)
- (Optional) Seed fault codes first: `pnpm seed:faults`

## Running Tests
```bash
npm run test:smoke
# or
tsx scripts/smoke-test.ts
```

## What It Checks

### 🔌 API Endpoints
- **`/api/brands/jlg`** - Verifies brand data payload structure and required fields
- **`/api/fault-codes/search`** - Tests fault code search (warns if not seeded)
- **`/api/leads/parts`** - Comprehensive lead flow testing

### 🛡️ Anti-Spam Protection
- **Honeypot filter** - Submissions with filled `hp` field are silently blocked
- **Dwell-time guard** - Submissions under 3 seconds are silently blocked  
- **Valid submissions** - Proper leads (>=3s dwell, no honeypot) insert into database

### 📄 Page Health
- **`/brands`** - Main brand directory renders correctly
- **`/jlg-serial-number-lookup`** - Serial lookup page shows BrandHubBanner
- **`/brand/jlg`** - Brand hub page renders with expected content

### 🗄️ Database Integration
- Uses Supabase service role to verify RLS-protected `parts_leads` table
- Counts records before/after operations to ensure spam protection works
- Tests actual database writes for valid submissions

## Expected Output
```
🔍 Running smoke tests against: http://localhost:3000

✓ /api/brands/jlg
✓ fault search returned 3 row(s)
✓ honeypot submission blocked (no insert)
✓ dwell-time guard working (no insert under 3s)
✓ valid lead inserted
✓ /brands renders
✓ BrandHubBanner visible on JLG serial page
✓ /brand/jlg renders with expected content

✅ All smoke checks completed successfully!
```

## Troubleshooting

### Missing Environment Variables
```
Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY
```
**Fix**: Set environment variables in `.env.local`

### Fault Codes Not Found
```
⚠︎ Fault results empty — likely not seeded yet. Run: pnpm seed:faults
```
**Fix**: Run `pnpm seed:faults` to populate test data

### Brand Hub Not Loading
```
⚠︎ /brand/jlg not ok — may need database seeding
```
**Fix**: Ensure the `brands` table is populated (run SQL from Phase 1)

### BrandHubBanner Missing
```
⚠︎ BrandHubBanner text not found — verify banner injection
```
**Fix**: Check that banner component is properly imported and rendered

## Development Workflow
1. **Make changes** to brand hub functionality
2. **Run smoke test** to verify nothing broke
3. **Deploy** with confidence knowing core flows work
4. **Run against production** by setting `SITE_URL=https://yoursite.com`

This test suite provides fast, reliable validation of the entire brand hub system in under 10 seconds.
