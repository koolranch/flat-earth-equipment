# Morning note — 2026-10-21

Titles, H1s, canonicals, and JSON-LD were not changed.

## What I picked

Customer pages were still stating prices and shipping promises that do not match the live listings.

## Ready to review

- JCB telehandler serial guide (`/insights/jcb-telehandler-serial-number-location-2`): the shop block now uses the live prices. Mirror $88, caliper $569, cushion $238, seat $1,469, cover $295, track rod $5,089, suspension seat $1,409 with free freight. The track rod is no longer marked free freight. The “30+ models” and “fast delivery” lines are gone. The catalog link is `/parts?brand=JCB`. Title unchanged.
- JCB cabin-filter guide: the track rod line was $5,975 with free freight. It is now $5,089, with freight calculated at checkout. The seat cover price of $295 matches the listing and was left as written. Title and H1 unchanged.
- Taylor Dunn 6220400 article (`/parts/taylor-dunn-6220400-controller`): that number is not in the catalog. The old copy claimed $913.78, a $1,243.14 list price, 48-hour shipping, and a vendor name. The page now says we do not list 6220400, links the Taylor Dunn parts we do list, and sends 6220400 to a quote. Title unchanged.
- Sevcon 631/61042 article (`/parts/sevcon-63161042-controller`): that number is not in the catalog. The old copy priced a different controller at $500 and described marketplace shipping. The page now says we do not list 631/61042 and points at the Sevcon part we do list, plus a quote. Title unchanged. The title still says “Fast Delivery” because the title was left as published.
- 300037 seal-kit article (`/parts/300037-seal-kit`): that number is not in the catalog. The old copy named a cylinder, a competitor price of $143.67, and same-day shipping. The page now says we do not list 300037 and sends it to a quote. Title unchanged.
- AL-10388 and LL-6018-16 articles: those numbers are not in the catalog. The old copy pointed at other sellers and, for LL-6018-16, a Pettibone 636 fit and a 3-inch rod. Both pages now say we do not list the number and send it to a quote. Titles unchanged.
- 20522262 article: the number is not in the catalog, and the public URL already returns 404 because the slug contains a colon. The file no longer says it is a genuine Volvo liner kit. The slug was not changed, so the address still 404s.
- Same-day, next-day, or overnight shipping closers were removed from the Hyster 50 fluid guide, both Jaltest guides, the mixed-fleet scanner guide, the JCB 3CX connector fix, the forklift maintenance checklist, the JCB Fastrac suspension guide, the JCB 535 hydraulic guide, the JCB Loadall cavitation guide, the JCB Service Master guide, the JCB immobilizer guide, the JCB quick-hitch guide, the Hyster ignition-switch guide, the Crown RR 5200 guide, the JCB parking-brake guide, the JCB throttle-motor guide, and the JCB powershift cooler guide. The powershift page also lost an unsourced “80%” and a “$500 fix.” Each parts closer now points at `/parts` and says freight is calculated at checkout. Titles unchanged.
- Yale MPB040 troubleshooting guide: removed the “on the shelf,” same-day, and “a grand” lines, and removed unsourced 60%, 25%, and 42% downtime figures. Title unchanged.

## Verified

Local pages returned 200. The old prices and shipping lines are gone. The replacement prices match the live product pages.

## Left alone

- The Oct 19 link fixes and the Tennant 379609 article. Those are already live in `f1978dbc`.
- `app/parts/attachments/forks/page.tsx`.
- Sitewide lines that still say same-day shipping: the homepage description in `app/layout.tsx`, the brands page description, the battery-chargers description, and `app/shipping-returns/page.tsx`. Those are policy and default meta copy, not a single product listing.
- Stopped at 4:50 AM Eastern. No further slice was started.
