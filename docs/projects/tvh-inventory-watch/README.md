# TVH-network inventory + sticker watch

Keeps the equipment-parts catalog honest against the supplier network it actually ships
from: stop selling part numbers that have gone to zero, and catch sticker moves before we
sit above the public comp or too far under a cost reset.

Magnasource's public itemdetail pages run on the same supplier API our TVH-sourced parts
come from, so its on-hand count is a vendor stock reference and its public price is the
sticker we benchmark. Neither is customer-facing, and neither vendor is ever named in
customer copy.

## Scope

**In:** equipment parts on the TVH network — JCB, Genie, JLG, Skytrack, Skyjack, Bobcat,
plus the other OE-prefix brands already in catalog (Hyster, Yale, Toyota, Caterpillar,
Case, Crown, Tennant, Advance, Power Boss, Takeuchi, Manitou and the rest). Live Buy Now
rows and quote-only stubs both, and cab glass. Sensors, switches, joysticks, solenoids and
senders are equipment parts and stay in.

**Out:** anything on a different cost or stock system — the separate rubber-track vendor,
Lithium Rhino, Navitas kits, Delta-Q / QuiQ / FSIP chargers, Sevcon DC/DC, reman charger
modules and Repair & Return, and training/rentals. The `chargers` and `battery-chargers`
category shelves are excluded because they are mostly FSIP-sourced. Scope lives in
`lib/pricing/magWatchUniverse.ts`; edit it there rather than in the scripts.

Current universe (see `--universe`): **1,785** rows in scope — 728 live Buy Now, 1,057
quote-only. 14 rows are skipped for an unusable OEM value, 116 for an excluded category.

## Why Magnasource on-hand is a reference, not our stock flag

`parts.is_in_stock` is ours. Magnasource has read low while the vendor held stock — JCB
`333/H8243` showed 1 on hand against a real vendor count of 24 — so a "limited / 1 on hand"
reading is a review flag and never disables anything. Only an affirmative zero, backorder,
or supplier special-order reading can take a SKU off Buy Now.

## Commands

```bash
# Scope counts only. No network calls, no writes.
npx tsx scripts/pricing/mag-watch.ts --universe

# Read pages, record snapshots, write a digest. Never changes price or availability.
npx tsx scripts/pricing/mag-watch.ts --slice=core-six --tier=A,B,C
npx tsx scripts/pricing/mag-watch.ts                       # tiers due for today

# The only automated write path: pull sold-out SKUs off Buy Now.
npx tsx scripts/pricing/mag-watch-apply.ts --dry-run
npx tsx scripts/pricing/mag-watch-apply.ts

# Relist after your stock confirm.
npx tsx scripts/pricing/mag-watch-apply.ts --relist=333D1629
```

Slices: `baseline` (core-six Buy Now that already have a Magnasource snapshot),
`core-six`, `direct` (all Buy Now), `all`. Digests land in `snapshots/` as dated
`.md` + `.json`.

## Cadence

| Tier | Rows | Selector | Days |
|---|---|---|---|
| A | 218 | Buy Now, sticker ≥ $300 | Every weekday |
| B | 185 | Buy Now, $100–299 | Wed + Fri |
| C | 325 | Buy Now, under $100 | Mon |
| D | 1,057 | Quote-only stubs | Tue, Thu, Fri — stalest 90 per run |

Roughly 2,100 page reads a week, balanced so no single run exceeds ~550 pages. The
quote-only pool cycles about once a month. Requests go through Firecrawl, so Magnasource sees
Firecrawl's proxies rather than our IP or Vercel's, and we never touch the authenticated
vendor portal — bulk cost lookups there flag the account. Concurrency is capped at 2 with
1.5–3s jitter. A URL that fails to parse three times in a row is retired
(`mag_watch.miss_count`) so we stop paying to fetch it.

## Process

| Magnasource reading | Action | Automated |
|---|---|---|
| Zero on hand / backorder / special-order, **Buy Now row** | Pull off Buy Now | Yes, after 2 consecutive reads |
| Same, quote-only row | Snapshot only | Snapshot |
| Limited / 1–2 on hand | Digest flag. Never disables | Flag only |
| Sticker moved so our sell is no longer ~5% under | Digest row with current sell, Mag, and proposed sell | No — propose only |
| Our sell now above Mag | Same, escalated | No |
| Mag jumped >15% | Flagged "looks like a cost reset — confirm cost on next PO" | No |
| Mag collapsed >20% | Flagged "consider skip/disable rather than matching" | No |
| Quote-only stub now in stock | Listed as convertible; convert still needs photo, freight and your stock confirm | No |
| Parse failure, invalid part number, unknown | Digest failure, miss counter | Flag only |

