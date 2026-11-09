# Rubber Tracks — Status

**Last updated:** 2026-11-09  
**Active phase:** Phase 1 (measurement)  
**Organic track sales baseline:** $0 known (no recent track Stripe sales)  
**Weekly automation:** ran Mon 2026-11-09 (DataForSEO live regular, Google US top 100)  
**Merchant:** Shopping accepted as co-equal organic channel for 1/day math (paid Search still deferred)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Docs + rank script + baseline |
| 1 Measurement | 🟡 | Weekly snapshot; **0/29 ranked this week** — LOST last foothold(s); order attribution unverified |
| 2 Conversion | ⬜ | Hub/PDP UX largely shipped; sidebar→hub polish optional |
| 3 Model SERP wins | ⬜ | No current top-100 foothold; recover Case TV450 / TV370 / JCB 150T before spraying new models |
| 4 Expand | 🟡 | Merchant: 65 tracks; feed fix shipped — awaiting Center review clear |

## Rank snapshot (Google US) — 2026-11-09 vs Aug 31 (committed prior on this branch)

| Keyword | Aug 31 | Nov 09 | Winning URL | Top competitor | Notes |
|---------|------:|-------:|-------------|----------------|-------|
| `case tv370 tracks` | out | out | — | google.com* | Still out; PDP HTTP 200; was #81 on 2026-11-02 (unmerged) |
| `case tv450 tracks` | out | out | — | google.com* | Still out; PDP HTTP 200; was **#62 BEST** on 2026-11-02 (unmerged) |
| `jcb 150t tracks` | **#62** | out **LOST** | — | google.com* | **LOST** — correct PDP still HTTP 200 |
| `skid steer rubber tracks` | out | out | — | google.com* | Hub target — still out |
| `compact track loader tracks` | out | out | — | google.com* | Hub target — still out |
| `bobcat rubber tracks` | out | out | — | google.com* | Hub/brand target — still out |
| `bobcat t650 tracks` | out | out | — | google.com* | Priority model — still out |
| `bobcat t770 tracks` | out | out | — | google.com* | |
| `bobcat t590 tracks` | out | out | — | google.com* | |
| `bobcat t550 tracks` | out | out | — | google.com* | |
| `bobcat t190 tracks` | out | out | — | google.com* | |
| `bobcat t66 tracks` | out | out | — | google.com* | |
| `bobcat mt85 tracks` | out | out | — | google.com* | |
| `cat 259d tracks` | out | out | — | google.com* | |
| `cat 279d tracks` | out | out | — | google.com* | |
| `cat 289d tracks` | out | out | — | google.com* | |
| `kubota svl65 tracks` | out | out | — | google.com* | |
| `kubota svl75 tracks` | out | out | — | google.com* | |
| `kubota svl95 tracks` | out | out | — | google.com* | |
| `case tr270 tracks` | out | out | — | google.com* | |
| `case tr310 tracks` | out | out | — | google.com* | |
| `john deere 317g tracks` | out | out | — | google.com* | |
| `john deere 325g tracks` | out | out | — | google.com* | |
| `john deere 331g tracks` | out | out | — | google.com* | |
| `john deere 333g tracks` | out | out | — | google.com* | |
| `jcb rubber tracks` | out | out | — | google.com* | |
| `jcb 1cxt tracks` | out | out | — | google.com* | |
| `jcb 190t tracks` | out | out | — | google.com* | |
| `takeuchi tl8 tracks` | out | out | — | google.com* | |

\* `topCompetitor: google.com` = SERP-feature noise this week (same pattern as 2026-11-02) — not a real reseller rival.

**Summary:** 0/29 ranked · 0 top 10 · 0 top 30 · 0 API errors · **1 LOST vs Aug 31** (`jcb 150t tracks` #62→out).  
Vs automation memory prior **2026-11-02** (unmerged PR): also **LOST** Case TV450 #62 and Case TV370 #81 — no remaining top-100 footholds.  
Head terms do **not** land on `/rubber-tracks` hub. No wrong winning URLs (nothing ranked).  
Money PDPs still live: JCB 150T / Case TV450 / Case TV370 / hub all HTTP 200.  
Full rows: `scripts/seo/rank-snapshots/rubber-tracks/2026-11-09.json`.  
Compare-vs committed prior on this branch: 2026-08-31 (Sep–Oct + Nov 2 weekly PRs still need merge for continuous history on `main`).

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
3. **Merge weekly rank PRs** — Sep 7–Nov 2 automation snapshots never landed on `main`; continuous history depends on marking this PR ready + merge.  
4. Optional: GSC URL Inspection on Case TV450 / TV370 / JCB 150T PDPs if indexing drop is suspected.  
5. Optional: GSC + GA4 organic landings/checkout starts on `/parts/case-tv450-rubber-track-450x86x55` (best recent money keyword).

## Next action

**Exactly one (Phase 1):** Protect the best recent money keyword — confirm Google indexing + GSC/GA4 organic landings (and any checkout starts) for `/parts/case-tv450-rubber-track-450x86x55` (`case tv450 tracks` was #62 BEST on 2026-11-02, now out). Do not spray title/H1 work across never-ranked Bobcat/Cat/JD terms until this foothold is diagnosed. PDP HTTP 200; no checkout/pricing changes.

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
| 2026-11-02 | Weekly pull (unmerged): 2/29 ranked; Case TV450 #62 BEST + TV370 #81; JCB 150T LOST |
| 2026-11-09 | Weekly pull: 0/29 ranked; LOST JCB 150T vs Aug 31; LOST Case TV450 + TV370 vs Nov 2 memory; 0 API errors; hub still out |
