# Charger Modules — Status

**Last updated:** 2026-09-14  
**Active phase:** Phase 3 — win `6la20671` on Enersys SKU URL (**URL flip sticky** at #17 for 3rd week; ACT 36 PN also flipped)  
**Deployed SEO recovery:** `b18f77e3` (2026-07-07) live on production  
**Program commit:** Phases 1–4 code live; weekly rank monitor continues; Aug 10 de-cannibalize live; Aug 17/Aug 31/Sep 7 snapshots backfilled onto branch

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | SSR schema, SKU pages, duplicate 301, weekly automation + secrets tested |
| 1 Measurement | ✅ code | GA4 `view_item` / `add_to_cart` / `begin_checkout` + charger_* events; price ID list script |
| 2 Conversion | ✅ code | Sticky CTA on SKU, core deposit math above fold, PN links on hub, repair prepaid claim removed |
| 3 Win `6la20671` | 🔄 **sticky** | Hub ItemList-only live; `6la20671` holds Enersys SKU at #17 (Aug 31 + Sep 7 + Sep 14); `81063658r` now on ACT 36 SKU |
| 4 Expand | ✅ partial | Hyster 4092995 linked from hub/SKU; fleet quote `generate_lead` event. **Paid ads deferred** until organic + conversion baseline |

## Rank snapshot (Google US) — 2026-09-14 DataForSEO

| Keyword | Sep 7 | Sep 14 | Winning URL | Notes |
|---------|------:|-------:|-------------|-------|
| `6la20671` | #17 | **#17** = | `/charger-modules/enersys-6la20671` | **Phase 3 URL flip sticky** — 3rd consecutive week; not hub |
| `81063658r` | #2 | **#2** = | `/charger-modules/act-quantum-36vdc` | **URL flip hub → SKU** (was hub on Sep 7) |
| `81063577r` | #2 | API err | — | Internal SE Server Error (no retry; &lt;3 errors) |
| `81063578r` | #2 | **#2** = | `/charger-modules/act-quantum-80vdc` | Protect; canonical SKU URL |
| `act quantum charger module` | API err | **#29** NEW | `/charger-modules/act-quantum-36vdc` | Recovered into top 30 on ACT 36 SKU |
| `hawker charger module` | #45 | **#45** = | `/charger-modules` | Flat; still hub (not Hawker SKU) |
| `forklift battery charger module` | #76 | **#75** ↑ | `/battery-chargers` | Soft rank win; URL drifted off hub → battery-chargers |
| `forklift charger module repair` | #56 | API err | — | Internal SE Server Error (no retry; &lt;3 errors) |
| `enersys battery charger` | out | out | — | Deprioritize (OEM-owned) |
| `hyster 4092995 charger` | #57 | **#42** ↑ | `/charger-modules` | Rank win; still wrong URL (hub, not reman PDP) |

Source: DataForSEO via `scripts/seo/charger-rank-check.ts` → `scripts/seo/rank-snapshots/charger/2026-09-14.json`.  
Prior compare: `2026-09-07.json` (restored from commit `dcb3cd77`; prior Monday STATUS PRs had not fully landed on `main`).  
**API errors:** 2 keywords (`forklift charger module repair`, `81063577r`). Retry threshold is **more than 3** — no retry this week. Partial run for those two.

### Wins / losses / `6la20671` URL check

- **Wins:** `6la20671` stays on `/charger-modules/enersys-6la20671` at **#17** (3rd consecutive week); `81063658r` flips hub → **`/charger-modules/act-quantum-36vdc`** at #2; `act quantum charger module` returns at **#29** on ACT 36 SKU; Hyster keyword #57→**#42**; hub head term #76→**#75**; ACT 80 holds **#2**.
- **Losses / gaps:** `81063577r` and repair head term unmeasured (API err); `hawker charger module` still hub; Hyster still not on reman PDP; `forklift battery charger module` now lands on `/battery-chargers` instead of hub.
- **`6la20671` landing URL:** **`/charger-modules/enersys-6la20671`** (Enersys SKU) — **not** the hub. Phase 3 primary goal remains met.

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

1. Optional: confirm last 90 days charger order revenue (Stripe filter via `npx tsx scripts/seo/charger-revenue-baseline.ts`) before any Phase 4 expand.  
2. Optional Phase 4b: Google Ads Search on proven PNs only — **do not launch** until GA4 purchase path is verified.  
3. Repair inbound freight: copy no longer promises prepaid labels; confirm FSIP process if you later want to re-add that claim.  
4. Soft watch: `forklift battery charger module` winning URL drifted to `/battery-chargers` — do not retarget without evidence of lost clicks.

## Next action (exactly one — Phase 3)

**Watch next Monday’s rank run** for stickiness of both URL flips: (1) `6la20671` still on `/charger-modules/enersys-6la20671`, (2) `81063658r` still on `/charger-modules/act-quantum-36vdc`. If both hold, mark Phase 3 complete. Do not expand keywords, do not deploy; no GSC action required this week (ACT 36 flip already landed).

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
