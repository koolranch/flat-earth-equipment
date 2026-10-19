# Morning note — 2026-10-19

Titles, H1s, canonicals, and JSON-LD were not changed.

## What I picked

Customer pages were still linking to addresses that return 404. I pointed those links at pages that already return 200.

## Ready to review

- Rubber-track product pages: the “30-Day Returns” pill went to `/returns` (404). It now goes to `/policies/shipping-and-returns`. The 30-day wording matches that policy page. This edit is one href inside `app/parts/[slug]/ProductDetails.tsx`, which already had other uncommitted local edits.
- Contact page: “Request Service/Repair” went to `/service` (404). The button now says “Request a parts quote” and goes to `/quote`. The card around it still talks about a maintenance network.
- Toro Dingo fault guide: both “Dingo Serial Lookup” links went to `/toro-dingo-serial-lookup` (404). They now go to `/toro-serial-number-lookup`, which includes Compact Utility Loader (Dingo). The “Toro Resources” chip went to `/brand/toro` (404). It now goes to `/battery-chargers`.
- Genie serial lookup: the breadcrumb and the hub banner went to `/brand/genie`, which redirects to `/brand/genie/fault-codes` (404). They now go to `/parts?brand=Genie`. H1 stays “Genie Serial Number Lookup.”
- Genie scissor-code guide: “Genie Brand Hub” now goes to `/parts?brand=Genie`. Title unchanged.
- Case serial lookup: the hub banner went to `/brand/case-construction`, which redirects to a fault-code address that 404s. It now goes to `/parts?brand=Case`. H1 unchanged. A separate “Request Parts Quote” link still uses `/brand/case-construction/serial-lookup`, which returns 200.
- Forklift proximity sensors: the “Safety Equipment” breadcrumb went to `/parts/safety` (404). It is now plain text. Canonical stays `/parts/safety/forklift-proximity-sensors`.
- “How to get forklift certified”: the missing OSHA post link now goes to `/insights/forklift-certification-requirements`.
- Lithium charger guide: removed the related link to a battery-types article that does not exist. The other related guides stay.
- JCB cabin-filter guide: the sales lines no longer say genuine, OEM, or complete inventory. They go to `/parts?brand=JCB`. Title and H1 unchanged.
- Forklift safety insight: the “complete selection” and same-day-shipping lines now say the sensor page lists what we carry. The quote link goes to `/quote`. Title and H1 unchanged.
- Forklift recertification page: “Texas Forklift Certification” went to `/safety/forklift/texas` (404). It now goes to `/safety/forklift/tx`. The same href was corrected on the Spanish certification page, which already 301s to `/es/safety` and is not what customers see.
- Proximity-sensor page: the certification card said “Just $59.” It now says “$49 at the final exam.” Title unchanged.
- Module quiz pages (`/quiz/[slug]`): production returned 500 because the server page passed a function into the client quiz. That callback only logged to the console. It is removed. Local `/quiz/pre-operation-inspection` then returned 200.

## Verified

Local pages returned 200 with the same titles and H1s. The old 404 hrefs are gone from those pages. The replacement addresses return 200 on the live site.

## Left alone

- `/checkout` and `/training/claim` on the training hub. Those are checkout and claim flows.
- Training PDFs `/resources/data-plate-guide.pdf` and `/resources/preop-checklist.pdf`. There is no replacement file.
- `app/parts/attachments/forks/page.tsx` still links to `/parts/forklift-parts`, and that URL redirects to `/forks`.
- Tennant 379609 insight: the old copy claimed $2,229.37, same-day shipping, a 6-month warranty, genuine OEM, and model fitment we do not have. It now points at `/parts/tennant-379609-hydraulic-motor`, which is in stock at $1,739 with a 1-year warranty. Title unchanged. The URL stays `/parts/tennant-parts-catalog-highlighting-the-379609-hydraulic-motor`.
- `app/parts/[slug]/ProductDetails.tsx` also had an uncommitted tread-row change. That change stays out of this commit. The commit includes only the returns-pill href.
