# Charger Modules — Status

**Last updated:** 2026-07-27  
**Active phase:** Phases 1–4 implementation shipped (awaiting deploy + Monday monitor)  
**Deployed SEO recovery:** `b18f77e3` (2026-07-07) live on production  
**Program commit:** see latest `main` after Phases 1–4 code land

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | SSR schema, SKU pages, duplicate 301, weekly automation + secrets tested |
| 1 Measurement | ✅ code | GA4 `view_item` / `add_to_cart` / `begin_checkout` + charger_* events; price ID list script |
| 2 Conversion | ✅ code | Sticky CTA on SKU, core deposit math above fold, PN links on hub, repair prepaid claim removed |
| 3 Win `6la20671` | ✅ code | Title/H1 lead with PN; hub part-number index; battery-chargers → modules link |
| 4 Expand | ✅ partial | Hyster 4092995 linked from hub/SKU; fleet quote `generate_lead` event. **Paid ads deferred** until organic + conversion baseline |

## Rank snapshot (Google US) — last DataForSEO run

| Keyword | Jul 1 | Jul 27 | Winning URL | Notes |
|---------|------:|-------:|-------------|-------|
| `6la20671` | #23 | **#18** ↑ | `/charger-modules` | Goal after Phase 3 deploy: Enersys SKU URL |
| `81063658r` | — | **#1** | `/charger-modules/act-quantum-36vdc` | Protect |
| `81063577r` | — | **#2** | `/charger-modules/act-quantum-48vdc` | Protect |
| `act quantum charger module` | — | **#29** | `/charger-modules/act-quantum-80vdc` | |
| `hawker charger module` | — | **#45** | `/charger-modules/hawker-6la20671` | |
| `forklift battery charger module` | out | **#73** | `/charger-modules` | |
| `enersys battery charger` | — | out | — | Deprioritize |
| `forklift charger module repair` | #45 | API error | — | Retry on Monday automation |
| `hyster 4092995 charger` | #52 | API error | — | PDP live at `/parts/hyster-remanufactured-24v-battery-charger-4092995` |

Source: DataForSEO via `scripts/seo/charger-rank-check.ts`.

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

1. **Deploy** this Phases 1–4 commit to production when ready.  
2. Optional: confirm last 90 days charger order revenue (Stripe filter via `npx tsx scripts/seo/charger-revenue-baseline.ts`).  
3. Optional Phase 4b: Google Ads Search on proven PNs only — **do not launch** until GA4 purchase path is verified.  
4. Repair inbound freight: copy no longer promises prepaid labels; confirm FSIP process if you later want to re-add that claim.

## Next actions after deploy

1. Monday automation continues rank + STATUS updates.  
2. In GA4 Explorations, confirm `charger_module_*` events fire on a test add-to-cart.  
3. Watch whether `6la20671` winning URL flips to `/charger-modules/enersys-6la20671` over 2–6 weeks.

## Decision log

| Date | Decision |
|------|----------|
| 2026-07-07 | Ship SSR schema + SKU pages + duplicate 301 |
| 2026-07-27 | Formalize managed revenue program; weekly DataForSEO automation |
| 2026-07-27 | Do not chase `enersys battery charger` organically |
| 2026-07-27 | Proceed all phases: measurement + conversion + PN SEO + Hyster/fleet hooks; paid ads deferred |
