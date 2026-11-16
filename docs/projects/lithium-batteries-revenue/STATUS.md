# Lithium Batteries — Status

**Last updated:** 2026-11-16
**Active phase:** Convert already-ranking brand/PN URLs (Phase 2–3). Phase 4 generic expand still deferred.
**Weekly automation:** Refreshed 2026-11-16 (Cloud Agent Monday cron). Prior on-disk baseline on `main` was still **2026-09-01** (2026-11-09 interim agent-branch snapshot never landed).
**Baseline ranks:** DataForSEO 2026-07-28 → 2026-08-20 → 2026-09-01 → **2026-11-16** (`scripts/seo/rank-snapshots/lithium-rhino/`)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Hub + carts + PDPs + Merchant + docs + keyword map |
| 1 Measurement | ✅ | Rank script live; Monday automation running again |
| 2 Conversion | ✅ shipped | Hub CTAs / featured kits / kit finder; PDP HazMat + cart links |
| 3 Brand/Ah URLs | ✅ shipped | Exact-capacity copy/links + cart-schema deconfliction (2026-08-20). Sibling cannibalization is worse this week (11 wrong URLs). |
| 4 Expand | ⬜ | Generic heads still out; conversion-kit foothold **recovered** to **#43** hub (was LOST on 2026-11-09 interim) |

## Progress vs Sep 1 (Google US)

Ranked count is up (**13 → 14**), and top-30 presence improved (**2 → 5**) including a protect-lane PN at **#5**. Sibling cannibalization is the story: wrong winning URLs **4 → 11**. The Sep 1 conversion-kit foothold is back on the hub at **#43** (better than #66).

