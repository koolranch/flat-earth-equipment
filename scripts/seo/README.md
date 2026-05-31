# SEO operational files

Files in this directory are kept under version control but are **not** served publicly.

## `disavow.txt`

Spam-backlink disavow list. **Do not** move this back into `/public/`; it was
served publicly before May 2026 and leaked operational information about which
referring domains we consider spammy. The only correct destination for this
file is Google Search Console:

1. Open https://search.google.com/search-console/disavow-links
2. Select the `flatearthequipment.com` property
3. Upload `scripts/seo/disavow.txt`

The file should be updated as new spam referrers are identified, then
re-uploaded. Vercel deploys ignore it.
