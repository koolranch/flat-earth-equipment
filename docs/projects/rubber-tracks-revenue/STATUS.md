# Rubber Tracks — Status

**Last updated:** 2026-07-27  
**Active phase:** Phase 0 — Foundation  
**Program commit:** see latest `main` after Phase 0 land

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ code | Docs + rank script + baseline snapshot; weekly automation draft awaiting approval |
| 1 Measurement | ⬜ | GA4/purchase path + automation deltas |
| 2 Conversion | ⬜ | Hub/PDP UX, qty=2, free ship + 2yr warranty signals |
| 3 Model SERP wins | ⬜ | Correct PDP URLs + serial-prefix honesty + serial-lookup cross-links |
| 4 Expand | ⬜ | Intake publish + Merchant; paid ads deferred |

## Rank snapshot (Google US) — 2026-07-27 baseline

| Keyword | Jul 27 | Winning URL | Top competitor | Notes |
|---------|-------:|-------------|----------------|-------|
| `case tv370 tracks` | **#60** | `/parts/case-tv370-rubber-track-450x86x55` | skidsteers.com | Sole money keyword in top 100 — protect + push |
| `skid steer rubber tracks` | out | — | skidheaven.com | Hub target |
| `compact track loader tracks` | out | — | grizzlyrubbertracks.com | Hub target |
| `bobcat rubber tracks` | out | — | skidheaven.com | Hub / Bobcat cluster |
| `bobcat t650 tracks` | out | — | mclarenindustries.com | Priority model |
| `bobcat t770 tracks` | out | — | shop.bobcat.com | OEM SERP |
| `cat 259d tracks` | out | — | skidsteers.com | |
| `kubota svl75 tracks` | out | — | skidheaven.com | |
| `john deere 333g tracks` | out | — | skidsteers.com | |
| `jcb rubber tracks` | out | — | greenshieldsjcb.com | |
| `takeuchi tl8 tracks` | out | — | skidheaven.com | |

**Summary:** 1/29 ranked · 0 top 10 · 0 top 30 · 0 API errors. Full rows: `scripts/seo/rank-snapshots/rubber-tracks/2026-07-27.json`.

Source: DataForSEO via `scripts/seo/rubber-track-rank-check.ts`.

## Live surfaces

| URL | Role |
|-----|------|
| `/rubber-tracks` | Category hub + model finder |
| `/parts/{brand}-{model}-rubber-track-{size}` | Per-track PDP (no `TSA/` PNs) |
| `/parts` → rubber-tracks CTA | Should deep-link hub (verify in Phase 2) |
| Brand `*-serial-number-lookup` | Fitment assist; two-way link target |

## Open blockers / needs from Christopher

1. **Approve** weekly Cursor Automation draft (Mondays ~10:00 AM Eastern, staggered from charger).  
2. Optional: confirm last 90 days rubber-track order revenue once measurement helper exists.  
3. Wholesale costs only ad hoc from normal POs — never bulk portal lookups.  
4. Approve before any production checkout / pricing / freight changes.

## Next action

1. Enable Monday automation after draft approval.  
2. After automation is live, pick **one** Phase 2/3 move: strengthen Case TV370 PDP + hub internal links (only ranked money keyword).  
3. Do not chase all 28 out-of-index model terms at once.

## Decision log

| Date | Decision |
|------|----------|
| 2026-07-27 | Formalize managed rubber-tracks revenue program (mirror charger-modules) |
| 2026-07-27 | Optimize for purchases + model/size intent; not vanity head-term traffic |
| 2026-07-27 | Price near comps (free freight + 2yr warranty); not strict 5%-under |
| 2026-07-27 | Weekly automation Mondays ~10:00 AM Eastern (stagger from charger) |
| 2026-07-27 | Baseline: only `case tv370 tracks` in top 100 (#60 on correct PDP) |
