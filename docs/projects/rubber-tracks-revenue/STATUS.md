# Rubber Tracks — Status

**Last updated:** 2026-11-23  
**Active phase:** Phase 1 (measurement)  
**Organic track sales baseline:** $0 known (no recent track Stripe sales)  
**Weekly automation:** ran Mon 2026-11-23 (DataForSEO live regular, Google US top 100)  
**Merchant:** Shopping accepted as co-equal organic channel for 1/day math (paid Search still deferred)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Docs + rank script + baseline |
| 1 Measurement | 🟡 | Weekly snapshot; **0/29 ranked**; JCB 150T LOST; Case still out; order attribution unverified |
| 2 Conversion | ⬜ | Hub/PDP UX largely shipped; sidebar→hub polish optional |
| 3 Model SERP wins | ⬜ | No live foothold to protect this week; recover Case TV450/TV370 + JCB 150T before spray |
| 4 Expand | 🟡 | Merchant: 65 tracks; feed fix shipped — awaiting Center review clear |

## Rank snapshot (Google US) — 2026-11-23 vs Aug 31

| Keyword | Aug 31 | Nov 23 | Winning URL | Top competitor | Notes |
|---------|------:|-------:|-------------|----------------|-------|
| `case tv370 tracks` | out | out | — | google.com* | Still out; PDP HTTP 200 |
| `case tv450 tracks` | out | out | — | google.com* | Still out; best recent money keyword (Nov 2 memory #62); PDP HTTP 200 |
| `jcb 150t tracks` | **#62** | out | — | google.com* | **LOST** — was only Aug 31 foothold; PDP HTTP 200 |
| `skid steer rubber tracks` | out | out | — | google.com* | Hub target — still out |
| `compact track loader tracks` | out | out | — | google.com* | Hub target — still out |
| `bobcat rubber tracks` | out | out | — | google.com* | Hub/brand — still out |
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

\*All 29 `topCompetitor: google.com` — SERP-feature noise (same pattern as recent weekly runs); not a real reseller rival.

**Summary:** 0/29 ranked · 0 top 10 · 0 top 30 · 0 API errors · **1 LOST** (`jcb 150t tracks` #62→out).  
No wins this week. No wrong winning URLs (nothing ranked). Head terms do **not** land on `/rubber-tracks` hub.  
Hub + JCB 150T / Case TV450 / Case TV370 PDPs all HTTP 200.  
Full rows: `scripts/seo/rank-snapshots/rubber-tracks/2026-11-23.json`.  
Compare baseline on this branch: last committed prior = 2026-08-31 (interim weekly runs Sep–Nov often left unmerged draft PRs).

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
3. **Merge this weekly snapshot PR** so STATUS + JSON land on `main` (prior Sep–Nov runs often stayed unmerged).  
4. Optional: GSC URL Inspection + organic landing check on Case TV450 PDP (best recent money keyword).  
5. Optional: GSC + GA4 on JCB 150T PDP after LOST from #62.

## Next action

**Exactly one (Phase 1):** Protect Case TV450 — confirm Google indexing + GA4 organic landings / checkout starts on `/parts/case-tv450-rubber-track-450x86x55` (best recent money keyword from Nov 2 #62 foothold; still HTTP 200). Prefer this over spraying title/H1 work across never-ranked Bobcat/Cat terms or chasing head-hub vanity. Do not change checkout, pricing, freight, or Stripe webhooks.

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
| 2026-11-23 | Weekly pull: 1→0 ranked; `jcb 150t tracks` LOST #62→out; 0/29; 0 API errors; hub still out; all topCompetitor=google.com noise |
