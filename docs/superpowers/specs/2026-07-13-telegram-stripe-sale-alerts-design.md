# Telegram Stripe sale alerts

**Date:** 2026-07-13  
**Status:** Implemented — awaiting deploy + Vercel env  
**Scope:** Private Telegram DM alerts for all Stripe `checkout.session.completed` sales (parts + training)

## Goal

Notify Chris in a private Telegram chat when a Stripe checkout completes, with:

- **Parts:** part number(s), purchase total, shipping city (and state when present)
- **Training:** plan/course label, purchase total, customer email (no shipping)

## Non-goals

- No Telegram bot commands, menus, or two-way chat UX
- No group chats
- No changes to Stripe fulfillment, enrollment, certificates, emails, or order DB writes
- No public API that accepts Telegram callbacks
- No storing the bot token in git

## Approach

Hook the existing Stripe webhook handlers (Approach A):

1. `app/api/webhooks/stripe/route.ts` — parts + training flows already handled here
2. `app/api/webhooks/stripe-training/route.ts` — training-specific path

Add a small helper `lib/telegram/notifySale.ts` that POSTs to Telegram Bot API `sendMessage`. Call it from both handlers after the sale is identified, inside a guarded fire-and-forget path.

## Safety requirements (must not break live revenue)

These are hard constraints:

1. **Never fail the webhook because of Telegram.** Helper errors are caught and logged only. Webhook still returns success for Stripe as today.
2. **Never block fulfillment.** Telegram send is fire-and-forget (`void notify…().catch(...)`) or fully wrapped try/catch. Do not `await` Telegram before critical DB/email/enrollment work completes; prefer calling after core work, still non-throwing.
3. **Missing config = no-op.** If `TELEGRAM_BOT_TOKEN` or `TELEGRAM_CHAT_ID` is unset, helper returns immediately. Safe to deploy before env vars are set.
4. **Secrets only in Vercel env.** Token must never appear in source, logs, or commit history. The token pasted in chat must be **revoked/regenerated** in BotFather before production use.
5. **Do not change Stripe event handling.** No new early returns, no altered HTTP status codes, no new Stripe API side effects for alerts.
6. **Timeouts.** Telegram fetch uses a short timeout (e.g. `AbortSignal.timeout(3000)`) so a hung Telegram API cannot keep the serverless invocation alive.
7. **Duplicate alerts OK for v1.** Stripe may retry webhooks; occasional duplicate Telegram messages are acceptable. No new DB table or Redis lock in v1.
8. **Additive only.** Follow existing non-blocking email/notification patterns already in the stripe webhook.

## Message format

Plain text (no Markdown parsing required — avoids injection from product names):

**Parts**

```
🛒 Parts sale
PN: 332X6237 (qty 1)
Total: $249.00
Ship to: Denver, CO
Session: cs_live_…
```

- Prefer product SKU / `oem_part_number` / metadata sku when present; fall back to product name.
- Skip freight-only line items when identifiable; still show session total.
- City/state from `shipping_details.address`; if missing, omit the ship line (digital/no-ship edge cases).

**Training**

```
📚 Training sale
Plan: Forklift certification (single / team pack as available from metadata)
Total: $49.00
Customer: buyer@example.com
Session: cs_live_…
```

## Config

| Env var | Purpose |
|---|---|
| `TELEGRAM_BOT_TOKEN` | BotFather token (regenerated; never commit) |
| `TELEGRAM_CHAT_ID` | Numeric private chat id for Chris |

### One-time chat id setup

1. Regenerate token in BotFather (old token was exposed in chat).
2. Message `@orderalert_bot` (or whatever the bot username is) once from Chris’s Telegram account.
3. Call `https://api.telegram.org/bot<TOKEN>/getUpdates` and read `message.chat.id`.
4. Set both env vars on the Vercel production project; redeploy or wait for env propagation.

## Files to touch

| File | Change |
|---|---|
| `lib/telegram/notifySale.ts` | New helper: build message + sendMessage |
| `lib/telegram/notifySale.test.ts` | Unit tests for message formatting + no-op without env |
| `app/api/webhooks/stripe/route.ts` | Fire-and-forget notify after parts/training handling (guarded) |
| `app/api/webhooks/stripe-training/route.ts` | Same for training webhook |

No migration. No `vercel.json` change. Firewall/geo rules unrelated.

## Regression / do-not-change list

- Stripe webhook signature verification
- Enrollment insert / quiz / cert issue paths
- Parts `customer_orders` / `order_line_items` writes
- Order confirmation and enrollment emails
- Checkout session creation (`/api/checkout`)

## Test plan

1. Unit: message builders for parts (PN + city) and training (plan + email); missing env → no fetch.
2. Local/manual: set env, simulate helper with a fake session payload; confirm DM arrives.
3. Staging or live low-risk: one small test checkout if available; confirm fulfillment still succeeds if Telegram token is wrong (should log warn, webhook 200).
4. Confirm wrong/missing token does not change webhook response.

## Rollout

1. User regenerates BotFather token; obtains chat id; sets Vercel env.
2. Ship code (feature no-ops until env present).
3. Verify one real parts sale and one training sale alert.
4. If noisy duplicates from Stripe retries become a problem, add session-id dedupe later.
