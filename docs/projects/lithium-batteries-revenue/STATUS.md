# Lithium Batteries — Status

**Last updated:** 2026-11-02
**Active phase:** Convert already-ranking brand/PN URLs (Phase 2–3). Phase 4 generic expand still deferred.
**Weekly automation:** Cloud Agent Monday run refreshed. On-disk `main` compare baseline was still **2026-09-01** (interim Oct agent-branch snapshots did not land on `main`).
**Baseline ranks:** DataForSEO 2026-07-28 / 2026-08-20 / 2026-09-01 vs **2026-11-02** (`scripts/seo/rank-snapshots/lithium-rhino/`)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Hub + carts + PDPs + Merchant + docs + keyword map |
| 1 Measurement | ✅ | Rank script live; weekly automation refreshed 2026-11-02 |
| 2 Conversion | ✅ shipped | Hub CTAs / featured kits / kit finder; PDP HazMat + cart links |
| 3 Brand/Ah URLs | ✅ shipped | Exact-capacity copy/links + cart-schema deconfliction (2026-08-20). Recrawl settled the old 105Ah thief; 120Ah / Goliath / battery-only remain. |
| 4 Expand | ⬜ | Generic head terms still out. Prior conversion-kit foothold (#66 Sep 1) is **LOST**. New long-tail: `48v 65ah lithium golf cart battery` **#64** on correct 65Ah kit. |

## Progress vs Sep 1 (Google US)

**Soft regression on brand mid-pack — not a code-change trigger.** Ranked count **13/26 → 6/26**; top 10 **2 → 0**; wrong winning URLs **4 → 4**. Broad brand hubs that held #37–#41 on Sep 1 are out of the top 100. Sibling Ah/Goliath/battery cannibalization continues. **`lithium rhino 48v 65ah` is on the correct 65Ah kit PDP (not the hub)** — #101 after retry; do not flag hub mismatch.

| Metric | Jul 28 | Aug 20 | Sep 1 | Nov 2 |
|--------|-------:|-------:|------:|------:|
| Ranked / checked | 10/22 | 13/26 | 13/26 | **6/26** |
| Top 10 | 0 | 1 | 2 | **0** |
| Top 30 | 3 | 2 | 2 | **0** |
| Wrong winning URL | 2 | 8 | 4 | **4** |

`113-LR51V50AH` still errors after two retries (DataForSEO Internal SE / partial results; not charged). `113-LR51V65AH` + `113-LR51V105AH` returned clean outs (previously #9 on Sep 1).

## Rank snapshot (Google US) — 2026-11-02

| Keyword | Sep 1 | Nov 2 | Winning URL | Target | Notes |
|---------|------:|------:|-------------|---------|-------|
| `lithium golf cart battery conversion kit` | #66 | **out LOST** | — | hub | Only prior generic commercial foothold gone |
| `48v 65ah lithium golf cart battery` | out | **#64 NEW** | 65Ah kit | 65Ah ✅ | New long-tail on correct PDP |
| `lithium rhino battery` | #40 | **out LOST** | — | hub | |
| `lithium rhino golf cart battery` | #41 | **out LOST** | — | hub | |
| `lithium rhino conversion kit` | #37 | **out LOST** | — | hub | |
| `lithium rhino 48v 65ah` | #52 | **#101** ↓ | 65Ah kit | 65Ah ✅ | Correct URL — **not hub** |
| `lithium rhino 48v 65ah kit` | #58 | **out LOST** | — | 65Ah | First-pass out; retry API errors discarded |
| `lithium rhino 48v 105ah` | #58 | **#103** ↓ | 120Ah kit | 105Ah ⚠ | 120Ah thief |
| `lithium rhino 72v` | #54 | **#108** ↓ | 72V 170Ah kit | 72V 105Ah ⚠ | Goliath thief |
| `lithium rhino 48v` | #54 ⚠ 120Ah | **#101** ↓ | 120Ah kit | hub ⚠ | Still 120Ah, not hub |
| `lithium rhino 48v 50ah` | #54 ⚠ 120Ah | **#71** ↓ | 65Ah battery | 50Ah ⚠ | Battery-only steal (was 120Ah) |
| `lithium rhino 36v` | #67 | **out LOST** | — | 36V 65Ah | |
| `lithium rhino` | out | out | — | hub | |
| `113-LR51V65AH` | #9 | **out LOST** | — | 65Ah | Clean out after restore |
| `113-LR51V105AH` | #9 | **out LOST** | — | 105Ah | Clean out after restore |
| `113-LR51V50AH` | error | error | — | 50Ah | Retry later |
| Generic heads (`lithium golf cart battery`, `48v lithium…`) | out | out | — | hub | Still Phase 4 |
| Cart terms (EZGO/Club Car/Yamaha) | out | out | — | cart pages | Still no traction |

**Summary:** 6/26 ranked · 0 top 10 · 0 top 30 · 4 wrong winning URL · 1 API error (`113-LR51V50AH`).
Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts` (brand/PN retries patched into the same snapshot; first-pass outs restored where retries only returned Internal SE errors).

### Remaining target-URL mismatches

1. **48V 120Ah kit** — `lithium rhino 48v` and `lithium rhino 48v 105ah` land on `/parts/lithium-rhino-48v-120ah-kit` (want hub / 105Ah kit).
2. **`lithium rhino 48v 50ah`** → `/parts/lithium-rhino-48v-65ah-battery` · want `/parts/lithium-rhino-48v-50ah-kit`.
3. **`lithium rhino 72v`** → `/parts/lithium-rhino-72v-170ah-kit` · want `/parts/lithium-rhino-72v-105ah-kit`.

**Not a hub mismatch:** `lithium rhino 48v 65ah` → `/parts/lithium-rhino-48v-65ah-kit` ✅ (deep #101).

## Live surfaces

| URL | Role |
|-----|------|
| `/lithium-batteries` | Category hub + kit finder + featured brand kits |
| `/lithium-batteries/{cart}` | Model landings (EZGO / Club Car / Yamaha) — **not ranking** |
| `/parts/lithium-rhino-*` | Kit + battery-only PDPs |
| Insights | `/insights/lithium-vs-lead-acid-golf-cart-batteries-2026-guide` plus `/insights/best-lithium-batteries-for-golf-carts` |

## Open blockers / needs from Christopher

1. Optional: merge weekly STATUS/snapshot PRs (or land on `main`) so the next Monday compare is not stuck on Sep 1.
2. Approve before any checkout / HazMat freight / price changes.
3. No new generic head-term content until sibling Ah/Goliath/battery wrong URLs settle — Phase 4 still deferred.

## Next actions

1. Watch 120Ah / 65Ah-battery / 72V-170Ah sibling thieves (SERP volatility + cannibalization — no new code this week).
2. Recheck PN protect-only rows when DataForSEO stops Internal-SE-erroring `113-LR51V50AH`.
3. Convert the new **#64** `48v 65ah lithium golf cart battery` hit (already correct 65Ah kit URL).
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
| 2026-11-02 | Weekly refresh: 6/26 ranked · 0 top 10 · 4 wrong URL. Brand mid-pack soft; conversion-kit LOST; 65Ah on correct kit not hub; no code/PR — SERP volatility + sibling cannibal only. |
