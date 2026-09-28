# Rubber Tracks — Status

**Last updated:** 2026-09-28  
**Active phase:** Phase 1 (measurement)  
**Organic track sales baseline:** $0 known (no recent track Stripe sales)  
**Weekly automation:** ran Mon 2026-09-28 (DataForSEO live regular, Google US top 100)  
**Merchant:** Shopping accepted as co-equal organic channel for 1/day math (paid Search still deferred)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Docs + rank script + baseline |
| 1 Measurement | 🟡 | Weekly snapshot; **8/29 ranked** (was 1); Case TR270 #14 best money KW; order attribution unverified |
| 2 Conversion | ⬜ | Hub/PDP UX largely shipped; sidebar→hub polish optional |
| 3 Model SERP wins | ⬜ | Protect Case TR270 #14 first; hold Case TV450/TV370 + JCB 150T; Bobcat footholds new |
| 4 Expand | 🟡 | Merchant: 65 tracks; feed fix shipped — awaiting Center review clear |

## Rank snapshot (Google US) — 2026-09-28 vs Aug 31

| Keyword | Aug 31 | Sep 28 | Winning URL | Top competitor | Notes |
|---------|------:|-------:|-------------|----------------|-------|
| `case tr270 tracks` | out | **#14 NEW** | `/parts/case-tr270-rubber-track-320x86x50` | ebay.com | **BEST WIN** — correct PDP (HTTP 200); top 30 |
| `case tv450 tracks` | out | **#15 NEW** | `/parts/case-tv450-rubber-track-450x86x55-block` | rubbertracksamerica.com | **WIN** — correct PDP (HTTP 200); recovered (lost Aug 10) |
| `case tv370 tracks` | out | **#21 NEW** | `/parts/case-tv370-rubber-track-450x86x55` | rubbertracksamerica.com | **WIN** — correct PDP (HTTP 200); recovered (baseline #60 Jul 27, lost Aug 10) |
| `jcb 150t tracks` | #62 | **#54 ↑** | `/parts/jcb-150t-rubber-track-320x86x48` | store.rubbertrax.com | **UP** — correct PDP (HTTP 200); held foothold |
| `bobcat t650 tracks` | out | **#62 NEW** | `/parts/bobcat-t650-rubber-track-450x86x52` | mclarenindustries.com | **WIN** — correct model PDP (HTTP 200) |
| `bobcat t770 tracks` | out | **#65 NEW** | `/parts/bobcat-t770-rubber-track-320x84x56` | shop.bobcat.com | **WIN** — correct model PDP (HTTP 200) |
| `bobcat t66 tracks` | out | **#69 NEW** | `/parts/bobcat-t66-rubber-track-320x86x50` | mclarenindustries.com | **WIN** — correct model PDP (HTTP 200) |
| `takeuchi tl8 tracks` | out | **#81 NEW** | `/parts/takeuchi-tl8-rubber-track-320x86x52` | rubbertrack.com | **WIN** — correct PDP (HTTP 200) |
| `skid steer rubber tracks` | out | out | — | skidheaven.com | Hub target — still out |
| `compact track loader tracks` | out | out | — | w.wilsonfinley.com | Hub target — still out |
| `bobcat rubber tracks` | out | out | — | fortishd.com | Was shop.bobcat.com Aug 31 |
| `bobcat t590 tracks` | out | out | — | mclarenindustries.com | |
| `bobcat t550 tracks` | out | out | — | skidsteers.com | |
| `bobcat t190 tracks` | out | out | — | advancetracks.com | Was unitedskidtracks Aug 31 |
| `bobcat mt85 tracks` | out | out | — | ebay.com | Was store.rubbertrax Aug 31 |
| `cat 259d tracks` | out | out | — | skidtracksdepot.com | Was unitedskidtracks Aug 31 |
| `cat 279d tracks` | out | out | — | rubbertrack.com | |
| `cat 289d tracks` | out | out | — | rubbertrack.com | |
| `kubota svl65 tracks` | out | out | — | grizzlyrubbertracks.com | Was skidsteers Aug 31 |
| `kubota svl75 tracks` | out | out | — | skidheaven.com | |
| `kubota svl95 tracks` | out | out | — | skidheaven.com | |
| `case tr310 tracks` | out | out | — | skidheaven.com | Was monstertires Aug 31 |
| `john deere 317g tracks` | out | out | — | skidheaven.com | |
| `john deere 325g tracks` | out | out | — | skidheaven.com | |
| `john deere 331g tracks` | out | out | — | grizzlyrubbertracks.com | Was skidheaven Aug 31 |
| `john deere 333g tracks` | out | out | — | skidheaven.com | |
| `jcb rubber tracks` | out | out | — | jcb.com | OEM SERP |
| `jcb 1cxt tracks` | out | out | — | grizzlyrubbertracks.com | |
| `jcb 190t tracks` | out | out | — | monstertires.com | |

**Summary:** 8/29 ranked · 0 top 10 · 3 top 30 · 0 API errors · **7 NEW** + **1 UP** (JCB 150T #62→#54).  
Case cluster recovered hard: TR270 #14, TV450 #15, TV370 #21 (all correct PDPs; TV370/TV450 were out since Aug 10 LOST).  
Bobcat model footholds NEW (T650/T770/T66). Takeuchi TL8 NEW #81.  
Head terms do **not** land on `/rubber-tracks` hub. No wrong winning URLs (all 8 ranked URLs are correct model PDPs).  
Full rows: `scripts/seo/rank-snapshots/rubber-tracks/2026-09-28.json`.  
Compare baseline on this branch: last committed prior = 2026-08-31 (interim weeks Sep 7/14/21 may exist on unmerged automation branches).

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
3. Optional: GSC + GA4 check on best money PDP `/parts/case-tr270-rubber-track-320x86x50` (#14).  
4. Optional: GSC organic coverage on Case TV450/TV370 (#15/#21) and JCB 150T (#54).

## Next action

**Exactly one (Phase 1):** Protect the best-ranked money keyword — confirm GSC indexing + GA4 organic landings (and any Stripe checkout starts) for `/parts/case-tr270-rubber-track-320x86x50` (`case tr270 tracks` **#14 NEW**) before Phase 2 conversion polish or title/H1 spray across weaker Bobcat/Takeuchi footholds. PDP HTTP 200; winning URL is correct (not hub, not wrong SKU).

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
| 2026-09-28 | Weekly pull: 1→8 ranked; Case TR270 #14 / TV450 #15 / TV370 #21 NEW; JCB 150T #62→#54; Bobcat T650/T770/T66 + Takeuchi TL8 NEW; 0 API errors; hub still out |
