# JCB Fault Codes Hub Implementation Plan

> **For agentic workers:** Implement task-by-task. Checkboxes track progress.

**Goal:** Fix and enrich `/brand/jcb/fault-codes` so search works, content is crawlable, and visitors soft-sell into JCB catalog parts.

**Architecture:** Shared API fix for all brands; JCB-specific SSR modules (common codes, likely parts, related guides, fault FAQs) composed into the existing brand fault-codes page when `slug === 'jcb'`.

**Tech Stack:** Next.js App Router, Supabase (`public.svc_fault_codes`, `parts`), existing FaultSearch client component.

---

### Task 1: Fix fault-codes search API
- Modify: `app/api/fault-codes/search/route.ts`
- Query `svc_fault_codes` / `svc_code_retrieval` (public), not `svc.svc_*`

### Task 2: Expand + seed JCB fault CSV
- Modify: `data/faults/jcb.csv`
- Ensure retrieval row in `data/faults/retrieval.csv`
- Run: `pnpm tsx scripts/seed-faults.ts --brand=jcb`

### Task 3: SSR common codes + related guides + likely parts
- Create: `lib/faults/jcbCommonCodes.ts`
- Create: `lib/faults/getBrandFaultParts.ts`
- Create: `components/faults/CommonFaultCodesTable.tsx`
- Create: `components/faults/FaultLikelyParts.tsx`
- Create: `components/faults/RelatedFaultGuides.tsx`

### Task 4: Improve FaultSearch UX
- Modify: `components/faults/FaultSearch.tsx` — brand-aware placeholders; expand causes/checks/fixes

### Task 5: Fault FAQs + wire page
- Create: `content/brand-faqs/jcb-faults.mdx`
- Modify: `lib/brandFaqs.ts` / `BrandFAQBlock` for optional faq key
- Modify: `app/brand/[slug]/fault-codes/page.tsx` (and ES mirror lightly)

### Task 6: Verify
- Hit API for jcb codes
- Confirm page renders common table + parts strip
