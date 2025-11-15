# 🎉 Black Friday $49 Special - Implementation Guide

## ⚠️ CRITICAL: Follow Steps in Order

This guide walks you through safely changing pricing from $59 to $49 without breaking Stripe.

---

## Step 1: Create New Stripe Price (DO THIS FIRST)

```bash
npx ts-node scripts/create-black-friday-price.ts
```

**What this does:**
- Creates a NEW $49 price in Stripe
- Links it to your existing "Single Operator" product
- Tags it with Black Friday metadata
- Gives you the new Price ID to use

**Output:** Copy the new Price ID (looks like `price_XXXXXXXXXXXX`)

---

## Step 2: Update Code (3 Files to Change)

### File 1: `lib/training/plans.ts`

**CHANGE LINE 8-10:**

```typescript
// BEFORE (current $59)
price: 59,
priceText: '$59',
priceId: 'price_1RS834HJI548rO8JpJMyGhL3',

// AFTER (Black Friday $49)
price: 49,
priceText: '$49',
priceId: 'price_XXXXXXXXXXXX', // ← USE NEW PRICE ID FROM STEP 1
```

### File 2: `app/safety/page.tsx`

**Find and replace all instances of:**
- `$59` → `$49`
- `59` → `49` (in text, NOT in priceId)

### File 3: `components/safety/SafetyHero.tsx`

**Find and replace all instances of:**
- `$59` → `$49`

---

## Step 3: Update Marketing Copy (Optional)

Add Black Friday messaging:

```typescript
// In app/safety/page.tsx or SafetyHero.tsx
blurb: '🎉 Black Friday Special - Save $10! Perfect for job seekers'
// Or add a banner:
<div className="bg-orange-500 text-white p-2 text-center">
  🎉 Black Friday: $10 OFF - Limited Time!
</div>
```

---

## Step 4: Test Before Going Live

1. **Run dev server:**
   ```bash
   npm run dev
   ```

2. **Test checkout at /safety:**
   - Click "Buy Now" button
   - Verify Stripe shows $49
   - **DO NOT complete purchase**
   - Just verify the price is correct

3. **Check these pages:**
   - `/safety` - Main pricing page
   - `/safety/forklift/tx` - State pages
   - `/safety/forklift/ca` - State pages

---

## 🔄 HOW TO REVERT AFTER BLACK FRIDAY

### Quick Revert (Change 1 File)

**`lib/training/plans.ts` - Lines 8-10:**

```typescript
// Revert to original
price: 59,
priceText: '$59',
priceId: 'price_1RS834HJI548rO8JpJMyGhL3', // ← Original price ID
```

### Complete Revert (All Files)

1. **Revert `lib/training/plans.ts`** (above)
2. **Revert `app/safety/page.tsx`:**
   - Find all `$49` → change back to `$59`
3. **Revert `components/safety/SafetyHero.tsx`:**
   - Find all `$49` → change back to `$59`
4. **Remove any Black Friday banners/messaging**

**Then:**
```bash
git add .
git commit -m "Revert to regular $59 pricing after Black Friday"
git push origin main
```

---

## 📊 Tracking Black Friday Sales

In Stripe Dashboard:
1. Go to Payments
2. Filter by Price ID: `price_XXXXXXXXXXXX` (your new BF price)
3. See all Black Friday sales

Or query metadata:
- Campaign: `black_friday_2025`
- Original price: `5900`
- Discount: `1000`

---

## ✅ Safety Checklist

Before going live:

- [ ] New Stripe price created
- [ ] New Price ID copied
- [ ] `lib/training/plans.ts` updated
- [ ] All $59 references changed to $49
- [ ] Tested checkout locally
- [ ] Verified price shows $49 in Stripe
- [ ] Know how to revert (saved this guide!)

---

## 🆘 If Something Goes Wrong

**Stripe still charging $59?**
- Check you updated the `priceId` in `lib/training/plans.ts`
- Clear your browser cache
- Try incognito mode

**Want to revert immediately?**
- Just change `priceId` back to `price_1RS834HJI548rO8JpJMyGhL3`
- Push to git
- Vercel will redeploy in 1-2 minutes

**Questions?**
- Original Price ID: `price_1RS834HJI548rO8JpJMyGhL3`
- This is your "rollback" safety net
- The old price never goes away in Stripe

---

## 💡 Pro Tips

1. **Schedule the revert:**
   - Set calendar reminder for end of Black Friday
   - Revert Monday morning

2. **Monitor sales:**
   - Watch Stripe dashboard
   - Check if discount is driving conversions

3. **A/B test messaging:**
   - Try "Save $10" vs "Now $49" vs "$10 Off"
   - See what converts better

4. **Email existing leads:**
   - "Black Friday: Forklift Cert now $49"
   - Creates urgency

---

## Files That DON'T Need Changes

✅ These stay the same:
- Stripe product ID
- Database schemas
- Checkout API routes
- Success pages
- Email templates

The beauty of this approach is we're just swapping Price IDs - everything else works automatically!

