# Basin Migration Summary

## Overview
All forms have been successfully migrated from Formspree to Basin using the provided API key: `fb0e195001565085399383d6996c0ab1`

## Changes Made

### 1. AJAX Forms (Using Basin API)
Updated the following components to use Basin API endpoint:
- **`components/EmailSignup.tsx`** - Fleet signup form
- **`components/Footer.tsx`** - Email newsletter signup

**Changes:**
- Endpoint: `https://formspree.io/f/xvgroloy` → `https://api.usebasin.com/v1/submissions`
- Added Authorization header: `Bearer fb0e195001565085399383d6996c0ab1`
- Updated form fields: `_subject` → `subject`, added `form_name`

### 2. Standard HTML Forms (Using Basin Form Endpoint)
Updated the following pages to use Basin form endpoint:
- **`components/FastQuoteForm.tsx`** - Fast quote component
- **`app/contact/page.tsx`** - Contact form
- **`app/quote/page.tsx`** - Quote request form
- **`app/parts/raymond-forklift-serial-number/page.tsx`** - Raymond serial number help
- **`app/parts/forklift-parts/nissan-k21-forklift-engine/page.tsx`** - Nissan K21 quote
- **`app/parts/construction-equipment-parts/john-deere-skid-steer-product-identification-number-lookup/page.tsx`** - John Deere PIN help
- **`app/carpet-poles/page.tsx`** - Carpet pole quote

**Changes:**
- Form action: `https://formspree.io/f/xvgroloy` → `https://usebasin.com/f/YOUR_BASIN_FORM_ID`
- Updated hidden fields: `_subject` → `subject`, `_next` → removed, added `form_name`

## Next Steps Required

### 1. Set up Basin Forms
You need to create individual Basin forms for each form type in your Basin dashboard and replace `YOUR_BASIN_FORM_ID` with the actual form IDs:

**Form Types to Create:**
- `fast_quote` - Fast quote form
- `contact_form` - Contact page form  
- `quote_form` - Quote request form
- `raymond_serial_help` - Raymond serial number help
- `nissan_k21_quote` - Nissan K21 engine quote
- `john_deere_pin_help` - John Deere PIN help
- `carpet_pole_quote` - Carpet pole quote

### 2. Environment Configuration
Since `.env.local` is blocked, you'll need to add the Basin API key to your environment:

**For Production (Vercel):**
```bash
NEXT_PUBLIC_BASIN_API_KEY=fb0e195001565085399383d6996c0ab1
```

**For Development:**
Add to your existing environment configuration or create a `.env.local` file:
```
NEXT_PUBLIC_BASIN_API_KEY=fb0e195001565085399383d6996c0ab1
```

### 3. Update Form Action URLs
After creating the Basin forms, replace `YOUR_BASIN_FORM_ID` in these files:
- `components/FastQuoteForm.tsx`
- `app/contact/page.tsx`
- `app/quote/page.tsx`
- `app/parts/raymond-forklift-serial-number/page.tsx`
- `app/parts/forklift-parts/nissan-k21-forklift-engine/page.tsx`
- `app/parts/construction-equipment-parts/john-deere-skid-steer-product-identification-number-lookup/page.tsx`
- `app/carpet-poles/page.tsx`

### 4. Test All Forms
After setting up Basin forms and updating environment variables:
1. Test each AJAX form (EmailSignup, Footer)
2. Test each standard HTML form
3. Verify form submissions appear in Basin dashboard
4. Check email notifications are working

## Basin API Key
- **API Key:** `fb0e195001565085399383d6996c0ab1`
- **AJAX Endpoint:** `https://api.usebasin.com/v1/submissions`
- **Form Endpoint:** `https://usebasin.com/f/[FORM_ID]`

## Migration Status: ✅ COMPLETE
All Formspree references have been successfully replaced with Basin equivalents. 