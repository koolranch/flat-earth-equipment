# Toyota Forklift Serial Number Lookup

This feature provides a high-converting landing page and database system for Toyota forklift serial number lookups.

## Features

- ✅ **Isolated Database Schema**: Uses `lookup.toyota_serial_lookup` table to avoid conflicts
- ✅ **Professional UI**: Modern, responsive design with SEO optimization
- ✅ **API Endpoints**: RESTful endpoints for lookup and model listing
- ✅ **Structured Data**: JSON-LD schema for better search visibility
- ✅ **Safe Database Operations**: Idempotent migrations and seeding

## Pages & Routes

- 🌐 `/toyota-forklift-serial-lookup` - Main lookup page
- 🔌 `/api/toyota-lookup` - POST endpoint for serial lookups
- 🔌 `/api/toyota-lookup/models` - GET endpoint for model list

## Database Setup

### Environment Variables Required

Create `.env.local` with:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Schema & Seeding

1. **Test the system**:
   ```bash
   node scripts/test-toyota-lookup.mjs
   ```

2. **Seed the data** (if needed):
   ```bash
   node scripts/seed-toyota-serial-lookup.mjs
   ```

## Usage Example

### API Request
```javascript
const response = await fetch('/api/toyota-lookup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    model: '7FGCU25', 
    serial: '60013' 
  })
});

const result = await response.json();
// { match: { estimatedYear: 1999, matchedBeginningSerial: "60013" } }
```

### Manual Database Query
```sql
-- View all data
SELECT model_code, year, beginning_serial 
FROM lookup.toyota_serial_lookup 
ORDER BY model_code, year;

-- Get models list
SELECT DISTINCT model_code 
FROM lookup.toyota_serial_lookup 
ORDER BY model_code;
```

## SEO Features

- **Title**: "Toyota Forklift Serial Number Lookup (Free Year Finder)"
- **Keywords**: toyota forklift serial number lookup, toyota forklift year by serial number
- **Structured Data**: WebApplication and FAQPage schemas
- **Open Graph**: Complete social media meta tags

## QA Checklist

- [ ] Visit `/toyota-forklift-serial-lookup`
- [ ] Test sample: model=7FGCU25, serial=60013 → Expect ~1999
- [ ] Try higher serial for same model → Verify year increments
- [ ] Test invalid inputs → Verify error handling
- [ ] Check mobile responsiveness
- [ ] Verify SEO meta tags in page source

## Rollback (Non-Destructive)

To remove this feature:

1. **Delete pages**:
   ```bash
   rm -rf app/toyota-forklift-serial-lookup
   rm -rf app/api/toyota-lookup
   ```

2. **Optional: Remove database** (if needed):
   ```sql
   DROP TABLE IF EXISTS lookup.toyota_serial_lookup;
   DROP SCHEMA IF EXISTS lookup CASCADE;
   ```

## Next Steps

- [ ] Expand CSV with more Toyota models (8F series, etc.)
- [ ] Add "I don't know my model" helper page
- [ ] Link results to Toyota parts categories
- [ ] Add analytics tracking for conversions
- [ ] Consider adding other brands (Nissan, Hyster, etc.)

## Support

For issues or questions about this feature, check:
- Supabase dashboard for database connectivity
- Browser console for API errors
- Next.js build logs for compilation issues
