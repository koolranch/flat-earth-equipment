# Rubber Tracks Revenue Program

**Owner:** Cursor agent (managed) · **Sponsor:** Christopher  
**Goal:** Grow organic + on-site revenue for rubber tracks (per-track sell, qty default 2, free freight + 2-year warranty).  
**Canonical URLs:** `/rubber-tracks` (hub) + `/parts/{brand}-{model}-rubber-track-{size}` (PDPs)  
**Live:** https://www.flatearthequipment.com/rubber-tracks  
**Intake:** `data/tracks/rubber-track-intake.csv`

## Operating model

Weekly loop (automation + agent):

1. **Measure** — DataForSEO ranks + winning URL for money keywords (hub + model/size PDPs)
2. **Attribute** — Map organic sessions → PDP → checkout → Stripe purchases on track SKUs
3. **Decide** — Keep / fix / expand based on purchases and high-intent model/size rankings (not vanity traffic)
4. **Ship** — One focused change per phase; no URL thrash, no vendor SKUs on the public site

Christopher provides external inputs only when needed (GSC screenshots, wholesale costs from normal POs, serial-prefix verification, approve deploys / pricing changes).

## Success metrics (north stars)

| Metric | Why it matters |
|--------|----------------|
| Organic purchases (rubber-track Stripe price IDs / `category_slug=rubber-tracks`) | Real revenue |
| GSC clicks on `/rubber-tracks` + track PDPs | Demand reaching the site |
| Rank + **winning URL** for money keywords | Model/size intent must land on the right PDP (or hub when appropriate) |
| PDP → checkout start → purchase rate | Conversion, not just traffic |
| Avg qty per track order | Confirms “replace both sides” UX (default 2) |

### Money keywords (priority order)

1. **Head / category** → should win on `/rubber-tracks`
   - `skid steer rubber tracks`
   - `compact track loader tracks`
   - `bobcat rubber tracks` / `jcb rubber tracks`
2. **Model terms (Bobcat)** → matching PDP or hub model section  
   `bobcat t650|t770|t590|t550|t190|t66|mt85 tracks`
3. **Model terms (Cat / Kubota / Case / JD / JCB / Takeuchi)** → matching PDP  
   Cat `259d|279d|289d`, Kubota `svl65|svl75|svl95`, Case `tr270|tr310|tv370|tv450`, John Deere `317g|325g|331g|333g`, JCB `1cxt|150t|190t`, Takeuchi `tl8`
4. Deprioritize: pure vanity head terms with no purchase path, and any keyword that only ranks via a wrong/non-track URL

## Phases

### Phase 0 — Foundation ✅ (code)

- [x] Project docs (`README` + `STATUS`)
- [x] Rank helper: `scripts/seo/rubber-track-rank-check.ts`
- [x] Baseline snapshot under `scripts/seo/rank-snapshots/rubber-tracks/` (2026-07-27: 1/29 ranked — `case tv370 tracks` #60)
- [ ] Weekly monitoring automation live (Cloud Agent; Mondays ~10:00 AM Eastern, staggered from charger)

### Phase 1 — Measurement

- [ ] Confirm GA4 / purchase attribution path for rubber-track SKUs (additive only)
- [ ] Weekly rank snapshot with URL-aware deltas (automation)
- [ ] Optional revenue baseline helper (orders by track price IDs / category)

### Phase 2 — Convert traffic that already ranks

- [ ] Hub → PDP clarity (size + serial-prefix fitment above the fold)
- [ ] Protect qty default 2 + “most operators replace both sides” copy
- [ ] Free shipping + 2-year warranty as primary trust signals (vs comps that add LTL)
- [ ] `/parts` rubber-tracks category CTA → `/rubber-tracks` hub (verify)

### Phase 3 — Win high-intent model SERPs on correct PDP URLs

- [ ] Title/H1 lead with brand + model + size where a single SKU is universal across serial breaks
- [ ] Prefix-scoped listings when breaks return different SKU sets (no false “fits all”)
- [ ] Two-way links: track PDPs ↔ brand serial-number-lookup pages

### Phase 4 — Expand only where ROI is clear

- [ ] Publish next models from intake only when serial prefixes verified + comps priced
- [ ] Google Merchant feed: prioritize free-shipping track SKUs (when `free_freight`)
- [ ] Optional paid Search on proven model terms — **deferred** until organic + conversion baseline

## Catalog / SEO rules (do not violate)

- Slug = `{brand}-{model}-rubber-track-{size}` — no tread suffixes when size already identifies the SKU
- Never publish vendor `TSA/` or house PNs publicly (internal ordering only)
- Verify every vendor serial-prefix break before fitment claims
- Price at or near trusted comps (free freight + 2yr warranty protect margin) — not the strict 5%-under rule used elsewhere
- Sell per track; qty selector defaults to 2
- US sales only; no fabricated `aggregateRating`
- No bulk TVH portal cost lookups

## Do not change (without explicit approve)

- Stripe checkout session shape / webhook fulfillment
- Freight line behavior for non-track categories
- Canonical URL of `/rubber-tracks` (no consolidations / redirects that thrash equity)
- Live track sell prices / `free_freight` flags without margin check
- Fabricated stock counts or review schema

## How to run locally

```bash
npx tsx scripts/seo/rubber-track-rank-check.ts
```

Writes `scripts/seo/rank-snapshots/rubber-tracks/YYYY-MM-DD.json` and prints delta vs prior file.

Related helpers:

```bash
npx tsx scripts/seo/rubber-track-keyword-research.ts   # volume/CPC research
npx tsx scripts/seo/rank-snapshot.ts                   # sitewide snapshot (includes tracks group)
```

## Status file

See [`STATUS.md`](./STATUS.md) for latest ranks, open questions, and next action.
