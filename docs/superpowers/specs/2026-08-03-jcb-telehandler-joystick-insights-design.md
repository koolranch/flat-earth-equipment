# JCB Telehandler Joystick Insights — Soft-Sell Design

**Date:** 2026-08-03  
**URL:** `/insights/jcb-telehandler-joystick-controls`  
**Goal:** Reduce bounce, improve SEO quality, soft-sell live JCB joystick + cab-related parts.

## Decisions
- Approach **B**: rewrite MDX + slug-scoped parts strip (not full hub rebuild).
- Primary merchandising: diagnose/educate first, then soft-sell catalog.
- Do not change: Stripe checkout, training/cert flows, other insights slugs beyond a guarded `isJcbJoystickGuide` branch, URL path, canonical.

## SEO constraints (high-traffic organic)
| Element | Action |
|---|---|
| URL | Untouched |
| Canonical | Untouched |
| Title / H1 | Keep core intent: “JCB Telehandler Joystick Controls…” (tighten subtitle only if needed) |
| Meta description | Replace empty/generic fallback with a real ~155-char description |
| Open Graph | Use same title + new description; no URL change |
| Structured data | Additive FAQPage only (no `aggregateRating`, no fabricated reviews) |
| Redirects | None |
| Twitter tags | Page-level metadata already comes from `generateMetadata`; do not introduce cert-marketing bleed |

## Content rewrite (MDX)
File: `content/insights/jcb-telehandler-joystick-controls.mdx`

Replace brochure/AI-slop with operator-useful structure:

1. **Intro** — what the joystick controls (boom lift/lower, extend/retract, crowd/dump, aux) and why stick feel/response matters for safety.
2. **Control layout** — seat-mounted proportional joystick patterns; multi-mode steering (front / all-wheel / crab) as cab context, not a digression into engines.
3. **Symptoms → checks** — dead stick, intermittent buttons, drift, no boom response; practical checks (connector, harness chafe, hydraulic enable, seat switch) before “buy a stick.”
4. **Fitment caution** — LH vs RH, function count, model/serial confirmation; aftermarket once, confidently; 2-year warranty note where eligible.
5. **Soft-sell mid-article** — `<JcbCabPartsStrip />` (or equivalent) after the symptoms section.
6. **Related cab parts** — short prose linking seats / forks as cab/attachment companions (not a second essay on telematics).
7. **FAQ** — 4–6 questions matching real search intent (how controls work, LH vs RH, aftermarket fit, when to replace vs repair).
8. **Closing CTA** — browse JCB parts / request quote if PN unknown.

**Cut:** Livelink/Road to Zero, dealer “genuine parts” push, engine/transmission digressions, generic compliance padding.

**Tone:** Diagnose/educate first; soft-sell; original wording; no vendor brand names (TVH etc.).

## Parts merchandising
Primary SKUs (live, priced where possible):

| Priority | Slug | Role | Notes |
|---|---|---|---|
| 1 | `332X6237` | Hero Buy Now | Aftermarket LH joystick ~$1639, in stock, has image |
| 2 | `jcb-400-h9799-suspension-seat-vinyl` | Cab companion | Seat assembly, priced, has image |
| 3 | `333C3422` | Attachment companion | 48" fork, priced, has image |
| 4 | `jcb-telehandler-joystick` | Quote path | Quote-only alternate PN — link as “need a different PN?” not Buy Now |
| Optional | seat cushion/cover SKUs | Secondary | Only if strip has room; skip `$0` Buy Now |

Rules:
- Never show `$0` as a price; quote_only → “Request quote.”
- Soft framing: “often replaced when stick is dead/intermittent,” not “this fixes every fault.”
- Confirm fitment by model/serial before purchase (inline caution).
- Prefer SKUs with images for the strip.

## UI component
New: `components/insights/JcbCabPartsStrip.tsx`  
Register in `lib/mdx.ts` `insightMdxComponents` (same pattern as `ChargerSelectorStrip`).

Behavior:
- Static links to `/parts/{slug}` (string-literal props only if used from MDX).
- Eyebrow: “JCB cab parts” (canyon-rust accent, not flood).
- Headline + one supporting sentence.
- 3 product cards: joystick (primary CTA), seat, forks.
- Secondary text link: browse more JCB / quote if PN unknown.
- `not-prose` aside styling consistent with charger strip.

Slug-scoped page branch in `app/insights/[slug]/page.tsx` (optional mirror):
- `isJcbJoystickGuide = slug === 'jcb-telehandler-joystick-controls'`
- Render FAQ JSON-LD when FAQs defined for this slug (prefer MDX `FAQSection` if already used elsewhere; otherwise small FAQ array + existing `StructuredData` pattern).
- Do **not** add charger or cert CTAs on this slug.

## Frontmatter
```yaml
title: 'JCB Telehandler Joystick Controls: Layout, Safety, and Cab Parts'
description: 'How JCB telehandler joystick controls work, what to check when the stick goes dead, and aftermarket joystick, seat, and fork parts that keep the cab productive.'
slug: jcb-telehandler-joystick-controls
date: '2024-07-27'
keywords:
  - jcb telehandler joystick
  - jcb telehandler controls
  - jcb 332/x6237
  - jcb telehandler parts
```

Title may be refined slightly at implementation as long as primary keyword phrase remains.

## Out of scope
- Pricing / inventory changes in Supabase
- New SKU creation
- Rental CTAs as primary
- Spanish locale
- Sitewide insights template redesign
- Changing other high-traffic insight posts

## Success criteria
- Real meta description in view-source (not generic insights fallback).
- Page answers joystick intent in first screenful; bounce-bait fluff removed.
- Visible path: education → `/parts/332X6237` (and seat/fork companions).
- FAQ visible in HTML; FAQPage JSON-LD present if implemented.
- No `$0` prices; no cert Twitter/OG bleed; URL unchanged.
