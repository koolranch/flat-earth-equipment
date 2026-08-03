# JCB Telehandler Joystick Insights Soft-Sell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `/insights/jcb-telehandler-joystick-controls` for operator value + SEO, and soft-sell live JCB joystick/seat/fork SKUs without changing the URL or checkout flows.

**Architecture:** Add a static `JcbCabPartsStrip` MDX component (same pattern as `ChargerSelectorStrip`), register it in `lib/mdx.ts`, replace the MDX body with diagnose-first content + FAQ + strip, and add a slug-scoped FAQPage JSON-LD branch in the insights page template.

**Tech Stack:** Next.js App Router, MDX via `next-mdx-remote/rsc`, existing `FAQSection` / `StructuredData` patterns, Tailwind.

## Global Constraints

- URL `/insights/jcb-telehandler-joystick-controls` untouched; no redirects
- Canonical untouched; structured data only additive (FAQPage); no `aggregateRating`
- Soft-sell parts only; never show `$0` as a price; quote_only → “Request quote”
- Aftermarket once, confidently; no TVH/vendor naming; 2-year warranty on eligible JCB parts
- Do not change Stripe, training/cert, or other insights slugs beyond a guarded `isJcbJoystickGuide` branch
- Canyon-rust accent only (eyebrow / primary CTA), not section flood
- Commit only when the user explicitly asks

---

### Task 1: `JcbCabPartsStrip` component

**Files:**
- Create: `components/insights/JcbCabPartsStrip.tsx`
- Modify: `lib/mdx.ts` (register component)

**Interfaces:**
- Consumes: none
- Produces: `JcbCabPartsStrip` React component with optional string props (`headline`, `body`); hard-coded product cards for three priced SKUs + quote link

- [ ] **Step 1: Create the strip component**

```tsx
/**
 * Soft-sell mid-article CTA into live JCB cab / joystick parts.
 * String-literal props only — next-mdx-remote RSC strips expression props.
 */
const PRODUCTS = [
  {
    slug: '332X6237',
    title: '332/X6237 Left-Hand Joystick',
    blurb: 'Aftermarket LH stick — often replaced when boom response dies or buttons go intermittent.',
    priceLabel: '$1,639',
    cta: 'View joystick',
  },
  {
    slug: 'jcb-400-h9799-suspension-seat-vinyl',
    title: '400/H9799 Suspension Seat',
    blurb: 'Vinyl suspension seat for cab comfort when the stick is in use all day.',
    priceLabel: '$1,400',
    cta: 'View seat',
  },
  {
    slug: '333C3422',
    title: '333/C3422 48″ Fork',
    blurb: 'Aftermarket 48″ fork — common telehandler attachment companion.',
    priceLabel: '$629',
    cta: 'View fork',
  },
] as const

export function JcbCabPartsStrip({
  headline = 'Need the stick — or the cab parts around it?',
  body = 'Confirm LH/RH and function count against your model/serial before ordering. Aftermarket JCB parts ship with a 2-year warranty on eligible SKUs.',
}: {
  headline?: string
  body?: string
}) {
  return (
    <aside className="not-prose my-10 rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-canyon-rust mb-2">
        JCB cab parts
      </p>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{headline}</h3>
      <p className="text-slate-600 mb-6 max-w-2xl">{body}</p>
      <ul className="grid gap-4 sm:grid-cols-3 mb-6">
        {PRODUCTS.map((p) => (
          <li key={p.slug} className="flex flex-col rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900 mb-1">{p.title}</p>
            <p className="text-sm text-slate-600 flex-1 mb-3">{p.blurb}</p>
            <p className="text-sm font-medium text-slate-900 mb-3">{p.priceLabel}</p>
            <a
              href={`/parts/${p.slug}`}
              className="inline-flex items-center justify-center rounded-lg bg-canyon-rust px-4 py-2 text-sm font-semibold text-white hover:bg-canyon-rust/90 transition-colors"
            >
              {p.cta}
            </a>
          </li>
        ))}
      </ul>
      <p className="text-sm text-slate-600">
        Different PN?{' '}
        <a href="/parts/jcb-telehandler-joystick" className="font-medium text-canyon-rust hover:underline">
          Request a joystick quote
        </a>
        {' '}or{' '}
        <a href="/parts?brand=JCB" className="font-medium text-canyon-rust hover:underline">
          browse JCB parts
        </a>
        .
      </p>
    </aside>
  )
}
```

