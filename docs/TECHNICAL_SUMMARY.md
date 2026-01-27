# Flat Earth Equipment (FEE) - Technical Summary

## Overview

Flat Earth Equipment is a full-stack e-commerce and training platform for industrial equipment, primarily serving the Western United States. The platform combines equipment parts sales, rental services, and OSHA-compliant forklift certification training.

**Production URL:** https://www.flatearthequipment.com

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14.1.0 (App Router) |
| **Language** | TypeScript 5.8 |
| **Runtime** | Node.js (ESM modules) |
| **Database** | PostgreSQL via Supabase |
| **ORM** | Prisma 5.9 + Supabase client |
| **Styling** | Tailwind CSS 3.4 + shadcn/ui |
| **Authentication** | Supabase Auth + NextAuth |
| **Payments** | Stripe |
| **Email** | Resend + SendGrid |
| **Hosting** | Vercel |
| **Monitoring** | Sentry |
| **Analytics** | Vercel Analytics |
| **Video** | Mux |

---

## Project Structure

```
flat-earth-equipment/
├── app/                    # Next.js App Router pages (576 files)
│   ├── api/               # 199 API route handlers
│   ├── training/          # Training hub and modules
│   ├── brand/             # Brand-specific hubs
│   ├── parts/             # Parts catalog
│   ├── rental/            # Equipment rentals
│   └── [brand]-serial-number-lookup/  # Serial lookups (20+ brands)
├── components/            # React components (305 files)
│   ├── training/          # Training UI components
│   ├── demos/             # Interactive training demos
│   ├── brand/             # Brand hub components
│   └── ui/                # shadcn/ui components
├── lib/                   # Server/client utilities (137 files)
│   ├── supabase/          # Database clients
│   ├── training/          # Training business logic
│   ├── quiz/              # Quiz system
│   ├── cert/              # Certificate generation
│   └── email/             # Email templates
├── content/               # MDX content and JSON data (389 files)
│   ├── modules/           # Training module content
│   ├── flashcards/        # Study flashcards (en/es)
│   ├── quiz/              # Quiz questions (en/es)
│   ├── brand-guides/      # Brand-specific guides
│   └── insights/          # Blog/SEO content
├── supabase/
│   └── migrations/        # Database migrations (60+ files)
├── scripts/               # Build/maintenance scripts (2570 files)
└── tests/                 # Playwright E2E tests
```

---

## Core Features

### 1. Training & Certification System

- **OSHA-compliant forklift training** (29 CFR 1910.178)
- **5 interactive modules**: PPE/Controls, Inspection, Operating Procedures, Load Handling, Advanced Operations
- **Interactive demos**: Hotspot exercises, shutdown sequences, stability playgrounds
- **Quiz system**: Per-module quizzes with adaptive difficulty
- **Final exam**: Timed exam with randomized question pools
- **Certificates**: PDF generation with QR verification codes
- **Multi-language**: English and Spanish (i18n)
- **Practical evaluation**: Supervisor sign-off workflow

### 2. Multi-Tenant Organization System

- Organizations with seat-based licensing
- Role hierarchy: Owner → Trainer → Learner
- Seat invitations and assignment
- Trainer dashboard with roster management
- CSV/PDF export for compliance records

### 3. E-Commerce

- **Parts catalog** with Stripe integration
- **Equipment rentals** with quote system
- **Charger recommendation engine**
- **Shopping cart** and checkout flow

### 4. Brand Hubs

- 25+ equipment brand pages (Toyota, Hyster, Yale, JCB, etc.)
- **Serial number lookup tools** with database-backed decoders
- **Fault code databases** with searchable interfaces
- **Brand-specific FAQs and guides**

### 5. SEO & Content

- MDX-powered blog/insights
- Dynamic sitemap generation
- Structured data (JSON-LD)
- Extensive 301 redirect mapping for backlink recovery
- IndexNow integration

---

## Database Schema (Key Tables)

