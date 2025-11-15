# 🎨 Black Friday Visual Promotion Guide

## Overview: 5-Layer Promotion Strategy

Maximize visibility with subtle-to-bold promotions across your site.

---

## 1. 🔥 Site-Wide Top Banner (HIGHEST IMPACT)

**Placement:** Top of every page  
**Visibility:** 100% of visitors  
**Dismissable:** Yes (saves to session)

### Implementation:

```tsx
// In app/layout.tsx - Add ABOVE <Navbar>

import SiteWideBanner from '@/components/safety/SiteWideBanner';

export default function RootLayout({ children }) {
  return (
    <body>
      {/* Black Friday banner */}
      <SiteWideBanner />
      
      {/* Existing navbar */}
      <Navbar locale={locale} />
      
      {/* Rest of layout */}
      {children}
    </body>
  );
}
```

**Visual Preview:**
```
┌─────────────────────────────────────────────────┐
│ 🎉 Black Friday: $10 Off Forklift Training     │
│ Get certified for just $49 — Limited time!  [X]│
│         [Get Started →]                         │
└─────────────────────────────────────────────────┘
```

**Features:**
- ✅ Gradient orange-to-red background
- ✅ Animated entrance
- ✅ Dismissable with X button
- ✅ Saves dismiss state (session storage)
- ✅ Mobile-responsive CTA

---

## 2. 💰 Hero Section Badge (ATTENTION-GRABBING)

**Placement:** /safety page hero  
**Visibility:** All training page visitors  
**Impact:** HIGH - First thing they see

### Implementation:

```tsx
// In components/safety/SafetyHero.tsx or app/safety/page.tsx
// Add ABOVE or NEXT TO the main headline

import BlackFridayBanner from '@/components/safety/BlackFridayBanner';

export default function SafetyHero() {
  return (
    <section className="hero-section">
      {/* Black Friday badge with countdown */}
      <BlackFridayBanner variant="hero" showCountdown={true} />
      
      {/* Your existing headline */}
      <h1>Get OSHA Forklift Certification in Under 60 Minutes</h1>
      
      {/* Rest of hero content */}
    </section>
  );
}
```

**Visual Preview:**
```
     ╔═══════════════════════════╗
     ║  🎉 Black Friday Special  ║  ← Glowing badge
     ╚═══════════════════════════╝
     
     ┌─────────────────┐
     │  $49  │ $59     │  ← Price comparison
     │       │ Save $10│
     └─────────────────┘
     
     ⏰ Ends in: 2d 14h 32m  ← Countdown
     
     Get OSHA Forklift Certification
     in Under 60 Minutes
```

**Features:**
- ✅ Glowing animated badge
- ✅ Clear $49 vs $59 comparison
- ✅ Live countdown timer
- ✅ Pulsing glow effect

---

## 3. 🏷️ Pricing Card Badge (POINT-OF-DECISION)

**Placement:** Pricing section cards  
**Visibility:** Users ready to buy  
**Impact:** HIGH - Creates urgency at conversion point

### Implementation:

```tsx
// In your pricing card component
// Wherever you show the "Single Operator" plan

import BlackFridayBanner from '@/components/safety/BlackFridayBanner';

<div className="pricing-card relative">  {/* ← Add relative */}
  
  {/* Black Friday badge in corner */}
  <BlackFridayBanner variant="pricing" />
  
  {/* Your existing pricing card content */}
  <h3>Single Operator</h3>
  <p className="price">
    <span className="new-price">$49</span>
    <span className="old-price line-through">$59</span>
  </p>
  <button>Buy Now</button>
</div>
```

**Visual Preview:**
```
┌──────────────────────────┐
│              ╱───────╲   │  ← Rotated badge
│             │ $10 OFF │  │     in corner
│             │Black Fri│  │
│              ╲───────╱   │
│                          │
│   Single Operator        │
│                          │
│   $49  $59              │
│                          │
│   [Buy Now →]            │
└──────────────────────────┘
```

**Features:**
- ✅ Eye-catching corner placement
- ✅ Slight rotation (3deg) for dynamism
- ✅ Pulsing glow effect
- ✅ Doesn't block card content

---

## 4. 📍 Updated CTA Buttons

**Placement:** All "Buy Now" / "Get Started" buttons  
**Visibility:** Wherever users can buy  
**Impact:** MEDIUM - Reinforces discount

### Implementation:

```tsx
// Update button text across the site

// BEFORE:
<button>Start Certificate — $59</button>

// AFTER (Option 1 - Simple):
<button>Start Certificate — $49 (Save $10!)</button>

// AFTER (Option 2 - With badge):
<button className="flex items-center gap-2">
  Start Certificate — $49
  <BlackFridayBanner variant="sticky" />
</button>
```

