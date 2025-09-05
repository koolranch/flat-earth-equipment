# Content Readiness — Forklift Operator (Flat Earth Safety)

## Must-have (Blockers)
- [ ] Modules 1–5: learning goals stated; copy reviewed; screens readable on mobile (WCAG 2.2 AA)
- [ ] Micro-quests: Pre-Op, 8-Point, Stability, Hazard Hunt, Shutdown — load and complete in <3 min each
- [ ] Quiz pools: 3–7 items per module; instant feedback; review incorrect mode
- [ ] Final exam: blueprint active (count + difficulty mix); pass score ≥ 80%; unlimited attempts; best score stored
- [ ] Certificate: PDF writes to `certificates` bucket; `/records` shows `pdf_url`; verify code resolves
- [ ] Employer evaluation: form usable on mobile; signature capture; stored in `employer_evaluations`

## Nice-to-have (Non-blockers)
- [ ] Spanish labels present in public UI; lesson content falls back gracefully
- [ ] Keyboard navigation through interactive panels; visible focus states
- [ ] Study cards present for each module (min 6–10)

## QA Swings
- [ ] `npm run go:preflight` PASS
- [ ] `npm run qa:ga` PASS (GA off)
- [ ] `npm run verify:stripe` PASS (live or test)
