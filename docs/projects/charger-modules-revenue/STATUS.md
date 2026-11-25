# Charger Modules — Status

**Last updated:** 2026-11-02  
**Active phase:** Phase 3 — win `6la20671` on Enersys SKU URL (**still out** — 2nd week after Oct 19 #17 stickiness failure)  
**Deployed SEO recovery:** `b18f77e3` (2026-07-07) live on production  
**Program commit:** Phases 1–4 code live; weekly rank monitor continues; Aug 10 de-cannibalize live; prior Monday snapshots restored onto branch for WoW compare

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | SSR schema, SKU pages, duplicate 301, weekly automation + secrets tested |
| 1 Measurement | ✅ code | GA4 `view_item` / `add_to_cart` / `begin_checkout` + charger_* events; price ID list script |
| 2 Conversion | ✅ code | Sticky CTA on SKU, core deposit math above fold, PN links on hub, repair prepaid claim removed |
| 3 Win `6la20671` | 🔄 **regressed** | Still **out** of top 100 (2nd week after Oct 26 loss of Enersys #17); Phase 3 not closed |
| 4 Expand | ✅ partial | Hyster 4092995 linked from hub/SKU; fleet quote `generate_lead` event. **Paid ads deferred** until organic + conversion baseline |

## Rank snapshot (Google US) — 2026-11-02 DataForSEO

| Keyword | Oct 26 | Nov 2 | Winning URL | Notes |
|---------|------:|------:|-------------|-------|
| `6la20671` | out | **out** = | — | Still out — neither hub nor Enersys SKU (top: google.com) |
| `81063658r` | out | **out** = | — | Still out (top: strickerautoparts.com) |
| `81063577r` | out | **#12** NEW | `/charger-modules` | Soft recovery on **hub**, not ACT 48 SKU (top: google.com) |
| `81063578r` | out | API err | — | Retry still Internal SE Server Error |
| `act quantum charger module` | #79 | **out** LOST | — | Lost soft hub recovery (top: google.com) |
| `hawker charger module` | #44 | **#89** ↓ | `/charger-modules/hawker-6la20671` | Soft slip; still Hawker SKU (top: google.com) |
| `forklift battery charger module` | out | **out** = | — | Still out (top: google.com) |
| `forklift charger module repair` | out | **out** = | — | Still out after retry (top: remispowersystems.com) |
| `enersys battery charger` | out | out | — | Deprioritize (OEM-owned) |
| `hyster 4092995 charger` | out | API err | — | Retry still Internal SE Server Error |

Source: DataForSEO via `scripts/seo/charger-rank-check.ts` → `scripts/seo/rank-snapshots/charger/2026-11-02.json`.  
Prior compare: `2026-10-26.json` (restored from `origin/cursor/charger-modules-rank-status-f5cc`; prior Monday STATUS PRs had not fully landed on `main`).  
**Partial run:** first pass 5 API errors → one retry → **2 remaining errors** (`hyster 4092995 charger`, `81063578r`) · **8/10** keywords measured.

### Wins / losses / `6la20671` URL check

- **Wins:** `81063577r` returned at **#12** (was out) — but landing URL is **hub** `/charger-modules`, not `/charger-modules/act-quantum-48vdc`.
- **Losses:** `hawker charger module` #44→**#89**; `act quantum charger module` #79→**out**.
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

1. **Action:** GSC URL Inspection (Request indexing) on `/charger-modules/enersys-6la20671` — still out 2 weeks after stickiness failure.  
2. Soft watch: `81063577r` ranking hub at #12 — consider GSC inspect `/charger-modules/act-quantum-48vdc` so the PN lands on SKU (not this week's single next action).  
3. Optional: confirm last 90 days charger order revenue (Stripe filter via `npx tsx scripts/seo/charger-revenue-baseline.ts`) before any Phase 4 expand.  
4. Optional Phase 4b: Google Ads Search on proven PNs only — **do not launch** until GA4 purchase path is verified.

## Next action (exactly one — Phase 3)

**GSC URL Inspection on `/charger-modules/enersys-6la20671`:** `6la20671` remains out of top 100 (2nd week after the Oct 19→26 Enersys #17 stickiness failure) — request indexing to re-anchor the SKU URL before any expand or deploy.

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
