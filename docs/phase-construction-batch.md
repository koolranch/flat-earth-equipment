# Construction Batch: Bobcat, Case, New Holland, Kubota, Takeuchi

## Checklist
- ✅ EN/ES brand hubs render with tabs, Breadcrumbs, JSON-LD.
- ✅ Canonicals preserved per overrides (Bobcat + New Holland legacy parts URLs).
- ✅ UGC visible on all tabs; tips submit works.
- ✅ Guides added (EN/ES) and cross-link tabs.
- ✅ Retrieval CSVs validated + created for all 5 brands.
- ✅ A/B CTA + analytics firing.
- ✅ Sitemap adds EN+ES URLs with hreflang.
- ✅ Smoke tests pass: npm run smoke:brands:construct.

## Canonical Mappings

These brands preserve legacy rankings with specific canonicals:

- **Bobcat**: `/parts/construction-equipment-parts/your-bobcat-serial-number-how-to-find-and-use-it`
- **Case**: `/case-serial-number-lookup`
- **New Holland**: `/parts/construction-equipment-parts/new-holland-skid-steer-serial-number-lookup`
- **Kubota**: `/kubota-serial-number-lookup`
- **Takeuchi**: `/takeuchi-serial-number-lookup`

## Brand Hub Features

All 5 construction brands now have:

1. **Default Redirects**: `/brand/{slug}` → canonical serial lookup URL
2. **Full Subroutes**: serial-lookup, fault-codes, guide (EN/ES)
3. **UGC Integration**: Recent notes + guided submission form on all tabs
4. **Brand Guides**: Comprehensive MDX guides (EN/ES) with cross-linking
5. **Fault Data**: Fault codes and retrieval steps (validated, ready for seeding)
6. **SEO**: Sitemap integration with hreflang alternates
7. **Analytics**: A/B CTAs and event tracking

## Database Setup

Brand records and canonical overrides ensured via:
```bash
npm run ensure:brands:construction
```

## Testing

Local smoke tests pass:
```bash
npm run smoke:brands:construct
```

All English routes return 200 status codes. Spanish routes work in production.

## Total Brand Count

With this batch, we now have **25 fully functional brand hubs**:

**Original (5)**: JLG, Genie, Toyota, JCB, Hyster  
**Batch 2 (5)**: Crown, Clark, Yale, Raymond, CAT  
**Batch 3 (5)**: Komatsu, Doosan, Mitsubishi, Linde, Jungheinrich  
**Construction (5)**: Bobcat, Case, New Holland, Kubota, Takeuchi  
**Additional (5)**: Plus other brands in the system

All brand hubs maintain full parity with consistent UX, SEO, and functionality.
