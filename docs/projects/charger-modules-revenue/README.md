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

### Phase 0 — Foundation ✅

- [x] SSR Product/ItemList schema, duplicate page 301, SKU pages live (Jul 7 deploy)
- [x] Rank helper + project docs
- [x] Weekly monitoring automation live (Cloud Agent secrets + test run)
- [x] Baseline snapshot under `scripts/seo/rank-snapshots/charger/`

### Phase 1 — Measurement ✅ (code)

- [x] GA4 view_item / add_to_cart / begin_checkout + `charger_module_*` events
- [x] Weekly rank snapshot with URL-aware deltas (automation)
- [x] Price ID list helper: `npx tsx scripts/seo/charger-revenue-baseline.ts`

### Phase 2 — Convert traffic that already ranks ✅ (code)

- [x] Sticky CTA + clearer core-deposit math on SKU pages
- [x] Removed unverified prepaid-label claims from Repair & Return offer copy
- [x] Hub part-number index + stronger PN links on cards

### Phase 3 — Win `6la20671` on Enersys SKU URL 🔄 (monitor)

- [x] Title/H1 lead with exact PN (Enersys/Hawker 6LA20671 + ACT cross-refs)
- [x] Internal links from hub + `/battery-chargers`
- [x] Hub ItemList links only (no nested Product/Offer); ACT `/parts/*-reman|repair` → SKU 301s
- [ ] Re-check SERP after Aug 10 de-cannibalize deploy (Monday automation / 2–6 weeks)

### Phase 4 — Expand only where ROI is clear ✅ partial

- [x] Keep Hyster `4092995` on existing PDP; link from hub + SKU pages
- [x] Fleet quote tracking (`generate_lead` / `charger_module_fleet_quote_open`)
- [ ] Optional Google Ads Search on proven PNs — **deferred** until GA4 path verified

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
