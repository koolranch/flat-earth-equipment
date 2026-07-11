# JCB Fault Codes Hub — Soft-Sell Design

**Date:** 2026-07-10  
**Goal:** Make `/brand/jcb/fault-codes` diagnostically useful and crawlable, then soft-sell live JCB catalog parts.

## Decisions
- Approach: JCB-first content pack on the shared hub template (not full multi-brand overhaul).
- Merchandising: Soft sell (option A) — diagnose first, then category “Likely parts” strips + browse CTA.
- Do not change: Stripe checkout, training/cert flows, serial-lookup pages, other brand hubs beyond shared API fix.

## Page structure (EN hub)
1. H1 + diagnostic intro + disclaimer  
2. Working search (fixed API → `public.svc_fault_codes`) with JCB placeholders  
3. SSR common codes table (~20 high-intent codes)  
4. How to pull codes (retrieval steps)  
5. Soft-sell likely parts by category (Filters, Fuel, Sensors, Engine) from live catalog  
6. Related guides (Service Master, P0087, serial lookup)  
7. Fault-focused FAQs (`jcb-faults.mdx`, not serial FAQs)  
8. Community tips + parts lead form (lower)

## Data
- Fix API table refs: `svc_fault_codes` / `svc_code_retrieval` (public), not empty `svc.*` schema.
- Expand `data/faults/jcb.csv` and re-seed public table.
- Common codes also live in `lib/faults/jcbCommonCodes.ts` for SSR HTML independent of client search.

## Parts rules
- Prefer priced SKUs (`price > 0`); still link $0/quote stubs if needed for coverage.
- Category cards link into catalog filters / product pages.
- No hard claim that a part “fixes” a code — “often checked first” framing.
- Keep existing parts lead form.

## Success
- Search returns JCB codes (not empty DB message).
- View-source / SSR HTML contains common code table.
- Visible path from diagnosis → JCB catalog parts.
