# Lithium Batteries — Status

**Last updated:** 2026-10-05
**Active phase:** Convert already-ranking brand/PN URLs (Phase 2–3). Phase 4 generic expand still deferred.
**Weekly automation:** Cloud Agent run 2026-10-05 (Monday). Compared vs on-disk **2026-09-01** (interim Sep agent-branch snapshots may not be on `main`).
**Baseline ranks:** DataForSEO 2026-07-28 vs **2026-08-20** vs **2026-09-01** vs **2026-10-05** (`scripts/seo/rank-snapshots/lithium-rhino/`)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Hub + carts + PDPs + Merchant + docs + keyword map |
| 1 Measurement | ✅ | Rank script live; weekly Cloud Agent Mondays ~10:30 |
| 2 Conversion | ✅ shipped | Hub CTAs / featured kits / kit finder; PDP HazMat + cart links |
| 3 Brand/Ah URLs | ✅ shipped | Exact-capacity copy/links + cart-schema deconfliction (2026-08-20). Sibling Ah cannibalization still the SERP problem. |
| 4 Expand | ⬜ | Generic conversion-kit foothold **LOST** (#66 → out). Phase 4 still deferred. |

## Progress vs Sep 1 (Google US)

Soft ranked count (**13 → 10**), but **better depth** (2 → **4** top 10; 2 → **6** top 30) and **worse URL mismatches** (4 → **7**). Brand conversion kit jumped into top 10 on the hub. Sibling Ah PDPs are stealing capacity SERPs again (50Ah ↔ 105Ah ↔ 120Ah).

| Metric | Jul 28 | Aug 20 | Sep 1 | Oct 5 |
|--------|-------:|-------:|------:|------:|
| Ranked / checked | 10/22 | 13/26 | 13/26 | **10/26** |
| Top 10 | 0 | 1 | 2 | **4** |
| Top 30 | 3 | 2 | 2 | **6** |
| Wrong winning URL | 2 | 8 | 4 | **7** |

PN retries patched into the same snapshot (0 remaining API errors). `113-LR51V65AH` retried cleanly but is **out** of top 100. `113-LR51V50AH` retry → **#5** on `/parts` (want 50Ah kit).

## Rank snapshot (Google US) — 2026-10-05

| Keyword | Sep 1 | Oct 5 | Winning URL | Target | Notes |
|---------|------:|------:|-------------|---------|-------|
| `lithium golf cart battery conversion kit` | #66 | **out** LOST | — | hub | Only prior generic foothold gone |
| `lithium rhino battery` | #40 | **out** LOST | — | hub | |
| `lithium rhino golf cart battery` | #41 | **out** LOST | — | hub | |
| `lithium rhino conversion kit` | #37 | **#8** ↑ | hub | hub ✅ | Best brand win this week |
| `lithium rhino 48v` | #54 ⚠ 120Ah | **#21** ↑ | 120Ah kit | hub ⚠ | Better rank, still 120Ah thief |
| `lithium rhino 48v 65ah` | #52 ✅ 65Ah | **#9** ↑ | **50Ah kit** | 65Ah ⚠ | **Not hub** — sibling 50Ah steals; want 65Ah kit |
| `lithium rhino 48v 65ah kit` | #58 | **#50** ↑ | 65Ah kit | 65Ah ✅ | Right URL |
| `lithium rhino 48v 105ah` | #58 ✅ | **#18** ↑ | 50Ah kit | 105Ah ⚠ | Was correct; now 50Ah steal |
| `lithium rhino 48v 50ah` | #54 ⚠ 120Ah | **#55** ↓ | 105Ah kit | 50Ah ⚠ | Swap cannibal (105 vs 120) |
| `lithium rhino 36v` | #67 ⚠ hub | **#63** ↑ | 36V 105Ah | 36V 65Ah ⚠ | Wrong Ah sibling |
| `lithium rhino 72v` | #54 ✅ | **#97** ↓ | hub | 72V ⚠ | Slipped + wrong URL |
| `lithium rhino` | out | out | — | hub | Still missing live top 100 |
| `113-LR51V65AH` | #9 ⚠ hub | **out** | — | 65Ah | Lost after retry |
| `113-LR51V105AH` | #9 ✅ | **#9** = | 105Ah kit | 105Ah ✅ | Holding |
| `113-LR51V50AH` | error | **#5** NEW | `/parts` | 50Ah ⚠ | Deep but wrong URL |
| Generic heads (`lithium golf cart battery`, `48v lithium…`) | out | out | — | hub | Still Phase 4 |
| Cart terms (EZGO/Club Car/Yamaha) | out | out | — | cart pages | Still no traction |

**Summary:** 10/26 ranked · 4 top 10 · 6 top 30 · 7 wrong winning URL · 0 API errors (after PN retry).
Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts` (PN retries patched into the same snapshot).

### Remaining target-URL mismatches

1. **FLAG (not hub):** `lithium rhino 48v 65ah` → `/parts/lithium-rhino-48v-50ah-kit` · want `/parts/lithium-rhino-48v-65ah-kit` (correct `…65ah kit` query still lands on 65Ah PDP at #50).
2. **50Ah PDP is the new sibling thief** — owns `lithium rhino 48v 65ah` and `lithium rhino 48v 105ah`.
3. `lithium rhino 48v` → 120Ah kit · want hub.
4. `lithium rhino 48v 50ah` → 105Ah kit · want 50Ah.
5. `lithium rhino 36v` → 36V 105Ah · want 36V 65Ah.
6. `lithium rhino 72v` → hub · want 72V kit.
7. `113-LR51V50AH` → `/parts` · want 50Ah kit.

## Live surfaces

| URL | Role |
|-----|------|
| `/lithium-batteries` | Category hub + kit finder + featured brand kits |
| `/lithium-batteries/{cart}` | Model landings (EZGO / Club Car / Yamaha) — **not ranking** |
| `/parts/lithium-rhino-*` | Kit + battery-only PDPs |
| Insights | `/insights/lithium-vs-lead-acid-golf-cart-batteries-2026-guide` plus `/insights/best-lithium-batteries-for-golf-carts` |

## Open blockers / needs from Christopher

1. Approve before any checkout / HazMat freight / price changes.
2. No new generic head-term content until sibling Ah mismatches settle (50Ah/105Ah/120Ah thieves).
3. Optional: merge weekly snapshot/STATUS commits to `main` so the next run's compare baseline is not stuck on Sep 1.

## Next actions

1. Watch the **50Ah PDP** the same way we watched 105Ah/120Ah — it is now the leftover capacity thief (`48v 65ah` + `48v 105ah`).
2. Protect the **#8 brand conversion-kit** hub win (correct URL).
3. Recheck `113-LR51V65AH` (out) and `113-LR51V50AH` (`/parts` vs kit PDP).
4. Cart pages + Phase 4 generics stay watch-only.

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
| 2026-10-05 | Weekly Cloud Agent: 10/26 · 4 top 10 · 6 top 30 · 7 wrong URL. Brand conversion kit #8 hub. `48v 65ah` #9 on **50Ah** (not hub). Generic conversion-kit LOST. No PR — SERP sibling cannibalization only. |
