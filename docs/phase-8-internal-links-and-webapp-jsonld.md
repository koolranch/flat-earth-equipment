# Phase 8 — Internal Links + WebApplication JSON-LD

## What changed
- Auto-inserted contextual links to brand hubs on relevant parts/insights pages.
- Added WebApplication schema to /brand/{slug}/serial-lookup to clarify the tool to search engines.
- Small UX/tracking touch-ups.

## Verify
1) Run `pnpm codemod:brand-links` → review diff → commit.
2) Visit a few updated parts/insights pages and confirm the inline brand links look clean.
3) View-source on /brand/jlg/serial-lookup → WebApplication JSON-LD present.
4) Check Vercel Analytics for new events: serial_submit, serial_result, fault_result_click, fault_search_error.
