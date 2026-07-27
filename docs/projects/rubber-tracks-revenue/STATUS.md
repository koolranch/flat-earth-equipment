# Rubber Tracks — Status

**Last updated:** 2026-07-27 (evening automation recheck)  
**Active phase:** Phase 1 — Measurement  
**Program commit:** branch `cursor/rubber-tracks-revenue-program-ad35`

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Docs + rank script + baseline; Monday automation live (this run) |
| 1 Measurement | 🔄 | Weekly rank snapshot running; GA4/purchase path still open |
| 2 Conversion | ⬜ | Hub/PDP UX, qty=2, free ship + 2yr warranty signals |
| 3 Model SERP wins | ⬜ | Correct PDP URLs + serial-prefix honesty + serial-lookup cross-links |
| 4 Expand | ⬜ | Intake publish + Merchant; paid ads deferred |

## Rank snapshot (Google US) — 2026-07-27 evening vs morning baseline

| Keyword | Prior (AM) | Today (PM) | Winning URL | Notes |
|---------|----------:|----------:|-------------|-------|
| `case tv450 tracks` | out | **#61** ↑ NEW | `/parts/case-tv450-rubber-track-450x86x55-block` | Best money rank; correct Case PDP; slug has `-block` tread suffix (SEO debt — do not 301 without approval) |
| `case tv370 tracks` | **#60** | **#69** ↓ | `/parts/case-tv370-rubber-track-450x86x55` | Still correct PDP; slipped 9 spots — protect |
| `skid steer rubber tracks` | out | out | — | Hub target; top = skidheaven.com |
| `compact track loader tracks` | out | out | — | Hub target; top = grizzlyrubbertracks.com |
| `bobcat rubber tracks` | out | out | — | Hub / Bobcat cluster; top = skidheaven.com |
| `jcb rubber tracks` | out | out | — | Hub target; top = greenshieldsjcb.com |
| `bobcat t650 tracks` | out | out | — | Priority model; top = mclarenindustries.com |
| `bobcat t770 tracks` | out | out | — | OEM SERP (shop.bobcat.com) |
| `cat 259d tracks` | out | out | — | top = skidsteers.com |
| `kubota svl75 tracks` | out | out | — | top = skidheaven.com |
| `john deere 333g tracks` | out | out | — | top = skidsteers.com |
| `takeuchi tl8 tracks` | out | out | — | top = skidheaven.com |

**Head terms:** none in top 100 — hub `/rubber-tracks` not winning any head/category SERP yet.  
**Model PDPs:** only Case TV450 (#61) and Case TV370 (#69); both land on Case track PDPs (not hub, not wrong category).  
**Wrong winning URLs:** none for ranked keywords.

**Summary:** 2/29 ranked · 0 top 10 · 0 top 30 · 0 API errors. Full rows: `scripts/seo/rank-snapshots/rubber-tracks/2026-07-27.json`.

**Wins:** `case tv450 tracks` entered top 100 at #61.  
**Losses:** `case tv370 tracks` #60 → #69.  
**Unchanged out:** remaining 27 money keywords still out of top 100.

Source: DataForSEO via `scripts/seo/rubber-track-rank-check.ts` (same-day evening recheck vs morning baseline).

## Live surfaces

| URL | Role |
|-----|------|
| `/rubber-tracks` | Category hub + model finder |
| `/parts/{brand}-{model}-rubber-track-{size}` | Per-track PDP (no `TSA/` PNs) |
| `/parts` → rubber-tracks CTA | Should deep-link hub (verify in Phase 2) |
| Brand `*-serial-number-lookup` | Fitment assist; two-way link target |

## Open blockers / needs from Christopher

1. Optional: confirm last 90 days rubber-track order revenue once measurement helper exists.  
2. Wholesale costs only ad hoc from normal POs — never bulk portal lookups.  
3. Approve before any production checkout / pricing / freight changes.  
4. Approve before any slug/canonical change on Case TV450 (`-block` suffix).

## Next action (exactly one)

**Confirm GA4 → Stripe purchase attribution for rubber-track SKUs** (`category_slug=rubber-tracks` / track price IDs) — additive only — so Case TV450 (#61) and Case TV370 (#69) can be judged on purchases, not vanity rank. Do not chase the 27 out-of-index model terms.

## Decision log

| Date | Decision |
|------|----------|
| 2026-07-27 | Formalize managed rubber-tracks revenue program (mirror charger-modules) |
| 2026-07-27 | Optimize for purchases + model/size intent; not vanity head-term traffic |
| 2026-07-27 | Price near comps (free freight + 2yr warranty); not strict 5%-under |
| 2026-07-27 | Weekly automation Mondays ~10:00 AM Eastern (stagger from charger) |
| 2026-07-27 | Baseline AM: only `case tv370 tracks` in top 100 (#60 on correct PDP) |
| 2026-07-27 | First automation recheck PM: TV450 NEW #61; TV370 slipped to #69; Phase 1 active |
