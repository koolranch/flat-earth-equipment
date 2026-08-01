# Rubber Tracks — Status

**Last updated:** 2026-08-01  
**Active phase:** Phase 0 → Phase 1 (measurement) + Merchant review  
**Program commit:** Merchant track MPN + aftermarket disclosure feed regen (this commit)  
**Organic track sales baseline:** $0 known (no recent track Stripe sales)  
**Weekly automation:** believed saved; expect Monday ~10:00 AM Eastern run  
**Merchant:** Shopping accepted as co-equal organic channel for 1/day math (paid Search still deferred)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Docs + rank script + baseline; automation believed live |
| 1 Measurement | 🟡 | Ranks weekly; order attribution still unverified ($0 known sales) |
| 2 Conversion | ⬜ | Hub/PDP UX largely shipped; sidebar→hub polish optional |
| 3 Model SERP wins | ⬜ | Prefer Bobcat T650/T770 over Case TV370 demand |
| 4 Expand | 🟡 | Merchant: 65 tracks; feed fix shipped (unique RT-* MPN + aftermarket disclosure) — awaiting Center review clear |

## Rank snapshot (Google US) — 2026-07-27 baseline

| Keyword | Jul 27 | Winning URL | Top competitor | Notes |
|---------|-------:|-------------|----------------|-------|
| `case tv370 tracks` | **#60** | `/parts/case-tv370-rubber-track-450x86x55` | skidsteers.com | Sole money keyword in top 100 — protect + push |
| `skid steer rubber tracks` | out | — | skidheaven.com | Hub target |
| `compact track loader tracks` | out | — | grizzlyrubbertracks.com | Hub target |
| `bobcat rubber tracks` | out | — | skidheaven.com | Hub / Bobcat cluster |
| `bobcat t650 tracks` | out | — | mclarenindustries.com | Priority model |
| `bobcat t770 tracks` | out | — | shop.bobcat.com | OEM SERP |
| `cat 259d tracks` | out | — | skidsteers.com | |
| `kubota svl75 tracks` | out | — | skidheaven.com | |
| `john deere 333g tracks` | out | — | skidsteers.com | |
| `jcb rubber tracks` | out | — | greenshieldsjcb.com | |
| `takeuchi tl8 tracks` | out | — | skidheaven.com | |

**Summary:** 1/29 ranked · 0 top 10 · 0 top 30 · 0 API errors. Full rows: `scripts/seo/rank-snapshots/rubber-tracks/2026-07-27.json`.

Source: DataForSEO via `scripts/seo/rubber-track-rank-check.ts`.

## Live surfaces

| URL | Role |
|-----|------|
| `/rubber-tracks` | Category hub + model finder |
| `/parts/{brand}-{model}-rubber-track-{size}` | Per-track PDP (no `TSA/` PNs) |
| `/parts` → rubber-tracks CTA | Should deep-link hub (verify in Phase 2) |
| Brand `*-serial-number-lookup` | Fitment assist; two-way link target |

## Merchant track audit (2026-08-01)

Feed: `public/feed/google-merchant.{xml,json}` · live after deploy of this commit · `/feed/google-merchant.xml`.

| Check | Result |
|-------|--------|
| Track items | **65** (`custom_label_0=priority_rubber_tracks`) |
| Unique images | **65/65** per-SKU JPGs; priority landings+images HTTP 200 |
| Free shipping attr | **65/65** `US / Ground / 0.00 USD` |
| TSA / house PN leak | None in feed fields |
| Titles | Brand + model + size + tread; no “OEM/genuine” claims |
| Dup MPNs | **Fixed** — track `mpn` = unique `RT-*` sku (no shared OEM cross-ref) |
| Aftermarket word in desc | **Fixed** — feed-only one-liner on all 65 track items |
| `shipping_weight` | **0/65** (optional; all free ship) |
| OOS correctly flagged | 4 items |

**Under Review** may clear after Merchant re-fetches the updated feed. In Center: filter `custom_label_0 = priority_rubber_tracks` and watch for Active vs specific disapproval codes.

## Open blockers / needs from Christopher

1. Confirm Monday automation actually ran (check STATUS commit after Mon).  
2. Wholesale costs only ad hoc from normal POs — never bulk portal lookups.  
3. Approve before any production checkout / pricing / freight changes.  
## Next action

1. **Deploy** this Merchant feed commit so Center re-fetches unique MPNs + aftermarket disclosure.  
2. Wait for Monday rank automation; treat organic track orders baseline as **$0**.  
3. This week’s SEO focus: Bobcat T650 primary PDP pack (not Case TV370 demand).  
4. In Merchant Center: filter `custom_label_0 = priority_rubber_tracks` after fetch — Active vs disapproval codes.

## Decision log

| Date | Decision |
|------|----------|
| 2026-07-27 | Formalize managed rubber-tracks revenue program (mirror charger-modules) |
| 2026-07-27 | Optimize for purchases + model/size intent; not vanity head-term traffic |
| 2026-07-27 | Price near comps (free freight + 2yr warranty); not strict 5%-under |
| 2026-07-27 | Weekly automation Mondays ~10:00 AM Eastern (stagger from charger) |
| 2026-07-27 | Baseline: only `case tv370 tracks` in top 100 (#60 on correct PDP) |
| 2026-08-01 | Merchant Shopping accepted as co-equal organic channel for 1/day math |
| 2026-08-01 | Organic track sales baseline = $0 known |
| 2026-08-01 | Merchant track feed: unique RT-* MPN + aftermarket disclosure (regen) |
