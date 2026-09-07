# Lithium Batteries — Status

**Last updated:** 2026-09-07
**Active phase:** Convert already-ranking brand/PN URLs (Phase 2–3). Phase 4 generic expand still deferred.
**Weekly automation:** Refreshed 2026-09-07 (Cloud Agent Monday run). Secrets `DATAFORSEO_LOGIN` / `DATAFORSEO_PASSWORD` OK.
**Baseline ranks:** DataForSEO 2026-07-28 vs **2026-09-01** vs **2026-09-07** (`scripts/seo/rank-snapshots/lithium-rhino/`)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Hub + carts + PDPs + Merchant + docs + keyword map |
| 1 Measurement | ✅ | Rank script live; weekly automation resumed 2026-09-07 |
| 2 Conversion | ✅ shipped | Hub CTAs / featured kits / kit finder; PDP HazMat + cart links |
| 3 Brand/Ah URLs | ✅ shipped | Exact-capacity copy/links + cart-schema deconfliction (2026-08-20). Recrawl still settling sibling cannibals. |
| 4 Expand | ⬜ | Generic head terms still out; conversion-kit foothold **LOST** this week (#66 → out) |

## Progress vs Sep 1 (Google US)

Soft week vs Sep 1: ranked **13 → 12**, wrong URLs **4 → 5**, and the only generic commercial hit dropped out of top 100. Brand Ah PDPs mostly hold; **`lithium rhino 48v 65ah` stays on the correct 65Ah kit** (not the hub).

| Metric | Jul 28 | Sep 1 | Sep 7 |
|--------|-------:|------:|------:|
| Ranked / checked | 10/22 | 13/26 | **12/26** |
| Top 10 | 0 | 2 | **2** (`113-LR51V105AH` #8, `113-LR51V65AH` #9) |
| Top 30 | 3 | 2 | 2 |
| Wrong winning URL | 2 | 4 | **5** |

`113-LR51V50AH` errored again on Sep 7 (DataForSEO Internal SE Server Error on retry; not charged). Last good read was Aug 20 #34 on the hub.

## Rank snapshot (Google US) — 2026-09-07

| Keyword | Sep 1 | Sep 7 | Winning URL | Target | Notes |
|---------|------:|------:|-------------|---------|-------|
| `lithium golf cart battery conversion kit` | #66 | **out** LOST | — | hub | Only generic foothold gone |
| `lithium rhino battery` | #40 | **#43** ↓ | hub | hub ✅ | Soft slip |
| `lithium rhino golf cart battery` | #41 | **#43** ↓ | hub | hub ✅ | |
| `lithium rhino conversion kit` | #37 | **#37** = | hub | hub ✅ | Holding |
| `lithium rhino 48v 65ah` | #52 | **#56** ↓ | 65Ah kit | 65Ah ✅ | **Not hub** — correct PDP |
| `lithium rhino 48v 65ah kit` | #58 | **#53** ↑ | 65Ah kit | 65Ah ✅ | Best 65Ah kit rank this cycle |
| `lithium rhino 48v 105ah` | #58 | **#57** ↑ | **cube kit** | 105Ah ⚠ | Sibling steal (cube vs kit) |
| `lithium rhino 72v` | #54 | **#51** ↑ | 72V kit | 72V ✅ | |
| `lithium rhino 48v` | #54 ⚠ 120Ah | **#58** ↓ | **105Ah kit** | hub ⚠ | Cannibal swung 120 → 105 |
| `lithium rhino 48v 50ah` | #54 ⚠ 120Ah | **#59** ↓ | 120Ah kit | 50Ah ⚠ | Still 120Ah thief |
| `lithium rhino 36v` | #67 ⚠ hub | **#64** ↑ | hub | 36V 65Ah ⚠ | Better rank, still wrong URL |
| `lithium rhino` | out | out | — | hub | Still missing live top 100 |
| `113-LR51V65AH` | #9 ⚠ hub | **#9** = | hub | 65Ah ⚠ | Protect-only; still hub not kit |
| `113-LR51V105AH` | #9 | **#8** ↑ | 105Ah kit | 105Ah ✅ | |
| `113-LR51V50AH` | error | error | — | 50Ah | Retry → Internal SE Server Error |
| Generic heads (`lithium golf cart battery`, `48v lithium…`) | out | out | — | hub | Still Phase 4 |
| Cart terms (EZGO/Club Car/Yamaha) | out | out | — | cart pages | Still no traction |

**Summary:** 12/26 ranked · 2 top 10 · 2 top 30 · 5 wrong winning URL · 1 API error (`113-LR51V50AH`).
Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts` (one PN retry attempted; still errored).

### Remaining target-URL mismatches

1. **105Ah kit owns `lithium rhino 48v` again** — winning URL `/parts/lithium-rhino-48v-105ah-kit` (want hub). Was 120Ah on Sep 1.
2. **`lithium rhino 48v 105ah` → cube kit** — `/parts/lithium-rhino-48v-105ah-cube-kit` · want `/parts/lithium-rhino-48v-105ah-kit`.
3. **48V 120Ah still steals 50Ah** — `lithium rhino 48v 50ah` → `/parts/lithium-rhino-48v-120ah-kit`.
4. `113-LR51V65AH` → `/lithium-batteries` · want `/parts/lithium-rhino-48v-65ah-kit`.
5. `lithium rhino 36v` → hub · want `/parts/lithium-rhino-36v-65ah-kit`.

**Cleared / not flagged:** `lithium rhino 48v 65ah` is **not** on the hub — it ranks on `/parts/lithium-rhino-48v-65ah-kit`.

## Live surfaces

| URL | Role |
|-----|------|
| `/lithium-batteries` | Category hub + kit finder + featured brand kits |
| `/lithium-batteries/{cart}` | Model landings (EZGO / Club Car / Yamaha) — **not ranking** |
| `/parts/lithium-rhino-*` | Kit + battery-only PDPs |
| Insights | `/insights/lithium-vs-lead-acid-golf-cart-batteries-2026-guide` plus `/insights/best-lithium-batteries-for-golf-carts` |

## Open blockers / needs from Christopher

1. Approve before any checkout / HazMat freight / price changes.
2. No new generic head-term content until wrong URLs settle (and until the conversion-kit foothold returns).

## Next actions

1. Watch 105Ah vs 120Ah sibling swing on `lithium rhino 48v` / `48v 50ah` — no new copy until one sticks.
2. Watch cube vs standard 105Ah kit on `lithium rhino 48v 105ah`.
3. Recheck `113-LR51V65AH` until it leaves the hub for the 65Ah kit (protect-only).
4. Re-acquire **generic conversion-kit** on the hub if it reappears in top 100.
5. Cart pages stay watch-only.
6. No PR this week — SERP volatility / mid-pack URL mismatches only; no code change required.

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
| 2026-09-07 | Weekly automation run: soft week (12/26, conversion-kit LOST); 65Ah stays on correct PDP (not hub); no PR — SERP only. |
