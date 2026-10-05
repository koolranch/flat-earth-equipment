# Rubber Tracks — Status

**Last updated:** 2026-10-05  
**Active phase:** Phase 1 (measurement)  
**Organic track sales baseline:** $0 known (no recent track Stripe sales)  
**Weekly automation:** ran Mon 2026-10-05 (DataForSEO live regular, Google US top 100)  
**Merchant:** Shopping accepted as co-equal organic channel for 1/day math (paid Search still deferred)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Docs + rank script + baseline |
| 1 Measurement | 🟡 | Weekly snapshot; **5/29 ranked** (best committed week); order attribution still unverified |
| 2 Conversion | ⬜ | Hub/PDP UX largely shipped; sidebar→hub polish optional |
| 3 Model SERP wins | ⬜ | Protect MT85 #15 first; hold Case TV370 #20 + JD 325G #22; recover JCB 150T |
| 4 Expand | 🟡 | Merchant: 65 tracks; feed fix shipped — awaiting Center review clear |

## Rank snapshot (Google US) — 2026-10-05 vs Aug 31

| Keyword | Aug 31 | Oct 5 | Winning URL | Top competitor | Notes |
|---------|------:|------:|-------------|----------------|-------|
| `bobcat mt85 tracks` | out | **#15 NEW** | `/parts/bobcat-mt85-rubber-track-180x72x45` | ebay.com | **BEST WIN** — correct PDP (HTTP 200) |
| `case tv370 tracks` | out | **#20 NEW** | `/parts/case-tv370-rubber-track-450x86x55` | rubbertracksamerica.com | **RECOVERED** (baseline #60; lost Aug 10) |
| `john deere 325g tracks` | out | **#22 NEW** | `/parts/john-deere-325g-rubber-track-400x86x52-block` | rubbertracksamerica.com | **WIN** — correct live PDP (HTTP 200) |
| `case tr310 tracks` | out | **#41 NEW** | `/parts/case-tr310-rubber-track-320x86x50` | ebay.com | **WIN** — correct PDP |
| `bobcat t770 tracks` | out | **#59 NEW** | `/parts/bobcat-t770-rubber-track-320x84x56` | shop.bobcat.com | **WIN** — correct PDP; OEM still SERP #1 |
| `jcb 150t tracks` | #62 | out **LOST** | — | trackloaderparts.com | LOST foothold; PDP still HTTP 200 |
| `case tv450 tracks` | out | out | — | crcomponents.com | Still out |
| `case tr270 tracks` | out | out | — | ebay.com | Still out (Sep 28 unmerged run had #14) |
| `skid steer rubber tracks` | out | out | — | righttracksystemsinc.com | Hub target — still out |
| `compact track loader tracks` | out | out | — | skidsteersolutions.com | Hub target — still out |
| `bobcat rubber tracks` | out | out | — | amazon.com | Marketplace SERP |
| `bobcat t650 tracks` | out | out | — | trackloaderparts.com | Priority model — still out |
| `bobcat t590 tracks` | out | out | — | amazon.com | |
| `bobcat t550 tracks` | out | out | — | skidsteers.com | |
| `bobcat t190 tracks` | out | out | — | advancetracks.com | |
| `bobcat t66 tracks` | out | out | — | rubbertrack.com | |
| `cat 259d tracks` | out | out | — | unitedskidtracks.com | |
| `cat 279d tracks` | out | out | — | amazon.com | |
| `cat 289d tracks` | out | out | — | amazon.com | |
| `kubota svl65 tracks` | out | out | — | rubbertrack.com | |
| `kubota svl75 tracks` | out | out | — | blackdogtracks.com | |
| `kubota svl95 tracks` | out | out | — | skidheaven.com | |
| `john deere 317g tracks` | out | out | — | skidtracksdepot.com | |
| `john deere 331g tracks` | out | out | — | grizzlyrubbertracks.com | |
| `john deere 333g tracks` | out | out | — | trackloaderparts.com | |
| `jcb rubber tracks` | out | out | — | jcb.com | OEM SERP |
| `jcb 1cxt tracks` | out | out | — | chicagotireinc.com | |
| `jcb 190t tracks` | out | out | — | ebay.com | |
| `takeuchi tl8 tracks` | out | out | — | ebay.com | |

**Summary:** 5/29 ranked · 0 top 10 · 3 top 30 · 0 API errors · **5 NEW** · **1 LOST** (`jcb 150t tracks` #62→out).  
**Best money foothold:** `bobcat mt85 tracks` #15 on correct PDP.  
Case TV370 recovered to #20 (stronger than baseline #60). JD 325G #22 + Case TR310 #41 + Bobcat T770 #59 also NEW.  
Head terms do **not** land on `/rubber-tracks` hub. No wrong winning URLs (all 5 ranked URLs = correct model PDPs, HTTP 200).  
Full rows: `scripts/seo/rank-snapshots/rubber-tracks/2026-10-05.json`.  
Compare-vs committed prior on this branch: 2026-08-31 (gap weeks / Sep runs may exist only on unmerged PRs).

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
3. Optional: GSC URL Inspection + GA4 on new best money PDP `/parts/bobcat-mt85-rubber-track-180x72x45` (#15).  
4. Optional: GSC check on recovered Case TV370 + JD 325G PDPs; note JCB 150T LOST this week.  
5. Merge this weekly snapshot PR so ranks land on `main` (prior Sep runs often stayed unmerged).

## Next action

**Exactly one (Phase 1):** Protect the best-ranked money keyword — confirm Google indexing + GA4 organic landings / checkout starts on `/parts/bobcat-mt85-rubber-track-180x72x45` (`bobcat mt85 tracks` #15) before Phase 2 conversion spray, JCB 150T recovery work, or weaker Bobcat T770 / Case TR310 title tweaks. PDP HTTP 200; winning URL is correct (not hub, not wrong SKU).

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
| 2026-10-05 | Weekly pull: 1→5 ranked; BEST `bobcat mt85 tracks` #15; Case TV370 recovered #20; JD 325G #22; Case TR310 #41; Bobcat T770 #59; LOST JCB 150T; 0 API errors; hub still out |
