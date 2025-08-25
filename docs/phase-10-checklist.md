# Phase 10 — Checklist

## Fault Codes
- Create CSVs in data/faults for target brands.
- Run `pnpm seed:faults:validate` (must report 0 errors).
- Run `pnpm seed:faults --brand=<slug>` to write.

## Spanish (/es)
- Run `pnpm scaffold:es` then translate MDX (or run `pnpm translate:es`).
- Verify /es/brand/{slug}/{serial-lookup|fault-codes|guide} render and show hreflang alternates.
- Rebuild sitemap: `pnpm build && pnpm postbuild`.

## A/B Test
- Confirm variant cookie and events: cta_variant_view, cta_click.
- Sanity-check mobile layouts for each variant.
