# Lithium Batteries — Status

**Last updated:** 2026-09-01
**Active phase:** Convert already-ranking brand/PN URLs (Phase 2–3). Phase 4 generic expand still deferred.
**Weekly automation:** Still stale — last Cloud Agent run was 2026-07-28. Manual refresh 2026-09-01 (11 days after the Aug 20 cannibalization fix).
**Baseline ranks:** DataForSEO 2026-07-28 vs **2026-08-20** vs **2026-09-01** (`scripts/seo/rank-snapshots/lithium-rhino/`)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Hub + carts + PDPs + Merchant + docs + keyword map |
| 1 Measurement | ✅ | Rank script live; weekly automation has not refreshed since Jul 28 |
| 2 Conversion | ✅ shipped | Hub CTAs / featured kits / kit finder; PDP HazMat + cart links |
| 3 Brand/Ah URLs | ✅ shipped | Exact-capacity copy/links + cart-schema deconfliction (2026-08-20). Recrawl is working on the intended mismatches. |
| 4 Expand | ⬜ | Generic head terms still out except conversion-kit foothold #68 → **#66** |

## Progress vs Aug 20 (Google US)

**The cannibalization fix is taking.** Ranked count is flat (**13/26**), but wrong winning URLs **8 → 4**. The 48V 105Ah kit no longer owns 65Ah or “conversion kit.” Two part numbers are now top 10.

| Metric | Jul 28 | Aug 20 | Sep 1 |
|--------|-------:|-------:|------:|
| Ranked / checked | 10/22 | 13/26 | 13/26 |
| Top 10 | 0 | 1 | **2** (`113-LR51V65AH` #9, `113-LR51V105AH` #9) |
| Top 30 | 3 | 2 | 2 |
| Wrong winning URL | 2 | 8 | **4** |

`113-LR51V50AH` errored on Sep 1 (DataForSEO partial results; not charged). Last good read was Aug 20 #34 on the hub.

## Rank snapshot (Google US) — 2026-09-01

| Keyword | Aug 20 | Sep 1 | Winning URL | Target | Notes |
|---------|-------:|------:|-------------|---------|-------|
| `lithium golf cart battery conversion kit` | #68 | **#66** ↑ | `/lithium-batteries` | hub ✅ | Still the only generic commercial hit |
| `lithium rhino battery` | #40 | **#40** = | `/lithium-batteries` | hub ✅ | Holding |
| `lithium rhino golf cart battery` | #41 | **#41** = | `/lithium-batteries` | hub ✅ | |
| `lithium rhino conversion kit` | #37 ⚠ 105Ah | **#37** = | hub | hub ✅ | **Fixed** — was 105Ah PDP |
| `lithium rhino 48v 65ah` | #60 ⚠ 105Ah | **#52** ↑ | 65Ah kit | 65Ah ✅ | **Fixed** — +8 and correct URL |
| `lithium rhino 48v 65ah kit` | #52 | **#58** ↓ | 65Ah kit | 65Ah ✅ | Right URL, slipped 6 |
| `lithium rhino 48v 105ah` | #57 | **#58** ↓ | 105Ah kit | 105Ah ✅ | |
| `lithium rhino 72v` | #58 ⚠ hub | **#54** ↑ | 72V kit | 72V ✅ | **Fixed** |
| `lithium rhino 48v` | #55 ⚠ 105Ah | **#54** ↑ | 120Ah kit | hub ⚠ | Cannibalizer moved 105 → 120 |
| `lithium rhino 48v 50ah` | #54 ⚠ 105Ah | **#54** = | 120Ah kit | 50Ah ⚠ | Same 120Ah steal |
| `lithium rhino 36v` | #58 ⚠ 36V 105Ah | **#67** ↓ | hub | 36V 65Ah ⚠ | Worse rank, different wrong URL |
| `lithium rhino` | out | out | — | hub | Still missing live top 100 |
| `113-LR51V65AH` | #10 ⚠ Club Car DS | **#9** ↑ | hub | 65Ah ⚠ | Cart no longer wins; still not the kit PDP |
| `113-LR51V105AH` | #13 ⚠ cube | **#9** ↑ | 105Ah kit | 105Ah ✅ | **Fixed** — cube → kit |
| `113-LR51V50AH` | #34 ⚠ hub | error | — | 50Ah | Retry later |
| Generic heads (`lithium golf cart battery`, `48v lithium…`) | out | out | — | hub | Still Phase 4 |
| Cart terms (EZGO/Club Car/Yamaha) | out | out | — | cart pages | Still no traction |

**Summary:** 13/26 ranked · 2 top 10 · 2 top 30 · 4 wrong winning URL · 1 API error (`113-LR51V50AH`).
Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts` (PN retries patched into the same snapshot).

### Remaining target-URL mismatches

1. **48V 120Ah kit is the new sibling thief** — `lithium rhino 48v` and `lithium rhino 48v 50ah` now land on `/parts/lithium-rhino-48v-120ah-kit` (was 105Ah).
2. `113-LR51V65AH` → `/lithium-batteries` · want `/parts/lithium-rhino-48v-65ah-kit` (Club Car cart is no longer the winner).
3. `lithium rhino 36v` → hub · want `/parts/lithium-rhino-36v-65ah-kit`.

## Live surfaces

| URL | Role |
|-----|------|
| `/lithium-batteries` | Category hub + kit finder + featured brand kits |
| `/lithium-batteries/{cart}` | Model landings (EZGO / Club Car / Yamaha) — **not ranking** |
| `/parts/lithium-rhino-*` | Kit + battery-only PDPs |
| Insights | `/insights/lithium-vs-lead-acid-golf-cart-batteries-2026-guide` plus `/insights/best-lithium-batteries-for-golf-carts` |

## Open blockers / needs from Christopher

1. Optional: resume the Monday Cloud Agent rank job (or keep manual refreshes).
2. Approve before any checkout / HazMat freight / price changes.
3. No new generic head-term content until the four remaining wrong URLs settle.

## Next actions

1. Watch the 120Ah PDP the same way we watched 105Ah — it is now the leftover cannibal.
2. Recheck `113-LR51V65AH` until it leaves the hub for the 65Ah kit (cart schema already did its job).
3. Convert the **#66 conversion-kit** query on the hub (already the right URL).
4. Cart pages stay watch-only.

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
