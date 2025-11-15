# ⚡ Black Friday Quick Start - TL;DR

## 🚀 3 Steps to $49 Pricing

### Step 1: Create Stripe Price (5 min)
```bash
npx ts-node scripts/create-black-friday-price.ts
```
**Copy the Price ID it gives you.**

---

### Step 2: Update Code (5 min)

**Edit:** `lib/training/plans.ts` (line 8-10)

```typescript
// Change these 3 values:
price: 49,                              // was: 59
priceText: '$49',                       // was: '$59'
priceId: 'price_YOUR_NEW_ID_HERE',     // paste from step 1
```

**Test locally:**
```bash
npm run dev
# Visit localhost:3000/safety
# Click "Buy Now" → Verify shows $49
```

---

### Step 3: Deploy (5 min)

```bash
git add lib/training/plans.ts
git commit -m "Black Friday: $49 pricing"
git push origin main
```

**Wait 2 min, then test:** https://flatearthequipment.com/safety

---

## 🚨 Emergency Rollback

**If anything breaks:**

```typescript
// lib/training/plans.ts - change back to:
price: 59,
priceText: '$59',
priceId: 'price_1RS834HJI548rO8JpJMyGhL3', // ← ORIGINAL
```

```bash
git add lib/training/plans.ts
git commit -m "Revert to $59"
git push origin main
```

**Done. Back to normal in 2 minutes.**

---

## 📚 Full Guides

- **Detailed Plan:** `BLACK_FRIDAY_SAFE_DEPLOYMENT_PLAN.md`
- **Visual Promotions:** `BLACK_FRIDAY_VISUAL_GUIDE.md`
- **Pricing Updates:** `BLACK_FRIDAY_PRICING_GUIDE.md`

---

## ✅ Safety Guarantee

**What can break:** Nothing.  
**What we're changing:** 1 file, 3 values.  
**Original price:** Still exists in Stripe.  
**Rollback time:** 2 minutes.

**You've got this!** 🎉