| Table | Purpose |
|-------|---------|
| `enrollments` | Training course enrollments with progress tracking |
| `certificates` | Issued certificates with verification codes |
| `orgs` | Multi-tenant organizations |
| `org_members` | User-organization membership with roles |
| `org_seats` | Seat allocation per course |
| `invitations` | Pending seat invitations |
| `quiz_attempts` | Quiz/exam attempt records |
| `eval_submissions` | Practical evaluation submissions |
| `parts` | Product catalog |
| `rental_equipment` | Equipment rental inventory |
| `audit_events` | Activity logging |

**Security:** Row Level Security (RLS) policies enforce tenant isolation.

---

## API Routes (Key Endpoints)

| Category | Endpoints |
|----------|-----------|
| **Training** | `/api/training/progress`, `/api/exam/*`, `/api/quiz/*` |
| **Certificates** | `/api/certificates/issue`, `/api/certificates/pdf/[id]` |
| **Trainer** | `/api/trainer/roster`, `/api/trainer/invites`, `/api/trainer/export` |
| **Verification** | `/api/verify/[code]` |
| **Commerce** | `/api/checkout`, `/api/quote`, `/api/webhooks/stripe` |
| **Serial Lookups** | `/api/[brand]-lookup` (20+ brands) |

---

## Testing & QA

| Tool | Purpose |
|------|---------|
| **Playwright** | E2E testing |
| **pa11y-ci** | Accessibility audits |
| **Lighthouse** | Performance monitoring |
| **axe-core** | Accessibility testing |
| **Linkinator** | Broken link detection |

**Key test commands:**

```bash
npm run test:e2e      # Full E2E suite
npm run qa:a11y       # Accessibility audit
npm run qa:perf       # Lighthouse performance
npm run qa:cert       # Certificate flow tests
```

---

## Environment Variables (Required)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Email
RESEND_API_KEY
SENDGRID_API_KEY

# Monitoring
SENTRY_DSN
NEXT_PUBLIC_SENTRY_DSN

# Auth
NEXTAUTH_SECRET
NEXTAUTH_URL
```

---

## Brand Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `accent` | `#F76511` | Primary CTA buttons |
| `ink` | `#0F172A` | Body text |
| `canyon-rust` | `#C45A38` | Secondary accent |
| `safety` | `#F76511` | Training badges |

---

## Key Development Commands

```bash
npm run dev            # Start development server
npm run build          # Production build
npm run lint           # ESLint
npm run test:e2e       # Playwright tests
npm run audit:db       # Supabase schema audit
npm run seed:quiz      # Import quiz content
npm run qa:all         # Full QA suite
```

---

## Deployment

- **Platform:** Vercel
- **CI/CD:** GitHub Actions (`.github/workflows/`)
- **Preview deployments** on PR branches
- **Environment-specific builds** via `generateBuildId` cache busting

---

## Key Integration Points

1. **Supabase** - Auth, Database, Storage (brand logos, certificates)
2. **Stripe** - Checkout, webhook processing, subscription management
3. **Mux** - Video hosting and HLS streaming
4. **Resend/SendGrid** - Transactional emails
5. **Sentry** - Error tracking and performance monitoring
6. **Vercel** - Hosting, Edge functions, Analytics

---

## Architecture Notes for AI Agents

When working with this codebase, prioritize understanding:

1. **Training module system** (`lib/training/`, `app/training/`, `content/modules/`)
2. **Multi-tenant organization logic** (`lib/orgs/`, RLS policies in `supabase/migrations/`)
3. **Supabase RLS policies** - All database access is tenant-scoped
4. **i18n system** - Content exists in both `en` and `es` variants
5. **Certificate verification** - QR codes link to `/verify/[code]` endpoints

### Common Patterns

- Server components fetch data directly from Supabase
- Client components use `createClient()` from `lib/supabase/client.ts`
- API routes use `createServerClient()` from `lib/supabase/server.ts`
- Service role operations use `lib/supabase/service.server.ts`
- Progress tracking uses `resume_state` JSONB column on `enrollments`