Sticker changes are never auto-applied. Magnasource price is a sticker, not our cost.

## What a pull actually does

Flipping `sales_type` alone does not stop a sale. `/api/checkout` trusts a client-supplied
`priceId` and never reads the parts row, and PDP gating keys off `sales_type` /
`stripe_price_id` / price rather than `is_in_stock`. So a pull does four things together:

1. `sales_type` → `quote_only`
2. `is_in_stock` → `false`
3. Stripe price archived (`active: false`) — this is what kills a persisted cart or a
   leaked price id
4. `stripe_price_id` → `null`, with the old id saved to
   `metadata.mag_watch.prior_stripe_price_id` so a relist restores it exactly

Guardrails: two consecutive affirmative sold-out readings, a reading no older than 3 days,
Stripe price ownership verified against `price_cents` and `metadata.sku` before archiving,
and a hard cap of 10 pulls per run. If more rows than that qualify, the run **aborts** —
that many at once means the page markup changed and the parser is wrong, not that the
catalog sold out. If the Supabase update fails after the Stripe archive, the price is
restored so the two systems cannot disagree.

Pulled rows leave Google Shopping only after `npx tsx scripts/build-merchant-feed.ts`
plus a commit and deploy, since Google reads the committed XML.

## Dashboard writes

`/parts-watch` (password-gated, noindexed) can perform three operations: **Pull off Buy Now**
on rows the sold-out queue shows as ready, **Relist** on rows in the Pulled section, and
**Apply** (cut or raise) on rows in Price problems. All call the shared functions in
`lib/pricing/magWatchOps.ts`, so the gate is identical whichever way the action is taken; the
only CLI-specific guardrail is the per-run cap, which the dashboard replaces with one row per
click (or up to 25 per click for a bulk Apply).

### Reprice gate

Price problems is a proposal list; nothing moves until Apply is clicked, and the click does
not send a price — the server recomputes `calculateSellPrice` from the stored vendor read.
`repriceEligibility` decides which of four states a row is in:

| State | Meaning | Button |
|---|---|---|
| `apply` | Vendor in stock or limited, read ≤ 3 days old, proposal differs by ≥ $1, and the gap is trustworthy | **Cut to $X** / **Raise to $X** |
| `hold` | Vendor sticker at or under our known cost (cost reset or different item), or an operator lock | none, reason shown |
| `verify` | No cost on file and we are > 1.5× the sticker, or the proposal is > 3× our price | none, reason shown |
| `skip` | Not Buy Now, out of scope, seat, skip-comps OEM, sold out (pull lane), LTL weight, stale read, no Stripe product, already at proposal | none |

With a cost on file the calculator's margin floor protects the cut, so larger gaps are
trusted. Without one, only modest gaps are — a $89 switch that Mag reads at $10 is almost
always a different item, and a $16 switch Mag reads at $539 is the same problem in the
other direction.

Operator locks: `parts.metadata.reprice_hold = { reason }` keeps a row in `hold` whatever
the vendor reads. Set on the live JCB joystick `332/X6237` (do not cut) and Bobcat
`7123864` (priced against the OEM shop, not Mag). `data/seats/skip-comps.json` OEMs are
refused too, so a click cannot undo a deliberate skip.

Apply creates a new Stripe price on the row's product, updates `price` /
`stripe_price_id`, archives the old price, and writes `last_comp_pricing` plus
`provisional_pricing: true` when no cost exists (cleared once a cost lands). If the row
update fails the new price is archived so `stripe_price_id` always points at an active
price. Repriced rows do not reach Shopping until the Merchant XML is rebuilt.

Every mutation request must pass three checks before touching Stripe or Supabase: a valid
gate cookie, a same-origin `Origin` header (a form post from another site is refused even
with our cookie attached), and the operation's eligibility re-evaluated server-side —
buttons are hints, never authority. Relist additionally requires the *"I confirmed vendor
stock"* checkbox, which is the stock confirm the process has always required; vendor
on-hand next to the row is a reference, not our stock flag.

Every successful write, from the dashboard or the CLI, lands a row in `parts_ops_audit`
(`source`, `action` pull/relist/reprice, `sku`, before/after of `sales_type` /
`is_in_stock` / `stripe_price_id` / `price` / `mag_watch`, the Stripe price created,
archived, or restored, and a note). The dashboard's *Recent actions* section reads it. The table is RLS-enabled with no
policies — service role only.

