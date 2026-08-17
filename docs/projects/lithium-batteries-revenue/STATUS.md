# Lithium Batteries — Status

**Last updated:** 2026-08-17  
**Active phase:** Phases 1–3 code shipping (awaiting deploy)  
**Weekly automation:** Live (this run → branch `cursor/lithium-batteries-rank-status-312d`)  
**Latest ranks:** DataForSEO 2026-08-17 (`scripts/seo/rank-snapshots/lithium-rhino/2026-08-17.json`)  
**Prior compare:** 2026-07-28 baseline (26-KW map; Jul 28 had 22 rows)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Hub + carts + PDPs + Merchant + docs + keyword map |
| 1 Measurement | ✅ | Rank script + revenue baseline helper; weekly automation live |
| 2 Conversion | ✅ code | Hub CTAs / featured kits / kit finder; PDP HazMat + cart links — **deploy pending** |
| 3 Brand/Ah URLs | ✅ code | Lithium meta titles; target URL map; hub deep links — **deploy pending** |
| 4 Expand | ⬜ | Generic head terms deferred until brand/cart traction |

## Rank snapshot (Google US) — 2026-08-17 (automation run)

| Keyword | Jul 28 | Aug 17 | Winning URL | Target | Notes |
|---------|-------:|-------:|-------------|---------|-------|
| `lithium golf cart battery` | out | out | — | hub | ~18k/mo — Phase 4 |
| `golf cart lithium battery` | — | out | — | hub | |
| `48v lithium golf cart battery` | out | out | — | hub | |
| `lithium golf cart battery conversion kit` | out | **#65** | `/lithium-batteries` | hub ✅ | NEW generic foothold |
| `48v lithium golf cart conversion kit` | — | out | — | hub | |
| `lifepo4 golf cart battery 48v` | — | out | — | hub | Map renamed vs Jul `lifepo4…` |
| `48v 65ah lithium golf cart battery` | — | out | — | 65Ah PDP | |
| `lithium rhino` | #51 | out | — | hub | LOST mid-pack |
| `lithium rhino battery` | #43 | **#43** | `/lithium-batteries` | hub ✅ | Stable |
| `lithium rhino golf cart battery` | #41 | **#44** | `/lithium-batteries` | hub ✅ | Slight slip |
| `lithium rhino conversion kit` | — | **#39** | `/parts/lithium-rhino-48v-105ah-kit` | hub ⚠ | Wrong URL (105Ah kit) |
| `lithium rhino 48v` | — | **#50** | `/parts/lithium-rhino-48v-105ah-kit` | hub ⚠ | Wrong URL (105Ah kit) |
| `lithium rhino 48v 65ah` | #45 | **#60** | `/parts/lithium-rhino-48v-105ah-kit` | 65Ah PDP ⚠ | **FLAG:** not hub, but wrong Ah — want `/parts/lithium-rhino-48v-65ah-kit` |
| `lithium rhino 48v 65ah kit` | — | API error | — | 65Ah PDP | Retry next Monday (still error after one retry) |
| `lithium rhino 48v 105ah` | out | **#56** | `/parts/lithium-rhino-48v-105ah-kit` | 105Ah PDP ✅ | NEW correct PDP |
| `lithium rhino 48v 50ah` | #48 | **#53** | `/parts/lithium-rhino-48v-105ah-kit` | 50Ah PDP ⚠ | Wrong Ah PDP |
| `lithium rhino 36v` | — | **#61** | `/lithium-batteries` | 36V PDP ⚠ | Hub instead of kit |
| `lithium rhino 72v` | — | **#60** | `/lithium-batteries` | 72V PDP ⚠ | Hub instead of kit |
| Cart terms (EZGO/Club Car/Yamaha) | out | out | — | cart pages | All 5 still out |
| `113-LR51V65AH` | #13 | **#8** | `/lithium-batteries/club-car-ds-48v` | 65Ah kit ⚠ | Top 10 but wrong URL (cart) |
| `113-LR51V50AH` | #18 | out | — | 50Ah kit | Recovered from API error; out of top 100 |
| `113-LR51V105AH` | #18 | **#11** | `/parts/lithium-rhino-48v-105ah-cube-battery` | 105Ah kit ⚠ | Cube battery, not kit |

**Summary:** 12/26 ranked · 1 top 10 · 2 top 30 · 8 wrong winning URL · 1 API error.  
Vs Jul 28 baseline (10/22 · 0 top 10 · 3 top 30): more keywords ranking + first top-10 PN, but Ah/voltage URL matching worsened and `lithium rhino` dropped out.  
Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts` (failed rows retried once).

### Target-URL mismatches

1. **`lithium rhino 48v 65ah` → `/parts/lithium-rhino-48v-105ah-kit` · want `/parts/lithium-rhino-48v-65ah-kit`** (not on hub; wrong Ah PDP — priority flag)
2. `lithium rhino conversion kit` → 105Ah kit · want hub
3. `lithium rhino 48v` → 105Ah kit · want hub
4. `lithium rhino 48v 50ah` → 105Ah kit · want `/parts/lithium-rhino-48v-50ah-kit`
5. `lithium rhino 36v` → hub · want `/parts/lithium-rhino-36v-65ah-kit`
6. `lithium rhino 72v` → hub · want `/parts/lithium-rhino-72v-105ah-kit`
7. `113-LR51V65AH` → Club Car DS cart · want `/parts/lithium-rhino-48v-65ah-kit`
8. `113-LR51V105AH` → cube battery PDP · want `/parts/lithium-rhino-48v-105ah-kit`

## Live surfaces

| URL | Role |
|-----|------|
| `/lithium-batteries` | Category hub + kit finder + featured brand kits |
| `/lithium-batteries/{cart}` | Model landings (EZGO / Club Car / Yamaha) |
| `/parts/lithium-rhino-*` | Kit + battery-only PDPs |
| Insights guide | `/insights/lithium-vs-lead-acid-golf-cart-batteries-2026-guide` |

## Open blockers / needs from Christopher

1. **Deploy** Phases 1–3 code to production when ready (meta titles + hub deep links should help Ah/voltage mismatches).  
2. Optional: run `npx tsx scripts/seo/lithium-revenue-baseline.ts` and confirm last 90 days lithium Stripe revenue.  
3. Approve before any checkout / HazMat freight tier / price changes.

## Next actions after deploy

1. Monday automation continues refreshing this STATUS from rank JSON.  
2. Watch **65Ah brand query** (must land on 65Ah kit, not 105Ah) + PN `113-LR51V65AH` cart cannibalization.  
3. Do **not** expand generic head-term content until brand mid-pack converts or cart pages show GSC clicks.  
4. No PR from this run — SERP mid-pack / wrong-URL issues are measurement + pending deploy, not a new code change.

## Decision log

| Date | Decision |
|------|----------|
| 2026-07-28 | Formalize managed lithium revenue program (mirror charger-modules / rubber-tracks) |
| 2026-07-28 | Prioritize brand SERPs + generic commercial; FSIP PNs are protect-only long-tail |
| 2026-07-28 | Proceed Phases 1–3 now; Phase 4 expand deferred |
| 2026-07-28 | Weekly automation Mondays ~10:30 AM Eastern; reuse `DATAFORSEO_*` Cloud Agent secrets |
| 2026-07-28 | No checkout / webhook / freight-tier changes in this program |
| 2026-07-28 | First automation run live; true PA→AZ freight on 113-LR51V65AH order was $85 vs $149 charged |
| 2026-08-17 | Weekly snapshot: 12/26 ranked; flag 48v 65ah → wrong 105Ah PDP; no PR (await Phase 2–3 deploy) |
