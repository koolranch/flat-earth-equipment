# Conversion Tracking Setup Guide

This guide will help you set up Google Analytics 4 and Google Ads conversion tracking for your Flat Earth Equipment safety training platform.

## Required Environment Variables

Add these to your **Vercel Environment Variables** (Settings → Environment Variables):

### 1. Google Analytics 4

```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**How to get this:**
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a GA4 property for flatearthequipment.com
3. Go to Admin → Data Streams → Web → Copy the Measurement ID
4. Add to Vercel env vars

### 2. Google Ads Conversion Tracking

```
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=XXXXX
```

**How to get this:**
1. Go to [Google Ads](https://ads.google.com/)
2. Tools & Settings → Measurement → Conversions
3. Click "+ New conversion action"
4. Select "Website" → "Purchase"
5. Set up conversion:
   - **Name:** "Safety Training Purchase"
   - **Value:** Use transaction-specific values
   - **Count:** Every conversion
6. Copy the Conversion ID (AW-XXXXXXXXX) and Label
7. Add both to Vercel env vars

---

## What Gets Tracked Automatically

Once env vars are set, the following events track automatically:

### ✅ **Google Analytics 4 Events:**

| Event | Location | Data Captured |
|-------|----------|---------------|
| `page_view` | All pages | Automatic via gtag config |
| `begin_checkout` | Buy button clicks | Course, price, items |
| `purchase` | Checkout success | Transaction ID, value, items |

### ✅ **Google Ads Conversions:**

| Conversion | Trigger | Value Tracked |
|------------|---------|---------------|
| Purchase | `/checkout/success` page load | Transaction value, ID |

### ✅ **Vercel Analytics:**

| Event | Location | Data |
|-------|----------|------|
| `Purchase` | Checkout success | Value, currency |

---

## Implementation Details

### Files Modified:

1. **`lib/analytics/gtag.ts`** - Tracking helper functions
2. **`app/layout.tsx`** - GA4 and Google Ads scripts in `<head>`
3. **`app/checkout/success/page.tsx`** - Purchase conversion tracking
4. **`app/safety/CheckoutButton.tsx`** - Begin checkout event tracking

### Code Structure:

```typescript
// Track any event
trackEvent('event_name', { param1: 'value' });

// Track purchase
trackPurchase({
  transactionId: 'stripe_session_id',
  value: 59,
  currency: 'USD',
  items: [...]
});

// Track conversion (Google Ads)
trackConversion('conversion_label', 59, 'USD', 'transaction_id');
```

---

## Testing Conversion Tracking

### Before Going Live:

1. **Add env vars to Vercel**
2. **Redeploy** the site
3. **Test purchase:**
   - Click buy button → Check GA4 Real-Time for `begin_checkout`
   - Complete purchase → Check GA4 Real-Time for `purchase`
   - Verify Google Ads shows conversion in dashboard

### Debug Mode:

Open browser console on any page to see tracking calls:
```javascript
// Check if gtag is loaded
window.gtag

// Check dataLayer
window.dataLayer
```

---

## Google Ads Campaign Setup

### Recommended Campaign Structure:

**Campaign 1: Branded Search**
- Keywords: "flat earth equipment forklift training", "flat earth safety"
- Budget: $10-20/day
- Conversion tracking: Required

**Campaign 2: Generic Search**
- Keywords: "online forklift certification", "OSHA forklift training"
- Budget: $30-50/day
- Conversion tracking: Required

**Campaign 3: State-Specific**
- Keywords: "forklift certification [state]", "forklift training [city]"
- Budget: $20-40/day
- Landing pages: Your 50 state pages
- Conversion tracking: Required

---

## Monitoring Checklist

### Daily (First Week):
- [ ] Check Google Ads conversion count
- [ ] Compare to Stripe dashboard sales
- [ ] Verify email delivery is working
- [ ] Monitor cost per conversion
- [ ] Check quality score of ads

### Weekly:
- [ ] Review GA4 funnel (landing → click → checkout → purchase)
- [ ] Identify drop-off points
- [ ] A/B test ad copy
- [ ] Adjust bids based on conversion data

---

## Important Notes

1. **Conversion lag:** Google Ads may take 24-48 hours to show conversions
2. **Attribution window:** Default is 30 days click, 1 day view
3. **Test mode:** Use Google Ads preview mode to test without spending
4. **Budget alerts:** Set up budget alerts in Google Ads

---

## Support

If conversions aren't tracking:
1. Check browser console for errors
2. Verify env vars are set in Vercel
3. Test in Incognito mode
4. Check Google Tag Assistant Chrome extension
5. Verify purchase shows in GA4 Real-Time events

---

Generated: October 2025
Platform: Next.js 14 + Vercel + Stripe

