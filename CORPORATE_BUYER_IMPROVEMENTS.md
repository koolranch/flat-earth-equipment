# Corporate Buyer Journey Improvements

## Overview
Enhanced the charger quote flow to better capture and serve corporate buyers who need bulk orders and purchase order capabilities.

---

## 🎯 Problem Statement

**Before:** The quote form was minimal (name + email only), which didn't capture enough information to qualify corporate leads or understand their purchasing needs.

**Challenge:** Corporate buyers have different needs than individual consumers:
- Need to pay with purchase orders (NET-30 terms)
- Often ordering multiple units
- Require faster turnaround and volume pricing
- Have specific timeline requirements

---

## ✅ Improvements Made

### 1. Enhanced Quote Form (SimpleQuoteModal.tsx)

**New Fields Added:**

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| Full Name | Text | ✅ Yes | Contact identification |
| Email | Email | ✅ Yes | Primary communication |
| Company Name | Text | No | Qualify corporate buyers |
| Phone Number | Tel | No | Enable faster communication |
| Quantity | Number | ✅ Yes | Volume pricing assessment |
| Timeline | Select | No | Prioritize urgent orders |
| Purchase Order | Checkbox | No | Flag NET-30 term requests |
| Notes | Textarea | No | Capture special requirements |

**Smart Email Subject Line:**
- If PO checkbox is checked: `"Corporate Quote Request (PO Required)"`
- Otherwise: `"Charger Quote Request"`

This helps your sales team prioritize high-value corporate leads.

---

### 2. Improved Button & Messaging

**Quote Button Changes:**
- Text: "Quote" → **"Get Quote"**
- Added tooltip: "Request quote for bulk orders and purchase orders"
- Better visual hierarchy with padding adjustment

**Added Context on Product Page:**
```
💼 Bulk orders or purchase order? Get volume pricing and NET-30 terms with a custom quote.
```

This messaging:
- Clearly explains when to use the quote button vs buy now
- Appeals directly to corporate procurement needs
- Sets expectations for volume pricing availability

---

### 3. Enhanced Success Message

**Before:**
> "Thank you! We'll get back to you shortly with your charger quote."

**After:**
> "Quote Request Received!
> Our team will review your request and get back to you within 24 hours with pricing and availability.
> We'll include volume pricing and NET-30 terms information if applicable."

**Benefits:**
- Sets clear SLA expectations (24 hours)
- Confirms value propositions (volume pricing, NET-30 terms)
- More professional tone for corporate buyers

---

### 4. Form Copy Improvements

**Header Text:**
> "Request a custom quote. We support purchase orders and volume pricing for corporate buyers."

**Timeline Options:**
- As soon as possible
- 1-2 weeks
- 3-4 weeks
- 1-2 months
- Flexible

**Purchase Order Checkbox:**
> "☑️ I need to pay with a Purchase Order
> We'll send NET-30 terms and setup instructions"

---

## 📊 Data Captured for Sales Team

Every quote submission now includes:

```json
{
  "fullname": "John Smith",
  "email": "john@acmecorp.com",
  "company": "ACME Corporation",
  "phone": "(555) 123-4567",
  "quantity": "5",
  "needs_purchase_order": "Yes",
  "timeline": "1-2weeks",
  "notes": "Need chargers for warehouse expansion project",
  "product_name": "GREEN4 36V 40A",
  "product_slug": "green4-36v-40a",
  "product_sku": "GREEN4-36V-40A",
  "subject": "Corporate Quote Request (PO Required)",
  "form_name": "charger_quote"
}
```

---

## 🎯 Lead Qualification Benefits

The enhanced form helps you:

1. **Identify high-value leads** - Company name + quantity signals corporate buyer
2. **Prioritize urgency** - Timeline field helps triage quotes
3. **Prepare appropriate terms** - PO checkbox triggers NET-30 paperwork
4. **Personalize follow-up** - Phone number enables direct contact
5. **Understand context** - Notes field captures project details

---

## 💡 Recommended Next Steps

### Immediate Actions
1. ✅ Update Basin email template to highlight PO requests
2. ✅ Create internal workflow for "Corporate Quote Request (PO Required)" emails
3. ✅ Set up CRM automation to flag high-quantity requests

### Future Enhancements

#### A. Add Volume Pricing Tiers on Page
```
1-3 units:    $1,600 each
4-9 units:    $1,520 each (5% off)
10+ units:    Contact for pricing
```

#### B. Add Trust Signals
- "Trusted by 500+ warehouses nationwide"
- Customer logos (if available)
- "NET-30 terms available for qualified businesses"

#### C. Create Dedicated Corporate Landing Page
- `/chargers/bulk-orders` or `/corporate`
- Features: Volume pricing calculator, case studies, fleet solutions

#### D. Add "Chat with Sales" for High-Value Visitors
- Trigger after viewing 3+ charger products
- Or when visiting from corporate IP addresses

#### E. Email Automation Sequence
For quote requesters who don't respond:
- Day 0: Quote sent
- Day 2: Follow-up with additional product options
- Day 5: Case study or testimonial
- Day 10: Last chance with limited-time discount

---

## 🔧 Technical Details

### Files Modified
1. `/components/SimpleQuoteModal.tsx` - Enhanced form with corporate fields
2. `/components/QuoteButton.tsx` - Updated button text and tooltip
3. `/app/chargers/[slug]/page.tsx` - Added contextual messaging

### Form Submission
- **Endpoint:** Basin API (`https://api.usebasin.com/v1/submissions`)
- **Form Name:** `charger_quote`
- **API Key:** Uses `NEXT_PUBLIC_BASIN_API_KEY` environment variable
- **Error Handling:** Proper validation with user feedback

### Email Routing
All submissions go to Basin, which forwards to your configured email address with the subject line based on whether PO is needed.

---

## 📈 Success Metrics to Track

Monitor these KPIs to measure improvement:

1. **Quote Request Rate** - % of product page visitors who request quotes
2. **Corporate Lead Quality** - % of quotes with company name filled
3. **PO Request Rate** - % of quotes requesting purchase orders
4. **Average Order Quantity** - Track from quote submissions
5. **Quote-to-Order Conversion** - % of quotes that become orders
6. **Response Time** - Time from submission to first response

**Target Goals:**
- 15-20% of visitors request quotes
- 40%+ of quotes include company name
- 30%+ conversion rate from quote to order
- <12 hour average response time

---

## 🎉 Benefits Summary

### For Your Business
✅ Capture higher-value leads
✅ Better qualify corporate buyers
✅ Faster sales cycle with more context
✅ Easier to prepare volume pricing
✅ Clear identification of NET-30 needs

### For Your Customers
✅ Clear path for bulk purchases
✅ Transparent about PO capabilities
✅ Professional, confidence-building process
✅ Set expectations with 24hr SLA
✅ Easier to request custom quotes

---

## 📝 Quote Request Flow

```
User Journey:
1. Browse charger products
2. See "Get Quote" button + context about bulk orders
3. Click "Get Quote"
4. See professional form with corporate-friendly fields
5. Fill in company, quantity, PO needs, timeline
6. Submit → Get confirmation with 24hr SLA
7. Receive email within 24hrs with volume pricing + NET-30 terms

Sales Team Journey:
1. Receive email: "Corporate Quote Request (PO Required)"
2. See all context: company, quantity, timeline, notes
3. Prepare appropriate quote with volume pricing
4. Include NET-30 term instructions if PO was checked
5. Follow up within 24 hours
6. Close higher-value deals faster
```

---

**Last Updated:** October 8, 2025
**Status:** ✅ Complete and deployed

