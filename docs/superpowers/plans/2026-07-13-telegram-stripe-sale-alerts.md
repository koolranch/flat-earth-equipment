# Telegram Stripe Sale Alerts Implementation Plan

> **For agentic workers:** Implement task-by-task. Safety: Telegram must never affect Stripe webhook success or fulfillment.

**Goal:** Private Telegram DM on each Stripe `checkout.session.completed` with PN/price/city (parts) or plan/price/email (training).

**Architecture:** Pure message builders + never-throwing `notifyCheckoutSale` helper. Called from existing Stripe webhooks inside try/catch after fulfillment paths. Missing env = no-op.

**Tech Stack:** Next.js API routes, Stripe session expand, Telegram Bot API `sendMessage`, node:assert tests.

---

### Task 1: Helper + unit tests
- Create: `lib/telegram/notifySale.ts`
- Create: `lib/telegram/notifySale.test.ts`
- Pure formatters; `notifyCheckoutSale` no-ops without env; never throws; 3s timeout on fetch.

### Task 2: Wire main Stripe webhook (guarded)
- Modify: `app/api/webhooks/stripe/route.ts`
- After checkout.session.completed handling (before subscription events), try/catch await notify. Do not change return statuses.

### Task 3: Wire training Stripe webhook (guarded)
- Modify: `app/api/webhooks/stripe-training/route.ts`
- Same try/catch before success return on checkout.session.completed.

### Task 4: Verify
- Run `npx tsx lib/telegram/notifySale.test.ts`
- Confirm no control-flow changes to fulfillment branches.
