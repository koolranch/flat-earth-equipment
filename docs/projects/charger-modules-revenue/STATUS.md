# Charger Modules — Status

**Last updated:** 2026-10-05  
**Active phase:** Phase 3 — win `6la20671` on Enersys SKU URL (**still out of top 100**, 2nd consecutive week)  
**Deployed SEO recovery:** `b18f77e3` (2026-07-07) live on production  
**Program commit:** Phases 1–4 code live; weekly rank monitor continues; Aug 10 de-cannibalize live; Sep 28 prior restored onto branch for WoW compare

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | SSR schema, SKU pages, duplicate 301, weekly automation + secrets tested |
| 1 Measurement | ✅ code | GA4 `view_item` / `add_to_cart` / `begin_checkout` + charger_* events; price ID list script |
| 2 Conversion | ✅ code | Sticky CTA on SKU, core deposit math above fold, PN links on hub, repair prepaid claim removed |
| 3 Win `6la20671` | 🔄 **regressed** | `6la20671` still **out of top 100** (2nd week); ACT PN SKUs hold #2 on canonical URLs |
| 4 Expand | ✅ partial | Hyster 4092995 linked from hub/SKU; fleet quote `generate_lead` event. **Paid ads deferred** until organic + conversion baseline |

## Rank snapshot (Google US) — 2026-10-05 DataForSEO

| Keyword | Sep 28 | Oct 5 | Winning URL | Notes |
|---------|------:|------:|-------------|-------|
| `6la20671` | out | **out** = | — | **Still not hub, not Enersys SKU** — Phase 3 URL goal unmet; top: shop.fsip.biz |
| `81063658r` | #2 | **#2** = | `/charger-modules/act-quantum-36vdc` | Protect; canonical ACT 36 SKU sticky |
| `81063577r` | #2 | **#2** = | `/charger-modules/act-quantum-48vdc` | Protect; canonical SKU URL |
| `81063578r` | #2 | **#2** = | `/charger-modules/act-quantum-80vdc` | Protect; canonical SKU URL |
| `act quantum charger module` | #28 | API err | — | Single keyword error (no retry; &lt;3 errors) |
| `hawker charger module` | #46 | **out** LOST | — | Lost after one-week hub recovery |
| `forklift battery charger module` | out | out | — | Still out (top: roypow) |
| `forklift charger module repair` | #54 | **#56** ↓ | `/charger-modules` | Soft slip on hub |
| `enersys battery charger` | out | out | — | Deprioritize (OEM-owned) |
| `hyster 4092995 charger` | API err | **#73** NEW | `/charger-modules/act-quantum-80vdc` | Rank returned but wrong URL (ACT 80, not Hyster PDP) — noise, not a win |

Source: DataForSEO via `scripts/seo/charger-rank-check.ts` → `scripts/seo/rank-snapshots/charger/2026-10-05.json`.  
Prior compare: `2026-09-28.json` (restored from `8d9396a4` / `origin/cursor/charger-modules-rank-status-3692`; prior Monday STATUS PRs had not fully landed on `main`).  
**API errors:** 1 keyword (`act quantum charger module`) — below &gt;3 retry threshold; no retry. Full run otherwise.

### Wins / losses / `6la20671` URL check

- **Wins / holds:** ACT PNs `81063658r` / `81063577r` / `81063578r` all hold **#2** on correct `/charger-modules/act-quantum-*` SKU URLs (second week of ACT 36 URL stickiness after Sep 21 hub regress).
- **Losses / gaps:** `6la20671` still **out** (2nd week; top competitor now shop.fsip.biz); `hawker charger module` #46→**out**; repair head term soft slip #54→**#56**; `act quantum charger module` unmeasured (API err); Hyster #73 lands on wrong ACT 80 URL.
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

1. **GSC URL Inspection** on `/charger-modules/enersys-6la20671` — `6la20671` remains out of top 100 for a second week (was sticky Enersys #17–#28 Aug 31–Sep 21).  
2. Optional: confirm last 90 days charger order revenue (Stripe filter via `npx tsx scripts/seo/charger-revenue-baseline.ts`) before any Phase 4 expand.  
3. Optional Phase 4b: Google Ads Search on proven PNs only — **do not launch** until GA4 purchase path is verified.  
4. Soft watch: hawker lost again; Hyster SERP oddly surfaces ACT 80 — do not retarget without purchase evidence.

## Next action (exactly one — Phase 3)

**GSC URL Inspection / request indexing on `/charger-modules/enersys-6la20671`** to restore `6la20671` in the top 100 on the Enersys SKU (out two consecutive weeks after four sticky Enersys weeks). Do not mark Phase 3 complete, do not expand keywords, do not deploy.

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
