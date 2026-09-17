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

## 2026-09-17 — hero-image measurement wired into the watch

Catalog audit of in-scope rows by current `image_url`: **~135 real photos, 667 brand logos
(196 live Buy Now), 816 empty (310 live Buy Now).** Photos, not price, are the constraint
on converting the 1,087 quote-only stubs.

One read-only look at the JCB `333/D1629` page showed Magnasource publishes the hero as
`og:image` at `/services/getimage/electronic-sensor-jc333d1629.jpg?key=…` — a 250×250
JPEG on white, no watermark, filename carrying the part id. The same Firecrawl response the
watch already receives includes that metadata, so hero capture costs no extra vendor reads.
An LLM "pick the hero" extraction on the same page returned a Gehl part from the
related-items carousel; the filename identity gate is what makes this safe.

Shipped: `lib/pricing/magHero.ts` (filename identity gate, placeholder heuristic, current
hero classification, seat exclusion) with tests; each watch read now stores
`mag_watch.hero` (filename + gate results, never the signed URL); the run digest and
`/parts-watch` gained a *Product photos* block (real / logo / none by Buy Now vs quote,
plus how many gap rows have a usable vendor hero on record). `WATCH_ROW_SELECT` is now the
one column list for every watch reader so `image_url` landed everywhere at once.

Verified with a two-SKU dry run: both pages exposed a hero, both passed identity, zero
gap-fill because both rows already have real photos. Nothing downloaded, `image_url`
untouched.

Not built yet, by design: bytes download, private intake bucket, review table, deterministic
rework, approve/reject UI. Those wait on a week of measurement so the tray is sized from
data rather than assumed. Generative cleanup stays interactive; approve will mean
"set `image_url`" and nothing else.

## 2026-09-17 — first dashboard write lane: Pull and Relist

Sixty days of git history showed 46 one-off scripts touching parts rows (25 convert, 11
add, 7 pricing, 3 update). The dashboard is the place to absorb that, starting with the two
operations that already had guardrails.

Shipped: `lib/pricing/magWatchOps.ts` extracts pull and relist from the CLI into shared
functions with the eligibility gate split out as pure code; `mag-watch-apply.ts` is now a
thin wrapper (dry run against the live universe produced the same "nothing to pull" as
before the refactor). New `parts_ops_audit` table (RLS, service-role only) logs every write
from either caller. `/parts-watch` gained a Pull button on ready rows, a Relist form with a
required stock-confirm checkbox on pulled rows, a Recent actions section, a result banner,
and a "changes since the Merchant feed was built" notice fed by a new
`google-merchant.meta.json` sidecar (rebuilt XML was byte-identical; only the sidecar is
new).

Verified locally against a dev server: eleven refusal paths (no cookie, cross-origin,
missing Origin, malformed SKU, unknown SKU, ineligible live row, relist without checkbox,
relist on a non-pulled row, GET, banner rendering, bogus banner kind) all refused with the
right message and wrote zero audit rows. Unit tests cover eligibility, metadata shapes, the
happy paths, the ownership-mismatch path (row goes quote-only, Stripe untouched), and both
rollback branches (DB failure after archive restores the price; DB failure after restore
re-archives it).

Not yet exercised live: an actual Pull click. The sold-out queue is empty today (the 33-row
backlog was cleared yesterday), so the first real click happens when the weekday read
surfaces the next confirmed sold-out row. The Stripe and Supabase calls are unchanged from
the CLI that pulled those 33.

Next lanes, in order: image approve/reject (after a week of hero measurement), then the
convert quote-only → Buy Now panel, then accept-reprice on sticker movers.

## 2026-09-17 — second write lane: Apply reprice on sticker movers

Decision from the operator: the vendor sticker plus on-hand is the pricing signal for the
whole TVH-network catalog; true cost lands at the first PO. So for rows that already have a
public price and now sit off the ~5%-under target, the dashboard proposes the recomputed
sell and the operator clicks. Nothing auto-reprices.

Shipped: `repriceEligibility` / `applyReprice` in `magWatchOps.ts` (four states — apply,
hold, verify, skip — documented in the README), `POST /parts-watch/actions/reprice` taking
one `only=` SKU or up to 25 checkbox `sku`s and re-gating each server-side, Apply buttons
and a bulk "Apply selected" on Price problems, `reprice` as a third audit action, and a
`reprice_hold` operator lock honoured by the gate. `stripe_product_id` joined the shared
watch select so a new price can attach to the existing product.

Preview against the live 1,017 Buy Now rows before deploy: 262 apply (94 cuts, 168 raises,
17 with a confirmed cost), 62 verify, 3 hold, 690 skip. The three holds are the two operator
locks (JCB `332/X6237`, Bobcat `7123864`) and JCB `333/H5787` where Mag reads under our
cost. The verify set is the class of $89-switch-vs-$10-sticker rows the operator flagged as
likely wrong items; they show a reason instead of a button.

Unit tests cover every band boundary (1.5× above, 3× raise, sticker ≤ cost, lock,
skip-comps, LTL, stale, sold out, no product), the create → update → archive → audit
call order, the no-cost provisional flag, dry run, and the DB-failure branch that archives
the new price.

Same day: dropped the blanket "seats are priced by hand" skip. Seats, cushions, and
covers now go through the same Apply / hold / verify path; skip-comps still refuses
`7505149` / `6669135` / `7338638`.

Next lanes: convert quote-only → Buy Now (gated on an approved photo), then the image tray
that feeds it.
