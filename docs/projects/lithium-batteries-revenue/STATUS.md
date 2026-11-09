# Lithium Batteries — Status

**Last updated:** 2026-11-09
**Active phase:** Convert already-ranking brand/PN URLs (Phase 2–3). Phase 4 generic expand still deferred.
**Weekly automation:** Refreshed 2026-11-09 (Cloud Agent Monday cron). Prior on-disk baseline on `main` was still **2026-09-01** (interim Oct/Nov agent-branch snapshots never landed).
**Baseline ranks:** DataForSEO 2026-07-28 → 2026-08-20 → 2026-09-01 → **2026-11-09** (`scripts/seo/rank-snapshots/lithium-rhino/`)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Hub + carts + PDPs + Merchant + docs + keyword map |
| 1 Measurement | ✅ | Rank script live; Monday automation running again |
| 2 Conversion | ✅ shipped | Hub CTAs / featured kits / kit finder; PDP HazMat + cart links |
| 3 Brand/Ah URLs | ✅ shipped | Exact-capacity copy/links + cart-schema deconfliction (2026-08-20). Sibling cannibalization still moves around. |
| 4 Expand | ⬜ | Generic head terms still out; conversion-kit foothold **LOST** (was #66 on Sep 1) |

## Progress vs Sep 1 (Google US)

Brand/Ah presence is softer and deeper than Sep 1. Ranked count **13 → 11**, top 10 **2 → 0**, and the only generic commercial foothold (`lithium golf cart battery conversion kit` #66) is **gone**. Bright spot: long-tail `48v 65ah lithium golf cart battery` is **NEW #41** on the correct 65Ah kit.

| Metric | Jul 28 | Aug 20 | Sep 1 | Nov 9 |
|--------|-------:|-------:|------:|------:|
| Ranked / checked | 10/22 | 13/26 | 13/26 | **11/26** |
| Top 10 | 0 | 1 | 2 | **0** |
| Top 30 | 3 | 2 | 2 | **0** |
| Wrong winning URL | 2 | 8 | 4 | **6** |

`113-LR51V65AH` errored on Nov 9 after retries (DataForSEO Internal SE). `113-LR51V105AH` clean **out** (was #9 on Sep 1).

**DataForSEO note:** `live/regular` returned obfuscated `google.com/goto` organic URLs for every keyword today. Snapshot recovered via `live/advanced` using `website_name` / breadcrumb + title capacity inference (`source: dataforseo-live-advanced-breadcrumb`).

## Rank snapshot (Google US) — 2026-11-09

| Keyword | Sep 1 | Nov 9 | Winning URL | Target | Notes |
|---------|------:|------:|-------------|---------|-------|
| `lithium golf cart battery conversion kit` | #66 | **out LOST** | — | hub | Only generic foothold gone |
| `48v lithium golf cart conversion kit` | out | **#101** NEW ⚠ | 120Ah kit | hub ⚠ | 120Ah sibling thief |
| `48v 65ah lithium golf cart battery` | out | **#41** NEW ✓ | 65Ah kit | 65Ah ✓ | Best new long-tail hit |
| `lithium rhino battery` | #40 | **#114** ↓ ⚠ | 120Ah kit | hub ⚠ | Deep + wrong URL |
| `lithium rhino golf cart battery` | #41 | **#112** ↓ ✓ | hub | hub ✓ | Right URL, deep |
| `lithium rhino conversion kit` | #37 | **#98** ↓ ✓ | hub | hub ✓ | Right URL, deep |
| `lithium rhino 48v` | #54 ⚠ 120Ah | **#113** ↓ ⚠ | 105Ah kit | hub ⚠ | Thief flipped 120 → 105 |
| `lithium rhino 48v 65ah` | #52 ✓ kit | **#106** ↓ ⚠ | **65Ah battery-only** | 65Ah kit ⚠ | **Not hub** — battery PDP steals kit |
| `lithium rhino 48v 65ah kit` | #58 | **#105** ↓ ✓ | 65Ah kit | 65Ah ✓ | Right URL, deep |
| `lithium rhino 48v 105ah` | #58 | **out LOST** | — | 105Ah | |
| `lithium rhino 48v 50ah` | #54 ⚠ | **#95** ↓ ✓ | 50Ah kit | 50Ah ✓ | URL fixed vs Sep 1 |
| `lithium rhino 36v` | #67 ⚠ | **#104** ↓ ⚠ | hub | 36V kit ⚠ | Still hub, not 36V PDP |
| `lithium rhino 72v` | #54 ✓ | **#106** ↓ ⚠ | hub | 72V kit ⚠ | Hub instead of 72V kit |
| `lithium rhino` | out | out | — | hub | |
| `113-LR51V65AH` | #9 ⚠ hub | error | — | 65Ah | Retry next Monday |
| `113-LR51V105AH` | #9 ✓ | **out LOST** | — | 105Ah | Protect-only PN soft |
| `113-LR51V50AH` | error | out | — | 50Ah | |
| Generic heads (`lithium golf cart battery`, `48v lithium…`) | out | out | — | hub | Still Phase 4 |
| Cart terms (EZGO/Club Car/Yamaha) | out | out | — | cart pages | Still no traction |

**Summary:** 11/26 ranked · 0 top 10 · 0 top 30 · 6 wrong winning URL · 1 API error (`113-LR51V65AH`).
Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts` first pass, then advanced/breadcrumb recovery after `live/regular` URL obfuscation.

### Remaining target-URL mismatches

1. **`lithium rhino 48v 65ah` → `/parts/lithium-rhino-48v-65ah` (battery-only)** · want `/parts/lithium-rhino-48v-65ah-kit` — **not the hub** (do not flag hub); kit title/query still loses to the battery-only sibling.
2. **120Ah kit** steals `48v lithium golf cart conversion kit` and `lithium rhino battery`.
3. **105Ah kit** steals broad `lithium rhino 48v` (was 120Ah on Sep 1).
4. `lithium rhino 36v` / `lithium rhino 72v` → hub · want voltage PDPs.
5. PN protect lane soft: `113-LR51V105AH` out; `113-LR51V65AH` API error.

## Live surfaces

| URL | Role |
|-----|------|
| `/lithium-batteries` | Category hub + kit finder + featured brand kits |
| `/lithium-batteries/{cart}` | Model landings (EZGO / Club Car / Yamaha) — **not ranking** |
| `/parts/lithium-rhino-*` | Kit + battery-only PDPs |
| Insights | `/insights/lithium-vs-lead-acid-golf-cart-batteries-2026-guide` plus `/insights/best-lithium-batteries-for-golf-carts` |

## Open blockers / needs from Christopher

1. Approve before any checkout / HazMat freight / price changes.
2. No new generic head-term content until brand mid-pack + wrong-URL set settles.
3. Optional later: teach `lithium-rhino-rank-check.ts` an advanced/breadcrumb fallback if `live/regular` keeps returning `google.com/goto` — not opened as a PR this week (measurement-only).

## Next actions

1. Watch battery-only vs kit for `lithium rhino 48v 65ah` (correct Ah family, wrong SKU shape).
2. Recheck PN protect lane next Monday (`113-LR51V65AH` error + `113-LR51V105AH` loss).
3. Convert the new **#41** `48v 65ah lithium golf cart battery` kit ranking (already the right URL).
4. Cart pages stay watch-only. Phase 4 still deferred after conversion-kit LOST.
5. No code/PR this week — SERP mid-pack fade + sibling cannibalization only; no checkout/Stripe/freight/price touches.

## Decision log

| Date | Decision |
|------|----------|
| 2026-07-28 | Formalize managed lithium revenue program (mirror charger-modules / rubber-tracks) |
| 2026-07-28 | Prioritize brand SERPs + generic commercial; FSIP PNs are protect-only long-tail |
| 2026-07-28 | Proceed Phases 1–3 now; Phase 4 expand deferred |
| 2026-07-28 | Weekly automation Mondays ~10:30 AM Eastern; reuse `DATAFORSEO_*` Cloud Agent secrets |
| 2026-07-28 | No checkout / webhook / freight-tier changes in this program |
| 2026-07-28 | First automation run live; true PA→AZ freight on 113-LR51V65AH order was $85 vs $149 charged |
| 2026-08-20 | Manual rank refresh: modest progress; 105Ah PDP cannibalization is the blocker; Phase 4 still deferred |
| 2026-08-20 | Shipped exact-capacity PDP copy/links and removed exact SKU/MPN Product schema from broad cart guides |
| 2026-08-25 | Shopping free-freight test on three Demand-kit SKUs only: `113-LR51V65AH`, `113-LR38V105AH`, `113-LR51V105AH`. Checkout + Merchant must both show $0. Leave 120Ah / 72V / Goliath / battery-only on paid HazMat bands. |
| 2026-09-01 | Recrawl check: 105Ah cannibalization largely cleared; 120Ah is the leftover thief; two PNs now top 10. Phase 4 still deferred. |
| 2026-11-09 | Weekly automation refresh: conversion-kit LOST; brand ranks deep; 65Ah battery-only steals `lithium rhino 48v 65ah` (not hub); long-tail 65Ah generic NEW #41 on kit. No PR / no checkout changes. |
