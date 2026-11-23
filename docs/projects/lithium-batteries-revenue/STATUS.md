# Lithium Batteries — Status

**Last updated:** 2026-11-23
**Active phase:** Convert already-ranking brand/PN URLs (Phase 2–3). Phase 4 generic expand still deferred.
**Weekly automation:** Refreshed 2026-11-23 (Cloud Agent Monday cron). Prior on-disk baseline on `main` was still **2026-09-01** (2026-11-09 / 2026-11-16 interim agent-branch snapshots never landed).
**Baseline ranks:** DataForSEO 2026-07-28 → 2026-08-20 → 2026-09-01 → **2026-11-23** (`scripts/seo/rank-snapshots/lithium-rhino/`)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Hub + carts + PDPs + Merchant + docs + keyword map |
| 1 Measurement | ✅ | Rank script live; Monday automation running (advanced recovery needed again) |
| 2 Conversion | ✅ shipped | Hub CTAs / featured kits / kit finder; PDP HazMat + cart links |
| 3 Brand/Ah URLs | ✅ shipped | Exact-capacity copy/links + cart-schema deconfliction (2026-08-20). Sibling cannibalization still the blocker (**10** wrong URLs). |
| 4 Expand | ⬜ | Generic heads still out; conversion-kit foothold **LOST** again (was #43 hub on 2026-11-16 interim) |

## Progress vs Sep 1 (Google US)

Ranked count is up (**13 → 15**), and top-30 presence improved (**2 → 6**) including a brand #3 and a protect-lane PN at **#7**. Sibling cannibalization remains heavy: wrong winning URLs **4 → 10**. The Sep 1 conversion-kit foothold (#66 hub) is **out** this week (was recovered to #43 on the 11-16 interim).

| Metric | Jul 28 | Aug 20 | Sep 1 | Nov 23 |
|--------|-------:|-------:|------:|-------:|
| Ranked / checked | 10/22 | 13/26 | 13/26 | **15/26** |
| Top 10 | 0 | 1 | 2 | **2** (`lithium rhino 48v` #3, `113-LR51V105AH` #7) |
| Top 30 | 3 | 2 | 2 | **6** |
| Wrong winning URL | 2 | 8 | 4 | **10** |

**65Ah hub flag:** `lithium rhino 48v 65ah` is **not on the hub**. First FEE hit is `/parts/lithium-rhino-36v-65ah-kit` (#32) — wrong voltage sibling, not `/parts/lithium-rhino-48v-65ah-kit`. (Same mismatch pattern as the 2026-11-16 interim.)

**DataForSEO note:** `live/regular` again returned obfuscated `google.com/goto` organic URLs for every keyword (**third consecutive Monday**: 2026-11-09, 11-16, 11-23). Snapshot recovered via `live/advanced` using `website_name` / breadcrumb + title capacity inference (`source: dataforseo-live-advanced-breadcrumb`). Script fallback still deferred — not a PR this week.

## Rank snapshot (Google US) — 2026-11-23

| Keyword | Sep 1 | Nov 23 | Winning URL | Target | Notes |
|---------|------:|-------:|-------------|---------|-------|
| `lithium golf cart battery conversion kit` | #66 | **out LOST** | — | hub | Lost again (was #43 hub on 11-16 interim) |
| `48v lithium golf cart conversion kit` | out | **#49** NEW ⚠ | 120Ah kit | hub ⚠ | 120Ah sibling thief (was #26 on 11-16) |
| `48v 65ah lithium golf cart battery` | out | **#57** NEW ✓ | 65Ah kit | 65Ah ✓ | Correct kit (was battery-only #96 on 11-16) |
| `lithium rhino` | out | **#49** NEW ✓ | hub | hub ✓ | Right URL (was 120Ah #116 on 11-16) |
| `lithium rhino battery` | #40 | **#48** ↓ ✓ | hub | hub ✓ | Right URL, mid-pack |
| `lithium rhino golf cart battery` | #41 | **#26** ↑ ⚠ | **65Ah battery-only** | hub ⚠ | Recovered from out; wrong SKU |
| `lithium rhino conversion kit` | #37 | **#21** ↑ ⚠ | **72V 105Ah kit** | hub ⚠ | Stronger rank, wrong sibling |
| `lithium rhino 48v` | #54 ⚠ | **#3** ↑ ⚠ | **48V 170Ah battery** | hub ⚠ | Near page 1; wrong SKU |
| `lithium rhino 48v 65ah` | #52 ✓ kit | **#32** ↑ ⚠ | **36V 65Ah kit** | 65Ah kit ⚠ | **Not hub** — wrong voltage sibling |
| `lithium rhino 48v 65ah kit` | #58 | **#31** ↑ ⚠ | **170Ah Goliath kit** | 65Ah kit ⚠ | |
| `lithium rhino 48v 105ah` | #58 | **#30** ↑ ⚠ | 120Ah heated battery | 105Ah kit ⚠ | |
| `lithium rhino 48v 50ah` | #54 ⚠ | **#41** ↑ ✓ | 50Ah kit | 50Ah ✓ | **Fixed** vs Sep 1 hub steal |
| `lithium rhino 36v` | #67 ⚠ | **#35** ↑ ✓ | 36V 65Ah kit | 36V 65Ah ✓ | **Fixed** |
| `lithium rhino 72v` | #54 ✓ | **#63** ↓ ⚠ | 48V 170Ah battery | 72V kit ⚠ | |
| `113-LR51V65AH` | #9 ⚠ hub | **#15** ↓ ⚠ | **65Ah battery-only** | 65Ah kit ⚠ | Back in top 30; want kit not battery |
| `113-LR51V50AH` | error | **out** | — | 50Ah | Was #5 on 11-16 interim |
| `113-LR51V105AH` | #9 ✓ | **#7** ↑ ⚠ | **105Ah cube battery** | 105Ah kit ⚠ | Top 10 but cube battery steals kit |
| Generic heads (`lithium golf cart battery`, `48v lithium…`) | out | out | — | hub | Still Phase 4 |
| Cart terms (EZGO/Club Car/Yamaha) | out | out | — | cart pages | Still no traction |

**Summary:** 15/26 ranked · 2 top 10 · 6 top 30 · 10 wrong winning URL · 0 API errors.
Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts` first pass, then advanced/breadcrumb recovery after `live/regular` URL obfuscation.

### Remaining target-URL mismatches

1. **`lithium rhino 48v 65ah` → `/parts/lithium-rhino-36v-65ah-kit`** · want `/parts/lithium-rhino-48v-65ah-kit` — **not the hub**; Ah matches, voltage does not.
2. **`lithium rhino 48v 65ah kit` → `/parts/lithium-rhino-48v-170ah-goliath-kit`** · want 65Ah kit.
3. **48V 170Ah battery** steals broad `lithium rhino 48v` (#3) and `lithium rhino 72v`.
4. **120Ah kit / heated battery** steals `48v lithium golf cart conversion kit` and `lithium rhino 48v 105ah`.
5. **72V 105Ah kit** steals `lithium rhino conversion kit` (want hub).
6. **65Ah battery-only** steals `lithium rhino golf cart battery` and PN `113-LR51V65AH` (want kit).
7. **105Ah cube battery** steals PN `113-LR51V105AH` (want kit).
8. Conversion-kit generic **out** (was hub #66 Sep 1 / #43 Nov 16 interim).

## Live surfaces

| URL | Role |
|-----|------|
| `/lithium-batteries` | Category hub + kit finder + featured brand kits |
| `/lithium-batteries/{cart}` | Model landings (EZGO / Club Car / Yamaha) — **not ranking** |
| `/parts/lithium-rhino-*` | Kit + battery-only PDPs |
| Insights | `/insights/lithium-vs-lead-acid-golf-cart-batteries-2026-guide` plus `/insights/best-lithium-batteries-for-golf-carts` |

## Open blockers / needs from Christopher

1. Approve before any checkout / HazMat freight / price changes.
2. No new generic head-term content until brand wrong-URL set settles.
3. Optional later: teach `lithium-rhino-rank-check.ts` an advanced/breadcrumb fallback if `live/regular` keeps returning `google.com/goto` — third consecutive Monday of the quirk; still measurement-only, no PR this week.

## Next actions

1. Watch voltage/Ah sibling cannibalization on brand SERPs (36V vs 48V on the 65Ah query, 170Ah / Goliath / 120Ah thieves, battery-only vs kit).
2. Recheck the lost **conversion-kit** hub ranking next Monday (was #43 interim, out today).
3. Keep PN protect watch: `113-LR51V105AH` #7 and `113-LR51V65AH` #15 are live but on battery-only/cube — want kit PDPs; `113-LR51V50AH` out again.
4. Cart pages stay watch-only. Phase 4 still deferred.
5. No code/PR this week — SERP sibling cannibalization + mid-pack churn + DataForSEO URL obfuscation only; no checkout/Stripe/freight/price touches.

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
| 2026-11-23 | Monday cron: 15/26 ranked after advanced recovery; conversion-kit LOST; 65Ah still wrong-voltage sibling (not hub); no PR — sibling cannibal + DataForSEO goto quirk only. |
