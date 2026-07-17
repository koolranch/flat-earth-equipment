# Brushes & Brooms Intake

Source: vendor QRG `1903032` (Brushes & Brooms Quick Reference Guide).
Built by: `npx tsx scripts/brooms/build-brooms-intake.ts`

## Important

Primary keys in this guide are TotalSource house numbers (`SY11-*`, `SY21-*`), keyed by brand + model code — **not** OEM part numbers. Live catalog brooms often use OEM PNs; crosswalk before Buy Now.

## Customer display

| Vendor PN | Display |
|-----------|---------|
| SY11-2611 | 11-2611 |
| SY21-1004 | 21-1004 |

Keep full `vendor_pn` in metadata. Do not name TVH/TotalSource in customer copy.

## Phases

1. **Phase 1** — Tennant / Advance / Power Boss **main + side brooms**
2. **Phase 2** — same brands rotary brushes + pad drivers
3. **Phase 3** — American Lincoln / Factory Cat
4. **hold** — wafers, floor-pad multipacks

## Files

- `brooms-qrg-raw.txt` — PDF text extract
- `brooms-intake.csv` / `.json`
- `brooms-phases.json`
- `brooms-phase1-candidates.json`
- `brooms-phase1-net-new.json` (after `--dedupe`)

## Publish

```bash
npx tsx scripts/brooms/add-brooms-phase1.ts --dry-run
npx tsx scripts/brooms/add-brooms-phase1.ts
```

Phase 1 live as `quote_only` under category Brooms (`metadata.source = brooms_qrg_1903032`). Buy Now only after OEM crosswalk + trusted comps.

## Hub

- Public hub: `/brooms` (brand + model finder, FAQ, ItemList JSON-LD)
- Catalog quick path: “Sweeper Brooms” in `lib/parts/catalogQuery.ts`

## Comps / Buy Now blocker

QRG keys are house numbers (`SY11-*`), not OEM. Public search on `11-xxxx` does not yield usable comps. Need OEM crosswalk (portal / known OEM index) before batch comps and Buy Now.
