# Charger Modules — Status

**Last updated:** 2026-09-21  
**Active phase:** Phase 3 — win `6la20671` on Enersys SKU URL (**URL still sticky**; ACT 36 PN URL **regressed** hub)  
**Deployed SEO recovery:** `b18f77e3` (2026-07-07) live on production  
**Program commit:** Phases 1–4 code live; weekly rank monitor continues; Aug 10 de-cannibalize live; Aug 17–Sep 14 snapshots backfilled onto branch

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | SSR schema, SKU pages, duplicate 301, weekly automation + secrets tested |
| 1 Measurement | ✅ code | GA4 `view_item` / `add_to_cart` / `begin_checkout` + charger_* events; price ID list script |
| 2 Conversion | ✅ code | Sticky CTA on SKU, core deposit math above fold, PN links on hub, repair prepaid claim removed |
| 3 Win `6la20671` | 🔄 **partial** | Enersys SKU URL sticky (4th week) but rank #17→#28; `81063658r` **regressed** ACT 36 → hub |
| 4 Expand | ✅ partial | Hyster 4092995 linked from hub/SKU; fleet quote `generate_lead` event. **Paid ads deferred** until organic + conversion baseline |

## Rank snapshot (Google US) — 2026-09-21 DataForSEO

| Keyword | Sep 14 | Sep 21 | Winning URL | Notes |
|---------|------:|-------:|-------------|-------|
| `6la20671` | #17 | **#28** ↓ | `/charger-modules/enersys-6la20671` | **URL still Enersys SKU** (4th week); rank slip vs Radwell |
| `81063658r` | #2 | **#2** = | `/charger-modules` | **URL regress** — was ACT 36 SKU on Sep 14; back on hub |
| `81063577r` | API err | **#2** NEW | `/charger-modules/act-quantum-48vdc` | Recovered; canonical SKU URL |
| `81063578r` | #2 | **#2** = | `/charger-modules/act-quantum-80vdc` | Protect; canonical SKU URL |
| `act quantum charger module` | #29 | **out** LOST | — | Dropped from top 100 (was ACT 36) |
| `hawker charger module` | #45 | **out** LOST | — | Dropped from top 100 |
| `forklift battery charger module` | #75 | **out** LOST | — | Dropped (was `/battery-chargers`) |
| `forklift charger module repair` | API err | **#47** NEW | `/charger-modules` | Recovered on hub |
| `enersys battery charger` | out | out | — | Deprioritize (OEM-owned) |
| `hyster 4092995 charger` | #42 | API err | — | Internal SE Server Error (no retry; &lt;3 errors) |

Source: DataForSEO via `scripts/seo/charger-rank-check.ts` → `scripts/seo/rank-snapshots/charger/2026-09-21.json`.  
Prior compare: `2026-09-14.json` (restored from `origin/cursor/charger-modules-rank-status-f40b`; prior Monday STATUS PRs had not fully landed on `main`).  
**API errors:** 1 keyword (`hyster 4092995 charger`). Retry threshold is **more than 3** — no retry this week. Partial run for that one.

### Wins / losses / `6la20671` URL check

- **Wins:** `6la20671` **still lands on `/charger-modules/enersys-6la20671`** (not hub) for a 4th consecutive week; `81063577r` returns at **#2** on ACT 48 SKU; `81063578r` holds **#2**; repair head term recovers at **#47** on hub.
- **Losses / gaps:** `6la20671` rank slip #17→**#28**; `81063658r` URL flip **not sticky** (ACT 36 → hub); `act quantum charger module`, `hawker charger module`, and `forklift battery charger module` all **out**; Hyster unmeasured (API err).
- **`6la20671` landing URL:** **`/charger-modules/enersys-6la20671`** (Enersys SKU) — **not** the hub. Phase 3 primary URL goal still met; rank needs watching.

## Unit economics (confirmed by Christopher, 2026-08-23)

