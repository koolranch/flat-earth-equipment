# Lithium Batteries — Status

**Last updated:** 2026-08-03  
**Active phase:** Phases 1–3 code shipping (awaiting deploy)  
**Weekly automation:** Live (Mondays ~10:30; branch `cursor/lithium-batteries-rank-status-fde9`)  
**Baseline ranks:** DataForSEO 2026-07-28 · **Latest:** 2026-08-03 (`scripts/seo/rank-snapshots/lithium-rhino/2026-08-03.json`)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Hub + carts + PDPs + Merchant + docs + keyword map |
| 1 Measurement | ✅ | Rank script + revenue baseline helper; weekly automation live |
| 2 Conversion | ✅ code | Hub CTAs / featured kits / kit finder; PDP HazMat + cart links — **deploy pending** |
| 3 Brand/Ah URLs | ✅ code | Lithium meta titles; target URL map; hub deep links — **deploy pending** |
| 4 Expand | ⬜ | Generic head terms deferred until brand/cart traction |

## Rank snapshot (Google US) — 2026-08-03 (automation run)

| Keyword | Jul 28 | Aug 3 | Winning URL | Target | Notes |
|---------|-------:|------:|-------------|---------|-------|
| `lithium golf cart battery` | out | out | — | hub | Phase 4 |
| `golf cart lithium battery` | — | out | — | hub | NEW KW in map |
| `48v lithium golf cart battery` | out | out | — | hub | |
| `lithium golf cart battery conversion kit` | out | out | — | hub | |
| `48v lithium golf cart conversion kit` | — | out | — | hub | NEW KW |
| `lifepo4 golf cart battery 48v` | — | out | — | hub | Retry after API empty-body; still out |
| `48v 65ah lithium golf cart battery` | — | out | — | kit PDP | NEW KW |
| `lithium rhino` | #51 | **#50** ↑ | `/lithium-batteries` | hub ✅ | OEM site #1 |
| `lithium rhino battery` | #43 | **#50** ↓ | `/lithium-batteries` | hub ✅ | Mid-pack slip |
| `lithium rhino golf cart battery` | #41 | **#43** ↓ | `/lithium-batteries` | hub ✅ | |
| `lithium rhino conversion kit` | — | **#40** NEW | `/lithium-batteries` | hub ✅ | Best brand rank this week |
| `lithium rhino 48v` | — | out | — | hub | |
| `lithium rhino 48v 65ah` | **#45** | **out LOST** | — | kit PDP | ⚠ Was on correct PDP; **not** hub — dropped from top 100 |
| `lithium rhino 48v 65ah kit` | — | out | — | kit PDP | |
| `lithium rhino 48v 105ah` | out | **#58** NEW | `/lithium-batteries` | kit PDP ⚠ | Hub, want kit PDP |
| `lithium rhino 48v 50ah` | #48 | **#52** ↓ | `/lithium-batteries` | kit PDP ⚠ | Was kit PDP Jul 28; now hub |
| `lithium rhino 36v` | — | **#63** NEW | `/lithium-batteries` | kit PDP ⚠ | Hub, want 36V kit |
| `lithium rhino 72v` | — | **#64** NEW | `/lithium-batteries` | kit PDP ⚠ | Hub, want 72V kit |
| Cart terms (EZGO/Club Car/Yamaha) | out | out | — | cart pages | All 5 still out |
| `113-LR51V65AH` | #13 | **#15** ↓ | kit PDP | PDP ✅ | Protect (sold SKU) |
| `113-LR51V50AH` | #18 | API error | — | kit PDP | Retry next Monday |
| `113-LR51V105AH` | #18 | API error | — | kit PDP | Retry next Monday (Jul 28 was cube PDP mismatch) |

**Summary:** 9/26 ranked · 0 top 10 · 1 top 30 · 4 wrong winning URL · 2 API errors.  
Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts` (keyword map from `constants/lithiumRhinoSeo.ts`).

### Target-URL mismatches

1. `lithium rhino 48v 105ah` → hub · want `/parts/lithium-rhino-48v-105ah-kit`
2. `lithium rhino 48v 50ah` → hub · want `/parts/lithium-rhino-48v-50ah-kit` (regressed from correct PDP on Jul 28)
3. `lithium rhino 36v` → hub · want `/parts/lithium-rhino-36v-65ah-kit`
4. `lithium rhino 72v` → hub · want `/parts/lithium-rhino-72v-105ah-kit`

### Flags / watch

- **`lithium rhino 48v 65ah` LOST** — Jul 28 #45 on `/parts/lithium-rhino-48v-65ah-kit`; Aug 3 out of top 100 (not ranking on hub either). Re-check after Phase 2–3 deploy; no checkout/freight/price change.
- Brand hub terms still mid-pack (#40–#50); cart + generic commercial still invisible.
- FSIP PN protect: only `113-LR51V65AH` measured this week (#15); other two API errors.

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
2. Watch `lithium rhino 48v 65ah` recovery onto `/parts/lithium-rhino-48v-65ah-kit` (not hub).  
3. Watch Ah/voltage mismatches (50/105/36/72) flip from hub → kit PDPs.  
4. Do **not** expand generic head-term content until brand mid-pack converts or cart pages show GSC clicks.

## Decision log

| Date | Decision |
|------|----------|
| 2026-07-28 | Formalize managed lithium revenue program (mirror charger-modules / rubber-tracks) |
| 2026-07-28 | Prioritize brand SERPs + generic commercial; FSIP PNs are protect-only long-tail |
| 2026-07-28 | Proceed Phases 1–3 now; Phase 4 expand deferred |
| 2026-07-28 | Weekly automation Mondays ~10:30 AM Eastern; reuse `DATAFORSEO_*` Cloud Agent secrets |
| 2026-07-28 | No checkout / webhook / freight-tier changes in this program |
| 2026-07-28 | First automation run live; true PA→AZ freight on 113-LR51V65AH order was $85 vs $149 charged |
| 2026-08-03 | Weekly monitor: 65Ah brand term lost top-100; Ah terms still hub-mismatched — no PR (await Phase 2–3 deploy; no new code) |
