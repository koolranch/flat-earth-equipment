# Morning note — 2026-10-10

Titles, H1s, canonicals, and JSON-LD were not changed.

## What I picked

Serial pages were sending shoppers to URLs that return 404, or to a dealer, instead of parts we already list.

## Ready to review

- Gehl serial lookup: after the plate notes, “Request a Gehl parts quote.” A successful decode includes the serial in the quote link. There are no Gehl parts in the catalog, so the page does not pretend there is a list. H1 stays “Gehl Serial Number Lookup.”
- New Holland skid-steer guide: the dealer / “New Holland parts lookup system” lines now go to our lookup, a quote, and `/parts?brand=New%20Holland`. The year bands are labeled as orientation, not a parts match. Title and H1 unchanged.
- New Holland lookup: “Find Parts for This Model” no longer goes to `/parts/construction-equipment-parts` (404). It requests a quote with the serial. The track roller `87535297` appears only when the model is C227, C232, C238, L225, L230, or TV380.
- Lull lookup: the Gehl link pointed at `/gehl-serial-number-lookup` (404). It now points at the real Gehl page. That link is inside a successful decode.
- Toro and XCMG result cards: Toro goes to `/parts?brand=Toro`. XCMG goes to a quote, because there are no XCMG parts listed.
- Hyster and Raymond: both “parts” cards and the post-decode buttons went to `/parts/forklift-parts` (404). They now go to `/parts?brand=Hyster` and `/parts?brand=Raymond`.
- Nissan K21 engine page: the breadcrumb and parts card went to `/parts/forklift-parts` (404). They now go to `/parts`. The rental card pointed at `/rental/forklifts`, which 404s, and there is no forklift rental index, so that card is gone. Title unchanged. The old `/parts/attachments/forks` URL redirects to `/forks`, so that page was left as it is.
- Toyota and Yale related cards no longer say “complete inventory.” They say the listings are not a fit for every truck. The links stay `/parts?brand=toyota` and `/parts?brand=yale`.
- New Holland guide and lookup: the remaining “contact your dealer” lines now tell the reader to use the plate year or request a quote. Titles and H1s unchanged.
- Footer “Toyota” links pointed at `/toyota-forklift-serial-number-lookup` (404). They now point at `/toyota-forklift-serial-lookup`, including JCB and Takeuchi.
- Doosan, Mitsubishi, UniCarriers, JLG, and Genie parts cards no longer say “Genuine and aftermarket parts.”
- Genie serial lookup: the fault-code card pointed at `/brand/genie/fault-codes` (404). It now points at `/parts/aerial-equipment/genie-scissor-lift-error-codes` and is labeled as GS-series scissor codes. That link is inside a successful decode.

## Verified

- Gehl quote link landed on `/quote` with equipment Gehl and the notes field filled. I did not submit the form.
- After a Gehl decode of RT210 / RT210123, the button href was `/quote?equipment=Gehl+RT210&notes=Serial%3A+RT210123`.
- New Holland guide and lookup cards landed on `/parts?brand=New%20Holland`. H1s unchanged.
- Hyster card landed on `/parts?brand=Hyster`. H1 unchanged.
- Local pages for the edited URLs returned 200.
- After a server restart, the K21 page returned 200, kept its title, and no longer contained `/rental/forklifts`.
- Toyota and Yale HTML no longer contain “complete inventory.” New Holland HTML no longer contains the dealer sendaway lines.
- The compiled JLG page uses `/toyota-forklift-serial-lookup`. `/brand/genie/fault-codes` returns 404. The scissor-code page returns 200.
- Bobcat, JCB, Case, and Takeuchi lookups now go to `/parts?brand=Bobcat`, `/parts?brand=JCB`, `/parts?brand=Case`, and `/parts?brand=Takeuchi`. The Bobcat how-to breadcrumb does the same.
- Verified in the browser: the Bobcat “parts in stock” card and the how-to breadcrumb both land on the Bobcat catalog. Brand filters for JCB, Case, and Takeuchi return 200.
