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

# Pull identity-ok vendor heroes into the private image tray (never sets image_url).
npx tsx scripts/pricing/mag-hero-intake.ts --min-sticker=150 --limit=40
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

`/parts-watch` (password-gated, noindexed) can perform Pull, Relist, Reprice, Publish, and
the image-tray writes (upload cleaned / approve / reject). Pull, Relist, Reprice, and
Publish call `lib/pricing/magWatchOps.ts`; the tray calls `lib/pricing/heroTray.ts`. The
gate is identical whichever way the action is taken; the only CLI-specific guardrail is the
per-run pull cap, which the dashboard replaces with one row per click (or up to 25 per click
for a bulk Apply).

### Reprice gate

Price problems is a proposal list; nothing moves until Apply is clicked, and the click does
not send a price — the server recomputes `calculateSellPrice` from the stored vendor read.
`repriceEligibility` decides which of four states a row is in:

| State | Meaning | Button |
|---|---|---|
| `apply` | Vendor in stock or limited, read ≤ 3 days old, proposal differs by ≥ $1, and the gap is trustworthy | **Cut to $X** / **Raise to $X** |
| `hold` | Vendor sticker at or under our known cost (cost reset or different item), or an operator lock | none, reason shown |
| `verify` | No cost on file and we are > 1.5× the sticker, or the proposal is > 3× our price | none, reason shown |
| `skip` | Not Buy Now, out of scope, skip-comps OEM, sold out (pull lane), LTL weight, stale read, no Stripe product, already at proposal | none |

With a cost on file the calculator's margin floor protects the cut, so larger gaps are
trusted. Without one, only modest gaps are — a $89 switch that Mag reads at $10 is almost
always a different item, and a $16 switch Mag reads at $539 is the same problem in the
other direction.

Seats, cushions, and covers use the same gate as any other TVH-network part. The
`data/seats/skip-comps.json` OEM list still refuses the thin-margin rows we already
decided not to sell (Bobcat `7505149` / `6669135` / `7338638`).

Operator locks: `parts.metadata.reprice_hold = { reason }` keeps a row in `hold` whatever
the vendor reads. Set on the live JCB joystick `332/X6237` (do not cut) and Bobcat
`7123864` (priced against the OEM shop, not Mag).

Apply creates a new Stripe price on the row's product, updates `price` /
`stripe_price_id`, archives the old price, and writes `last_comp_pricing` plus
`provisional_pricing: true` when no cost exists (cleared once a cost lands). If the row
update fails the new price is archived so `stripe_price_id` always points at an active
price. Repriced rows do not reach Shopping until the Merchant XML is rebuilt.

### Publish gate

The *"quote-only stubs reading in stock"* section is a Publish panel. `publishEligibility`
arms the button only when every one of these holds:

- the row is quote-only and in watch scope, not on `skip-comps.json`, and not a pulled row
  (pulled rows keep their archived Stripe price and go back through Relist);
- the latest vendor read is `in_stock` — `limited` is not enough basis for a *new* Buy Now —
  no older than 3 days, with a sticker, under the 75 lb LTL line;
- a known cost, if any, sits under the sticker;
- **the row already carries a real product photo** (`currentHeroKind === 'real'`). Brand
  logos, placeholders, and empty `image_url` all read as no photo. Vendor og:image heroes are
  watermarked and never go live raw — rows missing a photo queue up with a *"vendor image
  available to rework"* flag when the Mag page exposed an identity-passing hero, and get a
  cleaned watermark-free hero via the Image tray before the button appears.

Publish recomputes `calculateSellPrice` (~5% under the sticker) server-side, creates the
Stripe product when the stub has none, creates the price, flips `sales_type: 'direct'` /
`is_in_stock: true`, marks pricing provisional until the first PO, and audits as `publish`.
One SKU per click — no bulk publish. Standard freight bands apply at checkout by category, so
no per-SKU freight work is needed unless the SKU warrants `metadata.freight_cents`.

Every mutation request must pass three checks before touching Stripe or Supabase: a valid
gate cookie, a same-origin `Origin` header (a form post from another site is refused even
with our cookie attached), and the operation's eligibility re-evaluated server-side —
buttons are hints, never authority. Relist additionally requires the *"I confirmed vendor
stock"* checkbox, which is the stock confirm the process has always required; vendor
on-hand next to the row is a reference, not our stock flag.

Every successful write, from the dashboard or the CLI, lands a row in `parts_ops_audit`
(`source`, `action` pull/relist/reprice/publish/hero_approve/hero_reject, `sku`, before/after
of the columns that changed, the Stripe price created, archived, or restored when relevant,
and a note). The dashboard's *Recent actions* section reads it. The table is RLS-enabled
with no policies — service role only.

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

## Hero images (review tray)

Catalog growth is blocked on product photos, not on price. Magnasource exposes the product
hero as `og:image` on the same page response the watch already reads, so each read records
a hero fact on `mag_watch.hero` (filename + identity/placeholder gates — the signed `?key=`
URL is never stored).

Identity-ok heroes for photo-gap rows are downloaded into a **private** `part-hero-pending`
bucket by `scripts/pricing/mag-hero-intake.ts` and listed on `/parts-watch` under *Image
tray*. Seats, cushions, and covers are refused at every gate.

```bash
npx tsx scripts/pricing/mag-hero-intake.ts --min-sticker=150 --limit=40
```

The operator strips the watermark, uploads the cleaned file on the tray card, then
**Approve**. Approve copies the cleaned file into the public `part-heroes` bucket and sets
`parts.image_url` to that CDN URL. That is the whole meaning of approve: it does not change
`sales_type`, does not create a Stripe price, does not touch stock. Publish still needs its
own click. Raw vendor photos never go live. Approved heroes do not go into git.

Review state lives in `part_image_reviews` (service role only), not in `parts.metadata`.

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
