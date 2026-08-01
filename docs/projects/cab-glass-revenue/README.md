# Cab Glass Revenue Program

**Owner:** Cursor agent (managed) · **Sponsor:** Christopher  
**Goal:** Grow organic + Merchant revenue for aftermarket cab glass (door, windshield, side/rear/roof panels) toward ~1 organic purchase/day.  
**Canonical URLs:** `/cab-glass` (hub) + `/parts/{brand}-{oem}-{glass-type}` (PDPs)  
**Live:** https://www.flatearthequipment.com/cab-glass  
**Intake:** `data/glass/` · helpers `scripts/glass/`

## Operating model

Weekly loop (automation + agent):

1. **Measure** — DataForSEO ranks + winning URL for money keywords (PNs + model/type + hub)
2. **Attribute** — Map organic/Merchant sessions → PDP → checkout → Stripe purchases on `category_slug=cab-glass`
3. **Decide** — Keep / fix / expand based on purchases and high-intent PN/model rankings (not vanity traffic)
4. **Ship** — One focused change per phase; no URL thrash, no vendor SKUs on the public site

Christopher provides external inputs only when needed (GSC screenshots, wholesale costs from normal POs, fitment/cab-config verification, approve deploys / pricing / freight changes).

## Success metrics (north stars)

| Metric | Why it matters |
|--------|----------------|
| Organic + Merchant purchases (`category_slug=cab-glass` Stripe lines) | Real revenue |
| GSC clicks on `/cab-glass` + glass PDPs | Demand reaching the site |
| Rank + **winning URL** for money keywords | PN intent must land on the correct PDP |
| PDP → checkout start → purchase rate | Conversion, not just traffic |
| Merchant Active SKU count (`priority_cab_glass`) | Shopping co-equal channel |

### Money keywords (priority order)

1. **OEM part numbers** → correct PDP `/parts/{brand}-{oem}-{type}`  
   Examples: `7120401`, `6729776`, `345-6230`, `84344565`, `T312628`, `08808-65301`
2. **Brand + model + glass type** → PDP or hub filtered URL  
   `bobcat t650 door glass`, `cat 259d windshield`, `case sr175 door glass`, …
3. **Head / category** → `/cab-glass` (secondary; not vanity-first)  
   `skid steer cab glass`, `bobcat cab glass`, `skid steer windshield`
4. Deprioritize: pure vanity head terms with no Buy Now path, and any keyword that only ranks via a wrong/non-glass URL

## Phases

### Phase 0 — Foundation

- [x] Project docs (`README` + `STATUS`)
- [x] Rank helper: `scripts/seo/cab-glass-rank-check.ts`
- [x] Baseline snapshot under `scripts/seo/rank-snapshots/cab-glass/`
- [ ] Weekly monitoring automation live (Cloud Agent; stagger from charger Mon ~9am / rubber-tracks Mon ~10am — propose Tue ~10:00 AM Eastern)

### Phase 1 — Measurement

- [ ] Confirm GA4 / purchase attribution path for cab-glass SKUs (additive only)
- [ ] Weekly rank snapshot with URL-aware deltas (automation)
- [ ] Optional revenue baseline helper (orders by glass price IDs / category)

### Phase 2 — Convert traffic that already ranks

- [ ] Hub → PDP clarity (OEM PN + glass type + model above the fold)
- [ ] Honest surface-freight messaging ($18–$41 under $650; prepaid $650+ eligible — no free-freight claim)
- [ ] Aftermarket disclosure once + confident fitment (cab config caveats)
- [ ] `/parts` cab-glass CTA → `/cab-glass` hub (quick path already; verify sidebar)
- [ ] PDP ↔ serial-number-lookup two-way links where brand tools exist

### Phase 3 — Win high-intent PN / model SERPs on correct PDP URLs

- [ ] Title/H1 lead with OEM PN + glass type on Buy Now heroes
- [ ] Protect nearest-win PN clusters before spreading thin
- [ ] Internal links from hub brand sections + serial-lookup brand glass blocks

### Phase 4 — Expand only where ROI is clear

- [ ] Convert `quote_only` → Buy Now only when trusted Intella/Magnasource comps + freight workable
- [ ] Google Merchant: keep unique images + surface-freight attrs; clear Center disapprovals
- [ ] Optional paid Search on proven PNs — **deferred** until organic + conversion baseline

## Catalog / SEO rules (do not violate)

- Publish **OEM brand + OEM number only** — strip TVH OE prefixes via `lib/parts/tvhOePrefixes.ts`
- Never name TVH in customer copy; never publish vendor-prefixed / house SKUs (`TSA/`, SY-style)
- Aftermarket replacements — say so clearly once; confident fitment; no scare-off hedges
- Prefer Intella/Magnasource (same-network) comps for Buy Now (~5% under lowest trusted) vs `quote_only`
- TVH surface freight bands at checkout ($18/$25/$31/$37/$41 under $650; prepaid over $650 net eligible stock; exclusions apply)
- Cab glass is **small-parcel surface freight**, not LTL
- No false fitment across cab configs (door style, wiper holes, poly vs tempered)
- US sales only; no fabricated `aggregateRating`
- No bulk TVH portal cost lookups
- Canonical URL of `/cab-glass` — no consolidations / redirects that thrash equity

## Do not change (without explicit approve)

- Stripe checkout session shape / webhook fulfillment
- Freight line behavior for non-glass categories
- Canonical URL of `/cab-glass`
- Live glass sell prices / stock flags without margin check
- Fabricated stock counts or review schema

## How to run locally

```bash
npx tsx scripts/seo/cab-glass-rank-check.ts
```

Writes `scripts/seo/rank-snapshots/cab-glass/YYYY-MM-DD.json` and prints delta vs prior file.

Related:

```bash
npx tsx scripts/glass/batch-search-glass-comps.ts   # quote_only → comp evidence
npx tsx scripts/build-merchant-feed.ts              # regenerates Merchant feed
```

## Status file

See [`STATUS.md`](./STATUS.md) for latest ranks, open questions, and next action.
