# Phase 7 — Indexable Brand Subroutes

## Verify
1) Open /brand/jlg/serial-lookup — page renders Serial tab and the canonical points to legacy if mapped.
2) Open /brand/jlg/fault-codes — Fault tab displays with correct canonical.
3) Open /brand/jlg/guide — Guide + FAQ + JSON-LD present.
4) View source — BreadcrumbList <script> is present.
5) After build, check sitemap.xml contains the three subroutes for the five brands.
6) GSC: Inspect a new subroute URL and confirm it is crawlable and indexable.
