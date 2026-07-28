# Lithium Batteries — Status

**Last updated:** 2026-07-28  
**Active phase:** Phase 0 — Foundation  
**Program commit:** see latest `main` after Phase 0 land

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ code | Rank script + STATUS + baseline snapshot; weekly automation live this run |
| 1 Measurement | ⬜ | Weekly deltas + purchase attribution |
| 2 Conversion | ⬜ | Hub / PDP / cart-landing CTAs (no checkout/freight/price changes) |
| 3 Brand + Ah SERP wins | ⬜ | Fix remaining URL mismatches (36V 105Ah hub; 105Ah FSIP → kit not cube) |
| 4 Expand | ⬜ | Cart landings + Merchant; paid ads deferred |

## Rank snapshot (Google US) — 2026-07-28 baseline

| Keyword | Jul 28 | Winning URL | Top competitor | Notes |
|---------|-------:|-------------|----------------|-------|
| `lifepo4 golf cart battery` | **#92** | `/lithium-batteries` | bigbattery.com | Generic → hub ✓ |
| `lithium rhino` | **#51** | `/lithium-batteries` | lithiumrhino.com | Brand → hub ✓ |
| `lithium rhino battery` | **#43** | `/lithium-batteries` | lithiumrhino.com | Brand → hub ✓ |
| `lithium rhino golf cart battery` | **#41** | `/lithium-batteries` | lithiumrhino.com | Brand → hub ✓ |
| `lithium rhino 48v 65ah` | **#45** | `/parts/lithium-rhino-48v-65ah-kit` | lithiumrhino.com | **OK — correct kit PDP (not hub)** |
| `lithium rhino 48v 50ah` | **#48** | `/parts/lithium-rhino-48v-50ah-kit` | lithiumrhino.com | Ah PDP ✓ |
| `lithium rhino 36v 105ah` | **#63** | `/lithium-batteries` | amazon.com | ⚠ mismatch — want kit PDP |
| `113-LR51V65AH` | **#13** | `/parts/lithium-rhino-48v-65ah-kit` | shop.fsip.biz | Protect ✓ |
| `113-LR51V105AH` | **#18** | `/parts/lithium-rhino-48v-105ah-cube-battery` | shop.fsip.biz | ⚠ mismatch — want standard kit PDP |
| `113-LR51V50AH` | **#18** | `/parts/lithium-rhino-48v-50ah-kit` | golfcartgarage.com | Protect ✓ |
| `lithium golf cart battery` | out | — | ecobattery.com | Hub target |
| `48v lithium golf cart battery` | out | — | ecobattery.com | Hub target |
| `lithium golf cart battery conversion kit` | out | — | lithiumrhino.com | Hub target |
| `36v lithium golf cart battery` | out | — | amazon.com | Hub target |
| `lithium rhino 48v 105ah` | out | — | lithiumrhino.com | Ah PDP target |
| `ezgo txt 48v lithium battery conversion` | out | — | fleetlithium.com | Cart landing |
| `club car precedent lithium battery` | out | — | ecobattery.com | Cart landing |
| `ezgo rxv lithium battery` | out | — | ecobattery.com | Cart landing |
| `yamaha drive lithium battery` | out | — | yamahagolfcar.com | Cart landing |
| `club car ds lithium battery` | out | — | facebook.com | Cart landing |
| `yamaha drive2 lithium battery` | out | — | yamahagolfcar.com | Cart landing |
| `113-LR38V105AH` | API error | — | — | Retry next Monday |

**Summary:** 10/22 ranked · 0 top 10 · 3 top 30 · 1 API error.

### Target-URL mismatches

1. `lithium rhino 36v 105ah` → got `/lithium-batteries` · want `/parts/lithium-rhino-36v-105ah-kit`
2. `113-LR51V105AH` → got `/parts/lithium-rhino-48v-105ah-cube-battery` · want `/parts/lithium-rhino-48v-105ah-kit`

### Flags

- **`lithium rhino 48v 65ah` is NOT on the hub** — winning URL is the correct kit PDP (`/parts/lithium-rhino-48v-65ah-kit` at #45). No hub-cannibalization flag for this keyword on 2026-07-28.

Full rows: `scripts/seo/rank-snapshots/lithium-rhino/2026-07-28.json`.

Source: DataForSEO via `scripts/seo/lithium-rhino-rank-check.ts`.

## Live surfaces

| URL | Role |
|-----|------|
| `/lithium-batteries` | Category hub (generic + brand SERPs) |
| `/lithium-batteries/{cart}` | Cart-model landings (EZGO / Club Car / Yamaha) |
| `/parts/lithium-rhino-*` | Ah / kit / battery PDPs |

## Open blockers / needs from Christopher

1. None for this monitor run (secrets already present; baseline captured).  
2. Optional: approve merge of Phase 0 rank helper + STATUS so next Monday reuses the same script on `main`.  
3. Approve before any checkout / HazMat freight / sell-price changes.

## Next action

1. Protect FSIP PN ranks (`113-LR51V65AH` #13, `113-LR51V50AH` #18) — no URL thrash.  
2. Later Phase 3: push `lithium rhino 36v 105ah` from hub → kit PDP; clarify `113-LR51V105AH` kit vs cube sibling.  
3. Do not chase all out-of-index generic/cart terms at once.  
4. No code change required from this baseline (no clear regression).

## Do not change (without explicit approve)

- Stripe checkout / webhooks  
- HazMat freight tiers  
- Live sell prices  

## Decision log

| Date | Decision |
|------|----------|
| 2026-07-28 | Weekly Lithium Batteries rank monitor; bootstrap missing rank helper + STATUS + baseline |
| 2026-07-28 | Keyword priority: generic→hub, brand/Ah→hub/PDP, cart landings, FSIP PNs protect-only |
| 2026-07-28 | Baseline: `lithium rhino 48v 65ah` already on correct kit PDP (#45) — not hub |
