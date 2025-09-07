# Final Exam Flow

**Start locally**

```bash
npm run dev
# visit http://localhost:3000/training/final and click Start Final Exam
```

**E2E**

```bash
BASE_URL=http://localhost:3000 npm run test:e2e -- tests/e2e/final.exam.flow.spec.ts
```

If the submit route passes, a certificate issue is attempted (best-effort) and your Records page should list the new certificate once the PDF generator finishes.
