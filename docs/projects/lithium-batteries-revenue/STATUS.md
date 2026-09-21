# Lithium Batteries — Status

**Last updated:** 2026-09-21
**Active phase:** Convert already-ranking brand/PN URLs (Phase 2–3). Phase 4 generic expand still deferred.
**Weekly automation:** Refreshed 2026-09-21 (Cloud Agent Monday run). On-disk baseline was still 2026-09-01 (interim agent-branch snapshots had not landed on main).
**Baseline ranks:** DataForSEO 2026-07-28 vs **2026-08-20** vs **2026-09-01** vs **2026-09-21** (`scripts/seo/rank-snapshots/lithium-rhino/`)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Hub + carts + PDPs + Merchant + docs + keyword map |
| 1 Measurement | ✅ | Rank script live; weekly Monday automation resumed |
| 2 Conversion | ✅ shipped | Hub CTAs / featured kits / kit finder; PDP HazMat + cart links |
| 3 Brand/Ah URLs | ✅ shipped | Exact-capacity copy/links + cart-schema deconfliction (2026-08-20). Recrawl gains largely wiped this week. |
| 4 Expand | ⬜ | Generic conversion-kit foothold **LOST** (#66 → out). Still deferred. |

## Progress vs Sep 1 (Google US)

**Soft week — brand SERPs mostly fell out of the top 100.** Ranked **13/26 → 3/26**. Only survivors are one brand hub query and two FSIP PNs (protect-only). Wrong-URL count **4 → 1** only because most prior mismatches are now unranked, not fixed.

| Metric | Jul 28 | Aug 20 | Sep 1 | Sep 21 |
|--------|-------:|-------:|------:|-------:|
| Ranked / checked | 10/22 | 13/26 | 13/26 | **3/26** |
| Top 10 | 0 | 1 | 2 | **2** (`113-LR51V50AH` #7, `113-LR51V65AH` #9) |
| Top 30 | 3 | 2 | 2 | 2 |
| Wrong winning URL | 2 | 8 | 4 | **1** |

`113-LR51V105AH` still errored after one retry (DataForSEO partial results; not charged). Last good read was Sep 1 #9 on the 105Ah kit.

## Rank snapshot (Google US) — 2026-09-21

| Keyword | Sep 1 | Sep 21 | Winning URL | Target | Notes |
|---------|------:|-------:|-------------|---------|-------|
| `lithium golf cart battery conversion kit` | #66 | **out** LOST | — | hub | Only generic commercial hit lost |
| `lithium rhino battery` | #40 | **out** LOST | — | hub | |
| `lithium rhino golf cart battery` | #41 | **#45** ↓ | hub | hub ✅ | Sole brand SERP still live |
| `lithium rhino conversion kit` | #37 | **out** LOST | — | hub | |
| `lithium rhino 48v 65ah` | #52 | **out** LOST | — | 65Ah | **Not on hub** — out of top 100 (no hub-vs-PDP flag) |
| `lithium rhino 48v 65ah kit` | #58 | **out** LOST | — | 65Ah | |
| `lithium rhino 48v 105ah` | #58 | **out** LOST | — | 105Ah | |
| `lithium rhino 48v` | #54 ⚠ 120Ah | **out** LOST | — | hub | Cannibal gone with the ranking |
| `lithium rhino 48v 50ah` | #54 ⚠ 120Ah | **out** LOST | — | 50Ah | |
| `lithium rhino 36v` | #67 ⚠ hub | **out** LOST | — | 36V 65Ah | |
| `lithium rhino 72v` | #54 | **out** LOST | — | 72V | |
| `lithium rhino` | out | out | — | hub | Still missing live top 100 |
| `113-LR51V65AH` | #9 ⚠ hub | **#9** = | hub | 65Ah ⚠ | Retry recovered; still hub not kit PDP |
| `113-LR51V105AH` | #9 | error | — | 105Ah | Retry still partial-results error |
| `113-LR51V50AH` | error | **#7** NEW | 50Ah kit | 50Ah ✅ | Protect-only PN holding |
| Generic heads (`lithium golf cart battery`, `48v lithium…`) | out | out | — | hub | Still Phase 4 |
| Cart terms (EZGO/Club Car/Yamaha) | out | out | — | cart pages | Still no traction |

**Summary:** 3/26 ranked · 2 top 10 · 2 top 30 · 1 wrong winning URL · 1 API error (`113-LR51V105AH`).
Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts` (PN retries patched into the same snapshot).

### Remaining target-URL mismatches

1. `113-LR51V65AH` → `/lithium-batteries` · want `/parts/lithium-rhino-48v-65ah-kit` (protect-only; cart schema already cleared earlier).
2. **`lithium rhino 48v 65ah` is out of top 100** — not ranking on the hub. Re-check next Monday before any PDP/hub copy change.

## Live surfaces

| URL | Role |
|-----|------|
| `/lithium-batteries` | Category hub + kit finder + featured brand kits |
| `/lithium-batteries/{cart}` | Model landings (EZGO / Club Car / Yamaha) — **not ranking** |
| `/parts/lithium-rhino-*` | Kit + battery-only PDPs |
| Insights | `/insights/lithium-vs-lead-acid-golf-cart-batteries-2026-guide` plus `/insights/best-lithium-batteries-for-golf-carts` |

## Open blockers / needs from Christopher

1. Soft-week brand wipe — watch next Monday before approving new content.
2. Approve before any checkout / HazMat freight / price changes.
3. No new generic head-term content until brand SERPs reappear (Phase 4 still deferred).

## Next actions

1. Re-pull next Monday — confirm whether brand Ah SERPs return or stay out.
2. Recheck `113-LR51V65AH` until it leaves the hub for the 65Ah kit.
3. Retry `113-LR51V105AH` (API error this run).
4. Cart pages stay watch-only. No code change this week (SERP volatility only).

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
| 2026-09-21 | Weekly automation: soft week 3/26 ranked; brand Ah SERPs + conversion-kit foothold LOST; `48v 65ah` out (not hub). No PR — SERP volatility, no code change. |
