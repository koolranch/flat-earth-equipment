# Rubber Tracks — Status

**Last updated:** 2026-10-19  
**Active phase:** Phase 1 (measurement)  
**Organic track sales baseline:** $0 known (no recent track Stripe sales)  
**Weekly automation:** ran Mon 2026-10-19 (DataForSEO live regular, Google US top 100)  
**Merchant:** Shopping accepted as co-equal organic channel for 1/day math (paid Search still deferred)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Docs + rank script + baseline |
| 1 Measurement | 🟡 | Weekly snapshot; **6 ranked** (5 top-100 + TR310 past #100); Case TR270 best at #68; order attribution unverified |
| 2 Conversion | ⬜ | Hub/PDP UX largely shipped; sidebar→hub polish optional |
| 3 Model SERP wins | ⬜ | Protect Case TR270 #68 first; hold JCB 150T; Case TV370/TV450 still out |
| 4 Expand | 🟡 | Merchant: 65 tracks; feed fix shipped — awaiting Center review clear |

## Rank snapshot (Google US) — 2026-10-19 vs Aug 31

| Keyword | Aug 31 | Oct 19 | Winning URL | Top competitor | Notes |
|---------|------:|-------:|-------------|----------------|-------|
| `case tr270 tracks` | out | **#68 NEW** | `/parts/case-tr270-rubber-track-320x86x50` | skidsteers.com | **BEST WIN** — correct PDP (HTTP 200) |
| `jcb 150t tracks` | #62 | #69 ↓ | `/parts/jcb-150t-rubber-track-320x86x48` | store.rubbertrax.com | Held foothold (−7); correct PDP |
| `takeuchi tl8 tracks` | out | **#86 NEW** | `/parts/takeuchi-tl8-rubber-track-320x86x52` | rubbertrack.com | Correct PDP (HTTP 200) |
| `john deere 325g tracks` | out | **#96 NEW** | `/parts/john-deere-325g-rubber-track-400x86x52-block` | ontrac-parts.com | Correct model PDP (existing `-block` slug) |
| `john deere 333g tracks` | out | **#98 NEW** | `/parts/john-deere-333g-rubber-track-450x86x58` | ebay.com | Correct PDP (HTTP 200) |
| `case tr310 tracks` | out | **#112 NEW** | `/parts/case-tr310-rubber-track-320x86x50` | skidsteers.com | Past #100 abs. (SERP features); correct PDP |
| `case tv370 tracks` | out | out | — | unitedskidtracks.com | Still out (baseline #60 on 2026-07-27) |
| `case tv450 tracks` | out | out | — | skidheaven.com | Still out |
| `skid steer rubber tracks` | out | out | — | skidheaven.com | Hub target — still out |
| `compact track loader tracks` | out | out | — | skidsteersolutions.com | Hub target — still out |
| `bobcat rubber tracks` | out | out | — | skidheaven.com | Hub target — still out |
| `bobcat t650 tracks` | out | out | — | trackloaderparts.com | Priority model — still out |
| `bobcat t770 tracks` | out | out | — | grizzlyrubbertracks.com | |
| `bobcat t590 tracks` | out | out | — | riverview-track.com | |
| `bobcat t550 tracks` | out | out | — | shop.bobcat.com | OEM SERP |
| `bobcat t190 tracks` | out | out | — | skidsteers.com | |
| `bobcat t66 tracks` | out | out | — | grizzlyrubbertracks.com | |
| `bobcat mt85 tracks` | out | out | — | fortishd.com | |
| `cat 259d tracks` | out | out | — | skidsteers.com | |
| `cat 279d tracks` | out | out | — | trackloaderparts.com | |
| `cat 289d tracks` | out | out | — | trackloaderparts.com | |
| `kubota svl65 tracks` | out | out | — | rubbertrack.com | |
| `kubota svl75 tracks` | out | out | — | rubbertrack.com | |
| `kubota svl95 tracks` | out | out | — | rubbertrack.com | |
| `john deere 317g tracks` | out | out | — | murphytractor.com | |
| `john deere 331g tracks` | out | out | — | vanwall.com | |
| `jcb rubber tracks` | out | out | — | grizzlyrubbertracks.com | |
| `jcb 1cxt tracks` | out | out | — | equipmentworld.com | |
| `jcb 190t tracks` | out | out | — | monstertires.com | |

**Summary:** 6/29 ranked · 0 top 10 · 0 top 30 · 0 API errors · **5 NEW top-100** (TR270 #68, TL8 #86, JD 325G #96, JD 333G #98) + TR310 #112 past-100 · **1 ↓** (JCB 150T #62→#69).  
Head terms do **not** land on `/rubber-tracks` hub. No wrong winning URLs (all 6 ranked URLs = correct model PDPs; HTTP 200).  
Best money keyword: `case tr270 tracks` #68. Case TV370/TV450 remain out vs baseline TV370 #60 (2026-07-27).  
Full rows: `scripts/seo/rank-snapshots/rubber-tracks/2026-10-19.json`.  
Compare-vs committed prior on this branch: 2026-08-31 (gap weeks on other automation branches were often unmerged — merge this PR).

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
3. Optional: GSC URL Inspection on Case TV370/TV450 PDPs if indexing drop is suspected.  
4. Optional: GSC + GA4 check on best money PDP `/parts/case-tr270-rubber-track-320x86x50`.  
5. **Merge weekly snapshot PRs** — unmerged automation branches drop rank history from `main`.

## Next action

**Exactly one (Phase 1):** Protect Case TR270 #68 — confirm Google indexing + GA4 organic landings (and any checkout starts) for `/parts/case-tr270-rubber-track-320x86x50` before title/H1 work on never-ranked Bobcat/Cat/Kubota terms or hub head-term chasing. PDP HTTP 200; winning URL is correct (not hub, not wrong SKU). Best absolute rank this week; JCB 150T #69 is secondary hold.

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
| 2026-10-19 | Weekly pull: 1→6 ranked; BEST `case tr270 tracks` #68 NEW; TL8/JD325G/JD333G NEW top-100; TR310 #112 past-100; JCB 150T #62→#69; TV370/TV450 still out; 0 API errors; hub still out |