- [ ] **Step 2: Register in `lib/mdx.ts`**

Add import and map entry next to `ChargerSelectorStrip`:

```ts
import { JcbCabPartsStrip } from '@/components/insights/JcbCabPartsStrip';

const insightMdxComponents = {
  // ...existing
  ChargerSelectorStrip,
  JcbCabPartsStrip,
};
```

- [ ] **Step 3: Verify TypeScript accepts the new export**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | head -40` (or project’s usual typecheck).  
Expected: no errors referencing `JcbCabPartsStrip`.

---

### Task 2: Rewrite MDX content + frontmatter

**Files:**
- Modify: `content/insights/jcb-telehandler-joystick-controls.mdx` (full replace)

**Interfaces:**
- Consumes: `JcbCabPartsStrip`, `FAQSection` from MDX component map
- Produces: published article body with meta description, mid-article strip, FAQ JSON

- [ ] **Step 1: Replace frontmatter**

```yaml
---
title: 'JCB Telehandler Joystick Controls: Layout, Safety, and Cab Parts'
description: 'How JCB telehandler joystick controls work, what to check when the stick goes dead, and aftermarket joystick, seat, and fork parts that keep the cab productive.'
slug: jcb-telehandler-joystick-controls
date: '2024-07-27'
keywords:
  - jcb telehandler joystick
  - jcb telehandler controls
  - jcb 332/x6237
  - jcb telehandler parts
---
```

- [ ] **Step 2: Write diagnose-first body**

Structure (H2s as real headings in MDX):

1. Intro — joystick purpose + safety (keep short)
2. `## What the joystick controls` — boom lift/lower, extend/retract, crowd/dump, aux; seat-mounted proportional stick; steering modes as short cab context
3. `## When the stick feels wrong` — symptoms → checks (connector, harness, enable, seat switch) before buying
4. `## LH vs RH and fitment` — function count, model/serial; aftermarket once + 2-year warranty
5. `<JcbCabPartsStrip />`
6. `## Cab companions: seats and forks` — short soft-sell prose with markdown links to `/parts/jcb-400-h9799-suspension-seat-vinyl` and `/parts/333C3422`
7. `<FAQSection faqsJson='[...]' />` with these FAQs (escape apostrophes as `&#39;`):
   - How do JCB telehandler joystick controls work?
   - What should I check before replacing a JCB telehandler joystick?
   - Are left-hand and right-hand joysticks interchangeable?
   - Can I use an aftermarket JCB joystick like 332/X6237?
   - Where can I buy JCB telehandler joystick and cab parts online?
8. Closing paragraph with links to `/parts/332X6237` and `/parts?brand=JCB`

**Cut entirely:** Livelink, Road to Zero, dealer genuine-parts pitch, engine/transmission essays, hose-burst/beacon padding that does not serve joystick intent.

- [ ] **Step 3: Spot-check MDX compiles locally**

Run: `npm run dev` (if not already), open `/insights/jcb-telehandler-joystick-controls`.  
Expected: new H1/title, strip with three CTAs, FAQ accordion, no `$0`, no crash.

---

### Task 3: Slug-scoped FAQPage JSON-LD

**Files:**
- Modify: `app/insights/[slug]/page.tsx`

**Interfaces:**
- Consumes: slug `jcb-telehandler-joystick-controls`
- Produces: additive FAQPage `<script type="application/ld+json">` when `isJcbJoystickGuide`

- [ ] **Step 1: Add flag + FAQ array near `isCertGuide`**

