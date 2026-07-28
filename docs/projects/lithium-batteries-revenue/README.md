# Lithium Batteries Revenue Program

**Owner:** Cursor agent (managed) · **Sponsor:** Christopher  
**Goal:** Grow organic + on-site revenue for Lithium Rhino golf cart conversion kits and replacement batteries.  
**Canonical URLs:** `/lithium-batteries` (hub) + `/lithium-batteries/{cart}` (model) + `/parts/lithium-rhino-*` (PDPs)  
**Live:** https://www.flatearthequipment.com/lithium-batteries  
**Keyword map:** `constants/lithiumRhinoSeo.ts`

## Operating model

Weekly loop (automation + agent):

1. **Measure** — DataForSEO ranks + winning URL for money keywords (hub + cart + PDP)
2. **Attribute** — Map organic sessions → PDP → checkout → Stripe purchases on lithium price IDs
3. **Decide** — Keep / fix / expand based on purchases and brand/generic intent (not PN vanity)
4. **Ship** — One focused change per phase; no URL thrash; no checkout/webhook changes

Christopher provides external inputs only when needed (GSC screenshots, FSIP stock/freight facts, approve deploys / pricing).

## Success metrics (north stars)

| Metric | Why it matters |
|--------|----------------|
| Organic purchases (Lithium Batteries Stripe price IDs) | Real revenue |
| GSC clicks on `/lithium-batteries*` + lithium PDPs | Demand reaching the site |
| Rank + **winning URL** for money keywords | Brand/Ah intent on correct PDP; generic on hub |
| PDP → checkout start → purchase rate | Conversion, not just traffic |

### Money keywords (priority order)

1. **Generic commercial** → `/lithium-batteries`  
   `lithium golf cart battery`, `48v lithium golf cart battery`, `…conversion kit`
2. **Brand** → hub for broad; PDPs for voltage/Ah  
   `lithium rhino`, `lithium rhino 48v 65ah` → `/parts/lithium-rhino-48v-65ah-kit`
3. **Cart / model** → `/lithium-batteries/{cart}`  
   EZGO TXT/RXV, Club Car Precedent/DS, Yamaha Drive
4. **FSIP PNs** → matching PDP (protect; do not lead the program)  
   `113-LR51V65AH`, `113-LR51V50AH`, `113-LR51V105AH`

## Phases

### Phase 0 — Foundation ✅

- [x] Hub + 10 cart landings + ~15 PDPs + Merchant feed + insights guide
- [x] Project docs (`README` + `STATUS`)
- [x] Rank helper + keyword → winning URL map
- [x] Baseline snapshot under `scripts/seo/rank-snapshots/lithium-rhino/`
- [ ] Weekly monitoring automation live (Cloud Agent; reuse `DATAFORSEO_*` secrets)

### Phase 1 — Measurement ✅ (code)

- [x] Weekly rank snapshot with URL-aware deltas (`lithium-rhino-rank-check.ts`)
- [x] Price ID list helper: `npx tsx scripts/seo/lithium-revenue-baseline.ts`
- [ ] Confirm GA4 / purchase path for lithium SKUs after deploy (additive only)

### Phase 2 — Convert traffic that already ranks ✅ (code)

- [x] Hub: kit finder above fold + featured brand/Ah deep links + stronger CTAs
- [x] Hub cards show voltage/Ah + kit vs battery clearly
- [x] PDP: HazMat freight note + cart/hub cross-links for lithium category
- [ ] Re-check brand SERP mid-pack conversion after deploy

### Phase 3 — Win brand + model SERPs on correct URLs ✅ (code)

- [x] Lithium PDP titles/descriptions lead with brand + voltage/Ah
- [x] Keyword → winning URL map enforced in rank STATUS
- [x] Featured kit deep links from hub for 48V 65/105/50 + 36V
- [ ] Watch whether `lithium rhino 48v 65ah` flips from hub → PDP over 2–6 weeks

### Phase 4 — Expand only where ROI is clear

- [ ] Generic head-term content/links only after hub is page 1–2 on brand **or** cart pages earn GSC clicks
- [ ] Optional Google Ads Search on proven brand/cart terms — **deferred** until organic + conversion baseline
- [ ] Do not chase BigBattery head terms with thin pages

## Catalog / SEO rules (do not violate)

- Customer-facing brand is **Lithium Rhino**; never lead with FSIP/vendor house SKUs
- Conversion Kit vs Replacement Battery must stay clear (kit includes charger + accessories)
- HazMat Class 9 ground freight tiers; free freight on 3+ batteries (checkout already implements)
- US sales only; no fabricated `aggregateRating`
- No URL thrash on `/lithium-batteries` canonical

## Do not change (without explicit approve)

- Stripe checkout session shape / webhook fulfillment
- Lithium HazMat freight tier amounts / free-on-3+ rule without margin check
- Canonical URL of `/lithium-batteries` (no consolidations)
- Live sell prices / wholesale costs without margin check
- Fabricated stock counts or review schema

## How to run locally

```bash
npx tsx scripts/seo/lithium-rhino-rank-check.ts
npx tsx scripts/seo/lithium-revenue-baseline.ts
```

Writes `scripts/seo/rank-snapshots/lithium-rhino/YYYY-MM-DD.json` and prints delta vs prior file + target-URL mismatches.

Related: `npx tsx scripts/seo/rank-snapshot.ts` (sitewide snapshot includes `lithium` group).

## Status file

See [`STATUS.md`](./STATUS.md) for latest ranks, open questions, and next action.
