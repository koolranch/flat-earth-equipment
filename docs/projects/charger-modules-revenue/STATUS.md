# Charger Modules — Status

**Last updated:** 2026-08-17  
**Active phase:** Phase 3 — win `6la20671` on Enersys SKU URL (de-cannibalize live; continue SERP monitor)  
**Deployed SEO recovery:** `b18f77e3` (2026-07-07) live on production  
**Program commit:** Phases 1–4 code live; weekly rank monitor continues; Aug 10 de-cannibalize confirmed live on hub

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | SSR schema, SKU pages, duplicate 301, weekly automation + secrets tested |
| 1 Measurement | ✅ code | GA4 `view_item` / `add_to_cart` / `begin_checkout` + charger_* events; price ID list script |
| 2 Conversion | ✅ code | Sticky CTA on SKU, core deposit math above fold, PN links on hub, repair prepaid claim removed |
| 3 Win `6la20671` | 🔄 monitoring | Hub ItemList links only confirmed live 2026-08-17 (no nested Product/Offer); `6la20671` still ranks hub |
| 4 Expand | ✅ partial | Hyster 4092995 linked from hub/SKU; fleet quote `generate_lead` event. **Paid ads deferred** until organic + conversion baseline |

## Rank snapshot (Google US) — 2026-08-17 DataForSEO

| Keyword | Aug 10 | Aug 17 | Winning URL | Notes |
|---------|------:|-------:|-------------|-------|
| `6la20671` | #20 | **#18** ↑ | `/charger-modules` | Soft rank win; **still hub, not Enersys SKU** — Phase 3 goal unmet |
| `81063658r` | #1 | API err | — | Prior was legacy `/parts/act-quantum-36vdc-repair`; retry not required (=3 errors) |
| `81063577r` | #2 | **#2** = | `/charger-modules/act-quantum-48vdc` | Protect; canonical SKU URL |
| `81063578r` | out | **#2** NEW | `/charger-modules/act-quantum-80vdc` | Recovered on correct SKU URL (prior week API err) |
| `act quantum charger module` | out | **#41** NEW | `/parts/act-quantum-36vdc-repair` | Returned; still legacy `/parts` URL (want `/charger-modules/act-quantum-36vdc`) |
| `hawker charger module` | #45 | **#48** ↓ | `/charger-modules/hawker-6la20671` | Soft slip on Hawker SKU |
| `forklift battery charger module` | #60 | **#75** ↓ | `/battery-chargers` | Loss + URL drift off hub (watch cannibalization) |
| `forklift charger module repair` | #51 | API err | — | Prior #51 on hub; DataForSEO Internal SE Server Error |
| `enersys battery charger` | out | out | — | Deprioritize (OEM-owned) |
| `hyster 4092995 charger` | out | API err | — | PDP live at `/parts/hyster-remanufactured-24v-battery-charger-4092995` |

Source: DataForSEO via `scripts/seo/charger-rank-check.ts` → `scripts/seo/rank-snapshots/charger/2026-08-17.json`.  
**Partial run note:** 3 keywords returned `Internal SE Server Error` (`forklift charger module repair`, `hyster 4092995 charger`, `81063658r`). Per run rules, retry only when **more than 3** fail — no retry this week.

### Wins / losses / `6la20671` URL check

- **Wins:** `6la20671` #20→**#18** (still hub); `81063578r` returned at **#2** on `/charger-modules/act-quantum-80vdc`; `act quantum charger module` out→**#41**; `81063577r` holds **#2** on canonical SKU.
- **Losses:** `forklift battery charger module` #60→**#75** and winning URL moved to `/battery-chargers` (not hub); `hawker charger module` #45→**#48**.
- **`6la20671` landing URL:** still **`/charger-modules` (hub)** — not `/charger-modules/enersys-6la20671`. Production hub JSON-LD is ItemList-only (ListItem name/url; no nested Product/Offer) — Aug 10 de-cannibalize is live; SERP URL flip still pending (README: 2–6 weeks post-deploy).

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

1. **Preferred this week:** GSC URL Inspection for `/charger-modules/enersys-6la20671` (and optionally `/charger-modules/act-quantum-36vdc`) to speed re-evaluation after ItemList-only hub schema.  
2. Optional: confirm last 90 days charger order revenue (Stripe filter via `npx tsx scripts/seo/charger-revenue-baseline.ts`).  
3. Optional Phase 4b: Google Ads Search on proven PNs only — **do not launch** until GA4 purchase path is verified.  
4. Repair inbound freight: copy no longer promises prepaid labels; confirm FSIP process if you later want to re-add that claim.

## Next action (exactly one — Phase 3)

**Christopher: run Google Search Console URL Inspection + Request indexing on `/charger-modules/enersys-6la20671`** so Google re-evaluates the PN query against the Enersys SKU now that hub schema is ItemList-only (confirmed live). Do not expand keywords or change checkout; continue weekly rank monitor for the URL flip (still early in the 2–6 week post-deploy window).

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
