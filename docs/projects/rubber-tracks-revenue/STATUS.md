# Rubber Tracks — Status

**Last updated:** 2026-09-21  
**Active phase:** Phase 1 (measurement)  
**Organic track sales baseline:** $0 known (no recent track Stripe sales)  
**Weekly automation:** ran Mon 2026-09-21 (DataForSEO live regular, Google US top 100)  
**Merchant:** Shopping accepted as co-equal organic channel for 1/day math (paid Search still deferred)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Docs + rank script + baseline |
| 1 Measurement | 🟡 | Weekly snapshot; **LOST** sole foothold `jcb 150t tracks` (#62→out); order attribution unverified |
| 2 Conversion | ⬜ | Hub/PDP UX largely shipped; sidebar→hub polish optional |
| 3 Model SERP wins | ⬜ | Recover JCB 150T first; Case TV370 still out; Bobcat T650/T770 still out |
| 4 Expand | 🟡 | Merchant: 65 tracks; feed fix shipped — awaiting Center review clear |

## Rank snapshot (Google US) — 2026-09-21 vs Aug 31

| Keyword | Aug 31 | Sep 21 | Winning URL | Top competitor | Notes |
|---------|------:|-------:|-------------|----------------|-------|
| `case tv370 tracks` | out | out | — | skidsteers.com | Still out (lost #60 on Aug 10); PDP HTTP 200 |
| `case tv450 tracks` | out | out | — | skidheaven.com | Still out; PDPs HTTP 200 |
| `jcb 150t tracks` | **#62** | **out LOST** | — | store.rubbertrax.com | **LOSS** — was sole money foothold on correct PDP; PDP still HTTP 200 |
| `takeuchi tl8 tracks` | out | out | — | rubbertrack.com | Still out on this branch (interim Sep 14 unmerged run had #85); PDP HTTP 200 |
| `skid steer rubber tracks` | out | out | — | skidheaven.com | Hub target — still out |
| `compact track loader tracks` | out | out | — | grizzlyrubbertracks.com | Hub target — still out |
| `bobcat rubber tracks` | out | out | — | shop.bobcat.com | OEM SERP |
| `bobcat t650 tracks` | out | out | — | mclarenindustries.com | Priority model — still out |
| `bobcat t770 tracks` | out | out | — | shop.bobcat.com | OEM SERP |
| `bobcat t590 tracks` | out | out | — | mclarenindustries.com | |
| `bobcat t550 tracks` | out | out | — | skidsteers.com | |
| `bobcat t190 tracks` | out | out | — | skidsteers.com | Was unitedskidtracks Aug 31 |
| `bobcat t66 tracks` | out | out | — | mclarenindustries.com | Was unitedskidtracks Aug 31 |
| `bobcat mt85 tracks` | out | out | — | store.rubbertrax.com | |
| `cat 259d tracks` | out | out | — | unitedskidtracks.com | |
| `cat 279d tracks` | out | out | — | rubbertrack.com | Was skidheaven Aug 31 |
| `cat 289d tracks` | out | out | — | rubbertrack.com | |
| `kubota svl65 tracks` | out | out | — | skidsteers.com | |
| `kubota svl75 tracks` | out | out | — | skidheaven.com | |
| `kubota svl95 tracks` | out | out | — | skidheaven.com | |
| `case tr270 tracks` | out | out | — | skidsteers.com | |
| `case tr310 tracks` | out | out | — | skidheaven.com | Was monstertires Aug 31 |
| `john deere 317g tracks` | out | out | — | skidheaven.com | |
| `john deere 325g tracks` | out | out | — | skidheaven.com | |
| `john deere 331g tracks` | out | out | — | skidheaven.com | |
| `john deere 333g tracks` | out | out | — | skidheaven.com | |
| `jcb rubber tracks` | out | out | — | jcb.com | OEM SERP |
| `jcb 1cxt tracks` | out | out | — | grizzlyrubbertracks.com | |
| `jcb 190t tracks` | out | out | — | monstertires.com | |

**Summary:** 0/29 ranked · 0 top 10 · 0 top 30 · 0 API errors · **1 LOST** (`jcb 150t tracks` #62→out).  
Case TV370 + TV450 remain out (still out since Aug 10 LOST).  
Head terms do **not** land on `/rubber-tracks` hub. No wrong winning URLs (nothing ranked).  
Money PDPs + hub still HTTP 200: `/rubber-tracks`, `/parts/jcb-150t-rubber-track-320x86x48`, `/parts/takeuchi-tl8-rubber-track-320x86x52`, `/parts/case-tv370-rubber-track-450x86x55`.  
Full rows: `scripts/seo/rank-snapshots/rubber-tracks/2026-09-21.json`.  
Compare-vs committed prior on this branch: 2026-08-31 (Sep 7 / Sep 14 interim runs were memory-only / other branches and never landed on `main`).

Source: DataForSEO via `scripts/seo/rubber-track-rank-check.ts` (weekly automation).

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

1. Wholesale costs only ad hoc from normal POs — never bulk portal lookups.  
2. Approve before any production checkout / pricing / freight changes.  
3. **Priority:** GSC URL Inspection + 28-day impressions/clicks on `/parts/jcb-150t-rubber-track-320x86x48` after LOST from #62.  
4. Optional: GSC URL Inspection on Case TV370/TV450 PDPs if indexing drop is suspected.

## Next action

**Exactly one (Phase 1):** Run GSC URL Inspection + check organic impressions/clicks for `/parts/jcb-150t-rubber-track-320x86x48` — recover the best money keyword (`jcb 150t tracks`, LOST #62→out this week) before any title/H1 spray across never-ranked terms, Takeuchi expansion, or Case TV370 recovery. PDP is still HTTP 200; SERP top is store.rubbertrax.com.

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
| 2026-08-10 | Weekly pull: 2→0 ranked; Case TV370 + TV450 both LOST from #60; 0 API errors; hub still out on head terms |
| 2026-08-31 | Weekly pull: 0→1 ranked; `jcb 150t tracks` NEW #62 on correct PDP; Case still out; 0 API errors; hub still out |
| 2026-09-21 | Weekly pull: 1→0 ranked; `jcb 150t tracks` LOST #62→out; 0 API errors; hub still out; money PDPs HTTP 200 |
