# Parts Request Form - Email-Only Setup

## How It Works

The parts request form on brand serial lookup pages uses **the same email system as your certification emails** (Resend)—simple, reliable, no database needed.

### Flow:
1. User fills out form on `/brand/{brand}/serial-lookup`
2. Form POSTs to `/api/leads/parts`
3. API sends **two emails** via Resend (same as cert emails):
   - One to you (sales notification)
   - One to customer (auto-reply confirmation)
4. Returns success ✅

**Same email service you already use. No additional setup if Resend is already configured!**

## ✅ What You Need

### Required Environment Variables

These should **already be set** if your certification emails work:

```bash
RESEND_API_KEY="re_xxxxxxxxxxxxx"           # Same key used for cert emails
LEADS_TO_EMAIL="sales@flatearthequipment.com"  # Where you receive parts notifications
```

### Optional:
```bash
EMAIL_FROM="Flat Earth Equipment <parts@flatearthequipment.com>"  # Defaults to no-reply if not set
```

## 🔍 Check If Already Configured

If your **certification emails work**, you already have `RESEND_API_KEY` set in Vercel.

You just need to add `LEADS_TO_EMAIL`:

1. Go to: Vercel Dashboard → Settings → Environment Variables
2. Check if `RESEND_API_KEY` exists ✅ (should already be there)
3. Add `LEADS_TO_EMAIL` with your sales email address

## 📧 Emails Sent

### To You (LEADS_TO_EMAIL):
```
Subject: Parts Lead — takeuchi TB216 / 12345678

New parts lead for takeuchi

Email: customer@example.com
Name: John Smith
Phone: 555-1234
ZIP: 82001
Model: TB216
Serial: 12345678
Fault Code: E01

Parts Needed:
Need hydraulic pump for excavator

Submitted: 10/23/2025, 5:30:00 PM
```

### To Customer (Auto-reply):
```
Subject: We received your parts request (takeuchi)

Thanks for reaching out about takeuchi parts!

We received your request and our team will follow up 
within 24 hours with pricing and availability.

Your request details:
Model: TB216
Serial: 12345678
Fault Code: E01

Parts needed: Need hydraulic pump for excavator

Need immediate assistance? Call us at (307) 302-0043.

Best regards,
Flat Earth Equipment Team
```

## 🧪 Testing

1. **Check environment variables are set:**
   - Vercel Dashboard → Settings → Environment Variables
   - `RESEND_API_KEY` ✅ (should already exist for cert emails)
   - `LEADS_TO_EMAIL` ← **Add this if not set**

2. **Redeploy** (if you just added `LEADS_TO_EMAIL`):
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

3. **Test the form:**
   - Visit: https://flatearthequipment.com/brand/takeuchi/serial-lookup
   - Fill out the form with your email
   - Submit
   - Check your inbox for both emails (should look like cert emails)

## 🛡️ Spam Protection

The form includes:
- ✅ **Honeypot field** (hidden "Company" field catches bots)
- ✅ **Dwell-time check** (submissions < 3 seconds rejected)
- ✅ **Email validation** (frontend + backend)
- ✅ **Required fields** (email, parts description)

Bots get silently accepted (return 200) but no email is sent.

## 🎯 Why Email-Only?

**Pros:**
- ✅ Simple—no database migration needed
- ✅ Works immediately with just env vars
- ✅ You get notified in your inbox
- ✅ Customer gets confirmation
- ✅ No additional infrastructure

**Cons:**
- ❌ No historical record in dashboard
- ❌ No lead tracking/analytics
- ❌ Can't build CRM features
- ❌ If email fails, lead is lost

**For most use cases, email-only is perfectly fine.** If you later want to track leads in a database, we can add that as an optional enhancement.

## 🔍 Troubleshooting

### Form shows error message

**"Failed to send email"**
→ Check that `RESEND_API_KEY` is set in Vercel
→ Verify `LEADS_TO_EMAIL` is a valid email address
→ Check Resend dashboard for delivery errors

### Form submits but no emails received

1. **Check Vercel logs:**
   - Vercel Dashboard → Deployments → Latest → Functions
   - Look for `/api/leads/parts` logs
   - Check for email send errors

2. **Check Resend dashboard:**
   - Go to: https://resend.com/emails
   - See if emails were sent/delivered
   - Check for bounce/rejection messages

3. **Check spam folder:**
   - Parts request emails might be filtered
   - Look for subject: "Parts Lead — {brand}"

### Form submits instantly (suspicious)

This is normal—bots that fill the form too fast are silently rejected. Real users take at least 3 seconds to fill the form.

## ✅ Current Status

- [x] API uses Resend (same as certification emails)
- [x] Email-only (no database needed)
- [x] Honeypot and anti-spam measures in place
- [x] Professional HTML email templates
- [ ] **TODO:** Add LEADS_TO_EMAIL to Vercel env vars
- [ ] **TODO:** Test form after deployment

## 📋 Next Steps

1. **Add `LEADS_TO_EMAIL`** to Vercel environment variables (if not already set)
2. **Deployment is automatic** (already triggered by the push)
3. **Test the form** on any brand page
4. **Monitor your email** for parts requests

**That's it!** Since you're already using Resend for certification emails, the parts form will work with just one additional env var (`LEADS_TO_EMAIL`). 📬

## 🎯 Benefits of Using Same Email Service

- ✅ **No additional services** to configure
- ✅ **Same reliability** as cert emails
- ✅ **Unified email logs** in Resend dashboard
- ✅ **Same deliverability** (emails won't be flagged as spam)
- ✅ **Consistent branding** across all emails
- ✅ **One API key** to manage

