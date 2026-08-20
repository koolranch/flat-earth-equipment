# Lithium Batteries — Status

**Last updated:** 2026-08-20
**Active phase:** Convert already-ranking brand/PN URLs (Phase 2–3). Phase 4 generic expand still deferred.
**Weekly automation:** Stale — last Cloud Agent run was 2026-07-28 (three Mondays missed). Manual refresh today.
**Baseline ranks:** DataForSEO 2026-07-28 vs **2026-08-20** (`scripts/seo/rank-snapshots/lithium-rhino/`)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Hub + carts + PDPs + Merchant + docs + keyword map |
| 1 Measurement | ✅ | Rank script live; weekly automation has not refreshed since Jul 28 |
| 2 Conversion | ✅ shipped | Hub CTAs / featured kits / kit finder; PDP HazMat + cart links |
| 3 Brand/Ah URLs | ✅ shipped | Exact SKU descriptions, capacity-specific copy/links, and cart-schema deconfliction after the Aug 20 snapshot |
| 4 Expand | ⬜ | Generic head terms still out except one conversion-kit foothold at #68 |

## Progress vs Jul 28 (Google US)

**Modest, not a breakthrough.** Ranked money keywords **10 → 13** (current 26-keyword list). First top 10 (FSIP PN). First generic commercial foothold (`lithium golf cart battery conversion kit` #68, was out). Cart landings still invisible. Brand head `lithium rhino` dropped out of the live top 100 (Labs still reports ~#44 — treat live as current).

| Metric | Jul 28 | Aug 20 |
|--------|-------:|-------:|
| Ranked / checked | 10/22 | 13/26 |
| Top 10 | 0 | 1 (`113-LR51V65AH` #10) |
| Top 30 | 3 | 2 |
| Wrong winning URL | 2 | 8 |

## Rank snapshot (Google US) — 2026-08-20

| Keyword | Jul 28 | Aug 20 | Winning URL | Target | Notes |
|---------|-------:|-------:|-------------|---------|-------|
| `lithium golf cart battery conversion kit` | out | **#68** NEW | `/lithium-batteries` | hub ✅ | First generic commercial foothold |
| `lithium rhino battery` | #43 | **#40** ↑ | `/lithium-batteries` | hub ✅ | Best brand hold |
| `lithium rhino golf cart battery` | #41 | **#41** = | `/lithium-batteries` | hub ✅ | |
| `lithium rhino conversion kit` | — | **#37** NEW | 48V 105Ah PDP | hub ⚠ | Cannibalized by 105Ah kit |
| `lithium rhino 48v` | — | **#55** NEW | 48V 105Ah PDP | hub ⚠ | Same |
| `lithium rhino 48v 65ah kit` | — | **#52** NEW | 65Ah kit PDP | PDP ✅ | |
| `lithium rhino 48v 105ah` | out | **#57** NEW | 105Ah kit PDP | PDP ✅ | |
| `lithium rhino 48v 65ah` | #45 | **#60** ↓ | 105Ah kit PDP | 65Ah PDP ⚠ | Lost 15 spots + wrong URL |
| `lithium rhino 48v 50ah` | #48 | **#54** ↓ | 105Ah kit PDP | 50Ah PDP ⚠ | |
| `lithium rhino 36v` | — | **#58** NEW | 36V 105Ah PDP | 36V 65Ah ⚠ | |
| `lithium rhino 72v` | — | **#58** NEW | hub | 72V PDP ⚠ | |
| `lithium rhino` | #51 | **out** LOST | — | hub | Labs still ~#44; live SERP missed top 100 |
| `lifepo4 golf cart battery` | #92 | **#96** ↓ | `/lithium-batteries` | hub ✅ | Extra check (not on current money list) |
| `lithium rhino 36v 105ah` | #63 | **#65** ↓ | hub | 36V 105Ah PDP ⚠ | Extra check |
| `113-LR51V65AH` | #13 | **#10** ↑ | Club Car DS cart | 65Ah kit ⚠ | First top 10 — wrong URL |
| `113-LR51V105AH` | #18 | **#13** ↑ | cube battery PDP | kit PDP ⚠ | Same mismatch as Jul 28 |
| `113-LR51V50AH` | #18 | **#34** ↓ | hub | 50Ah kit ⚠ | Retry after Jul API error path |
| `113-LR38V105AH` | API error | **#18** NEW | 36V 105Ah kit | 36V 105Ah ✅ | Protect-lane win |
| Generic heads (`lithium golf cart battery`, `48v lithium…`) | out | out | — | hub | Still Phase 4 |
| Cart terms (EZGO/Club Car/Yamaha) | out | out | — | cart pages | No traction yet |

**Summary:** 13/26 ranked on the current money list · 1 top 10 · 2 top 30 · 8 wrong winning URL · 1 API error (`113-LR51V50AH` during the main run; retry #34).
Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts`. Labs `ranked_keywords` (URL contains `lithium`): 19 keywords, none page 1.

### Target-URL mismatches (priority)

1. **48V 105Ah kit is eating sibling queries** — `lithium rhino 48v 65ah`, `48v 50ah`, `lithium rhino conversion kit`, `lithium rhino 48v` all land on `/parts/lithium-rhino-48v-105ah-kit`.
2. `113-LR51V65AH` → `/lithium-batteries/club-car-ds-48v` · want `/parts/lithium-rhino-48v-65ah-kit`
3. `113-LR51V105AH` → cube battery PDP · want `/parts/lithium-rhino-48v-105ah-kit` (unchanged since Jul 28)
4. `lithium rhino 36v` → 36V 105Ah PDP · want 36V 65Ah (or split copy so 105Ah only ranks for 105Ah)
5. `lithium rhino 72v` → hub · want `/parts/lithium-rhino-72v-105ah-kit`

## Live surfaces

| URL | Role |
|-----|------|
| `/lithium-batteries` | Category hub + kit finder + featured brand kits |
| `/lithium-batteries/{cart}` | Model landings (EZGO / Club Car / Yamaha) — **not ranking** |
| `/parts/lithium-rhino-*` | Kit + battery-only PDPs |
| Insights | `/insights/lithium-vs-lead-acid-golf-cart-batteries-2026-guide` plus `/insights/best-lithium-batteries-for-golf-carts` (Labs ~#103–121 for “best …” queries) |

## Open blockers / needs from Christopher

1. Optional: resume the Monday Cloud Agent rank job (or keep manual refreshes).
2. Approve before any checkout / HazMat freight tier / price changes.
3. No new generic head-term content until the eight wrong winning URLs recrawl.

## Next actions

1. Recheck the eight wrong winning URLs after Google recrawls (allow 2–4 weeks).
2. Convert the **#68 conversion-kit** query on the hub (already the right URL).
3. Cart pages stay watch-only until they appear in GSC/DataForSEO.

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
