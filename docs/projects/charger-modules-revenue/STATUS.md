# Charger Modules — Status

**Last updated:** 2026-11-09  
**Active phase:** Phase 3 — win `6la20671` on Enersys SKU URL (**still out** — 3rd week after Oct 19 #17 stickiness failure)  
**Deployed SEO recovery:** `b18f77e3` (2026-07-07) live on production  
**Program commit:** Phases 1–4 code live; weekly rank monitor continues; Aug 10 de-cannibalize live; prior Monday snapshots restored onto branch for WoW compare

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | SSR schema, SKU pages, duplicate 301, weekly automation + secrets tested |
| 1 Measurement | ✅ code | GA4 `view_item` / `add_to_cart` / `begin_checkout` + charger_* events; price ID list script |
| 2 Conversion | ✅ code | Sticky CTA on SKU, core deposit math above fold, PN links on hub, repair prepaid claim removed |
| 3 Win `6la20671` | 🔄 **regressed** | Still **out** of top 100 (3rd week after Oct 26 loss of Enersys #17); Phase 3 not closed |
| 4 Expand | ✅ partial | Hyster 4092995 linked from hub/SKU; fleet quote `generate_lead` event. **Paid ads deferred** until organic + conversion baseline |

## Rank snapshot (Google US) — 2026-11-09 DataForSEO

| Keyword | Nov 2 | Nov 9 | Winning URL | Notes |
|---------|------:|------:|-------------|-------|
| `6la20671` | out | **out** = | — | Still out — neither hub nor Enersys SKU (top: google.com) |
| `81063658r` | out | **out** = | — | Still out (top: google.com) |
| `81063577r` | #12 | API err | — | Internal SE Server Error — could not confirm Nov 2 hub #12 |
| `81063578r` | API err | **out** = | — | Measured this week; out of top 100 (top: google.com) |
| `act quantum charger module` | out | **out** = | — | Still out (top: google.com) |
| `hawker charger module` | #89 | **out** LOST | — | Lost last soft SKU presence (top: google.com) |
| `forklift battery charger module` | out | **out** = | — | Still out (top: google.com) |
| `forklift charger module repair` | out | **out** = | — | Still out (top: google.com) |
| `enersys battery charger` | out | out | — | Deprioritize (OEM-owned) |
| `hyster 4092995 charger` | API err | API err | — | Partial results / pages not retrieved |

Source: DataForSEO via `scripts/seo/charger-rank-check.ts` → `scripts/seo/rank-snapshots/charger/2026-11-09.json`.  
Prior compare: `2026-11-02.json` (restored from `16769b8e` / `origin/cursor/charger-modules-revenue-program-bfa9`; prior Monday STATUS PRs had not fully landed on `main`).  
**Partial run:** **2 API errors** (`hyster 4092995 charger`, `81063577r`) — ≤3 so no retry · **8/10** keywords measured.

### Wins / losses / `6la20671` URL check

- **Wins:** None this week. Catalog is effectively dark for money keywords in the top 100.
- **Losses:** `hawker charger module` #89→**out** (last soft Hawker SKU foothold gone). `81063577r` unmeasured (API err) after last week's hub #12.
- **`6la20671` landing URL:** **out of top 100** — neither hub nor `/charger-modules/enersys-6la20671`. Phase 3 still unmet; do not close Phase 3.

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

1. **Action:** GSC URL Inspection (Request indexing) on `/charger-modules/enersys-6la20671` — still out 3 weeks after stickiness failure.  
2. Soft watch: last week's `81063577r` hub #12 could not be re-confirmed (API err) — GSC inspect `/charger-modules/act-quantum-48vdc` only after Enersys is re-anchored (not this week's single next action).  
3. Optional: confirm last 90 days charger order revenue (Stripe filter via `npx tsx scripts/seo/charger-revenue-baseline.ts`) before any Phase 4 expand.  
4. Optional Phase 4b: Google Ads Search on proven PNs only — **do not launch** until GA4 purchase path is verified.

## Next action (exactly one — Phase 3)

**GSC URL Inspection on `/charger-modules/enersys-6la20671`:** `6la20671` remains out of top 100 (3rd week after the Oct 19→26 Enersys #17 stickiness failure) — request indexing to re-anchor the SKU URL before any expand or deploy.

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
| 2026-11-02 | `6la20671` still **out**; `81063577r` #12 on hub (not ACT 48 SKU); hawker #44→#89; act quantum lost; partial API (2 errs); next = GSC inspect Enersys; no expand/deploy |
| 2026-11-09 | `6la20671` still **out** (3rd week); hawker #89→out; `81063577r` API err; 0 money keywords in top 100 (8/10 measured); next = GSC inspect Enersys; no expand/deploy |
