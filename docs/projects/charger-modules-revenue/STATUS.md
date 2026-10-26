# Charger Modules — Status

**Last updated:** 2026-10-26  
**Active phase:** Phase 3 — win `6la20671` on Enersys SKU URL (**regressed** — out after one-week #17 Enersys recovery)  
**Deployed SEO recovery:** `b18f77e3` (2026-07-07) live on production  
**Program commit:** Phases 1–4 code live; weekly rank monitor continues; Aug 10 de-cannibalize live; prior Monday snapshots restored onto branch for WoW compare

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | SSR schema, SKU pages, duplicate 301, weekly automation + secrets tested |
| 1 Measurement | ✅ code | GA4 `view_item` / `add_to_cart` / `begin_checkout` + charger_* events; price ID list script |
| 2 Conversion | ✅ code | Sticky CTA on SKU, core deposit math above fold, PN links on hub, repair prepaid claim removed |
| 3 Win `6la20671` | 🔄 **regressed** | Oct 19 Enersys #17 recovery **lost** (out of top 100); ACT 36 #2 also lost; Phase 3 not closed |
| 4 Expand | ✅ partial | Hyster 4092995 linked from hub/SKU; fleet quote `generate_lead` event. **Paid ads deferred** until organic + conversion baseline |

## Rank snapshot (Google US) — 2026-10-26 DataForSEO

| Keyword | Oct 19 | Oct 26 | Winning URL | Notes |
|---------|------:|-------:|-------------|-------|
| `6la20671` | #17 | **out** LOST | — | **Phase 3 stickiness failed** — was Enersys SKU #17; now out (top: www.ebay.com) |
| `81063658r` | #2 | **out** LOST | — | Lost ACT 36 #2 on canonical SKU (top: strickerautoparts.com) |
| `81063577r` | out | **out** = | — | Still out (top: www.partsgeek.com) |
| `81063578r` | out | **out** = | — | Still out (top: www.carid.com) |
| `act quantum charger module` | out | **#79** NEW | `/charger-modules` | Soft hub recovery (top: www.bpsbattery.com) |
| `hawker charger module` | out | **#44** NEW | `/charger-modules/hawker-6la20671` | Soft recovery on Hawker SKU (top: powrparts.com) |
| `forklift battery charger module` | out | **out** = | — | Still out (top: www.forkliftamerica.com) |
| `forklift charger module repair` | out | **out** = | — | Still out (top: www.yewycharger.com) |
| `enersys battery charger` | out | out | — | Deprioritize (OEM-owned) |
| `hyster 4092995 charger` | out | out | — | Still out (top: www.scribd.com) |

Source: DataForSEO via `scripts/seo/charger-rank-check.ts` → `scripts/seo/rank-snapshots/charger/2026-10-26.json`.  
Prior compare: `2026-10-19.json` (restored from `origin/cursor/charger-modules-rank-status-8735`; prior Monday STATUS PRs had not fully landed on `main`).  
**Full run:** 0 API errors · 10/10 keywords measured.

### Wins / losses / `6la20671` URL check

- **Wins:** `hawker charger module` returned at **#44** on `/charger-modules/hawker-6la20671`; `act quantum charger module` returned at **#79** on hub.
- **Losses:** `6la20671` #17→**out** (lost Enersys SKU ranking after one week); `81063658r` #2→**out**.
- **`6la20671` landing URL:** **out of top 100** — neither hub nor `/charger-modules/enersys-6la20671`. Phase 3 stickiness failed; do not close Phase 3.

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

1. **Action:** GSC URL Inspection (Request indexing) on `/charger-modules/enersys-6la20671` after Phase 3 stickiness failed.  
2. Soft watch: GSC URL Inspection on `/charger-modules/act-quantum-36vdc` after `81063658r` lost #2 again.  
3. Optional: confirm last 90 days charger order revenue (Stripe filter via `npx tsx scripts/seo/charger-revenue-baseline.ts`) before any Phase 4 expand.  
4. Optional Phase 4b: Google Ads Search on proven PNs only — **do not launch** until GA4 purchase path is verified.

## Next action (exactly one — Phase 3)

**GSC URL Inspection on `/charger-modules/enersys-6la20671`:** Phase 3 Enersys #17 recovery lasted only one week then dropped out of top 100 — request indexing to re-anchor the SKU URL before any expand or deploy.

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
| 2026-10-19 | `6la20671` **recovered #17 on Enersys SKU** (Phase 3 URL win); ACT 36 #2 recovered; ACT 80 lost; next = confirm stickiness before close |
| 2026-10-26 | `6la20671` **out again** (stickiness failed); ACT 36 #2 lost; hawker #44 + act quantum #79 soft wins; next = GSC inspect Enersys; no expand/deploy |