| Module | Sell | FSIP reman exchange cost | Gross unit profit* |
|--------|-----:|-------------------------:|-------------------:|
| 6LA20671 (Enersys + Hawker listings) | $749 single / $650 ea at qty 2 ($1,300) | **$526** | ~$183 single / ~$170–190 per 2-unit order |
| ACT Quantum 36VDC (81063658R) | $800 | **$513** | ~$247 |
| ACT Quantum 48VDC (81063577R) | $800 | **$513** | ~$247 |
| ACT Quantum 80VDC (81063578R) | $800 | **$513** | ~$247 |

\* After ~$30–50 assumed absorbed outbound freight (checkout adds no freight line on charger Buy Now; true-up from the first shipped order). Core charge ($350) is collect-and-refund — margin-neutral but adds per-order admin (collect deposit, chase core return, inspect, refund); budget ~$30/order of handling when comparing against drop-ship categories. Repair & Return service pricing is separate and not covered by these costs.

## Live pages

| URL | Role |
|-----|------|
| `/charger-modules` | Category hub + part-number index |
| `/charger-modules/enersys-6la20671` | Primary `6LA20671` page |
| `/charger-modules/hawker-6la20671` | Brand twin |
| `/charger-modules/act-quantum-{36,48,80}vdc` | ACT PNs |
| `/parts/hyster-remanufactured-24v-battery-charger-4092995` | Full reman charger (not module) |
| `/parts/battery-charger-modules` | 308 → hub |

## Open blockers / needs from Christopher

1. **GSC URL Inspection** on `/charger-modules/act-quantum-36vdc` (and optionally Enersys) to re-assert PN URL after `81063658r` hub regress.  
2. Optional: confirm last 90 days charger order revenue (Stripe filter via `npx tsx scripts/seo/charger-revenue-baseline.ts`) before any Phase 4 expand.  
3. Optional Phase 4b: Google Ads Search on proven PNs only — **do not launch** until GA4 purchase path is verified.  
4. Soft watch: brand/head-term losses (`hawker`, `act quantum`, battery-charger-module) — do not retarget without purchase evidence.

## Next action (exactly one — Phase 3)

**GSC URL Inspection / request indexing on `/charger-modules/act-quantum-36vdc`** so `81063658r` can reclaim the ACT 36 SKU URL (regressed to hub this week). Do not mark Phase 3 complete, do not expand keywords, do not deploy.

## Decision log

| Date | Decision |
|------|----------|
| 2026-07-07 | Ship SSR schema + SKU pages + duplicate 301 |
| 2026-07-27 | Formalize managed revenue program; weekly DataForSEO automation |
| 2026-07-27 | Do not chase `enersys battery charger` organically |
| 2026-07-27 | Proceed all phases: measurement + conversion + PN SEO + Hyster/fleet hooks; paid ads deferred |
| 2026-08-03 | `6la20671` still ranks hub; next = hub Product-schema de-cannibalization (Phase 3), not keyword expand |
| 2026-08-10 | `6la20671` still hub (#20); reaffirm hub Product-schema de-cannibalization; do not expand keywords yet |
| 2026-08-10 | Merge #11; ship hub ItemList-only schema + ACT `/parts`→SKU 301s + Enersys/Hawker legacy→SKU |
| 2026-08-17 | Hub ItemList-only confirmed live; `6la20671` still hub (#18); keep monitoring |
| 2026-08-31 | `6la20671` flips to Enersys SKU (#17); next = GSC inspect ACT 36V; confirm stickiness |
| 2026-09-07 | `6la20671` Enersys URL sticky at #17; `81063578r` back on canonical SKU; still chase `81063658r` hub→SKU via GSC |
| 2026-09-14 | `6la20671` Enersys sticky #17 (3rd week); `81063658r` flipped hub→ACT 36 SKU; next = confirm both sticky then close Phase 3 |
| 2026-09-21 | `6la20671` Enersys URL sticky #28 (4th week, rank slip); `81063658r` regressed to hub; next = GSC inspect ACT 36; Phase 3 not complete |
