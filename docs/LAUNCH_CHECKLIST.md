# Flat Earth Safety — Launch Checklist

## Blocking
- [ ] `npm run go:preflight` passes
- [ ] `/api/health` returns `{ ok: true }` in Prod
- [ ] Trainer can: purchase seats → send invites → learner claims → completes → certificate issued
- [ ] Certificates PDF writes to Storage and appears on **/records** with `pdf_url`

## Compliance
- [ ] OSHA §1910.178(l) elements present; employer evaluation flow live
- [ ] Records export CSV works; audit logs enabled

## Content & i18n
- [ ] EN complete; ES parity acceptable for public UI
- [ ] Study cards & quests show in both locales or fall back to EN

## Perf & Security
- [ ] Edge cache working on `/api/quests/*`; trainer APIs are `no-store`
- [ ] Postbuild security scanner enabled and green

## Monitoring
- [ ] SENTRY_DSN set (optional)
- [ ] Uptime checks hitting `/api/health`

## Rollback
- [ ] Previous build + DB backup available
- [ ] On-call notified, incident playbooks handy
