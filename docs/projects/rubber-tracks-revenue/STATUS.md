# Rubber Tracks — Status

**Last updated:** 2026-08-31  
**Active phase:** Phase 1 (measurement)  
**Organic track sales baseline:** $0 known (no recent track Stripe sales)  
**Weekly automation:** ran Mon 2026-08-31 (DataForSEO live regular, Google US top 100)  
**Merchant:** Shopping accepted as co-equal organic channel for 1/day math (paid Search still deferred)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Docs + rank script + baseline |
| 1 Measurement | 🟡 | Weekly snapshot; **NEW** JCB 150T #62 foothold; Case still out; order attribution unverified |
| 2 Conversion | ⬜ | Hub/PDP UX largely shipped; sidebar→hub polish optional |
| 3 Model SERP wins | ⬜ | Protect JCB 150T first; recover Case TV370; Bobcat T650/T770 still out |
| 4 Expand | 🟡 | Merchant: 65 tracks; feed fix shipped — awaiting Center review clear |

## Rank snapshot (Google US) — 2026-08-31 vs Aug 10

| Keyword | Aug 10 | Aug 31 | Winning URL | Top competitor | Notes |
|---------|------:|-------:|-------------|----------------|-------|
| `case tv370 tracks` | out | out | — | skidsteers.com | Still out (lost #60 on Aug 10); PDP HTTP 200 |
| `case tv450 tracks` | out | out | — | skidheaven.com | Still out; PDPs HTTP 200 |
| `jcb 150t tracks` | out | **#62 NEW** | `/parts/jcb-150t-rubber-track-320x86x48` | store.rubbertrax.com | **WIN** — correct model PDP (HTTP 200) |
| `skid steer rubber tracks` | out | out | — | skidheaven.com | Hub target — still out |
| `compact track loader tracks` | out | out | — | grizzlyrubbertracks.com | Hub target — still out |
| `bobcat rubber tracks` | out | out | — | shop.bobcat.com | OEM SERP this week (was skidheaven Aug 10) |
| `bobcat t650 tracks` | out | out | — | mclarenindustries.com | Priority model — still out |
| `bobcat t770 tracks` | out | out | — | shop.bobcat.com | OEM SERP |
| `bobcat t590 tracks` | out | out | — | mclarenindustries.com | |
| `bobcat t550 tracks` | out | out | — | skidsteers.com | Was skidheaven Aug 10 |
| `bobcat t190 tracks` | out | out | — | unitedskidtracks.com | |
| `bobcat t66 tracks` | out | out | — | unitedskidtracks.com | |
| `bobcat mt85 tracks` | out | out | — | store.rubbertrax.com | Was skidheaven Aug 10 |
| `cat 259d tracks` | out | out | — | unitedskidtracks.com | |
| `cat 279d tracks` | out | out | — | skidheaven.com | Was parts.cat.com Aug 10 |
| `cat 289d tracks` | out | out | — | rubbertrack.com | Was skidsteers Aug 10 |
| `kubota svl65 tracks` | out | out | — | skidsteers.com | |
| `kubota svl75 tracks` | out | out | — | skidheaven.com | |
| `kubota svl95 tracks` | out | out | — | skidheaven.com | |
| `case tr270 tracks` | out | out | — | skidsteers.com | |
| `case tr310 tracks` | out | out | — | monstertires.com | |
| `john deere 317g tracks` | out | out | — | skidheaven.com | |
| `john deere 325g tracks` | out | out | — | skidheaven.com | |
| `john deere 331g tracks` | out | out | — | skidheaven.com | |
| `john deere 333g tracks` | out | out | — | skidheaven.com | |
| `jcb rubber tracks` | out | out | — | jcb.com | OEM SERP |
| `jcb 1cxt tracks` | out | out | — | grizzlyrubbertracks.com | |
| `jcb 190t tracks` | out | out | — | monstertires.com | |
| `takeuchi tl8 tracks` | out | out | — | skidheaven.com | |

**Summary:** 1/29 ranked · 0 top 10 · 0 top 30 · 0 API errors · **1 NEW** (`jcb 150t tracks` #62 on correct PDP).  
Case TV370 + TV450 remain out (3rd consecutive committed week after Aug 10 LOST).  
Head terms do **not** land on `/rubber-tracks` hub. No wrong winning URLs (only ranked URL is the correct JCB 150T PDP).  
Full rows: `scripts/seo/rank-snapshots/rubber-tracks/2026-08-31.json`.  
Compare baseline on this branch: last committed prior = 2026-08-10 (gap weeks had no committed snapshot on this branch).

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
4. Optional: GSC + GA4 check on new money PDP `/parts/jcb-150t-rubber-track-320x86x48`.

## Next action

**Exactly one (Phase 1):** Confirm Google indexing + GA4 organic landing coverage for the new money PDP `/parts/jcb-150t-rubber-track-320x86x48` (`jcb 150t tracks` #62) — protect this foothold before spraying title/H1 work across never-ranked terms or chasing Case TV370 recovery. PDP HTTP 200; winning URL is correct (not hub, not wrong SKU).

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
