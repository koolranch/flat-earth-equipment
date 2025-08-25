# Phase 5 — Brand Guides & Internal Links

## What we added
- MDX guides per brand in content/brand-guides/*.mdx
- BrandGuideBlock rendered on /brand/[slug]
- Optional InlineBrandCTA for contextual links
- Helper script to find high-signal internal-link targets

## Verify
1) /brand/jlg shows a "Service & Serial Number Guide" section with MDX content.
2) Lighthouse on a brand hub still passes core checks.
3) Optional: add InlineBrandCTA on a couple of relevant pages and confirm UX is not cluttered.
4) Run `pnpm find:brand-links` to get a placement report.
