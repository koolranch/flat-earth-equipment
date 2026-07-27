# Charger Modules Revenue Program

**Owner:** Cursor agent (managed) · **Sponsor:** Christopher  
**Goal:** Recover and grow revenue from forklift charger modules (Reman Exchange + Repair & Return).  
**Canonical URLs:** `/charger-modules` (hub) + `/charger-modules/{slug}` (SKU pages)  
**Live:** https://www.flatearthequipment.com/charger-modules

## Operating model

Weekly loop (automation + agent):

1. **Measure** — DataForSEO ranks + GSC clicks/impressions for hub + SKU URLs  
2. **Attribute** — Map organic sessions → checkout → Stripe purchases on charger price IDs  
3. **Decide** — Keep / fix / expand based on revenue, not vanity rankings  
4. **Ship** — One focused change per phase; no URL thrash

Christopher provides external inputs only when needed (GSC screenshots, stock/cost, FSIP fulfillment facts, approve deploys).

## Success metrics (north stars)

| Metric | Why it matters |
|--------|----------------|
| Organic purchases (charger Stripe price IDs) | Real revenue |
| GSC clicks on `/charger-modules*` | Demand reaching the site |
| Rank + **winning URL** for money keywords | Part-number intent must land on SKU pages |
| Checkout start → purchase rate on charger pages | Conversion, not just traffic |

### Money keywords (priority order)

1. `6la20671` → should win on `/charger-modules/enersys-6la20671` (Hawker sibling secondary)
2. `81063577r` / `81063578r` / `81063658r` → ACT Quantum SKU pages (already strong)
3. `forklift charger module repair` / `forklift battery charger module` → hub
4. `hawker charger module` / `act quantum charger module` → matching SKU
5. Deprioritize: `enersys battery charger` (OEM-owned head term)

## Phases

### Phase 0 — Foundation (now) ✅ in progress

- [x] SSR Product/ItemList schema, duplicate page 301, SKU pages live (Jul 7 deploy)
- [x] Rank helper + project docs
- [ ] Weekly monitoring automation live
- [ ] Baseline snapshot committed under `scripts/seo/rank-snapshots/charger/`

### Phase 1 — Measurement (no UX risk)

- Wire GA4/checkout visibility for charger price IDs (view → begin_checkout → purchase)
- Monthly/weekly rank snapshot with URL-aware deltas
- Optional: Supabase/Stripe order pull for charger SKUs (last 90 days) as revenue baseline

### Phase 2 — Convert traffic that already ranks

- Sticky CTA + clearer core-deposit math on SKU pages
- Verify repair prepaid-label copy matches real FSIP fulfillment
- Hub cards: stronger path to SKU pages for part-number searchers who land on hub

### Phase 3 — Win `6la20671` on Enersys SKU URL

- Title/H1 lead with exact PN
- Internal links with PN anchors (hub, battery-chargers, footer where appropriate)
- Re-check SERP: prefer Enersys SKU over hub for that query

### Phase 4 — Expand only where ROI is clear

- Dedicated Hyster `4092995` (or keep as battery-charger PDP — pick one URL)
- Fleet quote tracking (`charger-modules-fleet`)
- Optional Google Ads Search on proven PNs only → SKU final URLs + purchase conversion

## Do not change (without explicit approve)

- Stripe checkout session shape / webhook fulfillment
- Core charge amount / price IDs without margin check
- Canonical URL of `/charger-modules` (no more consolidations)
- Fabricated stock counts or review schema

## How to run locally

```bash
npx tsx scripts/seo/charger-rank-check.ts
```

Writes `scripts/seo/rank-snapshots/charger/YYYY-MM-DD.json` and prints delta vs prior file.

## Status file

See [`STATUS.md`](./STATUS.md) for latest ranks, open questions, and next action.
