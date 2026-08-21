/**
 * Idempotent seeder for the Crew/Facility subscription catalog (Phase 1 of the
 * employer SaaS rollout). Safe to re-run: products are matched by
 * metadata.plan_id and prices by (product, unit_amount, interval).
 *
 * Run: npx tsx scripts/create-crew-subscription-prices.ts
 * Requires STRIPE_SECRET_KEY (e.g. via `vercel env pull`).
 */
import Stripe from 'stripe';
import dotenv from 'dotenv-flow';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const FACILITY_PRODUCT_ID = 'prod_UAoDUjvEIynuAg'; // Forklift Certification – Facility Unlimited Annual

type PriceSpec = {
  envVar: string;
  planId: string;
  unitAmount: number;
  interval?: 'month' | 'year';
  metadata: Record<string, string>;
};

async function findProductByPlanId(planId: string): Promise<Stripe.Product | null> {
  const result = await stripe.products.search({
    query: `metadata['plan_id']:'${planId}' AND active:'true'`,
    limit: 1,
  });
  return result.data[0] ?? null;
}

async function ensureProduct(
  planId: string,
  params: Stripe.ProductCreateParams
): Promise<Stripe.Product> {
  const existing = await findProductByPlanId(planId);
  if (existing) {
    console.log(`= product exists for plan_id=${planId}: ${existing.id}`);
    return existing;
  }
  const created = await stripe.products.create(params);
  console.log(`+ created product ${created.id} (${params.name})`);
  return created;
}

async function ensurePrice(productId: string, spec: PriceSpec): Promise<Stripe.Price> {
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  const match = prices.data.find(
    (p) =>
      p.unit_amount === spec.unitAmount &&
      (spec.interval ? p.recurring?.interval === spec.interval : !p.recurring)
  );
  if (match) {
    console.log(`= price exists for ${spec.planId}: ${match.id}`);
    return match;
  }
  const created = await stripe.prices.create({
    product: productId,
    currency: 'usd',
    unit_amount: spec.unitAmount,
    ...(spec.interval ? { recurring: { interval: spec.interval } } : {}),
    metadata: spec.metadata,
  });
  console.log(`+ created price ${created.id} for ${spec.planId}`);
  return created;
}

async function main() {
  const crewProduct = await ensureProduct('crew', {
    name: 'Forklift Certification – Crew',
    description:
      'Manager dashboard with 10 active training seats for one crew. Invite operators, track progress, run practical evaluations, and export audit-ready records.',
    metadata: {
      course_slug: 'forklift',
      plan_id: 'crew',
      seat_cap: '10',
      billing_model: 'subscription',
    },
  });

  const extraSeatProduct = await ensureProduct('extra_seat', {
    name: 'Forklift Certification – Additional Seat',
    description: 'One additional training seat for an active Crew subscription.',
    metadata: { course_slug: 'forklift', plan_id: 'extra_seat' },
  });

  const crewMonthly = await ensurePrice(crewProduct.id, {
    envVar: 'NEXT_PUBLIC_TRAINING_CREW_MONTHLY_PRICE_ID',
    planId: 'crew_monthly',
    unitAmount: 9900,
    interval: 'month',
    metadata: { course_slug: 'forklift', plan_id: 'crew_monthly', billing_model: 'monthly' },
  });

  const crewAnnual = await ensurePrice(crewProduct.id, {
    envVar: 'NEXT_PUBLIC_TRAINING_CREW_ANNUAL_PRICE_ID',
    planId: 'crew_annual',
    unitAmount: 99000,
    interval: 'year',
    metadata: { course_slug: 'forklift', plan_id: 'crew_annual', billing_model: 'annual' },
  });

  const facilityMonthly = await ensurePrice(FACILITY_PRODUCT_ID, {
    envVar: 'NEXT_PUBLIC_TRAINING_FACILITY_MONTHLY_PRICE_ID',
    planId: 'facility_monthly',
    unitAmount: 19900,
    interval: 'month',
    metadata: { course_slug: 'forklift', plan_id: 'facility_monthly', billing_model: 'monthly' },
  });

  const extraSeat = await ensurePrice(extraSeatProduct.id, {
    envVar: 'TRAINING_EXTRA_SEAT_PRICE_ID',
    planId: 'extra_seat',
    unitAmount: 2900,
    metadata: { course_slug: 'forklift', plan_id: 'extra_seat' },
  });

  console.log('\nEnv vars to set:');
  console.log(`NEXT_PUBLIC_TRAINING_CREW_MONTHLY_PRICE_ID=${crewMonthly.id}`);
  console.log(`NEXT_PUBLIC_TRAINING_CREW_ANNUAL_PRICE_ID=${crewAnnual.id}`);
  console.log(`NEXT_PUBLIC_TRAINING_FACILITY_MONTHLY_PRICE_ID=${facilityMonthly.id}`);
  console.log(`TRAINING_EXTRA_SEAT_PRICE_ID=${extraSeat.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
