# Rubber Tracks — Status

**Last updated:** 2026-10-26  
**Active phase:** Phase 1 (measurement)  
**Organic track sales baseline:** $0 known (no recent track Stripe sales)  
**Weekly automation:** ran Mon 2026-10-26 (DataForSEO live regular, Google US top 100)  
**Merchant:** Shopping accepted as co-equal organic channel for 1/day math (paid Search still deferred)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Docs + rank script + baseline |
| 1 Measurement | 🟡 | Weekly snapshot; **BEST** Case TV370 #61 recovered; Cat 259D #67; Bobcat T66 #78; JCB 150T LOST; order attribution unverified |
| 2 Conversion | ⬜ | Hub/PDP UX largely shipped; sidebar→hub polish optional |
| 3 Model SERP wins | ⬜ | Protect Case TV370 first; hold Cat 259D / Bobcat T66; recover JCB 150T later |
| 4 Expand | 🟡 | Merchant: 65 tracks; feed fix shipped — awaiting Center review clear |

## Rank snapshot (Google US) — 2026-10-26 vs Aug 31

| Keyword | Aug 31 | Oct 26 | Winning URL | Top competitor | Notes |
|---------|------:|-------:|-------------|----------------|-------|
| `case tv370 tracks` | out | **#61 NEW** | `/parts/case-tv370-rubber-track-450x86x55` | unitedskidtracks.com | **BEST WIN** — baseline keyword recovered; correct PDP (HTTP 200) |
| `cat 259d tracks` | out | **#67 NEW** | `/parts/caterpillar-259d-rubber-track-400x86x53` | monstertires.com | **WIN** — correct model PDP (HTTP 200) |
| `bobcat t66 tracks` | out | **#78 NEW** | `/parts/bobcat-t66-rubber-track-400x86x50` | mclarenindustries.com | **WIN** — correct model PDP (HTTP 200) |
| `john deere 317g tracks` | out | **#94 NEW** | `/parts/john-deere-317g-rubber-track-400x86x50` | murphytractor.com | **WIN** — correct model PDP (HTTP 200) |
| `john deere 331g tracks` | out | **#102 NEW** | `/parts/john-deere-331g-rubber-track-450x86x56-multibar` | grizzlyrubbertracks.com | Past #100 abs.; correct PDP (HTTP 200) |
| `case tr270 tracks` | out | **#104 NEW** | `/parts/case-tr270-rubber-track-320x86x50` | ebay.com | Past #100 abs.; correct PDP (HTTP 200) |
| `case tr310 tracks` | out | **#107 NEW** | `/parts/case-tr310-rubber-track-320x86x50` | grizzlyrubbertracks.com | Past #100 abs.; correct PDP (HTTP 200) |
| `takeuchi tl8 tracks` | out | **#107 NEW** | `/parts/takeuchi-tl8-rubber-track-320x86x52` | grizzlyrubbertracks.com | Past #100 abs.; correct PDP (HTTP 200) |
| `bobcat t770 tracks` | out | **#111 NEW** | `/parts/bobcat-t770-rubber-track-450x84x56` | skidsteers.com | Past #100 abs.; correct PDP (HTTP 200) |
| `bobcat t190 tracks` | out | **#112 NEW** | `/parts/bobcat-t190-rubber-track-400x86x49` | fortishd.com | Past #100 abs.; correct PDP (HTTP 200) |
| `jcb 150t tracks` | #62 | out **LOST** | — | skidsteersolutions.com | LOST prior foothold (was #62 Aug 31) |
| `case tv450 tracks` | out | out | — | skidheaven.com | Still out; PDP HTTP 200 |
| `skid steer rubber tracks` | out | out | — | skidheaven.com | Hub target — still out |
| `compact track loader tracks` | out | out | — | rubbertrack.com | Hub target — still out |
| `bobcat rubber tracks` | out | out | — | skidheaven.com | Hub/brand — still out |
| `bobcat t650 tracks` | out | out | — | skidsteers.com | Priority model — still out |
| `bobcat t590 tracks` | out | out | — | riverview-track.com | |
| `bobcat t550 tracks` | out | out | — | shop.bobcat.com | OEM SERP |
| `bobcat mt85 tracks` | out | out | — | fortishd.com | |
| `cat 279d tracks` | out | out | — | skidsteers.com | |
| `cat 289d tracks` | out | out | — | trackloaderparts.com | |
| `kubota svl65 tracks` | out | out | — | skidsteers.com | |
| `kubota svl75 tracks` | out | out | — | rubbertrack.com | |
| `kubota svl95 tracks` | out | out | — | rubbertrack.com | |
| `john deere 325g tracks` | out | out | — | skidheaven.com | |
| `john deere 333g tracks` | out | out | — | ebay.com | |
| `jcb rubber tracks` | out | out | — | grizzlyrubbertracks.com | |
| `jcb 1cxt tracks` | out | out | — | grizzlyrubbertracks.com | |
| `jcb 190t tracks` | out | out | — | store.rubbertrax.com | |

**Summary:** 10/29 ranked · 4 in top 100 · 6 past #100 abs. · 0 top 10 · 0 top 30 · 0 API errors · **9 NEW** + **1 LOST** (`jcb 150t tracks`).  
**BEST:** `case tv370 tracks` #61 on correct PDP (baseline keyword recovered).  
Head terms do **not** land on `/rubber-tracks` hub. No wrong winning URLs (all ranked URLs = correct model PDPs, HTTP 200).  
Full rows: `scripts/seo/rank-snapshots/rubber-tracks/2026-10-26.json`.  
Compare baseline on this branch: last committed prior = 2026-08-31 (interim weekly PRs often unmerged — merge this PR so data lands on `main`).

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
3. Optional: GSC URL Inspection on Case TV370 PDP (best rank this week) + JCB 150T if indexing drop suspected after LOST.  
4. Merge weekly snapshot PRs promptly — unmerged weeks leave `main` stuck on Aug 31.

## Next action

**Exactly one (Phase 1):** Protect best money keyword `case tv370 tracks` (#61) — confirm Google indexing + GA4 organic landings / checkout starts on `/parts/case-tv370-rubber-track-450x86x55` before title/H1 work on never-ranked terms or chasing the JCB 150T loss. PDP HTTP 200; winning URL is correct (not hub, not wrong SKU).

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
| 2026-10-26 | Weekly pull: 1→10 ranked; BEST `case tv370 tracks` #61 recovered; Cat 259D #67; Bobcat T66 #78; JD 317G #94; JCB 150T LOST; 0 API errors; hub still out |