Because Google reads the committed Merchant XML, Buy Now flips made here do not reach
Shopping until the feed is rebuilt. `build-merchant-feed.ts` now writes
`public/feed/google-merchant.meta.json` with `built_at`; the dashboard counts audit rows
newer than that and shows *"N Buy Now changes since the feed was last built"*.

The gate is a shared password. That was fine for a read-only page; with writes behind it,
anyone holding the password can archive prices. Same-origin plus the audit trail plus
reversibility make that acceptable for a single operator. If a second person ever needs this
page, move it to Supabase auth with an admin role before handing out the URL.

## Metadata

Snapshots extend the existing `competitor_prices[]` entry — no new tables:

```json
{
  "source": "magnasource",
  "price": 340.83,
  "list_price": 675.02,
  "url": "https://www.magnasourceinc.com/itemdetail/JC333/D1629",
  "qty_on_hand": 21,
  "qty_is_floor": false,
  "availability": "in_stock",
  "weight_lb": 0.1477,
  "selling_unit": "EA",
  "supplier_confirmed_at": "9/16/2026 9:02:21 PM",
  "fetched_at": "2026-09-17T02:02:24.000Z"
}
```

A sibling `metadata.mag_watch` object holds job state only: `last_checked_at`,
`last_availability`, `sold_out_streak`, `miss_count`, and on a pull `pulled_at`,
`pull_reason`, `prior_stripe_price_id`, `prior_sales_type`.

## Hero images (measurement stage)

Catalog growth is blocked on product photos, not on price: at the time of writing only
~135 in-scope rows have a real photo; 667 show a brand logo and 816 nothing. Magnasource
exposes the product hero as `og:image` on the same page response the watch already reads,
so each read now records a hero fact on `mag_watch.hero` at zero extra vendor load:

```json
{ "checked_at": "…", "filename": "electronic-sensor-jc333d1629.jpg",
  "identity_ok": true, "placeholder_suspect": false }
```

`identity_ok` means the filename contains the Magnasource part id — the image equivalent
of the PN + brand gate. It exists because the related-items carousel on the same page
shows other brands' parts, and a naive "first product image" pick lands on those. The
signed `?key=` URL is never stored.

This stage **downloads nothing and never writes `image_url`**. It answers, per brand, how
many gap rows have a usable vendor hero — visible on `/parts-watch` under *Product photos*
and in each run's digest. Whether a review tray, storage, and approve/reject UI are worth
building is decided from that number. Seats, cushions and covers are excluded outright.

Decided direction for the next stage, once the numbers justify it:

- Raw bytes land in a **private** storage bucket, keyed by content hash. Nothing pending
  is publicly addressable.
- A deterministic rework (trim, square-pad on white, size cap, mild sharpen, strip EXIF,
  re-encode) runs automatically and sits next to the raw in the tray. Generative cleanup
  (watermark removal, background repair) is **not** automated in the scheduled job — it is
  an interactive step whose output re-enters the tray as another candidate.
- **Approve** copies the chosen file into the public `products` bucket and sets
  `parts.image_url` to that CDN URL. That is the whole meaning of approve: it does not
  change `sales_type`, does not create a Stripe price, does not touch stock. Buy Now still
  needs the convert step. Approved heroes do not go into git.
- Review state lives in a small table keyed by brand + OEM, not in `parts.metadata`, so a
  future list-intake row can use the same tray before a `parts` row exists.

## URL construction

`https://www.magnasourceinc.com/itemdetail/{PREFIX}{OEM}`, prefix from
`lib/parts/tvhOePrefixes.ts`, OEM passed through verbatim. **Separators matter**: JCB keeps
its slash (`JC333/D1629`) and Toyota its dashes (`TY16420-U1280-71`). A stripped id returns
**HTTP 200** with "Sorry, the requested item is no longer valid", so a 200 status is never
proof the item exists — the parser treats that string as the invalid signal and requires
both the echoed part number and brand to match before trusting any number.

Prefixes marked `verified: false` in that file have not been seen resolving on a real page.
Misses on those brands may be a wrong prefix rather than a dead part number; the digest
lists them separately.

## Never

Do not name the vendor or Magnasource in customer-facing copy. Do not run bulk cost
lookups in the vendor portal. Do not touch Stripe webhooks, `/api/checkout` freight math,
or anything in training/certification. Do not auto-reprice. Do not auto-publish a
quote-only stub. Do not commit secrets.
