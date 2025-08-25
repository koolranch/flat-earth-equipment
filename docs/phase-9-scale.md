# Phase 9 — Scale Brand Hubs

## Steps
1) Run SQL: Open docs/phase-9-brands.sql in Supabase and execute (UPSERT).
2) Run scaffolder: `pnpm scaffold:brands` (creates missing MDX).
3) Commit + deploy.
4) Rebuild sitemap: `pnpm build && pnpm postbuild`.

## Verify
- Visit /brand/{yale|crown|clark|cat|komatsu|mitsubishi|doosan|linde|jungheinrich|unicarriers|raymond|bobcat}/serial-lookup (renders Serial tab).
- Open the Guide tab and confirm MDX content renders.
- Source: Breadcrumb JSON-LD + WebApplication JSON-LD present on serial-lookup subroutes.
- GSC: Inspect a couple of new subroutes; confirm indexable & in sitemap.
