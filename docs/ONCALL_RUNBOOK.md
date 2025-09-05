# On-call Runbook

## Pager
- Primary: contact@flatearthequipment.com

## Triage Flow
1. Check `/api/health` (Prod). If 503, note which check fails.
2. Check Vercel logs for current deployment.
3. If DB issue, test Supabase status; consider failover content (study cards) still serve.
4. If auth outage, post status on site header.

## Quick Actions
- Rollback: redeploy previous successful build in Vercel
- Temporary freeze: disable invites (set `FEATURE_INVITES=false` env) and redeploy
- Backup now: POST `/api/admin/backup-now` (trainer/admin session)

## Escalation
- Security incident → rotate keys (`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`), invalidate sessions, announce.

## References
- Launch checklist: `docs/LAUNCH_CHECKLIST.md`
- Incident playbooks: `docs/INCIDENT_PLAYBOOKS.md`
