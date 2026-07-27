# Charger Modules — Status

**Last updated:** 2026-07-27 (weekly automation run)  
**Active phase:** Phase 1 — Measurement  
**Deployed SEO recovery:** `b18f77e3` (2026-07-07) live on production  
**Snapshot:** `scripts/seo/rank-snapshots/charger/2026-07-27.json`

## Rank snapshot (Google US)

Compare columns: Jul 1 hard baseline → prior same-day STATUS → this run.

| Keyword | Jul 1 | Prior (earlier 7/27) | Today | Δ | Winning URL | Notes |
|---------|------:|---------------------:|------:|---|-------------|-------|
| `6la20671` | #23 | #18 | **#18** | = | `/charger-modules` | Still hub, not Enersys SKU |
| `81063658r` | — | #1 | **#2** | ↓1 | `/charger-modules/act-quantum-36vdc` | Still protect; #1→#2 |
| `81063577r` | — | #2 | **#2** | = | `/charger-modules/act-quantum-48vdc` | Protect |
| `81063578r` | — | API error | **#2** | NEW | `/charger-modules/act-quantum-80vdc` | **Win** — recovered after prior API miss |
| `act quantum charger module` | — | #29 | **#29** | = | `/charger-modules/act-quantum-80vdc` | |
| `hawker charger module` | — | #45 | **#45** | = | `/charger-modules/hawker-6la20671` | |
| `forklift battery charger module` | out | #73 | **#74** | ↓1 | `/charger-modules` | Hub long-tail |
| `hyster 4092995 charger` | #52 | API error | **#65** | ↓ vs Jul1 | `/parts?category=Battery+Chargers…` | Not on charger-modules URL |
| `enersys battery charger` | — | out | out | = | — | Deprioritize (OEM head term) |
| `forklift charger module repair` | #45 | API error | API error | — | — | Retried once; DataForSEO Internal SE Server Error |

Source: DataForSEO live SERP via `scripts/seo/charger-rank-check.ts`.

### Highlights

- **Wins:** `81063578r` now #2 on ACT 80VDC SKU (was API error earlier today). ACT PN cluster holds top-2 (`81063577r`, `81063578r`, `81063658r`).
- **Losses:** `81063658r` #1→#2; `forklift battery charger module` #73→#74; `hyster 4092995` #52→#65 (still on legacy parts filter URL).
- **`6la20671` landing:** still `/charger-modules` hub at #18 — **not** `/charger-modules/enersys-6la20671`. Phase 3 work not started until measurement baseline exists.
- **Partial / API:** 1 keyword still errored after one retry (`forklift charger module repair`). Not >3 errors → full run accepted with that gap.

## Live pages

| URL | HTTP | Role |
|-----|------|------|
| `/charger-modules` | 200 | Category hub |
| `/charger-modules/enersys-6la20671` | 200 | Primary PN page |
| `/charger-modules/hawker-6la20671` | 200 | Brand twin |
| `/charger-modules/act-quantum-{36,48,80}vdc` | 200 | ACT PNs (top-2) |
| `/parts/battery-charger-modules` | 308 → hub | Duplicate retired |

## Phase checklist

### Phase 0 — Foundation ✅

- [x] SSR Product/ItemList schema, duplicate page 301, SKU pages live (Jul 7 deploy)
- [x] Rank helper + project docs
- [x] Weekly monitoring automation live
- [x] Baseline snapshot committed under `scripts/seo/rank-snapshots/charger/`

### Phase 1 — Measurement (active)

- [ ] Wire GA4/checkout visibility for charger price IDs (view → begin_checkout → purchase)
- [x] Weekly rank snapshot with URL-aware deltas (this run)
- [ ] Optional: Supabase/Stripe order pull for charger SKUs (last 90 days) as revenue baseline

## Open blockers / needs from Christopher

1. Confirm whether Repair & Return includes a **prepaid return label** (copy accuracy).  
2. Optional: last 90 days charger module order count/revenue from Stripe (or approve agent to query Stripe).  
3. Approve deploys for Phase 2–3 code changes when ready.  
4. Never deploy without human approval.

## Recommended next action (exactly one)

**Phase 1:** Add GA4 funnel instrumentation for charger Stripe price IDs on hub + SKU pages (`view_item` → `begin_checkout` → `purchase`) so organic sessions can be attributed to revenue — no UX/content changes yet.

## Decision log

| Date | Decision |
|------|----------|
| 2026-07-07 | Ship SSR schema + SKU pages + duplicate 301 |
| 2026-07-27 | Formalize as managed revenue program; measure before more content |
| 2026-07-27 | Do not chase `enersys battery charger` organically |
| 2026-07-27 | Weekly automation run: Phase 0 complete → Phase 1 active; `6la20671` still hub-landed |
