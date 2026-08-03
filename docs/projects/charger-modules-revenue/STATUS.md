# Charger Modules — Status

**Last updated:** 2026-08-03  
**Active phase:** Phase 3 — win `6la20671` on Enersys SKU URL (monitor + de-cannibalize)  
**Deployed SEO recovery:** `b18f77e3` (2026-07-07) live on production  
**Program commit:** Phases 1–4 code live; weekly rank monitor continues

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | SSR schema, SKU pages, duplicate 301, weekly automation + secrets tested |
| 1 Measurement | ✅ code | GA4 `view_item` / `add_to_cart` / `begin_checkout` + charger_* events; price ID list script |
| 2 Conversion | ✅ code | Sticky CTA on SKU, core deposit math above fold, PN links on hub, repair prepaid claim removed |
| 3 Win `6la20671` | 🔄 monitor | Title/H1 live with PN on Enersys SKU; SERP still awards hub — see Aug 3 snapshot |
| 4 Expand | ✅ partial | Hyster 4092995 linked from hub/SKU; fleet quote `generate_lead` event. **Paid ads deferred** until organic + conversion baseline |

## Rank snapshot (Google US) — 2026-08-03 DataForSEO

| Keyword | Jul 27 | Aug 3 | Winning URL | Notes |
|---------|-------:|------:|-------------|-------|
| `6la20671` | #18 | **#19** ↓ | `/charger-modules` | **Still hub, not Enersys SKU** — Phase 3 goal unmet |
| `81063658r` | #1 | **#2** ↓ | `/charger-modules/act-quantum-36vdc` | Protect (still top 3) |
| `81063577r` | #2 | **#2** = | `/parts/act-quantum-48vdc-reman` | Strong; legacy `/parts` URL winning vs `/charger-modules/…` |
| `81063578r` | API err | **#2** NEW | `/charger-modules/act-quantum-80vdc` | Win — recovered after prior API error |
| `act quantum charger module` | #29 | **#34** ↓ | `/parts/act-quantum-36vdc-repair` | Soft loss; legacy `/parts` URL |
| `hawker charger module` | #45 | **#50** ↓ | `/charger-modules/hawker-6la20671` | Soft loss |
| `forklift battery charger module` | #73 | **#76** ↓ | `/charger-modules` | Soft loss |
| `enersys battery charger` | out | out | — | Deprioritize (OEM-owned) |
| `forklift charger module repair` | API err | API err | — | Single keyword error (no retry; &lt;3 errors) |
| `hyster 4092995 charger` | out | out | — | PDP live at `/parts/hyster-remanufactured-24v-battery-charger-4092995` |

Source: DataForSEO via `scripts/seo/charger-rank-check.ts` → `scripts/seo/rank-snapshots/charger/2026-08-03.json`.

### Wins / losses / `6la20671` URL check

- **Wins:** `81063578r` returned at **#2** on the correct ACT 80VDC SKU URL (was API error on Jul 27).
- **Losses:** Soft slips on `6la20671` (#18→#19), `81063658r` (#1→#2), `hawker` (#45→#50), `act quantum` (#29→#34), hub head term (#73→#76).
- **`6la20671` landing URL:** still **`/charger-modules` (hub)** — not `/charger-modules/enersys-6la20671`. Production Enersys page title/H1 already lead with `6LA20671` (Phase 3 code confirmed live).

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

## Next action (exactly one — Phase 3)

**Soften hub cannibalization for `6la20671`:** keep hub ItemList *links* to the Enersys SKU, but remove nested Product/Offer schema for Enersys+Hawker `6LA20671` from the hub so Google prefers `/charger-modules/enersys-6la20671` for the PN query. No deploy without human approval; do not touch checkout/webhooks.

## Decision log

| Date | Decision |
|------|----------|
| 2026-07-07 | Ship SSR schema + SKU pages + duplicate 301 |
| 2026-07-27 | Formalize managed revenue program; weekly DataForSEO automation |
| 2026-07-27 | Do not chase `enersys battery charger` organically |
| 2026-07-27 | Proceed all phases: measurement + conversion + PN SEO + Hyster/fleet hooks; paid ads deferred |
| 2026-08-03 | `6la20671` still ranks hub; next = hub Product-schema de-cannibalization (Phase 3), not keyword expand |
