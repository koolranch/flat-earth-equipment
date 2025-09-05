# Incident Playbooks

## Certificates not generating
**Symptoms:** No `pdf_url`, 500 on /api/certificates/issue
**Checks:** Storage bucket `certificates` perms; service logs
**Fix:** Retry issue; if failing, run /api/admin/backup-now, then redeploy

## Email delivery failing
**Symptoms:** Invite/notify endpoints return `email_failed`
**Checks:** RESEND_API_KEY set? Domain verified?
**Fix:** Switch to dryrun (env unset); export CSV and share manually

## DB slow / timeouts
**Symptoms:** >2s TTFB on training hub
**Checks:** Long queries; indexes present (see Phase 48 SQL)
**Fix:** Add/adjust indexes; increase revalidate time; move read endpoints to Edge anon

## Credential exposure
**Symptoms:** Scanner flags service key in client chunks
**Immediate:** Revoke key in Supabase; rotate env in Vercel; invalidate cache; re-run scanner
**Follow-up:** Ensure webpack alias + client stubs in place; add test in postbuild