| Metric | Jul 28 | Aug 20 | Sep 1 | Nov 16 |
|--------|-------:|-------:|------:|-------:|
| Ranked / checked | 10/22 | 13/26 | 13/26 | **14/26** |
| Top 10 | 0 | 1 | 2 | **1** (`113-LR51V50AH` #5) |
| Top 30 | 3 | 2 | 2 | **5** |
| Wrong winning URL | 2 | 8 | 4 | **11** |

**65Ah hub flag:** `lithium rhino 48v 65ah` is **not on the hub**. First FEE hit is `/parts/lithium-rhino-36v-65ah-kit` (#36) — wrong voltage sibling, not `/parts/lithium-rhino-48v-65ah-kit`.

**DataForSEO note:** `live/regular` again returned obfuscated `google.com/goto` organic URLs for every keyword (same quirk as 2026-11-09). Snapshot recovered via `live/advanced` using `website_name` / breadcrumb + title capacity inference (`source: dataforseo-live-advanced-breadcrumb`).

## Rank snapshot (Google US) — 2026-11-16

| Keyword | Sep 1 | Nov 16 | Winning URL | Target | Notes |
|---------|------:|-------:|-------------|---------|-------|
| `lithium golf cart battery conversion kit` | #66 | **#43** ↑ ✓ | hub | hub ✓ | **Recovered** (was LOST on 11-09 interim) |
| `48v lithium golf cart conversion kit` | out | **#26** NEW ⚠ | 120Ah kit | hub ⚠ | 120Ah sibling thief; top 30 |
| `48v 65ah lithium golf cart battery` | out | **#96** NEW ⚠ | **65Ah battery-only** | 65Ah kit ⚠ | Was correct kit #41 on 11-09 interim |
| `lithium rhino` | out | **#116** NEW ⚠ | 120Ah kit | hub ⚠ | Deep + wrong URL |
| `lithium rhino battery` | #40 | **#100** ↓ ✓ | hub | hub ✓ | Right URL, deep |
| `lithium rhino golf cart battery` | #41 | **out LOST** | — | hub | |
| `lithium rhino conversion kit` | #37 | **#18** ↑ ⚠ | 36V 105Ah kit | hub ⚠ | Stronger rank, wrong sibling |
| `lithium rhino 48v` | #54 ⚠ 120Ah | **#13** ↑ ⚠ | **48V 170Ah battery** | hub ⚠ | Near page 1; wrong SKU |
| `lithium rhino 48v 65ah` | #52 ✓ kit | **#36** ↑ ⚠ | **36V 65Ah kit** | 65Ah kit ⚠ | **Not hub** — wrong voltage sibling |
| `lithium rhino 48v 65ah kit` | #58 | **#80** ↓ ⚠ | 120Ah kit | 65Ah kit ⚠ | |
| `lithium rhino 48v 105ah` | #58 | **#31** ↑ ⚠ | 65Ah battery-only | 105Ah kit ⚠ | |
| `lithium rhino 48v 50ah` | #54 ⚠ | **#43** ↑ ⚠ | hub | 50Ah kit ⚠ | |
| `lithium rhino 36v` | #67 ⚠ | **#92** ↓ ⚠ | 36V 105Ah kit | 36V 65Ah kit ⚠ | Same-family Ah steal |
| `lithium rhino 72v` | #54 ✓ | **#30** ↑ ⚠ | 48V 170Ah battery | 72V kit ⚠ | |
| `113-LR51V50AH` | error | **#5** NEW ✓ | 50Ah kit | 50Ah ✓ | Protect-lane top 10 |
| `113-LR51V65AH` | #9 ⚠ hub | **out LOST** | — | 65Ah | |
| `113-LR51V105AH` | #9 ✓ | **out LOST** | — | 105Ah | |
| Generic heads (`lithium golf cart battery`, `48v lithium…`) | out | out | — | hub | Still Phase 4 |
| Cart terms (EZGO/Club Car/Yamaha) | out | out | — | cart pages | Still no traction |

**Summary:** 14/26 ranked · 1 top 10 · 5 top 30 · 11 wrong winning URL · 0 API errors.
Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts` first pass, then advanced/breadcrumb recovery after `live/regular` URL obfuscation.

### Remaining target-URL mismatches

1. **`lithium rhino 48v 65ah` → `/parts/lithium-rhino-36v-65ah-kit`** · want `/parts/lithium-rhino-48v-65ah-kit` — **not the hub**; Ah matches, voltage does not.
2. **120Ah kit** steals `48v lithium golf cart conversion kit`, bare `lithium rhino`, and `lithium rhino 48v 65ah kit`.
3. **48V 170Ah battery** steals broad `lithium rhino 48v` and `lithium rhino 72v`.
4. **65Ah battery-only** steals long-tail `48v 65ah lithium golf cart battery` and `lithium rhino 48v 105ah`.
5. **36V 105Ah kit** steals `lithium rhino conversion kit` and `lithium rhino 36v` (want 65Ah).
6. Hub steals `lithium rhino 48v 50ah` (want 50Ah kit).
7. PN protect soft: `113-LR51V65AH` / `113-LR51V105AH` out (50Ah PN is fine at #5).

## Live surfaces

| URL | Role |
|-----|------|
| `/lithium-batteries` | Category hub + kit finder + featured brand kits |
| `/lithium-batteries/{cart}` | Model landings (EZGO / Club Car / Yamaha) — **not ranking** |
| `/parts/lithium-rhino-*` | Kit + battery-only PDPs |
| Insights | `/insights/lithium-vs-lead-acid-golf-cart-batteries-2026-guide` plus `/insights/best-lithium-batteries-for-golf-carts` |

## Open blockers / needs from Christopher

1. Approve before any checkout / HazMat freight / price changes.
2. No new generic head-term content until brand wrong-URL set settles.
3. Optional later: teach `lithium-rhino-rank-check.ts` an advanced/breadcrumb fallback if `live/regular` keeps returning `google.com/goto` — not opened as a PR this week (second week of the same quirk; measurement-only).

## Next actions

1. Watch voltage/Ah sibling cannibalization on brand SERPs (36V vs 48V, 65Ah battery-only vs kit, 120Ah / 170Ah thieves).
2. Protect the recovered **#43** conversion-kit hub ranking and the new **#26** 48v conversion-kit foothold (fix URL).
3. Keep PN protect watch: celebrate `113-LR51V50AH` #5; recheck 65Ah / 105Ah PNs next Monday.
4. Cart pages stay watch-only. Phase 4 still deferred.
5. No code/PR this week — SERP sibling cannibalization + mid-pack churn only; no checkout/Stripe/freight/price touches.

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
| 2026-11-09 | Interim Cloud Agent run (branch only): conversion-kit LOST; advanced recovery needed after google.com/goto obfuscation; never landed on `main`. |
| 2026-11-16 | Weekly refresh: conversion-kit recovered #43 hub; 14/26 ranked / 5 top 30 / 11 wrong URL; `lithium rhino 48v 65ah` not hub (36V sibling); `113-LR51V50AH` #5. No PR. |
