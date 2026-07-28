# Lithium Batteries — Status

**Last updated:** 2026-07-28  
**Active phase:** Phases 1–3 code shipping (awaiting deploy)  
**Weekly automation:** Live (first run 2026-07-28 → branch `cursor/lithium-batteries-rank-status-79b9`)  
**Baseline ranks:** DataForSEO 2026-07-28 (`scripts/seo/rank-snapshots/lithium-rhino/2026-07-28.json`)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Hub + carts + PDPs + Merchant + docs + keyword map |
| 1 Measurement | ✅ | Rank script + revenue baseline helper; weekly automation live |
| 2 Conversion | ✅ code | Hub CTAs / featured kits / kit finder; PDP HazMat + cart links — **deploy pending** |
| 3 Brand/Ah URLs | ✅ code | Lithium meta titles; target URL map; hub deep links — **deploy pending** |
| 4 Expand | ⬜ | Generic head terms deferred until brand/cart traction |

## Rank snapshot (Google US) — 2026-07-28 (automation run)

| Keyword | Jul 28 | Winning URL | Target | Notes |
|---------|-------:|-------------|---------|-------|
| `lifepo4 golf cart battery` | **#92** | `/lithium-batteries` | hub ✅ | Generic foothold |
| `lithium rhino` | **#51** | `/lithium-batteries` | hub ✅ | OEM site #1 |
| `lithium rhino battery` | **#43** | `/lithium-batteries` | hub ✅ | Convert mid-pack |
| `lithium rhino golf cart battery` | **#41** | `/lithium-batteries` | hub ✅ | |
| `lithium rhino 48v 65ah` | **#45** | `/parts/lithium-rhino-48v-65ah-kit` | PDP ✅ | Correct kit PDP |
| `lithium rhino 48v 50ah` | **#48** | `/parts/lithium-rhino-48v-50ah-kit` | PDP ✅ | |
| `lithium rhino 36v 105ah` | **#63** | `/lithium-batteries` | kit PDP ⚠ | Want `/parts/lithium-rhino-36v-105ah-kit` |
| `113-LR51V65AH` | **#13** | kit PDP | PDP ✅ | Protect (sold SKU) |
| `113-LR51V50AH` | **#18** | kit PDP | PDP ✅ | Protect |
| `113-LR51V105AH` | **#18** | cube battery PDP | kit PDP ⚠ | Prefer standard kit URL |
| `lithium golf cart battery` | out | — | hub | ~18k/mo — Phase 4 |
| `48v lithium golf cart battery` | out | — | hub | |
| `lithium golf cart battery conversion kit` | out | — | hub | |
| `lithium rhino 48v 105ah` | out | — | kit PDP | |
| Cart terms (EZGO/Club Car/Yamaha) | out | — | cart pages | Included in rank script |
| `113-LR38V105AH` | API error | — | — | Retry next Monday |

**Summary:** 10/22 ranked · 0 top 10 · 3 top 30 · 1 API error.  
Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts` (automation first run).

### Target-URL mismatches

1. `lithium rhino 36v 105ah` → hub · want `/parts/lithium-rhino-36v-105ah-kit`
2. `113-LR51V105AH` → cube battery PDP · want `/parts/lithium-rhino-48v-105ah-kit`

## Live surfaces

| URL | Role |
|-----|------|
| `/lithium-batteries` | Category hub + kit finder + featured brand kits |
| `/lithium-batteries/{cart}` | Model landings (EZGO / Club Car / Yamaha) |
| `/parts/lithium-rhino-*` | Kit + battery-only PDPs |
| Insights guide | `/insights/lithium-vs-lead-acid-golf-cart-batteries-2026-guide` |

## Open blockers / needs from Christopher

1. **Deploy** Phases 1–3 code to production when ready.  
2. Optional: run `npx tsx scripts/seo/lithium-revenue-baseline.ts` and confirm last 90 days lithium Stripe revenue.  
3. Approve before any checkout / HazMat freight tier / price changes.

## Next actions after deploy

1. Monday automation continues refreshing this STATUS from rank JSON.  
2. Watch mismatches above (36V 105Ah hub; 105Ah FSIP → kit not cube).  
3. Do **not** expand generic head-term content until brand mid-pack converts or cart pages show GSC clicks.

## Decision log

| Date | Decision |
|------|----------|
| 2026-07-28 | Formalize managed lithium revenue program (mirror charger-modules / rubber-tracks) |
| 2026-07-28 | Prioritize brand SERPs + generic commercial; FSIP PNs are protect-only long-tail |
| 2026-07-28 | Proceed Phases 1–3 now; Phase 4 expand deferred |
| 2026-07-28 | Weekly automation Mondays ~10:30 AM Eastern; reuse `DATAFORSEO_*` Cloud Agent secrets |
| 2026-07-28 | No checkout / webhook / freight-tier changes in this program |
| 2026-07-28 | First automation run live; true PA→AZ freight on 113-LR51V65AH order was $85 vs $149 charged |
