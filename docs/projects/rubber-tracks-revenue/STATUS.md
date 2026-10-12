# Rubber Tracks — Status

**Last updated:** 2026-10-12  
**Active phase:** Phase 1 (measurement)  
**Organic track sales baseline:** $0 known (no recent track Stripe sales)  
**Weekly automation:** ran Mon 2026-10-12 (DataForSEO live regular, Google US top 100)  
**Merchant:** Shopping accepted as co-equal organic channel for 1/day math (paid Search still deferred)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Docs + rank script + baseline |
| 1 Measurement | 🟡 | Weekly snapshot; **best** Case TR310 #40; MT85 #60; TV370 recovered #62; order attribution unverified |
| 2 Conversion | ⬜ | Hub/PDP UX largely shipped; sidebar→hub polish optional |
| 3 Model SERP wins | ⬜ | Protect Case TR310 first; hold MT85/TV370/JCB 150T; Bobcat T650 still out |
| 4 Expand | 🟡 | Merchant: 65 tracks; feed fix shipped — awaiting Center review clear |

## Rank snapshot (Google US) — 2026-10-12 vs Aug 31

Compare-vs on this branch checkout = **2026-08-31** (gap weeks / Oct 5 run lived on unmerged automation branches — see decision log).

| Keyword | Aug 31 | Oct 12 | Winning URL | Top competitor | Notes |
|---------|------:|-------:|-------------|----------------|-------|
| `case tr310 tracks` | out | **#40 NEW** | `/parts/case-tr310-rubber-track-320x86x50` | unitedskidtracks.com | **BEST WIN** — correct model PDP (HTTP 200) |
| `bobcat mt85 tracks` | out | **#60 NEW** | `/parts/bobcat-mt85-rubber-track-180x72x45` | amazon.com | Correct PDP (HTTP 200); was #15 on unmerged 2026-10-05 |
| `case tv370 tracks` | out | **#62 NEW** | `/parts/case-tv370-rubber-track-450x86x55` | skidsteers.com | Recovered (baseline #60 Jul 27; LOST Aug 10) |
| `jcb 150t tracks` | #62 | #72 ↓ | `/parts/jcb-150t-rubber-track-320x86x48` | store.rubbertrax.com | Held foothold; −10; correct PDP |
| `takeuchi tl8 tracks` | out | **#79 NEW** | `/parts/takeuchi-tl8-rubber-track-320x86x52` | rubbertrack.com | Correct PDP (HTTP 200) |
| `john deere 325g tracks` | out | **#99 NEW** | `/parts/john-deere-325g-rubber-track-400x86x52-block` | wadeincorporated.com | Correct model PDP; slug has `-block` tread suffix (existing) |
| `bobcat t190 tracks` | out | #104 NEW | `/parts/bobcat-t190-rubber-track-320x84x50` | trackloaderparts.com | Past #100 abs.; 320 size (not Shopping 400-wide) |
| `john deere 333g tracks` | out | #105 NEW | `/parts/john-deere-333g-rubber-track-450x86x58` | ebay.com | Past #100 abs.; correct PDP |
| `case tr270 tracks` | out | #114 NEW | `/parts/case-tr270-rubber-track-320x86x50` | skidsteers.com | Past #100 abs.; correct PDP |
| `bobcat t550 tracks` | out | #115 NEW | `/parts/bobcat-t550-rubber-track-400x86x49` | skidsteers.com | Past #100 abs.; correct PDP |
| `case tv450 tracks` | out | out | — | skidheaven.com | Still out |
| `skid steer rubber tracks` | out | out | — | grizzlyrubbertracks.com | Hub target — still out |
| `compact track loader tracks` | out | out | — | ebay.com | Hub target — still out |
| `bobcat rubber tracks` | out | out | — | shop.bobcat.com | OEM SERP |
| `bobcat t650 tracks` | out | out | — | trackloaderparts.com | Priority model — still out |
| `bobcat t770 tracks` | out | out | — | grizzlyrubbertracks.com | Out (was #59 on unmerged 2026-10-05) |
| `bobcat t590 tracks` | out | out | — | mclarenindustries.com | |
| `bobcat t66 tracks` | out | out | — | bobcat.com | |
| `cat 259d tracks` | out | out | — | fortishd.com | |
| `cat 279d tracks` | out | out | — | rubbertrack.com | |
| `cat 289d tracks` | out | out | — | trackloaderparts.com | |
| `kubota svl65 tracks` | out | out | — | skidsteers.com | |
| `kubota svl75 tracks` | out | out | — | rubbertrack.com | |
| `kubota svl95 tracks` | out | out | — | rubbertrack.com | |
| `john deere 317g tracks` | out | out | — | murphytractor.com | |
| `john deere 331g tracks` | out | out | — | ebay.com | |
| `jcb rubber tracks` | out | out | — | store.rubbertrax.com | |
| `jcb 1cxt tracks` | out | out | — | grizzlyrubbertracks.com | |
| `jcb 190t tracks` | out | out | — | monstertires.com | |

**Summary:** 10/29 ranked (6 in top 100 · 4 past #100 abs. via SERP-feature inflation) · 0 top 10 · 0 top 30 · 0 API errors · **9 NEW** vs Aug 31 · **1 ↓** (`jcb 150t tracks` #62→#72) · 0 LOST.  
**BEST:** `case tr310 tracks` #40 on correct PDP.  
Head terms do **not** land on `/rubber-tracks` hub. No wrong winning URLs (all ranked URLs are correct model PDPs; HTTP 200 verified).  
Full rows: `scripts/seo/rank-snapshots/rubber-tracks/2026-10-12.json`.

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
3. Optional: GSC URL Inspection on Case TR310 money PDP (new best rank).  
4. Optional: merge prior weekly snapshot PRs so `main` keeps a continuous rank history.

## Next action

**Exactly one (Phase 1):** Protect `case tr310 tracks` #40 — confirm Google indexing + GA4 organic landings / checkout starts on `/parts/case-tr310-rubber-track-320x86x50` before Phase 2 spray or chasing never-ranked Bobcat T650 / hub head terms. PDP HTTP 200; winning URL is correct (not hub, not wrong SKU). Best money keyword this week.

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
| 2026-10-05 | Unmerged automation branch: 5/29 ranked; BEST Bobcat MT85 #15; Case TV370 #20; JD 325G #22; Case TR310 #41; Bobcat T770 #59; JCB 150T LOST |
| 2026-10-12 | Weekly pull: 10/29 ranked (6 top-100); BEST Case TR310 #40; MT85 #60; TV370 #62 recovered; JCB 150T #72 ↓; Takeuchi TL8 #79; JD 325G #99; 4 past-#100 abs.; 0 API errors; hub still out |
