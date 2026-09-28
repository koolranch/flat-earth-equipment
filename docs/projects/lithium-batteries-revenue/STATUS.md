# Lithium Batteries — Status

**Last updated:** 2026-09-28
**Active phase:** Convert already-ranking brand/PN URLs (Phase 2–3). Phase 4 generic expand still deferred.
**Weekly automation:** Cloud Agent run 2026-09-28 (Monday). On-disk compare baseline was still 2026-09-01 (interim Sep 7/14/21 agent-branch snapshots never landed on `main`).
**Baseline ranks:** DataForSEO 2026-07-28 vs **2026-09-01** vs **2026-09-28** (`scripts/seo/rank-snapshots/lithium-rhino/`)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Hub + carts + PDPs + Merchant + docs + keyword map |
| 1 Measurement | ✅ | Rank script live; weekly Monday automation resumed 2026-09-28 |
| 2 Conversion | ✅ shipped | Hub CTAs / featured kits / kit finder; PDP HazMat + cart links |
| 3 Brand/Ah URLs | ✅ shipped | Exact-capacity copy/links + cart-schema deconfliction (2026-08-20). Sibling PDP cannibalization is worse this week (9 wrong URLs). |
| 4 Expand | ⬜ | Generic conversion-kit foothold **LOST** (#66→out). No other generic heads. |

## Progress vs Sep 1 (Google US)

**Softer ranked count, better depth, worse URL targeting.** Ranked **13 → 11**, but top 10 **2 → 3** and top 30 **2 → 6**. Wrong winning URLs **4 → 9** — sibling kits (120Ah / Goliath / cube / heated) are stealing Ah-intent SERPs again. Generic + brand “conversion kit” both dropped out of the top 100.

| Metric | Jul 28 | Sep 1 | Sep 28 |
|--------|-------:|------:|-------:|
| Ranked / checked | 10/22 | 13/26 | **11/26** |
| Top 10 | 0 | 2 | **3** (`113-LR51V50AH` #5, `113-LR51V65AH` #6, `113-LR51V105AH` #8) |
| Top 30 | 3 | 2 | **6** |
| Wrong winning URL | 2 | 4 | **9** |
| API errors | — | 1 | **0** (after one PN retry) |

## Rank snapshot (Google US) — 2026-09-28

| Keyword | Sep 1 | Sep 28 | Winning URL | Target | Notes |
|---------|------:|-------:|-------------|---------|-------|
| `lithium golf cart battery conversion kit` | #66 | **out** LOST | — | hub | Conversion-kit foothold gone |
| `lithium rhino battery` | #40 | **#43** ↓ | hub | hub ✅ | Holding mid-40s |
| `lithium rhino golf cart battery` | #41 | **#42** ↓ | hub | hub ✅ | |
| `lithium rhino conversion kit` | #37 | **out** LOST | — | hub | Brand conversion kit lost |
| `lithium rhino 48v 65ah` | #52 ✅ 65Ah | **#15** ↑ | **120Ah kit** | 65Ah ⚠ | **FLAG:** not hub, but wrong sibling (120Ah) — want `/parts/lithium-rhino-48v-65ah-kit` |
| `lithium rhino 48v 65ah kit` | #58 ✅ 65Ah | **#16** ↑ | Goliath 170Ah | 65Ah ⚠ | Right intent, wrong kit |
| `lithium rhino 48v 105ah` | #58 | **out** LOST | — | 105Ah | |
| `lithium rhino 72v` | #54 ✅ 72V | **#56** ↓ | 72V 170Ah | 72V 105Ah ⚠ | Sibling steal |
| `lithium rhino 48v` | #54 ⚠ 120Ah | **#51** ↑ | 105Ah kit | hub ⚠ | Cannibalizer swung back to 105Ah |
| `lithium rhino 48v 50ah` | #54 ⚠ 120Ah | **#21** ↑ | 120Ah heated | 50Ah ⚠ | |
| `lithium rhino 36v` | #67 ⚠ hub | **#63** ↑ | 36V 105Ah | 36V 65Ah ⚠ | |
| `lithium rhino` | out | out | — | hub | Still missing live top 100 |
| `113-LR51V65AH` | error | **#6** NEW | 120Ah heated | 65Ah ⚠ | Top 10 but wrong PDP |
| `113-LR51V105AH` | #9 ✅ kit | **#8** ↑ | 105Ah **cube** | 105Ah kit ⚠ | Cube stole the kit again |
| `113-LR51V50AH` | error | **#5** NEW | `/parts` | 50Ah ⚠ | Catalog root, not kit PDP |
| Generic heads (`lithium golf cart battery`, `48v lithium…`) | out | out | — | hub | Still Phase 4 |
| Cart terms (EZGO/Club Car/Yamaha) | out | out | — | cart pages | Still no traction |

**Summary:** 11/26 ranked · 3 top 10 · 6 top 30 · 9 wrong winning URL · 0 API errors (after retry of `113-LR51V65AH`).
Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts`.

### Remaining target-URL mismatches

1. **FLAG — `lithium rhino 48v 65ah` is not on the hub, but also not the 65Ah kit** — wins at #15 on `/parts/lithium-rhino-48v-120ah-kit` (want `/parts/lithium-rhino-48v-65ah-kit`). Same pattern for `…65ah kit` → Goliath 170Ah.
2. **120Ah / heated / Goliath sibling thieves** — also eating `48v 50ah` and PN `113-LR51V65AH`.
3. `lithium rhino 48v` → 105Ah kit · want hub.
4. `lithium rhino 36v` → 36V 105Ah · want 36V 65Ah.
5. `lithium rhino 72v` → 72V 170Ah · want 72V 105Ah.
6. `113-LR51V105AH` → cube battery · want 105Ah kit.
7. `113-LR51V50AH` → `/parts` · want 50Ah kit.

## Live surfaces

| URL | Role |
|-----|------|
| `/lithium-batteries` | Category hub + kit finder + featured brand kits |
| `/lithium-batteries/{cart}` | Model landings (EZGO / Club Car / Yamaha) — **not ranking** |
| `/parts/lithium-rhino-*` | Kit + battery-only PDPs |
| Insights | `/insights/lithium-vs-lead-acid-golf-cart-batteries-2026-guide` plus `/insights/best-lithium-batteries-for-golf-carts` |

## Open blockers / needs from Christopher

1. Optional: merge this weekly STATUS/snapshot to `main` so next Monday’s compare baseline is not stuck on Sep 1.
2. Approve before any checkout / HazMat freight / price changes.
3. No new generic head-term content until sibling Ah cannibalization settles (9 wrong URLs this week).

## Next actions

1. Watch 120Ah / Goliath / cube / heated PDPs — they are the active cannibals for 65Ah and 50Ah intent.
2. Recheck `lithium rhino 48v 65ah` until it lands on `/parts/lithium-rhino-48v-65ah-kit` (currently 120Ah sibling, not hub).
3. Protect-only on FSIP PNs — all three are top 10 this week but on wrong URLs.
4. Cart pages stay watch-only. Phase 4 still deferred (conversion-kit generic lost).

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
| 2026-09-28 | Weekly automation: 11/26 ranked · 3 top 10 · 9 wrong URL. Conversion-kit foothold lost. 65Ah query #15 on 120Ah sibling (not hub). No PR — SERP cannibalization, no new code change this week. |