**Visual Preview:**
```
┌──────────────────────────────────────┐
│ Start Certificate — $49 [🎉 $10 OFF] │
└──────────────────────────────────────┘
```

---

## 5. 💬 Strikethrough Pricing (SOCIAL PROOF)

**Placement:** Everywhere you show price  
**Visibility:** All price mentions  
**Impact:** HIGH - Shows value

### Implementation:

```tsx
// Wherever you display the price

<div className="price-display">
  <span className="text-3xl font-bold text-slate-900">$49</span>
  <div className="flex flex-col items-start ml-2">
    <span className="text-sm text-slate-500 line-through">$59</span>
    <span className="text-sm font-semibold text-orange-600">Save $10</span>
  </div>
</div>
```

**Visual Preview:**
```
     $49  $59
          Save $10
```

---

## 🎯 Recommended Implementation Order

### Priority 1: Must-Have (30 minutes)
1. ✅ Update prices to $49 in `lib/training/plans.ts`
2. ✅ Add strikethrough pricing on main /safety page
3. ✅ Add hero banner with countdown

### Priority 2: High-Impact (20 minutes)
4. ✅ Add site-wide top banner
5. ✅ Add pricing card badges
6. ✅ Update CTA button text

### Priority 3: Polish (10 minutes)
7. ✅ Test on mobile
8. ✅ Add to state pages (/safety/forklift/tx, etc.)
9. ✅ Check all pages with pricing mentions

---

## 📱 Mobile Optimization

All components are responsive:

**Site Banner:**
- Stacks CTA button below text on mobile
- Maintains dismiss button
- Slightly smaller font sizes

**Hero Badge:**
- Same size, centers well on mobile
- Countdown stays legible

**Pricing Cards:**
- Badge scales proportionally
- Maintains corner position

---

## 🎨 Color Palette

Consistent with your brand:

```css
Primary: #F76511 (Your brand orange)
Accent: #EF4444 (Red for urgency)
Gradients: orange-500 → red-500 → orange-500
Text: White on gradient, Slate-900 on light
Glow: Pulsing opacity 30-60%
```

---

## ⚡ Animation Strategy

Subtle, professional animations:

1. **Banner entrance**: Slide from top (500ms)
2. **Badge glow**: Pulse every 2s
3. **Countdown**: Updates every minute (no flash)
4. **Hover states**: Scale up 105% (200ms)

All animations respect `prefers-reduced-motion`.

---

## 🧪 A/B Test Ideas

Try different messaging:

**Variant A:** "Save $10"  
**Variant B:** "Now $49 (was $59)"  
**Variant C:** "🎉 Black Friday: $10 Off"  
**Variant D:** "Limited Time: $49"

Track which converts best in your analytics.

---

## 📊 Tracking Effectiveness

Monitor these metrics:

1. **Click-through rate** on site banner
2. **Conversion rate** on /safety page
3. **Time to purchase** (urgency working?)
4. **Mobile vs desktop** performance
5. **Before/after** Black Friday comparison

---

## 🔄 Easy Removal After Black Friday

### Option 1: Quick (Comment out imports)
```tsx
// In layout.tsx
// import SiteWideBanner from '@/components/safety/SiteWideBanner';
```

### Option 2: Complete (Delete components)
```bash
rm components/safety/BlackFridayBanner.tsx
rm components/safety/SiteWideBanner.tsx
```

Then revert prices back to $59.

---

## 🎁 Bonus: Email/Social Graphics

Need graphics for email or social media?

**Recommended tools:**
- Canva: Pre-made Black Friday templates
- Figma: Custom branded graphics
- Your designer: Send this color palette

**Message examples:**
- "🎉 Black Friday Flash: Forklift Cert now $49 (Save $10!)"
- "Limited Time: Get OSHA Certified for $10 Less"
- "Cyber Weekend Special: $49 Forklift Training"

---

## ✅ Pre-Launch Checklist

- [ ] Created Black Friday Stripe price
- [ ] Updated `lib/training/plans.ts`
- [ ] Added hero banner on /safety
- [ ] Added site-wide banner
- [ ] Updated all $59 → $49
- [ ] Added strikethrough pricing
- [ ] Tested checkout (shows $49)
- [ ] Tested on mobile
- [ ] Set countdown end date
- [ ] Scheduled revert reminder

---

## 💡 Pro Tip: Create Urgency

Beyond visuals, add urgency copy:

- "⏰ Offer ends Cyber Monday"
- "🔥 Join 1,247 operators who saved $10 this week"
- "⚡ Last chance: Black Friday pricing ends tonight"

Place near CTA buttons for maximum impact!

