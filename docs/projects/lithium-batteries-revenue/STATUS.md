# Lithium Batteries — Status

**Last updated:** 2026-10-19
**Active phase:** Convert already-ranking brand/PN URLs (Phase 2–3). Phase 4 generic expand still deferred.
**Weekly automation:** Refreshed 2026-10-19 (Monday Cloud Agent). On-disk compare baseline is still **2026-09-01** — interim agent-branch snapshots (Sep 7–Oct 12) were never merged to `main`.
**Baseline ranks:** DataForSEO 2026-07-28 vs **2026-08-20** vs **2026-09-01** vs **2026-10-19** (`scripts/seo/rank-snapshots/lithium-rhino/`)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Hub + carts + PDPs + Merchant + docs + keyword map |
| 1 Measurement | ✅ | Rank script live; weekly Monday automation refreshed 2026-10-19 |
| 2 Conversion | ✅ shipped | Hub CTAs / featured kits / kit finder; PDP HazMat + cart links |
| 3 Brand/Ah URLs | ✅ shipped | Exact-capacity copy/links + cart-schema deconfliction (2026-08-20). Capacity SERPs mostly on correct PDPs; broad brand terms still stolen by Goliath/heated/170Ah. |
| 4 Expand | ⬜ | Generic head terms still out; conversion-kit foothold **LOST** (#66→out); soft foothold on `48v 65ah lithium golf cart battery` #74 |

## Progress vs Sep 1 (Google US)

**Ranked count up slightly (13→14); depth softer.** One PN remains top 10; second PN recovered to top 30 after retry. Broad brand hub terms slipped past #100 onto wrong PDPs (Goliath / heated / 170Ah). **`lithium rhino 48v 65ah` stays on the correct 65Ah kit PDP — not the hub.**

| Metric | Jul 28 | Aug 20 | Sep 1 | Oct 19 |
|--------|-------:|-------:|------:|------:|
| Ranked / checked | 10/22 | 13/26 | 13/26 | **14/26** |
| Top 10 | 0 | 1 | 2 | **1** (`113-LR51V50AH` #9) |
| Top 30 | 3 | 2 | 2 | **2** (`113-LR51V50AH` #9, `113-LR51V65AH` #12) |
| Wrong winning URL | 2 | 8 | 4 | **5** |

`113-LR51V65AH` errored on first pass (DataForSEO partial results; not charged); retry landed #12 on the correct 65Ah kit.

## Rank snapshot (Google US) — 2026-10-19

| Keyword | Sep 1 | Oct 19 | Winning URL | Target | Notes |
|---------|------:|-------:|-------------|---------|-------|
| `lithium golf cart battery conversion kit` | #66 | **out** LOST | — | hub | Only prior generic foothold gone |
| `48v 65ah lithium golf cart battery` | out | **#74** NEW | 65Ah kit | 65Ah ✅ | Soft generic→PDP foothold |
| `lithium rhino` | out | **#53** NEW | hub | hub ✅ | Brand head finally live |
| `lithium rhino battery` | #40 | **#113** ↓ | 170Ah battery | hub ⚠ | Soft + wrong URL |
| `lithium rhino golf cart battery` | #41 | **#115** ↓ | 120Ah heated | hub ⚠ | Soft + wrong URL |
| `lithium rhino conversion kit` | #37 | **#105** ↓ | Goliath kit | hub ⚠ | Soft + wrong URL |
| `lithium rhino 48v` | #54 | **#97** ↓ | 170Ah battery | hub ⚠ | Same 170Ah thief |
| `lithium rhino 48v 65ah` | #52 | **#51** ↑ | 65Ah kit | 65Ah ✅ | **Not hub** — correct PDP |
| `lithium rhino 48v 65ah kit` | #58 | **#94** ↓ | 65Ah kit | 65Ah ✅ | Right URL, slipped 36 |
| `lithium rhino 48v 105ah` | #58 | **#59** ↓ | 105Ah kit | 105Ah ✅ | |
| `lithium rhino 48v 50ah` | #54 | **#91** ↓ | 50Ah kit | 50Ah ✅ | Right URL, soft |
| `lithium rhino 36v` | #67 | **#63** ↑ | 36V 105Ah | 36V 65Ah ⚠ | Sibling Ah mismatch |
| `lithium rhino 72v` | #54 | **#57** ↓ | 72V kit | 72V ✅ | |
| `113-LR51V50AH` | error | **#9** NEW | 50Ah kit | 50Ah ✅ | Top-10 protect |
| `113-LR51V65AH` | #9 ⚠ hub | **#12** ↓ | 65Ah kit | 65Ah ✅ | Retry; correct URL (was hub on Sep 1) |
| `113-LR51V105AH` | #9 | **out** LOST | — | 105Ah | |
| Generic heads (`lithium golf cart battery`, `48v lithium…`) | out | out | — | hub | Still Phase 4 |
| Cart terms (EZGO/Club Car/Yamaha) | out | out | — | cart pages | Still no traction |

**Summary:** 14/26 ranked · 1 top 10 · 2 top 30 · 5 wrong winning URL · 0 API errors (after PN retry).
Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts` (`113-LR51V65AH` retried into the same snapshot).

### Remaining target-URL mismatches

1. **Goliath / heated / 170Ah PDPs steal broad brand hub SERPs** — `lithium rhino battery`, `lithium rhino golf cart battery`, `lithium rhino conversion kit`, and `lithium rhino 48v` land on `/parts/lithium-rhino-48v-170ah-*` or heated/Goliath instead of `/lithium-batteries`.
2. `lithium rhino 36v` → `/parts/lithium-rhino-36v-105ah-kit` · want `/parts/lithium-rhino-36v-65ah-kit`.

**Not a mismatch this week:** `lithium rhino 48v 65ah` → `/parts/lithium-rhino-48v-65ah-kit` (correct; do not flag hub).

## Live surfaces

| URL | Role |
|-----|------|
| `/lithium-batteries` | Category hub + kit finder + featured brand kits |
| `/lithium-batteries/{cart}` | Model landings (EZGO / Club Car / Yamaha) — **not ranking** |
| `/parts/lithium-rhino-*` | Kit + battery-only PDPs |
| Insights | `/insights/lithium-vs-lead-acid-golf-cart-batteries-2026-guide` plus `/insights/best-lithium-batteries-for-golf-carts` |

## Open blockers / needs from Christopher

1. Approve before any checkout / HazMat freight / price changes.
2. No new generic head-term content until broad brand hub SERPs stop landing on Goliath/heated/170Ah.
3. Optional: merge weekly STATUS/snapshot PRs (or commit to `main`) so the next Monday compare baseline is not stuck on Sep 1.

## Next actions

1. Watch Goliath / 170Ah / heated PDPs the same way we watched 105Ah then 120Ah — they are the leftover broad-brand cannibals.
2. Hold `lithium rhino 48v 65ah` on the 65Ah kit (already correct); convert soft #51 / #74 capacity queries.
3. Protect PN top ranks (`113-LR51V50AH` #9, `113-LR51V65AH` #12); recheck `113-LR51V105AH` next Monday.
4. Cart pages stay watch-only. Phase 4 still deferred after conversion-kit LOST.

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
| 2026-10-19 | Weekly automation: 14/26 ranked; `48v 65ah` correct PDP (not hub); Goliath/heated/170Ah steal broad brand hub SERPs; conversion-kit generic LOST; Phase 4 still deferred. No code PR. |
