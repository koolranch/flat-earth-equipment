# Rubber Tracks — Status

**Last updated:** 2026-08-03  
**Active phase:** Phase 1 (measurement)  
**Program commit:** Weekly rank snapshot 2026-08-03  
**Organic track sales baseline:** $0 known (no recent track Stripe sales)  
**Weekly automation:** ran 2026-08-03 (Monday) — DataForSEO 0 errors  
**Merchant:** Shopping accepted as co-equal organic channel for 1/day math (paid Search still deferred)

## Phase checklist

| Phase | Status | Notes |
|-------|--------|-------|
| 0 Foundation | ✅ | Docs + rank script + baseline; Monday automation confirmed |
| 1 Measurement | 🟡 | Weekly ranks live; order attribution still unverified ($0 known sales) |
| 2 Conversion | ⬜ | Hub/PDP UX largely shipped; sidebar→hub polish optional |
| 3 Model SERP wins | ⬜ | Prefer Bobcat T650/T770 over Case TV370 demand — but Case is what ranks today |
| 4 Expand | 🟡 | Merchant: 65 tracks; feed fix shipped (unique RT-* MPN + aftermarket disclosure) — awaiting Center review clear |

## Rank snapshot (Google US) — 2026-08-03 vs 2026-07-27 baseline

| Keyword | Jul 27 | Aug 3 | Δ | Winning URL | Notes |
|---------|-------:|------:|---|-------------|-------|
| `case tv370 tracks` | **#60** | **#59** | ↑1 | `/parts/case-tv370-rubber-track-450x86x55` | **Win** — sole prior money KW; correct PDP; protect |
| `case tv450 tracks` | out | **#59** | **NEW** | `/parts/case-tv450-rubber-track-450x86x55-block` | **Win** — correct model PDP but slug has `-block` tread suffix (SEO debt; no redirect without approve) |
| `skid steer rubber tracks` | out | out | — | — | Hub target; top: skidheaven.com |
| `compact track loader tracks` | out | out | — | — | Hub target; top: grizzlyrubbertracks.com |
| `bobcat rubber tracks` | out | out | — | — | Hub / Bobcat cluster; top: skidheaven.com |
| `bobcat t650 tracks` | out | out | — | — | Priority model; top: mclarenindustries.com |
| `bobcat t770 tracks` | out | out | — | — | OEM SERP; top: shop.bobcat.com |
| `cat 259d tracks` | out | out | — | — | top: unitedskidtracks.com |
| `kubota svl75 tracks` | out | out | — | — | top: skidheaven.com |
| `john deere 333g tracks` | out | out | — | — | top: skidsteers.com |
| `jcb rubber tracks` | out | out | — | — | top: greenshieldsjcb.com |
| `takeuchi tl8 tracks` | out | out | — | — | top: skidheaven.com |

**Full 29-keyword rows:** `scripts/seo/rank-snapshots/rubber-tracks/2026-08-03.json`.

### Highlights

| Signal | Detail |
|--------|--------|
| Wins | TV370 #60→#59; TV450 NEW #59 |
| Losses | None (no KW fell out of top 100) |
| Wrong winning URLs | None on-domain — both ranked KWs land on Case model PDPs (not hub, not non-track) |
| Hub vs PDP | Head/category terms still **out**; **0** hub wins. Only Case model PDPs rank |
| Summary | **2/29** ranked · 0 top 10 · 0 top 30 · **0 API errors** |

Source: DataForSEO via `scripts/seo/rubber-track-rank-check.ts`.

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
3. Approve before any URL/slug change on Case TV450 (`-block` suffix debt).  

## Next action

**Phase 1 — one action:** Confirm GA4 → Stripe purchase attribution for the two ranked Case track SKUs (TV370 `450x86x55` + TV450 `450x86x55-block` price IDs / `category_slug=rubber-tracks`) so organic sessions on those PDPs can be tied to checkout starts and orders. Do not expand keyword chase while 27/29 remain out of index.

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
| 2026-08-03 | Weekly ranks: 2/29 — TV370 #59 (↑), TV450 NEW #59; head terms still out; Monday automation confirmed |
