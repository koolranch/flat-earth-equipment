# Lithium Batteries — Status

**Last updated:** 2026-10-26
**Active phase:** Convert already-ranking brand/PN URLs (Phase 2–3). Phase 4 generic expand still deferred.
**Weekly automation:** Refreshed 2026-10-26 (Cloud Agent Monday run). On-disk compare baseline was still **2026-09-01** (interim agent-branch snapshots often never land on `main`).
**Baseline ranks:** DataForSEO 2026-07-28 vs **2026-09-01** vs **2026-10-26** (`scripts/seo/rank-snapshots/lithium-rhino/`)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Hub + carts + PDPs + Merchant + docs + keyword map |
| 1 Measurement | ✅ | Rank script live; weekly automation refreshed Oct 26 |
| 2 Conversion | ✅ shipped | Hub CTAs / featured kits / kit finder; PDP HazMat + cart links |
| 3 Brand/Ah URLs | ✅ shipped | Exact-capacity copy/links + cart-schema deconfliction (2026-08-20). Sibling cannibalization still active. |
| 4 Expand | ⬜ | Generic head terms still out; conversion-kit foothold **LOST** (#66→out) |

## Progress vs Sep 1 (Google US)

**Soft week vs on-disk Sep 1.** Ranked count slipped (**13/26 → 11/26**), depth collapsed (no mid-pack brand holds under #50 except `48v 50ah` #56 and `72v` #62), and wrong winning URLs **4 → 9**. Sibling thieves are now Goliath / 170Ah / 120Ah / 105Ah / battery-only — not hub-vs-65Ah-kit.

| Metric | Jul 28 | Sep 1 | Oct 26 |
|--------|-------:|------:|------:|
| Ranked / checked | 10/22 | 13/26 | **11/26** |
| Top 10 | 0 | 2 | **1** (`113-LR51V50AH` #7 ⚠ hub) |
| Top 30 | 3 | 2 | **1** |
| Wrong winning URL | 2 | 4 | **9** |

`lithium rhino 48v 65ah kit` still DataForSEO partial-results / Internal SE Server Error after two retries (not charged). PNs `113-LR51V65AH` and `113-LR51V105AH` LOST after retry.

## Rank snapshot (Google US) — 2026-10-26

| Keyword | Sep 1 | Oct 26 | Winning URL | Target | Notes |
|---------|------:|-------:|-------------|---------|-------|
| `lithium golf cart battery conversion kit` | #66 | **out** LOST | — | hub | Only generic commercial foothold gone |
| `48v lithium golf cart conversion kit` | out | **#109** NEW | 120Ah kit | hub ⚠ | Soft beyond 100 |
| `lithium rhino battery` | #40 | **#116** ↓ | 120Ah kit | hub ⚠ | Hub hold lost to 120Ah |
| `lithium rhino golf cart battery` | #41 | **#112** ↓ | 65Ah battery | hub ⚠ | Battery-only steal |
| `lithium rhino conversion kit` | #37 | **#91** ↓ | Goliath 170Ah | hub ⚠ | Goliath thief |
| `lithium rhino 48v` | #54 | **#97** ↓ | 170Ah battery | hub ⚠ | |
| `lithium rhino 48v 65ah` | #52 | **#93** ↓ | 65Ah **battery** | 65Ah kit ⚠ | **Not hub** — battery-only vs kit |
| `lithium rhino 48v 65ah kit` | #58 | error | — | 65Ah kit | Retry later |
| `lithium rhino 48v 105ah` | #58 | **#95** ↓ | 105Ah kit | 105Ah ✅ | Right URL, soft |
| `lithium rhino 48v 50ah` | #54 | **#56** ↓ | 105Ah kit | 50Ah ⚠ | 105Ah steal |
| `lithium rhino 36v` | #67 | **#91** ↓ | 36V 105Ah | 36V 65Ah ⚠ | |
| `lithium rhino 72v` | #54 | **#62** ↓ | 72V kit | 72V ✅ | |
| `lithium rhino` | out | out | — | hub | Still missing live top 100 |
| `113-LR51V50AH` | error | **#7** NEW | hub | 50Ah ⚠ | Top 10 but wrong URL |
| `113-LR51V65AH` | #9 | **out** LOST | — | 65Ah | |
| `113-LR51V105AH` | #9 | **out** LOST | — | 105Ah | |
| Generic heads (`lithium golf cart battery`, `48v lithium…`) | out | out | — | hub | Still Phase 4 |
| Cart terms (EZGO/Club Car/Yamaha) | out | out | — | cart pages | Still no traction |

**Summary:** 11/26 ranked · 1 top 10 · 1 top 30 · 9 wrong winning URL · 1 API error (`lithium rhino 48v 65ah kit`).
Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts` (PN + 65ah-kit retries patched into the same snapshot).

### Remaining target-URL mismatches

1. **Broad brand hub SERPs stolen by Goliath / 120Ah / 170Ah / battery-only** — `lithium rhino battery`, `golf cart battery`, `conversion kit`, bare `48v`.
2. **`lithium rhino 48v 65ah` → `/parts/lithium-rhino-48v-65ah-battery` · want `/parts/lithium-rhino-48v-65ah-kit`** — **not on the hub** (battery-only sibling, not hub flag).
3. `lithium rhino 48v 50ah` → 105Ah kit · want 50Ah kit.
4. `lithium rhino 36v` → 36V 105Ah · want 36V 65Ah.
5. `113-LR51V50AH` → hub · want `/parts/lithium-rhino-48v-50ah-kit`.
6. Soft generic `48v lithium golf cart conversion kit` → 120Ah kit · want hub.

## Live surfaces

| URL | Role |
|-----|------|
| `/lithium-batteries` | Category hub + kit finder + featured brand kits |
| `/lithium-batteries/{cart}` | Model landings (EZGO / Club Car / Yamaha) — **not ranking** |
| `/parts/lithium-rhino-*` | Kit + battery-only PDPs |
| Insights | `/insights/lithium-vs-lead-acid-golf-cart-batteries-2026-guide` plus `/insights/best-lithium-batteries-for-golf-carts` |

## Open blockers / needs from Christopher

1. Optional: merge weekly snapshot/STATUS commits onto `main` so the next run compares vs last Monday (not Sep 1).
2. Approve before any checkout / HazMat freight / price changes.
3. No new generic head-term content until sibling cannibalization settles.

## Next actions

1. Watch Goliath / 170Ah / 120Ah / battery-only the same way we watched 105Ah — they own the leftover brand hub SERPs.
2. Recheck `lithium rhino 48v 65ah` until battery-only yields to the **kit** PDP (hub flag clear this week).
3. Retry `lithium rhino 48v 65ah kit` + lost PNs next Monday.
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
| 2026-10-26 | Weekly automation refresh: soft vs Sep 1; conversion-kit foothold LOST; `48v 65ah` on battery-only (not hub); Goliath/170/120 steal brand hubs. No PR — SERP volatility only. |
