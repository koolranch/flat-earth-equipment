// Forklift Certification Training Plans - Stripe Price IDs
const facilityUnlimitedAnnualPriceId =
  process.env.NEXT_PUBLIC_TRAINING_FACILITY_UNLIMITED_ANNUAL_PRICE_ID || '';

export const TRAINING_PLANS = {
  single: {
    id: 'single',
    key: 'single',
    name: 'Single Operator',
    title: 'Single Operator',
    price: 49,
    priceText: '$49',
    priceId: 'price_1SToXBHJI548rO8JZnnTwKER',
    blurb: 'Perfect for job seekers and individual operators',
    features: ['Complete in under 30 minutes', 'Instant certificate download', 'Valid for 3 years', 'Accepted by all employers', 'Unlimited exam retakes'],
    seats: 1,
    popular: true,
    callout: undefined,
    checkoutMode: 'payment',
    billingLabel: undefined,
  },
  pack5: {
    id: 'pack5',
    key: 'five',
    name: 'Team 5-Pack',
    title: 'Team 5-Pack',
    price: 225,
    priceText: '$225',
    priceId: 'price_1Tc6IoHJI548rO8JjjEeZCDf',
    blurb: 'Best for small crews that need 5 certifications fast.',
    features: ['5 Training Seats', 'Trainer Dashboard', 'Progress Tracking', 'Bulk Certificates'],
    seats: 5,
    callout: 'Save $20 vs buying 5 singles',
    popular: false,
    checkoutMode: 'payment',
    billingLabel: undefined,
  },
  pack25: {
    id: 'pack25',
    key: 'twenty5',
    name: 'Team 25-Pack',
    title: 'Team 25-Pack',
    price: 999,
    priceText: '$999',
    priceId: 'price_1Tc6IoHJI548rO8JkLXU9g6b',
    blurb: 'Best for departments standardizing training across shifts.',
    features: ['25 Training Seats', 'Trainer Dashboard', 'Priority Support', 'Compliance Reports'],
    seats: 25,
    callout: 'Save $226 vs buying 25 singles',
    popular: false,
    checkoutMode: 'payment',
    billingLabel: undefined,
  },
  unlimited: {
    id: 'unlimited',
    key: 'unlim',
    name: 'Facility Unlimited Annual',
    title: 'Facility Unlimited Annual',
    price: 1999,
    priceText: '$1,999',
    priceId: facilityUnlimitedAnnualPriceId,
    blurb: 'Unlimited operators for one facility, billed annually.',
    features: ['Unlimited Seats for One Facility', 'Seat Assignment Dashboard', 'Progress Tracking', 'Certificate Verification', 'Renewal Reminders'],
    seats: 999,
    callout: 'Best for ongoing hiring, turnover, and annual retraining.',
    popular: false,
    checkoutMode: 'subscription',
    billingLabel: '/year',
  },
} as const;

/**
 * Employer subscription plans (GetForkliftCertified rollout). Kept separate
 * from TRAINING_PLANS so the FEE /safety PricingStrip (which renders PLANS
 * positionally) is unaffected. Checkout resolves these via
 * getTrainingPlanByPriceId like any other plan.
 */
export const SUBSCRIPTION_PLANS = {
  crewMonthly: {
    id: 'crew_monthly',
    key: 'crew_monthly',
    name: 'Crew',
    title: 'Crew (Monthly)',
    price: 99,
    priceText: '$99',
    priceId: process.env.NEXT_PUBLIC_TRAINING_CREW_MONTHLY_PRICE_ID || '',
    blurb: 'Manager dashboard with 10 active training seats for one crew.',
    features: ['10 Training Seats', 'Manager Dashboard', 'Practical Evaluations', 'Compliance Exports', 'Add extra seats for $29'],
    seats: 10,
    popular: false,
    callout: undefined,
    checkoutMode: 'subscription',
    billingLabel: '/month',
    trialDays: 7,
  },
  crewAnnual: {
    id: 'crew_annual',
    key: 'crew_annual',
    name: 'Crew Annual',
    title: 'Crew (Annual)',
    price: 990,
    priceText: '$990',
    priceId: process.env.NEXT_PUBLIC_TRAINING_CREW_ANNUAL_PRICE_ID || '',
    blurb: 'Crew plan billed annually — two months free.',
    features: ['10 Training Seats', 'Manager Dashboard', 'Practical Evaluations', 'Compliance Exports', 'Add extra seats for $29'],
    seats: 10,
    popular: false,
    callout: 'Save $198 vs monthly',
    checkoutMode: 'subscription',
    billingLabel: '/year',
    trialDays: 7,
  },
  facilityMonthly: {
    id: 'facility_monthly',
    key: 'facility_monthly',
    name: 'Facility',
    title: 'Facility (Monthly)',
    price: 199,
    priceText: '$199',
    priceId: process.env.NEXT_PUBLIC_TRAINING_FACILITY_MONTHLY_PRICE_ID || '',
    blurb: 'Unlimited operators for one facility, billed monthly.',
    features: ['Unlimited Seats for One Facility', 'Seat Assignment Dashboard', 'Progress Tracking', 'Certificate Verification', 'Renewal Reminders'],
    seats: 999,
    popular: false,
    callout: undefined,
    checkoutMode: 'subscription',
    billingLabel: '/month',
    trialDays: 7,
  },
} as const;

export const PLANS = Object.values(TRAINING_PLANS);

export function getTrainingPlans() {
  return Object.values(TRAINING_PLANS);
}

type AnyPlan =
  | (typeof TRAINING_PLANS)[keyof typeof TRAINING_PLANS]
  | (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS];

export function getTrainingPlanByPriceId(priceId: string): AnyPlan | undefined {
  return [...Object.values(TRAINING_PLANS), ...Object.values(SUBSCRIPTION_PLANS)].find(
    (plan) => plan.priceId && plan.priceId === priceId
  );
}

/** Seats >= this threshold are treated as an unlimited (facility-wide) plan. */
export const UNLIMITED_SEAT_THRESHOLD = 999;

export function planIsUnlimited(plan: Pick<AnyPlan, 'seats'>) {
  return plan.seats >= UNLIMITED_SEAT_THRESHOLD;
}

export function planTrialDays(plan: AnyPlan): number {
  return 'trialDays' in plan && typeof plan.trialDays === 'number' ? plan.trialDays : 0;
}
