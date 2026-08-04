# Rubber Tracks — Status

**Last updated:** 2026-08-04  
**Active phase:** Phase 0 → Phase 1 (measurement) + Merchant review  
**Organic track sales baseline:** $0 known (no recent track Stripe sales)  
**Weekly automation:** did **not** run Mon 2026-08-03 — manual snapshot 2026-08-04 instead  
**Merchant:** Shopping accepted as co-equal organic channel for 1/day math (paid Search still deferred)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Docs + rank script + baseline |
| 1 Measurement | 🟡 | Manual Aug 4 snapshot (automation miss); order attribution unverified |
| 2 Conversion | ⬜ | Hub/PDP UX largely shipped; sidebar→hub polish optional |
| 3 Model SERP wins | ⬜ | Prefer Bobcat T650/T770; Case cluster now has 2 footholds at #60 |
| 4 Expand | 🟡 | Merchant: 65 tracks; feed fix shipped — awaiting Center review clear |

## Rank snapshot (Google US) — 2026-08-04 vs Jul 27

| Keyword | Jul 27 | Aug 4 | Winning URL | Top competitor | Notes |
|---------|------:|------:|-------------|----------------|-------|
| `case tv370 tracks` | **#60** | **#60** = | `/parts/case-tv370-rubber-track-450x86x55` | skidsteers.com | Hold |
| `case tv450 tracks` | out | **#60** NEW | `/parts/case-tv450-rubber-track-450x86x55-block` | skidheaven.com | New foothold — prefer primary (non-block) URL long-term |
| `skid steer rubber tracks` | out | out | — | skidheaven.com | Hub target |
| `compact track loader tracks` | out | out | — | grizzlyrubbertracks.com | Hub target |
| `bobcat rubber tracks` | out | out | — | skidheaven.com | |
| `bobcat t650 tracks` | out | out | — | mclarenindustries.com | Priority model — still out |
| `bobcat t770 tracks` | out | out | — | shop.bobcat.com | OEM SERP |
| `cat 259d tracks` | out | out | — | skidsteers.com | |
| `kubota svl75 tracks` | out | out | — | skidheaven.com | |
| `john deere 333g tracks` | out | out | — | skidheaven.com | |
| `jcb rubber tracks` | out | out | — | greenshieldsjcb.com | |
| `takeuchi tl8 tracks` | out | out | — | skidheaven.com | |

**Summary:** 2/29 ranked · 0 top 10 · 0 top 30 · 0 API errors.  
Full rows: `scripts/seo/rank-snapshots/rubber-tracks/2026-08-04.json`.

Source: DataForSEO via `scripts/seo/rubber-track-rank-check.ts` (manual run).

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

1. **Fix / re-save weekly automation** — Mon 2026-08-03 run did not commit a snapshot.  
2. Wholesale costs only ad hoc from normal POs — never bulk portal lookups.  
3. Approve before any production checkout / pricing / freight changes.

## Next action

1. Re-check Cursor Automations for Rubber Tracks Weekly Rank Monitor (enabled + schedule + secrets).  
2. This week’s SEO focus: Bobcat T650 primary PDP pack (still out of top 100).  
3. Optional: strengthen Case TV450 primary (non-`-block`) URL so it can inherit the #60 foothold.  
4. Merchant Center: filter `custom_label_0 = priority_rubber_tracks` — Active vs disapproval codes.

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
| 2026-08-04 | Manual rank pull: 1→2 ranked; `case tv450 tracks` NEW #60; TV370 held #60; Bobcat still out |
