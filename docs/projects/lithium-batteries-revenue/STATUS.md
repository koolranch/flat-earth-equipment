# Lithium Batteries — Status

**Last updated:** 2026-08-31
**Active phase:** Convert already-ranking brand/PN URLs (Phase 2–3). Phase 4 generic expand still deferred.
**Weekly automation:** Refreshed today (Cloud Agent Monday cron).
**Baseline ranks:** DataForSEO 2026-07-28 vs **2026-08-31** (`scripts/seo/rank-snapshots/lithium-rhino/2026-08-31.json`)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Hub + carts + PDPs + Merchant + docs + keyword map |
| 1 Measurement | ✅ | Rank script live; weekly Monday automation resumed |
| 2 Conversion | ✅ shipped | Hub CTAs / featured kits / kit finder; PDP HazMat + cart links |
| 3 Brand/Ah URLs | ✅ shipped | Exact SKU descriptions, capacity-specific copy/links, cart-schema deconfliction |
| 4 Expand | ⬜ | Generic head terms still out except conversion-kit foothold at #63 |

## Progress vs Jul 28 (Google US)

**Best week so far.** Ranked money keywords **10 → 14** (26-keyword list). Three FSIP PN top-10s (two on correct kit PDPs). Generic commercial foothold improved (`lithium golf cart battery conversion kit` #63, was out). **FLAG cleared:** `lithium rhino 48v 65ah` is back on `/parts/lithium-rhino-48v-65ah-kit` (not hub / not 105Ah). Wrong winning URLs **8 → 4** vs Aug 20. Cart landings still invisible. Brand head `lithium rhino` still out of live top 100.

| Metric | Jul 28 | Aug 20 | Aug 31 |
|--------|-------:|-------:|-------:|
| Ranked / checked | 10/22 | 13/26 | **14/26** |
| Top 10 | 0 | 1 | **3** (all FSIP PNs) |
| Top 30 | 3 | 2 | **3** |
| Wrong winning URL | 2 | 8 | **4** |
| API errors | 0 | 1 (retried) | **0** |

## Rank snapshot (Google US) — 2026-08-31

| Keyword | Jul 28 | Aug 20 | Aug 31 | Winning URL | Target | Notes |
|---------|-------:|-------:|-------:|-------------|---------|-------|
| `lithium golf cart battery conversion kit` | out | #68 | **#63** ↑ | `/lithium-batteries` | hub ✅ | Best generic commercial hold |
| `lithium rhino battery` | #43 | #40 | **#40** = | `/lithium-batteries` | hub ✅ | Best brand hold |
| `lithium rhino golf cart battery` | #41 | #41 | **#41** = | `/lithium-batteries` | hub ✅ | |
| `lithium rhino conversion kit` | — | #37 ⚠105Ah | **#37** = | `/lithium-batteries` | hub ✅ | Cannibalization fixed |
| `lithium rhino 48v` | — | #55 ⚠105Ah | **#55** = | 48V 120Ah PDP | hub ⚠ | New cannibal: 120Ah |
| `lithium rhino 48v 65ah` | #45 ✅ | #60 ⚠105Ah | **#58** ↑ ✅ | 65Ah kit PDP | 65Ah PDP ✅ | **FLAG cleared** |
| `lithium rhino 48v 65ah kit` | — | #52 | **#58** ↓ | 65Ah kit PDP | PDP ✅ | Correct URL held |
| `lithium rhino 48v 105ah` | out | #57 | **#58** ↓ | 105Ah kit PDP | PDP ✅ | |
| `lithium rhino 48v 50ah` | #48 ✅ | #54 ⚠105Ah | **#54** = | 48V 120Ah PDP | 50Ah PDP ⚠ | Still wrong Ah |
| `lithium rhino 36v` | — | #58 ⚠105Ah | **#67** ↓ | hub | 36V 65Ah ⚠ | Softened + wrong URL |
| `lithium rhino 72v` | — | #58 ⚠hub | **#57** ↑ ✅ | 72V 105Ah PDP | PDP ✅ | Target match recovered |
| `lithium rhino` | #51 | out | **out** | — | hub | Still lost vs Jul baseline |
| `113-LR51V65AH` | #13 | #10 ⚠cart | **#9** ↑ | hub | 65Ah kit ⚠ | Top 10 but wrong URL |
| `113-LR51V50AH` | #18 | #34 | **#7** ↑ ✅ | 50Ah kit PDP | PDP ✅ | Protect-lane win |
| `113-LR51V105AH` | #18 | #13 ⚠cube | **#8** ↑ ✅ | 105Ah kit PDP | PDP ✅ | Protect-lane win |
| Generic heads (`lithium golf cart battery`, `48v lithium…`) | out | out | out | — | hub | Still Phase 4 |
| Cart terms (EZGO/Club Car/Yamaha) | out | out | out | — | cart pages | No traction yet |

**Summary:** 14/26 ranked · 3 top 10 · 3 top 30 · 4 wrong winning URL · 0 API errors.
Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts` → `scripts/seo/rank-snapshots/lithium-rhino/2026-08-31.json`.

### Target-URL mismatches (priority)

1. **48V 120Ah kit is now eating sibling queries** (was 105Ah) — `lithium rhino 48v` and `lithium rhino 48v 50ah` land on `/parts/lithium-rhino-48v-120ah-kit`.
2. `113-LR51V65AH` → `/lithium-batteries` · want `/parts/lithium-rhino-48v-65ah-kit`
3. `lithium rhino 36v` → hub · want `/parts/lithium-rhino-36v-65ah-kit`
4. ~~`lithium rhino 48v 65ah` wrong URL~~ — **resolved** (correct 65Ah PDP)

## Live surfaces

| URL | Role |
|-----|------|
| `/lithium-batteries` | Category hub + kit finder + featured brand kits |
| `/lithium-batteries/{cart}` | Model landings (EZGO / Club Car / Yamaha) — **not ranking** |
| `/parts/lithium-rhino-*` | Kit + battery-only PDPs |
| Insights | `/insights/lithium-vs-lead-acid-golf-cart-batteries-2026-guide` plus `/insights/best-lithium-batteries-for-golf-carts` |

## Open blockers / needs from Christopher

1. Approve before any checkout / HazMat freight tier / price changes.
2. No new generic head-term content until remaining wrong winning URLs recrawl (especially 120Ah cannibalization).

## Next actions

1. Watch whether 120Ah PDP keeps stealing `48v` / `48v 50ah` after recrawl (2–4 weeks).
2. Convert the **#63 conversion-kit** query on the hub (already the right URL).
3. Prefer hub → 65Ah kit internal links for `113-LR51V65AH` SERP (protect top-10 position, fix URL).
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
| 2026-08-25 | Shopping free-freight test on three Demand-kit SKUs only: `113-LR51V65AH`, `113-LR38V105AH`, `113-LR51V105AH`. Checkout + Merchant must both show $0. Leave 120Ah / 72V / Goliath / battery-only on paid HazMat bands. |
| 2026-08-31 | Weekly automation: 14/26 · 3 top 10 · 4 wrong URL; 65Ah FLAG cleared; 120Ah now cannibalizes `48v`/`50ah`; no code PR |
