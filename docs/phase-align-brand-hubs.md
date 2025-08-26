# Align Brand Hubs — Checklist

- Default /brand/[slug] redirects to /serial-lookup.
- Tab pills are <Link> elements with aria-current on active tab.
- Request Parts Help tab routes to #parts-request anchor and scrolls.
- SubmissionForm + CommunityNotes only on Fault Codes and Guide tabs (feature-flagged by NEXT_PUBLIC_FEATURE_SVC_SUBMISSIONS).
- Spanish routes mirror tabs and gating.
- JSON-LD and canonicals untouched.
- Run: npm run smoke:brands (expect all 2xx/3xx).
