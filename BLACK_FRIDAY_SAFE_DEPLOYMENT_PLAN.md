# 🛡️ Black Friday $49 Special - SAFE Deployment Plan

## ⚠️ CRITICAL: Zero-Risk Strategy

This plan ensures Stripe keeps working at every step. Each phase has testing and rollback options.

---

## 🎯 Overview: 3-Phase Approach

**Phase 1:** Create new Stripe price (can't break anything - just adding)  
**Phase 2:** Test on staging/dev (verify before production)  
**Phase 3:** Deploy to production (with immediate rollback ready)

**Time Required:** 30-45 minutes total  
**Risk Level:** Minimal (with testing at each step)

---

## Phase 1: Create Stripe Price (5 minutes)

### ✅ What We're Doing
Creating a **NEW** $49 price in Stripe. This does NOT modify or delete anything.

### 📋 Steps

```bash
# 1. Make sure you're in project directory
cd /Users/christopherray/Documents/flat-earth-equipment

# 2. Create the Black Friday price in Stripe
npx ts-node scripts/create-black-friday-price.ts
```

### 🔍 What to Verify

You should see output like:
```
✅ Black Friday price created!
   Price ID: price_1ABC123XYZ...
   Amount: $49.00
```

### 📝 Action Required

**COPY THE NEW PRICE ID** - You'll need this in Phase 2.

Example: `price_1ABC123XYZ456`

### ⚠️ Can This Break Stripe?

**NO.** We're only CREATING a new price, not modifying the existing $59 price.

- ✅ Existing $59 price still works
- ✅ Old price ID unchanged
- ✅ No customer impact
- ✅ Can't break anything

### 🔄 Rollback (If Needed)

Not needed - new price just sits in Stripe unused. But if you want:
```
Delete the price in Stripe Dashboard → Prices → Find new price → Archive
```

---

## Phase 2: Test Locally (15-20 minutes)

### ✅ What We're Doing
Update code to use new $49 price and test checkout **locally** before deploying.

### 📋 Step 2.1: Update Pricing Config

**File:** `lib/training/plans.ts`

**Find lines 8-10:**
```typescript
price: 59,
priceText: '$59',
priceId: 'price_1RS834HJI548rO8JpJMyGhL3',
```

**Change to:**
```typescript
price: 49,
priceText: '$49',
priceId: 'price_YOUR_NEW_PRICE_ID_HERE', // ← PASTE from Phase 1
```

**Save the file.**

### 📋 Step 2.2: Test Locally

```bash
# Start dev server
npm run dev
```

**Open:** http://localhost:3000/safety

### 🔍 What to Verify

1. **Page loads correctly** ✓
2. **Price shows $49** ✓
3. **"Buy Now" button works** ✓
4. **Click leads to checkout** ✓

### 📋 Step 2.3: Test Stripe Checkout

**DO NOT COMPLETE THE PURCHASE - Just verify:**

1. Click "Buy Now" button on /safety page
2. Stripe checkout opens
3. **VERIFY: Shows $49.00 (not $59)**
4. Close the checkout (don't pay)

### ⚠️ What If Price Shows $59?

**STOP.** Something's wrong. Check:
- Did you paste the correct new Price ID?
- Did you save the file?
- Did you restart dev server?

### ⚠️ What If Page Won't Load?

**STOP.** There's a syntax error. Check:
- Did you close all quotes properly?
- Did you keep the comma at the end?

Run this to check for errors:
```bash
npm run build
```

### 🔄 Rollback (If Needed)

```typescript
// Revert lib/training/plans.ts back to:
price: 59,
priceText: '$59',
priceId: 'price_1RS834HJI548rO8JpJMyGhL3', // ← Original
```

Then restart dev server.

### ✅ Phase 2 Success Criteria

- [x] Dev server runs without errors
- [x] /safety page loads correctly
- [x] Price displays $49
- [x] Stripe checkout shows $49
- [x] No console errors

**If all checked: Proceed to Phase 3**  
**If any failed: STOP and fix before continuing**

---

## Phase 3: Deploy to Production (10 minutes)

### ⚠️ FINAL SAFETY CHECK

Before deploying, answer these:

- [ ] Did you test locally and everything worked?
- [ ] Did you verify Stripe shows $49 in checkout?
- [ ] Do you have the original Price ID saved for rollback?
- [ ] Is it actually Black Friday (or test time)?

**All checked? Let's deploy.**

### 📋 Step 3.1: Commit Changes

```bash
# Check what changed
git status

# Should show: lib/training/plans.ts (modified)

# Stage the change
git add lib/training/plans.ts

# Commit with clear message
git commit -m "Black Friday: Update training price to $49 (temporary)

- Changed from $59 to $49
- Using new Stripe Price ID: price_YOUR_ID_HERE
- Original price ID saved for rollback: price_1RS834HJI548rO8JpJMyGhL3"

# Push to deploy
git push origin main
```

### 🔍 What to Verify

Vercel will auto-deploy in 1-2 minutes.

**Watch the deployment:**
1. Go to https://vercel.com (your dashboard)
2. See deployment in progress
3. Wait for ✅ "Deployment successful"

### 📋 Step 3.2: Test Live Site

**Immediately after deployment:**

1. Open https://flatearthequipment.com/safety (hard refresh: Cmd+Shift+R)
2. Verify price shows $49
3. Click "Buy Now"
4. **Verify Stripe checkout shows $49**
5. Close checkout (don't complete)

### 🔍 Production Verification Checklist

Test these pages:

- [ ] `/safety` - Main page (shows $49)
- [ ] `/safety#pricing` - Pricing section (shows $49)
- [ ] `/safety/forklift/tx` - State page (shows $49)
- [ ] Stripe checkout (shows $49)
- [ ] No console errors

### ⚠️ What If Something's Wrong?

**IMMEDIATE ROLLBACK** (next section)

---

## 🚨 EMERGENCY ROLLBACK (2 minutes)

### If Anything Goes Wrong

**Quick Rollback:**

```bash
# Revert to original price
# Edit lib/training/plans.ts and change back:

price: 59,
priceText: '$59',
priceId: 'price_1RS834HJI548rO8JpJMyGhL3', # ← ORIGINAL

# Save, commit, push
git add lib/training/plans.ts
git commit -m "Revert to $59 - rolling back Black Friday pricing"
git push origin main
```

Vercel will redeploy in 1-2 minutes with original $59 price.

### Nuclear Option (If Git Fails)

Go to Vercel Dashboard:
1. Find your deployment
2. Click "..." menu
3. "Rollback to this deployment"
4. Select previous deployment (before Black Friday change)

Site reverts immediately.

---

## 🎨 Optional: Add Visual Promotions (10 minutes)

**ONLY DO THIS AFTER PHASE 3 IS SUCCESSFUL**

### Step 4.1: Add Site-Wide Banner (Optional)

If you want the orange banner at top of all pages:

```bash
# Create the banner component (already provided)
# Add to layout.tsx:
```

Edit `app/layout.tsx`, find this line:
```tsx
<Navbar locale={locale} />
```

Add ABOVE it:
```tsx
import SiteWideBanner from '@/components/safety/SiteWideBanner';

// Then above <Navbar>:
<SiteWideBanner />
<Navbar locale={locale} />
```

**Commit:**
```bash
git add components/safety/SiteWideBanner.tsx app/layout.tsx
git commit -m "Add Black Friday promotional banner"
git push origin main
```

**Test:** Wait 1-2 min, refresh site, see banner.

**Rollback:** Remove the import and `<SiteWideBanner />` line.

### Step 4.2: Add Hero Badge (Optional)

Add countdown and "Save $10" badge to /safety hero section.

**(Instructions in BLACK_FRIDAY_VISUAL_GUIDE.md)**

---

## 📊 Post-Deployment Monitoring

### First 30 Minutes

Watch for:
- [ ] Any error emails from Vercel
- [ ] Stripe Dashboard - new payments at $49
- [ ] No support emails about broken checkout
- [ ] Analytics tracking checkout clicks

### Daily Checks

- [ ] Stripe payments processing correctly
- [ ] No failed payment emails
- [ ] Checkout completion rate normal

---

## 🔄 End of Black Friday: Revert Plan

### When to Revert

Set reminder for Monday, December 2nd at 9am.

### Revert Steps (5 minutes)

```bash
# 1. Edit lib/training/plans.ts
# Change back to:
price: 59,
priceText: '$59',
priceId: 'price_1RS834HJI548rO8JpJMyGhL3', # ← ORIGINAL

# 2. Remove promotional banners (if added)
# Delete or comment out:
# - SiteWideBanner import
# - BlackFridayBanner import
# - Any "Save $10" messaging

# 3. Commit and deploy
git add .
git commit -m "Revert to regular $59 pricing after Black Friday"
git push origin main

# 4. Verify live site shows $59 again
```

---

## ❌ What NOT to Do

**DON'T:**
- ❌ Delete the original $59 Stripe price
- ❌ Edit Stripe prices in dashboard manually
- ❌ Change checkout API routes
- ❌ Modify database schemas
- ❌ Touch webhook handlers
- ❌ Change success page logic
- ❌ Deploy on Friday night (do it early Friday)

**WHY:** These can actually break Stripe. We're only swapping Price IDs - that's safe.

---

## ✅ Why This Plan Is Safe

### Safety Mechanisms

1. **New Price, Not Modified:** Original $59 price untouched
2. **Staged Rollout:** Test locally first
3. **Git History:** Can revert any commit
4. **Vercel Rollback:** Can undo deployment instantly
5. **Simple Change:** Only 3 values in 1 file
6. **No API Changes:** Checkout routes untouched
7. **No Database Changes:** Nothing in Supabase touched
8. **Stripe Webhooks Unchanged:** All automation works

### What Makes Stripe Break

❌ Deleting active prices  
❌ Changing API routes  
❌ Breaking webhooks  
❌ Invalid Price IDs  

✅ **Swapping Price IDs: SAFE**

We're doing the safest possible change.

---

## 📞 Support Resources

### If You Need Help

**Stripe Issues:**
- Dashboard: https://dashboard.stripe.com
- Logs: Look at recent payment attempts
- Test mode: Use test keys to verify

**Vercel Issues:**
- Dashboard: https://vercel.com
- Deployment logs: Click deployment → View logs
- Rollback: Deployments → Previous → Rollback

**Code Issues:**
- Original Price ID: `price_1RS834HJI548rO8JpJMyGhL3`
- Just revert to this if anything breaks

---

## 🎯 Success Metrics

Track these to measure Black Friday success:

1. **Conversion Rate:** /safety visitors → purchases
2. **Total Sales:** Count of $49 transactions
3. **Revenue:** Total $ from Black Friday pricing
4. **Traffic:** Visitors to /safety page
5. **CTR:** Site banner → safety page clicks

Compare to normal week:
- Did discount increase conversion rate?
- Was revenue higher despite lower price?
- Did traffic spike?

---

## ✅ Final Pre-Launch Checklist

### Before You Start

- [ ] Read this entire plan
- [ ] Have original Price ID saved somewhere
- [ ] Know how to rollback
- [ ] Tested Stripe in test mode (optional but recommended)
- [ ] Set calendar reminder to revert after Black Friday

### During Deployment

- [ ] Created new Stripe price
- [ ] Copied new Price ID
- [ ] Updated lib/training/plans.ts
- [ ] Tested locally
- [ ] Verified Stripe shows $49
- [ ] Committed with good message
- [ ] Pushed to production
- [ ] Verified live site
- [ ] Tested live checkout

### After Deployment

- [ ] Monitoring Stripe Dashboard
- [ ] Watching for errors
- [ ] Analytics tracking
- [ ] Ready to rollback if needed

---

## 💪 You've Got This!

This plan is designed to be foolproof. The only thing that changes is a Price ID in one file. Everything else stays the same.

**Worst case:** Something breaks → Revert → Back to $59 in 2 minutes.

**Best case:** Smooth deployment → Increased sales → Happy Black Friday! 🎉

---

## 🚀 Ready to Start?

Begin with **Phase 1** when you're ready.

Take your time, follow each step, and test at each checkpoint.

Good luck with your Black Friday sale! 💰

