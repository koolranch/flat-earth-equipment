# Charger Modules — Status

**Last updated:** 2026-08-31  
**Active phase:** Phase 3 — win `6la20671` on Enersys SKU URL (**URL flip achieved**; confirm stickiness)  
**Deployed SEO recovery:** `b18f77e3` (2026-07-07) live on production  
**Program commit:** Phases 1–4 code live; weekly rank monitor continues; Aug 10 de-cannibalize live; Aug 17 STATUS was PR-only (now backfilled)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | SSR schema, SKU pages, duplicate 301, weekly automation + secrets tested |
| 1 Measurement | ✅ code | GA4 `view_item` / `add_to_cart` / `begin_checkout` + charger_* events; price ID list script |
| 2 Conversion | ✅ code | Sticky CTA on SKU, core deposit math above fold, PN links on hub, repair prepaid claim removed |
| 3 Win `6la20671` | 🔄 **URL flip** | Hub ItemList-only live; `6la20671` now wins on `/charger-modules/enersys-6la20671` (#17) — confirm stickiness next week |
| 4 Expand | ✅ partial | Hyster 4092995 linked from hub/SKU; fleet quote `generate_lead` event. **Paid ads deferred** until organic + conversion baseline |

## Rank snapshot (Google US) — 2026-08-31 DataForSEO

| Keyword | Aug 17 | Aug 31 | Winning URL | Notes |
|---------|------:|-------:|-------------|-------|
| `6la20671` | #18 | **#17** ↑ | `/charger-modules/enersys-6la20671` | **Phase 3 URL flip** — was hub on Aug 17 |
| `81063658r` | API err | **#2** NEW | `/charger-modules` | Rank strong; **still hub, not** `/charger-modules/act-quantum-36vdc` |
| `81063577r` | #2 | **#2** = | `/charger-modules/act-quantum-48vdc` | Protect; canonical SKU URL |
| `81063578r` | #2 | **#2** = | `/parts/act-quantum-80vdc-repair` | Rank holds; URL regress to legacy `/parts` (was canonical SKU on Aug 17) |
| `act quantum charger module` | #41 | **out** LOST | — | Dropped from top 100 again |
| `hawker charger module` | #48 | **#42** ↑ | `/charger-modules` | Rank win; URL drifted off Hawker SKU onto hub |
| `forklift battery charger module` | #75 | **#113** ↓ | `/charger-modules` | Soft out-of-top-100; URL back on hub (was `/battery-chargers`) |
| `forklift charger module repair` | API err | API err | — | DataForSEO Internal SE Server Error (2nd straight week) |
| `enersys battery charger` | out | out | — | Deprioritize (OEM-owned) |
| `hyster 4092995 charger` | API err | API err | — | DataForSEO Internal SE Server Error; PDP live at `/parts/hyster-remanufactured-24v-battery-charger-4092995` |

Source: DataForSEO via `scripts/seo/charger-rank-check.ts` → `scripts/seo/rank-snapshots/charger/2026-08-31.json`.  
Prior compare: `2026-08-17.json` (restored from commit `8e946f3e`; Aug 17 STATUS PR had not merged to `main`).  
**API errors:** 2 keywords (`forklift charger module repair`, `hyster 4092995 charger`). Retry threshold is **more than 3** — no retry this week.

### Wins / losses / `6la20671` URL check

- **Wins:** **`6la20671` hub → `/charger-modules/enersys-6la20671` at #17** (Phase 3 primary goal); `hawker charger module` #48→**#42**; `81063658r` recovered at **#2**; `81063577r` / `81063578r` hold **#2**.
- **Losses:** `act quantum charger module` #41→**out**; hub head term `forklift battery charger module` #75→**#113**; `81063578r` URL slipped to legacy `/parts/...-repair`; Hawker brand query winning URL moved hub-ward.
- **`6la20671` landing URL:** **`/charger-modules/enersys-6la20671`** (Enersys SKU) — no longer the hub. First confirmed flip since Aug 10 de-cannibalize (~3 weeks in the 2–6 week window).

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

1. **Preferred this week:** GSC URL Inspection + Request indexing on `/charger-modules/act-quantum-36vdc` (and optionally `/charger-modules/act-quantum-80vdc`) — `81063658r` is #2 on hub; `81063578r` re-attached to legacy `/parts`.  
2. Optional: confirm last 90 days charger order revenue (Stripe filter via `npx tsx scripts/seo/charger-revenue-baseline.ts`).  
3. Optional Phase 4b: Google Ads Search on proven PNs only — **do not launch** until GA4 purchase path is verified.  
4. Repair inbound freight: copy no longer promises prepaid labels; confirm FSIP process if you later want to re-add that claim.

## Next action (exactly one — Phase 3)

**Christopher: GSC URL Inspection + Request indexing on `/charger-modules/act-quantum-36vdc`** so Google re-evaluates `81063658r` (currently #2 on hub) the same way `6la20671` just flipped to Enersys. Do not expand keywords, do not deploy, and keep next Monday’s run focused on whether `6la20671` **stays** on the Enersys SKU URL.

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
| 2026-08-17 | Hub ItemList-only confirmed live; `6la20671` #18 still hub; next = GSC URL Inspection on Enersys SKU (no code/expand) |
| 2026-08-31 | `6la20671` #17 wins on `/charger-modules/enersys-6la20671` (Phase 3 URL flip); next = GSC inspect ACT 36V SKU for `81063658r` hub cannibalization; no deploy/expand |
