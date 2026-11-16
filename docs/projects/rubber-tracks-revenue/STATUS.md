# Rubber Tracks — Status

**Last updated:** 2026-11-16  
**Active phase:** Phase 1 (measurement)  
**Organic track sales baseline:** $0 known (no recent track Stripe sales)  
**Weekly automation:** ran Mon 2026-11-16 (DataForSEO live regular, Google US top 100)  
**Merchant:** Shopping accepted as co-equal organic channel for 1/day math (paid Search still deferred)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Docs + rank script + baseline |
| 1 Measurement | 🟡 | Weekly snapshot; **0/29 ranked** this week; JCB 150T LOST vs Aug 31; order attribution unverified |
| 2 Conversion | ⬜ | Hub/PDP UX largely shipped; sidebar→hub polish optional |
| 3 Model SERP wins | ⬜ | No current top-100 foothold; prioritize Case TV450 / TV370 / JCB 150T recovery before spray |
| 4 Expand | 🟡 | Merchant: 65 tracks; feed fix shipped — awaiting Center review clear |

## Rank snapshot (Google US) — 2026-11-16 vs Aug 31

| Keyword | Aug 31 | Nov 16 | Winning URL | Top competitor | Notes |
|---------|------:|-------:|-------------|----------------|-------|
| `case tv370 tracks` | out | out | — | — | Still out (baseline #60 on 2026-07-27); PDP HTTP 200 |
| `case tv450 tracks` | out | out | — | — | Still out vs committed prior; PDP HTTP 200 (best recent unmerged foothold was #62 on Nov 2) |
| `jcb 150t tracks` | **#62** | out **LOST** | — | — | **LOST** — was correct PDP `/parts/jcb-150t-rubber-track-320x86x48` (HTTP 200) |
| `skid steer rubber tracks` | out | out | — | — | Hub target — still out |
| `compact track loader tracks` | out | out | — | — | Hub target — still out |
| `bobcat rubber tracks` | out | out | — | — | Hub/brand target — still out |
| `bobcat t650 tracks` | out | out | — | — | Priority model — still out |
| `bobcat t770 tracks` | out | out | — | — | Still out |
| `bobcat t590 tracks` | out | out | — | — | |
| `bobcat t550 tracks` | out | out | — | — | |
| `bobcat t190 tracks` | out | out | — | — | |
| `bobcat t66 tracks` | out | out | — | — | |
| `bobcat mt85 tracks` | out | out | — | — | |
| `cat 259d tracks` | out | out | — | — | |
| `cat 279d tracks` | out | out | — | — | |
| `cat 289d tracks` | out | out | — | — | |
| `kubota svl65 tracks` | out | out | — | — | |
| `kubota svl75 tracks` | out | out | — | — | |
| `kubota svl95 tracks` | out | out | — | — | |
| `case tr270 tracks` | out | out | — | — | |
| `case tr310 tracks` | out | out | — | — | |
| `john deere 317g tracks` | out | out | — | — | |
| `john deere 325g tracks` | out | out | — | — | |
| `john deere 331g tracks` | out | out | — | — | |
| `john deere 333g tracks` | out | out | — | — | |
| `jcb rubber tracks` | out | out | — | — | Brand/hub target — still out |
| `jcb 1cxt tracks` | out | out | — | — | |
| `jcb 190t tracks` | out | out | — | — | |
| `takeuchi tl8 tracks` | out | out | — | — | |

**Summary:** 0/29 ranked · 0 top 10 · 0 top 30 · 0 API errors · **1 LOST** (`jcb 150t tracks` #62→out).  
No wins this week. No winning URLs (nothing ranked) — therefore no wrong winning URLs.  
Head terms do **not** land on `/rubber-tracks` hub. Hub + Case TV370/TV450 + JCB 150T PDPs all HTTP 200.  
All 29 `topCompetitor` rows were `google.com` (SERP-feature noise — not a reseller rival).  
Full rows: `scripts/seo/rank-snapshots/rubber-tracks/2026-11-16.json`.  
Compare baseline on this branch: last committed prior = 2026-08-31 (Sep–Nov weekly PRs often unmerged; merge this PR so deltas stick).

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
3. **Merge weekly snapshot PRs** — Sep–Nov gaps on `main` otherwise lose rank history.  
4. Optional: GSC URL Inspection on Case TV450 / TV370 / JCB 150T PDPs if indexing drop is suspected.

## Next action

**Exactly one (Phase 1):** Protect the best recent money keyword — Case TV450 — with GSC + GA4 organic landing / checkout-start coverage on `/parts/case-tv450-rubber-track-450x86x55` (best recent foothold: #62 on 2026-11-02 unmerged run; still out today). Do not spray title/H1 work across never-ranked Bobcat/hub terms until this PDP’s indexing + organic landings are confirmed. PDP HTTP 200; no winning URL this week.

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
| 2026-11-16 | Weekly pull: 1→0 ranked; `jcb 150t tracks` LOST #62→out; 0 API errors; hub still out; all topCompetitor=google.com SERP noise |
