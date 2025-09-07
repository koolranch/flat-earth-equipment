# QA — Training flow

## Commands
- Local dev: `npm run dev`
- E2E (dev server): `BASE_URL=http://localhost:3000 npm run test:e2e`
- One-shot build + QA: `npm run build-and-qa`

## What's covered
- Module 1: PPE + Controls unlock, quiz negative→positive path, local progress persistence
- Module 4 & 5: Quiz unlock visibility
- Final gate: Locked until 1–5 completed (local fallback)

If a test fails due to assets, verify `/public/img/training/**` and `/public/anim/training/**` exist.
