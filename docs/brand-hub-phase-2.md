# Brand Hub — Phase 2 QA

## Overview
Phase 2 adds UX/SEO polish and lead flow hardening to the brand hub system. This includes banner links from serial tools, analytics events, spam protection, SendGrid notifications, and seed scaffolding for fault code data.

## Features Added

### 🔗 BrandHubBanner Component
- **Location**: `components/brand/BrandHubBanner.tsx`
- **Purpose**: Drives traffic from dedicated serial lookup pages to unified brand hubs
- **Injected on**: JLG, Toyota, JCB, Hyster serial number lookup pages
- **Analytics**: Tracks `brand_hub_banner_click` events with brand slug

### 📊 Analytics Events (Vercel Analytics)
- **Tab Views**: `brand_tab_view` - fired when users switch between serial/fault-codes/parts tabs
- **Parts Submissions**: `parts_lead_submit` - tracks successful parts request submissions with metadata
- **Banner Clicks**: `brand_hub_banner_click` - measures cross-page navigation effectiveness

### 🛡️ Spam Protection
- **Honeypot Field**: Hidden `hp` field catches bots
- **Dwell Time**: 3-second minimum form interaction time
- **Silent Acceptance**: Bad submissions return success but don't save data

### 📧 SendGrid Integration
- **Admin Notifications**: New parts leads sent to `LEADS_TO_EMAIL`
- **Customer Acknowledgments**: Auto-reply confirming receipt
- **Fault-Tolerant**: Email failures don't break form submission

### 🗂️ Fault Code Scaffolding
- **5 Brands**: JLG, Genie, Toyota, JCB, Hyster
- **Minimal Data**: 3 fault codes per brand (expandable)
- **CSV Format**: Easy to update and extend
- **Seed Script**: `npm run seed:faults`

---

## Smoke Tests

### ✅ Brand Hub Banner Links
1. **Navigate to serial lookup pages:**
   - `/jlg-serial-number-lookup`
   - `/toyota-forklift-serial-lookup`
   - `/jcb-serial-number-lookup`
   - `/hyster-serial-number-lookup`

2. **Verify banner appears:**
   - Banner shows below H1 with brand-specific text
   - "Open [Brand] Hub" button links to `/brand/{slug}?tab=serial`
   - Click tracks `brand_hub_banner_click` event

### ✅ Brand Hub Navigation
1. **Visit `/brands`** - shows brand cards
2. **Click brand cards** - navigates to `/brand/{slug}`
3. **Verify tabs work:**
   - Serial Lookup (links to existing tools)
   - Fault Codes (when `has_fault_codes` is true)
   - Parts Request (always available)

### ✅ Analytics Tracking
1. **Tab switching** fires `brand_tab_view` events
2. **Parts form submission** fires `parts_lead_submit` events
3. **Banner clicks** fire `brand_hub_banner_click` events
4. **Check Vercel Dashboard** for event data

### ✅ Parts Lead Form Protection
1. **Normal submission:**
   - Fill form legitimately (wait 3+ seconds)
   - Submit successfully
   - Receives confirmation message

2. **Honeypot test:**
   - Fill hidden `hp` field
   - Submission appears to succeed (but data not saved)

3. **Speed test:**
   - Submit form immediately (< 3 seconds)
   - Appears to succeed (but data not saved)

4. **Database check:**
   - Only legitimate submissions appear in `parts_leads` table
   - Spam attempts silently filtered

### ✅ SendGrid Email Flow
1. **Environment Variables:**
   ```bash
   SENDGRID_API_KEY=your_sendgrid_key
   LEADS_TO_EMAIL=sales@flatearthequipment.com
   LEADS_FROM_EMAIL=hello@flatearthequipment.com
   ```

2. **Submit parts request:**
   - Admin receives notification email
   - Customer receives acknowledgment email
   - Form shows success message

3. **Email failure handling:**
   - Form submission succeeds even if SendGrid fails
   - Error logged but user sees success

### ✅ Fault Code Seeding
1. **Run seed command:**
   ```bash
   npm run seed:faults
   ```

2. **Verify data:**
   - 15 total fault codes inserted (3 per brand)
   - Brands: JLG, Genie, Toyota, JCB, Hyster
   - Data in `fault_codes` table

3. **Expandable:**
   - Add more rows to CSV files
   - Re-run seed script to update

---

## Environment Variables Required

```bash
# SendGrid (for email notifications)
SENDGRID_API_KEY=your_sendgrid_api_key_here
LEADS_TO_EMAIL=sales@flatearthequipment.com
LEADS_FROM_EMAIL=hello@flatearthequipment.com

# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Performance Impact

### 🚀 Minimal Overhead
- **BrandHubBanner**: <1KB component, cached
- **Analytics**: Lightweight Vercel Analytics events
- **Spam Protection**: Client-side validation (no extra API calls)
- **SendGrid**: Non-blocking email sending

### 📦 Bundle Size
- **@vercel/analytics**: Already included
- **Honeypot/Dwell-time**: No additional dependencies
- **CSV Parsing**: Dev-only dependency for seeding

---

## Troubleshooting

### 🐛 Banner Not Appearing
- Check import path: `import BrandHubBanner from '@/components/brand/BrandHubBanner'`
- Verify placement after H1 element
- Check brand slug matches `/brand/{slug}` route

### 📊 Analytics Not Tracking
- Verify Vercel Analytics is configured in `app/layout.tsx`
- Check browser console for errors
- Confirm events in Vercel dashboard (may take a few minutes)

### 📧 SendGrid Not Sending
- Verify `SENDGRID_API_KEY` is set
- Check SendGrid API key permissions
- Review server logs for email errors (non-fatal)

### 🗂️ Seed Script Failing
- Ensure TypeScript and dependencies installed
- Check Supabase connection credentials
- Verify `fault_codes` table exists in database

---

## Data Expansion Guide

### 📈 Adding More Fault Codes
1. **Edit CSV files** in `data/seed/fault-codes/`
2. **Add new brands** by creating new CSV files
3. **Update seed script** to include new brands
4. **Re-run**: `npm run seed:faults`

### 🎯 CSV Format
```csv
brand,model_pattern,code,title,meaning,severity,likely_causes,checks,fixes,retrieval,provenance
toyota,8FG%,E001,Example Fault,Description,fault,"cause1;cause2","check1;check2","fix1;fix2","How to retrieve","Source info"
```

### 📋 Field Descriptions
- **brand**: Brand slug (matches `/brand/{slug}`)
- **model_pattern**: SQL LIKE pattern (optional)
- **code**: Fault/error code
- **title**: Short fault name
- **meaning**: What the fault indicates
- **severity**: fault, warn, stop, info
- **likely_causes**: Semicolon-separated list
- **checks**: Diagnostic steps
- **fixes**: Resolution steps
- **retrieval**: How to access codes on the machine
- **provenance**: Data source attribution

---

## Next Steps

1. **Execute SQL schema** from Phase 1 (`docs/brand-hub-sql.sql`)
2. **Configure SendGrid** with environment variables
3. **Run fault code seeding**: `npm run seed:faults`
4. **Monitor analytics** in Vercel dashboard
5. **Expand fault code data** as needed

**Phase 2 is complete and ready for production! 🎉**
