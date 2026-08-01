# Cab Glass — Status

**Last updated:** 2026-08-01  
**Active phase:** Phase 0 → Phase 1 (measurement)  
**Program commit:** Phase 0 spine (docs + rank helper + baseline) — pending commit/push  
**Organic glass sales baseline:** unknown / treat as **$0** (no parts-order line attribution in `orders`; Stripe MCP not authenticated this session)  
**Weekly automation:** drafted only — propose Tue ~10:00 AM Eastern (stagger charger Mon ~9 / tracks Mon ~10); **do not enable without Christopher approve**  
**Merchant:** Shopping accepted as co-equal organic channel for 1/day math (paid Search still deferred)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | 🟡 | Docs + rank script + 2026-08-01 baseline created; automation not live; hub missing from sitemap |
| 1 Measurement | ⬜ | Need glass order attribution + weekly ranks |
| 2 Conversion | 🟡 | Nav + PDP hub CTA + freight copy shipped; sitemap hub gap; sibling glass cross-links thin |
| 3 PN / model SERP wins | ⬜ | **0/28 money keywords in top 100** — ranking is the bottleneck |
| 4 Expand | 🟡 | 103 Buy Now stocked; Merchant feed 103 with unique images — Center Active status unverified |

## Rank snapshot (Google US) — 2026-08-01 baseline

| Keyword | Aug 1 | Winning URL (ours) | Top competitor | Notes |
|---------|------:|--------------------|----------------|-------|
| `7120401` | out | — | shop.bobcat.com | **70/mo** vol · hero Bobcat door |
| `345-6230` / `3456230` | out | — | parts.cat.com | **40/mo** · Cat door |
| `6729776` | out | — | shop.bobcat.com | **20/mo** · older Bobcat door |
| `bobcat door glass` | out | — | amazon.com | **40/mo** |
| `skid steer windshield` | out | — | skidsteersdirect.com | **40/mo** · hub/head |
| `84344565` | out | — | mycnhstore.com | **10/mo** · Case door |
| `bobcat t650 door glass` | out | — | shop.bobcat.com | **10/mo** |
| `bobcat cab glass` | out | — | safeharborparts.com | **10/mo** |
| `skid steer cab glass` | out | — | skidderwindows.com | null vol |
| `V0511-33150` | out | — | intellaparts.com | Kubota rear · same-network |

**Summary:** 0/28 ranked · 0 top 10 · 0 top 30 · 1 API error (`compact track loader windshield`). Full rows: `scripts/seo/rank-snapshots/cab-glass/2026-08-01.json`.

Source: DataForSEO via `scripts/seo/cab-glass-rank-check.ts`. Volumes via DataForSEO Google Ads search_volume (US) same day.

### SERP pattern (baseline)

- **OEM dealers dominate PNs:** shop.bobcat.com, parts.cat.com, shop.deere.com, mycnhstore.com
- **Marketplaces:** amazon.com, walmart.com on several PN/model terms
- **Specialty glass shops:** skidderwindows.com, shieldswindshields.store, forestrydoors.com, brokentractor.com, safeharborparts.com
- **Same-network comps:** intellaparts.com already on Kubota PN — validates Buy Now comps path

## Catalog snapshot (Supabase 2026-08-01)

| Metric | Value |
|--------|------:|
| Buy Now (`sales_type=direct`) | **103** (all priced, in stock, imaged, with models) |
| Quote only | **31** |
| Brands (Buy Now) | Bobcat 31 · JD 25 · Takeuchi 20 · Cat 11 · Case 10 · Kubota 6 |
| Median / avg price (Buy Now) | $91 / $137 |
| Stripe price IDs on Buy Now | 103/103 |

Note: `data/glass/cpa-glass-publish-results.json` (2026-07-16) is **stale** (19 buy_now) — do not use for planning.

## Live surfaces

| URL | Role | Status |
|-----|------|--------|
| `/cab-glass` | Hub + GlassFinder | Live; **not in `next-sitemap` additionalPaths** (rubber-tracks is) |
| `/parts/{brand}-{oem}-{type}` | PDPs | Live; hub CTA + breadcrumb wired |
| Parts nav dropdown | Discovery | Cab Glass link live |
| `/parts` quick path | Discovery | `CATALOG_QUICK_PATHS` → `/cab-glass` |
| Brand serial-lookup glass blocks | Fitment assist | Wired for Bobcat/Cat/Kubota/Case/JD/Takeuchi |

## Merchant glass audit (feed on disk 2026-08-01)

Feed: `public/feed/google-merchant.{xml,json}` · filter `custom_label_0=priority_cab_glass`.

| Check | Result |
|-------|--------|
| Glass items | **103** |
| Unique images | **103/103** (`/images/parts/glass/{slug}.jpg`) |
| Surface freight attr | Present (sample $25 Ground on sub-$150 SKUs; prepaid $0 at $650+) |
| TSA / TVH prefix leak | None sampled |
| Aftermarket in description | **101/103** |
| Center Active vs disapproval | **Unverified** this session |

## Open blockers / needs from Christopher

1. Approve commit/push of Phase 0 spine (docs + rank script + snapshot).  
2. Approve weekly Cursor Automation (Tue ~10:00 AM Eastern) — draft only until then.  
3. Merchant Center: filter `priority_cab_glass` → Active count + disapproval codes.  
4. Confirm glass order attribution path (Stripe price IDs / Telegram / export) — `orders` table is training-centric.  
5. Wholesale costs only ad hoc from normal POs — never bulk portal lookups.

## Next action

1. **Add `/cab-glass` to `next-sitemap.config.js` `additionalPaths`** (parity with `/rubber-tracks`) and regenerate/deploy sitemap — cheapest indexation fix.  
2. Confirm Merchant Active for glass SKUs (co-equal channel while classic SEO is at 0).  
3. This week’s SEO focus after sitemap: **Bobcat 7120401 + Cat 345-6230 PN pack** (highest volume among money PNs) — titles/H1/internal links only; no checkout changes.

## Decision log

| Date | Decision |
|------|----------|
| 2026-08-01 | Formalize managed cab-glass revenue program (mirror rubber-tracks) |
| 2026-08-01 | Optimize for purchases + PN/model intent; head terms secondary |
| 2026-08-01 | Merchant Shopping co-equal for 1/day math; paid Search deferred |
| 2026-08-01 | Baseline: **0/28** money keywords in top 100 — ranking is primary bottleneck |
| 2026-08-01 | Catalog reality: 103 Buy Now stocked (publish-results.json stale) |