```tsx
const isJcbJoystickGuide = params.slug === 'jcb-telehandler-joystick-controls';

const jcbJoystickFAQs = isJcbJoystickGuide
  ? [
      {
        question: 'How do JCB telehandler joystick controls work?',
        answer:
          'Most JCB telehandlers use a seat-mounted proportional joystick for boom lift/lower, extend/retract, and attachment crowd/dump, with buttons or rollers for auxiliary hydraulics. Steering is usually separate (front-wheel, all-wheel, or crab), so the stick handles the boom and attachment while the wheel handles travel direction.',
      },
      {
        question: 'What should I check before replacing a JCB telehandler joystick?',
        answer:
          'Confirm the machine has hydraulic enable and a closed seat/operator presence switch, then inspect the stick connector and harness for corrosion or chafe. Intermittent buttons often point to the grip or harness before the whole valve stack. Match left-hand vs right-hand and function count to your model and serial before ordering.',
      },
      {
        question: 'Are left-hand and right-hand joysticks interchangeable?',
        answer:
          'Usually not. LH and RH sticks differ in mounting, harness pinout, and function layout. Ordering the wrong side is a common no-fit. Verify the OEM part number and serial break for your machine.',
      },
      {
        question: 'Can I use an aftermarket JCB joystick like 332/X6237?',
        answer:
          'Yes, when the aftermarket unit matches the OEM part number and function count for your serial range. Flat Earth Equipment lists aftermarket JCB controls clearly and backs eligible parts with a 2-year warranty. Always confirm fitment before purchase.',
      },
      {
        question: 'Where can I buy JCB telehandler joystick and cab parts online?',
        answer:
          'Flat Earth Equipment stocks aftermarket JCB joysticks, seats, and forks for telehandler cabs. Start with the 332/X6237 left-hand joystick if that is your PN, or request a quote if you need a different control part number.',
      },
    ]
  : [];
```

- [ ] **Step 2: Emit FAQPage JSON-LD** (mirror cert guide pattern — raw script, not `next/script` `afterInteractive`)

Place near the existing cert FAQ JSON-LD block:

```tsx
{isJcbJoystickGuide && jcbJoystickFAQs.length > 0 && (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: jcbJoystickFAQs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      }),
    }}
  />
)}
```

Keep FAQ answers aligned with the MDX `FAQSection` copy (same five questions).

- [ ] **Step 3: Confirm metadata uses frontmatter description**

No code change required if frontmatter `description` is non-empty — `generateMetadata` already prefers it.  
Verify in view-source: `<meta name="description" content="How JCB telehandler joystick controls...">` (not the generic insights fallback).

---

### Task 4: Verification

**Files:** none new

- [ ] **Step 1: Local visual check**

Open `/insights/jcb-telehandler-joystick-controls`:
- First screen answers joystick intent (not engines/telematics)
- Strip links to `/parts/332X6237`, seat, fork
- Quote link for alternate PN; no `$0` price shown
- FAQ section renders

- [ ] **Step 2: SEO risk checklist**

| Check | Expected |
|---|---|
| URL | `/insights/jcb-telehandler-joystick-controls` |
| Canonical | unchanged |
| Title | includes “JCB Telehandler Joystick Controls” |
| Meta description | new ~155 char string |
| FAQPage JSON-LD | present, 5 questions |
| No aggregateRating | absent |
| No redirects | none |

- [ ] **Step 3: Lint touched files**

Run IDE/linter on:
- `components/insights/JcbCabPartsStrip.tsx`
- `lib/mdx.ts`
- `content/insights/jcb-telehandler-joystick-controls.mdx`
- `app/insights/[slug]/page.tsx`

Fix any new errors introduced by this work.

---

## Spec coverage

| Spec requirement | Task |
|---|---|
| MDX rewrite, cut fluff | Task 2 |
| Meta description | Task 2 frontmatter (+ existing generateMetadata) |
| `JcbCabPartsStrip` + MDX register | Task 1 |
| SKU priority 332X6237 / seat / fork / quote | Task 1 + 2 |
| FAQ + FAQPage JSON-LD | Task 2 + 3 |
| URL/canonical untouched | Global + Task 4 |
| No $0 prices | Task 1 |
| Verification | Task 4 |
