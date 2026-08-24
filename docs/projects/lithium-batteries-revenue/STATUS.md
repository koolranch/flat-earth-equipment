# Lithium Batteries — Status

**Last updated:** 2026-08-24
**Active phase:** Convert already-ranking brand/PN URLs (Phase 2–3). Phase 4 generic expand still deferred.
**Weekly automation:** Resumed — Cloud Agent run 2026-08-24 (DataForSEO live regular).
**Baseline ranks:** DataForSEO 2026-07-28 vs **2026-08-20** (manual) vs **2026-08-24** (`scripts/seo/rank-snapshots/lithium-rhino/`)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Hub + carts + PDPs + Merchant + docs + keyword map |
| 1 Measurement | ✅ | Rank script live; weekly automation refreshed 2026-08-24 |
| 2 Conversion | ✅ shipped | Hub CTAs / featured kits / kit finder; PDP HazMat + cart links |
| 3 Brand/Ah URLs | ✅ shipped | Exact SKU descriptions, capacity-specific copy/links, and cart-schema deconfliction after the Aug 20 snapshot — awaiting Google recrawl |
| 4 Expand | ⬜ | Generic head terms still out except one conversion-kit foothold at #66 |

## Progress vs Jul 28 / Aug 20 (Google US)

**Soft week, not a breakthrough.** Ranked money keywords **13 → 12** (26-keyword list). Lost the sole top 10 (`113-LR51V65AH` #10→#14, wrong URL → hub). Brand conversion-kit query improved and now lands on hub (`#37` wrong 105Ah → **#31** hub ✅). **FLAG:** `lithium rhino 48v 65ah` is still **wrong URL** — `#60` on `/parts/lithium-rhino-48v-105ah-kit`, not `/parts/lithium-rhino-48v-65ah-kit` (not the hub; 105Ah cannibalization continues). Cart landings still invisible. Brand head `lithium rhino` still out of the live top 100.

| Metric | Jul 28 | Aug 20 | Aug 24 |
|--------|------:|-------:|-------:|
| Ranked / checked | 10/22 | 13/26 | 12/26 |
| Top 10 | 0 | 1 (`113-LR51V65AH` #10) | 0 |
| Top 30 | 3 | 2 | 2 (`113-LR51V105AH` #13, `113-LR51V65AH` #14) |
| Wrong winning URL | 2 | 8 | 6 |

## Rank snapshot (Google US) — 2026-08-24

| Keyword | Aug 20 | Aug 24 | Winning URL | Target | Notes |
|---------|-------:|-------:|-------------|---------|-------|
| `lithium golf cart battery conversion kit` | #68 | **#66** ↑ | `/lithium-batteries` | hub ✅ | Generic commercial foothold holds |
| `lithium rhino battery` | #40 | **#57** ↓ | `/lithium-batteries` | hub ✅ | Soft brand slip |
| `lithium rhino golf cart battery` | #41 | **#41** = | `/lithium-batteries` | hub ✅ | |
| `lithium rhino conversion kit` | #37 | **#31** ↑ | `/lithium-batteries` | hub ✅ | Was 105Ah cannibal; now correct hub |
| `lithium rhino 48v` | #55 | **#54** ↑ | 48V 105Ah PDP | hub ⚠ | Still cannibalized |
| `lithium rhino 48v 65ah kit` | #52 | **out** LOST | — | 65Ah PDP | Retry after SE error → out of top 100 |
| `lithium rhino 48v 105ah` | #57 | **#58** ↓ | 105Ah kit PDP | PDP ✅ | |
| `lithium rhino 48v 65ah` | #60 | **#60** = | 105Ah kit PDP | 65Ah PDP ⚠ | **FLAG — still not 65Ah PDP** (105Ah, not hub) |
| `lithium rhino 48v 50ah` | #54 | **#55** ↓ | 105Ah kit PDP | 50Ah PDP ⚠ | |
| `lithium rhino 36v` | #58 | **#60** ↓ | hub | 36V 65Ah ⚠ | |
| `lithium rhino 72v` | #58 | **#67** ↓ | hub | 72V PDP ⚠ | |
| `lithium rhino` | out | **out** | — | hub | Still missing live top 100 |
| `113-LR51V65AH` | #10 | **#14** ↓ | hub | 65Ah kit ⚠ | Lost top 10; URL now hub (was Club Car DS) |
| `113-LR51V105AH` | #13 | **#13** = | 105Ah kit PDP | kit PDP ✅ | Retry after SE error — correct URL |
| `113-LR51V50AH` | #34 | **out** LOST | — | 50Ah kit | Protect-lane loss |
| Generic heads (`lithium golf cart battery`, `48v lithium…`) | out | out | — | hub | Still Phase 4 |
| Cart terms (EZGO/Club Car/Yamaha) | out | out | — | cart pages | No traction yet |

**Summary:** 12/26 ranked on the current money list · 0 top 10 · 2 top 30 · 6 wrong winning URL · 0 API errors (2 transient SE errors retried once; `48v 65ah kit` → out, `113-LR51V105AH` → #13).
Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts` → `scripts/seo/rank-snapshots/lithium-rhino/2026-08-24.json`.

### Target-URL mismatches (priority)

1. **FLAG — `lithium rhino 48v 65ah` still wrong URL:** `#60` on `/parts/lithium-rhino-48v-105ah-kit` · want `/parts/lithium-rhino-48v-65ah-kit` (not hub; 105Ah cannibalization).
2. **48V 105Ah kit is still eating sibling queries** — `lithium rhino 48v`, `48v 50ah` also land on `/parts/lithium-rhino-48v-105ah-kit`.
3. `113-LR51V65AH` → `/lithium-batteries` · want `/parts/lithium-rhino-48v-65ah-kit`
4. `lithium rhino 36v` → hub · want `/parts/lithium-rhino-36v-65ah-kit`
5. `lithium rhino 72v` → hub · want `/parts/lithium-rhino-72v-105ah-kit`

## Live surfaces

| URL | Role |
|-----|------|
| `/lithium-batteries` | Category hub + kit finder + featured brand kits |
| `/lithium-batteries/{cart}` | Model landings (EZGO / Club Car / Yamaha) — **not ranking** |
| `/parts/lithium-rhino-*` | Kit + battery-only PDPs |
| Insights | `/insights/lithium-vs-lead-acid-golf-cart-batteries-2026-guide` plus `/insights/best-lithium-batteries-for-golf-carts` |

## Open blockers / needs from Christopher

1. Approve before any checkout / HazMat freight tier / price changes.
2. No new generic head-term content until wrong winning URLs recrawl after Phase 3 capacity copy.

## Next actions

1. Recheck the six wrong winning URLs after Google recrawls Phase 3 capacity-specific copy (allow more weeks).
2. Convert the **#66 conversion-kit** query on the hub (already the right URL).
3. Watch `113-LR51V65AH` hub landing and `113-LR51V50AH` loss (protect-only).
4. Cart pages stay watch-only until they appear in GSC/DataForSEO.

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
| 2026-08-24 | Weekly automation: soft week (13→12 ranked; lost PN top 10); 65Ah still on 105Ah PDP; no code PR — await Phase 3 recrawl |
