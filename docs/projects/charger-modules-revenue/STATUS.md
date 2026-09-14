# Charger Modules — Status

**Last updated:** 2026-09-07  
**Active phase:** Phase 3 — win `6la20671` on Enersys SKU URL (**URL flip sticky** at #17 for 2nd week)  
**Deployed SEO recovery:** `b18f77e3` (2026-07-07) live on production  
**Program commit:** Phases 1–4 code live; weekly rank monitor continues; Aug 10 de-cannibalize live; Aug 17 + Aug 31 snapshots backfilled onto branch

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | SSR schema, SKU pages, duplicate 301, weekly automation + secrets tested |
| 1 Measurement | ✅ code | GA4 `view_item` / `add_to_cart` / `begin_checkout` + charger_* events; price ID list script |
| 2 Conversion | ✅ code | Sticky CTA on SKU, core deposit math above fold, PN links on hub, repair prepaid claim removed |
| 3 Win `6la20671` | 🔄 **sticky** | Hub ItemList-only live; `6la20671` holds `/charger-modules/enersys-6la20671` at #17 (Aug 31 + Sep 7) |
| 4 Expand | ✅ partial | Hyster 4092995 linked from hub/SKU; fleet quote `generate_lead` event. **Paid ads deferred** until organic + conversion baseline |

## Rank snapshot (Google US) — 2026-09-07 DataForSEO

| Keyword | Aug 31 | Sep 7 | Winning URL | Notes |
|---------|------:|------:|-------------|-------|
| `6la20671` | #17 | **#17** = | `/charger-modules/enersys-6la20671` | **Phase 3 URL flip sticky** — not hub |
| `81063658r` | #2 | **#2** = | `/charger-modules` | Strong rank; **still hub, not** `/charger-modules/act-quantum-36vdc` |
| `81063577r` | #2 | **#2** = | `/charger-modules/act-quantum-48vdc` | Protect; canonical SKU URL |
| `81063578r` | #2 | **#2** = | `/charger-modules/act-quantum-80vdc` | URL recovered from legacy `/parts/...-repair` → canonical SKU |
| `act quantum charger module` | out | API err | — | Single keyword partial-results error (no retry; &lt;3 errors) |
| `hawker charger module` | #42 | **#45** ↓ | `/charger-modules` | Soft slip; still hub (not Hawker SKU) |
| `forklift battery charger module` | #113 | **#76** ↑ | `/charger-modules` | Hub head-term recovery into top 100 |
| `forklift charger module repair` | API err | **#56** NEW | `/charger-modules` | Recovered after prior API errors |
| `enersys battery charger` | out | out | — | Deprioritize (OEM-owned) |
| `hyster 4092995 charger` | API err | **#57** NEW | `/parts?category=Battery+Chargers&page=3` | Rank returned; wrong URL (filter page, not PDP) |

Source: DataForSEO via `scripts/seo/charger-rank-check.ts` → `scripts/seo/rank-snapshots/charger/2026-09-07.json`.  
Prior compare: `2026-08-31.json` (restored from commit `9633c5c2`; prior Monday STATUS PRs had not fully landed on `main`).  
**API errors:** 1 keyword (`act quantum charger module`). Retry threshold is **more than 3** — no retry this week.

### Wins / losses / `6la20671` URL check

- **Wins:** `6la20671` stays on `/charger-modules/enersys-6la20671` at **#17** (2nd consecutive week); `81063578r` URL fixed to `/charger-modules/act-quantum-80vdc`; hub head terms `forklift battery charger module` #113→**#76** and `forklift charger module repair` →**#56**; ACT 48/36 hold **#2**.
- **Losses:** Soft slip `hawker charger module` #42→**#45** (hub); `act quantum charger module` unmeasured (API err); Hyster keyword lands on a catalog filter URL, not the reman PDP.
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

1. **Preferred this week:** GSC URL Inspection + Request indexing on `/charger-modules/act-quantum-36vdc` — `81063658r` is still #2 on the hub (same de-cannibalize pattern that flipped `6la20671`).  
2. Optional: confirm last 90 days charger order revenue (Stripe filter via `npx tsx scripts/seo/charger-revenue-baseline.ts`).  
3. Optional Phase 4b: Google Ads Search on proven PNs only — **do not launch** until GA4 purchase path is verified.  
4. Repair inbound freight: copy no longer promises prepaid labels; confirm FSIP process if you later want to re-add that claim.

## Next action (exactly one — Phase 3)

**Christopher: GSC URL Inspection + Request indexing on `/charger-modules/act-quantum-36vdc`** so Google can flip `81063658r` from hub → SKU the same way `6la20671` flipped to Enersys. Do not expand keywords, do not deploy; Enersys URL stickiness is confirmed — remaining Phase 3 URL gap is ACT 36V.

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
