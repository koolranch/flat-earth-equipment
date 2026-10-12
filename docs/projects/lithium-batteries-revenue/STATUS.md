# Lithium Batteries — Status

**Last updated:** 2026-10-12
**Active phase:** Convert already-ranking brand/PN URLs (Phase 2–3). Phase 4 generic expand still deferred.
**Weekly automation:** Cloud Agent Monday run 2026-10-12 (compare vs on-disk Sep 1; interim Sep/Oct agent-branch snapshots may not be on `main`).
**Baseline ranks:** DataForSEO 2026-07-28 vs **2026-09-01** vs **2026-10-12** (`scripts/seo/rank-snapshots/lithium-rhino/`)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Hub + carts + PDPs + Merchant + docs + keyword map |
| 1 Measurement | ✅ | Rank script live; weekly automation refreshed 2026-10-12 |
| 2 Conversion | ✅ shipped | Hub CTAs / featured kits / kit finder; PDP HazMat + cart links |
| 3 Brand/Ah URLs | ✅ shipped | Exact-capacity copy/links + cart-schema deconfliction (2026-08-20). Recrawl still fighting sibling cannibalization. |
| 4 Expand | ⬜ | Generic conversion-kit foothold **LOST** (#66→out). Soft #111 on `48v 65ah lithium golf cart battery` (beyond typical top 100). |

## Progress vs Sep 1 (Google US)

**Soft week.** Ranked count near-flat (**13 → 12**/26), but **0 top 10 / 0 top 30** (was 2 / 2) after PN protect rows dropped out. Brand hub terms mostly hold; **105Ah is the sibling thief again** (was 120Ah on Sep 1).

| Metric | Jul 28 | Sep 1 | Oct 12 |
|--------|-------:|------:|------:|
| Ranked / checked | 10/22 | 13/26 | **12/26** |
| Top 10 | 0 | 2 | **0** |
| Top 30 | 3 | 2 | **0** |
| Wrong winning URL | 2 | 4 | **4** |

`113-LR51V105AH` still DataForSEO Internal SE Server Error after two retries (not charged). `113-LR51V65AH` returned out after retry (was #9 on Sep 1).

## Rank snapshot (Google US) — 2026-10-12

| Keyword | Sep 1 | Oct 12 | Winning URL | Target | Notes |
|---------|------:|-------:|-------------|---------|-------|
| `lithium golf cart battery conversion kit` | #66 | **out** LOST | — | hub | Only generic commercial foothold gone |
| `48v 65ah lithium golf cart battery` | out | **#111** NEW | 65Ah kit | 65Ah ✅ | Soft foothold past typical top 100 |
| `lithium rhino` | out | **#54** NEW | hub | hub ✅ | Brand head now live |
| `lithium rhino battery` | #40 | **#44** ↓ | hub | hub ✅ | Holding mid-40s |
| `lithium rhino golf cart battery` | #41 | **#42** ↓ | hub | hub ✅ | |
| `lithium rhino conversion kit` | #37 hub ✅ | **#54** ↓ | 105Ah kit | hub ⚠ | **105Ah cannibal returned** |
| `lithium rhino 48v` | #54 ⚠ 120Ah | **#49** ↑ | 105Ah kit | hub ⚠ | Thief swung 120 → 105 |
| `lithium rhino 48v 65ah` | #52 ✅ 65Ah | **#58** ↓ | **105Ah kit** | 65Ah ⚠ | **FLAG — not hub; wrong sibling PDP** |
| `lithium rhino 48v 65ah kit` | #58 | **#54** ↑ | 65Ah kit | 65Ah ✅ | Right URL, slight climb |
| `lithium rhino 48v 105ah` | #58 | **#92** ↓ | 105Ah kit | 105Ah ✅ | Right URL, deep slip |
| `lithium rhino 48v 50ah` | #54 ⚠ 120Ah | **#86** ↓ | 50Ah kit | 50Ah ✅ | **Fixed URL**, worse rank |
| `lithium rhino 36v` | #67 ⚠ hub | **#85** ↓ | 36V 105Ah | 36V 65Ah ⚠ | Sibling Ah steal |
| `lithium rhino 72v` | #54 | **#55** ↓ | 72V kit | 72V ✅ | Holding |
| `113-LR51V65AH` | #9 ⚠ hub | **out** LOST | — | 65Ah | Protect-only; out of top 100 |
| `113-LR51V105AH` | #9 ✅ | error | — | 105Ah | Retry later |
| `113-LR51V50AH` | error | out | — | 50Ah | |
| Generic heads (`lithium golf cart battery`, `48v lithium…`) | out | out | — | hub | Still Phase 4 |
| Cart terms (EZGO/Club Car/Yamaha) | out | out | — | cart pages | Still no traction |

**Summary:** 12/26 ranked · 0 top 10 · 0 top 30 · 4 wrong winning URL · 1 API error (`113-LR51V105AH`).
Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts` (failed rows retried into the same snapshot).

### Remaining target-URL mismatches

1. **FLAG:** `lithium rhino 48v 65ah` → `/parts/lithium-rhino-48v-105ah-kit` · want `/parts/lithium-rhino-48v-65ah-kit` (not the hub — sibling PDP steal). Companion `…65ah kit` still correct on 65Ah.
2. **105Ah kit is the sibling thief** — owns `lithium rhino conversion kit` and `lithium rhino 48v` (want hub).
3. `lithium rhino 36v` → `/parts/lithium-rhino-36v-105ah-kit` · want `/parts/lithium-rhino-36v-65ah-kit`.

## Live surfaces

| URL | Role |
|-----|------|
| `/lithium-batteries` | Category hub + kit finder + featured brand kits |
| `/lithium-batteries/{cart}` | Model landings (EZGO / Club Car / Yamaha) — **not ranking** |
| `/parts/lithium-rhino-*` | Kit + battery-only PDPs |
| Insights | `/insights/lithium-vs-lead-acid-golf-cart-batteries-2026-guide` plus `/insights/best-lithium-batteries-for-golf-carts` |

## Open blockers / needs from Christopher

1. Approve before any checkout / HazMat freight / price changes.
2. No new generic head-term content until the four wrong URLs settle (Phase 4 still deferred).
3. Optional: confirm whether interim agent-branch snapshots should merge to `main` so Monday deltas are week-over-week.

## Next actions

1. Watch the **105Ah PDP** as the recurring cannibal (`conversion kit`, bare `48v`, and `48v 65ah`).
2. Recheck `lithium rhino 48v 65ah` until it leaves 105Ah for the 65Ah kit (hub is not the current problem).
3. Re-pull PN protect rows next Monday (`113-LR51V65AH` out; `113-LR51V105AH` API error).
4. Cart pages stay watch-only. Generic conversion-kit lost — do not expand Phase 4 yet.

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
| 2026-10-12 | Weekly automation: soft week (12/26, 0 top 10). Generic conversion-kit lost. 105Ah thief back on `conversion kit` / `48v` / `48v 65ah`. No PR — SERP/sibling cannibal only. |
