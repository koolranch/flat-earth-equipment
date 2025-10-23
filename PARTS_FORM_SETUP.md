# Parts Request Form - Email-Only Setup

## How It Works

The parts request form on brand serial lookup pages uses a **simple email-only approach**—no database storage required.

### Flow:
1. User fills out form on `/brand/{brand}/serial-lookup`
2. Form POSTs to `/api/leads/parts`
3. API sends **two emails** via SendGrid:
   - One to you (sales notification)
   - One to customer (auto-reply confirmation)
4. Returns success ✅

**No database, no complexity, just email.**

## ✅ What You Need

### Required Environment Variables

Add these to **Vercel** → Your Project → **Settings** → **Environment Variables**:

```bash
SENDGRID_API_KEY="SG.xxxxxxxxxxxxx"          # Your SendGrid API key
LEADS_TO_EMAIL="sales@flatearthequipment.com"  # Where you receive notifications
```

### Optional:
```bash
LEADS_FROM_EMAIL="noreply@flatearthequipment.com"  # Defaults to this if not set
```

## 🔑 Get SendGrid API Key

1. Go to: https://app.sendgrid.com/
2. Sign up or log in
3. Navigate to: **Settings** → **API Keys**
4. Click **Create API Key**
5. Name: "Flat Earth Parts Leads"
6. Permissions: **Full Access** (or at least "Mail Send")
7. Copy the key (starts with `SG.`)
8. Add to Vercel environment variables

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
   - Make sure `SENDGRID_API_KEY` and `LEADS_TO_EMAIL` exist

2. **Redeploy** (if you just added env vars):
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

3. **Test the form:**
   - Visit: https://flatearthequipment.com/brand/takeuchi/serial-lookup
   - Fill out the form with your email
   - Submit
   - Check your inbox for both emails

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

**"Email service not configured"**
→ Add `SENDGRID_API_KEY` to Vercel env vars and redeploy

**"Failed to send email"**
→ Check SendGrid dashboard for delivery errors
→ Verify `LEADS_TO_EMAIL` is a valid email address

### Form submits but no emails received

1. **Check Vercel logs:**
   - Vercel Dashboard → Deployments → Latest → Functions
   - Look for `/api/leads/parts` logs
   - Check for SendGrid errors

2. **Check SendGrid activity:**
   - SendGrid Dashboard → Activity Feed
   - See if emails were sent/bounced

3. **Check spam folder:**
   - Emails might be filtered

### Form submits instantly (suspicious)

This is normal—bots that fill the form too fast are silently rejected. Real users take at least 3 seconds to fill the form.

## ✅ Current Status

- [x] API simplified to email-only (no database)
- [x] Honeypot and anti-spam measures in place
- [ ] **TODO:** Add SendGrid API key to Vercel
- [ ] **TODO:** Set LEADS_TO_EMAIL in Vercel
- [ ] **TODO:** Test form after deployment

## 📋 Next Steps

1. **Add SendGrid credentials** to Vercel env vars
2. **Redeploy** to pick up the new simplified API
3. **Test the form** on any brand page
4. **Monitor your email** for parts requests

That's it! The form will work with just email—simple and effective. 📬

