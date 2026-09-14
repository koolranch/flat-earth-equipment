# Lithium Batteries — Status

**Last updated:** 2026-09-14
**Active phase:** Convert already-ranking brand/PN URLs (Phase 2–3). Phase 4 generic expand still deferred.
**Weekly automation:** Cloud Agent Monday run 2026-09-14 (secrets OK; 3 DataForSEO PN/kit retries still errored).
**Baseline ranks:** DataForSEO 2026-07-28 vs **2026-08-20** vs **2026-09-01** vs **2026-09-14** (`scripts/seo/rank-snapshots/lithium-rhino/`)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Hub + carts + PDPs + Merchant + docs + keyword map |
| 1 Measurement | ✅ | Rank script live; weekly Cloud Agent refreshed 2026-09-14 |
| 2 Conversion | ✅ shipped | Hub CTAs / featured kits / kit finder; PDP HazMat + cart links |
| 3 Brand/Ah URLs | ✅ shipped | Exact-capacity copy/links + cart-schema deconfliction (2026-08-20). Recrawl largely settled Ah/PDP mismatches. |
| 4 Expand | ⬜ | Generic conversion-kit foothold **LOST** (#66 → out). Phase 4 still deferred. |

## Progress vs Sep 1 (Google US)

**Soft week.** Ranked count **13 → 9** (three API errors on previously-ranked PN/kit rows inflate the drop). Top 10 held via `113-LR51V50AH` **#7** (correct 50Ah kit). Wrong winning URLs **4 → 1**. `lithium rhino 48v 50ah` is no longer stolen by 120Ah.

| Metric | Jul 28 | Aug 20 | Sep 1 | Sep 14 |
|--------|-------:|-------:|------:|-------:|
| Ranked / checked | 10/22 | 13/26 | 13/26 | **9/26** |
| Top 10 | 0 | 1 | 2 | **1** (`113-LR51V50AH` #7) |
| Top 30 | 3 | 2 | 2 | 1 |
| Wrong winning URL | 2 | 8 | 4 | **1** |

API errors after one retry (not charged / Internal SE): `lithium rhino 48v 65ah kit`, `113-LR51V65AH`, `113-LR51V105AH`. Last good reads: 65ah kit #58 (Sep 1), `113-LR51V65AH` #9 hub⚠ (Sep 1), `113-LR51V105AH` #9 kit✅ (Sep 1).

## Rank snapshot (Google US) — 2026-09-14

| Keyword | Sep 1 | Sep 14 | Winning URL | Target | Notes |
|---------|------:|-------:|-------------|---------|-------|
| `lithium golf cart battery conversion kit` | #66 | **out** LOST | — | hub | Only generic commercial hit gone |
| `lithium rhino battery` | #40 | **#39** ↑ | `/lithium-batteries` | hub ✅ | Holding |
| `lithium rhino golf cart battery` | #41 | **#58** ↓ | hub | hub ✅ | Slipped 17 |
| `lithium rhino conversion kit` | #37 | **#53** ↓ | hub | hub ✅ | Slipped 16 |
| `lithium rhino 48v 65ah` | #52 | **#54** ↓ | 65Ah kit | 65Ah ✅ | Correct PDP (not hub) |
| `lithium rhino 48v 65ah kit` | #58 | error | — | 65Ah | Retry later |
| `lithium rhino 48v 105ah` | #58 | **#60** ↓ | 105Ah kit | 105Ah ✅ | |
| `lithium rhino 72v` | #54 | **#56** ↓ | 72V kit | 72V ✅ | |
| `lithium rhino 48v` | #54 ⚠ 120Ah | **#50** ↑ | 105Ah kit | hub ⚠ | Cannibalizer swung 120 → 105 |
| `lithium rhino 48v 50ah` | #54 ⚠ 120Ah | **#54** = | 50Ah kit | 50Ah ✅ | **Fixed** — was 120Ah |
| `lithium rhino 36v` | #67 ⚠ hub | **out** LOST | — | 36V 65Ah | |
| `lithium rhino` | out | out | — | hub | Still missing live top 100 |
| `113-LR51V50AH` | error | **#7** NEW | 50Ah kit | 50Ah ✅ | Protect-only PN win |
| `113-LR51V65AH` | #9 ⚠ hub | error | — | 65Ah | Retry later |
| `113-LR51V105AH` | #9 | error | — | 105Ah | Retry later |
| Generic heads (`lithium golf cart battery`, `48v lithium…`) | out | out | — | hub | Still Phase 4 |
| Cart terms (EZGO/Club Car/Yamaha) | out | out | — | cart pages | Still no traction |

**Summary:** 9/26 ranked · 1 top 10 · 1 top 30 · 1 wrong winning URL · 3 API errors (`lithium rhino 48v 65ah kit`, `113-LR51V65AH`, `113-LR51V105AH`).
Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts` (failed rows retried once; still errored).

### Remaining target-URL mismatches

1. **`lithium rhino 48v` → `/parts/lithium-rhino-48v-105ah-kit`** · want `/lithium-batteries` (sibling thief swung back from 120Ah to 105Ah).

Cleared vs Sep 1: `lithium rhino 48v 50ah` now hits the 50Ah kit; `lithium rhino 36v` left the index (was wrong hub).

**Not a hub flag:** `lithium rhino 48v 65ah` remains on `/parts/lithium-rhino-48v-65ah-kit` (#54).

## Live surfaces

| URL | Role |
|-----|------|
| `/lithium-batteries` | Category hub + kit finder + featured brand kits |
| `/lithium-batteries/{cart}` | Model landings (EZGO / Club Car / Yamaha) — **not ranking** |
| `/parts/lithium-rhino-*` | Kit + battery-only PDPs |
| Insights | `/insights/lithium-vs-lead-acid-golf-cart-batteries-2026-guide` plus `/insights/best-lithium-batteries-for-golf-carts` |

## Open blockers / needs from Christopher

1. Approve before any checkout / HazMat freight / price changes.
2. No new generic head-term content until the leftover `48v` wrong URL settles (and conversion-kit reappears).
3. Optional: nothing else — weekly Cloud Agent job is running again.

## Next actions

1. Watch the **105Ah PDP** on `lithium rhino 48v` (only remaining mismatch).
2. Recheck errored rows next Monday: `48v 65ah kit`, `113-LR51V65AH`, `113-LR51V105AH`.
3. Watch for **conversion-kit** generic to re-enter top 100 on the hub.
4. Cart pages stay watch-only. Phase 4 still deferred.

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
| 2026-09-14 | Weekly Cloud Agent: soft week (9/26, conversion-kit LOST); 50Ah Ah-mismatch fixed; only `48v`→105Ah left wrong; no code PR (SERP volatility). |
