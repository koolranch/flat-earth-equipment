# Charger Modules — Status

**Last updated:** 2026-10-12  
**Active phase:** Phase 3 — win `6la20671` on Enersys SKU URL (**still out of top 100**, 3rd consecutive week)  
**Deployed SEO recovery:** `b18f77e3` (2026-07-07) live on production  
**Program commit:** Phases 1–4 code live; weekly rank monitor continues; Aug 10 de-cannibalize live; prior Monday snapshots restored onto branch for WoW compare

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | SSR schema, SKU pages, duplicate 301, weekly automation + secrets tested |
| 1 Measurement | ✅ code | GA4 `view_item` / `add_to_cart` / `begin_checkout` + charger_* events; price ID list script |
| 2 Conversion | ✅ code | Sticky CTA on SKU, core deposit math above fold, PN links on hub, repair prepaid claim removed |
| 3 Win `6la20671` | 🔄 **regressed** | `6la20671` still **out of top 100** (3rd week); ACT 80 holds #2; ACT 36 lost #2 |
| 4 Expand | ✅ partial | Hyster 4092995 linked from hub/SKU; fleet quote `generate_lead` event. **Paid ads deferred** until organic + conversion baseline |

## Rank snapshot (Google US) — 2026-10-12 DataForSEO

| Keyword | Oct 5 | Oct 12 | Winning URL | Notes |
|---------|------:|-------:|-------------|-------|
| `6la20671` | out | **out** = | — | **Still not hub, not Enersys SKU** — Phase 3 URL goal unmet; top: shop.fsip.biz |
| `81063658r` | #2 | **out** LOST | — | Lost ACT 36 #2 (top: strickerautoparts.com) |
| `81063577r` | #2 | API err | — | Partial-results API error after retry — treat as unmeasured |
| `81063578r` | #2 | **#2** = | `/charger-modules/act-quantum-80vdc` | Protect; canonical ACT 80 SKU sticky |
| `act quantum charger module` | API err | **#28** NEW | `/charger-modules/act-quantum-36vdc` | Recovered on ACT 36 SKU |
| `hawker charger module` | out | **#87** NEW | `/charger-modules` | Soft recovery on hub (not Hawker SKU) |
| `forklift battery charger module` | out | **#75** NEW | `/charger-modules` | Soft hub recovery |
| `forklift charger module repair` | #56 | **out** LOST | — | Hub head-term lost (top: electronics.alibaba.com) |
| `enersys battery charger` | out | out | — | Deprioritize (OEM-owned) |
| `hyster 4092995 charger` | #73 | **out** LOST | — | Lost (prior week was wrong ACT 80 URL anyway) |

Source: DataForSEO via `scripts/seo/charger-rank-check.ts` → `scripts/seo/rank-snapshots/charger/2026-10-12.json`.  
Prior compare: `2026-10-05.json` (restored from `eda05bf1` / `origin/cursor/charger-modules-rank-status-08b5`; prior Monday STATUS PRs had not fully landed on `main`).  
**Partial run:** Initial pass had **8 API errors** (DataForSEO 50000 Internal Server Error). Retried failed keywords once; after API recovered, 9/10 keywords measured. Remaining error: `81063577r` (partial results / uncharged pages).

### Wins / losses / `6la20671` URL check

- **Wins / holds:** `act quantum charger module` returned at **#28** on `/charger-modules/act-quantum-36vdc`; `81063578r` holds **#2** on canonical ACT 80 SKU; soft hub recoveries for `hawker charger module` (#87) and `forklift battery charger module` (#75).
- **Losses / gaps:** `6la20671` still **out** (3rd consecutive week; top competitor shop.fsip.biz); `81063658r` #2→**out**; repair head term #56→**out**; Hyster query out; `81063577r` unmeasured (API err).
- **`6la20671` landing URL:** **none in top 100** — neither `/charger-modules` nor `/charger-modules/enersys-6la20671`. Phase 3 primary goal unmet again.

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

1. **GSC URL Inspection** on `/charger-modules/enersys-6la20671` — `6la20671` remains out of top 100 for a third week (was sticky Enersys #17–#28 Aug 31–Sep 21).  
2. Soft watch: also inspect `/charger-modules/act-quantum-36vdc` after `81063658r` lost #2.  
3. Optional: confirm last 90 days charger order revenue (Stripe filter via `npx tsx scripts/seo/charger-revenue-baseline.ts`) before any Phase 4 expand.  
4. Optional Phase 4b: Google Ads Search on proven PNs only — **do not launch** until GA4 purchase path is verified.

## Next action (exactly one — Phase 3)

**GSC URL Inspection / request indexing on `/charger-modules/enersys-6la20671`** to restore `6la20671` in the top 100 on the Enersys SKU (out three consecutive weeks after four sticky Enersys weeks). Do not mark Phase 3 complete, do not expand keywords, do not deploy.

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
| 2026-09-28 | `6la20671` **out of top 100**; `81063658r` recovered to ACT 36 SKU #2; next = GSC inspect Enersys; Phase 3 regressed |
| 2026-10-05 | `6la20671` still **out** (2nd week); ACT PNs hold #2 on SKU URLs; hawker lost; next = GSC inspect Enersys again; no expand/deploy |
| 2026-10-12 | `6la20671` still **out** (3rd week); `81063658r` lost #2; ACT 80 holds; next = GSC inspect Enersys; no expand/deploy |
