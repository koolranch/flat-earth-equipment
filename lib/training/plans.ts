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
    priceId: 'price_1RS835HJI548rO8JkMXj7FMQ',
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
    priceId: 'price_1RS835HJI548rO8JbvRrMwUv',
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

export const PLANS = Object.values(TRAINING_PLANS);

export function getTrainingPlans() {
  return Object.values(TRAINING_PLANS);
}

export function getTrainingPlanByPriceId(priceId: string) {
  return Object.values(TRAINING_PLANS).find((plan) => plan.priceId === priceId);
}
