import type Stripe from 'stripe';

export type PartsLineItem = {
  sku: string;
  name: string;
  quantity: number;
  isShipping?: boolean;
};

export type PartsSaleDetails = {
  sessionId: string;
  totalCents: number;
  lineItems: PartsLineItem[];
  shippingCity: string;
  shippingState: string;
};

export type TrainingSaleDetails = {
  sessionId: string;
  totalCents: number;
  planLabel: string;
  customerEmail: string;
};

export type NotifyCheckoutSaleInput =
  | ({ kind: 'parts' } & PartsSaleDetails)
  | ({ kind: 'training' } & TrainingSaleDetails);

const TELEGRAM_TIMEOUT_MS = 3000;

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim() && process.env.TELEGRAM_CHAT_ID?.trim());
}

export function formatPartsSaleMessage(details: PartsSaleDetails): string {
  const productLines = details.lineItems
    .filter((item) => !item.isShipping)
    .map((item) => {
      const label = item.sku.trim() || item.name.trim() || 'Part';
      const qtySuffix = item.quantity !== 1 ? ` (qty ${item.quantity})` : '';
      return `PN: ${label}${qtySuffix}`;
    });

  const lines = [
    '🛒 Parts sale',
    ...(productLines.length > 0 ? productLines : ['PN: (see Stripe session)']),
    `Total: ${formatUsd(details.totalCents)}`,
  ];

  const city = details.shippingCity.trim();
  const state = details.shippingState.trim();
  if (city) {
    lines.push(`Ship to: ${state ? `${city}, ${state}` : city}`);
  }

  lines.push(`Session: ${details.sessionId}`);
  return lines.join('\n');
}

export function formatTrainingSaleMessage(details: TrainingSaleDetails): string {
  const lines = [
    '📚 Training sale',
    `Plan: ${details.planLabel.trim() || 'Training'}`,
    `Total: ${formatUsd(details.totalCents)}`,
  ];
  const email = details.customerEmail.trim();
  if (email) {
    lines.push(`Customer: ${email}`);
  }
  lines.push(`Session: ${details.sessionId}`);
  return lines.join('\n');
}

function looksLikeShippingLine(name: string, sku: string): boolean {
  if (sku.trim()) return false;
  return /\b(shipping|freight|handling)\b/i.test(name);
}

function trainingPlanLabel(metadata: Stripe.Metadata | null | undefined, amountCents: number): string {
  const quantity = parseInt(metadata?.quantity || '1', 10);
  const course = metadata?.course_slug || metadata?.course || 'Forklift certification';
  const seats = Number.isFinite(quantity) && quantity > 1 ? ` ×${quantity}` : quantity === 1 ? ' (single)' : '';
  if (metadata?.checkout_mode === 'subscription' || metadata?.plan === 'annual') {
    return `${course} annual${seats}`;
  }
  if (quantity >= 25) return `Team 25-Pack${seats}`;
  if (quantity >= 5) return `Team 5-Pack${seats}`;
  void amountCents;
  return `${course}${seats}`;
}

async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
    signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.warn(`[telegram] sendMessage failed: ${res.status} ${body.slice(0, 200)}`);
  }
}

/**
 * Send a Telegram sale alert. Never throws. No-ops when env is unset.
 * Safe to call from Stripe webhooks — failures cannot affect fulfillment.
 */
export async function notifyCheckoutSale(input: NotifyCheckoutSaleInput): Promise<void> {
  try {
    if (!isTelegramConfigured()) return;

    const text =
      input.kind === 'parts'
        ? formatPartsSaleMessage(input)
        : formatTrainingSaleMessage(input);

    await sendTelegramMessage(text);
  } catch (err) {
    console.warn('[telegram] notifyCheckoutSale failed (non-blocking):', err);
  }
}

const STRIPE_RETRIEVE_TIMEOUT_MS = 5000;

async function retrieveSessionForNotify(
  stripe: Stripe,
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  return Promise.race([
    stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['shipping_details', 'line_items', 'line_items.data.price.product'],
    }),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('telegram stripe retrieve timeout')), STRIPE_RETRIEVE_TIMEOUT_MS);
    }),
  ]);
}

/**
 * Expand the Checkout Session and notify. Never throws.
 * Performs its own Stripe retrieve so webhook fulfillment paths stay untouched.
 */
export async function notifyFromCheckoutSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
  options?: { forceKind?: 'parts' | 'training' }
): Promise<void> {
  try {
    if (!isTelegramConfigured()) return;

    const isTraining =
      options?.forceKind === 'training' ||
      (options?.forceKind !== 'parts' && Boolean(session.metadata?.course_slug));

    const full = (await retrieveSessionForNotify(stripe, session.id)) as Stripe.Checkout.Session & {
      shipping_details?: {
        address?: {
          city?: string | null;
          state?: string | null;
        } | null;
      } | null;
    };

    const amountTotalCents = full.amount_total ?? session.amount_total ?? 0;
    const email =
      full.customer_details?.email ||
      session.customer_details?.email ||
      full.customer_email ||
      '';

    if (isTraining) {
      await notifyCheckoutSale({
        kind: 'training',
        sessionId: full.id,
        totalCents: amountTotalCents,
        planLabel: trainingPlanLabel(full.metadata || session.metadata, amountTotalCents),
        customerEmail: email,
      });
      return;
    }

    const lineItems: PartsLineItem[] = [];
    const data = full.line_items?.data || [];
    for (const item of data) {
      const product = item.price?.product;
      const productObj =
        product && typeof product !== 'string' && !('deleted' in product && product.deleted)
          ? product
          : null;
      const name = productObj?.name || item.description || 'Item';
      const sku =
        productObj?.metadata?.sku ||
        productObj?.metadata?.part_number ||
        productObj?.metadata?.oem_part_number ||
        '';
      lineItems.push({
        sku,
        name,
        quantity: item.quantity || 1,
        isShipping: looksLikeShippingLine(name, sku),
      });
    }

    const address = full.shipping_details?.address;
    await notifyCheckoutSale({
      kind: 'parts',
      sessionId: full.id,
      totalCents: amountTotalCents,
      lineItems,
      shippingCity: address?.city || '',
      shippingState: address?.state || '',
    });
  } catch (err) {
    console.warn('[telegram] notifyFromCheckoutSession failed (non-blocking):', err);
  }
}
