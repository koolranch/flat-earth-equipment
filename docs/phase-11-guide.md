# Phase 11 — User Submissions, JSON-LD, and Tests

## SQL
- Run docs/phase-11-svc-suggestions.sql in Supabase.

## ENV (Vercel)
- INTERNAL_ADMIN_KEY = <random-strong-secret>

## Verify
- Brand hub shows a submission form and posts to /api/svc/submit.
- Admin list: GET /api/admin/svc/submissions with x-admin-key header.
- Moderate: POST /api/admin/svc/submissions/:id/moderate with {action}.
- JSON-LD present on Guide (FAQPage when Q&A exists) and retrieval (HowTo when steps exist).
- Playwright test passes for top brands.

## Usage

### Public Submissions
Users can submit tips via the form on any brand hub. Submissions go to `svc_user_suggestions` table with status 'new'.

### Admin Review
Access `/admin/service` to view submissions (requires auth in production). Use the moderation API:

```bash
# List submissions
curl -H "x-admin-key: $INTERNAL_ADMIN_KEY" \
  "https://your-domain.com/api/admin/svc/submissions?status=new"

# Approve a submission
curl -X POST -H "x-admin-key: $INTERNAL_ADMIN_KEY" \
  -H "content-type: application/json" \
  -d '{"action":"approve","actor":"admin","notes":"good tip"}' \
  "https://your-domain.com/api/admin/svc/submissions/123/moderate"
```

### JSON-LD
- **FAQPage**: Auto-generated when Q:/A: patterns found in guide content
- **HowTo**: Auto-generated when "Fault Workflow" sections with numbered steps found

### Tests
```bash
# Install Playwright (if needed)
npx playwright install

# Run tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui
```
