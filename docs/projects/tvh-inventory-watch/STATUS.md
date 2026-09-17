# STATUS — TVH-network inventory + sticker watch

## 2026-09-17 — built, Stage 2 baseline established

Live. Snapshot pass runs against the core-six Buy Now slice; the sold-out pull step is
armed but gated behind two consecutive confirming reads, so nothing can be pulled from a
single pass.

### Verification

| Check | Result |
|---|---|
| Magnasource itemdetail scrape returns price + on-hand + supplier-confirmed timestamp | PASS — verified on JCB `333/D1629`, Skyjack `107269`, Hyster `1387270`, Toyota `16420-U1280-71` |
| JCB slash preserved in URL (`JC333/D1629`) | PASS |
| Slash-stripped id detected as invalid, not as a dead part | PASS — `JC333D1629` returns HTTP 200 with "no longer valid" |
| Toyota / Crown / Taylor Dunn dashes pass through verbatim | PASS — `TY16420-U1280-71` resolves |
| Identity gates reject a page for a different part or brand | PASS — unit tested, yields `unknown` and nothing actionable |
| Return / cancellation boilerplate cannot override a positive on-hand count | PASS — unit tested |
| Every in-scope brand has an OE prefix mapped | PASS — 0 rows skipped for missing prefix |
| Stage 1 baseline (53 rows with a prior snapshot) parsed | PASS — 51/53 first pass, 53/53 after the hydration retry |
| Async price/inventory block missing reads as `unknown`, never sold out | PASS — the two first-pass misses were hydration, both recovered on retry |
| Snapshot pass leaves `sales_type`, `is_in_stock`, `price`, Stripe untouched | PASS — `mag-watch.ts` writes `metadata` only |
| Pull requires 2 consecutive sold-out reads | PASS — `SOLD_OUT_STREAK_TO_PULL = 2` |
| Per-run pull cap aborts a mass-pull | PASS — `MAX_PULLS_PER_RUN = 10`, exits 2 |
| Stripe price ownership verified before archiving | PASS — `unit_amount` vs `price_cents` and `metadata.sku` vs row SKU |
| Stripe archive rolled back if the Supabase update fails | PASS |
| Stripe webhooks / checkout / freight / training untouched | PASS — no files in those paths changed |

### Universe at build time

1,785 rows in scope: 728 live Buy Now, 1,057 quote-only. Tier A 218, B 185, C 325, D 1,057.
Skipped: 116 excluded category, 14 unusable OEM value, 224 out-of-scope brand, 0 missing
prefix. 183 rows already carried a Magnasource snapshot.

### Defects found and fixed on the way in

- `lib/pricing/compSources.ts` stripped separators when building Magnasource URLs, so every
  JCB `comp_url` written by `scripts/tag-tvh-pricing-metadata.ts` pointed at a dead page
  that still answered HTTP 200. Fixed; the builder now returns `null` for an unmapped brand
  instead of a wrong URL.
- `lib/parts/tvhOePrefixes.ts` was referenced by the rules and the cab-glass README but did
  not exist. The only prefix map in the repo was the seat-guide `OEM_PREFIX_BRAND`, missing
  HY, YT, TY, CR, CL and MB. Now created as the canonical map.
- That seat map also has `GB` → Genie. Live Magnasource data shows `GB` is **Gehl**
  (`GB106100`). The new map uses Gehl; `lib/seats/brandConfig.ts` was left alone to avoid
  disturbing seat-guide parsing.

### Open items

- Prefixes marked `verified: false` in `lib/parts/tvhOePrefixes.ts` still need a confirming
  hit: Crown, Clark, Nissan, Raymond, Mitsubishi, Case, Kubota, John Deere, Takeuchi,
  Tennant, Advance, Powerboss, Terex, Doosan, TCM, New Holland, Merlo, Lull, Columbia,
  Cushman, E-Z-GO, Minuteman, Factory Cat, American Lincoln, Toro, Clarke, Skytrack.
  Each is confirmed the first time one of its rows resolves; digests list unconfirmed
  brands separately so a miss is not mistaken for a dead part number.
- No affirmative zero / backorder page has been observed yet, so that parser branch is
  covered by unit tests rather than a live capture. The fail-safe means an unrecognised
  sold-out layout reads `unknown` and does nothing.
- Forklift forks (16 Hyster rows, all quote-only) are in scope but need PN mapping
  confirmed against Magnasource before any convert.
- Not scheduled yet. Cadence is defined in `tiersDue()`; wire it to a Cursor Automation
  when the first full week of digests looks right.

### Stage 2 first pass — 502 core-six Buy Now rows

Snapshots recorded for all 502. Zero scrape failures, zero rows skipped for a missing
prefix. Second confirming read run on every flagged row: all 33 held, none flipped back.

| Reading | Rows |
|---|---|
| Sold out — backorder or supplier special order | **33** |
| Limited / low on hand — flag only, nothing disabled | 113 |
| In stock | 356 |
| Scrape failures | 0 |

The 33 sold-out rows carry about **$21k of sticker** we cannot actually ship, including JCB
`320/06186-1` at $3,393, `320/06168` at $2,765, `20/925588` at $2,387, `320/06874` at
$2,451, `320/06933` at $2,191, JLG `1600292` at $1,725 and JCB `320/06825` at $1,322.
Roughly half show a supplier restock window of Oct 9–23; the rest read "estimated delivery
not available", and the special-order ones are also non-cancellable and non-returnable once
ordered.

`mag-watch-apply.ts --dry-run` correctly **aborted** on this backlog: 33 qualifying rows
against a per-run cap of 10. Clearing a first-run backlog needs a reviewed, explicit
`--override-cap=33`. The cap stays at 10 for steady state.

### Notable readings from the Stage 1 baseline

- JCB `333/H8243` now reads in stock at $468.87 — the part that previously showed 1 on hand
  against a real vendor count of 24.
- JCB `20/915900`: our $299 against a Magnasource sticker of $560.12, 46.6% under target.
  Flagged as a possible cost reset — confirm cost on the next PO before repricing.
- 12 of 53 baseline rows read limited or low on hand. All flag-only, none disabled.
