// Forklift Certification Training Plans - Stripe Price IDs
export const TRAINING_PLANS = {
  single: {
    id: 'single',
    key: 'single',
    name: 'Single Operator',
    title: 'Single Operator',
    price: 59,
    priceText: '$59',
    priceId: 'price_1RS834HJI548rO8JpJMyGhL3',
    blurb: 'One forklift operator certification',
    features: ['5 Interactive Modules', 'Final Exam', 'QR-Verifiable Certificate', 'OSHA Compliant'],
    seats: 1,
  },
  pack5: {
    id: 'pack5',
    key: 'pack5', 
    name: '5-Pack',
    title: '5-Pack',
    price: 275,
    priceText: '$275',
    priceId: 'price_1RS835HJI548rO8JkMXj7FMQ',
    blurb: 'Five operator certifications',
    features: ['5 Training Seats', 'Trainer Dashboard', 'Progress Tracking', 'Bulk Certificates'],
    seats: 5,
    savings: '$20 per seat',
  },
  pack25: {
    id: 'pack25',
    key: 'pack25',
    name: '25-Pack',
    title: '25-Pack',
    price: 1375,
    priceText: '$1,375',
    priceId: 'price_1RS835HJI548rO8JbvRrMwUv',
    blurb: 'Twenty-five operator certifications',
    features: ['25 Training Seats', 'Trainer Dashboard', 'Priority Support', 'Compliance Reports'],
    seats: 25,
    savings: '$55 per seat',
    popular: true,
  },
  unlimited: {
    id: 'unlimited',
    key: 'unlimited',
    name: 'Facility Unlimited',
    title: 'Facility Unlimited',
    price: 1999,
    priceText: '$1,999',
    priceId: 'price_1RS836HJI548rO8JwlCAzg7m',
    blurb: 'Unlimited operators for your facility',
    features: ['Unlimited Seats', 'Dedicated Support', 'Custom Branding', 'API Access'],
    seats: 999,
    savings: 'Best value',
  },
} as const;

export const PLANS = Object.values(TRAINING_PLANS);

export function getTrainingPlans() {
  return Object.values(TRAINING_PLANS);
}
