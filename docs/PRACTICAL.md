# Practical Evaluation

**Start locally**

```bash
npm run dev
# visit /trainer/practical/new, paste trainee user id (UUID), start
# this navigates to /practical/eval/[id] for the evaluation interface
```

**Runner**
- Toggle checklist items, add notes, save.
- Capture trainee + trainer signatures, click the Save buttons.
- Click "Mark Passed" (or Failed) to complete and go to Records.

Signatures are stored in the `eval-signatures` bucket at `/<attemptId>/{trainee|trainer}.png`.
