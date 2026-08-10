# Charger Modules — Status

**Last updated:** 2026-08-10  
**Active phase:** Phase 3 — win `6la20671` on Enersys SKU URL (de-cannibalize shipped; monitor SERP)  
**Deployed SEO recovery:** `b18f77e3` (2026-07-07) live on production  
**Program commit:** Phases 1–4 code live; weekly rank monitor continues; Aug 10 STATUS merged via #11

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | SSR schema, SKU pages, duplicate 301, weekly automation + secrets tested |
| 1 Measurement | ✅ code | GA4 `view_item` / `add_to_cart` / `begin_checkout` + charger_* events; price ID list script |
| 2 Conversion | ✅ code | Sticky CTA on SKU, core deposit math above fold, PN links on hub, repair prepaid claim removed |
| 3 Win `6la20671` | 🔄 shipped Aug 10 | Hub ItemList links only (no nested Product/Offer); Enersys/Hawker legacy `/parts` → SKU; ACT `/parts/*-reman|repair` → `/charger-modules/*` |
| 4 Expand | ✅ partial | Hyster 4092995 linked from hub/SKU; fleet quote `generate_lead` event. **Paid ads deferred** until organic + conversion baseline |

## Rank snapshot (Google US) — 2026-08-10 DataForSEO

| Keyword | Aug 3 | Aug 10 | Winning URL | Notes |
|---------|------:|-------:|-------------|-------|
| `6la20671` | #19 | **#20** ↓ | `/charger-modules` | **Still hub, not Enersys SKU** — Phase 3 goal unmet |
| `81063658r` | #2 | **#1** ↑ | `/parts/act-quantum-36vdc-repair` | Rank win; legacy `/parts` URL (want `/charger-modules/act-quantum-36vdc`) |
| `81063577r` | #2 | **#2** = | `/charger-modules/act-quantum-48vdc` | Protect; canonical SKU URL (was legacy `/parts` on Aug 3) |
| `81063578r` | #2 | API err | — | Single keyword error (no retry; &lt;3 errors) |
| `act quantum charger module` | #34 | **out** LOST | — | Loss — dropped from top 100 |
| `hawker charger module` | #50 | **#45** ↑ | `/charger-modules/hawker-6la20671` | Soft win on Hawker SKU |
| `forklift battery charger module` | #76 | **#60** ↑ | `/charger-modules` | Hub head-term improvement |
| `forklift charger module repair` | out | **#51** NEW | `/charger-modules` | Recovered after prior API errors |
| `enersys battery charger` | out | out | — | Deprioritize (OEM-owned) |
| `hyster 4092995 charger` | out | out | — | PDP live at `/parts/hyster-remanufactured-24v-battery-charger-4092995` |

Source: DataForSEO via `scripts/seo/charger-rank-check.ts` → `scripts/seo/rank-snapshots/charger/2026-08-10.json`.

### Wins / losses / `6la20671` URL check

- **Wins:** `forklift charger module repair` returned at **#51** on hub; hub head term `forklift battery charger module` #76→**#60**; `hawker charger module` #50→**#45** on Hawker SKU; `81063658r` #2→**#1** (legacy `/parts` URL); `81063577r` holds **#2** on correct `/charger-modules/act-quantum-48vdc`.
- **Losses:** Soft slip on `6la20671` (#19→#20); `act quantum charger module` #34→**out**.
- **`6la20671` landing URL:** still **`/charger-modules` (hub)** — not `/charger-modules/enersys-6la20671`. Production Enersys page title/H1 already lead with `6LA20671`; hub ItemList still nests Product/Offer for Enersys+Hawker `6LA20671` (de-cannibalize not yet shipped).

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

1. Optional: GSC URL Inspection for `/charger-modules/enersys-6la20671` to speed re-evaluation.  
2. Optional: confirm last 90 days charger order revenue (Stripe filter via `npx tsx scripts/seo/charger-revenue-baseline.ts`).  
3. Optional Phase 4b: Google Ads Search on proven PNs only — **do not launch** until GA4 purchase path is verified.  
4. Repair inbound freight: copy no longer promises prepaid labels; confirm FSIP process if you later want to re-add that claim.

## Next action (exactly one — post-deploy monitor)

**Watch next Monday’s rank run** for: (1) `6la20671` winning URL flipping to `/charger-modules/enersys-6la20671`, (2) `81063658r` moving from legacy `/parts/...-repair` to `/charger-modules/act-quantum-36vdc`, (3) `act quantum charger module` returning to top 100. Optional: GSC URL Inspection on Enersys + ACT 36V SKU pages after deploy.

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
