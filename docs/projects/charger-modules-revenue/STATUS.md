# Charger Modules — Status

**Last updated:** 2026-07-27  
**Active phase:** Phase 0 → Phase 1  
**Deployed SEO recovery:** `b18f77e3` (2026-07-07) live on production

## Rank snapshot (Google US)

| Keyword | Jul 1 | Jul 27 | Winning URL | Notes |
|---------|------:|-------:|-------------|-------|
| `6la20671` | #23 | **#18** ↑ | `/charger-modules` | Goal: Enersys SKU URL |
| `81063658r` | — | **#1** | `/charger-modules/act-quantum-36vdc` | Protect |
| `81063577r` | — | **#2** | `/charger-modules/act-quantum-48vdc` | Protect |
| `act quantum charger module` | — | **#29** | `/charger-modules/act-quantum-80vdc` | |
| `hawker charger module` | — | **#45** | `/charger-modules/hawker-6la20671` | |
| `forklift battery charger module` | out | **#73** | `/charger-modules` | |
| `enersys battery charger` | — | out | — | Deprioritize |
| `forklift charger module repair` | #45 | API error | — | Retry next run |
| `hyster 4092995 charger` | #52 | API error | — | Retry next run |

Source: DataForSEO live SERP via `scripts/seo/charger-rank-check.ts`.

## Live pages

| URL | HTTP | Role |
|-----|------|------|
| `/charger-modules` | 200 | Category hub |
| `/charger-modules/enersys-6la20671` | 200 | Primary PN page |
| `/charger-modules/hawker-6la20671` | 200 | Brand twin |
| `/charger-modules/act-quantum-{36,48,80}vdc` | 200 | ACT PNs (#1/#2) |
| `/parts/battery-charger-modules` | 308 → hub | Duplicate retired |

## Open blockers / needs from Christopher

1. Confirm whether Repair & Return includes a **prepaid return label** (copy accuracy).  
2. Optional: last 90 days charger module order count/revenue from Stripe (or approve agent to query Stripe MCP).  
3. Approve weekly Cursor Automation after draft review.  
4. Approve deploys for Phase 2–3 code changes when ready.

## Next actions (agent-owned)

1. Commit project docs + snapshot writer.  
2. Stand up weekly rank monitor automation.  
3. After first clean weekly run: start Phase 1 tracking (GA4/checkout attribution).  
4. Phase 2 conversion polish once measurement baseline exists (or sooner if traffic already converting).

## Decision log

| Date | Decision |
|------|----------|
| 2026-07-07 | Ship SSR schema + SKU pages + duplicate 301 |
| 2026-07-27 | Formalize as managed revenue program; measure before more content |
| 2026-07-27 | Do not chase `enersys battery charger` organically |
